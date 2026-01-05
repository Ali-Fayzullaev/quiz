const Quiz = require('../models/Quiz');
const Question = require('../models/Question');
const Result = require('../models/Result');
const User = require('../models/User');
const Achievement = require('../models/Achievement');
const { createResponse, asyncHandler } = require('../middleware/errorHandler');
const logger = require('../config/logger');
const mongoose = require('mongoose');

// Активные игровые сессии
const activeSessions = new Map();

// @desc    Начать игру (одиночную)
// @route   POST /api/game/start/:quizId
// @access  Private
const startGame = asyncHandler(async (req, res) => {
    const { quizId } = req.params;
    const userId = req.user.id;
    
    if (!mongoose.Types.ObjectId.isValid(quizId)) {
        return res.status(400).json(createResponse.error('Неверный ID викторины'));
    }

    // Получаем викторину с вопросами
    const quiz = await Quiz.findById(quizId)
        .populate('questions')
        .lean();

    if (!quiz || quiz.status !== 'published') {
        return res.status(404).json(createResponse.error('Викторина не найдена или недоступна'));
    }

    if (!quiz.questions || quiz.questions.length === 0) {
        return res.status(400).json(createResponse.error('В викторине нет вопросов'));
    }

    // Проверяем, можно ли повторно проходить викторину
    if (!quiz.settings.allowRetake) {
        const existingResult = await Result.findOne({ 
            user: userId, 
            quiz: quizId,
            status: 'completed'
        });
        
        if (existingResult) {
            return res.status(409).json(createResponse.error(
                'Повторное прохождение викторины не разрешено'
            ));
        }
    }

    // Создаем игровую сессию
    const sessionId = new mongoose.Types.ObjectId();
    const startTime = new Date();
    
    // Перемешиваем вопросы если нужно
    let questions = quiz.questions;
    if (quiz.settings?.randomOrder) {
        questions = shuffleArray([...questions]);
    }

    // Убираем правильные ответы из вопросов для клиента
    const clientQuestions = questions.map(q => ({
        _id: q._id,
        text: q.question,  // В модели поле называется question
        type: q.questionType || 'single_choice',
        options: (q.options || []).map(opt => ({ _id: opt._id, text: opt.text })),
        media: q.media,
        points: q.settings?.points || 10,
        timeLimit: q.settings?.timeLimit || quiz.settings?.timeLimit || 30
    }));

    // Сохраняем сессию в памяти
    activeSessions.set(sessionId.toString(), {
        sessionId,
        userId,
        quizId,
        questions: questions,
        currentQuestionIndex: 0,
        answers: [],
        score: 0,
        startTime,
        timeSpent: 0,
        status: 'active'
    });

    // Вычисляем максимально возможный балл
    const maxPossibleScore = questions.reduce((sum, q) => sum + (q.settings?.points || 10), 0);

    // Создаем запись результата в БД
    const result = new Result({
        _id: sessionId,
        user: userId,
        quiz: quizId,
        status: 'in_progress',
        startTime: startTime,
        answers: [],
        score: 0,
        maxPossibleScore: maxPossibleScore,
        percentage: 0,
        totalQuestions: questions.length
    });
    
    await result.save();

    // Обновляем статистику викторины
    await Quiz.findByIdAndUpdate(quizId, { 
        $inc: { 'stats.plays': 1 } 
    });

    logger.info(`Игра началась: ${sessionId} - пользователь ${req.user.username}, викторина ${quiz.title}`);

    res.json(createResponse.success({
        sessionId,
        quiz: {
            _id: quiz._id,
            title: quiz.title,
            description: quiz.description,
            category: quiz.category,
            difficulty: quiz.difficulty,
            totalQuestions: questions.length,
            timeLimit: quiz.settings.timeLimit,
            passingScore: quiz.settings.passingScore
        },
        questions: clientQuestions,
        currentQuestion: 0,
        timeLimit: quiz.settings.timeLimit,
        message: 'Игра началась!'
    }));
});

