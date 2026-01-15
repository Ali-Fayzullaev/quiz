const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { generateToken, generateRefreshToken, refreshTokens } = require('../middleware/auth');
const { validate, asyncHandler, createResponse } = require('../middleware/errorHandler');
const { auth } = require('../utils/validation');
const { generateVerificationCode, sendVerificationCode } = require('../utils/email');
const logger = require('../config/logger');

// Тестовый маршрут для проверки CORS
router.get('/test-cors', (req, res) => {
    res.json({ 
        message: 'CORS работает', 
        origin: req.headers.origin,
        frontendUrl: process.env.FRONTEND_URL
    });
});

// @route   POST /api/auth/register
// @desc    Регистрация нового пользователя
// @access  Public
router.post('/register', validate(auth.register), asyncHandler(async (req, res) => {
    const { username, email, password, firstName, lastName } = req.body;

    // Проверяем, существует ли пользователь
    const existingUser = await User.findOne({
        $or: [{ email }, { username }]
    });

    if (existingUser) {
        return res.status(409).json(
            createResponse.error(
                existingUser.email === email 
                    ? 'Пользователь с таким email уже существует'
                    : 'Пользователь с таким именем уже существует',
                'USER_EXISTS'
            )
        );
    }

    // Создаем пользователя (сразу активного)
    const user = new User({
        username,
        email,
        password, // Будет захеширован в middleware модели
        profile: {
            firstName,
            lastName
        },
        isVerified: true,
        status: 'active'
    });

    await user.save();

    // Создаем токены для входа
    const accessToken = generateToken({ id: user._id, email: user.email });
    const refreshToken = generateRefreshToken({ id: user._id });

    // Сохраняем refresh token
    user.refreshTokens.push({ token: refreshToken });
    await user.save();

    logger.info(`New user registered: ${user.username} (${user.email})`);

    res.status(201).json({
        success: true,
        message: 'Регистрация успешна!',
        token: accessToken,
        refreshToken,
        user: {
            id: user._id,
            username: user.username,
            email: user.email,
            profile: user.profile,
            gameStats: user.gameStats,
            isVerified: user.isVerified,
            status: user.status,
            createdAt: user.createdAt
        }
    });
}));

// @route   POST /api/auth/verify-code
// @desc    Подтверждение кода верификации из email
// @access  Public
router.post('/verify-code', validate(auth.verifyCode), asyncHandler(async (req, res) => {
    const { email, code } = req.body;

    // Находим пользователя с неистекшим кодом верификации
    const user = await User.findOne({
        email,
        verificationCode: code,
        verificationCodeExpires: { $gt: Date.now() },
        isVerified: false
    });

    if (!user) {
        return res.status(400).json(
            createResponse.error(
                'Неверный код верификации или срок действия истек',
                'INVALID_VERIFICATION_CODE'
            )
        );
    }

    // Активируем пользователя
    user.isVerified = true;
    user.status = 'active';
    user.verificationCode = undefined;
    user.verificationCodeExpires = undefined;
    user.emailVerifiedAt = new Date();

    await user.save();

    // Создаем токены для входа
    const accessToken = generateToken({ id: user._id, email: user.email });
    const refreshToken = generateRefreshToken({ id: user._id });

    // Сохраняем refresh token
    user.refreshTokens.push({ token: refreshToken });
    await user.save();

    logger.info(`Email verified and user activated: ${user.username} (${user.email})`);

    const response = createResponse.success({
        user: {
            id: user._id,
            username: user.username,
            email: user.email,
            profile: user.profile,
            gameStats: user.gameStats,
            rating: user.rating,
            isVerified: user.isVerified,
            status: user.status,
            createdAt: user.createdAt,
            emailVerifiedAt: user.emailVerifiedAt
        },
        tokens: {
            accessToken,
            refreshToken
        }
    }, 'Email успешно подтвержден. Добро пожаловать!');

    res.json(response);
}));

