const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const {
    startGame,
    submitAnswer,
    completeGame,
    getGameResults,
    getQuizLeaderboard
} = require('../controllers/gameController');

// @route   POST /api/game/start/:quizId
// @desc    Начать игру
// @access  Private
router.post('/start/:quizId', authenticate, startGame);

// @route   POST /api/game/answer
// @desc    Отправить ответ на вопрос
// @access  Private
router.post('/answer', authenticate, submitAnswer);

// @route   POST /api/game/complete
// @desc    Завершить игру
// @access  Private
router.post('/complete', authenticate, completeGame);

// @route   GET /api/game/results/:resultId
// @desc    Получить результаты игры
// @access  Private
router.get('/results/:resultId', authenticate, getGameResults);

// @route   GET /api/game/leaderboard/:quizId
// @desc    Получить лидерборд викторины
// @access  Public
router.get('/leaderboard/:quizId', getQuizLeaderboard);

module.exports = router;