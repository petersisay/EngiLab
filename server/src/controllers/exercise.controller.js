const LaboratoryExercise = require('../models/exercise.model');
const Course = require('../models/course.model');
const AuditLog = require('../models/auditLog.model');
const ApiError = require('../utils/apiError');
const { sendSuccess } = require('../utils/apiResponse');

/**
 * Get laboratory exercises for a course or department.
 * Route: GET /api/v1/exercises
 */
const getExercises = async (req, res, next) => {
  try {
    const { courseId, weekNumber, isPublished } = req.query;

    const query = {};
    if (courseId) query.course = courseId;
    if (weekNumber) query.weekNumber = parseInt(weekNumber, 10);

    // Students only see published exercises
    if (req.user.role === 'STUDENT') {
      query.isPublished = true;
    } else if (isPublished !== undefined) {
      query.isPublished = isPublished === 'true';
    }

    const exercises = await LaboratoryExercise.find(query)
      .populate('course', 'code title department semester')
      .populate('createdBy', 'firstName lastName email')
      .sort({ orderIndex: 1, weekNumber: 1, createdAt: 1 })
      .lean();

    return sendSuccess(res, {
      statusCode: 200,
      message: 'Laboratory exercises retrieved successfully.',
      data: { exercises }
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Get single laboratory exercise details.
 * Route: GET /api/v1/exercises/:id
 */
const getExerciseById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const exercise = await LaboratoryExercise.findById(id)
      .populate({
        path: 'course',
        select: 'code title department semester instructors coordinator',
        populate: { path: 'department', select: 'name code slug' }
      })
      .populate('createdBy', 'firstName lastName email');

    if (!exercise) {
      throw new ApiError(404, 'Laboratory exercise not found.');
    }

    if (req.user.role === 'STUDENT' && !exercise.isPublished) {
      throw new ApiError(403, 'This laboratory exercise is not yet published.');
    }

    return sendSuccess(res, {
      statusCode: 200,
      message: 'Laboratory exercise details retrieved successfully.',
      data: { exercise }
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Create a new laboratory exercise.
 * Route: POST /api/v1/exercises
 * Access: Super Admin, Department Admin, Instructor
 */
const createExercise = async (req, res, next) => {
  try {
    const {
      title,
      exerciseNumber,
      weekNumber,
      course,
      description,
      objectives,
      prerequisites,
      equipmentRequired,
      safetyGuidelines,
      procedureSteps,
      manualUrl,
      attachments,
      submissionType = 'INDIVIDUAL',
      maxScore = 100,
      rubric,
      deadline,
      lateSubmissionAllowed = true,
      latePenaltyPercent = 5,
      isPublished = false
    } = req.body;

    if (!title || !course || !deadline) {
      throw new ApiError(400, 'Title, course reference, and submission deadline are required.');
    }

    const courseRecord = await Course.findById(course);
    if (!courseRecord) {
      throw new ApiError(404, 'Associated course not found.');
    }

    // Authorization check for instructors
    if (req.user.role === 'INSTRUCTOR') {
      const isInstructor = courseRecord.instructors.some(
        (id) => id.toString() === req.user._id.toString()
      );
      if (!isInstructor && courseRecord.coordinator.toString() !== req.user._id.toString()) {
        throw new ApiError(403, 'You are not assigned as an instructor for this course.');
      }
    }

    const newExercise = await LaboratoryExercise.create({
      title: title.trim(),
      exerciseNumber: exerciseNumber || 'Lab 1',
      weekNumber: Number(weekNumber) || 1,
      course,
      description: description ? description.trim() : '',
      objectives: Array.isArray(objectives) ? objectives : [],
      prerequisites: Array.isArray(prerequisites) ? prerequisites : [],
      equipmentRequired: Array.isArray(equipmentRequired) ? equipmentRequired : [],
      safetyGuidelines: safetyGuidelines ? safetyGuidelines.trim() : '',
      procedureSteps: Array.isArray(procedureSteps) ? procedureSteps : [],
      manualUrl: manualUrl || '',
      attachments: Array.isArray(attachments) ? attachments : [],
      submissionType,
      maxScore: Number(maxScore) || 100,
      rubric: Array.isArray(rubric) ? rubric : [],
      deadline: new Date(deadline),
      lateSubmissionAllowed: Boolean(lateSubmissionAllowed),
      latePenaltyPercent: Number(latePenaltyPercent) || 0,
      isPublished: Boolean(isPublished),
      createdBy: req.user._id
    });

    const populated = await LaboratoryExercise.findById(newExercise._id)
      .populate('course', 'code title')
      .populate('createdBy', 'firstName lastName email');

    await AuditLog.create({
      user: req.user._id,
      role: req.user.role,
      action: 'CREATE_LAB_EXERCISE',
      resourceType: 'EXERCISE',
      resourceId: newExercise._id.toString(),
      details: { title: newExercise.title, course: courseRecord.code },
      ipAddress: req.ip || '',
      userAgent: req.get('user-agent') || ''
    }).catch(() => {});

    return sendSuccess(res, {
      statusCode: 201,
      message: 'Laboratory exercise created successfully.',
      data: { exercise: populated }
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Update laboratory exercise details.
 * Route: PUT /api/v1/exercises/:id
 */
const updateExercise = async (req, res, next) => {
  try {
    const { id } = req.params;
    const exercise = await LaboratoryExercise.findById(id).populate('course');

    if (!exercise) {
      throw new ApiError(404, 'Laboratory exercise not found.');
    }

    if (req.user.role === 'INSTRUCTOR') {
      const isInstructor = exercise.course.instructors.some(
        (instId) => instId.toString() === req.user._id.toString()
      );
      if (!isInstructor && exercise.course.coordinator.toString() !== req.user._id.toString()) {
        throw new ApiError(403, 'You are not assigned to instruct this course.');
      }
    }

    const updatableFields = [
      'title',
      'exerciseNumber',
      'weekNumber',
      'description',
      'objectives',
      'prerequisites',
      'equipmentRequired',
      'safetyGuidelines',
      'procedureSteps',
      'manualUrl',
      'attachments',
      'submissionType',
      'maxScore',
      'rubric',
      'deadline',
      'lateSubmissionAllowed',
      'latePenaltyPercent',
      'isPublished'
    ];

    updatableFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        exercise[field] = req.body[field];
      }
    });

    await exercise.save();

    const updated = await LaboratoryExercise.findById(exercise._id)
      .populate('course', 'code title')
      .populate('createdBy', 'firstName lastName email');

    return sendSuccess(res, {
      statusCode: 200,
      message: 'Laboratory exercise updated successfully.',
      data: { exercise: updated }
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Toggle laboratory exercise publication status.
 * Route: PATCH /api/v1/exercises/:id/publish
 */
const togglePublishExercise = async (req, res, next) => {
  try {
    const { id } = req.params;
    const exercise = await LaboratoryExercise.findById(id);

    if (!exercise) {
      throw new ApiError(404, 'Laboratory exercise not found.');
    }

    exercise.isPublished = !exercise.isPublished;
    await exercise.save();

    return sendSuccess(res, {
      statusCode: 200,
      message: `Exercise is now ${exercise.isPublished ? 'published for students' : 'hidden as draft'}.`,
      data: { isPublished: exercise.isPublished }
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getExercises,
  getExerciseById,
  createExercise,
  updateExercise,
  togglePublishExercise
};
