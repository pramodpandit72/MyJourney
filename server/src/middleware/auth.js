import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { sendError } from '../utils/response.js';

export const authenticate = async (req, res, next) => {
  try {
    let token = null;

    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return sendError(res, 'Authentication required. No token provided.', 401, 'UNAUTHENTICATED');
    }

    const secret = process.env.JWT_SECRET || 'super-secret-jwt-key-change-in-production-min-32-chars';
    let decoded;
    try {
      decoded = jwt.verify(token, secret);
    } catch (jwtErr) {
      return sendError(res, 'Invalid or expired token', 401, 'INVALID_TOKEN');
    }

    const user = await User.findById(decoded.id).select('-passwordHash');
    if (!user || !user.isActive) {
      return sendError(res, 'User account not found or deactivated', 401, 'ACCOUNT_INACTIVE');
    }

    req.user = user;
    next();
  } catch (err) {
    return sendError(res, 'Authentication failed', 401, 'AUTH_FAILED');
  }
};

