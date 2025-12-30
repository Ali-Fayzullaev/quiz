const express = require('express');
const router = express.Router();
const { createResponse } = require('../middleware/errorHandler');

// @route   GET /api/admin/users
// @desc    Получить список пользователей (админ)
// @access  Admin
router.get('/users', (req, res) => {
    res.json(createResponse.success({ message: 'Admin users list endpoint - в разработке' }));
});

// @route   POST /api/admin/users/:id/ban
// @desc    Заблокировать пользователя
// @access  Admin
router.post('/users/:id/ban', (req, res) => {
    res.json(createResponse.success({ 
        message: 'Ban user endpoint - в разработке',
        userId: req.params.id 
    }));
});

// @route   GET /api/admin/quizzes
// @desc    Получить все викторины для модерации
// @access  Moderator
router.get('/quizzes', (req, res) => {
    res.json(createResponse.success({ message: 'Admin quizzes endpoint - в разработке' }));
});

// @route   GET /api/admin/stats
// @desc    Получить статистику системы
// @access  Admin
router.get('/stats', (req, res) => {
    res.json(createResponse.success({ message: 'Admin stats endpoint - в разработке' }));
});

// @route   POST /api/admin/announcements
// @desc    Создать объявление
// @access  Admin
router.post('/announcements', (req, res) => {
    res.json(createResponse.success({ message: 'Create announcement endpoint - в разработке' }));
});

module.exports = router;