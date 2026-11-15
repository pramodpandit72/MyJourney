import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { logAuditEvent } from '../utils/auditLogger.js';
import { USER_ROLES, VERIFICATION_STATUS, INDIAN_STATES } from '../config/constants.js';

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
    phone: user.phone,
    assignedState: user.assignedState || 'ALL',
    verificationStatus: user.verificationStatus || 'VERIFIED'
  };

  return sendSuccess(res, { user: userData, token }, message, statusCode);
};

export const getAvailableStates = async (req, res, next) => {
  try {
    const stateAdmins = await User.find({
      role: USER_ROLES.ADMIN,
      assignedState: { $exists: true, $ne: 'ALL' }
    }).select('assignedState verificationStatus');

    const stateCountMap = new Map();
    stateAdmins.forEach((u) => {
      const st = u.assignedState;
      if (st) {
        stateCountMap.set(st.toLowerCase(), (stateCountMap.get(st.toLowerCase()) || 0) + 1);
      }
    });

    const statesList = INDIAN_STATES.map((stateName) => {
      const count = stateCountMap.get(stateName.toLowerCase()) || 0;
      return {
        state: stateName,
        isClaimed: count > 0,
        adminCount: count
      };
    });

    return sendSuccess(res, { states: statesList });
  } catch (err) {
    next(err);
  }
};

export const register = async (req, res, next) => {
  try {
    const { name, email, password, phone, role, operatorId, assignedState } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return sendError(res, 'An account with this email address already exists.', 409, 'EMAIL_EXISTS');
    }

    let userRole = role || USER_ROLES.CUSTOMER;
    let targetState = 'ALL';
    let verificationStatus = VERIFICATION_STATUS.VERIFIED;

    if (userRole === USER_ROLES.ADMIN) {
      if (!assignedState || assignedState.trim() === '' || assignedState.toUpperCase() === 'ALL') {
        return sendError(
          res,
          'State Administrator registration requires selecting a specific state. National Super Admin accounts can only be provisioned internally.',
          400,
          'STATE_REQUIRED'
        );
      }

      // Check if state is already claimed by an existing state admin!
      const existingAdminForState = await User.findOne({
        role: USER_ROLES.ADMIN,
        assignedState: { $regex: new RegExp(`^${assignedState.trim()}$`, 'i') }
      });

      if (existingAdminForState) {
        return sendError(
          res,
          `A State Administrator account is already registered for ${assignedState}. Under public transport governance policy, only one self-registered administrator is allowed per state. Additional state administrators can only be appointed by the National Super Administrator.`,
          409,
          'STATE_ALREADY_CLAIMED'
        );
      }

      targetState = assignedState.trim();
      verificationStatus = VERIFICATION_STATUS.PENDING;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      name,
      email,
      passwordHash,
      phone: phone || '',
      role: userRole,
      assignedState: targetState,
      verificationStatus,
      operatorId: operatorId || null
    });

    await logAuditEvent({
      actorId: newUser._id,
      actorRole: newUser.role,
      action: userRole === USER_ROLES.ADMIN ? 'STATE_ADMIN_REGISTERED' : 'USER_REGISTERED',
      entityType: 'User',
      entityId: newUser._id,
      summary: userRole === USER_ROLES.ADMIN
        ? `State Admin registered for ${targetState}: ${newUser.name} (${newUser.email}) - Status: PENDING_VERIFICATION`
        : `User registered: ${newUser.name} (${newUser.email}) with role ${newUser.role}`
    });

    const msg = userRole === USER_ROLES.ADMIN
      ? `State Administrator account for ${targetState} registered successfully. Your account is pending verification and approval by the National Super Administrator.`
      : 'Registration successful';

    return sendAuthResponse(res, newUser, 201, msg);
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

    if (user.role === USER_ROLES.ADMIN && user.assignedState !== 'ALL') {
      if (user.verificationStatus === VERIFICATION_STATUS.REJECTED) {
        return sendError(
          res,
          'Your State Administrator account was rejected by the National Super Administrator. Access has been denied.',
          403,
          'STATE_ADMIN_REJECTED'
        );
      }
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

export const updateProfile = async (req, res, next) => {
  try {
    const { name, email, phone, currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) {
      return sendError(res, 'User not found', 404, 'NOT_FOUND');
    }

    // If email is changing, check uniqueness across other accounts
    if (email && email.toLowerCase() !== user.email.toLowerCase()) {
      const existing = await User.findOne({
        email: email.toLowerCase(),
        _id: { $ne: user._id }
      });
      if (existing) {
        return sendError(
          res,
          'Email address is already in use by another account',
          409,
          'EMAIL_EXISTS'
        );
      }
      user.email = email.toLowerCase();
    }

    if (name && name.trim()) {
      user.name = name.trim();
    }

    if (phone !== undefined) {
      user.phone = phone.trim();
    }

    // If changing password, verify current password first
    if (newPassword) {
      if (!currentPassword) {
        return sendError(
          res,
          'Current password is required to set a new password',
          400,
          'CURRENT_PASSWORD_REQUIRED'
        );
      }
      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        return sendError(res, 'Current password is incorrect', 400, 'INVALID_PASSWORD');
      }
      if (newPassword.length < 6) {
        return sendError(
          res,
          'New password must be at least 6 characters long',
          400,
          'WEAK_PASSWORD'
        );
      }
      const salt = await bcrypt.genSalt(10);
      user.passwordHash = await bcrypt.hash(newPassword, salt);
    }

    await user.save();

    await logAuditEvent({
      actorId: user._id,
      actorRole: user.role,
      action: 'USER_PROFILE_UPDATED',
      entityType: 'User',
      entityId: user._id,
      summary: `Passenger profile updated: ${user.name} (${user.email})`
    });

    const populatedUser = await User.findById(user._id)
      .select('-passwordHash')
      .populate('operatorId');

    return sendAuthResponse(res, populatedUser, 200, 'Profile updated successfully');
  } catch (err) {
    next(err);
  }
};


