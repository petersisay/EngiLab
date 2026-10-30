const express = require('express');
const {
  getResources,
  getResourceById,
  createResource,
  updateResource
} = require('../controllers/resource.controller');
const authenticate = require('../middleware/auth.middleware');
const authorizeRoles = require('../middleware/role.middleware');

const router = express.Router();

router.use(authenticate);

/**
 * @route   GET /api/v1/resources
 * @desc    Get filtered list of learning resources (lab manuals, datasheets, guides)
 * @access  Authenticated
 */
router.get('/', getResources);

/**
 * @route   GET /api/v1/resources/:id
 * @desc    Get single learning resource details
 * @access  Authenticated
 */
router.get('/:id', getResourceById);

/**
 * @route   POST /api/v1/resources
 * @desc    Upload or register a new learning resource
 * @access  Super Admin, Department Admin, Instructor
 */
router.post(
  '/',
  authorizeRoles('SUPER_ADMIN', 'DEPARTMENT_ADMIN', 'INSTRUCTOR'),
  createResource
);

/**
 * @route   PUT /api/v1/resources/:id
 * @desc    Update learning resource details or file link
 * @access  Super Admin, Department Admin, Instructor
 */
router.put(
  '/:id',
  authorizeRoles('SUPER_ADMIN', 'DEPARTMENT_ADMIN', 'INSTRUCTOR'),
  updateResource
);

module.exports = router;
