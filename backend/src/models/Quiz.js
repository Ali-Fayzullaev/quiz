const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
    // Основная информация
    title: {
        type: String,
        required: [true, 'Название викторины обязательно'],
        trim: true,
        maxlength: [200, 'Название не должно превышать 200 символов']
    },
    description: {
        type: String,
        required: [true, 'Описание викторины обязательно'],
        maxlength: [1000, 'Описание не должно превышать 1000 символов']
    },
    thumbnail: {
        url: String,
        cloudinaryId: String
    },

    // Автор и настройки доступа
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['draft', 'published', 'archived', 'deleted'],
        default: 'draft'
    },
    visibility: {
        type: String,
        enum: ['public', 'private', 'unlisted'],
        default: 'public'
    },
    isOfficial: {
        type: Boolean,
        default: false
    },

    // Категория и теги
    category: {
        type: String,
        enum: [
            'general', 'science', 'history', 'geography', 'sports', 
            'entertainment', 'art', 'literature', 'music', 'movies',
            'technology', 'nature', 'food', 'travel', 'languages',
            'mathematics', 'business', 'gaming', 'anime', 'custom'
        ],
        required: true
    },
    tags: [{
        type: String,
        trim: true,
        maxlength: 30
    }],
    difficulty: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced', 'expert'],
        default: 'intermediate'
    },

    // Настройки викторины
    settings: {
        timeLimit: {
            type: Number, // секунды на весь квиз
            default: 0 // 0 = без лимита
        },
        questionTimeLimit: {
            type: Number, // секунды на вопрос
            default: 30
        },
        attemptsAllowed: {
            type: Number,
            default: 3,
            max: 10
        },
        showCorrectAnswers: {
            type: Boolean,
            default: true
        },
        showScoreAfterEachQuestion: {
            type: Boolean,
            default: false
        },
        shuffleQuestions: {
            type: Boolean,
            default: false
        },
        shuffleAnswers: {
            type: Boolean,
            default: true
        },
        passingScore: {
            type: Number, // процент для прохождения
            default: 60,
            min: 0,
            max: 100
        },
        allowSkip: {
            type: Boolean,
            default: false
        },
        showProgress: {
            type: Boolean,
            default: true
        }
    },

    // Вопросы (встроенные для простоты или как отдельная коллекция)
    questions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Question'
    }],

    // Статистика
    stats: {
        totalAttempts: {
            type: Number,
            default: 0
        },
        completedAttempts: {
            type: Number,
            default: 0
        },
        averageScore: {
            type: Number,
            default: 0
        },
        averageTime: {
            type: Number,
            default: 0
        },
        difficultyRating: {
            type: Number,
            default: 0
        },
        popularityScore: {
            type: Number,
            default: 0
        }
    },

    // Социальные метрики
    social: {
        likes: [{
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
            createdAt: {
                type: Date,
                default: Date.now
            }
        }],
        dislikes: [{
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
            createdAt: {
                type: Date,
                default: Date.now
            }
        }],
        favorites: [{
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
            createdAt: {
                type: Date,
                default: Date.now
            }
        }],
        shares: {
            type: Number,
            default: 0
        },
        comments: [{
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
                required: true
            },
            text: {
                type: String,
                required: true,
                maxlength: 500
            },
            rating: {
                type: Number,
                min: 1,
                max: 5
            },
            isEdited: {
                type: Boolean,
                default: false
            },
            createdAt: {
                type: Date,
                default: Date.now
            },
            updatedAt: {
                type: Date,
                default: Date.now
            }
        }]
    },

    // Режимы игры
    gameModes: [{
        type: {
            type: String,
            enum: ['classic', 'speed', 'survival', 'multiplayer'],
            default: 'classic'
        },
        enabled: {
            type: Boolean,
            default: true
        },
        settings: mongoose.Schema.Types.Mixed
    }],

    // Награды
    rewards: {
        basePoints: {
            type: Number,
            default: 100
        },
        bonusMultiplier: {
            type: Number,
            default: 1.0
        },
        specialRewards: [{
            condition: String, // "perfect_score", "under_30_seconds", etc.
            reward: {
                type: String,
                points: Number,
                badge: String
            }
        }]
    },

    // Мета-данные
    language: {
        type: String,
        default: 'ru'
    },
    estimatedDuration: {
        type: Number, // минуты
        default: 5
    },
    version: {
        type: Number,
        default: 1
    },
    
    // Временные метки
    publishedAt: Date,
    lastModified: {
        type: Date,
        default: Date.now
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Индексы
quizSchema.index({ creator: 1, status: 1 });
quizSchema.index({ category: 1, difficulty: 1 });
quizSchema.index({ status: 1, visibility: 1 });
quizSchema.index({ 'stats.popularityScore': -1 });
quizSchema.index({ createdAt: -1 });
quizSchema.index({ tags: 1 });
quizSchema.index({ 
    title: 'text', 
    description: 'text', 
    tags: 'text' 
});

// Виртуальные поля
quizSchema.virtual('questionCount').get(function() {
    return this.questions.length;
});

quizSchema.virtual('likesCount').get(function() {
    return this.social.likes.length;
});

quizSchema.virtual('dislikesCount').get(function() {
    return this.social.dislikes.length;
});

quizSchema.virtual('favoritesCount').get(function() {
    return this.social.favorites.length;
});

quizSchema.virtual('commentsCount').get(function() {
    return this.social.comments.length;
});

quizSchema.virtual('rating').get(function() {
    const likes = this.social.likes.length;
    const dislikes = this.social.dislikes.length;
    const total = likes + dislikes;
    
    if (total === 0) return 0;
    return (likes / total) * 100;
});

// Middleware
quizSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    this.lastModified = new Date();
    
    // Автоматически устанавливаем publishedAt при публикации
    if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
        this.publishedAt = new Date();
    }
    
    // Обновляем версию при изменении вопросов
    if (this.isModified('questions')) {
        this.version += 1;
    }
    
    next();
});

