const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('../config/logger');
const { cacheUtils } = require('../config/redis');

// Создание JWT токена
const generateToken = (payload, expiresIn = process.env.JWT_EXPIRE) => {
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
};

// Создание refresh токена
const generateRefreshToken = (payload) => {
    return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '30d' });
};

// Middleware для проверки JWT токена
const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.header('Authorization');
        
        if (!authHeader) {
            return res.status(401).json({ 
                error: 'Токен доступа не предоставлен',
                code: 'NO_TOKEN' 
            });
        }

        const token = authHeader.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ 
                error: 'Неверный формат токена',
                code: 'INVALID_TOKEN_FORMAT' 
            });
        }

        // Проверяем кэш на случай отозванных токенов
        const isBlacklisted = await cacheUtils.get(`blacklist_token:${token}`);
        if (isBlacklisted) {
            return res.status(401).json({ 
                error: 'Токен отозван',
                code: 'TOKEN_REVOKED' 
            });
        }

        // Проверяем токен
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Получаем пользователя (с кэшированием)
        let user = await cacheUtils.get(`user:${decoded.id}`);
        
        if (!user) {
            user = await User.findById(decoded.id).select('-password');
            if (!user) {
                return res.status(401).json({ 
                    error: 'Пользователь не найден',
                    code: 'USER_NOT_FOUND' 
                });
            }
            
            // Кэшируем пользователя на 15 минут
            await cacheUtils.set(`user:${decoded.id}`, user, 900);
        }

        // Проверяем статус пользователя
        if (user.status === 'banned') {
            return res.status(403).json({ 
                error: 'Аккаунт заблокирован',
                code: 'ACCOUNT_BANNED' 
            });
        }

        if (user.status === 'inactive') {
            return res.status(403).json({ 
                error: 'Аккаунт деактивирован',
                code: 'ACCOUNT_INACTIVE' 
            });
        }

        // Обновляем время последней активности
        user.lastSeen = new Date();
        await user.save();

        req.user = user;
        req.token = token;
        
        logger.request(req, `User authenticated: ${user.username}`);
        next();
    } catch (error) {
        logger.error('Authentication error:', error);
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ 
                error: 'Недействительный токен',
                code: 'INVALID_TOKEN' 
            });
        }
        
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ 
                error: 'Токен истек',
                code: 'TOKEN_EXPIRED' 
            });
        }
        
        res.status(500).json({ 
            error: 'Ошибка аутентификации',
            code: 'AUTH_ERROR' 
        });
    }
};

// Опциональная аутентификация (не требует токена, но использует его если есть)
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.header('Authorization');
        
        if (!authHeader) {
            req.user = null;
            return next();
        }

        const token = authHeader.replace('Bearer ', '');
        
        if (!token) {
            req.user = null;
            return next();
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password');
        
        if (user && user.status === 'active') {
            req.user = user;
            req.token = token;
        } else {
            req.user = null;
        }
        
        next();
    } catch (error) {
        req.user = null;
        next();
    }
};

// Проверка ролей пользователя
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ 
                error: 'Требуется аутентификация',
                code: 'AUTH_REQUIRED' 
            });
        }

        if (!roles.includes(req.user.role)) {
            logger.security('unauthorized_access', {
                userId: req.user._id,
                requiredRoles: roles,
                userRole: req.user.role,
                endpoint: req.originalUrl
            });
            
            return res.status(403).json({ 
                error: 'Недостаточно прав доступа',
                code: 'INSUFFICIENT_PERMISSIONS',
                required: roles,
                current: req.user.role
            });
        }

        next();
    };
};

// Проверка владельца ресурса
const authorizeOwnership = (resourceField = 'user') => {
    return async (req, res, next) => {
        try {
            if (!req.user) {
                return res.status(401).json({ 
                    error: 'Требуется аутентификация',
                    code: 'AUTH_REQUIRED' 
                });
            }

            // Админы могут получить доступ к любому ресурсу
            if (req.user.role === 'admin') {
                return next();
            }

            const resourceId = req.params.id;
            const resourceModel = req.resourceModel; // Должна быть установлена в контроллере
            
            if (!resourceModel || !resourceId) {
                return res.status(400).json({ 
                    error: 'Не удалось проверить владельца ресурса',
                    code: 'OWNERSHIP_CHECK_FAILED' 
                });
            }

            const resource = await resourceModel.findById(resourceId);
            
            if (!resource) {
                return res.status(404).json({ 
                    error: 'Ресурс не найден',
                    code: 'RESOURCE_NOT_FOUND' 
                });
            }

            const ownerId = resource[resourceField];
            
            if (!ownerId || !ownerId.equals(req.user._id)) {
                logger.security('unauthorized_resource_access', {
                    userId: req.user._id,
                    resourceId,
                    resourceType: resourceModel.modelName,
                    ownerId
                });
                
                return res.status(403).json({ 
                    error: 'У вас нет прав на этот ресурс',
                    code: 'NOT_RESOURCE_OWNER' 
                });
            }

            req.resource = resource;
            next();
        } catch (error) {
            logger.error('Ownership authorization error:', error);
            res.status(500).json({ 
                error: 'Ошибка проверки прав доступа',
                code: 'OWNERSHIP_ERROR' 
            });
        }
    };
};

