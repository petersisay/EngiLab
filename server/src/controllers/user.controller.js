const User = require('../models/user.model');
const AuditLog = require('../models/auditLog.model');
const ApiError = require('../utils/apiError');
const { sendSuccess } = require('../utils/apiResponse');

/**
 * Get paginated list of users with optional filtering.
 * Route: GET /api/v1/users
 * Access: Super Admin (all), Department Admin (their department only)
 */
const getUsers = async (req, res, next) => {
  try {
    const { role, department, search, isActive, page = 1, limit = 20 } = req.query;

    const query = {};

    // Enforce department boundary for Department Admins
    if (req.user.role === 'DEPARTMENT_ADMIN') {
      const userDeptId = req.user.department?._id || req.user.department;
      query.department = userDeptId;
    } else if (department) {
      query.department = department;
    }

    if (role) {
      query.role = role.toUpperCase();
    }

    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    if (search) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { email: searchRegex },
        { studentId: searchRegex }
      ];
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [users, total] = await Promise.all([
      User.find(query)
        .select('-passwordHash')
        .populate('department', 'name code slug')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      User.countDocuments(query)
    ]);

    return sendSuccess(res, {
      statusCode: 200,
      message: 'Users retrieved successfully.',
      data: {
        users,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum)
        }
      }
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Get single user by ID.
 * Route: GET /api/v1/users/:id
 */
const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id)
      .select('-passwordHash')
      .populate('department', 'name code slug');

    if (!user) {
      throw new ApiError(404, 'User not found.');
    }

    // Restrict department admins to their own department
    if (req.user.role === 'DEPARTMENT_ADMIN') {
      const userDeptId = (req.user.department?._id || req.user.department)?.toString();
      const targetDeptId = (user.department?._id || user.department)?.toString();
      if (userDeptId && targetDeptId && userDeptId !== targetDeptId) {
        throw new ApiError(403, 'Access denied. You cannot view users outside your department.');
      }
    }

    return sendSuccess(res, {
      statusCode: 200,
      message: 'User details retrieved successfully.',
      data: { user }
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Administrative creation of an instructor or staff account.
 * Route: POST /api/v1/users
 * Access: Super Admin (any role/dept), Department Admin (instructors/students in their dept)
 */
const createUser = async (req, res, next) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      role = 'INSTRUCTOR',
      department,
      phone,
      studentId
    } = req.body;

    if (!firstName || !lastName || !email || !password) {
      throw new ApiError(400, 'First name, last name, email, and password are required.');
    }

    let targetDept = department;
    // Department admins can only create accounts in their assigned department
    if (req.user.role === 'DEPARTMENT_ADMIN') {
      targetDept = req.user.department?._id || req.user.department;
      if (role === 'SUPER_ADMIN' || role === 'DEPARTMENT_ADMIN') {
        throw new ApiError(403, 'Department Admins can only create Instructors and Students.');
      }
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      throw new ApiError(409, 'A user with this email address already exists.');
    }

    if (role === 'STUDENT' && studentId) {
      const existingStudent = await User.findOne({ studentId: studentId.trim() });
      if (existingStudent) {
        throw new ApiError(409, 'A student with this Student ID already exists.');
      }
    }

    const newUser = await User.create({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.toLowerCase().trim(),
      passwordHash: password,
      role: role.toUpperCase(),
      department: targetDept || null,
      phone: phone ? phone.trim() : '',
      studentId: role === 'STUDENT' && studentId ? studentId.trim() : undefined,
      isActive: true
    });

    const populatedUser = await User.findById(newUser._id)
      .select('-passwordHash')
      .populate('department', 'name code slug');

    await AuditLog.create({
      user: req.user._id,
      role: req.user.role,
      action: 'CREATE_USER',
      resourceType: 'USER',
      resourceId: newUser._id.toString(),
      details: { email: newUser.email, role: newUser.role, department: targetDept },
      ipAddress: req.ip || '',
      userAgent: req.get('user-agent') || ''
    }).catch(() => {});

    return sendSuccess(res, {
      statusCode: 201,
      message: `${role} account created successfully.`,
      data: { user: populatedUser }
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Update user account details and status.
 * Route: PUT /api/v1/users/:id
 * Access: Super Admin, Department Admin (scoped)
 */
const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, phone, role, department, isActive, password } = req.body;

    const user = await User.findById(id);
    if (!user) {
      throw new ApiError(404, 'User not found.');
    }

    // Enforce department boundary
    if (req.user.role === 'DEPARTMENT_ADMIN') {
      const userDeptId = (req.user.department?._id || req.user.department)?.toString();
      const targetDeptId = (user.department?._id || user.department)?.toString();
      if (userDeptId && targetDeptId && userDeptId !== targetDeptId) {
        throw new ApiError(403, 'Access denied. You cannot edit users outside your department.');
      }
      if (role && (role === 'SUPER_ADMIN' || role === 'DEPARTMENT_ADMIN')) {
        throw new ApiError(403, 'Department Admins cannot assign administrative roles.');
      }
    }

    if (firstName) user.firstName = firstName.trim();
    if (lastName) user.lastName = lastName.trim();
    if (phone !== undefined) user.phone = phone.trim();
    if (isActive !== undefined) user.isActive = Boolean(isActive);

    if (role && req.user.role === 'SUPER_ADMIN') {
      user.role = role.toUpperCase();
    }

    if (department !== undefined && req.user.role === 'SUPER_ADMIN') {
      user.department = department || null;
    }

    if (password) {
      if (password.length < 8) {
        throw new ApiError(400, 'Password must be at least 8 characters long.');
      }
      user.passwordHash = password;
    }

    await user.save();

    const updatedUser = await User.findById(user._id)
      .select('-passwordHash')
      .populate('department', 'name code slug');

    await AuditLog.create({
      user: req.user._id,
      role: req.user.role,
      action: 'UPDATE_USER',
      resourceType: 'USER',
      resourceId: user._id.toString(),
      details: { email: user.email, updatedFields: req.body },
      ipAddress: req.ip || '',
      userAgent: req.get('user-agent') || ''
    }).catch(() => {});

    return sendSuccess(res, {
      statusCode: 200,
      message: 'User updated successfully.',
      data: { user: updatedUser }
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Toggle user account status (Activate / Deactivate).
 * Route: PATCH /api/v1/users/:id/status
 */
const toggleUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) {
      throw new ApiError(404, 'User not found.');
    }

    // Prevent deactivating own account
    if (user._id.toString() === req.user._id.toString()) {
      throw new ApiError(400, 'You cannot deactivate your own account.');
    }

    user.isActive = !user.isActive;
    await user.save();

    await AuditLog.create({
      user: req.user._id,
      role: req.user.role,
      action: user.isActive ? 'ACTIVATE_USER' : 'DEACTIVATE_USER',
      resourceType: 'USER',
      resourceId: user._id.toString(),
      details: { email: user.email, isActive: user.isActive },
      ipAddress: req.ip || '',
      userAgent: req.get('user-agent') || ''
    }).catch(() => {});

    return sendSuccess(res, {
      statusCode: 200,
      message: `User account has been ${user.isActive ? 'activated' : 'deactivated'}.`,
      data: { isActive: user.isActive }
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  toggleUserStatus
};
