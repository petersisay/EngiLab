const User = require('../models/user.model');
const Department = require('../models/department.model');
const Course = require('../models/course.model');
const LaboratoryExercise = require('../models/exercise.model');
const Submission = require('../models/submission.model');
const Grade = require('../models/grade.model');
const AuditLog = require('../models/auditLog.model');
const ApiError = require('../utils/apiError');
const { sendSuccess } = require('../utils/apiResponse');

/**
 * Super Admin platform-wide metrics and institutional health overview.
 * Route: GET /api/v1/admin/overview
 * Access: Super Admin
 */
const getPlatformOverview = async (req, res, next) => {
  try {
    const [
      totalDepartments,
      totalCourses,
      totalInstructors,
      totalStudents,
      totalExercises,
      totalSubmissions,
      gradedSubmissions,
      recentAuditLogs
    ] = await Promise.all([
      Department.countDocuments({ isActive: true }),
      Course.countDocuments({ isActive: true }),
      User.countDocuments({ role: 'INSTRUCTOR', isActive: true }),
      User.countDocuments({ role: 'STUDENT', isActive: true }),
      LaboratoryExercise.countDocuments({ isPublished: true }),
      Submission.countDocuments(),
      Submission.countDocuments({ status: 'GRADED' }),
      AuditLog.find()
        .populate('user', 'firstName lastName email role')
        .sort({ createdAt: -1 })
        .limit(10)
        .lean()
    ]);

    const gradingRate = totalSubmissions > 0
      ? Math.round((gradedSubmissions / totalSubmissions) * 100)
      : 0;

    return sendSuccess(res, {
      statusCode: 200,
      message: 'Platform overview metrics retrieved successfully.',
      data: {
        stats: {
          totalDepartments,
          totalCourses,
          totalInstructors,
          totalStudents,
          totalExercises,
          totalSubmissions,
          gradedSubmissions,
          gradingRate
        },
        recentAuditLogs
      }
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Department-level analytics and academic metrics.
 * Route: GET /api/v1/admin/department/:departmentId/analytics
 * Access: Super Admin, Department Admin (own department)
 */
const getDepartmentAnalytics = async (req, res, next) => {
  try {
    const { departmentId } = req.params;

    const department = await Department.findById(departmentId);
    if (!department) {
      throw new ApiError(404, 'Academic department not found.');
    }

    const [
      courses,
      courseCount,
      facultyCount,
      studentCount,
      exerciseCount
    ] = await Promise.all([
      Course.find({ department: departmentId, isActive: true })
        .populate('coordinator', 'firstName lastName email')
        .lean(),
      Course.countDocuments({ department: departmentId, isActive: true }),
      User.countDocuments({
        department: departmentId,
        role: { $in: ['DEPARTMENT_ADMIN', 'INSTRUCTOR'] },
        isActive: true
      }),
      User.countDocuments({ department: departmentId, role: 'STUDENT', isActive: true }),
      LaboratoryExercise.countDocuments({
        course: { $in: await Course.find({ department: departmentId }).distinct('_id') },
        isPublished: true
      })
    ]);

    return sendSuccess(res, {
      statusCode: 200,
      message: 'Department analytics retrieved successfully.',
      data: {
        department: {
          id: department._id,
          name: department.name,
          code: department.code,
          slug: department.slug
        },
        stats: {
          courseCount,
          facultyCount,
          studentCount,
          exerciseCount
        },
        courses
      }
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Audit logs query with pagination and filters.
 * Route: GET /api/v1/admin/audit-logs
 * Access: Super Admin
 */
const getAuditLogs = async (req, res, next) => {
  try {
    const { role, action, resourceType, page = 1, limit = 25 } = req.query;

    const query = {};
    if (role) query.role = role.toUpperCase();
    if (action) query.action = action.toUpperCase();
    if (resourceType) query.resourceType = resourceType.toUpperCase();

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [logs, total] = await Promise.all([
      AuditLog.find(query)
        .populate('user', 'firstName lastName email role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      AuditLog.countDocuments(query)
    ]);

    return sendSuccess(res, {
      statusCode: 200,
      message: 'Audit logs retrieved successfully.',
      data: {
        logs,
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

module.exports = {
  getPlatformOverview,
  getDepartmentAnalytics,
  getAuditLogs
};
