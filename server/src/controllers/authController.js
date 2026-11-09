import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { logAuditEvent } from '../utils/auditLogger.js';

const generateToken = (userId, role) => {
  const secret = process.env.JWT_SECRET || 'super-secret-jwt-key-change-in-production-min-32-chars';
  return jwt.sign({ id: userId, role }, secret, { expiresIn: '7d' });
};

const sendAuthResponse = (res, user, statusCode = 200, message = 'Success') => {
  const token = generateToken(user._id, user.role);

  const isSecure = process.env.NODE_ENV === 'production' && process.env.COOKIE_SECURE !== 'false';
  res.cookie('token', token, {
    httpOnly: true,
    secure: isSecure,
    sameSite: isSecure ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });

  const userData = {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    operatorId: user.operatorId,
    phone: user.phone
  };

  return sendSuccess(res, { user: userData, token }, message, statusCode);
};

export const register = async (req, res, next) => {
  try {
    const { name, email, password, phone, role, operatorId } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return sendError(res, 'An account with this email address already exists.', 409, 'EMAIL_EXISTS');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      name,
      email,
      passwordHash,
      phone: phone || '',
      role: role || 'CUSTOMER',
      operatorId: operatorId || null
    });

    await logAuditEvent({
      actorId: newUser._id,
      actorRole: newUser.role,
      action: 'USER_REGISTERED',
      entityType: 'User',
      entityId: newUser._id,
      summary: `User registered: ${newUser.name} (${newUser.email}) with role ${newUser.role}`
    });

    return sendAuthResponse(res, newUser, 201, 'Registration successful');
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).populate('operatorId');
    if (!user) {
      return sendError(res, 'Invalid email or password', 401, 'INVALID_CREDENTIALS');
    }

    if (!user.isActive) {
      return sendError(res, 'Account has been deactivated. Please contact support.', 403, 'ACCOUNT_DEACTIVATED');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return sendError(res, 'Invalid email or password', 401, 'INVALID_CREDENTIALS');
    }

    await logAuditEvent({
      actorId: user._id,
      actorRole: user.role,
      action: 'USER_LOGGED_IN',
      entityType: 'User',
      entityId: user._id,
      summary: `User logged in: ${user.name} (${user.email})`
    });

    return sendAuthResponse(res, user, 200, 'Login successful');
  } catch (err) {
    next(err);
  }
};

export const logout = async (req, res) => {
  res.clearCookie('token');
  return sendSuccess(res, null, 'Logged out successfully');
};

export const getMe = async (req, res) => {
  const user = await User.findById(req.user._id).select('-passwordHash').populate('operatorId');
  return sendSuccess(res, { user });
};

