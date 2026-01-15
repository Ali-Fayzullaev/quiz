// backend/src/routes/notificationRoutes.js
const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { authenticate } = require('../middleware/auth');

// Все роуты защищены
router.use(authenticate);

// Получить уведомления
router.get('/', notificationController.getNotifications);

// Получить количество непрочитанных
router.get('/unread-count', notificationController.getUnreadCount);

// Отметить все как прочитанные
router.put('/read-all', notificationController.markAllAsRead);

// Удалить все прочитанные
router.delete('/read', notificationController.deleteAllRead);

// Отметить уведомление как прочитанное
router.put('/:notificationId/read', notificationController.markAsRead);

// Удалить уведомление
router.delete('/:notificationId', notificationController.deleteNotification);

module.exports = router;