// @desc    Отправить ответ на вопрос
// @route   POST /api/game/answer
// @access  Private
const submitAnswer = asyncHandler(async (req, res) => {
    const { sessionId, questionId, answer, timeSpent } = req.body;
    const userId = req.user.id;

    if (!sessionId || !questionId || answer === undefined) {
        return res.status(400).json(createResponse.error('Все поля обязательны'));
    }

    const session = activeSessions.get(sessionId);
    
    if (!session || session.userId !== userId) {
        return res.status(404).json(createResponse.error('Игровая сессия не найдена'));
    }

    if (session.status !== 'active') {
        return res.status(409).json(createResponse.error('Игровая сессия завершена'));
    }

    const currentQuestion = session.questions[session.currentQuestionIndex];
    
    if (!currentQuestion || currentQuestion._id.toString() !== questionId) {
        return res.status(400).json(createResponse.error('Неверный вопрос'));
    }

    // Проверяем правильность ответа
    let isCorrect = false;
    let points = 0;
    
    const questionType = currentQuestion.questionType || currentQuestion.type || 'single_choice';
    
    if (questionType === 'single_choice' || questionType === 'multiple-choice' || questionType === 'multiple_choice') {
        const correctOption = currentQuestion.options.find(opt => opt.isCorrect);
        isCorrect = correctOption && correctOption._id.toString() === answer;
    } else if (questionType === 'true_false' || questionType === 'true-false') {
        const correctOption = currentQuestion.options.find(opt => opt.isCorrect);
        isCorrect = correctOption && correctOption._id.toString() === answer;
    } else if (questionType === 'text_input' || questionType === 'text') {
        const correctAnswers = currentQuestion.correctAnswers || [];
        isCorrect = correctAnswers.some(correct => 
            answer.toLowerCase().trim() === correct.text?.toLowerCase().trim()
        );
    }

    if (isCorrect) {
        // Начисляем очки с учетом времени
        const maxTime = currentQuestion.settings?.timeLimit || 30;
        const questionPoints = currentQuestion.settings?.points || 10;
        const timeBonus = Math.max(0, (maxTime - (timeSpent || 0)) / maxTime);
        points = Math.round(questionPoints * (0.5 + 0.5 * timeBonus));
        session.score += points;
    }

    // Сохраняем ответ
    const answerData = {
        questionId,
        answer,
        isCorrect,
        points,
        timeSpent: timeSpent || 0,
        answeredAt: new Date()
    };
    
    session.answers.push(answerData);
    session.currentQuestionIndex++;

    // Обновляем результат в БД
    await Result.findByIdAndUpdate(sessionId, {
        $push: { answers: answerData },
        $set: { 
            score: session.score,
            timeSpent: Date.now() - session.startTime.getTime()
        }
    });

    const isLastQuestion = session.currentQuestionIndex >= session.questions.length;

    if (isLastQuestion) {
        // Завершаем игру
        session.status = 'completed';
        return completeGameSession(session, res);
    }

    // Возвращаем следующий вопрос
    const nextQuestion = session.questions[session.currentQuestionIndex];
    const clientNextQuestion = {
        _id: nextQuestion._id,
        text: nextQuestion.text,
        type: nextQuestion.type,
        options: nextQuestion.options.map(opt => ({ _id: opt._id, text: opt.text })),
        media: nextQuestion.media,
        points: nextQuestion.points,
        timeLimit: nextQuestion.timeLimit || 30
    };

    res.json(createResponse.success({
        correct: isCorrect,
        points,
        totalScore: session.score,
        correctAnswer: currentQuestion.type === 'multiple-choice' 
            ? currentQuestion.options.find(opt => opt.isCorrect)?.text
            : currentQuestion.correctAnswer,
        nextQuestion: clientNextQuestion,
        questionNumber: session.currentQuestionIndex + 1,
        totalQuestions: session.questions.length
    }));
});

// @desc    Завершить игру
// @route   POST /api/game/complete
// @access  Private
const completeGame = asyncHandler(async (req, res) => {
    const { sessionId } = req.body;
    const userId = req.user.id;

    if (!sessionId) {
        return res.status(400).json(createResponse.error('ID сессии обязателен'));
    }

    const session = activeSessions.get(sessionId);
    
    if (!session || session.userId !== userId) {
        return res.status(404).json(createResponse.error('Игровая сессия не найдена'));
    }

    session.status = 'completed';
    return completeGameSession(session, res);
});

// Вспомогательная функция для завершения игровой сессии
const completeGameSession = async (session, res) => {
    const endTime = new Date();
    const totalTimeSpent = endTime.getTime() - session.startTime.getTime();
    
    // Вычисляем процент правильных ответов
    const correctAnswers = session.answers.filter(a => a.isCorrect).length;
    const percentage = Math.round((correctAnswers / session.questions.length) * 100);
    
    // Определяем прошел ли игрок викторину
    const quiz = await Quiz.findById(session.quizId);
    const passed = percentage >= (quiz.settings.passingScore || 50);

    // Обновляем результат в БД
    const result = await Result.findByIdAndUpdate(session.sessionId, {
        status: 'completed',
        completedAt: endTime,
        timeSpent: totalTimeSpent,
        score: session.score,
        percentage,
        passed,
        correctAnswers,
        totalQuestions: session.questions.length
    }, { new: true }).populate('quiz', 'title difficulty category');

    // Обновляем статистику пользователя
    const user = await User.findById(session.userId);
    user.stats.gamesPlayed += 1;
    user.stats.totalScore += session.score;
    
    if (passed) {
        user.stats.gamesWon += 1;
        user.stats.averageScore = Math.round(user.stats.totalScore / user.stats.gamesWon);
        
        // Добавляем опыт и очки
        const expGained = Math.round(session.score * 0.1);
        user.gamification.experience += expGained;
        user.gamification.points += session.score;
        
        // Проверяем повышение уровня
        checkLevelUp(user);
    }

    await user.save();

    // Проверяем достижения
    await checkAchievements(session.userId, result, user);

    // Удаляем сессию из памяти
    activeSessions.delete(session.sessionId.toString());

    logger.info(`Игра завершена: ${session.sessionId} - результат: ${percentage}% (${session.score} очков)`);

    res.json(createResponse.success({
        result: {
            sessionId: session.sessionId,
            score: session.score,
            percentage,
            passed,
            correctAnswers,
            totalQuestions: session.questions.length,
            timeSpent: Math.round(totalTimeSpent / 1000), // в секундах
            quiz: result.quiz
        },
        userStats: {
            gamesPlayed: user.stats.gamesPlayed,
            gamesWon: user.stats.gamesWon,
            averageScore: user.stats.averageScore,
            level: user.gamification.level,
            experience: user.gamification.experience,
            points: user.gamification.points
        },
        message: passed ? 'Поздравляем! Вы успешно прошли викторину!' : 'Викторина не пройдена. Попробуйте еще раз!'
    }));
};

