import { sendError } from '../utils/response.js';

export const validateRequest = (schema, source = 'body') => {
  return async (req, res, next) => {
    try {
      const parsed = await schema.parseAsync(req[source]);
      req[source] = parsed;
      next();
    } catch (err) {
      if (err.errors) {
        const details = err.errors.map(e => ({
          field: e.path.join('.'),
          message: e.message
        }));
        return sendError(res, 'Validation error', 400, 'VALIDATION_ERROR', details);
      }
      return sendError(res, err.message, 400, 'VALIDATION_ERROR');
    }
  };
};

