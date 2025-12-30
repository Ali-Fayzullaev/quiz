const winston = require('winston');
const path = require('path');

// Создаем директорию для логов если её нет
const fs = require('fs');
const logDir = path.join(process.cwd(), 'logs');

if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
}

// Кастомный формат для логов
const customFormat = winston.format.combine(
    winston.format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss'
    }),
    winston.format.errors({ stack: true }),
    winston.format.json(),
    winston.format.colorize({ all: true })
);

// Формат для консоли (более читаемый)
const consoleFormat = winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp({
        format: 'HH:mm:ss'
    }),
    winston.format.printf(({ level, message, timestamp, stack }) => {
        const logMessage = stack || message;
        return `${timestamp} [${level}]: ${logMessage}`;
    })
);

// Создаем транспорты
const transports = [];

// Консольный транспорт (всегда включен)
transports.push(
    new winston.transports.Console({
        level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
        format: consoleFormat
    })
);

// Файловые транспорты (только в production)
if (process.env.NODE_ENV === 'production') {
    transports.push(
        // Все логи
        new winston.transports.File({
            filename: path.join(logDir, 'app.log'),
            level: 'info',
            format: customFormat,
            maxsize: 10485760, // 10MB
            maxFiles: 5
        }),
        // Только ошибки
        new winston.transports.File({
            filename: path.join(logDir, 'error.log'),
            level: 'error',
            format: customFormat,
            maxsize: 10485760, // 10MB
            maxFiles: 5
        })
    );
}

// Создаем основной logger
const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: customFormat,
    transports,
    // Не выходить из приложения при ошибке логирования
    exitOnError: false
});

// Обработка необработанных исключений и промисов
if (process.env.NODE_ENV === 'production') {
    logger.exceptions.handle(
        new winston.transports.File({
            filename: path.join(logDir, 'exceptions.log'),
            format: customFormat
        })
    );

    logger.rejections.handle(
        new winston.transports.File({
            filename: path.join(logDir, 'rejections.log'),
            format: customFormat
        })
    );
}

// Создаем stream для morgan
logger.stream = {
    write: (message) => {
        logger.info(message.trim());
    }
};

// Дополнительные методы для удобства
logger.request = (req, message = '') => {
    const logData = {
        method: req.method,
        url: req.originalUrl,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        userId: req.user ? req.user.id : 'anonymous'
    };
    
    logger.info(`${message} ${JSON.stringify(logData)}`);
};

logger.performance = (label, startTime) => {
    const duration = Date.now() - startTime;
    logger.info(`⏱️ Performance [${label}]: ${duration}ms`);
};

logger.websocket = (socketId, userId, event, data = {}) => {
    logger.info(`🔌 WebSocket [${socketId}] User: ${userId}, Event: ${event}`, data);
};

logger.database = (query, duration, collection = '') => {
    logger.debug(`🗄️ Database [${collection}] Query: ${query}, Duration: ${duration}ms`);
};

logger.security = (type, details) => {
    logger.warn(`🔒 Security [${type}]: ${JSON.stringify(details)}`);
};

module.exports = logger;