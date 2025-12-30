const Joi = require('joi');

// Базовые схемы для повторного использования
const schemas = {
    // ID объектов MongoDB
    mongoId: Joi.string().regex(/^[0-9a-fA-F]{24}$/, 'valid mongo id').required(),
    
    // Пароль
    password: Joi.string()
        .min(6)
        .max(50)
        .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)'))
        .messages({
            'string.pattern.base': 'Пароль должен содержать минимум одну строчную букву, одну заглавную букву и одну цифру'
        }),
    
    // Email
    email: Joi.string()
        .email({ tlds: { allow: false } })
        .lowercase()
        .trim(),
    
    // Имя пользователя
    username: Joi.string()
        .alphanum()
        .min(3)
        .max(30)
        .lowercase()
        .trim(),
    
    // Пагинация
    pagination: {
        page: Joi.number().integer().min(1).default(1),
        limit: Joi.number().integer().min(1).max(100).default(10)
    },
    
    // Поиск
    search: Joi.string().trim().max(100).allow(''),
    
    // Категории викторин
    quizCategory: Joi.string().valid(
        'general', 'science', 'history', 'geography', 'sports', 
        'entertainment', 'art', 'literature', 'music', 'movies',
        'technology', 'nature', 'food', 'travel', 'languages',
        'mathematics', 'business', 'gaming', 'anime', 'custom'
    ),
    
    // Сложность
    difficulty: Joi.string().valid('beginner', 'intermediate', 'advanced', 'expert'),
    
    // Режимы игры
    gameMode: Joi.string().valid('classic', 'speed', 'survival', 'multiplayer')
};

// Схемы аутентификации
const authSchemas = {
    register: Joi.object({
        username: schemas.username.required(),
        email: schemas.email.required(),
        password: schemas.password.required(),
        firstName: Joi.string().min(1).max(50).trim().optional(),
        lastName: Joi.string().min(1).max(50).trim().optional(),
        dateOfBirth: Joi.date().max('now').optional(),
        country: Joi.string().max(100).optional()
    }),

    login: Joi.object({
        emailOrUsername: Joi.string().required(),
        password: Joi.string().required()
    }),

    forgotPassword: Joi.object({
        email: schemas.email.required()
    }),

    resetPassword: Joi.object({
        token: Joi.string().required(),
        newPassword: schemas.password.required(),
        confirmPassword: Joi.string().valid(Joi.ref('newPassword')).required()
            .messages({'any.only': 'Пароли не совпадают'})
    }),

    changePassword: Joi.object({
        currentPassword: Joi.string().required(),
        newPassword: schemas.password.required(),
        confirmPassword: Joi.string().valid(Joi.ref('newPassword')).required()
            .messages({'any.only': 'Пароли не совпадают'})
    }),

    refreshToken: Joi.object({
        refreshToken: Joi.string().required()
    }),

    verifyEmail: Joi.object({
        token: Joi.string().required()
    }),

    verifyCode: Joi.object({
        email: schemas.email.required(),
        code: Joi.string().length(6).pattern(/^\d{6}$/).required()
            .messages({
                'string.length': 'Код должен содержать 6 цифр',
                'string.pattern.base': 'Код должен содержать только цифры'
            })
    }),

    resendVerification: Joi.object({
        email: schemas.email.required()
    })
};

// Схемы пользователя
const userSchemas = {
    updateProfile: Joi.object({
        firstName: Joi.string().min(1).max(50).trim().allow(''),
        lastName: Joi.string().min(1).max(50).trim().allow(''),
        bio: Joi.string().max(500).trim().allow(''),
        dateOfBirth: Joi.date().max('now').allow(null),
        country: Joi.string().max(100).allow(''),
        timezone: Joi.string().max(50).allow('')
    }),

    updateSettings: Joi.object({
        notifications: Joi.object({
            email: Joi.boolean(),
            push: Joi.boolean(),
            weeklyReport: Joi.boolean(),
            friendRequests: Joi.boolean(),
            challenges: Joi.boolean()
        }).optional(),
        privacy: Joi.object({
            showProfile: Joi.boolean(),
            showStats: Joi.boolean(),
            allowFriendRequests: Joi.boolean()
        }).optional(),
        preferences: Joi.object({
            language: Joi.string().valid('ru', 'en', 'es', 'fr', 'de').default('ru'),
            theme: Joi.string().valid('light', 'dark', 'auto').default('auto'),
            soundEnabled: Joi.boolean().default(true)
        }).optional()
    }),

    addFriend: Joi.object({
        userId: schemas.mongoId
    }),

    searchUsers: Joi.object({
        query: schemas.search,
        ...schemas.pagination
    })
};

