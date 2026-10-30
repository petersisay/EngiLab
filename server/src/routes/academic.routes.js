const express = require('express');
const {
  getAcademicYears,
  createAcademicYear,
  setCurrentAcademicYear,
  getSemesters,
  createSemester,
  getCourses,
  getCourseById,
  createCourse,
  updateCourse,
  getCourseEnrollments,
  enrollStudent,
  getMyEnrolledCourses
} = require('../controllers/academic.controller');
const authenticate = require('../middleware/auth.middleware');
const authorizeRoles = require('../middleware/role.middleware');

const router = express.Router();

// All academic management endpoints require authentication
router.use(authenticate);

// -------------------------------------------------------------
// ACADEMIC YEARS & SEMESTERS
// -------------------------------------------------------------
router.get('/years', getAcademicYears);
router.post('/years', authorizeRoles('SUPER_ADMIN'), createAcademicYear);
router.patch('/years/:id/current', authorizeRoles('SUPER_ADMIN'), setCurrentAcademicYear);

router.get('/semesters', getSemesters);
router.post('/semesters', authorizeRoles('SUPER_ADMIN'), createSemester);

// -------------------------------------------------------------
// COURSES
// -------------------------------------------------------------
router.get('/courses', getCourses);
router.get('/courses/:id', getCourseById);
router.post(
  '/courses',
  authorizeRoles('SUPER_ADMIN', 'DEPARTMENT_ADMIN'),
  createCourse
);
router.put(
  '/courses/:id',
  authorizeRoles('SUPER_ADMIN', 'DEPARTMENT_ADMIN', 'INSTRUCTOR'),
  updateCourse
);

// -------------------------------------------------------------
// ENROLLMENTS
// -------------------------------------------------------------
router.get(
  '/courses/:courseId/enrollments',
  authorizeRoles('SUPER_ADMIN', 'DEPARTMENT_ADMIN', 'INSTRUCTOR'),
  getCourseEnrollments
);
router.post('/courses/:courseId/enrollments', enrollStudent);
router.get('/my-courses', authorizeRoles('STUDENT'), getMyEnrolledCourses);

module.exports = router;
