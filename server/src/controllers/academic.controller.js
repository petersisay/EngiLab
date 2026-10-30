const AcademicYear = require('../models/academicYear.model');
const Semester = require('../models/semester.model');
const Course = require('../models/course.model');
const CourseEnrollment = require('../models/enrollment.model');
const User = require('../models/user.model');
const LaboratoryExercise = require('../models/exercise.model');
const AuditLog = require('../models/auditLog.model');
const ApiError = require('../utils/apiError');
const { sendSuccess } = require('../utils/apiResponse');

// -------------------------------------------------------------
// ACADEMIC YEARS
// -------------------------------------------------------------

const getAcademicYears = async (req, res, next) => {
  try {
    const years = await AcademicYear.find().sort({ startDate: -1 }).lean();
    return sendSuccess(res, {
      statusCode: 200,
      message: 'Academic years retrieved successfully.',
      data: { academicYears: years }
    });
  } catch (error) {
    return next(error);
  }
};

const createAcademicYear = async (req, res, next) => {
  try {
    const { year, startDate, endDate, isCurrent } = req.body;

    if (!year || !startDate || !endDate) {
      throw new ApiError(400, 'Year string, start date, and end date are required.');
    }

    const existing = await AcademicYear.findOne({ year: year.trim() });
    if (existing) {
      throw new ApiError(409, `Academic year '${year}' already exists.`);
    }

    if (isCurrent) {
      await AcademicYear.updateMany({}, { isCurrent: false });
    }

    const newYear = await AcademicYear.create({
      year: year.trim(),
      startDate,
      endDate,
      isCurrent: Boolean(isCurrent)
    });

    return sendSuccess(res, {
      statusCode: 201,
      message: 'Academic year created successfully.',
      data: { academicYear: newYear }
    });
  } catch (error) {
    return next(error);
  }
};

const setCurrentAcademicYear = async (req, res, next) => {
  try {
    const { id } = req.params;
    const target = await AcademicYear.findById(id);
    if (!target) {
      throw new ApiError(404, 'Academic year not found.');
    }

    await AcademicYear.updateMany({}, { isCurrent: false });
    target.isCurrent = true;
    await target.save();

    return sendSuccess(res, {
      statusCode: 200,
      message: `Academic year '${target.year}' set as current active year.`,
      data: { academicYear: target }
    });
  } catch (error) {
    return next(error);
  }
};

// -------------------------------------------------------------
// SEMESTERS
// -------------------------------------------------------------

const getSemesters = async (req, res, next) => {
  try {
    const { academicYear } = req.query;
    const query = {};
    if (academicYear) query.academicYear = academicYear;

    const semesters = await Semester.find(query)
      .populate('academicYear', 'year isCurrent')
      .sort({ startDate: -1 })
      .lean();

    return sendSuccess(res, {
      statusCode: 200,
      message: 'Semesters retrieved successfully.',
      data: { semesters }
    });
  } catch (error) {
    return next(error);
  }
};

const createSemester = async (req, res, next) => {
  try {
    const { name, academicYear, term, startDate, endDate, isCurrent } = req.body;

    if (!name || !academicYear || !term || !startDate || !endDate) {
      throw new ApiError(400, 'Name, academic year, term, and valid date bounds are required.');
    }

    if (isCurrent) {
      await Semester.updateMany({}, { isCurrent: false });
    }

    const newSemester = await Semester.create({
      name: name.trim(),
      academicYear,
      term,
      startDate,
      endDate,
      isCurrent: Boolean(isCurrent)
    });

    const populated = await Semester.findById(newSemester._id).populate(
      'academicYear',
      'year isCurrent'
    );

    return sendSuccess(res, {
      statusCode: 201,
      message: 'Semester created successfully.',
      data: { semester: populated }
    });
  } catch (error) {
    return next(error);
  }
};

// -------------------------------------------------------------
// COURSES
// -------------------------------------------------------------

