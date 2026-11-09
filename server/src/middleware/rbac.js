import { sendError } from '../utils/response.js';
import { USER_ROLES } from '../config/constants.js';

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, 'Authentication required', 401, 'UNAUTHENTICATED');
    }

    if (!roles.includes(req.user.role)) {
      return sendError(
        res,
        `Access denied. Required role: ${roles.join(' or ')}. Your role: ${req.user.role}`,
        403,
        'FORBIDDEN'
      );
    }

    next();
  };
};

/**
 * Checks that an operator user is only accessing their own assigned operator data
 */
export const ensureOperatorOwnership = (getOperatorIdFromReq) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, 'Authentication required', 401, 'UNAUTHENTICATED');
    }

    // Admins have global permission
    if (req.user.role === USER_ROLES.ADMIN) {
      return next();
    }

    if (req.user.role === USER_ROLES.OPERATOR) {
      const targetOperatorId = getOperatorIdFromReq(req);
      if (!req.user.operatorId || req.user.operatorId.toString() !== targetOperatorId?.toString()) {
        return sendError(
          res,
          'Access forbidden: You cannot access or modify records of another operator.',
          403,
          'OPERATOR_FORBIDDEN'
        );
      }
      return next();
    }

    return sendError(res, 'Unauthorized access', 403, 'FORBIDDEN');
  };
};