// @route   POST /api/auth/resend-verification
// @desc    Повторная отправка кода верификации
// @access  Public
router.post('/resend-verification', validate(auth.resendVerification), asyncHandler(async (req, res) => {
    const { email } = req.body;

    const user = await User.findOne({ 
        email, 
        isVerified: false 
    });

    if (!user) {
        return res.status(400).json(
            createResponse.error(
                'Пользователь с таким email не найден или уже подтвержден',
                'USER_NOT_FOUND_OR_VERIFIED'
            )
        );
    }

    // Проверяем, не отправляли ли код недавно (защита от спама)
    const timeSinceLastSent = Date.now() - (user.verificationCodeSentAt || 0);
    const RESEND_COOLDOWN = 60 * 1000; // 1 минута

    if (timeSinceLastSent < RESEND_COOLDOWN) {
        return res.status(429).json(
            createResponse.error(
                'Код уже был отправлен недавно. Подождите 1 минуту перед повторной отправкой.',
                'RESEND_COOLDOWN'
            )
        );
    }

    // Генерируем новый код
    const verificationCode = generateVerificationCode();
    const verificationCodeExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 минут

    user.verificationCode = verificationCode;
    user.verificationCodeExpires = verificationCodeExpires;
    user.verificationCodeSentAt = new Date();

    await user.save();

    // Отправляем новый код
    try {
        await sendVerificationCode(email, verificationCode, user.profile.firstName || user.username);
        logger.info(`Verification code resent to: ${email}`);
        
        const response = createResponse.success(
            null,
            'Новый код верификации отправлен на ваш email'
        );
        res.json(response);
    } catch (error) {
        logger.error('Failed to resend verification email:', error);
        res.status(500).json(
            createResponse.error('Ошибка при отправке email', 'EMAIL_SEND_ERROR')
        );
    }
}));

// @route   POST /api/auth/login
// @desc    Авторизация пользователя
// @access  Public
router.post('/login', validate(auth.login), asyncHandler(async (req, res) => {
    const { emailOrUsername, password } = req.body;

    // Находим пользователя
    const user = await User.findByCredentials(emailOrUsername);

    if (!user) {
        return res.status(401).json(
            createResponse.error('Неверные учетные данные', 'INVALID_CREDENTIALS')
        );
    }

    // Проверяем пароль
    const isPasswordValid = await user.checkPassword(password);

    if (!isPasswordValid) {
        return res.status(401).json(
            createResponse.error('Неверные учетные данные', 'INVALID_CREDENTIALS')
        );
    }

    // Проверяем статус аккаунта
    if (user.status === 'banned') {
        return res.status(403).json(
            createResponse.error('Ваш аккаунт заблокирован', 'ACCOUNT_BANNED')
        );
    }

    if (user.status === 'inactive') {
        return res.status(403).json(
            createResponse.error(
                'Ваш аккаунт не активирован. Подтвердите email для активации.',
                'ACCOUNT_NOT_VERIFIED'
            )
        );
    }

    // Временно отключаем проверку email для разработки
    if (process.env.NODE_ENV === 'production' && !user.isVerified) {
        return res.status(403).json(
            createResponse.error(
                'Email не подтвержден. Проверьте почту и подтвердите email.',
                'EMAIL_NOT_VERIFIED'
            )
        );
    }

    // Создаем токены
    const accessToken = generateToken({ id: user._id, email: user.email });
    const refreshToken = generateRefreshToken({ id: user._id });

    // Очищаем старые refresh токены (оставляем только последние 5)
    user.refreshTokens = user.refreshTokens.slice(-4);
    user.refreshTokens.push({ token: refreshToken });
    
    // Обновляем время последней активности
    user.lastSeen = new Date();
    await user.save();

    logger.info(`User logged in: ${user.username}`);

    const response = createResponse.success({
        user: {
            id: user._id,
            username: user.username,
            email: user.email,
            profile: user.profile,
            gameStats: user.gameStats,
            rating: user.rating,
            settings: user.settings,
            isVerified: user.isVerified,
            lastSeen: user.lastSeen
        },
        tokens: {
            accessToken,
            refreshToken
        }
    }, 'Авторизация успешна');

    res.json(response);
}));

