const ApiError = require('../utils/apiError');

/**
 * Role-based authorization middleware factory.
 * Restricts route access to users with one of the specified roles.
 *
 * @param {...string} allowedRoles - Roles permitted to access the endpoint
 * @returns {Function} Express middleware function
 */
const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return next(
        new ApiError(401, 'Authentication required before authorization check.')
      );
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new ApiError(
          403,
          `Access denied. Role '${req.user.role}' is not authorized to access this resource.`
        )
      );
    }

    return next();
  };
};

module.exports = authorizeRoles;
