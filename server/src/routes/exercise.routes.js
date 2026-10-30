const express = require('express');
const {
  getExercises,
  getExerciseById,
  createExercise,
  updateExercise,
  togglePublishExercise
} = require('../controllers/exercise.controller');
const authenticate = require('../middleware/auth.middleware');
const authorizeRoles = require('../middleware/role.middleware');

const router = express.Router();

router.use(authenticate);

/**
 * @route   GET /api/v1/exercises
 * @desc    Get laboratory exercises filtered by course, week, publication
 * @access  Authenticated (students receive published only)
 */
router.get('/', getExercises);

/**
 * @route   GET /api/v1/exercises/:id
 * @desc    Get complete exercise specifications, manuals, rubrics
 * @access  Authenticated
 */
router.get('/:id', getExerciseById);

/**
 * @route   POST /api/v1/exercises
 * @desc    Create new laboratory exercise
 * @access  Super Admin, Department Admin, Instructor
 */
router.post(
  '/',
  authorizeRoles('SUPER_ADMIN', 'DEPARTMENT_ADMIN', 'INSTRUCTOR'),
  createExercise
);

/**
 * @route   PUT /api/v1/exercises/:id
 * @desc    Update laboratory exercise details, rubric, deadline
 * @access  Super Admin, Department Admin, Instructor
 */
router.put(
  '/:id',
  authorizeRoles('SUPER_ADMIN', 'DEPARTMENT_ADMIN', 'INSTRUCTOR'),
  updateExercise
);

/**
 * @route   PATCH /api/v1/exercises/:id/publish
 * @desc    Toggle publication state between draft and published
 * @access  Super Admin, Department Admin, Instructor
 */
router.patch(
  '/:id/publish',
  authorizeRoles('SUPER_ADMIN', 'DEPARTMENT_ADMIN', 'INSTRUCTOR'),
  togglePublishExercise
);

module.exports = router;
