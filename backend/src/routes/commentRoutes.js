const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Comment = require('../models/Comment');
const Quiz = require('../models/Quiz');
const Result = require('../models/Result');
const { authenticate } = require('../middleware/auth');
const { asyncHandler, createResponse } = require('../middleware/errorHandler');
const logger = require('../config/logger');

// @route   GET /api/quizzes/:quizId/comments
// @desc    Получить комментарии к квизу
// @access  Public
router.get('/:quizId/comments', asyncHandler(async (req, res) => {
    const { quizId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    if (!mongoose.Types.ObjectId.isValid(quizId)) {
        return res.status(400).json(createResponse.error('Неверный ID квиза'));
    }

    const skip = (page - 1) * limit;

    const comments = await Comment.find({ 
        quiz: quizId, 
        parentComment: null,
        status: 'active' 
    })
    .populate('user', 'username profile.avatar profile.firstName profile.lastName')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

    const total = await Comment.countDocuments({ 
        quiz: quizId, 
        parentComment: null,
        status: 'active' 
    });

    // Получаем ответы на комментарии
    const commentsWithReplies = await Promise.all(comments.map(async (comment) => {
        const replies = await Comment.find({
            parentComment: comment._id,
            status: 'active'
        })
        .populate('user', 'username profile.avatar profile.firstName profile.lastName')
        .sort({ createdAt: 1 })
        .lean();

        return {
            ...comment,
            replies,
            likesCount: comment.likes?.length || 0
        };
    }));

    res.json(createResponse.success({
        comments: commentsWithReplies,
        pagination: {
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalItems: total,
            hasNext: page < Math.ceil(total / limit),
            hasPrev: page > 1
        }
    }));
}));

// @route   POST /api/quizzes/:quizId/comments
// @desc    Добавить комментарий к квизу
// @access  Private
router.post('/:quizId/comments', authenticate, asyncHandler(async (req, res) => {
    const { quizId } = req.params;
    const { text, rating, parentComment } = req.body;

    if (!mongoose.Types.ObjectId.isValid(quizId)) {
        return res.status(400).json(createResponse.error('Неверный ID квиза'));
    }

    if (!text || text.trim().length === 0) {
        return res.status(400).json(createResponse.error('Текст комментария обязателен'));
    }

    // Проверяем существование квиза
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
        return res.status(404).json(createResponse.error('Квиз не найден'));
    }

    // Если это ответ, проверяем существование родительского комментария
    if (parentComment) {
        const parent = await Comment.findById(parentComment);
        if (!parent) {
            return res.status(404).json(createResponse.error('Родительский комментарий не найден'));
        }
    }

    const comment = new Comment({
        quiz: quizId,
        user: req.user.id,
        text: text.trim(),
        rating: rating || undefined,
        parentComment: parentComment || null
    });

    await comment.save();
    await comment.populate('user', 'username profile.avatar profile.firstName profile.lastName');

    logger.info(`Новый комментарий к квизу ${quizId} от пользователя ${req.user.username}`);

    res.status(201).json(createResponse.success({
        comment: {
            ...comment.toJSON(),
            likesCount: 0,
            replies: []
        }
    }, 'Комментарий добавлен'));
}));

// @route   PUT /api/quizzes/:quizId/comments/:commentId
// @desc    Редактировать комментарий
// @access  Private
router.put('/:quizId/comments/:commentId', authenticate, asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const { text } = req.body;

    const comment = await Comment.findById(commentId);

    if (!comment) {
        return res.status(404).json(createResponse.error('Комментарий не найден'));
    }

    if (comment.user.toString() !== req.user.id) {
        return res.status(403).json(createResponse.error('Нет прав для редактирования'));
    }

    comment.text = text.trim();
    comment.isEdited = true;
    comment.editedAt = new Date();

    await comment.save();
    await comment.populate('user', 'username profile.avatar profile.firstName profile.lastName');

    res.json(createResponse.success({ comment }, 'Комментарий обновлён'));
}));

// @route   DELETE /api/quizzes/:quizId/comments/:commentId
// @desc    Удалить комментарий
// @access  Private
router.delete('/:quizId/comments/:commentId', authenticate, asyncHandler(async (req, res) => {
    const { quizId, commentId } = req.params;

    const comment = await Comment.findById(commentId);

    if (!comment) {
        return res.status(404).json(createResponse.error('Комментарий не найден'));
    }

    // Проверяем права (автор или владелец квиза)
    const quiz = await Quiz.findById(quizId);
    const isOwner = comment.user.toString() === req.user.id;
    const isQuizOwner = quiz && quiz.creator.toString() === req.user.id;

    if (!isOwner && !isQuizOwner && req.user.role !== 'admin') {
        return res.status(403).json(createResponse.error('Нет прав для удаления'));
    }

    comment.status = 'deleted';
    await comment.save();

    res.json(createResponse.success(null, 'Комментарий удалён'));
}));