const getCourses = async (req, res, next) => {
  try {
    const { department, semester, search, isActive } = req.query;
    const query = {};

    if (req.user && req.user.role === 'DEPARTMENT_ADMIN') {
      const userDeptId = req.user.department?._id || req.user.department;
      query.department = userDeptId;
    } else if (department) {
      query.department = department;
    }

    if (semester) query.semester = semester;
    if (isActive !== undefined) query.isActive = isActive === 'true';

    // If instructor requesting, optionally filter to their courses
    if (req.user && req.user.role === 'INSTRUCTOR' && req.query.mine === 'true') {
      query.instructors = req.user._id;
    }

    if (search) {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [{ code: regex }, { title: regex }];
    }

    const courses = await Course.find(query)
      .populate('department', 'name code slug')
      .populate('semester', 'name term')
      .populate('coordinator', 'firstName lastName email')
      .populate('instructors', 'firstName lastName email')
      .sort({ code: 1 })
      .lean();

    return sendSuccess(res, {
      statusCode: 200,
      message: 'Courses retrieved successfully.',
      data: { courses }
    });
  } catch (error) {
    return next(error);
  }
};

const getCourseById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const course = await Course.findById(id)
      .populate('department', 'name code slug')
      .populate('semester', 'name term')
      .populate('coordinator', 'firstName lastName email')
      .populate('instructors', 'firstName lastName email');

    if (!course) {
      throw new ApiError(404, 'Course not found.');
    }

    // Include exercises and enrollment count
    const [exercises, enrollmentCount] = await Promise.all([
      LaboratoryExercise.find({ course: course._id, isPublished: true })
        .sort({ orderIndex: 1, weekNumber: 1 })
        .lean(),
      CourseEnrollment.countDocuments({ course: course._id, status: 'ENROLLED' })
    ]);

    return sendSuccess(res, {
      statusCode: 200,
      message: 'Course details retrieved successfully.',
      data: {
        course,
        exercises,
        enrollmentCount
      }
    });
  } catch (error) {
    return next(error);
  }
};

const createCourse = async (req, res, next) => {
  try {
    const {
      code,
      title,
      description,
      department,
      semester,
      credits,
      coordinator,
      instructors,
      prerequisites
    } = req.body;

    if (!code || !title || !department || !semester) {
      throw new ApiError(400, 'Course code, title, department, and semester are required.');
    }

    let targetDept = department;
    if (req.user.role === 'DEPARTMENT_ADMIN') {
      targetDept = req.user.department?._id || req.user.department;
    }

    const normalizedCode = code.toUpperCase().trim();
    const existing = await Course.findOne({
      code: normalizedCode,
      semester
    });

    if (existing) {
      throw new ApiError(
        409,
        `Course with code '${normalizedCode}' is already registered for this semester.`
      );
    }

    const newCourse = await Course.create({
      code: normalizedCode,
      title: title.trim(),
      description: description ? description.trim() : '',
      department: targetDept,
      semester,
      credits: Number(credits) || 3,
      coordinator: coordinator || req.user._id,
      instructors: Array.isArray(instructors) ? instructors : [coordinator || req.user._id],
      prerequisites: Array.isArray(prerequisites) ? prerequisites : [],
      isActive: true
    });

    const populated = await Course.findById(newCourse._id)
      .populate('department', 'name code slug')
      .populate('semester', 'name term')
      .populate('coordinator', 'firstName lastName email')
      .populate('instructors', 'firstName lastName email');

    await AuditLog.create({
      user: req.user._id,
      role: req.user.role,
      action: 'CREATE_COURSE',
      resourceType: 'COURSE',
      resourceId: newCourse._id.toString(),
      details: { code: newCourse.code, title: newCourse.title, department: targetDept },
      ipAddress: req.ip || '',
      userAgent: req.get('user-agent') || ''
    }).catch(() => {});

    return sendSuccess(res, {
      statusCode: 201,
      message: 'Course created successfully.',
      data: { course: populated }
    });
  } catch (error) {
    return next(error);
  }
};

