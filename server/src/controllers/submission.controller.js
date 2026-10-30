const Submission = require('../models/submission.model');
const LaboratoryExercise = require('../models/exercise.model');
const SubmissionGroup = require('../models/group.model');
const Notification = require('../models/notification.model');
const AuditLog = require('../models/auditLog.model');
const ApiError = require('../utils/apiError');
const { sendSuccess } = require('../utils/apiResponse');

/**
 * Submit or resubmit a laboratory exercise report.
 * Route: POST /api/v1/submissions
 * Access: Student
 */
const submitReport = async (req, res, next) => {
  try {
    const {
      exerciseId,
      submissionType = 'INDIVIDUAL',
      group,
      reportFile,
      attachments = [],
      repositoryUrl = '',
      notes = ''
    } = req.body;

    if (!exerciseId || !reportFile || !reportFile.fileUrl) {
      throw new ApiError(400, 'Exercise ID and a valid laboratory report file are required.');
    }

    const exercise = await LaboratoryExercise.findById(exerciseId).populate('course');
    if (!exercise || !exercise.isPublished) {
      throw new ApiError(404, 'Published laboratory exercise not found.');
    }

    const now = new Date();
    const isLate = now > new Date(exercise.deadline);

    if (isLate && !exercise.lateSubmissionAllowed) {
      throw new ApiError(
        400,
        'The deadline for this exercise has passed, and late submissions are not accepted.'
      );
    }

    // Check existing submission
    const existingSubmission = await Submission.findOne({
      exercise: exerciseId,
      submittedBy: req.user._id,
      status: { $ne: 'RESUBMISSION_REQUESTED' }
    });

    if (existingSubmission && existingSubmission.status === 'GRADED') {
      throw new ApiError(
        400,
        'This submission has already been graded and cannot be modified.'
      );
    }

    let submission;
    if (existingSubmission) {
      // Update existing submission with new version
      existingSubmission.version += 1;
      existingSubmission.reportFile = reportFile;
      existingSubmission.attachments = attachments;
      existingSubmission.repositoryUrl = repositoryUrl.trim();
      existingSubmission.notes = notes.trim();
      existingSubmission.submittedAt = now;
      existingSubmission.isLate = isLate;
      existingSubmission.status = 'SUBMITTED';

      submission = await existingSubmission.save();
    } else {
      submission = await Submission.create({
        exercise: exerciseId,
        course: exercise.course._id,
        submissionType,
        group: group || null,
        submittedBy: req.user._id,
        groupMembers: submissionType === 'GROUP' ? req.body.groupMembers || [req.user._id] : [],
        reportFile,
        attachments,
        repositoryUrl: repositoryUrl.trim(),
        notes: notes.trim(),
        isLate,
        status: 'SUBMITTED',
        submittedAt: now,
        version: 1
      });
    }

    const populated = await Submission.findById(submission._id)
      .populate('exercise', 'title exerciseNumber deadline maxScore')
      .populate('course', 'code title')
      .populate('submittedBy', 'firstName lastName studentId email');

    // Notify course instructors of new submission
    if (exercise.course.instructors && exercise.course.instructors.length > 0) {
      const instructorNotifications = exercise.course.instructors.map((instId) => ({
        recipient: instId,
        sender: req.user._id,
        title: 'New Lab Submission',
        message: `${req.user.firstName} ${req.user.lastName} submitted a report for ${exercise.title} (${exercise.course.code}).`,
        type: 'SUBMISSION',
        link: `/instructor/grading/${submission._id}`,
        read: false
      }));
      await Notification.insertMany(instructorNotifications).catch(() => {});
    }

    await AuditLog.create({
      user: req.user._id,
      role: req.user.role,
      action: 'SUBMIT_REPORT',
      resourceType: 'SUBMISSION',
      resourceId: submission._id.toString(),
      details: { exercise: exercise.title, isLate, version: submission.version },
      ipAddress: req.ip || '',
      userAgent: req.get('user-agent') || ''
    }).catch(() => {});

    return sendSuccess(res, {
      statusCode: existingSubmission ? 200 : 201,
      message: `Laboratory report ${existingSubmission ? 'updated' : 'submitted'} successfully.`,
      data: { submission: populated }
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Get submissions with filtering by exercise, course, student, status.
 * Route: GET /api/v1/submissions
 */
const getSubmissions = async (req, res, next) => {
  try {
    const { exerciseId, courseId, status, studentId } = req.query;

    const query = {};
    if (exerciseId) query.exercise = exerciseId;
    if (courseId) query.course = courseId;
    if (status) query.status = status.toUpperCase();

    // Students only see their own submissions
    if (req.user.role === 'STUDENT') {
      query.$or = [{ submittedBy: req.user._id }, { groupMembers: req.user._id }];
    } else if (studentId) {
      query.submittedBy = studentId;
    }

    const submissions = await Submission.find(query)
      .populate('exercise', 'title exerciseNumber maxScore deadline')
      .populate('course', 'code title')
      .populate('submittedBy', 'firstName lastName studentId email')
      .populate('group', 'name groupNumber')
      .sort({ submittedAt: -1 })
      .lean();

    return sendSuccess(res, {
      statusCode: 200,
      message: 'Submissions retrieved successfully.',
      data: { submissions }
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Get single submission details including grading feedback.
 * Route: GET /api/v1/submissions/:id
 */
const getSubmissionById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const submission = await Submission.findById(id)
      .populate({
        path: 'exercise',
        select: 'title exerciseNumber maxScore deadline rubric submissionType'
      })
      .populate('course', 'code title department semester')
      .populate('submittedBy', 'firstName lastName studentId email avatarUrl')
      .populate('group', 'name groupNumber members')
      .populate('grade');

    if (!submission) {
      throw new ApiError(404, 'Submission record not found.');
    }

    // Student access control
    if (req.user.role === 'STUDENT') {
      const isSubmitter = submission.submittedBy._id.toString() === req.user._id.toString();
      const isMember = submission.groupMembers.some(
        (m) => m.toString() === req.user._id.toString()
      );
      if (!isSubmitter && !isMember) {
        throw new ApiError(403, 'Access denied. You can only view your own lab submissions.');
      }
    }

    return sendSuccess(res, {
      statusCode: 200,
      message: 'Submission details retrieved successfully.',
      data: { submission }
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Get laboratory groups for a course.
 * Route: GET /api/v1/submissions/groups
 */
const getGroups = async (req, res, next) => {
  try {
    const { courseId } = req.query;
    const query = {};
    if (courseId) query.course = courseId;

    const groups = await SubmissionGroup.find(query)
      .populate('leader', 'firstName lastName studentId email')
      .populate('members', 'firstName lastName studentId email')
      .populate('course', 'code title')
      .sort({ groupNumber: 1 })
      .lean();

    return sendSuccess(res, {
      statusCode: 200,
      message: 'Laboratory groups retrieved successfully.',
      data: { groups }
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Create a new laboratory submission group.
 * Route: POST /api/v1/submissions/groups
 */
const createGroup = async (req, res, next) => {
  try {
    const { name, course, groupNumber, members = [] } = req.body;

    if (!name || !course || !groupNumber) {
      throw new ApiError(400, 'Group name, course reference, and group number are required.');
    }

    const leaderId = req.user.role === 'STUDENT' ? req.user._id : req.body.leader;
    if (!leaderId) {
      throw new ApiError(400, 'Group leader reference is required.');
    }

    const groupMembers = members.includes(leaderId) ? members : [...members, leaderId];

    const newGroup = await SubmissionGroup.create({
      name: name.trim(),
      course,
      groupNumber: Number(groupNumber),
      leader: leaderId,
      members: groupMembers
    });

    const populated = await SubmissionGroup.findById(newGroup._id)
      .populate('leader', 'firstName lastName studentId email')
      .populate('members', 'firstName lastName studentId email')
      .populate('course', 'code title');

    return sendSuccess(res, {
      statusCode: 201,
      message: 'Laboratory group created successfully.',
      data: { group: populated }
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  submitReport,
  getSubmissions,
  getSubmissionById,
  getGroups,
  createGroup
};
