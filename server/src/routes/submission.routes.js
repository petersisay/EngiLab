const express = require('express');
const {
  submitReport,
  getSubmissions,
  getSubmissionById,
  getGroups,
  createGroup
} = require('../controllers/submission.controller');
const authenticate = require('../middleware/auth.middleware');
const authorizeRoles = require('../middleware/role.middleware');

const router = express.Router();

router.use(authenticate);

/**
 * @route   POST /api/v1/submissions
 * @desc    Submit or update laboratory report
 * @access  Student only
 */
router.post('/', authorizeRoles('STUDENT'), submitReport);

/**
 * @route   GET /api/v1/submissions
 * @desc    Get filtered submissions list (scoped by role)
 * @access  Authenticated
 */
router.get('/', getSubmissions);

/**
 * @route   GET /api/v1/submissions/groups
 * @desc    List student lab groups for a course
 * @access  Authenticated
 */
router.get('/groups', getGroups);

/**
 * @route   POST /api/v1/submissions/groups
 * @desc    Form a new student laboratory group
 * @access  Authenticated
 */
router.post('/groups', createGroup);

/**
 * @route   GET /api/v1/submissions/:id
 * @desc    Get complete submission details, feedback, and files
 * @access  Authenticated
 */
router.get('/:id', getSubmissionById);

module.exports = router;