// Middleware для проверки подтверждения email
const requireEmailVerification = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ 
            error: 'Требуется аутентификация',
            code: 'AUTH_REQUIRED' 
        });
    }

    if (!req.user.isVerified) {
        return res.status(403).json({ 
            error: 'Требуется подтверждение email',
            code: 'EMAIL_NOT_VERIFIED' 
        });
    }

    next();
};

// Middleware для rate limiting по пользователю
const rateLimitByUser = (maxRequests = 100, windowMs = 15 * 60 * 1000) => {
    return async (req, res, next) => {
        if (!req.user) {
            return next();
        }

        const key = `rate_limit:${req.user._id}:${Date.now() / windowMs | 0}`;
        
        try {
            const current = await cacheUtils.incr(key, windowMs / 1000);
            
            if (current > maxRequests) {
                logger.security('rate_limit_exceeded', {
                    userId: req.user._id,
                    requests: current,
                    limit: maxRequests,
                    endpoint: req.originalUrl
                });
                
                return res.status(429).json({ 
                    error: 'Превышен лимит запросов',
                    code: 'RATE_LIMIT_EXCEEDED',
                    limit: maxRequests,
                    windowMs,
                    retryAfter: Math.ceil(windowMs / 1000)
                });
            }

            res.set({
                'X-RateLimit-Limit': maxRequests,
                'X-RateLimit-Remaining': Math.max(0, maxRequests - current),
                'X-RateLimit-Reset': new Date(Date.now() + windowMs).toISOString()
            });

            next();
        } catch (error) {
            logger.error('Rate limiting error:', error);
            next(); // Продолжаем в случае ошибки кэша
        }
    };
};

// Аутентификация WebSocket соединений
const authenticateSocket = async (socket, next) => {
    try {
        const token = socket.handshake.auth?.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
            return next(new Error('Токен не предоставлен'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password');
        
        if (!user) {
            return next(new Error('Пользователь не найден'));
        }

        if (user.status !== 'active') {
            return next(new Error('Аккаунт неактивен'));
        }

        socket.userId = user._id.toString();
        socket.user = user;
        
        logger.websocket(socket.id, user._id, 'authenticated');
        next();
    } catch (error) {
        logger.error('Socket authentication error:', error);
        next(new Error('Ошибка аутентификации'));
    }
};

// Выход из системы (добавление токена в черный список)
const logout = async (token, userId) => {
    try {
        // Добавляем токен в черный список
        const decoded = jwt.decode(token);
        const expiresIn = decoded.exp - Math.floor(Date.now() / 1000);
        
        if (expiresIn > 0) {
            await cacheUtils.set(`blacklist_token:${token}`, true, expiresIn);
        }

        // Очищаем кэш пользователя
        await cacheUtils.del(`user:${userId}`);
        
        logger.info(`User ${userId} logged out, token blacklisted`);
        return true;
    } catch (error) {
        logger.error('Logout error:', error);
        return false;
    }
};

// Обновление токенов
const refreshTokens = async (refreshToken) => {
    try {
        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
        const user = await User.findById(decoded.id);
        
        if (!user) {
            throw new Error('Пользователь не найден');
        }

        // Проверяем, есть ли токен в базе пользователя
        const tokenExists = user.refreshTokens.some(t => t.token === refreshToken);
        
        if (!tokenExists) {
            throw new Error('Refresh token не найден');
        }

        // Удаляем старый refresh token
        user.refreshTokens = user.refreshTokens.filter(t => t.token !== refreshToken);
        
        // Создаем новые токены
        const newAccessToken = generateToken({ id: user._id, email: user.email });
        const newRefreshToken = generateRefreshToken({ id: user._id });
        
        // Сохраняем новый refresh token
        user.refreshTokens.push({ token: newRefreshToken });
        await user.save();
        
        return {
            accessToken: newAccessToken,
            refreshToken: newRefreshToken
        };
    } catch (error) {
        logger.error('Refresh token error:', error);
        throw error;
    }
};

module.exports = {
    generateToken,
    generateRefreshToken,
    authenticate,
    optionalAuth,
    authorize,
    authorizeOwnership,
    requireEmailVerification,
    rateLimitByUser,
    authenticateSocket,
    logout,
    refreshTokens
};