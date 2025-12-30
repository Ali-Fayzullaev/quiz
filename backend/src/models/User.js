const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    // Основная информация
    username: {
        type: String,
        required: [true, 'Имя пользователя обязательно'],
        unique: true,
        trim: true,
        minlength: [3, 'Имя пользователя должно быть минимум 3 символа'],
        maxlength: [30, 'Имя пользователя не должно превышать 30 символов'],
        match: [/^[a-zA-Z0-9_]+$/, 'Имя пользователя может содержать только буквы, цифры и подчеркивания']
    },
    email: {
        type: String,
        required: [true, 'Email обязателен'],
        unique: true,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Введите корректный email']
    },
    password: {
        type: String,
        required: [true, 'Пароль обязателен'],
        minlength: [6, 'Пароль должен быть минимум 6 символов'],
        select: false // Не возвращать пароль при запросах по умолчанию
    },

    // Профиль
    profile: {
        firstName: String,
        lastName: String,
        avatar: {
            url: String,
            cloudinaryId: String
        },
        bio: {
            type: String,
            maxlength: [500, 'Биография не должна превышать 500 символов']
        },
        dateOfBirth: Date,
        country: String,
        timezone: String
    },

    // Роли и статус
    role: {
        type: String,
        enum: ['user', 'creator', 'moderator', 'admin'],
        default: 'user'
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'banned', 'pending'],
        default: 'active'
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    verificationCode: {
        type: String,
        select: false // Не возвращать в запросах по умолчанию
    },
    verificationCodeExpires: {
        type: Date,
        select: false
    },
    verificationCodeSentAt: {
        type: Date,
        select: false
    },
    emailVerifiedAt: {
        type: Date
    },
    lastSeen: {
        type: Date,
        default: Date.now
    },

    // Игровая статистика
    gameStats: {
        level: {
            type: Number,
            default: 1
        },
        experience: {
            type: Number,
            default: 0
        },
        totalPoints: {
            type: Number,
            default: 0
        },
        quizzesCompleted: {
            type: Number,
            default: 0
        },
        averageScore: {
            type: Number,
            default: 0
        },
        bestStreak: {
            type: Number,
            default: 0
        },
        currentStreak: {
            type: Number,
            default: 0
        },
        lastPlayDate: Date
    },

    // Рейтинговая система
    rating: {
        current: {
            type: Number,
            default: 1000
        },
        peak: {
            type: Number,
            default: 1000
        },
        league: {
            type: String,
            enum: ['bronze', 'silver', 'gold', 'platinum', 'diamond', 'master'],
            default: 'bronze'
        },
        division: {
            type: Number,
            min: 1,
            max: 5,
            default: 5
        }
    },

    // Достижения и награды
    achievements: [{
        achievementId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Achievement'
        },
        unlockedAt: {
            type: Date,
            default: Date.now
        },
        progress: Number
    }],

    // Инвентарь и валюта
    inventory: {
        coins: {
            type: Number,
            default: 100
        },
        gems: {
            type: Number,
            default: 0
        },
        items: [{
            itemId: String,
            itemType: {
                type: String,
                enum: ['avatar', 'theme', 'booster', 'badge']
            },
            purchasedAt: {
                type: Date,
                default: Date.now
            }
        }],
        boosters: [{
            type: {
                type: String,
                enum: ['double_points', 'extra_time', 'skip_question', 'freeze_time']
            },
            quantity: {
                type: Number,
                default: 0
            }
        }]
    },

    // Настройки
    settings: {
        notifications: {
            email: {
                type: Boolean,
                default: true
            },
            push: {
                type: Boolean,
                default: true
            },
            weeklyReport: {
                type: Boolean,
                default: true
            },
            friendRequests: {
                type: Boolean,
                default: true
            },
            challenges: {
                type: Boolean,
                default: true
            }
        },
        privacy: {
            showProfile: {
                type: Boolean,
                default: true
            },
            showStats: {
                type: Boolean,
                default: true
            },
            allowFriendRequests: {
                type: Boolean,
                default: true
            }
        },
        preferences: {
            language: {
                type: String,
                default: 'ru'
            },
            theme: {
                type: String,
                enum: ['light', 'dark', 'auto'],
                default: 'auto'
            },
            soundEnabled: {
                type: Boolean,
                default: true
            }
        }
    },

    // Социальное
    friends: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        addedAt: {
            type: Date,
            default: Date.now
        },
        status: {
            type: String,
            enum: ['pending', 'accepted', 'blocked'],
            default: 'pending'
        }
    }],
    
    followers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    following: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],

    // Безопасность
    refreshTokens: [{
        token: String,
        createdAt: {
            type: Date,
            default: Date.now,
            expires: '7d'
        }
    }],
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    emailVerificationToken: String,
    emailVerificationExpire: Date,

    // Метаданные
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

