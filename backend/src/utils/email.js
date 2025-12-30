const nodemailer = require('nodemailer');
const logger = require('../config/logger');

// Создаем транспорт для отправки email
const createTransporter = () => {
    return nodemailer.createTransporter({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: false, // true для 465, false для других портов
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });
};

/**
 * Генерация случайного кода верификации
 * @param {number} length - длина кода
 * @returns {string} - код верификации
 */
const generateVerificationCode = (length = 6) => {
    const digits = '0123456789';
    let code = '';
    
    for (let i = 0; i < length; i++) {
        code += digits[Math.floor(Math.random() * digits.length)];
    }
    
    return code;
};

/**
 * Отправка кода верификации на email
 * @param {string} email - email получателя
 * @param {string} code - код верификации
 * @param {string} username - имя пользователя
 * @returns {Promise<boolean>} - успешность отправки
 */
const sendVerificationCode = async (email, code, username) => {
    try {
        const transporter = createTransporter();

        const mailOptions = {
            from: `"Quiz App" <${process.env.SMTP_USER}>`,
            to: email,
            subject: 'Код подтверждения регистрации - Quiz App',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <h1 style="color: #4A90E2;">🎯 Quiz App</h1>
                    </div>
                    
                    <div style="background-color: #f8f9fa; padding: 25px; border-radius: 10px; margin-bottom: 20px;">
                        <h2 style="color: #333; margin-top: 0;">Добро пожаловать, ${username}!</h2>
                        
                        <p style="color: #666; font-size: 16px; line-height: 1.5;">
                            Спасибо за регистрацию в Quiz App! Для завершения регистрации введите код подтверждения:
                        </p>
                        
                        <div style="text-align: center; margin: 30px 0;">
                            <div style="background-color: #4A90E2; color: white; font-size: 32px; font-weight: bold; 
                                        padding: 15px 30px; border-radius: 8px; display: inline-block; letter-spacing: 5px;">
                                ${code}
                            </div>
                        </div>
                        
                        <p style="color: #666; font-size: 14px;">
                            ⏰ Код действителен в течение <strong>15 минут</strong>
                        </p>
                        
                        <p style="color: #666; font-size: 14px;">
                            Если вы не регистрировались в Quiz App, проигнорируйте это письмо.
                        </p>
                    </div>
                    
                    <div style="text-align: center; color: #999; font-size: 12px; border-top: 1px solid #eee; padding-top: 20px;">
                        <p>© 2025 Quiz App. Все права защищены.</p>
                    </div>
                </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        logger.info(`Код верификации отправлен на ${email}: ${info.messageId}`);
        return true;

    } catch (error) {
        logger.error('Ошибка отправки email:', error);
        return false;
    }
};

/**
 * Отправка приветственного письма после успешной верификации
 * @param {string} email - email пользователя
 * @param {string} username - имя пользователя
 * @returns {Promise<boolean>} - успешность отправки
 */
const sendWelcomeEmail = async (email, username) => {
    try {
        const transporter = createTransporter();

        const mailOptions = {
            from: `"Quiz App" <${process.env.SMTP_USER}>`,
            to: email,
            subject: 'Добро пожаловать в Quiz App! 🎉',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <h1 style="color: #4A90E2;">🎯 Quiz App</h1>
                    </div>
                    
                    <div style="background-color: #f8f9fa; padding: 25px; border-radius: 10px;">
                        <h2 style="color: #333; margin-top: 0;">Поздравляем, ${username}! 🎉</h2>
                        
                        <p style="color: #666; font-size: 16px; line-height: 1.5;">
                            Ваш аккаунт успешно создан и подтвержден! Теперь вы можете:
                        </p>
                        
                        <ul style="color: #666; font-size: 16px; line-height: 1.8;">
                            <li>🧠 Проходить увлекательные викторины</li>
                            <li>🏆 Соревноваться с друзьями</li>
                            <li>📊 Отслеживать свой прогресс</li>
                            <li>🎯 Создавать собственные квизы</li>
                            <li>🏅 Получать достижения и награды</li>
                        </ul>
                        
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}" 
                               style="background-color: #4A90E2; color: white; text-decoration: none; 
                                      padding: 12px 30px; border-radius: 6px; font-weight: bold; display: inline-block;">
                                Начать играть!
                            </a>
                        </div>
                    </div>
                    
                    <div style="text-align: center; color: #999; font-size: 12px; border-top: 1px solid #eee; padding-top: 20px; margin-top: 20px;">
                        <p>© 2025 Quiz App. Все права защищены.</p>
                        <p>Нужна помощь? Свяжитесь с нами: support@quizapp.com</p>
                    </div>
                </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        logger.info(`Приветственное письмо отправлено на ${email}: ${info.messageId}`);
        return true;

    } catch (error) {
        logger.error('Ошибка отправки приветственного email:', error);
        return false;
    }
};

/**
 * Отправка письма для сброса пароля
 * @param {string} email - email пользователя
 * @param {string} resetToken - токен для сброса пароля
 * @param {string} username - имя пользователя
 * @returns {Promise<boolean>} - успешность отправки
 */
const sendPasswordResetEmail = async (email, resetToken, username) => {
    try {
        const transporter = createTransporter();
        const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

        const mailOptions = {
            from: `"Quiz App" <${process.env.SMTP_USER}>`,
            to: email,
            subject: 'Сброс пароля - Quiz App',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <h1 style="color: #4A90E2;">🎯 Quiz App</h1>
                    </div>
                    
                    <div style="background-color: #f8f9fa; padding: 25px; border-radius: 10px;">
                        <h2 style="color: #333; margin-top: 0;">Сброс пароля</h2>
                        
                        <p style="color: #666; font-size: 16px; line-height: 1.5;">
                            Здравствуйте, ${username}!
                        </p>
                        
                        <p style="color: #666; font-size: 16px; line-height: 1.5;">
                            Вы запросили сброс пароля для вашего аккаунта Quiz App. Нажмите на кнопку ниже, чтобы создать новый пароль:
                        </p>
                        
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${resetUrl}" 
                               style="background-color: #DC3545; color: white; text-decoration: none; 
                                      padding: 12px 30px; border-radius: 6px; font-weight: bold; display: inline-block;">
                                Сбросить пароль
                            </a>
                        </div>
                        
                        <p style="color: #666; font-size: 14px;">
                            ⏰ Ссылка действительна в течение <strong>1 часа</strong>
                        </p>
                        
                        <p style="color: #666; font-size: 14px;">
                            Если вы не запрашивали сброс пароля, проигнорируйте это письмо. Ваш пароль останется без изменений.
                        </p>
                    </div>
                    
                    <div style="text-align: center; color: #999; font-size: 12px; border-top: 1px solid #eee; padding-top: 20px; margin-top: 20px;">
                        <p>© 2025 Quiz App. Все права защищены.</p>
                    </div>
                </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        logger.info(`Email для сброса пароля отправлен на ${email}: ${info.messageId}`);
        return true;

    } catch (error) {
        logger.error('Ошибка отправки email для сброса пароля:', error);
        return false;
    }
};

module.exports = {
    generateVerificationCode,
    sendVerificationCode,
    sendWelcomeEmail,
    sendPasswordResetEmail
};