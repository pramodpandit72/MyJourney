import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../../app.js';
import User from '../../models/User.js';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

describe('Privacy Settings & State Admin Isolation Tests', () => {
  let superAdminToken = '';
  let punjabAdminToken = '';
  let haryanaAdminToken = '';

  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI);
    }

    // Login as Super Admin
    const superRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'nwdpramod12305901@gmail.com', password: '@123Prazapati' });
    superAdminToken = superRes.body.data.token;

    // Login as Punjab State Admin
    const punjabRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'admin.punjab@myjourney.in', password: 'Password@123' });
    punjabAdminToken = punjabRes.body.data.token;

    // Login as Haryana State Admin
    const haryanaRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'admin.haryana@myjourney.in', password: 'Password@123' });
    haryanaAdminToken = haryanaRes.body.data.token;
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  it('Super Admin can see administrators across all states', async () => {
    const res = await request(app)
      .get('/api/v1/admin/state-admins')
      .set('Authorization', `Bearer ${superAdminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.isSuperAdmin).toBe(true);
    const states = new Set(res.body.data.admins.map((a) => a.assignedState));
    expect(states.size).toBeGreaterThan(1);
    expect(states.has('Punjab')).toBe(true);
    expect(states.has('Haryana')).toBe(true);
  });

  it('State Admin (Punjab) can ONLY see Punjab administrators, NOT other states', async () => {
    const res = await request(app)
      .get('/api/v1/admin/state-admins')
      .set('Authorization', `Bearer ${punjabAdminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.isSuperAdmin).toBe(false);
    expect(res.body.data.myAssignedState).toBe('Punjab');

    // Every single returned admin MUST be Punjab!
    expect(res.body.data.admins.length).toBeGreaterThan(0);
    for (const admin of res.body.data.admins) {
      expect(admin.assignedState).toBe('Punjab');
    }
  });

  it('State Admin (Punjab) attempting to query other states is restricted to Punjab', async () => {
    const res = await request(app)
      .get('/api/v1/admin/state-admins?state=Haryana')
      .set('Authorization', `Bearer ${punjabAdminToken}`);

    expect(res.status).toBe(200);
    for (const admin of res.body.data.admins) {
      expect(admin.assignedState).toBe('Punjab');
    }
  });

  it('Super Admin has permission to view and update privacy settings', async () => {
    const getRes = await request(app)
      .get('/api/v1/admin/privacy-settings')
      .set('Authorization', `Bearer ${superAdminToken}`);

    expect(getRes.status).toBe(200);
    expect(getRes.body.data.isSuperAdmin).toBe(true);
    expect(getRes.body.data.canModify).toBe(true);

    const updateRes = await request(app)
      .put('/api/v1/admin/privacy-settings')
      .set('Authorization', `Bearer ${superAdminToken}`)
      .send({
        maskPassengerPii: true,
        restrictCrossStateViewing: true,
        requireConsentForBooking: true,
        auditLogRetentionDays: 365
      });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.data.settings.auditLogRetentionDays).toBe(365);
    expect(updateRes.body.data.settings.restrictCrossStateViewing).toBe(true);
  });

  it('State Admin is forbidden from updating privacy settings', async () => {
    const updateRes = await request(app)
      .put('/api/v1/admin/privacy-settings')
      .set('Authorization', `Bearer ${punjabAdminToken}`)
      .send({
        maskPassengerPii: false,
        restrictCrossStateViewing: false
      });

    expect(updateRes.status).toBe(403);
    expect(updateRes.body.error.code).toBe('SUPER_ADMIN_REQUIRED');
  });
});
