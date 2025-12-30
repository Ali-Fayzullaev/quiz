const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema({
    // Основная информация
    name: {
        type: String,
        required: [true, 'Название достижения обязательно'],
        unique: true,
        trim: true,
        maxlength: [100, 'Название не должно превышать 100 символов']
    },
    description: {
        type: String,
        required: [true, 'Описание достижения обязательно'],
        maxlength: [300, 'Описание не должно превышать 300 символов']
    },
    
    // Визуальные элементы
    icon: {
        url: String,
        cloudinaryId: String,
        emoji: String // Альтернатива иконке
    },
    badge: {
        color: {
            type: String,
            default: '#FFD700'
        },
        shape: {
            type: String,
            enum: ['circle', 'star', 'shield', 'trophy', 'medal'],
            default: 'medal'
        },
        rarity: {
            type: String,
            enum: ['common', 'rare', 'epic', 'legendary', 'mythic'],
            default: 'common'
        }
    },

    // Тип и категория достижения
    type: {
        type: String,
        enum: [
            'score_based',    // На основе очков
            'streak_based',   // На основе стрика
            'time_based',     // На основе времени
            'completion',     // За завершение
            'social',         // Социальные достижения
            'special',        // Специальные события
            'collection',     // Коллекционирование
            'skill_based',    // На основе навыков
            'milestone'       // Этапные достижения
        ],
        required: true
    },
    category: {
        type: String,
        enum: [
            'quiz_master',
            'speed_demon',
            'perfectionist',
            'social_butterfly',
            'explorer',
            'dedicated',
            'competitive',
            'special_event'
        ],
        required: true
    },

    // Условия получения
    criteria: {
        // Общие условия
        target: {
            type: Number, // Целевое значение
            required: true
        },
        metric: {
            type: String, // Какая метрика отслеживается
            enum: [
                'total_score',
                'quiz_completed', 
                'perfect_scores',
                'current_streak',
                'best_streak',
                'friends_count',
                'quiz_created',
                'time_played',
                'categories_mastered',
                'consecutive_days',
                'tournament_wins',
                'challenge_wins'
            ],
            required: true
        },
        
        // Дополнительные условия
        filters: {
            category: String,        // Определенная категория викторин
            difficulty: String,      // Определенная сложность
            timeframe: Number,       // За определенный период (дни)
            minScore: Number,        // Минимальный балл
            gameMode: String         // Определенный режим игры
        },

        // Логические условия
        operator: {
            type: String,
            enum: ['gte', 'gt', 'eq', 'lte', 'lt'], // >=, >, ==, <=, <
            default: 'gte'
        }
    },

    // Настройки прогресса
    progress: {
        isProgressive: {
            type: Boolean,
            default: true // false для достижений "все или ничего"
        },
        steps: [{
            value: Number,
            reward: {
                points: Number,
                coins: Number
            }
        }]
    },

    // Награды за получение
    rewards: {
        experience: {
            type: Number,
            default: 100
        },
        coins: {
            type: Number,
            default: 50
        },
        title: String, // Специальное звание
        badge: String, // Бейдж для профиля
        customReward: {
            type: String, // Описание специальной награды
            value: mongoose.Schema.Types.Mixed
        }
    },

    // Статистика и метаданные
    stats: {
        totalUnlocked: {
            type: Number,
            default: 0
        },
        firstUnlockedBy: {
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
            date: Date
        },
        lastUnlockedBy: {
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
            date: Date
        },
        unlockRate: {
            type: Number, // Процент игроков, получивших достижение
            default: 0
        }
    },

    // Настройки доступности
    isActive: {
        type: Boolean,
        default: true
    },
    isSecret: {
        type: Boolean,
        default: false // Скрытые достижения
    },
    releaseDate: {
        type: Date,
        default: Date.now
    },
    expirationDate: Date, // Для временных достижений

    // Локализация
    localization: {
        ru: {
            name: String,
            description: String
        },
        en: {
            name: String,
            description: String
        }
    },

    // Создатель и версионирование
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    version: {
        type: Number,
        default: 1
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
achievementSchema.index({ type: 1, category: 1 });
achievementSchema.index({ isActive: 1, isSecret: 1 });
achievementSchema.index({ 'criteria.metric': 1 });
achievementSchema.index({ 'badge.rarity': 1 });
achievementSchema.index({ releaseDate: -1 });

// Виртуальные поля
achievementSchema.virtual('rarityScore').get(function() {
    const rarityScores = {
        common: 1,
        rare: 2,
        epic: 3,
        legendary: 4,
        mythic: 5
    };
    return rarityScores[this.badge.rarity] || 1;
});

achievementSchema.virtual('difficultyScore').get(function() {
    // Высчитываем сложность на основе цели и метрики
    const baseScore = Math.log10(this.criteria.target + 1);
    return Math.min(10, Math.max(1, Math.round(baseScore)));
});

// Middleware
achievementSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    
    // Автоматически обновляем unlock rate
    if (this.stats.totalUnlocked > 0) {
        // Здесь бы нужно получить общее количество активных пользователей
        // Пока устанавливаем примерное значение
        this.stats.unlockRate = (this.stats.totalUnlocked / 10000) * 100; // Предполагаем 10к пользователей
    }
    
    next();
});

// Методы
achievementSchema.methods = {
    // Проверить, выполнил ли пользователь условия достижения
    checkConditions(userStats, additionalData = {}) {
        const { target, metric, operator, filters } = this.criteria;
        
        let currentValue = 0;
        
        // Получаем текущее значение метрики
        switch (metric) {
            case 'total_score':
                currentValue = userStats.gameStats?.totalPoints || 0;
                break;
            case 'quiz_completed':
                currentValue = userStats.gameStats?.quizzesCompleted || 0;
                break;
            case 'current_streak':
                currentValue = userStats.gameStats?.currentStreak || 0;
                break;
            case 'best_streak':
                currentValue = userStats.gameStats?.bestStreak || 0;
                break;
            case 'friends_count':
                currentValue = userStats.friends?.length || 0;
                break;
            case 'consecutive_days':
                // Логика для подсчета дней подряд
                currentValue = additionalData.consecutiveDays || 0;
                break;
            default:
                currentValue = additionalData[metric] || 0;
        }
        
        // Применяем дополнительные фильтры
        if (filters) {
            // Здесь можно добавить логику для фильтрации
            // Например, учитывать только определенные категории
        }
        
        // Проверяем условие
        switch (operator) {
            case 'gte':
                return currentValue >= target;
            case 'gt':
                return currentValue > target;
            case 'eq':
                return currentValue === target;
            case 'lte':
                return currentValue <= target;
            case 'lt':
                return currentValue < target;
            default:
                return false;
        }
    },

    // Рассчитать текущий прогресс пользователя
    calculateProgress(userStats, additionalData = {}) {
        const { target, metric } = this.criteria;
        
        let currentValue = 0;
        
        // Получаем текущее значение (та же логика, что и в checkConditions)
        switch (metric) {
            case 'total_score':
                currentValue = userStats.gameStats?.totalPoints || 0;
                break;
            case 'quiz_completed':
                currentValue = userStats.gameStats?.quizzesCompleted || 0;
                break;
            case 'current_streak':
                currentValue = userStats.gameStats?.currentStreak || 0;
                break;
            case 'best_streak':
                currentValue = userStats.gameStats?.bestStreak || 0;
                break;
            default:
                currentValue = additionalData[metric] || 0;
        }
        
        const progress = Math.min(100, (currentValue / target) * 100);
        
        return {
            current: currentValue,
            target: target,
            percentage: Math.round(progress * 10) / 10,
            isCompleted: currentValue >= target,
            remaining: Math.max(0, target - currentValue)
        };
    },

    // Выдать достижение пользователю
    async awardToUser(userId) {
        const User = mongoose.model('User');
        const user = await User.findById(userId);
        
        if (!user) {
            throw new Error('Пользователь не найден');
        }
        
        // Проверяем, есть ли уже это достижение у пользователя
        const hasAchievement = user.achievements.some(
            ach => ach.achievementId.toString() === this._id.toString()
        );
        
        if (hasAchievement) {
            return { alreadyHas: true };
        }
        
        // Добавляем достижение пользователю
        user.achievements.push({
            achievementId: this._id,
            unlockedAt: new Date(),
            progress: 100
        });
        
        // Начисляем награды
        if (this.rewards.experience > 0) {
            user.addExperience(this.rewards.experience);
        }
        
        if (this.rewards.coins > 0) {
            user.inventory.coins += this.rewards.coins;
        }
        
        await user.save();
        
        // Обновляем статистику достижения
        this.stats.totalUnlocked += 1;
        this.stats.lastUnlockedBy = {
            user: userId,
            date: new Date()
        };
        
        if (!this.stats.firstUnlockedBy.user) {
            this.stats.firstUnlockedBy = {
                user: userId,
                date: new Date()
            };
        }
        
        await this.save();
        
        return {
            success: true,
            achievement: this,
            rewards: this.rewards
        };
    },

    // Получить локализованное название и описание
    getLocalized(language = 'ru') {
        const localized = this.localization?.[language];
        
        return {
            name: localized?.name || this.name,
            description: localized?.description || this.description
        };
    },

    // Проверить активность достижения
    isAvailable() {
        if (!this.isActive) return false;
        
        const now = new Date();
        
        if (this.releaseDate && this.releaseDate > now) return false;
        if (this.expirationDate && this.expirationDate < now) return false;
        
        return true;
    }
};

// Статические методы
achievementSchema.statics = {
    // Получить все доступные достижения для пользователя
    async getAvailableAchievements(userId, includeSecret = false) {
        const query = {
            isActive: true,
            releaseDate: { $lte: new Date() },
            $or: [
                { expirationDate: { $exists: false } },
                { expirationDate: { $gte: new Date() } }
            ]
        };
        
        if (!includeSecret) {
            query.isSecret = false;
        }
        
        const achievements = await this.find(query).sort({ 'badge.rarity': -1, createdAt: -1 });
        
        // Если передан userId, добавляем информацию о прогрессе
        if (userId) {
            const User = mongoose.model('User');
            const user = await User.findById(userId);
            
            return achievements.map(achievement => {
                const hasAchievement = user.achievements.some(
                    ach => ach.achievementId.toString() === achievement._id.toString()
                );
                
                const progress = hasAchievement ? 
                    { percentage: 100, isCompleted: true } : 
                    achievement.calculateProgress(user);
                
                return {
                    ...achievement.toObject(),
                    userProgress: progress,
                    isUnlocked: hasAchievement
                };
            });
        }
        
        return achievements;
    },

    // Проверить все достижения для пользователя
    async checkAllAchievements(userId, triggerData = {}) {
        const User = mongoose.model('User');
        const user = await User.findById(userId).populate('achievements.achievementId');
        
        if (!user) return [];
        
        const availableAchievements = await this.find({
            isActive: true,
            releaseDate: { $lte: new Date() }
        });
        
        const newAchievements = [];
        
        for (const achievement of availableAchievements) {
            // Проверяем, есть ли уже это достижение
            const hasAchievement = user.achievements.some(
                ach => ach.achievementId._id.toString() === achievement._id.toString()
            );
            
            if (!hasAchievement && achievement.checkConditions(user, triggerData)) {
                const result = await achievement.awardToUser(userId);
                if (result.success) {
                    newAchievements.push(result.achievement);
                }
            }
        }
        
        return newAchievements;
    },

    // Создать базовые достижения системы
    async createDefaultAchievements() {
        const defaultAchievements = [
            {
                name: 'Первые шаги',
                description: 'Завершите свою первую викторину',
                type: 'completion',
                category: 'quiz_master',
                criteria: { target: 1, metric: 'quiz_completed', operator: 'gte' },
                badge: { rarity: 'common', color: '#90EE90', emoji: '👶' },
                rewards: { experience: 50, coins: 25 }
            },
            {
                name: 'Знаток',
                description: 'Завершите 10 викторин',
                type: 'completion',
                category: 'quiz_master',
                criteria: { target: 10, metric: 'quiz_completed', operator: 'gte' },
                badge: { rarity: 'common', color: '#87CEEB', emoji: '🎓' },
                rewards: { experience: 100, coins: 50 }
            },
            {
                name: 'Перфекционист',
                description: 'Получите 100% в любой викторине',
                type: 'score_based',
                category: 'perfectionist',
                criteria: { target: 1, metric: 'perfect_scores', operator: 'gte' },
                badge: { rarity: 'rare', color: '#FFD700', emoji: '⭐' },
                rewards: { experience: 200, coins: 100 }
            },
            {
                name: 'Скоростной демон',
                description: 'Ответьте на 10 вопросов менее чем за 5 секунд каждый',
                type: 'time_based',
                category: 'speed_demon',
                criteria: { target: 10, metric: 'fast_answers', operator: 'gte' },
                badge: { rarity: 'epic', color: '#FF6347', emoji: '⚡' },
                rewards: { experience: 300, coins: 150 }
            },
            {
                name: 'Социальная бабочка',
                description: 'Добавьте 5 друзей',
                type: 'social',
                category: 'social_butterfly',
                criteria: { target: 5, metric: 'friends_count', operator: 'gte' },
                badge: { rarity: 'rare', color: '#FF69B4', emoji: '🦋' },
                rewards: { experience: 150, coins: 75 }
            }
        ];
        
        for (const achievementData of defaultAchievements) {
            const existing = await this.findOne({ name: achievementData.name });
            if (!existing) {
                await this.create(achievementData);
            }
        }
    }
};

module.exports = mongoose.model('Achievement', achievementSchema);