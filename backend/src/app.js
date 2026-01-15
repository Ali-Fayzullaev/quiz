require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const http = require('http');
const socketIo = require('socket.io');

// Импорт конфигураций
const connectDB = require('./config/database');
const { connectRedis } = require('./config/redis');
const logger = require('./config/logger');

// Импорт маршрутов
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const quizRoutes = require('./routes/quizRoutes');
const gameRoutes = require('./routes/gameRoutes');
const socialRoutes = require('./routes/socialRoutes');
const adminRoutes = require('./routes/adminRoutes');
const commentRoutes = require('./routes/commentRoutes');
const vocabularyRoutes = require('./routes/vocabularyRoutes');
const friendsRoutes = require('./routes/friendsRoutes');

// Импорт middleware
const { errorHandler } = require('./middleware/errorHandler');
const { authenticateSocket } = require('./middleware/auth');

// Импорт WebSocket обработчиков
const socketHandlers = require('./socket/socketHandlers');

class QuizApp {
    constructor() {
        this.app = express();
        this.server = http.createServer(this.app);
        this.io = socketIo(this.server, {
            cors: {
                origin: process.env.FRONTEND_URL || "http://localhost:5173",
                methods: ["GET", "POST"],
                credentials: true
            }
        });
        this.port = process.env.PORT || 5000;
    }

    async initialize() {
        try {
            // Подключение к базам данных
            await connectDB();
            
            // Пытаемся подключиться к Redis (опционально)
            // try {
            //     await connectRedis();
            // } catch (error) {
            //     logger.warn('⚠️ Redis недоступен, продолжаем без кэширования:', error.message);
            // }

            // Настройка middleware
            this.setupMiddleware();
            
            // Настройка маршрутов
            this.setupRoutes();
            
            // Настройка WebSocket
            this.setupWebSocket();
            
            // Обработка ошибок (должен быть последним)
            this.setupErrorHandling();

            logger.info('✅ Приложение успешно инициализировано');
        } catch (error) {
            logger.error('❌ Ошибка инициализации приложения:', error);
            process.exit(1);
        }
    }

    setupMiddleware() {
        // Безопасность
        this.app.use(helmet({
            contentSecurityPolicy: false, // Отключаем для разработки
            crossOriginEmbedderPolicy: false
        }));

        // CORS
        this.app.use(cors({
            origin: [
                'http://localhost:5173',
                'http://localhost:5174',
                'http://localhost:5175',
                'http://localhost:3000',
                process.env.FRONTEND_URL
            ].filter(Boolean),
            credentials: true,
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization', 'x-refresh-token']
        }));

        // Сжатие ответов
        this.app.use(compression());

        // Логирование запросов
        if (process.env.NODE_ENV === 'development') {
            this.app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) }}));
        }

        // Парсинг JSON
        this.app.use(express.json({ 
            limit: process.env.UPLOAD_LIMIT || '10mb',
            extended: true 
        }));
        this.app.use(express.urlencoded({ 
            extended: true,
            limit: process.env.UPLOAD_LIMIT || '10mb'
        }));

        // Rate limiting
        const limiter = rateLimit({
            windowMs: 15 * 60 * 1000, // 15 минут
            max: process.env.NODE_ENV === 'production' ? 100 : 1000, // Лимит запросов
            message: {
                error: 'Слишком много запросов с вашего IP. Попробуйте позже.',
                retryAfter: '15 минут'
            },
            standardHeaders: true,
            legacyHeaders: false,
        });

        this.app.use('/api/', limiter);

        // Статические файлы
        this.app.use('/uploads', express.static('uploads'));

        logger.info('✅ Middleware настроен');
    }

    setupRoutes() {
        // Здоровье приложения
        this.app.get('/health', (req, res) => {
            res.status(200).json({
                status: 'OK',
                timestamp: new Date().toISOString(),
                uptime: process.uptime(),
                memory: process.memoryUsage(),
                version: require('../package.json').version
            });
        });

        // API маршруты
        this.app.use('/api/auth', authRoutes);
        this.app.use('/api/users', userRoutes);
        this.app.use('/api/quizzes', quizRoutes);
        this.app.use('/api/quizzes', commentRoutes); // Комментарии и статистика
        this.app.use('/api/game', gameRoutes);
        this.app.use('/api/social', socialRoutes);
        this.app.use('/api/admin', adminRoutes);
        this.app.use('/api/vocabulary', vocabularyRoutes);
        this.app.use('/api/friends', friendsRoutes);

        // Главная страница API
        this.app.get('/api', (req, res) => {
            res.json({
                message: '🎯 Quiz API Server',
                version: '1.0.0',
                endpoints: {
                    auth: '/api/auth',
                    users: '/api/users',
                    quizzes: '/api/quizzes',
                    game: '/api/game',
                    social: '/api/social',
                    admin: '/api/admin'
                },
                docs: '/api/docs',
                health: '/health'
            });
        });

        // 404 для несуществующих маршрутов
        this.app.all('*', (req, res) => {
            res.status(404).json({
                error: 'Маршрут не найден',
                path: req.originalUrl,
                method: req.method,
                timestamp: new Date().toISOString()
            });
        });

        logger.info('✅ Маршруты настроены');
    }

    setupWebSocket() {
        // Middleware для аутентификации WebSocket соединений
        this.io.use(authenticateSocket);

        // Обработчики WebSocket событий
        this.io.on('connection', (socket) => {
            logger.info(`👤 Пользователь подключился: ${socket.userId} (${socket.id})`);
            
            // Регистрируем все обработчики
            socketHandlers.registerHandlers(socket, this.io);

            socket.on('disconnect', (reason) => {
                logger.info(`👋 Пользователь отключился: ${socket.userId} (${reason})`);
            });
        });

        logger.info('✅ WebSocket настроен');
    }

    setupErrorHandling() {
        // Временно отключили error handler для тестирования
        // this.app.use(errorHandler);

        // Глобальная обработка необработанных промисов
        process.on('unhandledRejection', (reason, promise) => {
            logger.error('❌ Unhandled Rejection:', reason);
            // Graceful shutdown
            this.server.close(() => {
                process.exit(1);
            });
        });

        // Глобальная обработка неперехваченных исключений
        process.on('uncaughtException', (error) => {
            logger.error('❌ Uncaught Exception:', error);
            process.exit(1);
        });

        // Graceful shutdown
        process.on('SIGTERM', () => {
            logger.info('👋 SIGTERM received. Shutting down gracefully...');
            this.server.close(() => {
                logger.info('💤 Process terminated');
            });
        });

        logger.info('✅ Обработчики ошибок настроены');
    }

    start() {
        this.server.listen(this.port, () => {
            logger.info(`🚀 Сервер запущен на порту ${this.port}`);
            logger.info(`🌍 Окружение: ${process.env.NODE_ENV}`);
            logger.info(`📡 WebSocket готов к соединениям`);
            logger.info(`🔗 API доступно по адресу: http://localhost:${this.port}/api`);
        });
    }
}

// Запуск приложения
const quizApp = new QuizApp();

async function startServer() {
    try {
        await quizApp.initialize();
        quizApp.start();
    } catch (error) {
        logger.error('❌ Не удалось запустить сервер:', error);
        process.exit(1);
    }
}

startServer();

module.exports = quizApp;