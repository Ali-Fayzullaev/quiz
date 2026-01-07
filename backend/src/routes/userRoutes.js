const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Quiz = require('../models/Quiz');
const Result = require('../models/Result');
const { authenticate: protect } = require('../middleware/auth');
const { uploadImage, deleteImage } = require('../utils/cloudinary');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Настройка multer для загрузки аватаров
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '../../uploads/user-avatars');
    // Создаем директорию если не существует
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'avatar-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  
  if (extname && mimetype) {
    return cb(null, true);
  }
  cb(new Error('Разрешены только изображения (jpeg, jpg, png, gif, webp)'));
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: fileFilter
});

// @desc    Получить профиль текущего пользователя
// @route   GET /api/users/profile
// @access  Private
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Пользователь не найден'
      });
    }
    
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при получении профиля'
    });
  }
});

// @desc    Обновить профиль пользователя
// @route   PUT /api/users/profile
// @access  Private
router.put('/profile', protect, async (req, res) => {
  try {
    console.log('PUT /profile - Request body:', req.body);
    console.log('PUT /profile - User:', req.user?._id);
    
    const allowedFields = ['firstName', 'lastName', 'bio', 'country', 'dateOfBirth'];
    const updateData = {};
    
    // Фильтруем только разрешенные поля
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updateData[`profile.${field}`] = req.body[field];
      }
    }
    
    // Если передан username, обновляем его отдельно
    if (req.body.username) {
      // Проверяем уникальность username
      const existingUser = await User.findOne({ 
        username: req.body.username, 
        _id: { $ne: req.user._id } 
      });
      
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Это имя пользователя уже занято'
        });
      }
      
      updateData.username = req.body.username;
    }
    
    // Если передан email, обновляем его отдельно
    if (req.body.email) {
      // Проверяем уникальность email
      const existingUser = await User.findOne({ 
        email: req.body.email, 
        _id: { $ne: req.user._id } 
      });
      
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Этот email уже используется'
        });
      }
      
      updateData.email = req.body.email;
    }
    
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Пользователь не найден'
      });
    }
    
    res.json({
      success: true,
      message: 'Профиль успешно обновлен',
      data: user
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    
    // Если ошибка валидации mongoose
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Ошибка при обновлении профиля'
    });
  }
});

// @desc    Загрузить аватар пользователя
// @route   POST /api/users/avatar
// @access  Private
router.post('/avatar', protect, upload.single('avatar'), async (req, res) => {
  try {
    console.log('POST /avatar - File:', req.file);
    console.log('POST /avatar - User:', req.user?._id);
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Файл не загружен'
      });
    }
    
    const user = await User.findById(req.user._id);
    
    if (!user) {
      // Удаляем загруженный файл
      fs.unlinkSync(req.file.path);
      return res.status(404).json({
        success: false,
        message: 'Пользователь не найден'
      });
    }
    
    // Удаляем старый аватар из Cloudinary если есть
    if (user.profile?.avatar?.cloudinaryId) {
      try {
        await deleteImage(user.profile.avatar.cloudinaryId);
      } catch (err) {
        console.error('Error deleting old avatar from Cloudinary:', err);
      }
    }
    
    // Инициализируем profile если не существует
    if (!user.profile) {
      user.profile = {};
    }
    
    // Загружаем новый аватар в Cloudinary
    // uploadImage уже удаляет локальный файл после загрузки
    const result = await uploadImage(req.file.path, 'quiz-app/avatars', {
      transformation: [
        { width: 400, height: 400, crop: 'fill', gravity: 'face' },
        { quality: 'auto', fetch_format: 'auto' }
      ]
    });
    
    // Обновляем пользователя
    user.profile.avatar = {
      url: result.secure_url,
      cloudinaryId: result.public_id
    };
    
    await user.save();
    
    res.json({
      success: true,
      message: 'Аватар успешно загружен',
      data: {
        avatar: user.profile.avatar
      }
    });
  } catch (error) {
    console.error('Error uploading avatar:', error);
    console.error('Error details:', error.message);
    
    // Удаляем локальный файл если есть ошибка
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({
      success: false,
      message: error.message || 'Ошибка при загрузке аватара'
    });
  }
});

