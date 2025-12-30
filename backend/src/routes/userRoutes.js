const express = require('express');
const router = express.Router();
const { createResponse } = require('../middleware/errorHandler');

// @route   GET /api/users/:id
// @desc    Получить профиль пользователя
// @access  Public
router.get('/:id', (req, res) => {
    res.json(createResponse.success({ 
        message: 'User profile endpoint - в разработке',
        userId: req.params.id 
    }));
});

// @route   PUT /api/users/profile
// @desc    Обновить профиль пользователя
// @access  Private
router.put('/profile', (req, res) => {
    res.json(createResponse.success({ message: 'Update profile endpoint - в разработке' }));
});

// @route   GET /api/users/search
// @desc    Поиск пользователей
// @access  Private
router.get('/search', (req, res) => {
    res.json(createResponse.success({ message: 'Search users endpoint - в разработке' }));
});

// @route   POST /api/users/friends/add
// @desc    Добавить в друзья
// @access  Private
router.post('/friends/add', (req, res) => {
    res.json(createResponse.success({ message: 'Add friend endpoint - в разработке' }));
});

// @route   GET /api/users/leaderboard
// @desc    Глобальный лидерборд
// @access  Public
router.get('/leaderboard', (req, res) => {
    res.json(createResponse.success({ message: 'Leaderboard endpoint - в разработке' }));
});

module.exports = router;