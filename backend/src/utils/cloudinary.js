const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const logger = require('../config/logger');

// Конфигурация Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * Загрузка изображения в Cloudinary
 * @param {string} filePath - путь к локальному файлу
 * @param {string} folder - папка в Cloudinary
 * @param {Object} options - дополнительные опции
 * @returns {Promise} - результат загрузки
 */
const uploadImage = async (filePath, folder = 'quiz-app', options = {}) => {
    try {
        const uploadOptions = {
            folder,
            resource_type: 'image',
            quality: 'auto:good',
            fetch_format: 'auto',
            ...options
        };

        const result = await cloudinary.uploader.upload(filePath, uploadOptions);
        
        // Удаляем временный файл
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        logger.info(`Изображение загружено в Cloudinary: ${result.public_id}`);
        return result;

    } catch (error) {
        logger.error('Ошибка загрузки в Cloudinary:', error);
        
        // Удаляем временный файл при ошибке
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
        
        throw new Error('Ошибка загрузки изображения');
    }
};

/**
 * Удаление изображения из Cloudinary
 * @param {string} publicId - public_id изображения в Cloudinary
 * @returns {Promise} - результат удаления
 */
const deleteImage = async (publicId) => {
    try {
        const result = await cloudinary.uploader.destroy(publicId);
        logger.info(`Изображение удалено из Cloudinary: ${publicId}`);
        return result;
    } catch (error) {
        logger.error('Ошибка удаления из Cloudinary:', error);
        throw new Error('Ошибка удаления изображения');
    }
};

/**
 * Получение оптимизированного URL изображения
 * @param {string} publicId - public_id изображения
 * @param {Object} transformations - параметры трансформации
 * @returns {string} - оптимизированный URL
 */
const getOptimizedUrl = (publicId, transformations = {}) => {
    const defaultTransformations = {
        quality: 'auto:good',
        fetch_format: 'auto'
    };

    return cloudinary.url(publicId, { 
        ...defaultTransformations, 
        ...transformations 
    });
};

/**
 * Создание миниатюры изображения
 * @param {string} publicId - public_id изображения
 * @param {number} width - ширина миниатюры
 * @param {number} height - высота миниатюры
 * @returns {string} - URL миниатюры
 */
const getThumbnailUrl = (publicId, width = 300, height = 200) => {
    return cloudinary.url(publicId, {
        width,
        height,
        crop: 'fill',
        quality: 'auto:good',
        fetch_format: 'auto'
    });
};

/**
 * Загрузка множественных изображений
 * @param {Array} filePaths - массив путей к файлам
 * @param {string} folder - папка в Cloudinary
 * @returns {Promise<Array>} - результаты загрузки
 */
const uploadMultipleImages = async (filePaths, folder = 'quiz-app') => {
    try {
        const uploadPromises = filePaths.map(filePath => 
            uploadImage(filePath, folder)
        );

        const results = await Promise.all(uploadPromises);
        logger.info(`Загружено ${results.length} изображений в Cloudinary`);
        
        return results;
    } catch (error) {
        logger.error('Ошибка загрузки множественных изображений:', error);
        throw error;
    }
};

/**
 * Проверка существования изображения в Cloudinary
 * @param {string} publicId - public_id изображения
 * @returns {Promise<boolean>} - существует ли изображение
 */
const imageExists = async (publicId) => {
    try {
        await cloudinary.api.resource(publicId);
        return true;
    } catch (error) {
        if (error.error && error.error.http_code === 404) {
            return false;
        }
        throw error;
    }
};

/**
 * Получение информации об изображении
 * @param {string} publicId - public_id изображения
 * @returns {Promise<Object>} - информация об изображении
 */
const getImageInfo = async (publicId) => {
    try {
        const result = await cloudinary.api.resource(publicId);
        return {
            publicId: result.public_id,
            format: result.format,
            width: result.width,
            height: result.height,
            bytes: result.bytes,
            url: result.secure_url,
            createdAt: result.created_at
        };
    } catch (error) {
        logger.error('Ошибка получения информации об изображении:', error);
        throw error;
    }
};

/**
 * Очистка старых загрузок (старше указанного времени)
 * @param {string} folder - папка для очистки
 * @param {number} daysOld - количество дней
 * @returns {Promise} - результат очистки
 */
const cleanupOldUploads = async (folder = 'quiz-app/temp', daysOld = 1) => {
    try {
        const maxDate = new Date();
        maxDate.setDate(maxDate.getDate() - daysOld);
        
        const { resources } = await cloudinary.api.resources({
            type: 'upload',
            prefix: folder,
            max_results: 500
        });

        const oldResources = resources.filter(resource => 
            new Date(resource.created_at) < maxDate
        );

        if (oldResources.length > 0) {
            const publicIds = oldResources.map(resource => resource.public_id);
            const result = await cloudinary.api.delete_resources(publicIds);
            
            logger.info(`Удалено ${oldResources.length} старых изображений из папки ${folder}`);
            return result;
        }

        logger.info(`Нет старых изображений для удаления в папке ${folder}`);
        return { deleted: {} };
    } catch (error) {
        logger.error('Ошибка очистки старых загрузок:', error);
        throw error;
    }
};

module.exports = {
    uploadImage,
    deleteImage,
    getOptimizedUrl,
    getThumbnailUrl,
    uploadMultipleImages,
    imageExists,
    getImageInfo,
    cleanupOldUploads,
    cloudinary // экспортируем сам объект cloudinary для прямого использования
};