// @desc    Удалить аватар пользователя
// @route   DELETE /api/users/avatar
// @access  Private
router.delete('/avatar', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Пользователь не найден'
      });
    }
    
    // Удаляем аватар из Cloudinary если есть
    if (user.profile?.avatar?.cloudinaryId) {
      try {
        await deleteImage(user.profile.avatar.cloudinaryId);
      } catch (err) {
        console.error('Error deleting avatar from Cloudinary:', err);
      }
    }
    
    // Очищаем данные аватара
    user.profile.avatar = {
      url: '',
      cloudinaryId: ''
    };
    
    await user.save();
    
    res.json({
      success: true,
      message: 'Аватар успешно удален'
    });
  } catch (error) {
    console.error('Error deleting avatar:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при удалении аватара'
    });
  }
});

// @desc    Получить статистику пользователя
// @route   GET /api/users/stats
// @access  Private
router.get('/stats', protect, async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Получаем количество созданных квизов
    const quizzesCreated = await Quiz.countDocuments({ creator: userId });
    
    // Получаем количество пройденных квизов
    const quizzesTaken = await Result.countDocuments({ user: userId });
    
    // Получаем общее количество правильных ответов
    const results = await Result.find({ user: userId });
    let totalCorrect = 0;
    let totalQuestions = 0;
    let totalScore = 0;
    
    results.forEach(result => {
      totalCorrect += result.correctAnswers || 0;
      totalQuestions += result.totalQuestions || 0;
      totalScore += result.score || 0;
    });
    
    // Средний процент правильных ответов
    const averageAccuracy = totalQuestions > 0 
      ? Math.round((totalCorrect / totalQuestions) * 100) 
      : 0;
    
    // Получаем количество лайков на всех квизах пользователя
    const userQuizzes = await Quiz.find({ creator: userId });
    let totalLikes = 0;
    userQuizzes.forEach(quiz => {
      totalLikes += quiz.social?.likes?.length || 0;
    });
    
    res.json({
      success: true,
      data: {
        quizzesCreated,
        quizzesTaken,
        totalCorrect,
        totalQuestions,
        averageAccuracy,
        totalScore,
        totalLikes
      }
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при получении статистики'
    });
  }
});

// @desc    Получить квизы пользователя
// @route   GET /api/users/quizzes
// @access  Private
router.get('/quizzes', protect, async (req, res) => {
  try {
    const quizzes = await Quiz.find({ creator: req.user._id })
      .sort({ createdAt: -1 })
      .select('title description thumbnail category difficulty stats social createdAt isPublished');
    
    res.json({
      success: true,
      data: quizzes
    });
  } catch (error) {
    console.error('Error fetching user quizzes:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при получении квизов'
    });
  }
});

// @desc    Получить результаты пользователя
// @route   GET /api/users/results
// @access  Private
router.get('/results', protect, async (req, res) => {
  try {
    const results = await Result.find({ user: req.user._id })
      .populate('quiz', 'title thumbnail category')
      .sort({ completedAt: -1 })
      .limit(20);
    
    res.json({
      success: true,
      data: results
    });
  } catch (error) {
    console.error('Error fetching user results:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при получении результатов'
    });
  }
});

// @desc    Изменить пароль
// @route   PUT /api/users/password
// @access  Private
router.put('/password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Укажите текущий и новый пароль'
      });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Новый пароль должен быть минимум 6 символов'
      });
    }
    
    const user = await User.findById(req.user._id).select('+password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Пользователь не найден'
      });
    }
    
    // Проверяем текущий пароль
    const isMatch = await user.comparePassword(currentPassword);
    
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Неверный текущий пароль'
      });
    }
    
    // Обновляем пароль
    user.password = newPassword;
    await user.save();
    
    res.json({
      success: true,
      message: 'Пароль успешно изменен'
    });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при изменении пароля'
    });
  }
});

// @desc    Получить публичный профиль пользователя
// @route   GET /api/users/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('username profile.firstName profile.lastName profile.avatar profile.bio stats createdAt');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Пользователь не найден'
      });
    }
    
    // Получаем публичные квизы пользователя
    const quizzes = await Quiz.find({ 
      creator: req.params.id, 
      isPublished: true 
    })
      .sort({ createdAt: -1 })
      .limit(10)
      .select('title description thumbnail category difficulty stats social createdAt');
    
    res.json({
      success: true,
      data: {
        user,
        quizzes
      }
    });
  } catch (error) {
    console.error('Error fetching public profile:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при получении профиля'
    });
  }
});

module.exports = router;
