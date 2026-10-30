const express = require('express');
const {
  getMyNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getAnnouncements,
  createAnnouncement
} = require('../controllers/communication.controller');
const authenticate = require('../middleware/auth.middleware');
const authorizeRoles = require('../middleware/role.middleware');

const router = express.Router();

router.use(authenticate);

// -------------------------------------------------------------
// NOTIFICATIONS
// -------------------------------------------------------------
router.get('/notifications', getMyNotifications);
router.patch('/notifications/:id/read', markNotificationAsRead);
router.patch('/notifications/read-all', markAllNotificationsAsRead);

// -------------------------------------------------------------
// ANNOUNCEMENTS
// -------------------------------------------------------------
router.get('/announcements', getAnnouncements);
router.post(
  '/announcements',
  authorizeRoles('SUPER_ADMIN', 'DEPARTMENT_ADMIN', 'INSTRUCTOR'),
  createAnnouncement
);

module.exports = router;
