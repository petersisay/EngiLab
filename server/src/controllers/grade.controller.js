const Grade = require('../models/grade.model');
const Submission = require('../models/submission.model');
const LaboratoryExercise = require('../models/exercise.model');
const Notification = require('../models/notification.model');
const AuditLog = require('../models/auditLog.model');
const ApiError = require('../utils/apiError');
const { sendSuccess } = require('../utils/apiResponse');

/**
 * Grade a laboratory exercise submission.
 * Route: POST /api/v1/grades/submission/:submissionId
 * Access: Super Admin, Department Admin, Instructor
 */
const gradeSubmission = async (req, res, next) => {
  try {
    const { submissionId } = req.params;
    const {
      score,
      rubricBreakdown = [],
      feedback = '',
      strengths = '',
      improvements = '',
      status = 'GRADED',
      isPublished = true
    } = req.body;

    if (score === undefined || score === null) {
      throw new ApiError(400, 'Grade score is required.');
    }

    const submission = await Submission.findById(submissionId)
      .populate('exercise')
      .populate('course');

    if (!submission) {
      throw new ApiError(404, 'Submission record not found.');
    }

    const maxScore = submission.exercise.maxScore || 100;
    const numericScore = Number(score);

    if (numericScore < 0 || numericScore > maxScore) {
      throw new ApiError(
        400,
        `Score must be between 0 and maximum exercise score (${maxScore}).`
      );
    }

    // Verify existing grade
    let grade = await Grade.findOne({ submission: submissionId });

    if (grade) {
      grade.score = numericScore;
      grade.maxScore = maxScore;
      grade.rubricBreakdown = rubricBreakdown;
      grade.feedback = feedback.trim();
      grade.strengths = strengths.trim();
      grade.improvements = improvements.trim();
      grade.gradedBy = req.user._id;
      grade.gradedAt = new Date();
      grade.isPublished = Boolean(isPublished);
      await grade.save();
    } else {
      grade = await Grade.create({
        submission: submissionId,
        exercise: submission.exercise._id,
        course: submission.course._id,
        student: submission.submittedBy,
        score: numericScore,
        maxScore,
        rubricBreakdown,
        feedback: feedback.trim(),
        strengths: strengths.trim(),
        improvements: improvements.trim(),
        gradedBy: req.user._id,
        gradedAt: new Date(),
        isPublished: Boolean(isPublished)
      });
    }

    // Link grade on submission and update status
    submission.grade = grade._id;
    submission.status = status === 'RESUBMISSION_REQUESTED' ? 'RESUBMISSION_REQUESTED' : 'GRADED';
    await submission.save();

    // Notify submitter and group members if published
    if (isPublished) {
      const recipientIds = [
        submission.submittedBy,
        ...(submission.groupMembers || [])
      ].filter((id, idx, arr) => arr.findIndex((x) => x.toString() === id.toString()) === idx);

      const notifications = recipientIds.map((recipientId) => ({
        recipient: recipientId,
        sender: req.user._id,
        title: 'Laboratory Report Graded',
        message: `Your lab report for ${submission.exercise.title} has been evaluated. Score: ${numericScore}/${maxScore}.`,
        type: 'GRADE',
        link: `/student/submissions/${submission._id}`,
        read: false
      }));

      await Notification.insertMany(notifications).catch(() => {});
    }

    await AuditLog.create({
      user: req.user._id,
      role: req.user.role,
      action: 'GRADE_SUBMISSION',
      resourceType: 'GRADE',
      resourceId: grade._id.toString(),
      details: {
        submissionId: submission._id,
        exercise: submission.exercise.title,
        score: numericScore,
        maxScore
      },
      ipAddress: req.ip || '',
      userAgent: req.get('user-agent') || ''
    }).catch(() => {});

    const populatedGrade = await Grade.findById(grade._id)
      .populate('gradedBy', 'firstName lastName email')
      .populate('student', 'firstName lastName studentId email');

    return sendSuccess(res, {
      statusCode: 200,
      message: 'Laboratory submission graded successfully.',
      data: { grade: populatedGrade, submission }
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Get grade for a given submission.
 * Route: GET /api/v1/grades/submission/:submissionId
 */
const getGradeBySubmission = async (req, res, next) => {
  try {
    const { submissionId } = req.params;

    const grade = await Grade.findOne({ submission: submissionId })
      .populate('gradedBy', 'firstName lastName email')
      .populate('student', 'firstName lastName studentId email')
      .populate('exercise', 'title exerciseNumber maxScore rubric');

    if (!grade) {
      throw new ApiError(404, 'Grade record not found for this submission.');
    }

    if (req.user.role === 'STUDENT') {
      if (!grade.isPublished) {
        throw new ApiError(403, 'Grade evaluation is currently being finalized.');
      }
      if (grade.student._id.toString() !== req.user._id.toString()) {
        throw new ApiError(403, 'Access denied. You can only view your own grades.');
      }
    }

    return sendSuccess(res, {
      statusCode: 200,
      message: 'Grade retrieved successfully.',
      data: { grade }
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Get course grade statistics and distribution.
 * Route: GET /api/v1/grades/course/:courseId/summary
 */
const getCourseGradeSummary = async (req, res, next) => {
  try {
    const { courseId } = req.params;

    const grades = await Grade.find({ course: courseId, isPublished: true }).lean();

    if (grades.length === 0) {
      return sendSuccess(res, {
        statusCode: 200,
        message: 'No grades published for this course yet.',
        data: {
          summary: {
            totalGraded: 0,
            averageScore: 0,
            highestScore: 0,
            lowestScore: 0,
            passingRate: 0
          }
        }
      });
    }

    const totalGraded = grades.length;
    const scores = grades.map((g) => (g.score / g.maxScore) * 100);
    const sum = scores.reduce((a, b) => a + b, 0);
    const averageScore = Math.round((sum / totalGraded) * 10) / 10;
    const highestScore = Math.round(Math.max(...scores) * 10) / 10;
    const lowestScore = Math.round(Math.min(...scores) * 10) / 10;
    const passingCount = scores.filter((s) => s >= 50).length;
    const passingRate = Math.round((passingCount / totalGraded) * 100);

    return sendSuccess(res, {
      statusCode: 200,
      message: 'Course grade summary retrieved successfully.',
      data: {
        summary: {
          totalGraded,
          averageScore,
          highestScore,
          lowestScore,
          passingRate
        }
      }
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  gradeSubmission,
  getGradeBySubmission,
  getCourseGradeSummary
};
