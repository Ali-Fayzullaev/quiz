const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema({
    // Основные связи
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    quiz: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Quiz',
        required: true
    },

    // Результаты
    score: {
        type: Number,
        required: true,
        min: 0
    },
    maxPossibleScore: {
        type: Number,
        required: true
    },
    percentage: {
        type: Number,
        required: true,
        min: 0,
        max: 100
    },
    totalQuestions: {
        type: Number,
        min: 0,
        default: 0
    },
    
    // Статус прохождения
    status: {
        type: String,
        enum: ['completed', 'abandoned', 'in_progress', 'timed_out'],
        default: 'in_progress'
    },
    passed: {
        type: Boolean,
        default: false
    },

    // Временные метрики
    startTime: {
        type: Date,
        required: true
    },
    endTime: {
        type: Date
    },
    timeSpent: {
        type: Number, // секунды
        default: 0
    },
    
    // Детали ответов
    answers: [{
        question: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Question',
            required: true
        },
        userAnswer: mongoose.Schema.Types.Mixed, // Может быть разных типов
        isCorrect: {
            type: Boolean,
            required: true
        },
        pointsEarned: {
            type: Number,
            default: 0
        },
        timeSpent: {
            type: Number, // секунды на вопрос
            default: 0
        },
        answeredAt: {
            type: Date,
            default: Date.now
        },
        wasSkipped: {
            type: Boolean,
            default: false
        },
        usedBooster: {
            type: String,
            enum: ['none', 'double_points', 'extra_time', 'skip_question', 'freeze_time'],
            default: 'none'
        }
    }],

    // Игровой режим
    gameMode: {
        type: String,
        enum: ['classic', 'speed', 'survival', 'multiplayer'],
        default: 'classic'
    },

    // Дополнительные метрики
    metrics: {
        correctAnswersCount: {
            type: Number,
            default: 0
        },
        incorrectAnswersCount: {
            type: Number,
            default: 0
        },
        skippedAnswersCount: {
            type: Number,
            default: 0
        },
        averageTimePerQuestion: {
            type: Number,
            default: 0
        },
        fastestAnswer: {
            type: Number,
            default: 0
        },
        slowestAnswer: {
            type: Number,
            default: 0
        },
        streakBest: {
            type: Number,
            default: 0
        },
        perfectQuestions: {
            type: Number,
            default: 0
        }
    },

    // Награды и бонусы
    rewards: {
        basePoints: {
            type: Number,
            default: 0
        },
        bonusPoints: {
            type: Number,
            default: 0
        },
        speedBonus: {
            type: Number,
            default: 0
        },
        streakBonus: {
            type: Number,
            default: 0
        },
        perfectBonus: {
            type: Number,
            default: 0
        },
        coinsEarned: {
            type: Number,
            default: 0
        },
        experienceEarned: {
            type: Number,
            default: 0
        },
        achievementsUnlocked: [{
            achievementId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Achievement'
            },
            unlockedAt: {
                type: Date,
                default: Date.now
            }
        }]
    },

    // Рейтинговые изменения
    ratingChange: {
        before: Number,
        after: Number,
        change: Number
    },

    // Мультиплеер данные
    multiplayer: {
        roomId: String,
        players: [{
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
            finalScore: Number,
            finalPosition: Number
        }],
        rank: Number,
        isWinner: {
            type: Boolean,
            default: false
        }
    },

    // Метаданные
    attempt: {
        type: Number,
        default: 1
    },
    deviceInfo: {
        type: String // mobile, desktop, tablet
    },
    ipAddress: String,
    userAgent: String,
    
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
resultSchema.index({ user: 1, quiz: 1, createdAt: -1 });
resultSchema.index({ user: 1, status: 1 });
resultSchema.index({ quiz: 1, status: 1, score: -1 });
resultSchema.index({ createdAt: -1 });
resultSchema.index({ percentage: -1 });
resultSchema.index({ gameMode: 1, status: 1 });

// Уникальный индекс для предотвращения дублирования результатов в прогрессе
resultSchema.index(
    { user: 1, quiz: 1, status: 1 }, 
    { 
        unique: true, 
        partialFilterExpression: { status: 'in_progress' }
    }
);

