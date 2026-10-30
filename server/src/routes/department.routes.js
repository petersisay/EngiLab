const express = require('express');
const {
  getDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment
} = require('../controllers/department.controller');
const authenticate = require('../middleware/auth.middleware');
const authorizeRoles = require('../middleware/role.middleware');
const { requireDepartmentMatch } = require('../middleware/department.middleware');

const router = express.Router();

/**
 * @route   GET /api/v1/departments
 * @desc    Get all active academic departments with course and faculty counts
 * @access  Public
 */
router.get('/', getDepartments);

/**
 * @route   GET /api/v1/departments/:idOrSlug
 * @desc    Get single department details by ID or URL slug
 * @access  Public
 */
router.get('/:idOrSlug', getDepartmentById);

/**
 * @route   POST /api/v1/departments
 * @desc    Create a new academic department
 * @access  Super Admin only
 */
router.post('/', authenticate, authorizeRoles('SUPER_ADMIN'), createDepartment);

/**
 * @route   PUT /api/v1/departments/:id
 * @desc    Update department details
 * @access  Super Admin, Department Admin (own department)
 */
router.put(
  '/:id',
  authenticate,
  authorizeRoles('SUPER_ADMIN', 'DEPARTMENT_ADMIN'),
  requireDepartmentMatch,
  updateDepartment
);

module.exports = router;
