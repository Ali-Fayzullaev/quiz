const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    // Привязка к викторине
    quiz: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Quiz',
        required: true
    },

    // Основная информация о вопросе
    question: {
        type: String,
        required: [true, 'Текст вопроса обязателен'],
        trim: true,
        maxlength: [1000, 'Вопрос не должен превышать 1000 символов']
    },
    questionType: {
        type: String,
        enum: ['single_choice', 'multiple_choice', 'true_false', 'text_input', 'ordering', 'matching'],
        default: 'single_choice'
    },

    // Медиа-контент
    media: {
        type: {
            type: String,
            enum: ['none', 'image', 'audio', 'video']
        },
        url: String,
        cloudinaryId: String,
        altText: String
    },

    // Варианты ответов
    options: [{
        text: {
            type: String,
            required: true,
            maxlength: 200
        },
        isCorrect: {
            type: Boolean,
            default: false
        },
        explanation: {
            type: String,
            maxlength: 500
        },
        media: {
            url: String,
            cloudinaryId: String
        },
        order: {
            type: Number,
            default: 0
        }
    }],

    // Для текстовых вопросов
    correctAnswers: [{
        text: {
            type: String,
            trim: true
        },
        caseSensitive: {
            type: Boolean,
            default: false
        }
    }],

    // Настройки вопроса
    settings: {
        points: {
            type: Number,
            default: 10,
            min: 1,
            max: 100
        },
        timeLimit: {
            type: Number, // секунды, 0 = без лимита
            default: 30
        },
        difficulty: {
            type: String,
            enum: ['easy', 'medium', 'hard'],
            default: 'medium'
        },
        allowPartialCredit: {
            type: Boolean,
            default: false
        },
        showExplanation: {
            type: Boolean,
            default: true
        }
    },

    // Объяснение и дополнительная информация
    explanation: {
        text: {
            type: String,
            maxlength: 1000
        },
        media: {
            url: String,
            cloudinaryId: String
        },
        links: [{
            title: String,
            url: String
        }]
    },

    // Теги для классификации
    tags: [{
        type: String,
        trim: true,
        maxlength: 30
    }],

    // Позиция в викторине
    order: {
        type: Number,
        default: 0
    },

    // Статистика
    stats: {
        totalAnswers: {
            type: Number,
            default: 0
        },
        correctAnswers: {
            type: Number,
            default: 0
        },
        averageTime: {
            type: Number,
            default: 0
        },
        skipCount: {
            type: Number,
            default: 0
        }
    },

    // Метаданные
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    version: {
        type: Number,
        default: 1
    },
    isActive: {
        type: Boolean,
        default: true
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
questionSchema.index({ quiz: 1, order: 1 });
questionSchema.index({ questionType: 1 });
questionSchema.index({ 'settings.difficulty': 1 });
questionSchema.index({ tags: 1 });

// Виртуальные поля
questionSchema.virtual('correctRate').get(function() {
    if (this.stats.totalAnswers === 0) return 0;
    return (this.stats.correctAnswers / this.stats.totalAnswers) * 100;
});

questionSchema.virtual('difficultyScore').get(function() {
    const correctRate = this.correctRate;
    if (correctRate >= 80) return 'easy';
    if (correctRate >= 50) return 'medium';
    return 'hard';
});

// Middleware
questionSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    
    // Валидация в зависимости от типа вопроса
    if (this.questionType === 'single_choice' || this.questionType === 'multiple_choice') {
        if (!this.options || this.options.length < 2) {
            return next(new Error('Вопрос с выбором должен иметь минимум 2 варианта'));
        }
        
        const correctOptions = this.options.filter(option => option.isCorrect);
        if (this.questionType === 'single_choice' && correctOptions.length !== 1) {
            return next(new Error('Вопрос с одним выбором должен иметь ровно один правильный ответ'));
        }
        if (this.questionType === 'multiple_choice' && correctOptions.length < 1) {
            return next(new Error('Вопрос с множественным выбором должен иметь минимум один правильный ответ'));
        }
    }
    
    if (this.questionType === 'text_input' && (!this.correctAnswers || this.correctAnswers.length === 0)) {
        return next(new Error('Текстовый вопрос должен иметь минимум один правильный ответ'));
    }
    
    next();
});