// Методы
quizSchema.methods = {
    // Проверка возможности прохождения пользователем
    canPlayBy(userId) {
        if (this.status !== 'published') return false;
        if (this.visibility === 'private' && !this.creator.equals(userId)) return false;
        return true;
    },

    // Добавить лайк/дизлайк
    async toggleLike(userId, isLike = true) {
        const socialArray = isLike ? this.social.likes : this.social.dislikes;
        const oppositeArray = isLike ? this.social.dislikes : this.social.likes;
        
        // Убираем из противоположного массива
        oppositeArray.pull({ user: userId });
        
        // Проверяем, есть ли уже в текущем массиве
        const existingIndex = socialArray.findIndex(item => item.user.equals(userId));
        
        if (existingIndex > -1) {
            // Убираем лайк/дизлайк
            socialArray.splice(existingIndex, 1);
        } else {
            // Добавляем лайк/дизлайк
            socialArray.push({ user: userId });
        }
        
        await this.save();
        return this;
    },

    // Добавить в избранное
    async toggleFavorite(userId) {
        const favoriteIndex = this.social.favorites.findIndex(
            item => item.user.equals(userId)
        );
        
        if (favoriteIndex > -1) {
            this.social.favorites.splice(favoriteIndex, 1);
        } else {
            this.social.favorites.push({ user: userId });
        }
        
        await this.save();
        return this;
    },

    // Добавить комментарий
    async addComment(userId, text, rating = null) {
        this.social.comments.push({
            user: userId,
            text,
            rating
        });
        
        await this.save();
        return this.social.comments[this.social.comments.length - 1];
    },

    // Обновить статистику
    updateStats(score, timeSpent, completed = true) {
        this.stats.totalAttempts += 1;
        
        if (completed) {
            this.stats.completedAttempts += 1;
            
            // Обновляем средний балл
            const totalScore = this.stats.averageScore * (this.stats.completedAttempts - 1) + score;
            this.stats.averageScore = totalScore / this.stats.completedAttempts;
            
            // Обновляем среднее время
            const totalTime = this.stats.averageTime * (this.stats.completedAttempts - 1) + timeSpent;
            this.stats.averageTime = totalTime / this.stats.completedAttempts;
        }
        
        // Обновляем популярность
        this.updatePopularity();
    },

    // Обновить популярность
    updatePopularity() {
        const weights = {
            attempts: 0.3,
            completion: 0.2,
            rating: 0.25,
            social: 0.15,
            recency: 0.1
        };
        
        const attemptsScore = Math.min(this.stats.totalAttempts / 100, 1) * 100;
        const completionRate = this.stats.totalAttempts > 0 ? 
            (this.stats.completedAttempts / this.stats.totalAttempts) * 100 : 0;
        const ratingScore = this.rating;
        const socialScore = (this.likesCount + this.favoritesCount) * 2 + this.social.shares;
        
        // Бонус за новизну (убывает со временем)
        const daysSincePublish = this.publishedAt ? 
            (Date.now() - this.publishedAt.getTime()) / (1000 * 60 * 60 * 24) : 999;
        const recencyScore = Math.max(0, 100 - daysSincePublish * 2);
        
        this.stats.popularityScore = 
            attemptsScore * weights.attempts +
            completionRate * weights.completion +
            ratingScore * weights.rating +
            Math.min(socialScore, 100) * weights.social +
            recencyScore * weights.recency;
    },

    // Получить публичные данные
    getPublicData() {
        return {
            id: this._id,
            title: this.title,
            description: this.description,
            thumbnail: this.thumbnail,
            creator: this.creator,
            category: this.category,
            tags: this.tags,
            difficulty: this.difficulty,
            questionCount: this.questionCount,
            estimatedDuration: this.estimatedDuration,
            stats: {
                totalAttempts: this.stats.totalAttempts,
                averageScore: Math.round(this.stats.averageScore * 10) / 10,
                popularityScore: Math.round(this.stats.popularityScore)
            },
            social: {
                likesCount: this.likesCount,
                dislikesCount: this.dislikesCount,
                favoritesCount: this.favoritesCount,
                commentsCount: this.commentsCount,
                rating: Math.round(this.rating)
            },
            publishedAt: this.publishedAt,
            language: this.language
        };
    }
};