// Индексы для оптимизации запросов (email и username уже индексированы через unique: true)
userSchema.index({ 'rating.current': -1 });
userSchema.index({ 'gameStats.experience': -1 });
userSchema.index({ createdAt: -1 });

// Виртуальные поля
userSchema.virtual('fullName').get(function() {
    if (this.profile.firstName && this.profile.lastName) {
        return `${this.profile.firstName} ${this.profile.lastName}`;
    }
    return this.username;
});

userSchema.virtual('isOnline').get(function() {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    return this.lastSeen > fiveMinutesAgo;
});

// Middleware для обновления updatedAt
userSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
});

// Хеширование пароля перед сохранением
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    
    const salt = await bcrypt.genSalt(Number(process.env.BCRYPT_SALT_ROUNDS) || 12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Методы модели
userSchema.methods = {
    // Проверка пароля
    async checkPassword(password) {
        return await bcrypt.compare(password, this.password);
    },

    // Добавление опыта
    addExperience(points) {
        this.gameStats.experience += points;
        this.gameStats.totalPoints += points;
        
        // Расчет уровня (каждые 1000 очков = новый уровень)
        const newLevel = Math.floor(this.gameStats.experience / 1000) + 1;
        if (newLevel > this.gameStats.level) {
            this.gameStats.level = newLevel;
            return { levelUp: true, newLevel };
        }
        
        return { levelUp: false };
    },

    // Обновление рейтинга
    updateRating(change) {
        this.rating.current = Math.max(0, this.rating.current + change);
        if (this.rating.current > this.rating.peak) {
            this.rating.peak = this.rating.current;
        }
        
        // Определение лиги
        const leagues = [
            { min: 0, max: 999, league: 'bronze' },
            { min: 1000, max: 1499, league: 'silver' },
            { min: 1500, max: 1999, league: 'gold' },
            { min: 2000, max: 2499, league: 'platinum' },
            { min: 2500, max: 2999, league: 'diamond' },
            { min: 3000, max: Infinity, league: 'master' }
        ];
        
        const currentLeague = leagues.find(l => 
            this.rating.current >= l.min && this.rating.current <= l.max
        );
        
        if (currentLeague) {
            this.rating.league = currentLeague.league;
            this.rating.division = Math.min(5, Math.floor((this.rating.current - currentLeague.min) / 100) + 1);
        }
    },

    // Обновление стрика
    updateStreak(success) {
        const today = new Date().toDateString();
        const lastPlayDate = this.gameStats.lastPlayDate ? 
            this.gameStats.lastPlayDate.toDateString() : null;
        
        if (success) {
            if (lastPlayDate === today) {
                // Уже играл сегодня, стрик не изменяется
                return this.gameStats.currentStreak;
            }
            
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            
            if (lastPlayDate === yesterday.toDateString()) {
                // Играл вчера, продолжаем стрик
                this.gameStats.currentStreak++;
            } else {
                // Перерыв в игре, начинаем новый стрик
                this.gameStats.currentStreak = 1;
            }
            
            if (this.gameStats.currentStreak > this.gameStats.bestStreak) {
                this.gameStats.bestStreak = this.gameStats.currentStreak;
            }
        } else {
            this.gameStats.currentStreak = 0;
        }
        
        this.gameStats.lastPlayDate = new Date();
        return this.gameStats.currentStreak;
    },

    // Получить публичный профиль
    getPublicProfile() {
        return {
            id: this._id,
            username: this.username,
            profile: {
                firstName: this.profile.firstName,
                lastName: this.profile.lastName,
                avatar: this.profile.avatar,
                bio: this.profile.bio,
                country: this.profile.country
            },
            gameStats: this.gameStats,
            rating: this.rating,
            achievements: this.achievements,
            createdAt: this.createdAt,
            isOnline: this.isOnline
        };
    }
};

// Статические методы
userSchema.statics = {
    // Найти пользователя по email или username
    async findByCredentials(emailOrUsername) {
        const user = await this.findOne({
            $or: [
                { email: emailOrUsername },
                { username: emailOrUsername }
            ]
        }).select('+password');
        
        return user;
    },

    // Получить топ игроков
    async getLeaderboard(limit = 10, type = 'rating') {
        const sortField = type === 'rating' ? 'rating.current' : 'gameStats.totalPoints';
        
        return await this.find({ status: 'active' })
            .sort({ [sortField]: -1 })
            .limit(limit)
            .select('username profile.avatar gameStats rating');
    }
};

module.exports = mongoose.model('User', userSchema);