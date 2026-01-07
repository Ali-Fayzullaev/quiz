const Quiz = require('../models/Quiz');
const Question = require('../models/Question'); 
const User = require('../models/User');
const { createResponse, asyncHandler } = require('../middleware/errorHandler');
const logger = require('../config/logger');
const { uploadImage, deleteImage } = require('../utils/cloudinary');
const mongoose = require('mongoose');

// @desc    Получить список викторин с фильтрацией и пагинацией
// @route   GET /api/quizzes
// @access  Public
const getQuizzes = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const { 
        category, 
        difficulty, 
        search, 
        sortBy = 'createdAt', 
        sortOrder = 'desc',
        creator,
        featured
    } = req.query;

    // Построение фильтров
    const filters = {};
    
    // В production показываем только опубликованные квизы
    if (process.env.NODE_ENV === 'production') {
        filters.status = 'published';
    } else {
        // В development показываем все квизы кроме удаленных
        filters.status = { $ne: 'deleted' };
    }
    
    if (category && category !== 'all') {
        filters.category = category;
    }
    
    if (difficulty && difficulty !== 'all') {
        filters.difficulty = difficulty;
    }
    
    if (creator) {
        filters.creator = creator;
    }
    
    if (featured === 'true') {
        filters.isOfficial = true;
    }
    
    if (search) {
        filters.$or = [
            { title: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } },
            { tags: { $in: [new RegExp(search, 'i')] } }
        ];
    }

    // Сортировка
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const quizzes = await Quiz.find(filters)
        .populate('creator', 'username profile.firstName profile.lastName profile.avatar')
        .sort(sortOptions)
        .limit(limit)
        .skip(skip)
        .lean();

    const total = await Quiz.countDocuments(filters);
    const totalPages = Math.ceil(total / limit);

    res.json(createResponse.success({
        quizzes,
        pagination: {
            currentPage: page,
            totalPages,
            totalItems: total,
            hasNext: page < totalPages,
            hasPrev: page > 1
        }
    }));
});

// @desc    Получить викторину по ID с вопросами
// @route   GET /api/quizzes/:id
// @access  Public
const getQuizById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json(createResponse.error('Неверный ID викторины'));
    }

    const quiz = await Quiz.findById(id)
        .populate('creator', 'username profile.firstName profile.lastName profile.avatar')
        .populate('questions')
        .lean();

    if (!quiz) {
        return res.status(404).json(createResponse.error('Викторина не найдена'));
    }

    // Увеличиваем счетчик просмотров
    await Quiz.findByIdAndUpdate(id, { $inc: { 'stats.views': 1 } });

    res.json(createResponse.success({ quiz }));
});