// Виртуальные поля
resultSchema.virtual('duration').get(function() {
    if (!this.endTime || !this.startTime) return 0;
    return Math.floor((this.endTime - this.startTime) / 1000);
});

resultSchema.virtual('questionsCount').get(function() {
    return this.answers.length;
});

resultSchema.virtual('accuracy').get(function() {
    if (this.answers.length === 0) return 0;
    return (this.metrics.correctAnswersCount / this.answers.length) * 100;
});

resultSchema.virtual('totalRewards').get(function() {
    const r = this.rewards;
    return r.basePoints + r.bonusPoints + r.speedBonus + r.streakBonus + r.perfectBonus;
});

// Middleware
resultSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    
    // Автоматический расчет метрик при сохранении
    if (this.isModified('answers') || this.isModified('status')) {
        this.calculateMetrics();
    }
    
    // Автоматический расчет процентов
    if (this.maxPossibleScore > 0) {
        this.percentage = Math.round((this.score / this.maxPossibleScore) * 100);
    }
    
    // Установка времени окончания при завершении
    if (this.isModified('status') && this.status === 'completed' && !this.endTime) {
        this.endTime = new Date();
        this.timeSpent = Math.floor((this.endTime - this.startTime) / 1000);
    }
    
    next();
});

// Методы
resultSchema.methods = {
    // Расчет метрик
    calculateMetrics() {
        if (!this.answers || this.answers.length === 0) return;
        
        let correctCount = 0;
        let incorrectCount = 0;
        let skippedCount = 0;
        let totalTime = 0;
        let times = [];
        let currentStreak = 0;
        let bestStreak = 0;
        let perfectQuestions = 0;
        
        this.answers.forEach(answer => {
            if (answer.wasSkipped) {
                skippedCount++;
            } else if (answer.isCorrect) {
                correctCount++;
                currentStreak++;
                bestStreak = Math.max(bestStreak, currentStreak);
                
                // Проверка на "идеальный" ответ (быстро и правильно)
                if (answer.timeSpent <= 10 && answer.pointsEarned > 0) {
                    perfectQuestions++;
                }
            } else {
                incorrectCount++;
                currentStreak = 0;
            }
            
            totalTime += answer.timeSpent;
            times.push(answer.timeSpent);
        });
        
        this.metrics = {
            correctAnswersCount: correctCount,
            incorrectAnswersCount: incorrectCount,
            skippedAnswersCount: skippedCount,
            averageTimePerQuestion: totalTime / this.answers.length,
            fastestAnswer: Math.min(...times),
            slowestAnswer: Math.max(...times),
            streakBest: bestStreak,
            perfectQuestions
        };
    },

    // Расчет наград
    calculateRewards(quizSettings) {
        const basePoints = this.score;
        let bonusPoints = 0;
        let speedBonus = 0;
        let streakBonus = 0;
        let perfectBonus = 0;
        
        // Бонус за скорость (если прошел быстрее среднего времени)
        if (this.timeSpent > 0 && quizSettings.estimatedDuration) {
            const expectedTime = quizSettings.estimatedDuration * 60; // минуты в секунды
            if (this.timeSpent < expectedTime * 0.8) {
                speedBonus = Math.floor(basePoints * 0.2);
            }
        }
        
        // Бонус за стрик
        if (this.metrics.streakBest >= 5) {
            streakBonus = this.metrics.streakBest * 10;
        }
        
        // Бонус за идеальные ответы
        if (this.metrics.perfectQuestions > 0) {
            perfectBonus = this.metrics.perfectQuestions * 20;
        }
        
        // Бонус за высокий результат
        if (this.percentage >= 90) {
            bonusPoints = Math.floor(basePoints * 0.5);
        } else if (this.percentage >= 75) {
            bonusPoints = Math.floor(basePoints * 0.25);
        }
        
        const totalPoints = basePoints + bonusPoints + speedBonus + streakBonus + perfectBonus;
        const coinsEarned = Math.floor(totalPoints / 10); // 10 очков = 1 монета
        const experienceEarned = totalPoints;
        
        this.rewards = {
            basePoints,
            bonusPoints,
            speedBonus,
            streakBonus,
            perfectBonus,
            coinsEarned,
            experienceEarned,
            achievementsUnlocked: this.rewards?.achievementsUnlocked || []
        };
        
        return this.rewards;
    },

    // Добавить ответ
    addAnswer(questionId, userAnswer, isCorrect, pointsEarned, timeSpent, booster = 'none') {
        this.answers.push({
            question: questionId,
            userAnswer,
            isCorrect,
            pointsEarned,
            timeSpent,
            answeredAt: new Date(),
            usedBooster: booster
        });
        
        this.score += pointsEarned;
        this.calculateMetrics();
    },

    // Завершить попытку
    async complete() {
        this.status = 'completed';
        this.endTime = new Date();
        this.timeSpent = Math.floor((this.endTime - this.startTime) / 1000);
        
        await this.save();
        return this;
    },

    // Получить краткую статистику
    getSummary() {
        return {
            score: this.score,
            maxPossibleScore: this.maxPossibleScore,
            percentage: this.percentage,
            passed: this.passed,
            timeSpent: this.timeSpent,
            questionsCount: this.questionsCount,
            correctAnswers: this.metrics.correctAnswersCount,
            accuracy: Math.round(this.accuracy * 10) / 10,
            rewards: this.totalRewards,
            gameMode: this.gameMode,
            createdAt: this.createdAt
        };
    },

    // Сравнить с предыдущими результатами пользователя
    async compareWithHistory() {
        const previousResults = await mongoose.model('Result').find({
            user: this.user,
            quiz: this.quiz,
            status: 'completed',
            _id: { $ne: this._id }
        }).sort({ createdAt: -1 }).limit(5);
        
        if (previousResults.length === 0) {
            return { isFirstAttempt: true };
        }
        
        const bestPrevious = previousResults.reduce((best, current) => 
            current.score > best.score ? current : best
        );
        
        const lastAttempt = previousResults[0];
        
        return {
            isFirstAttempt: false,
            isPersonalBest: this.score > bestPrevious.score,
            improvementFromLast: this.score - lastAttempt.score,
            bestPreviousScore: bestPrevious.score,
            averagePreviousScore: previousResults.reduce((sum, r) => sum + r.score, 0) / previousResults.length,
            attemptNumber: previousResults.length + 1
        };
    }
};

