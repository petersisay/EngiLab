/**
 * Custom operational API Error class for EngiLab Express API.
 * Extends the native JavaScript Error to include HTTP status code,
 * validation errors array, and operational flag for centralized error handling.
 */
class ApiError extends Error {
  /**
   * @param {number} statusCode - HTTP status code (e.g., 400, 401, 403, 404, 500)
   * @param {string} message - Human-readable error message
   * @param {Array} [errors=[]] - Granular validation or operational errors
   */
  constructor(statusCode, message, errors = []) {
    super(message);

    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.errors = Array.isArray(errors) ? errors : [errors];
    this.success = false;
    this.isOperational = true;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

module.exports = ApiError;
module.exports.ApiError = ApiError;
