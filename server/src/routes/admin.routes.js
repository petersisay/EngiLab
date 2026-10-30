const express = require('express');
const {
  getPlatformOverview,
  getDepartmentAnalytics,
  getAuditLogs
} = require('../controllers/admin.controller');
const authenticate = require('../middleware/auth.middleware');
const authorizeRoles = require('../middleware/role.middleware');
const { requireDepartmentMatch } = require('../middleware/department.middleware');

const router = express.Router();

router.use(authenticate);

/**
 * @route   GET /api/v1/admin/overview
 * @desc    Platform overview metrics and institutional counters
 * @access  Super Admin only
 */
router.get('/overview', authorizeRoles('SUPER_ADMIN'), getPlatformOverview);

/**
 * @route   GET /api/v1/admin/department/:departmentId/analytics
 * @desc    Department analytics, course statistics, completion metrics
 * @access  Super Admin, Department Admin (own department)
 */
router.get(
  '/department/:departmentId/analytics',
  authorizeRoles('SUPER_ADMIN', 'DEPARTMENT_ADMIN'),
  requireDepartmentMatch,
  getDepartmentAnalytics
);

/**
 * @route   GET /api/v1/admin/audit-logs
 * @desc    Platform audit logs and activity tracking
 * @access  Super Admin only
 */
router.get('/audit-logs', authorizeRoles('SUPER_ADMIN'), getAuditLogs);

module.exports = router;