// @desc    Создать новую викторину
// @route   POST /api/quizzes
// @access  Private
const createQuiz = asyncHandler(async (req, res) => {
    const { 
        title, 
        description, 
        category, 
        difficulty, 
        tags, 
        settings,
        visibility = 'public',
        questions = [],
        timeLimit
    } = req.body;

    // Валидация
    if (!title || !description || !category) {
        return res.status(400).json(
            createResponse.error('Название, описание и категория обязательны')
        );
    }

    if (questions.length === 0) {
        return res.status(400).json(
            createResponse.error('Викторина должна содержать хотя бы один вопрос')
        );
    }

    // Создание викторины
    const quizData = {
        title,
        description,
        category,
        difficulty: difficulty || 'beginner',
        tags: tags || [],
        settings: {
            timeLimit: timeLimit || settings?.timeLimit || 30,
            showCorrectAnswers: settings?.showCorrectAnswers !== false,
            randomOrder: settings?.randomOrder || false,
            allowRetake: settings?.allowRetake !== false,
            passingScore: settings?.passingScore || 50
        },
        visibility,
        creator: req.user.id,
        // В режиме разработки сразу публикуем квиз
        status: process.env.NODE_ENV === 'development' ? 'published' : 'draft'
    };

    // Загрузка изображения если есть
    if (req.file) {
        try {
            const result = await uploadImage(req.file.path, 'quiz-thumbnails');
            quizData.thumbnail = {
                url: result.secure_url,
                cloudinaryId: result.public_id
            };
        } catch (error) {
            logger.error('Ошибка загрузки изображения:', error);
        }
    }

    const quiz = new Quiz(quizData);
    await quiz.save();

    // Создание вопросов
    const createdQuestions = [];
    for (const questionData of questions) {
        // Логируем входящие данные
        logger.info('Question data received:', JSON.stringify(questionData));
        
        // Преобразуем options из строк в объекты
        const formattedOptions = (questionData.options || []).map((opt, index) => {
            const text = typeof opt === 'string' ? opt : (opt.text || opt);
            return {
                text: text || `Option ${index + 1}`,
                isCorrect: index === (questionData.correctAnswer || 0),
                order: index
            };
        }).filter(opt => opt.text && opt.text.trim() !== '');

        // Проверяем, что есть хотя бы один вариант
        if (formattedOptions.length === 0) {
            logger.error('No valid options for question:', questionData.question);
            continue;
        }

        // Определяем тип вопроса для модели
        let questionType = 'single_choice';
        if (questionData.type === 'multiple-choice') {
            questionType = 'single_choice';
        } else if (questionData.type === 'true-false') {
            questionType = 'true_false';
        }

        const question = new Question({
            quiz: quiz._id,
            question: questionData.question,
            questionType: questionType,
            options: formattedOptions,
            settings: {
                points: questionData.points || 10,
                timeLimit: questionData.timeLimit || 30
            },
            explanation: {
                text: questionData.explanation || ''
            },
            createdBy: req.user.id
        });
        
        logger.info('Formatted options:', JSON.stringify(formattedOptions));
        
        await question.save();
        createdQuestions.push(question._id);
    }

    // Обновляем квиз с вопросами
    quiz.questions = createdQuestions;
    await quiz.save();

    await quiz.populate('creator', 'username profile.firstName profile.lastName profile.avatar');

    logger.info(`Создана новая викторина: ${quiz.title} (${quiz._id}) пользователем ${req.user.username}`);

    res.status(201).json(createResponse.success({ 
        quiz,
        message: 'Викторина успешно создана' 
    }));
});

// @desc    Обновить викторину
// @route   PUT /api/quizzes/:id
// @access  Private
const updateQuiz = asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json(createResponse.error('Неверный ID викторины'));
    }

    const quiz = await Quiz.findById(id);
    
    if (!quiz) {
        return res.status(404).json(createResponse.error('Викторина не найдена'));
    }

    // Проверка прав доступа
    if (quiz.creator.toString() !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json(createResponse.error('Нет прав для редактирования'));
    }

    const { questions, ...otherData } = req.body;
    const updateData = { ...otherData };
    updateData.updatedAt = new Date();

    // Обновление изображения если есть
    if (req.file) {
        try {
            // Удаляем старое изображение
            if (quiz.thumbnail?.cloudinaryId) {
                await deleteImage(quiz.thumbnail.cloudinaryId);
            }

            // Загружаем новое
            const result = await uploadImage(req.file.path, 'quiz-thumbnails');
            updateData.thumbnail = {
                url: result.secure_url,
                cloudinaryId: result.public_id
            };
        } catch (error) {
            logger.error('Ошибка обновления изображения:', error);
        }
    }

    // Обработка вопросов если они были переданы
    if (questions && Array.isArray(questions)) {
        // Удаляем старые вопросы
        await Question.deleteMany({ quiz: id });

        // Создаём новые вопросы
        const createdQuestions = [];
        for (const questionData of questions) {
            // Преобразуем options из строк в объекты
            const formattedOptions = (questionData.options || []).map((opt, index) => {
                const text = typeof opt === 'string' ? opt : (opt.text || opt);
                return {
                    text: text || `Option ${index + 1}`,
                    isCorrect: index === (questionData.correctAnswer || 0),
                    order: index
                };
            }).filter(opt => opt.text && opt.text.trim() !== '');

            // Проверяем, что есть хотя бы один вариант
            if (formattedOptions.length === 0) {
                logger.error('No valid options for question:', questionData.question);
                continue;
            }

            // Определяем тип вопроса для модели
            let questionType = 'single_choice';
            if (questionData.type === 'multiple-choice') {
                questionType = 'single_choice';
            } else if (questionData.type === 'true-false') {
                questionType = 'true_false';
            }

            // Обрабатываем explanation - может быть строкой или объектом
            let explanationText = '';
            if (typeof questionData.explanation === 'string') {
                explanationText = questionData.explanation;
            } else if (questionData.explanation && typeof questionData.explanation === 'object') {
                explanationText = questionData.explanation.text || '';
            }

            const question = new Question({
                quiz: id,
                question: questionData.question,
                questionType: questionType,
                options: formattedOptions,
                settings: {
                    points: questionData.points || 10,
                    timeLimit: questionData.timeLimit || 30
                },
                explanation: {
                    text: explanationText
                },
                createdBy: req.user.id
            });

            await question.save();
            createdQuestions.push(question._id);
        }

        updateData.questions = createdQuestions;
    }

    const updatedQuiz = await Quiz.findByIdAndUpdate(id, updateData, { 
        new: true, 
        runValidators: true 
    }).populate('creator', 'username profile.firstName profile.lastName profile.avatar')
      .populate('questions');

    logger.info(`Обновлена викторина: ${updatedQuiz.title} (${id}) пользователем ${req.user.username}`);

    res.json(createResponse.success({ 
        quiz: updatedQuiz,
        message: 'Викторина успешно обновлена' 
    }));
});