// Статические методы
resultSchema.statics = {
    // Получить лидерборд для викторины
    async getLeaderboard(quizId, limit = 10, timeframe = 'all') {
        let dateFilter = {};
        
        if (timeframe === 'week') {
            const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
            dateFilter.createdAt = { $gte: weekAgo };
        } else if (timeframe === 'month') {
            const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
            dateFilter.createdAt = { $gte: monthAgo };
        }
        
        return await this.find({
            quiz: quizId,
            status: 'completed',
            ...dateFilter
        })
        .populate('user', 'username profile.avatar gameStats.level')
        .sort({ score: -1, timeSpent: 1 })
        .limit(limit);
    },

    // Получить статистику пользователя
    async getUserStats(userId, timeframe = 'all') {
        let dateFilter = {};
        
        if (timeframe === 'week') {
            const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
            dateFilter.createdAt = { $gte: weekAgo };
        }
        
        const pipeline = [
            { 
                $match: { 
                    user: mongoose.Types.ObjectId(userId), 
                    status: 'completed',
                    ...dateFilter
                } 
            },
            {
                $group: {
                    _id: null,
                    totalQuizzes: { $sum: 1 },
                    averageScore: { $avg: '$percentage' },
                    bestScore: { $max: '$percentage' },
                    totalTimeSpent: { $sum: '$timeSpent' },
                    totalRewards: { $sum: '$rewards.experienceEarned' },
                    passedQuizzes: {
                        $sum: { $cond: [{ $eq: ['$passed', true] }, 1, 0] }
                    }
                }
            }
        ];
        
        const stats = await this.aggregate(pipeline);
        return stats[0] || {};
    }
};

module.exports = mongoose.model('Result', resultSchema);