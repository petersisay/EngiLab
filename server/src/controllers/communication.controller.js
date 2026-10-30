const Notification = require('../models/notification.model');
const Announcement = require('../models/announcement.model');
const AuditLog = require('../models/auditLog.model');
const ApiError = require('../utils/apiError');
const { sendSuccess } = require('../utils/apiResponse');

// -------------------------------------------------------------
// NOTIFICATIONS
// -------------------------------------------------------------

const getMyNotifications = async (req, res, next) => {
  try {
    const { unreadOnly } = req.query;
    const query = { recipient: req.user._id };

    if (unreadOnly === 'true') {
      query.read = false;
    }

    const [notifications, unreadCount] = await Promise.all([
      Notification.find(query)
        .populate('sender', 'firstName lastName email avatarUrl')
        .sort({ createdAt: -1 })
        .limit(50)
        .lean(),
      Notification.countDocuments({ recipient: req.user._id, read: false })
    ]);

    return sendSuccess(res, {
      statusCode: 200,
      message: 'Notifications retrieved successfully.',
      data: { notifications, unreadCount }
    });
  } catch (error) {
    return next(error);
  }
};

const markNotificationAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findOne({
      _id: id,
      recipient: req.user._id
    });

    if (!notification) {
      throw new ApiError(404, 'Notification not found.');
    }

    notification.read = true;
    await notification.save();

    return sendSuccess(res, {
      statusCode: 200,
      message: 'Notification marked as read.',
      data: { notification }
    });
  } catch (error) {
    return next(error);
  }
};

const markAllNotificationsAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      { recipient: req.user._id, read: false },
      { read: true }
    );

    return sendSuccess(res, {
      statusCode: 200,
      message: 'All notifications marked as read.',
      data: {}
    });
  } catch (error) {
    return next(error);
  }
};

// -------------------------------------------------------------
// ANNOUNCEMENTS
// -------------------------------------------------------------

const getAnnouncements = async (req, res, next) => {
  try {
    const { scope, departmentId, courseId } = req.query;

    const query = {};

    if (scope) {
      query.targetScope = scope.toUpperCase();
    } else {
      // By default: student/instructor sees GLOBAL announcements + their department announcements
      const userDeptId = req.user.department?._id || req.user.department;
      const conditions = [{ targetScope: 'GLOBAL' }];
      if (userDeptId) {
        conditions.push({ targetScope: 'DEPARTMENT', department: userDeptId });
      }
      if (courseId) {
        conditions.push({ targetScope: 'COURSE', course: courseId });
      }
      query.$or = conditions;
    }

    if (departmentId) query.department = departmentId;
    if (courseId) query.course = courseId;

    const announcements = await Announcement.find(query)
      .populate('author', 'firstName lastName email role')
      .populate('department', 'name code')
      .populate('course', 'code title')
      .sort({ isPinned: -1, createdAt: -1 })
      .lean();

    return sendSuccess(res, {
      statusCode: 200,
      message: 'Announcements retrieved successfully.',
      data: { announcements }
    });
  } catch (error) {
    return next(error);
  }
};

const createAnnouncement = async (req, res, next) => {
  try {
    const { title, content, targetScope = 'GLOBAL', department, course, isPinned } = req.body;

    if (!title || !content) {
      throw new ApiError(400, 'Announcement title and content are required.');
    }

    let targetDept = department;
    if (targetScope === 'DEPARTMENT' && req.user.role === 'DEPARTMENT_ADMIN') {
      targetDept = req.user.department?._id || req.user.department;
    }

    const newAnnouncement = await Announcement.create({
      title: title.trim(),
      content: content.trim(),
      author: req.user._id,
      targetScope,
      department: targetDept || null,
      course: course || null,
      isPinned: Boolean(isPinned)
    });

    const populated = await Announcement.findById(newAnnouncement._id)
      .populate('author', 'firstName lastName email role')
      .populate('department', 'name code')
      .populate('course', 'code title');

    await AuditLog.create({
      user: req.user._id,
      role: req.user.role,
      action: 'CREATE_ANNOUNCEMENT',
      resourceType: 'ANNOUNCEMENT',
      resourceId: newAnnouncement._id.toString(),
      details: { title: newAnnouncement.title, scope: targetScope },
      ipAddress: req.ip || '',
      userAgent: req.get('user-agent') || ''
    }).catch(() => {});

    return sendSuccess(res, {
      statusCode: 201,
      message: 'Announcement published successfully.',
      data: { announcement: populated }
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getMyNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getAnnouncements,
  createAnnouncement
};
