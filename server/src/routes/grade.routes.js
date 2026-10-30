const express = require('express');
const {
  gradeSubmission,
  getGradeBySubmission,
  getCourseGradeSummary
} = require('../controllers/grade.controller');
const authenticate = require('../middleware/auth.middleware');
const authorizeRoles = require('../middleware/role.middleware');

const router = express.Router();

router.use(authenticate);

/**
 * @route   POST /api/v1/grades/submission/:submissionId
 * @desc    Submit evaluation, rubric score, and feedback for a lab report
 * @access  Super Admin, Department Admin, Instructor
 */
router.post(
  '/submission/:submissionId',
  authorizeRoles('SUPER_ADMIN', 'DEPARTMENT_ADMIN', 'INSTRUCTOR'),
  gradeSubmission
);

/**
 * @route   GET /api/v1/grades/submission/:submissionId
 * @desc    Get detailed evaluation and rubric scores for a submission
 * @access  Authenticated (Instructor or report author)
 */
router.get('/submission/:submissionId', getGradeBySubmission);

/**
 * @route   GET /api/v1/grades/course/:courseId/summary
 * @desc    Get course grade statistics, averages, and distribution
 * @access  Super Admin, Department Admin, Instructor
 */
router.get(
  '/course/:courseId/summary',
  authorizeRoles('SUPER_ADMIN', 'DEPARTMENT_ADMIN', 'INSTRUCTOR'),
  getCourseGradeSummary
);

module.exports = router;