const updateCourse = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      credits,
      coordinator,
      instructors,
      prerequisites,
      isActive
    } = req.body;

    const course = await Course.findById(id);
    if (!course) {
      throw new ApiError(404, 'Course not found.');
    }

    if (req.user.role === 'DEPARTMENT_ADMIN') {
      const userDeptId = (req.user.department?._id || req.user.department)?.toString();
      if (course.department.toString() !== userDeptId) {
        throw new ApiError(403, 'Access denied. You can only manage courses in your department.');
      }
    }

    if (title) course.title = title.trim();
    if (description !== undefined) course.description = description.trim();
    if (credits !== undefined) course.credits = Number(credits);
    if (coordinator) course.coordinator = coordinator;
    if (Array.isArray(instructors)) course.instructors = instructors;
    if (Array.isArray(prerequisites)) course.prerequisites = prerequisites;
    if (isActive !== undefined) course.isActive = Boolean(isActive);

    await course.save();

    const updated = await Course.findById(course._id)
      .populate('department', 'name code slug')
      .populate('semester', 'name term')
      .populate('coordinator', 'firstName lastName email')
      .populate('instructors', 'firstName lastName email');

    return sendSuccess(res, {
      statusCode: 200,
      message: 'Course updated successfully.',
      data: { course: updated }
    });
  } catch (error) {
    return next(error);
  }
};

// -------------------------------------------------------------
// ENROLLMENTS
// -------------------------------------------------------------

const getCourseEnrollments = async (req, res, next) => {
  try {
    const { courseId } = req.params;

    const enrollments = await CourseEnrollment.find({ course: courseId })
      .populate('student', 'firstName lastName email studentId phone avatarUrl')
      .sort({ enrolledAt: -1 })
      .lean();

    return sendSuccess(res, {
      statusCode: 200,
      message: 'Course enrollments retrieved successfully.',
      data: { enrollments }
    });
  } catch (error) {
    return next(error);
  }
};

const enrollStudent = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const { studentId } = req.body;

    const targetStudentId = studentId || (req.user.role === 'STUDENT' ? req.user._id : null);
    if (!targetStudentId) {
      throw new ApiError(400, 'Student ID reference is required for enrollment.');
    }

    const course = await Course.findById(courseId);
    if (!course || !course.isActive) {
      throw new ApiError(404, 'Active course not found.');
    }

    const student = await User.findById(targetStudentId);
    if (!student || student.role !== 'STUDENT') {
      throw new ApiError(400, 'Valid student record is required.');
    }

    // Verify existing enrollment
    const existing = await CourseEnrollment.findOne({
      course: courseId,
      student: targetStudentId
    });

    if (existing) {
      if (existing.status === 'ENROLLED') {
        throw new ApiError(409, 'Student is already enrolled in this course.');
      }
      existing.status = 'ENROLLED';
      existing.enrolledAt = new Date();
      await existing.save();
      return sendSuccess(res, {
        statusCode: 200,
        message: 'Student re-enrolled successfully.',
        data: { enrollment: existing }
      });
    }

    const enrollment = await CourseEnrollment.create({
      course: courseId,
      student: targetStudentId,
      status: 'ENROLLED',
      enrolledAt: new Date()
    });

    const populated = await CourseEnrollment.findById(enrollment._id)
      .populate('course', 'code title')
      .populate('student', 'firstName lastName studentId email');

    return sendSuccess(res, {
      statusCode: 201,
      message: 'Student enrolled in course successfully.',
      data: { enrollment: populated }
    });
  } catch (error) {
    return next(error);
  }
};

const getMyEnrolledCourses = async (req, res, next) => {
  try {
    const enrollments = await CourseEnrollment.find({
      student: req.user._id,
      status: 'ENROLLED'
    })
      .populate({
        path: 'course',
        populate: [
          { path: 'department', select: 'name code slug' },
          { path: 'semester', select: 'name term' },
          { path: 'coordinator', select: 'firstName lastName email' }
        ]
      })
      .sort({ enrolledAt: -1 })
      .lean();

    // Enrich with exercise counts
    const enriched = await Promise.all(
      enrollments.map(async (item) => {
        if (!item.course) return item;
        const totalExercises = await LaboratoryExercise.countDocuments({
          course: item.course._id,
          isPublished: true
        });
        return {
          ...item,
          totalExercises
        };
      })
    );

    return sendSuccess(res, {
      statusCode: 200,
      message: 'Enrolled courses retrieved successfully.',
      data: { enrollments: enriched }
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
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
};
