// backend/src/controllers/notificationController.js
const Notification = require('../models/Notification');
const User = require('../models/User');

// Получить все уведомления пользователя
exports.getNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 20, unreadOnly = false } = req.query;
    const skip = (page - 1) * limit;
    
    const query = { recipient: req.user._id };
    if (unreadOnly === 'true') {
      query.read = false;
    }
    
    const notifications = await Notification.find(query)
      .populate('sender', 'username profile.avatar')
      .populate('relatedQuiz', 'title thumbnail')
      .populate('relatedVocabulary', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.getUnreadCount(req.user._id);
    
    res.json({
      success: true,
      data: {
        notifications,
        unreadCount,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error getting notifications:', error);
    res.status(500).json({ success: false, error: 'Ошибка получения уведомлений' });
  }
};

// Получить количество непрочитанных
exports.getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.getUnreadCount(req.user._id);
    res.json({ success: true, data: { count } });
  } catch (error) {
    console.error('Error getting unread count:', error);
    res.status(500).json({ success: false, error: 'Ошибка' });
  }
};

// Отметить уведомление как прочитанное
exports.markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    
    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, recipient: req.user._id },
      { read: true },
      { new: true }
    );
    
    if (!notification) {
      return res.status(404).json({ success: false, error: 'Уведомление не найдено' });
    }
    
    const unreadCount = await Notification.getUnreadCount(req.user._id);
    
    res.json({ 
      success: true, 
      data: { notification, unreadCount } 
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ success: false, error: 'Ошибка' });
  }
};

// Отметить все как прочитанные
exports.markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user._id, read: false },
      { read: true }
    );
    
    res.json({ success: true, message: 'Все уведомления прочитаны' });
  } catch (error) {
    console.error('Error marking all as read:', error);
    res.status(500).json({ success: false, error: 'Ошибка' });
  }
};

// Удалить уведомление
exports.deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;
    
    const notification = await Notification.findOneAndDelete({
      _id: notificationId,
      recipient: req.user._id
    });
    
    if (!notification) {
      return res.status(404).json({ success: false, error: 'Уведомление не найдено' });
    }
    
    res.json({ success: true, message: 'Уведомление удалено' });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ success: false, error: 'Ошибка' });
  }
};

// Удалить все прочитанные
exports.deleteAllRead = async (req, res) => {
  try {
    await Notification.deleteMany({
      recipient: req.user._id,
      read: true
    });
    
    res.json({ success: true, message: 'Прочитанные уведомления удалены' });
  } catch (error) {
    console.error('Error deleting read notifications:', error);
    res.status(500).json({ success: false, error: 'Ошибка' });
  }
};

// ===== ХЕЛПЕРЫ ДЛЯ СОЗДАНИЯ УВЕДОМЛЕНИЙ =====

// Уведомление о заявке в друзья
exports.createFriendRequestNotification = async (senderId, recipientId) => {
  try {
    const sender = await User.findById(senderId).select('username');
    if (!sender) return;
    
    await Notification.createNotification({
      recipient: recipientId,
      sender: senderId,
      type: 'friend_request',
      title: 'Новая заявка в друзья',
      message: `${sender.username} хочет добавить вас в друзья`,
      actionUrl: '/friends?tab=requests'
    });
  } catch (error) {
    console.error('Error creating friend request notification:', error);
  }
};

// Уведомление о принятии заявки
exports.createFriendAcceptedNotification = async (senderId, recipientId) => {
  try {
    const sender = await User.findById(senderId).select('username');
    if (!sender) return;
    
    await Notification.createNotification({
      recipient: recipientId,
      sender: senderId,
      type: 'friend_accepted',
      title: 'Заявка принята',
      message: `${sender.username} принял(а) вашу заявку в друзья`,
      actionUrl: '/friends'
    });
  } catch (error) {
    console.error('Error creating friend accepted notification:', error);
  }
};