// @desc    Удалить викторину
// @route   DELETE /api/quizzes/:id
// @access  Private
const deleteQuiz = asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json(createResponse.error('Неверный ID викторины'));
    }

    const quiz = await Quiz.findById(id);
    
    if (!quiz) {
        return res.status(404).json(createResponse.error('Викторина не найдена'));
    }

    // Проверка прав доступа
    if (quiz.creator.toString() !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json(createResponse.error('Нет прав для удаления'));
    }

    // Удаление изображения из Cloudinary
    if (quiz.thumbnail?.cloudinaryId) {
        try {
            await deleteImage(quiz.thumbnail.cloudinaryId);
        } catch (error) {
            logger.error('Ошибка удаления изображения:', error);
        }
    }

    // Мягкое удаление (изменение статуса)
    quiz.status = 'deleted';
    await quiz.save();

    logger.info(`Удалена викторина: ${quiz.title} (${id}) пользователем ${req.user.username}`);

    res.json(createResponse.success({ 
        message: 'Викторина успешно удалена' 
    }));
});

// @desc    Лайкнуть/дизлайкнуть викторину
// @route   POST /api/quizzes/:id/like
// @access  Private
const toggleQuizLike = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json(createResponse.error('Неверный ID викторины'));
    }

    const quiz = await Quiz.findById(id);
    
    if (!quiz) {
        return res.status(404).json(createResponse.error('Викторина не найдена'));
    }

    const isLiked = quiz.likes.includes(userId);
    
    if (isLiked) {
        // Убираем лайк
        quiz.likes.pull(userId);
        quiz.stats.likes = Math.max(0, quiz.stats.likes - 1);
    } else {
        // Добавляем лайк
        quiz.likes.push(userId);
        quiz.stats.likes += 1;
    }

    await quiz.save();

    res.json(createResponse.success({ 
        isLiked: !isLiked,
        totalLikes: quiz.stats.likes,
        message: isLiked ? 'Лайк убран' : 'Лайк добавлен'
    }));
});

// @desc    Получить популярные викторины
// @route   GET /api/quizzes/popular
// @access  Public
const getPopularQuizzes = asyncHandler(async (req, res) => {
    const limit = parseInt(req.query.limit) || 10;
    
    const quizzes = await Quiz.find({ status: 'published' })
        .populate('creator', 'username profile.firstName profile.lastName profile.avatar')
        .sort({ 'stats.plays': -1, 'stats.likes': -1 })
        .limit(limit)
        .lean();

    res.json(createResponse.success({ quizzes }));
});

module.exports = {
    getQuizzes,
    getQuizById,
    createQuiz,
    updateQuiz,
    deleteQuiz,
    toggleQuizLike,
    getPopularQuizzes
};