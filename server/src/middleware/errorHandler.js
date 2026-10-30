import { env } from '../config/env.js';

export const errorHandler = (err, req, res, next) => {
  console.error(`❌ [${req.method} ${req.originalUrl}] Error:`, err);

  const statusCode = err.statusCode || (err.status && typeof err.status === 'number' ? err.status : 500);
  const message = err.message || 'Internal server error';

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(env.NODE_ENV === 'development' && {
      stack: err.stack,
      details: err.details || null,
    }),
  });
};