// Методы
questionSchema.methods = {
    // Проверка ответа пользователя
    checkAnswer(userAnswer, timeSpent = null) {
        let isCorrect = false;
        let score = 0;
        let feedback = '';
        
        switch (this.questionType) {
            case 'single_choice':
                const selectedOption = this.options.find(opt => 
                    opt._id.toString() === userAnswer.optionId
                );
                isCorrect = selectedOption && selectedOption.isCorrect;
                score = isCorrect ? this.settings.points : 0;
                feedback = isCorrect ? 'Правильно!' : `Неправильно. Правильный ответ: ${this.getCorrectOptionsText()}`;
                break;
                
            case 'multiple_choice':
                const selectedOptions = userAnswer.optionIds || [];
                const correctOptions = this.options.filter(opt => opt.isCorrect).map(opt => opt._id.toString());
                
                const correctSelected = selectedOptions.filter(id => correctOptions.includes(id));
                const incorrectSelected = selectedOptions.filter(id => !correctOptions.includes(id));
                
                if (this.settings.allowPartialCredit) {
                    const partialScore = (correctSelected.length - incorrectSelected.length) / correctOptions.length;
                    score = Math.max(0, partialScore * this.settings.points);
                    isCorrect = partialScore > 0.5;
                } else {
                    isCorrect = correctSelected.length === correctOptions.length && incorrectSelected.length === 0;
                    score = isCorrect ? this.settings.points : 0;
                }
                
                feedback = isCorrect ? 'Правильно!' : `Правильные ответы: ${this.getCorrectOptionsText()}`;
                break;
                
            case 'true_false':
                isCorrect = userAnswer.answer === this.options[0].isCorrect;
                score = isCorrect ? this.settings.points : 0;
                break;
                
            case 'text_input':
                const userText = (userAnswer.text || '').trim();
                isCorrect = this.correctAnswers.some(correct => {
                    const correctText = correct.caseSensitive ? correct.text : correct.text.toLowerCase();
                    const compareText = correct.caseSensitive ? userText : userText.toLowerCase();
                    return correctText === compareText;
                });
                score = isCorrect ? this.settings.points : 0;
                break;
        }
        
        // Бонус за скорость (если указано время)
        if (timeSpent && isCorrect && this.settings.timeLimit > 0) {
            const speedBonus = Math.max(0, (this.settings.timeLimit - timeSpent) / this.settings.timeLimit * 0.2);
            score = Math.round(score * (1 + speedBonus));
        }
        
        // Обновляем статистику
        this.updateStats(isCorrect, timeSpent);
        
        return {
            isCorrect,
            score,
            feedback,
            explanation: this.settings.showExplanation ? this.explanation : null,
            correctAnswer: !isCorrect ? this.getCorrectAnswer() : null
        };
    },

    // Получить правильный ответ
    getCorrectAnswer() {
        switch (this.questionType) {
            case 'single_choice':
            case 'multiple_choice':
                return this.options.filter(opt => opt.isCorrect);
            case 'text_input':
                return this.correctAnswers;
            case 'true_false':
                return this.options[0].isCorrect;
            default:
                return null;
        }
    },

    // Получить текст правильных вариантов
    getCorrectOptionsText() {
        const correctOptions = this.options.filter(opt => opt.isCorrect);
        return correctOptions.map(opt => opt.text).join(', ');
    },

    // Обновить статистику
    updateStats(isCorrect, timeSpent = null) {
        this.stats.totalAnswers += 1;
        if (isCorrect) {
            this.stats.correctAnswers += 1;
        }
        
        if (timeSpent !== null) {
            const totalTime = this.stats.averageTime * (this.stats.totalAnswers - 1) + timeSpent;
            this.stats.averageTime = totalTime / this.stats.totalAnswers;
        }
    },

    // Получить вопрос для игрока (без правильных ответов)
    getForPlayer() {
        const question = this.toObject();
        
        // Убираем информацию о правильных ответах
        if (question.options) {
            question.options = question.options.map(option => ({
                _id: option._id,
                text: option.text,
                media: option.media,
                order: option.order
            }));
        }
        
        delete question.correctAnswers;
        delete question.explanation;
        delete question.stats;
        
        return question;
    }
};

// Статические методы
questionSchema.statics = {
    // Получить вопросы для викторины в случайном порядке
    async getShuffledQuestions(quizId, userId = null) {
        const questions = await this.find({ quiz: quizId, isActive: true })
            .sort({ order: 1 });
        
        // Можно добавить логику персонализации на основе истории ответов пользователя
        
        return questions.map(q => q.getForPlayer());
    },

    // Получить статистику по сложности вопросов
    async getDifficultyStats(quizId) {
        const pipeline = [
            { $match: { quiz: mongoose.Types.ObjectId(quizId), isActive: true } },
            {
                $addFields: {
                    correctRate: {
                        $cond: [
                            { $eq: ['$stats.totalAnswers', 0] },
                            0,
                            { $multiply: [{ $divide: ['$stats.correctAnswers', '$stats.totalAnswers'] }, 100] }
                        ]
                    }
                }
            },
            {
                $bucket: {
                    groupBy: '$correctRate',
                    boundaries: [0, 50, 80, 100],
                    default: 'unknown',
                    output: {
                        count: { $sum: 1 },
                        questions: { $push: '$_id' }
                    }
                }
            }
        ];
        
        return await this.aggregate(pipeline);
    }
};

module.exports = mongoose.model('Question', questionSchema);