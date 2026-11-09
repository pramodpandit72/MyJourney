import { sendError } from '../utils/response.js';

export const errorHandler = (err, req, res, next) => {
  console.error('[Global Error Handler]', err);

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    return sendError(
      res,
      `A record with this ${field} already exists (${err.keyValue?.[field]}).`,
      409,
      'DUPLICATE_KEY_ERROR',
      err.keyValue
    );
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const details = Object.values(err.errors).map(e => ({
      field: e.path,
      message: e.message
    }));
    return sendError(res, 'Validation failed', 400, 'VALIDATION_ERROR', details);
  }

  // Mongoose cast error (invalid ObjectId)
  if (err.name === 'CastError') {
    return sendError(res, `Invalid ID format for ${err.path}`, 400, 'INVALID_ID');
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  const code = err.code && typeof err.code === 'string' ? err.code : 'INTERNAL_ERROR';

  return sendError(res, message, statusCode, code);
};

