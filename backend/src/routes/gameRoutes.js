const express = require('express');
const router = express.Router();
const { createResponse } = require('../middleware/errorHandler');

// @route   POST /api/game/start/:quizId
// @desc    Начать игру
// @access  Private
router.post('/start/:quizId', (req, res) => {
    res.json(createResponse.success({ 
        message: 'Start game endpoint - в разработке',
        quizId: req.params.quizId 
    }));
});

// @route   POST /api/game/answer
// @desc    Отправить ответ на вопрос
// @access  Private
router.post('/answer', (req, res) => {
    res.json(createResponse.success({ message: 'Submit answer endpoint - в разработке' }));
});

// @route   POST /api/game/complete
// @desc    Завершить игру
// @access  Private
router.post('/complete', (req, res) => {
    res.json(createResponse.success({ message: 'Complete game endpoint - в разработке' }));
});

// @route   GET /api/game/results/:resultId
// @desc    Получить результаты игры
// @access  Private
router.get('/results/:resultId', (req, res) => {
    res.json(createResponse.success({ 
        message: 'Get game results endpoint - в разработке',
        resultId: req.params.resultId 
    }));
});

// @route   GET /api/game/leaderboard/:quizId
// @desc    Получить лидерборд викторины
// @access  Public
router.get('/leaderboard/:quizId', (req, res) => {
    res.json(createResponse.success({ 
        message: 'Quiz leaderboard endpoint - в разработке',
        quizId: req.params.quizId 
    }));
});

module.exports = router;

module.exports = router;