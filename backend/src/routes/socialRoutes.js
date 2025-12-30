const express = require('express');
const router = express.Router();
const { createResponse } = require('../middleware/errorHandler');

// @route   GET /api/social/friends
// @desc    Получить список друзей
// @access  Private
router.get('/friends', (req, res) => {
    res.json(createResponse.success({ message: 'Get friends endpoint - в разработке' }));
});

// @route   POST /api/social/challenge
// @desc    Вызвать на дуэль
// @access  Private
router.post('/challenge', (req, res) => {
    res.json(createResponse.success({ message: 'Challenge user endpoint - в разработке' }));
});

// @route   GET /api/social/challenges
// @desc    Получить входящие вызовы
// @access  Private
router.get('/challenges', (req, res) => {
    res.json(createResponse.success({ message: 'Get challenges endpoint - в разработке' }));
});

// @route   POST /api/social/messages
// @desc    Отправить сообщение
// @access  Private
router.post('/messages', (req, res) => {
    res.json(createResponse.success({ message: 'Send message endpoint - в разработке' }));
});

// @route   GET /api/social/feed
// @desc    Получить ленту активности
// @access  Private
router.get('/feed', (req, res) => {
    res.json(createResponse.success({ message: 'Activity feed endpoint - в разработке' }));
});

module.exports = router;