const redis = require('redis');
const logger = require('./logger');

let redisClient = null;

const connectRedis = async () => {
    try {
        // Проверяем, нужен ли Redis в разработке
        if (process.env.NODE_ENV === 'development' && !process.env.REDIS_URL) {
            logger.warn('⚠️ Redis не настроен для разработки. Кэширование отключено.');
            return null;
        }

        // Создаем клиента Redis
        redisClient = redis.createClient({
            url: process.env.REDIS_URL || 'redis://localhost:6379',
            retry_strategy: (options) => {
                if (options.error && options.error.code === 'ECONNREFUSED') {
                    logger.error('❌ Сервер Redis недоступен');
                    
                    // В разработке не прерываем работу, если Redis недоступен
                    if (process.env.NODE_ENV === 'development') {
                        logger.warn('⚠️ Продолжаем без Redis в режиме разработки');
                        return undefined; // Останавливаем попытки подключения
                    }
                    
                    return new Error('Сервер Redis недоступен');
                }
                if (options.total_retry_time > 1000 * 60 * 60) {
                    logger.error('❌ Время повтора подключения к Redis истекло');
                    return new Error('Время повтора истекло');
                }
                if (options.attempt > 10) {
                    logger.error('❌ Максимальное количество попыток подключения к Redis превышено');
                    return undefined;
                }
                // Повторное подключение через
                return Math.min(options.attempt * 100, 3000);
            }
        });

        // Обработчики событий
        redisClient.on('connect', () => {
            logger.info('🔗 Подключение к Redis...');
        });

        redisClient.on('ready', () => {
            logger.info('✅ Redis готов к использованию');
        });

        redisClient.on('error', (err) => {
            logger.error('❌ Ошибка Redis:', err);
        });

        redisClient.on('end', () => {
            logger.warn('⚠️ Соединение с Redis закрыто');
        });

        redisClient.on('reconnecting', () => {
            logger.info('🔄 Переподключение к Redis...');
        });

        // Подключаемся
        await redisClient.connect();
        
        logger.info('✅ Redis успешно подключен');

        // Graceful shutdown
        process.on('SIGINT', async () => {
            if (redisClient) {
                await redisClient.disconnect();
                logger.info('👋 Redis соединение закрыто');
            }
        });

        return redisClient;
    } catch (error) {
        logger.error('❌ Ошибка подключения к Redis:', error);
        throw error;
    }
};

// Утилиты для работы с кэшем
const cacheUtils = {
    // Получить данные из кэша
    async get(key) {
        try {
            if (!redisClient || !redisClient.isOpen) {
                logger.warn('⚠️ Redis клиент недоступен');
                return null;
            }
            
            const data = await redisClient.get(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            logger.error('❌ Ошибка получения из кэша:', error);
            return null;
        }
    },

    // Сохранить данные в кэш
    async set(key, value, expireInSeconds = 3600) {
        try {
            if (!redisClient || !redisClient.isOpen) {
                logger.warn('⚠️ Redis клиент недоступен');
                return false;
            }
            
            await redisClient.setEx(key, expireInSeconds, JSON.stringify(value));
            return true;
        } catch (error) {
            logger.error('❌ Ошибка сохранения в кэш:', error);
            return false;
        }
    },

    // Удалить из кэша
    async del(key) {
        try {
            if (!redisClient || !redisClient.isOpen) {
                logger.warn('⚠️ Redis клиент недоступен');
                return false;
            }
            
            await redisClient.del(key);
            return true;
        } catch (error) {
            logger.error('❌ Ошибка удаления из кэша:', error);
            return false;
        }
    },

    // Получить все ключи по pattern
    async keys(pattern) {
        try {
            if (!redisClient || !redisClient.isOpen) {
                logger.warn('⚠️ Redis клиент недоступен');
                return [];
            }
            
            return await redisClient.keys(pattern);
        } catch (error) {
            logger.error('❌ Ошибка получения ключей:', error);
            return [];
        }
    },

    // Увеличить счетчик
    async incr(key, expireInSeconds = 3600) {
        try {
            if (!redisClient || !redisClient.isOpen) {
                logger.warn('⚠️ Redis клиент недоступен');
                return 0;
            }
            
            const value = await redisClient.incr(key);
            if (value === 1) {
                await redisClient.expire(key, expireInSeconds);
            }
            return value;
        } catch (error) {
            logger.error('❌ Ошибка увеличения счетчика:', error);
            return 0;
        }
    }
};

module.exports = { connectRedis, redisClient: () => redisClient, cacheUtils };