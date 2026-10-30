/**
 * Standardized API success response utility for EngiLab Express API.
 * Ensures consistent JSON payload structure across all controller endpoints.
 *
 * Response structure:
 * {
 *   "success": true,
 *   "message": "Operation completed successfully",
 *   "data": {}
 * }
 *
 * Example usage:
 * sendSuccess(res, { statusCode: 200, message: 'User retrieved successfully', data: user });
 *
 * @param {object} res - Express response object
 * @param {object} [options={}] - Response options
 * @param {number} [options.statusCode=200] - HTTP status code
 * @param {string} [options.message='Operation completed successfully'] - Human-readable message
 * @param {*} [options.data=null] - Response data payload
 * @returns {object} Express JSON response
 */
const sendSuccess = (res, options = {}) => {
  const statusCode = typeof options.statusCode === 'number' ? options.statusCode : 200;
  const message = typeof options.message === 'string' && options.message.trim() !== ''
    ? options.message.trim()
    : 'Operation completed successfully';

  const responsePayload = {
    success: true,
    message,
    data: options.data !== undefined ? options.data : null
  };

  return res.status(statusCode).json(responsePayload);
};

module.exports = sendSuccess;
module.exports.sendSuccess = sendSuccess;
