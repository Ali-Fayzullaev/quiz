const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    // Связи
    quiz: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Quiz',
        required: true,
        index: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    
    // Контент
    text: {
        type: String,
        required: [true, 'Текст комментария обязателен'],
        trim: true,
        maxlength: [1000, 'Комментарий не должен превышать 1000 символов']
    },

    // Рейтинг квиза от пользователя (опционально)
    rating: {
        type: Number,
        min: 1,
        max: 5
    },

    // Ответ на комментарий (для вложенности)
    parentComment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment',
        default: null
    },

    // Лайки
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],

    // Статус
    status: {
        type: String,
        enum: ['active', 'hidden', 'deleted'],
        default: 'active'
    },

    // Редактирование
    isEdited: {
        type: Boolean,
        default: false
    },
    editedAt: {
        type: Date
    }
}, {
    timestamps: true
});

// Индексы для быстрого поиска
commentSchema.index({ quiz: 1, createdAt: -1 });
commentSchema.index({ user: 1 });
commentSchema.index({ parentComment: 1 });

// Виртуальное поле для количества лайков
commentSchema.virtual('likesCount').get(function() {
    return this.likes ? this.likes.length : 0;
});

// Метод для проверки, лайкнул ли пользователь
commentSchema.methods.isLikedBy = function(userId) {
    return this.likes.some(id => id.toString() === userId.toString());
};

// Статический метод для получения комментариев с пагинацией
commentSchema.statics.getCommentsForQuiz = async function(quizId, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    
    const comments = await this.find({ 
        quiz: quizId, 
        parentComment: null,
        status: 'active' 
    })
    .populate('user', 'username profile.avatar profile.firstName profile.lastName')
    .populate({
        path: 'replies',
        match: { status: 'active' },
        populate: {
            path: 'user',
            select: 'username profile.avatar profile.firstName profile.lastName'
        }
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

    const total = await this.countDocuments({ 
        quiz: quizId, 
        parentComment: null,
        status: 'active' 
    });

    return {
        comments,
        pagination: {
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalItems: total,
            hasNext: page < Math.ceil(total / limit),
            hasPrev: page > 1
        }
    };
};

// Настройка toJSON
commentSchema.set('toJSON', { virtuals: true });

const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;
