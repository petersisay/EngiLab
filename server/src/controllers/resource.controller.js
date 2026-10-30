const LearningResource = require('../models/resource.model');
const Course = require('../models/course.model');
const AuditLog = require('../models/auditLog.model');
const ApiError = require('../utils/apiError');
const { sendSuccess } = require('../utils/apiResponse');

/**
 * Get learning resources with category and course filtering.
 * Route: GET /api/v1/resources
 */
const getResources = async (req, res, next) => {
  try {
    const { courseId, category, search } = req.query;

    const query = { isActive: true };
    if (courseId) query.course = courseId;
    if (category) query.category = category.toUpperCase();

    if (search) {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [{ title: regex }, { description: regex }, { tags: regex }];
    }

    const resources = await LearningResource.find(query)
      .populate('course', 'code title department')
      .populate('uploadedBy', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .lean();

    return sendSuccess(res, {
      statusCode: 200,
      message: 'Learning resources retrieved successfully.',
      data: { resources }
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Get single learning resource by ID.
 * Route: GET /api/v1/resources/:id
 */
const getResourceById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const resource = await LearningResource.findById(id)
      .populate('course', 'code title department')
      .populate('uploadedBy', 'firstName lastName email');

    if (!resource || !resource.isActive) {
      throw new ApiError(404, 'Learning resource not found.');
    }

    return sendSuccess(res, {
      statusCode: 200,
      message: 'Learning resource details retrieved successfully.',
      data: { resource }
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Create a new learning resource.
 * Route: POST /api/v1/resources
 * Access: Super Admin, Department Admin, Instructor
 */
const createResource = async (req, res, next) => {
  try {
    const {
      title,
      description = '',
      course,
      category = 'LAB_MANUAL',
      fileUrl,
      fileName = '',
      fileType = 'application/pdf',
      fileSizeBytes = 0,
      tags = []
    } = req.body;

    if (!title || !course || !fileUrl) {
      throw new ApiError(400, 'Title, course reference, and file URL are required.');
    }

    const courseRecord = await Course.findById(course);
    if (!courseRecord) {
      throw new ApiError(404, 'Associated course not found.');
    }

    const newResource = await LearningResource.create({
      title: title.trim(),
      description: description.trim(),
      course,
      category,
      fileUrl: fileUrl.trim(),
      fileName: fileName.trim(),
      fileType,
      fileSizeBytes: Number(fileSizeBytes) || 0,
      tags: Array.isArray(tags) ? tags : [],
      uploadedBy: req.user._id,
      isActive: true
    });

    const populated = await LearningResource.findById(newResource._id)
      .populate('course', 'code title')
      .populate('uploadedBy', 'firstName lastName email');

    await AuditLog.create({
      user: req.user._id,
      role: req.user.role,
      action: 'CREATE_RESOURCE',
      resourceType: 'RESOURCE',
      resourceId: newResource._id.toString(),
      details: { title: newResource.title, course: courseRecord.code },
      ipAddress: req.ip || '',
      userAgent: req.get('user-agent') || ''
    }).catch(() => {});

    return sendSuccess(res, {
      statusCode: 201,
      message: 'Learning resource uploaded successfully.',
      data: { resource: populated }
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Update learning resource details.
 * Route: PUT /api/v1/resources/:id
 */
const updateResource = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, category, fileUrl, tags, isActive } = req.body;

    const resource = await LearningResource.findById(id);
    if (!resource) {
      throw new ApiError(404, 'Learning resource not found.');
    }

    if (title) resource.title = title.trim();
    if (description !== undefined) resource.description = description.trim();
    if (category) resource.category = category;
    if (fileUrl) resource.fileUrl = fileUrl.trim();
    if (Array.isArray(tags)) resource.tags = tags;
    if (isActive !== undefined) resource.isActive = Boolean(isActive);

    await resource.save();

    const updated = await LearningResource.findById(resource._id)
      .populate('course', 'code title')
      .populate('uploadedBy', 'firstName lastName email');

    return sendSuccess(res, {
      statusCode: 200,
      message: 'Learning resource updated successfully.',
      data: { resource: updated }
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getResources,
  getResourceById,
  createResource,
  updateResource
};
