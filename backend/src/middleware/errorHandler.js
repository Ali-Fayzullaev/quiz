const logger = require('../config/logger');

// Кастомные классы ошибок
class AppError extends Error {
    constructor(message, statusCode, code = null) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.isOperational = true;
        
        Error.captureStackTrace(this, this.constructor);
    }
}

class ValidationError extends AppError {
    constructor(message, errors = []) {
        super(message, 400, 'VALIDATION_ERROR');
        this.errors = errors;
    }
}

class AuthenticationError extends AppError {
    constructor(message = 'Ошибка аутентификации') {
        super(message, 401, 'AUTHENTICATION_ERROR');
    }
}

class AuthorizationError extends AppError {
    constructor(message = 'Недостаточно прав доступа') {
        super(message, 403, 'AUTHORIZATION_ERROR');
    }
}

class NotFoundError extends AppError {
    constructor(message = 'Ресурс не найден') {
        super(message, 404, 'NOT_FOUND');
    }
}

class ConflictError extends AppError {
    constructor(message = 'Конфликт данных') {
        super(message, 409, 'CONFLICT_ERROR');
    }
}

class RateLimitError extends AppError {
    constructor(message = 'Превышен лимит запросов') {
        super(message, 429, 'RATE_LIMIT_EXCEEDED');
    }
}

// Обработка ошибок MongoDB
const handleMongoError = (error) => {
    if (error.code === 11000) {
        // Дублирование уникальных полей
        const field = Object.keys(error.keyValue)[0];
        const value = error.keyValue[field];
        
        const friendlyFieldNames = {
            email: 'Email',
            username: 'Имя пользователя',
            title: 'Название'
        };
        
        const fieldName = friendlyFieldNames[field] || field;
        
        return new ConflictError(`${fieldName} "${value}" уже используется`);
    }
    
    if (error.name === 'ValidationError') {
        const errors = Object.values(error.errors).map(err => ({
            field: err.path,
            message: err.message,
            value: err.value
        }));
        
        return new ValidationError('Ошибка валидации данных', errors);
    }
    
    if (error.name === 'CastError') {
        return new ValidationError(`Неверный формат поля ${error.path}: ${error.value}`);
    }
    
    return error;
};

// Обработка ошибок JWT
const handleJWTError = (error) => {
    if (error.name === 'JsonWebTokenError') {
        return new AuthenticationError('Недействительный токен');
    }
    
    if (error.name === 'TokenExpiredError') {
        return new AuthenticationError('Токен истек');
    }
    
    if (error.name === 'NotBeforeError') {
        return new AuthenticationError('Токен еще не активен');
    }
    
    return error;
};

// Форматирование ошибки для отправки клиенту
const formatErrorResponse = (error, req) => {
    const response = {
        error: error.message,
        timestamp: new Date().toISOString(),
        path: req.originalUrl,
        method: req.method
    };
    
    if (error.code) {
        response.code = error.code;
    }
    
    if (error.errors && Array.isArray(error.errors)) {
        response.details = error.errors;
    }
    
    // В разработке показываем больше информации
    if (process.env.NODE_ENV === 'development') {
        response.stack = error.stack;
    }
    
    return response;
};

// Основной middleware для обработки ошибок
const errorHandler = (error, req, res, next) => {
    let err = { ...error };
    err.message = error.message;
    
    // Логируем ошибку
    logger.error('Error caught by error handler:', {
        error: err.message,
        stack: err.stack,
        url: req.originalUrl,
        method: req.method,
        user: req.user ? req.user._id : 'anonymous',
        ip: req.ip
    });
    
    // Обрабатываем различные типы ошибок
    if (error.name === 'MongoError' || error.name === 'ValidationError' || error.code === 11000) {
        err = handleMongoError(error);
    }
    
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError' || error.name === 'NotBeforeError') {
        err = handleJWTError(error);
    }
    
    // Устанавливаем статус код по умолчанию
    const statusCode = err.statusCode || 500;
    
    // Формируем ответ
    const response = formatErrorResponse(err, req);
    
    // Если это серверная ошибка (500), скрываем детали в продакшене
    if (statusCode === 500 && process.env.NODE_ENV === 'production') {
        response.error = 'Внутренняя ошибка сервера';
        delete response.stack;
    }
    
    res.status(statusCode).json(response);
};

// Middleware для обработки 404 ошибок
const notFound = (req, res, next) => {
    const error = new NotFoundError(`Маршрут ${req.originalUrl} не найден`);
    next(error);
};

// Middleware для обработки асинхронных ошибок
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

// Middleware для валидации данных с помощью Joi
const validate = (schema, source = 'body') => {
    return (req, res, next) => {
        const data = req[source];
        const { error, value } = schema.validate(data, {
            abortEarly: false, // Показать все ошибки
            allowUnknown: true, // Разрешить неизвестные поля
            stripUnknown: true // Удалить неизвестные поля
        });
        
        if (error) {
            const errors = error.details.map(detail => ({
                field: detail.path.join('.'),
                message: detail.message,
                value: detail.context.value
            }));
            
            return next(new ValidationError('Ошибка валидации данных', errors));
        }
        
        // Заменяем данные валидированными и очищенными
        req[source] = value;
        next();
    };
};

// Middleware для логирования запросов с ошибками
const logErrors = (req, res, next) => {
    const originalSend = res.send;
    
    res.send = function(data) {
        // Логируем если статус код указывает на ошибку
        if (res.statusCode >= 400) {
            logger.request(req, `Error response: ${res.statusCode}`);
        }
        
        originalSend.call(this, data);
    };
    
    next();
};

// Middleware для мониторинга производительности
const performanceMonitor = (req, res, next) => {
    const startTime = Date.now();
    
    res.on('finish', () => {
        const duration = Date.now() - startTime;
        
        // Логируем медленные запросы (более 1 секунды)
        if (duration > 1000) {
            logger.performance(`Slow request: ${req.method} ${req.originalUrl}`, startTime);
        }
        
        // Добавляем заголовок с временем выполнения
        res.set('X-Response-Time', `${duration}ms`);
    });
    
    next();
};

// Middleware для обработки CORS ошибок
const handleCorsError = (req, res, next) => {
    if (req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Origin', process.env.FRONTEND_URL || '*');
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, x-refresh-token');
        res.header('Access-Control-Max-Age', '86400');
        return res.sendStatus(200);
    }
    
    next();
};

// Утилита для создания стандартных ответов
const createResponse = {
    success: (data = null, message = 'Успешно', meta = {}) => ({
        success: true,
        message,
        data,
        meta,
        timestamp: new Date().toISOString()
    }),
    
    error: (message = 'Ошибка', code = 'UNKNOWN_ERROR', details = null) => ({
        success: false,
        error: message,
        code,
        details,
        timestamp: new Date().toISOString()
    }),
    
    paginated: (data, totalCount, page, limit) => ({
        success: true,
        data,
        pagination: {
            currentPage: page,
            totalPages: Math.ceil(totalCount / limit),
            totalItems: totalCount,
            itemsPerPage: limit,
            hasNextPage: page * limit < totalCount,
            hasPrevPage: page > 1
        },
        timestamp: new Date().toISOString()
    })
};

module.exports = {
    // Классы ошибок
    AppError,
    ValidationError,
    AuthenticationError,
    AuthorizationError,
    NotFoundError,
    ConflictError,
    RateLimitError,
    
    // Middleware
    errorHandler,
    notFound,
    asyncHandler,
    validate,
    logErrors,
    performanceMonitor,
    handleCorsError,
    
    // Утилиты
    createResponse,
    handleMongoError,
    handleJWTError,
    formatErrorResponse
};