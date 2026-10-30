const User = require('../models/user.model');
const AuditLog = require('../models/auditLog.model');
const ApiError = require('../utils/apiError');
const { sendSuccess } = require('../utils/apiResponse');
const {
  generateAccessToken,
  generateRefreshToken,
  sendTokenCookies,
  clearTokenCookies
} = require('../utils/token');

/**
 * Register a new student account.
 * Route: POST /api/v1/auth/register
 */
const registerStudent = async (req, res, next) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      department,
      studentId,
      academicYear,
      semester,
      phone
    } = req.body;

    if (!firstName || !lastName || !email || !password || !department || !studentId) {
      throw new ApiError(400, 'Please provide all required registration fields.');
    }

    // Check if email already registered
    const existingEmail = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingEmail) {
      throw new ApiError(409, 'An account with this email address already exists.');
    }

    // Check if studentId already registered
    const existingStudentId = await User.findOne({ studentId: studentId.trim() });
    if (existingStudentId) {
      throw new ApiError(409, 'A student with this Student ID is already registered.');
    }

    const newUser = await User.create({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.toLowerCase().trim(),
      passwordHash: password,
      role: 'STUDENT',
      department,
      studentId: studentId.trim(),
      academicYear: academicYear || null,
      semester: semester || null,
      phone: phone ? phone.trim() : '',
      isActive: true,
      isEmailVerified: false
    });

    // Populate department info for response
    const populatedUser = await User.findById(newUser._id)
      .select('-passwordHash')
      .populate('department', 'name code slug');

    // Generate tokens and set cookies
    const tokenPayload = {
      userId: newUser._id,
      role: newUser.role,
      department: newUser.department
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);
    sendTokenCookies(res, accessToken, refreshToken);

    // Audit log
    await AuditLog.create({
      user: newUser._id,
      role: newUser.role,
      action: 'REGISTER_STUDENT',
      resourceType: 'USER',
      resourceId: newUser._id.toString(),
      details: { email: newUser.email, studentId: newUser.studentId },
      ipAddress: req.ip || '',
      userAgent: req.get('user-agent') || ''
    }).catch(() => {});

    return sendSuccess(res, {
      statusCode: 201,
      message: 'Student account registered successfully.',
      data: { user: populatedUser }
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Authenticate user with email and password.
 * Route: POST /api/v1/auth/login
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new ApiError(400, 'Email address and password are required.');
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail }).populate(
      'department',
      'name code slug'
    );

    if (!user) {
      throw new ApiError(401, 'Invalid email or password credentials.');
    }

    if (!user.isActive) {
      throw new ApiError(
        403,
        'Your account has been deactivated. Please contact your department administrator.'
      );
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new ApiError(401, 'Invalid email or password credentials.');
    }

    // Update last login timestamp
    user.lastLoginAt = new Date();
    await user.save({ validateBeforeSave: false });

    // Issue tokens
    const tokenPayload = {
      userId: user._id,
      role: user.role,
      department: user.department ? user.department._id : null
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);
    sendTokenCookies(res, accessToken, refreshToken);

    // Sanitize user object
    const userObj = user.toObject();
    delete userObj.passwordHash;

    // Audit log
    await AuditLog.create({
      user: user._id,
      role: user.role,
      action: 'LOGIN',
      resourceType: 'AUTH',
      resourceId: user._id.toString(),
      details: { email: user.email },
      ipAddress: req.ip || '',
      userAgent: req.get('user-agent') || ''
    }).catch(() => {});

    return sendSuccess(res, {
      statusCode: 200,
      message: 'Authentication successful. Welcome to EngiLab.',
      data: { user: userObj }
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Sign out user and clear auth cookies.
 * Route: POST /api/v1/auth/logout
 */
const logout = async (req, res, next) => {
  try {
    clearTokenCookies(res);

    if (req.user) {
      await AuditLog.create({
        user: req.user._id,
        role: req.user.role,
        action: 'LOGOUT',
        resourceType: 'AUTH',
        resourceId: req.user._id.toString(),
        details: { email: req.user.email },
        ipAddress: req.ip || '',
        userAgent: req.get('user-agent') || ''
      }).catch(() => {});
    }

    return sendSuccess(res, {
      statusCode: 200,
      message: 'Signed out successfully.',
      data: {}
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Get profile of currently authenticated user.
 * Route: GET /api/v1/auth/me
 */
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-passwordHash')
      .populate('department', 'name code slug');

    if (!user) {
      throw new ApiError(404, 'User account not found.');
    }

    return sendSuccess(res, {
      statusCode: 200,
      message: 'User profile retrieved successfully.',
      data: { user }
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Update authenticated user profile details.
 * Route: PUT /api/v1/auth/profile
 */
const updateProfile = async (req, res, next) => {
  try {
    const { firstName, lastName, phone, bio, avatarUrl } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      throw new ApiError(404, 'User account not found.');
    }

    if (firstName) user.firstName = firstName.trim();
    if (lastName) user.lastName = lastName.trim();
    if (phone !== undefined) user.phone = phone.trim();
    if (bio !== undefined) user.bio = bio.trim();
    if (avatarUrl !== undefined) user.avatarUrl = avatarUrl.trim();

    await user.save();

    const updatedUser = await User.findById(user._id)
      .select('-passwordHash')
      .populate('department', 'name code slug');

    return sendSuccess(res, {
      statusCode: 200,
      message: 'Profile updated successfully.',
      data: { user: updatedUser }
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Change authenticated user password.
 * Route: PUT /api/v1/auth/change-password
 */
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      throw new ApiError(400, 'Both current password and new password are required.');
    }

    if (newPassword.length < 8) {
      throw new ApiError(400, 'New password must be at least 8 characters long.');
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      throw new ApiError(404, 'User account not found.');
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      throw new ApiError(401, 'Current password provided is incorrect.');
    }

    user.passwordHash = newPassword;
    await user.save();

    await AuditLog.create({
      user: user._id,
      role: user.role,
      action: 'CHANGE_PASSWORD',
      resourceType: 'USER',
      resourceId: user._id.toString(),
      details: { email: user.email },
      ipAddress: req.ip || '',
      userAgent: req.get('user-agent') || ''
    }).catch(() => {});

    return sendSuccess(res, {
      statusCode: 200,
      message: 'Password changed successfully. Please keep your credentials secure.',
      data: {}
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  registerStudent,
  login,
  logout,
  getMe,
  updateProfile,
  changePassword
};
