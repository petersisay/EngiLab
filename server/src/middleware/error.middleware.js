const ApiError = require('../utils/apiError');

/**
 * Centralized Express error-handling middleware for EngiLab.
 * Catches all forwarded or unhandled errors, formats a uniform error response,
 * and prevents sensitive internal error details from leaking to clients.
 *
 * @param {Error|ApiError|*} err - Error instance
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next middleware function
 */
const errorMiddleware = (err, req, res, next) => {
  // Delegate to default Express error handler if response headers have already been sent
  if (res.headersSent) {
    return next(err);
  }

  // Determine whether this is an expected operational error
  const isOperational = (err instanceof ApiError) || Boolean(err && err.isOperational);

  // Determine HTTP status code (must be valid 400-599 range)
  let statusCode = 500;
  if (typeof err?.statusCode === 'number' && err.statusCode >= 400 && err.statusCode <= 599) {
    statusCode = err.statusCode;
  }

  // Determine client-facing message
  // Operational errors provide their explicit message; unexpected errors receive a generic message
  const message = isOperational && typeof err.message === 'string' && err.message.trim() !== ''
    ? err.message.trim()
    : 'Internal server error';

  // Server-side diagnostic logging in development mode without sending to client
  if (process.env.NODE_ENV === 'development') {
    const method = req?.method || 'UNKNOWN';
    const path = req?.originalUrl || req?.url || 'UNKNOWN';
    console.error(`[Error Middleware] [${method}] ${path} - Status: ${statusCode} - ${err?.stack || err}`);
  }

  // Uniform response payload matching EngiLab API envelope conventions
  const responsePayload = {
    success: false,
    message,
    data: null
  };

  return res.status(statusCode).json(responsePayload);
};

module.exports = errorMiddleware;
module.exports.errorMiddleware = errorMiddleware;
