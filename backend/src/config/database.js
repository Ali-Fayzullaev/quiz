const mongoose = require('mongoose');
const logger = require('./logger');

const connectDB = async () => {
    try {
        const options = {
            // Убираем устаревшие опции
            maxPoolSize: 10, // Максимум подключений в пуле
            serverSelectionTimeoutMS: 5000, // Таймаут выбора сервера
            socketTimeoutMS: 45000, // Таймаут сокета
            family: 4 // Используем IPv4
        };

        const conn = await mongoose.connect(process.env.MONGODB_URI, options);
        
        logger.info(`✅ MongoDB подключена: ${conn.connection.host}`);
        
        // Обработка событий подключения
        mongoose.connection.on('connected', () => {
            logger.info('🔗 Mongoose подключен к MongoDB');
        });

        mongoose.connection.on('error', (err) => {
            logger.error('❌ Ошибка подключения к MongoDB:', err);
        });

        mongoose.connection.on('disconnected', () => {
            logger.warn('⚠️ Mongoose отключен от MongoDB');
        });

        // Обработка закрытия приложения
        process.on('SIGINT', async () => {
            await mongoose.connection.close();
            logger.info('👋 MongoDB соединение закрыто');
            process.exit(0);
        });

        return conn;
    } catch (error) {
        logger.error('❌ Ошибка подключения к базе данных:', error);
        throw error;
    }
};

module.exports = connectDB;