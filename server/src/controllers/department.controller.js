const Department = require('../models/department.model');
const Course = require('../models/course.model');
const User = require('../models/user.model');
const AuditLog = require('../models/auditLog.model');
const ApiError = require('../utils/apiError');
const { sendSuccess } = require('../utils/apiResponse');

/**
 * Get all active academic departments.
 * Route: GET /api/v1/departments
 * Access: Public / Authenticated
 */
const getDepartments = async (req, res, next) => {
  try {
    const { includeInactive } = req.query;

    const query = {};
    if (includeInactive !== 'true' || !req.user || req.user.role !== 'SUPER_ADMIN') {
      query.isActive = true;
    }

    const departments = await Department.find(query)
      .populate('headOfDepartment', 'firstName lastName email')
      .sort({ name: 1 })
      .lean();

    // Enrich departments with active course counts
    const enriched = await Promise.all(
      departments.map(async (dept) => {
        const courseCount = await Course.countDocuments({
          department: dept._id,
          isActive: true
        });
        const facultyCount = await User.countDocuments({
          department: dept._id,
          role: { $in: ['DEPARTMENT_ADMIN', 'INSTRUCTOR'] },
          isActive: true
        });
        return {
          ...dept,
          courseCount,
          facultyCount
        };
      })
    );

    return sendSuccess(res, {
      statusCode: 200,
      message: 'Departments retrieved successfully.',
      data: { departments: enriched }
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Get single department by ID or slug.
 * Route: GET /api/v1/departments/:idOrSlug
 */
const getDepartmentById = async (req, res, next) => {
  try {
    const { idOrSlug } = req.params;

    const isObjectId = idOrSlug.match(/^[0-9a-fA-F]{24}$/);
    const query = isObjectId ? { _id: idOrSlug } : { slug: idOrSlug.toLowerCase() };

    const department = await Department.findOne(query)
      .populate('headOfDepartment', 'firstName lastName email');

    if (!department) {
      throw new ApiError(404, 'Academic department not found.');
    }

    const courses = await Course.find({ department: department._id, isActive: true })
      .populate('coordinator', 'firstName lastName email')
      .lean();

    return sendSuccess(res, {
      statusCode: 200,
      message: 'Department details retrieved successfully.',
      data: {
        department,
        courses
      }
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Create a new academic department.
 * Route: POST /api/v1/departments
 * Access: Super Admin only
 */
const createDepartment = async (req, res, next) => {
  try {
    const { name, code, slug, description, headOfDepartment, labs } = req.body;

    if (!name || !code) {
      throw new ApiError(400, 'Department name and department code are required.');
    }

    const normalizedCode = code.toUpperCase().trim();
    const existingCode = await Department.findOne({ code: normalizedCode });
    if (existingCode) {
      throw new ApiError(409, `Department with code '${normalizedCode}' already exists.`);
    }

    const generatedSlug = slug ? slug.toLowerCase().trim() : normalizedCode.toLowerCase();
    const existingSlug = await Department.findOne({ slug: generatedSlug });
    if (existingSlug) {
      throw new ApiError(409, `Department with slug '${generatedSlug}' already exists.`);
    }

    const newDept = await Department.create({
      name: name.trim(),
      code: normalizedCode,
      slug: generatedSlug,
      description: description ? description.trim() : '',
      headOfDepartment: headOfDepartment || null,
      labs: Array.isArray(labs) ? labs : [],
      isActive: true
    });

    const populatedDept = await Department.findById(newDept._id).populate(
      'headOfDepartment',
      'firstName lastName email'
    );

    await AuditLog.create({
      user: req.user._id,
      role: req.user.role,
      action: 'CREATE_DEPARTMENT',
      resourceType: 'DEPARTMENT',
      resourceId: newDept._id.toString(),
      details: { name: newDept.name, code: newDept.code },
      ipAddress: req.ip || '',
      userAgent: req.get('user-agent') || ''
    }).catch(() => {});

    return sendSuccess(res, {
      statusCode: 201,
      message: 'Department created successfully.',
      data: { department: populatedDept }
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Update department details.
 * Route: PUT /api/v1/departments/:id
 * Access: Super Admin, Department Admin (own department)
 */
const updateDepartment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, headOfDepartment, labs, isActive } = req.body;

    const department = await Department.findById(id);
    if (!department) {
      throw new ApiError(404, 'Department not found.');
    }

    if (name) department.name = name.trim();
    if (description !== undefined) department.description = description.trim();
    if (headOfDepartment !== undefined) department.headOfDepartment = headOfDepartment || null;
    if (Array.isArray(labs)) department.labs = labs;
    if (isActive !== undefined && req.user.role === 'SUPER_ADMIN') {
      department.isActive = Boolean(isActive);
    }

    await department.save();

    const updatedDept = await Department.findById(department._id).populate(
      'headOfDepartment',
      'firstName lastName email'
    );

    await AuditLog.create({
      user: req.user._id,
      role: req.user.role,
      action: 'UPDATE_DEPARTMENT',
      resourceType: 'DEPARTMENT',
      resourceId: department._id.toString(),
      details: { name: department.name, code: department.code },
      ipAddress: req.ip || '',
      userAgent: req.get('user-agent') || ''
    }).catch(() => {});

    return sendSuccess(res, {
      statusCode: 200,
      message: 'Department updated successfully.',
      data: { department: updatedDept }
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment
};