// @desc    Получить результаты игры
// @route   GET /api/game/results/:resultId
// @access  Private
const getGameResults = asyncHandler(async (req, res) => {
    const { resultId } = req.params;
    const userId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(resultId)) {
        return res.status(400).json(createResponse.error('Неверный ID результата'));
    }

    const result = await Result.findById(resultId)
        .populate('quiz', 'title description difficulty category settings')
        .populate('user', 'username profile.firstName profile.lastName profile.avatar')
        .lean();

    if (!result) {
        return res.status(404).json(createResponse.error('Результат не найден'));
    }

    // Проверяем права доступа
    if (result.user._id.toString() !== userId && req.user.role !== 'admin') {
        return res.status(403).json(createResponse.error('Нет прав для просмотра этого результата'));
    }

    res.json(createResponse.success({ result }));
});

// @desc    Получить лидерборд викторины
// @route   GET /api/game/leaderboard/:quizId
// @access  Public
const getQuizLeaderboard = asyncHandler(async (req, res) => {
    const { quizId } = req.params;
    const limit = parseInt(req.query.limit) || 10;
    const timeFrame = req.query.timeFrame || 'all'; // all, today, week, month

    if (!mongoose.Types.ObjectId.isValid(quizId)) {
        return res.status(400).json(createResponse.error('Неверный ID викторины'));
    }

    // Строим фильтр по времени
    const timeFilters = {};
    const now = new Date();
    
    switch (timeFrame) {
        case 'today':
            timeFilters.completedAt = { 
                $gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()) 
            };
            break;
        case 'week':
            timeFilters.completedAt = { 
                $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) 
            };
            break;
        case 'month':
            timeFilters.completedAt = { 
                $gte: new Date(now.getFullYear(), now.getMonth(), 1) 
            };
            break;
    }

    const results = await Result.find({
        quiz: quizId,
        status: 'completed',
        passed: true,
        ...timeFilters
    })
    .populate('user', 'username profile.firstName profile.lastName profile.avatar gamification.level')
    .sort({ score: -1, timeSpent: 1 })
    .limit(limit)
    .lean();

    const leaderboard = results.map((result, index) => ({
        rank: index + 1,
        user: result.user,
        score: result.score,
        percentage: result.percentage,
        timeSpent: Math.round(result.timeSpent / 1000), // в секундах
        completedAt: result.completedAt
    }));

    res.json(createResponse.success({ leaderboard }));
});

// Вспомогательные функции

const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
};

const checkLevelUp = (user) => {
    const currentLevel = user.gamification.level;
    const newLevel = Math.floor(user.gamification.experience / 1000) + 1;
    
    if (newLevel > currentLevel) {
        user.gamification.level = newLevel;
        user.gamification.points += newLevel * 100; // Бонус за повышение уровня
        logger.info(`Пользователь ${user.username} повысился до уровня ${newLevel}`);
    }
};

const checkAchievements = async (userId, result, user) => {
    const achievements = [];
    
    // Проверяем различные достижения
    if (user.stats.gamesPlayed === 1) {
        achievements.push('first_game');
    }
    
    if (user.stats.gamesWon === 10) {
        achievements.push('winner_10');
    }
    
    if (result.percentage === 100) {
        achievements.push('perfect_score');
    }
    
    if (user.gamification.level >= 10) {
        achievements.push('level_10');
    }

    // Сохраняем новые достижения
    for (const achievementCode of achievements) {
        const hasAchievement = user.gamification.achievements.some(
            a => a.code === achievementCode
        );
        
        if (!hasAchievement) {
            const achievement = await Achievement.findOne({ code: achievementCode });
            if (achievement) {
                user.gamification.achievements.push({
                    achievement: achievement._id,
                    code: achievementCode,
                    unlockedAt: new Date()
                });
                
                user.gamification.points += achievement.points;
                logger.info(`Пользователь ${user.username} получил достижение: ${achievement.name}`);
            }
        }
    }
};

module.exports = {
    startGame,
    submitAnswer,
    completeGame,
    getGameResults,
    getQuizLeaderboard
};