const ApiError = require('../utils/apiError');

/**
 * 404 Not Found middleware for EngiLab Express API.
 * Intercepts requests that do not match any defined routes,
 * generates a structured 404 ApiError, and forwards it to the centralized error middleware.
 *
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next middleware function
 */
const notFoundMiddleware = (req, res, next) => {
  const method = req?.method || 'UNKNOWN';
  const url = req?.originalUrl || req?.url || 'UNKNOWN';
  const message = `Route not found: ${method} ${url}`;

  const error = new ApiError(404, message);
  return next(error);
};

module.exports = notFoundMiddleware;
module.exports.notFoundMiddleware = notFoundMiddleware;