// @route   POST /api/quizzes/:quizId/comments/:commentId/like
// @desc    Лайкнуть комментарий
// @access  Private
router.post('/:quizId/comments/:commentId/like', authenticate, asyncHandler(async (req, res) => {
    const { commentId } = req.params;

    const comment = await Comment.findById(commentId);

    if (!comment) {
        return res.status(404).json(createResponse.error('Комментарий не найден'));
    }

    const userId = req.user.id;
    const likeIndex = comment.likes.findIndex(id => id.toString() === userId);

    if (likeIndex > -1) {
        // Убираем лайк
        comment.likes.splice(likeIndex, 1);
    } else {
        // Добавляем лайк
        comment.likes.push(userId);
    }

    await comment.save();

    res.json(createResponse.success({
        liked: likeIndex === -1,
        likesCount: comment.likes.length
    }));
}));

// @route   GET /api/quizzes/:quizId/stats
// @desc    Получить статистику квиза (для владельца)
// @access  Private
router.get('/:quizId/stats', authenticate, asyncHandler(async (req, res) => {
    const { quizId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(quizId)) {
        return res.status(400).json(createResponse.error('Неверный ID квиза'));
    }

    const quiz = await Quiz.findById(quizId).populate('creator', 'username');

    if (!quiz) {
        return res.status(404).json(createResponse.error('Квиз не найден'));
    }

    // Проверяем права доступа (владелец или админ)
    if (quiz.creator._id.toString() !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json(createResponse.error('Нет доступа к статистике'));
    }

    // Получаем все результаты прохождения
    const results = await Result.find({ quiz: quizId, status: 'completed' })
        .populate('user', 'username profile.avatar profile.firstName profile.lastName')
        .sort({ createdAt: -1 })
        .lean();

    // Вычисляем статистику
    const totalAttempts = results.length;
    const passedCount = results.filter(r => r.passed).length;
    const averageScore = totalAttempts > 0 
        ? results.reduce((sum, r) => sum + r.percentage, 0) / totalAttempts 
        : 0;
    const averageTime = totalAttempts > 0
        ? results.reduce((sum, r) => sum + (r.timeSpent || 0), 0) / totalAttempts
        : 0;

    // Топ-10 лучших результатов
    const topResults = [...results]
        .sort((a, b) => b.percentage - a.percentage || a.timeSpent - b.timeSpent)
        .slice(0, 10);

    // Последние 20 прохождений
    const recentResults = results.slice(0, 20).map(r => ({
        _id: r._id,
        user: r.user,
        score: r.score,
        maxScore: r.maxPossibleScore,
        percentage: r.percentage,
        passed: r.passed,
        timeSpent: r.timeSpent,
        correctAnswers: r.metrics?.correctAnswersCount || 0,
        incorrectAnswers: r.metrics?.incorrectAnswersCount || 0,
        completedAt: r.endTime || r.createdAt
    }));

    // Распределение по оценкам
    const scoreDistribution = {
        excellent: results.filter(r => r.percentage >= 90).length,  // 90-100%
        good: results.filter(r => r.percentage >= 70 && r.percentage < 90).length,  // 70-89%
        average: results.filter(r => r.percentage >= 50 && r.percentage < 70).length,  // 50-69%
        poor: results.filter(r => r.percentage < 50).length  // < 50%
    };

    // Статистика по времени (последние 30 дней)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const dailyStats = {};
    results.forEach(r => {
        if (new Date(r.createdAt) >= thirtyDaysAgo) {
            const day = new Date(r.createdAt).toISOString().split('T')[0];
            if (!dailyStats[day]) {
                dailyStats[day] = { attempts: 0, passed: 0 };
            }
            dailyStats[day].attempts++;
            if (r.passed) dailyStats[day].passed++;
        }
    });

    res.json(createResponse.success({
        quiz: {
            _id: quiz._id,
            title: quiz.title,
            views: quiz.stats?.views || 0,
            likes: quiz.social?.likes?.length || 0,
            createdAt: quiz.createdAt
        },
        statistics: {
            totalAttempts,
            passedCount,
            failedCount: totalAttempts - passedCount,
            passRate: totalAttempts > 0 ? ((passedCount / totalAttempts) * 100).toFixed(1) : 0,
            averageScore: averageScore.toFixed(1),
            averageTime: Math.round(averageTime)
        },
        scoreDistribution,
        topResults,
        recentResults,
        dailyStats: Object.entries(dailyStats).map(([date, data]) => ({
            date,
            ...data
        })).sort((a, b) => a.date.localeCompare(b.date))
    }));
}));

module.exports = router;
