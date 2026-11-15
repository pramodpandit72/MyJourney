import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import User from '../src/models/User.js';
import { USER_ROLES, VERIFICATION_STATUS } from '../src/config/constants.js';

async function updateSuperAdmin() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error('MONGODB_URI not found in environment.');
  }

  console.log('Connecting to MongoDB...');
  await mongoose.connect(mongoUri, { dbName: 'myjourney' });
  console.log('Connected to MongoDB.');

  const newSuperAdminEmail = 'nwdpramod12305901@gmail.com';
  const newSuperAdminPassword = '@123Prazapati';
  const passwordHash = await bcrypt.hash(newSuperAdminPassword, 10);

  // 1. Check if user with new email already exists
  let superAdmin = await User.findOne({ email: newSuperAdminEmail });

  if (!superAdmin) {
    superAdmin = await User.create({
      name: 'Pramod Pandit (Chief Transport Administrator)',
      email: newSuperAdminEmail,
      passwordHash,
      role: USER_ROLES.ADMIN,
      assignedState: 'ALL',
      verificationStatus: VERIFICATION_STATUS.VERIFIED,
      phone: '+91-9876543210'
    });
    console.log(`✅ Created new Super Admin: ${superAdmin.email}`);
  } else {
    superAdmin.name = 'Pramod Pandit (Chief Transport Administrator)';
    superAdmin.passwordHash = passwordHash;
    superAdmin.role = USER_ROLES.ADMIN;
    superAdmin.assignedState = 'ALL';
    superAdmin.verificationStatus = VERIFICATION_STATUS.VERIFIED;
    await superAdmin.save();
    console.log(`✅ Updated existing account to Super Admin: ${superAdmin.email}`);
  }

  // 2. Remove the previous super admin accounts
  const deleteResult = await User.deleteMany({
    email: { $in: ['admin@myjourney.in', 'admin@yatrasetu.gov.in'] }
  });
  console.log(`🗑️ Removed previous super admin accounts (Deleted count: ${deleteResult.deletedCount})`);

  // 3. Verify the new super admin credentials by testing login
  const verifyUser = await User.findOne({ email: newSuperAdminEmail });
  const isMatch = await bcrypt.compare(newSuperAdminPassword, verifyUser.passwordHash);
  console.log(`🔒 Password verification test for ${newSuperAdminEmail}: ${isMatch ? 'SUCCESS' : 'FAILED'}`);

  await mongoose.disconnect();
  console.log('Done.');
}

updateSuperAdmin().catch(err => {
  console.error('Error updating super admin:', err);
  process.exit(1);
});