// @route   POST /api/auth/refresh
// @desc    Обновление токенов
// @access  Public
router.post('/refresh', validate(auth.refreshToken), asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;

    try {
        const tokens = await refreshTokens(refreshToken);
        
        const response = createResponse.success({
            tokens
        }, 'Токены обновлены');

        res.json(response);
    } catch (error) {
        res.status(401).json(
            createResponse.error('Недействительный refresh token', 'INVALID_REFRESH_TOKEN')
        );
    }
}));

// @route   POST /api/auth/logout
// @desc    Выход из системы
// @access  Private
router.post('/logout', asyncHandler(async (req, res) => {
    const authHeader = req.header('Authorization');
    const refreshToken = req.header('x-refresh-token');

    if (authHeader) {
        const token = authHeader.replace('Bearer ', '');
        // Добавить в черный список через middleware auth
    }

    if (refreshToken) {
        // Удаляем refresh token из базы
        const user = await User.findOne({
            'refreshTokens.token': refreshToken
        });

        if (user) {
            user.refreshTokens = user.refreshTokens.filter(t => t.token !== refreshToken);
            await user.save();
        }
    }

    const response = createResponse.success(null, 'Выход выполнен успешно');
    res.json(response);
}));

// @route   POST /api/auth/forgot-password
// @desc    Запрос сброса пароля
// @access  Public
router.post('/forgot-password', validate(auth.forgotPassword), asyncHandler(async (req, res) => {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
        // В целях безопасности не говорим, что email не найден
        return res.json(
            createResponse.success(null, 'Если email существует, инструкции отправлены на него')
        );
    }

    // Генерируем токен сброса пароля
    const resetToken = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 минут

    await user.save();

    // Здесь должна быть отправка email
    logger.info(`Password reset requested for user: ${user.email}, token: ${resetToken}`);

    const response = createResponse.success(null, 'Инструкции по сбросу пароля отправлены на email');
    res.json(response);
}));

// @route   POST /api/auth/reset-password
// @desc    Сброс пароля
// @access  Public
router.post('/reset-password', validate(auth.resetPassword), asyncHandler(async (req, res) => {
    const { token, newPassword } = req.body;

    const user = await User.findOne({
        resetPasswordToken: token,
        resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
        return res.status(400).json(
            createResponse.error('Недействительный или истекший токен', 'INVALID_RESET_TOKEN')
        );
    }

    // Обновляем пароль
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    user.refreshTokens = []; // Очищаем все refresh токены

    await user.save();

    logger.info(`Password reset completed for user: ${user.email}`);

    const response = createResponse.success(null, 'Пароль успешно изменен');
    res.json(response);
}));

// @route   GET /api/auth/verify-email/:token
// @desc    Подтверждение email
// @access  Public
router.get('/verify-email/:token', asyncHandler(async (req, res) => {
    const { token } = req.params;

    const user = await User.findOne({
        emailVerificationToken: token,
        emailVerificationExpire: { $gt: Date.now() }
    });

    if (!user) {
        return res.status(400).json(
            createResponse.error('Недействительный или истекший токен подтверждения', 'INVALID_VERIFICATION_TOKEN')
        );
    }

    user.isVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpire = undefined;

    await user.save();

    logger.info(`Email verified for user: ${user.email}`);

    const response = createResponse.success(null, 'Email успешно подтвержден');
    res.json(response);
}));

// @route   GET /api/auth/me
// @desc    Получить информацию о текущем пользователе
// @access  Private (будет добавлен middleware аутентификации)
router.get('/me', (req, res) => {
    // Заглушка - будет реализовано после добавления middleware
    res.json(createResponse.success({ message: 'Endpoint в разработке' }));
});

module.exports = router;