// Уведомление о комментарии к квизу
exports.createCommentNotification = async (senderId, quizOwnerId, quizId, quizTitle) => {
  try {
    const sender = await User.findById(senderId).select('username');
    if (!sender) return;
    
    await Notification.createNotification({
      recipient: quizOwnerId,
      sender: senderId,
      type: 'comment',
      title: 'Новый комментарий',
      message: `${sender.username} оставил(а) комментарий к вашему квизу "${quizTitle}"`,
      relatedQuiz: quizId,
      actionUrl: `/quiz/${quizId}`
    });
  } catch (error) {
    console.error('Error creating comment notification:', error);
  }
};

// Уведомление об ответе на комментарий
exports.createCommentReplyNotification = async (senderId, originalCommenterId, quizId, quizTitle) => {
  try {
    const sender = await User.findById(senderId).select('username');
    if (!sender) return;
    
    await Notification.createNotification({
      recipient: originalCommenterId,
      sender: senderId,
      type: 'comment_reply',
      title: 'Ответ на комментарий',
      message: `${sender.username} ответил(а) на ваш комментарий в квизе "${quizTitle}"`,
      relatedQuiz: quizId,
      actionUrl: `/quiz/${quizId}`
    });
  } catch (error) {
    console.error('Error creating comment reply notification:', error);
  }
};

// Уведомление о лайке квиза
exports.createQuizLikeNotification = async (senderId, quizOwnerId, quizId, quizTitle) => {
  try {
    const sender = await User.findById(senderId).select('username');
    if (!sender) return;
    
    await Notification.createNotification({
      recipient: quizOwnerId,
      sender: senderId,
      type: 'quiz_like',
      title: 'Новый лайк',
      message: `${sender.username} понравился ваш квиз "${quizTitle}"`,
      relatedQuiz: quizId,
      actionUrl: `/quiz/${quizId}`
    });
  } catch (error) {
    console.error('Error creating quiz like notification:', error);
  }
};

// Уведомление о прохождении квиза
exports.createQuizCompletedNotification = async (senderId, quizOwnerId, quizId, quizTitle, score) => {
  try {
    const sender = await User.findById(senderId).select('username');
    if (!sender) return;
    
    await Notification.createNotification({
      recipient: quizOwnerId,
      sender: senderId,
      type: 'quiz_completed',
      title: 'Квиз пройден',
      message: `${sender.username} прошёл(а) ваш квиз "${quizTitle}" с результатом ${score}%`,
      relatedQuiz: quizId,
      actionUrl: `/quiz/${quizId}/stats`,
      metadata: { score }
    });
  } catch (error) {
    console.error('Error creating quiz completed notification:', error);
  }
};

// Уведомление о достижении
exports.createAchievementNotification = async (userId, achievementName, achievementDescription) => {
  try {
    await Notification.createNotification({
      recipient: userId,
      type: 'achievement',
      title: 'Новое достижение!',
      message: `Вы получили достижение "${achievementName}": ${achievementDescription}`,
      actionUrl: '/achievements'
    });
  } catch (error) {
    console.error('Error creating achievement notification:', error);
  }
};

// Уведомление о повышении уровня
exports.createLevelUpNotification = async (userId, newLevel, levelName) => {
  try {
    await Notification.createNotification({
      recipient: userId,
      type: 'level_up',
      title: 'Новый уровень!',
      message: `Поздравляем! Вы достигли уровня ${newLevel}: ${levelName}`,
      actionUrl: '/profile',
      metadata: { level: newLevel, levelName }
    });
  } catch (error) {
    console.error('Error creating level up notification:', error);
  }
};

// Уведомление о серии дней
exports.createStreakNotification = async (userId, streakDays) => {
  try {
    const milestones = [3, 7, 14, 30, 50, 100, 365];
    if (!milestones.includes(streakDays)) return;
    
    await Notification.createNotification({
      recipient: userId,
      type: 'streak',
      title: 'Серия дней!',
      message: `Отличная работа! Вы занимаетесь ${streakDays} дней подряд 🔥`,
      actionUrl: '/profile',
      metadata: { streakDays }
    });
  } catch (error) {
    console.error('Error creating streak notification:', error);
  }
};

module.exports = exports;
