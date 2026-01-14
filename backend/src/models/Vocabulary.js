const mongoose = require('mongoose');

// Схема для отдельного слова
const wordSchema = new mongoose.Schema({
  word: {
    type: String,
    required: [true, 'Слово обязательно'],
    trim: true
  },
  translation: {
    type: String,
    required: [true, 'Перевод обязателен'],
    trim: true
  },
  transcription: {
    type: String,
    trim: true
  },
  example: {
    type: String,
    trim: true,
    maxlength: [500, 'Пример не должен превышать 500 символов']
  },
  imageUrl: {
    type: String
  },
  audioUrl: {
    type: String
  },
  // Статистика изучения
  learned: {
    type: Boolean,
    default: false
  },
  correctCount: {
    type: Number,
    default: 0
  },
  incorrectCount: {
    type: Number,
    default: 0
  },
  lastReviewed: {
    type: Date
  },
  nextReview: {
    type: Date
  },
  // Уровень запоминания (для интервального повторения)
  memoryLevel: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  }
}, { timestamps: true });

// Схема для словаря
const vocabularySchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Название словаря обязательно'],
    trim: true,
    maxlength: [100, 'Название не должно превышать 100 символов']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Описание не должно превышать 500 символов']
  },
  // Язык оригинала и перевода
  sourceLanguage: {
    type: String,
    default: 'en',
    enum: ['en', 'ru', 'de', 'fr', 'es', 'it', 'zh', 'ja', 'ko', 'ar', 'pt', 'other']
  },
  targetLanguage: {
    type: String,
    default: 'ru',
    enum: ['en', 'ru', 'de', 'fr', 'es', 'it', 'zh', 'ja', 'ko', 'ar', 'pt', 'other']
  },
  // Категория/тема словаря
  category: {
    type: String,
    enum: ['general', 'business', 'travel', 'food', 'technology', 'science', 'medicine', 'law', 'sport', 'music', 'art', 'nature', 'custom'],
    default: 'general'
  },
  // Слова в словаре
  words: [wordSchema],
  // Владелец словаря
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Публичный или приватный
  isPublic: {
    type: Boolean,
    default: false
  },
  // Цвет/тема для UI
  color: {
    type: String,
    default: 'purple',
    enum: ['purple', 'blue', 'green', 'red', 'orange', 'pink', 'teal', 'indigo']
  },
  // Иконка
  icon: {
    type: String,
    default: 'book'
  },
  // Статистика
  stats: {
    totalWords: {
      type: Number,
      default: 0
    },
    learnedWords: {
      type: Number,
      default: 0
    },
    totalReviews: {
      type: Number,
      default: 0
    },
    lastStudied: {
      type: Date
    }
  },
  // Кто добавил в избранное (для публичных словарей)
  favorites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  // Кто скопировал словарь
  forks: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Индексы для поиска
vocabularySchema.index({ owner: 1 });
vocabularySchema.index({ isPublic: 1 });
vocabularySchema.index({ title: 'text', description: 'text' });
vocabularySchema.index({ category: 1 });
vocabularySchema.index({ 'words.word': 'text', 'words.translation': 'text' });

// Виртуальное поле для прогресса
vocabularySchema.virtual('progress').get(function() {
  if (this.stats.totalWords === 0) return 0;
  return Math.round((this.stats.learnedWords / this.stats.totalWords) * 100);
});

// Обновление статистики перед сохранением
vocabularySchema.pre('save', function(next) {
  this.stats.totalWords = this.words.length;
  this.stats.learnedWords = this.words.filter(w => w.learned).length;
  next();
});

// Метод для получения слов для изучения
vocabularySchema.methods.getWordsToLearn = function(limit = 10) {
  const now = new Date();
  
  // Сначала слова, которые нужно повторить
  const toReview = this.words.filter(w => 
    w.nextReview && w.nextReview <= now
  ).slice(0, limit);
  
  // Затем новые слова
  const newWords = this.words.filter(w => 
    !w.lastReviewed
  ).slice(0, limit - toReview.length);
  
  return [...toReview, ...newWords];
};

// Метод для обновления прогресса слова
vocabularySchema.methods.updateWordProgress = function(wordId, isCorrect) {
  const word = this.words.id(wordId);
  if (!word) return null;
  
  word.lastReviewed = new Date();
  
  if (isCorrect) {
    word.correctCount += 1;
    word.memoryLevel = Math.min(word.memoryLevel + 1, 5);
    
    // Интервальное повторение (в днях): 1, 3, 7, 14, 30, 60
    const intervals = [1, 3, 7, 14, 30, 60];
    const daysUntilNext = intervals[word.memoryLevel] || 60;
    word.nextReview = new Date(Date.now() + daysUntilNext * 24 * 60 * 60 * 1000);
    
    // Слово считается выученным после 3 правильных ответов
    if (word.correctCount >= 3 && word.memoryLevel >= 2) {
      word.learned = true;
    }
  } else {
    word.incorrectCount += 1;
    word.memoryLevel = Math.max(word.memoryLevel - 1, 0);
    word.nextReview = new Date(Date.now() + 1 * 24 * 60 * 60 * 1000); // Повторить завтра
    word.learned = false;
  }
  
  return word;
};

// JSON преобразование
vocabularySchema.set('toJSON', { virtuals: true });
vocabularySchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Vocabulary', vocabularySchema);
