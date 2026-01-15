// backend/src/models/Notification.js
const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  type: {
    type: String,
    enum: [
      'friend_request',      // Заявка в друзья
      'friend_accepted',     // Заявка принята
      'comment',             // Комментарий к квизу
      'comment_reply',       // Ответ на комментарий
      'quiz_like',           // Лайк квиза
      'quiz_completed',      // Кто-то прошёл ваш квиз
      'achievement',         // Получено достижение
      'level_up',            // Повышение уровня
      'streak',              // Серия дней
      'vocabulary_shared',   // Словарь поделился
      'system'               // Системное уведомление
    ],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  // Связанные объекты
  relatedQuiz: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz'
  },
  relatedComment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment'
  },
  relatedVocabulary: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vocabulary'
  },
  // Статусы
  read: {
    type: Boolean,
    default: false
  },
  actionUrl: {
    type: String  // URL для перехода при клике
  },
  // Метаданные
  metadata: {
    type: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

// Индексы для быстрого поиска
notificationSchema.index({ recipient: 1, read: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, createdAt: -1 });

// Автоматическое удаление старых уведомлений (старше 30 дней)
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

// Статический метод для создания уведомления
notificationSchema.statics.createNotification = async function(data) {
  // Не создаём уведомление если отправитель = получатель
  if (data.sender && data.recipient && data.sender.toString() === data.recipient.toString()) {
    return null;
  }
  
  const notification = new this(data);
  await notification.save();
  return notification;
};

// Метод для получения непрочитанных уведомлений
notificationSchema.statics.getUnreadCount = async function(userId) {
  return this.countDocuments({ recipient: userId, read: false });
};

module.exports = mongoose.model('Notification', notificationSchema);
