const express = require('express');
const {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  toggleUserStatus
} = require('../controllers/user.controller');
const authenticate = require('../middleware/auth.middleware');
const authorizeRoles = require('../middleware/role.middleware');

const router = express.Router();

// All user management routes require valid authentication
router.use(authenticate);

/**
 * @route   GET /api/v1/users
 * @desc    Get paginated users (filtered by role, department, status, search)
 * @access  Super Admin, Department Admin
 */
router.get('/', authorizeRoles('SUPER_ADMIN', 'DEPARTMENT_ADMIN'), getUsers);

/**
 * @route   POST /api/v1/users
 * @desc    Create new instructor or staff user account
 * @access  Super Admin, Department Admin
 */
router.post('/', authorizeRoles('SUPER_ADMIN', 'DEPARTMENT_ADMIN'), createUser);

/**
 * @route   GET /api/v1/users/:id
 * @desc    Get single user details
 * @access  Super Admin, Department Admin, Instructor
 */
router.get('/:id', authorizeRoles('SUPER_ADMIN', 'DEPARTMENT_ADMIN', 'INSTRUCTOR'), getUserById);

/**
 * @route   PUT /api/v1/users/:id
 * @desc    Update user details, role, or department
 * @access  Super Admin, Department Admin
 */
router.put('/:id', authorizeRoles('SUPER_ADMIN', 'DEPARTMENT_ADMIN'), updateUser);

/**
 * @route   PATCH /api/v1/users/:id/status
 * @desc    Activate or deactivate user account
 * @access  Super Admin, Department Admin
 */
router.patch(
  '/:id/status',
  authorizeRoles('SUPER_ADMIN', 'DEPARTMENT_ADMIN'),
  toggleUserStatus
);

module.exports = router;