// Статические методы
quizSchema.statics = {
    // Поиск викторин
    async searchQuizzes(query, options = {}) {
        const {
            category,
            difficulty,
            tags,
            sort = 'popularity',
            limit = 20,
            skip = 0,
            userId
        } = options;
        
        let searchQuery = {
            status: 'published',
            visibility: { $in: ['public', 'unlisted'] }
        };
        
        // Текстовый поиск
        if (query) {
            searchQuery.$text = { $search: query };
        }
        
        // Фильтры
        if (category) searchQuery.category = category;
        if (difficulty) searchQuery.difficulty = difficulty;
        if (tags && tags.length > 0) searchQuery.tags = { $in: tags };
        
        // Сортировка
        let sortOptions = {};
        switch (sort) {
            case 'popularity':
                sortOptions = { 'stats.popularityScore': -1 };
                break;
            case 'newest':
                sortOptions = { publishedAt: -1 };
                break;
            case 'rating':
                sortOptions = { 'social.likes': -1 };
                break;
            case 'attempts':
                sortOptions = { 'stats.totalAttempts': -1 };
                break;
            default:
                sortOptions = { 'stats.popularityScore': -1 };
        }
        
        const quizzes = await this.find(searchQuery)
            .populate('creator', 'username profile.avatar')
            .sort(sortOptions)
            .limit(limit)
            .skip(skip)
            .lean();
        
        return quizzes;
    },

    // Получить рекомендации для пользователя
    async getRecommendations(userId, limit = 10) {
        // Здесь можно добавить более сложную логику рекомендаций
        // На основе истории пользователя, предпочтений и т.д.
        
        return await this.find({
            status: 'published',
            visibility: 'public'
        })
        .populate('creator', 'username profile.avatar')
        .sort({ 'stats.popularityScore': -1 })
        .limit(limit);
    }
};

module.exports = mongoose.model('Quiz', quizSchema);