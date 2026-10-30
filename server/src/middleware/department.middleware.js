const ApiError = require('../utils/apiError');

/**
 * Middleware to enforce department boundaries for Department Admins and Instructors.
 * Super Admins are permitted to access resources across all academic departments.
 *
 * Checks target department ID from params (:departmentId or :deptId), body, or query.
 */
const requireDepartmentMatch = (req, res, next) => {
  if (!req.user) {
    return next(new ApiError(401, 'Authentication required before department authorization.'));
  }

  // Super Admins have institutional cross-departmental jurisdiction
  if (req.user.role === 'SUPER_ADMIN') {
    return next();
  }

  // Determine user's own department ID
  const userDeptId = req.user.department
    ? (req.user.department._id || req.user.department).toString()
    : null;

  if (!userDeptId) {
    return next(
      new ApiError(403, 'Your user account is not associated with an academic department.')
    );
  }

  // Determine target department from request parameters, body, or query
  const targetDeptId =
    req.params.departmentId ||
    req.params.deptId ||
    req.body.department ||
    req.body.departmentId ||
    req.query.departmentId ||
    req.query.department;

  // If a specific target department is declared, it must match user's department
  if (targetDeptId && targetDeptId.toString() !== userDeptId) {
    return next(
      new ApiError(
        403,
        'Access denied. You are only authorized to access or manage records within your assigned department.'
      )
    );
  }

  // Automatically enforce filter scoping on the request object for queries
  req.enforcedDepartmentId = userDeptId;

  return next();
};

module.exports = {
  requireDepartmentMatch
};
