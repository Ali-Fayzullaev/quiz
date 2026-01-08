const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { authenticate, optionalAuth } = require('../middleware/auth');
const { validate } = require('../middleware/errorHandler');
const { quiz } = require('../utils/validation');
const {
    getQuizzes,
    getQuizById,
    createQuiz,
    updateQuiz,
    deleteQuiz,
    toggleQuizLike,
    getPopularQuizzes
} = require('../controllers/quizController');

// Настройка Multer для загрузки файлов
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/quiz-thumbnails/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'quiz-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Можно загружать только изображения'));
        }
    }
});

// Публичные маршруты
router.get('/', getQuizzes);
router.get('/popular', getPopularQuizzes);
// optionalAuth - получаем user если есть токен (для проверки приватных квизов)
router.get('/:id', optionalAuth, getQuizById);

// Тестовый роут
router.post('/test', (req, res) => {
    res.json({ message: 'Test route works' });
});

// Приватные маршруты (требуют аутентификации)
router.post('/', authenticate, upload.single('thumbnail'), createQuiz);
router.put('/:id', authenticate, upload.single('thumbnail'), updateQuiz);
router.delete('/:id', authenticate, deleteQuiz);
router.post('/:id/toggle-like', authenticate, toggleQuizLike);

module.exports = router;