// Схемы викторины
const quizSchemas = {
    createQuiz: Joi.object({
        title: Joi.string().min(3).max(200).trim().required(),
        description: Joi.string().min(10).max(1000).trim().required(),
        category: schemas.quizCategory.required(),
        difficulty: schemas.difficulty.default('intermediate'),
        tags: Joi.array().items(Joi.string().max(30).trim()).max(10).default([]),
        visibility: Joi.string().valid('public', 'private', 'unlisted').default('public'),
        settings: Joi.object({
            timeLimit: Joi.number().integer().min(0).max(7200).default(0), // 2 часа максимум
            questionTimeLimit: Joi.number().integer().min(5).max(300).default(30), // 5 минут на вопрос
            attemptsAllowed: Joi.number().integer().min(1).max(10).default(3),
            showCorrectAnswers: Joi.boolean().default(true),
            showScoreAfterEachQuestion: Joi.boolean().default(false),
            shuffleQuestions: Joi.boolean().default(false),
            shuffleAnswers: Joi.boolean().default(true),
            passingScore: Joi.number().min(0).max(100).default(60),
            allowSkip: Joi.boolean().default(false),
            showProgress: Joi.boolean().default(true)
        }).optional()
    }),

    updateQuiz: Joi.object({
        title: Joi.string().min(3).max(200).trim(),
        description: Joi.string().min(10).max(1000).trim(),
        category: schemas.quizCategory,
        difficulty: schemas.difficulty,
        tags: Joi.array().items(Joi.string().max(30).trim()).max(10),
        visibility: Joi.string().valid('public', 'private', 'unlisted'),
        settings: Joi.object({
            timeLimit: Joi.number().integer().min(0).max(7200),
            questionTimeLimit: Joi.number().integer().min(5).max(300),
            attemptsAllowed: Joi.number().integer().min(1).max(10),
            showCorrectAnswers: Joi.boolean(),
            showScoreAfterEachQuestion: Joi.boolean(),
            shuffleQuestions: Joi.boolean(),
            shuffleAnswers: Joi.boolean(),
            passingScore: Joi.number().min(0).max(100),
            allowSkip: Joi.boolean(),
            showProgress: Joi.boolean()
        })
    }).min(1),

    searchQuizzes: Joi.object({
        query: schemas.search,
        category: schemas.quizCategory.optional(),
        difficulty: schemas.difficulty.optional(),
        tags: Joi.array().items(Joi.string().max(30)).optional(),
        sort: Joi.string().valid('popularity', 'newest', 'rating', 'attempts').default('popularity'),
        ...schemas.pagination
    }),

    rateQuiz: Joi.object({
        rating: Joi.number().integer().min(1).max(5).required(),
        comment: Joi.string().max(500).trim().optional()
    }),

    addComment: Joi.object({
        text: Joi.string().min(1).max(500).trim().required(),
        rating: Joi.number().integer().min(1).max(5).optional()
    })
};

// Схемы вопросов
const questionSchemas = {
    createQuestion: Joi.object({
        question: Joi.string().min(10).max(1000).trim().required(),
        questionType: Joi.string().valid('single_choice', 'multiple_choice', 'true_false', 'text_input', 'ordering', 'matching').default('single_choice'),
        options: Joi.array().items(
            Joi.object({
                text: Joi.string().min(1).max(200).trim().required(),
                isCorrect: Joi.boolean().default(false),
                explanation: Joi.string().max(500).trim().optional(),
                order: Joi.number().integer().min(0).default(0)
            })
        ).min(2).max(8).when('questionType', {
            is: Joi.string().valid('single_choice', 'multiple_choice'),
            then: Joi.array().required(),
            otherwise: Joi.optional()
        }),
        correctAnswers: Joi.array().items(
            Joi.object({
                text: Joi.string().trim().required(),
                caseSensitive: Joi.boolean().default(false)
            })
        ).when('questionType', {
            is: 'text_input',
            then: Joi.array().required().min(1),
            otherwise: Joi.optional()
        }),
        settings: Joi.object({
            points: Joi.number().integer().min(1).max(100).default(10),
            timeLimit: Joi.number().integer().min(0).max(600).default(30),
            difficulty: Joi.string().valid('easy', 'medium', 'hard').default('medium'),
            allowPartialCredit: Joi.boolean().default(false),
            showExplanation: Joi.boolean().default(true)
        }).optional(),
        explanation: Joi.object({
            text: Joi.string().max(1000).trim().optional(),
            links: Joi.array().items(
                Joi.object({
                    title: Joi.string().max(100).trim().required(),
                    url: Joi.string().uri().required()
                })
            ).max(3).optional()
        }).optional(),
        tags: Joi.array().items(Joi.string().max(30).trim()).max(5).default([]),
        order: Joi.number().integer().min(0).default(0)
    }),

    updateQuestion: Joi.object({
        question: Joi.string().min(10).max(1000).trim(),
        questionType: Joi.string().valid('single_choice', 'multiple_choice', 'true_false', 'text_input', 'ordering', 'matching'),
        options: Joi.array().items(
            Joi.object({
                _id: schemas.mongoId.optional(),
                text: Joi.string().min(1).max(200).trim().required(),
                isCorrect: Joi.boolean().default(false),
                explanation: Joi.string().max(500).trim().optional(),
                order: Joi.number().integer().min(0).default(0)
            })
        ).min(2).max(8),
        correctAnswers: Joi.array().items(
            Joi.object({
                text: Joi.string().trim().required(),
                caseSensitive: Joi.boolean().default(false)
            })
        ),
        settings: Joi.object({
            points: Joi.number().integer().min(1).max(100),
            timeLimit: Joi.number().integer().min(0).max(600),
            difficulty: Joi.string().valid('easy', 'medium', 'hard'),
            allowPartialCredit: Joi.boolean(),
            showExplanation: Joi.boolean()
        }),
        explanation: Joi.object({
            text: Joi.string().max(1000).trim().optional(),
            links: Joi.array().items(
                Joi.object({
                    title: Joi.string().max(100).trim().required(),
                    url: Joi.string().uri().required()
                })
            ).max(3).optional()
        }),
        tags: Joi.array().items(Joi.string().max(30).trim()).max(5),
        order: Joi.number().integer().min(0)
    }).min(1),

    reorderQuestions: Joi.object({
        questions: Joi.array().items(
            Joi.object({
                id: schemas.mongoId,
                order: Joi.number().integer().min(0).required()
            })
        ).min(1).required()
    })
};

