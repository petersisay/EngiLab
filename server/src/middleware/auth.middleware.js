const ApiError = require('../utils/apiError');
const { verifyAccessToken } = require('../utils/token');
const User = require('../models/user.model');

/**
 * Authentication middleware for verifying JWT access token from HTTP-only cookie
 * or Authorization Bearer header, and attaching the authenticated user to req.user.
 */
const authenticate = async (req, res, next) => {
  try {
    let token = null;

    // Check HTTP-only cookie first
    if (req.cookies && req.cookies.engilab_access_token) {
      token = req.cookies.engilab_access_token;
    }
    // Check Authorization Bearer header as secondary fallback (for API clients)
    else if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer ')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(
        new ApiError(401, 'Authentication required. Please sign in to access this resource.')
      );
    }

    let decoded;
    try {
      decoded = verifyAccessToken(token);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return next(
          new ApiError(401, 'Authentication session expired. Please refresh your session or sign in again.')
        );
      }
      return next(new ApiError(401, 'Invalid authentication token.'));
    }

    // Retrieve active user from database
    const user = await User.findById(decoded.userId)
      .select('-passwordHash')
      .populate('department', 'name code slug');

    if (!user) {
      return next(
        new ApiError(401, 'Authenticated user account could not be found.')
      );
    }

    if (!user.isActive) {
      return next(
        new ApiError(403, 'User account is deactivated. Please contact your department administrator.')
      );
    }

    // Attach user record and helper properties to request object
    req.user = user;
    req.userId = user._id;
    req.userRole = user.role;
    req.userDepartment = user.department;

    return next();
  } catch (error) {
    return next(error);
  }
};

module.exports = authenticate;
