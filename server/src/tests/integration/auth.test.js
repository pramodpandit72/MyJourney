import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import request from 'supertest';
import app from '../../app.js';
import { setupTestDB } from '../setup.js';

describe('Integration Tests: Authentication & Profile APIs', () => {
  setupTestDB();

  it('POST /api/v1/auth/register should create a new customer and set cookie', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'Aarav Patel',
        email: 'aarav.patel@example.com',
        password: 'Password@123',
        phone: '+91-9876543210'
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe('aarav.patel@example.com');
    expect(res.body.data.user.role).toBe('CUSTOMER');
    expect(res.body.data.token).toBeDefined();

    // Check Set-Cookie header
    const cookies = res.headers['set-cookie'];
    expect(cookies).toBeDefined();
    expect(cookies.some(c => c.startsWith('token='))).toBe(true);
  });

  it('POST /api/v1/auth/register should reject duplicate email with 409', async () => {
    await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'First User',
        email: 'duplicate@example.com',
        password: 'Password@123'
      });

    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'Second User',
        email: 'duplicate@example.com',
        password: 'Password@123'
      });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('EMAIL_EXISTS');
  });

  it('POST /api/v1/auth/login should authenticate with valid password and reject invalid', async () => {
    // Register
    await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'Login User',
        email: 'login.test@example.com',
        password: 'Password@123'
      });

    // Valid login
    const validRes = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'login.test@example.com',
        password: 'Password@123'
      });

    expect(validRes.status).toBe(200);
    expect(validRes.body.success).toBe(true);
    expect(validRes.body.data.user.email).toBe('login.test@example.com');

    // Invalid password
    const invalidRes = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'login.test@example.com',
        password: 'WrongPassword'
      });

    expect(invalidRes.status).toBe(401);
    expect(invalidRes.body.success).toBe(false);
    expect(invalidRes.body.error.code).toBe('INVALID_CREDENTIALS');
  });

  it('GET /api/v1/auth/me should return authenticated user profile', async () => {
    const regRes = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'Profile User',
        email: 'profile.user@example.com',
        password: 'Password@123'
      });

    const token = regRes.body.data.token;

    const meRes = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(meRes.status).toBe(200);
    expect(meRes.body.data.user.name).toBe('Profile User');
  });
});