// Схемы игры
const gameSchemas = {
    startQuiz: Joi.object({
        gameMode: schemas.gameMode.default('classic'),
        settings: Joi.object({
            shuffleQuestions: Joi.boolean().optional(),
            shuffleAnswers: Joi.boolean().optional()
        }).optional()
    }),

    submitAnswer: Joi.object({
        sessionId: Joi.string().required(),
        questionId: schemas.mongoId,
        answer: Joi.alternatives().try(
            Joi.string(), // для single_choice (ID опции) и text
            Joi.boolean(), // для true_false
            Joi.array().items(Joi.string()) // для multiple_choice
        ).required(),
        timeSpent: Joi.number().min(0).max(3600) // максимум час на вопрос
    }),

    completeGame: Joi.object({
        sessionId: Joi.string().required()
    }),

    getLeaderboard: Joi.object({
        timeFrame: Joi.string().valid('all', 'today', 'week', 'month').default('all'),
        limit: Joi.number().integer().min(1).max(50).default(10)
    })
};

// Схемы для мультиплеера
const multiplayerSchemas = {
    createRoom: Joi.object({
        quizId: schemas.mongoId,
        maxPlayers: Joi.number().integer().min(2).max(10).default(4),
        isPrivate: Joi.boolean().default(false),
        settings: Joi.object({
            waitTime: Joi.number().integer().min(10).max(120).default(30), // секунды ожидания игроков
            questionTime: Joi.number().integer().min(10).max(60).default(30)
        }).optional()
    }),

    joinRoom: Joi.object({
        roomId: Joi.string().required()
    }),

    inviteToRoom: Joi.object({
        roomId: Joi.string().required(),
        userId: schemas.mongoId
    })
};

// Схемы для социальных функций
const socialSchemas = {
    challengeUser: Joi.object({
        opponentId: schemas.mongoId,
        quizId: schemas.mongoId,
        message: Joi.string().max(200).trim().optional()
    }),

    acceptChallenge: Joi.object({
        challengeId: schemas.mongoId
    }),

    sendMessage: Joi.object({
        recipientId: schemas.mongoId,
        content: Joi.string().min(1).max(1000).trim().required(),
        type: Joi.string().valid('text', 'quiz_invite', 'challenge').default('text')
    })
};

// Схемы администрирования
const adminSchemas = {
    banUser: Joi.object({
        userId: schemas.mongoId,
        reason: Joi.string().max(500).trim().required(),
        duration: Joi.number().integer().min(1).optional() // дни, если не указано - перманентно
    }),

    moderateContent: Joi.object({
        contentType: Joi.string().valid('quiz', 'comment', 'user').required(),
        contentId: schemas.mongoId,
        action: Joi.string().valid('approve', 'reject', 'flag').required(),
        reason: Joi.string().max(500).trim().optional()
    }),

    createAnnouncement: Joi.object({
        title: Joi.string().min(3).max(100).trim().required(),
        content: Joi.string().min(10).max(1000).trim().required(),
        type: Joi.string().valid('info', 'warning', 'update', 'event').default('info'),
        targetAudience: Joi.string().valid('all', 'premium', 'creators').default('all'),
        expiresAt: Joi.date().greater('now').optional()
    })
};

module.exports = {
    schemas,
    auth: authSchemas,
    user: userSchemas,
    quiz: quizSchemas,
    question: questionSchemas,
    game: gameSchemas,
    multiplayer: multiplayerSchemas,
    social: socialSchemas,
    admin: adminSchemas
};