const Vocabulary = require('../models/Vocabulary');

// Получить все словари пользователя
exports.getMyVocabularies = async (req, res) => {
  try {
    const vocabularies = await Vocabulary.find({ owner: req.user._id })
      .select('-words')
      .sort({ updatedAt: -1 });
    
    // Добавляем поле isFavorite для текущего пользователя
    const userId = req.user._id;
    const vocabulariesWithFavorite = vocabularies.map(vocab => {
      const vocabObj = vocab.toObject();
      vocabObj.isFavorite = vocab.favorites?.some(id => id.toString() === userId.toString()) || false;
      return vocabObj;
    });
    
    res.status(200).json({
      success: true,
      count: vocabularies.length,
      data: vocabulariesWithFavorite
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Ошибка при получении словарей',
      error: error.message
    });
  }
};

// Получить публичные словари
exports.getPublicVocabularies = async (req, res) => {
  try {
    const { page = 1, limit = 12, category, search, language } = req.query;
    
    const query = { isPublic: true };
    
    if (category && category !== 'all') {
      query.category = category;
    }
    
    if (language) {
      query.sourceLanguage = language;
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    const vocabularies = await Vocabulary.find(query)
      .select('-words')
      .populate('owner', 'username profile.avatar')
      .sort({ 'stats.totalWords': -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    
    const total = await Vocabulary.countDocuments(query);
    
    // Добавляем поле isFavorite для текущего пользователя
    const userId = req.user?._id;
    const vocabulariesWithFavorite = vocabularies.map(vocab => {
      const vocabObj = vocab.toObject();
      vocabObj.isFavorite = userId ? vocab.favorites?.some(id => id.toString() === userId.toString()) : false;
      return vocabObj;
    });
    
    res.status(200).json({
      success: true,
      count: vocabularies.length,
      total,
      pages: Math.ceil(total / limit),
      data: vocabulariesWithFavorite
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Ошибка при получении словарей',
      error: error.message
    });
  }
};

// Создать новый словарь
exports.createVocabulary = async (req, res) => {
  try {
    const { title, description, sourceLanguage, targetLanguage, category, color, icon, isPublic, words } = req.body;
    
    const vocabulary = await Vocabulary.create({
      title,
      description,
      sourceLanguage,
      targetLanguage,
      category,
      color,
      icon,
      isPublic,
      words: words || [],
      owner: req.user._id
    });
    
    res.status(201).json({
      success: true,
      message: 'Словарь успешно создан',
      data: vocabulary
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Ошибка при создании словаря',
      error: error.message
    });
  }
};

// Получить один словарь
exports.getVocabulary = async (req, res) => {
  try {
    const vocabulary = await Vocabulary.findById(req.params.id)
      .populate('owner', 'username profile.avatar');
    
    if (!vocabulary) {
      return res.status(404).json({
        success: false,
        message: 'Словарь не найден'
      });
    }
    
    // Проверка доступа
    if (!vocabulary.isPublic && vocabulary.owner._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'У вас нет доступа к этому словарю'
      });
    }
    
    res.status(200).json({
      success: true,
      data: vocabulary
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Ошибка при получении словаря',
      error: error.message
    });
  }
};

// Обновить словарь
exports.updateVocabulary = async (req, res) => {
  try {
    let vocabulary = await Vocabulary.findById(req.params.id);
    
    if (!vocabulary) {
      return res.status(404).json({
        success: false,
        message: 'Словарь не найден'
      });
    }
    
    // Проверка владельца
    if (vocabulary.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Вы не можете редактировать этот словарь'
      });
    }
    
    const { title, description, sourceLanguage, targetLanguage, category, color, icon, isPublic, words } = req.body;
    
    vocabulary.title = title || vocabulary.title;
    vocabulary.description = description ?? vocabulary.description;
    vocabulary.sourceLanguage = sourceLanguage || vocabulary.sourceLanguage;
    vocabulary.targetLanguage = targetLanguage || vocabulary.targetLanguage;
    vocabulary.category = category || vocabulary.category;
    vocabulary.color = color || vocabulary.color;
    vocabulary.icon = icon || vocabulary.icon;
    vocabulary.isPublic = isPublic ?? vocabulary.isPublic;
    
    // Обновляем слова, если они переданы
    if (words !== undefined) {
      // Создаём карту существующих слов с их прогрессом
      const existingWordsMap = new Map();
      vocabulary.words.forEach(w => {
        // Используем комбинацию слово+перевод как ключ
        const key = `${w.word.toLowerCase().trim()}|${w.translation.toLowerCase().trim()}`;
        existingWordsMap.set(key, {
          learned: w.learned,
          correctCount: w.correctCount,
          incorrectCount: w.incorrectCount,
          lastReviewed: w.lastReviewed,
          nextReview: w.nextReview,
          memoryLevel: w.memoryLevel,
          _id: w._id
        });
      });
      
      // Обновляем слова, сохраняя прогресс для существующих
      vocabulary.words = words.map(newWord => {
        const key = `${newWord.word.toLowerCase().trim()}|${newWord.translation.toLowerCase().trim()}`;
        const existingProgress = existingWordsMap.get(key);
        
        if (existingProgress) {
          // Сохраняем прогресс для существующего слова
          return {
            ...newWord,
            learned: existingProgress.learned,
            correctCount: existingProgress.correctCount,
            incorrectCount: existingProgress.incorrectCount,
            lastReviewed: existingProgress.lastReviewed,
            nextReview: existingProgress.nextReview,
            memoryLevel: existingProgress.memoryLevel
          };
        }
        
        // Новое слово - без прогресса
        return newWord;
      });
      
      // Обновляем статистику
      vocabulary.stats.totalWords = vocabulary.words.length;
      vocabulary.stats.learnedWords = vocabulary.words.filter(w => w.learned).length;
    }
    
    await vocabulary.save();
    
    res.status(200).json({
      success: true,
      message: 'Словарь успешно обновлён',
      data: vocabulary
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Ошибка при обновлении словаря',
      error: error.message
    });
  }
};

// Удалить словарь
exports.deleteVocabulary = async (req, res) => {
  try {
    const vocabulary = await Vocabulary.findById(req.params.id);
    
    if (!vocabulary) {
      return res.status(404).json({
        success: false,
        message: 'Словарь не найден'
      });
    }
    
    if (vocabulary.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Вы не можете удалить этот словарь'
      });
    }
    
    await vocabulary.deleteOne();
    
    res.status(200).json({
      success: true,
      message: 'Словарь успешно удалён'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Ошибка при удалении словаря',
      error: error.message
    });
  }
};

// Добавить слово в словарь
exports.addWord = async (req, res) => {
  try {
    const vocabulary = await Vocabulary.findById(req.params.id);
    
    if (!vocabulary) {
      return res.status(404).json({
        success: false,
        message: 'Словарь не найден'
      });
    }
    
    if (vocabulary.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Вы не можете добавлять слова в этот словарь'
      });
    }
    
    const { word, translation, transcription, example, imageUrl, audioUrl } = req.body;
    
    // Проверка на дубликат
    const existingWord = vocabulary.words.find(w => 
      w.word.toLowerCase() === word.toLowerCase()
    );
    
    if (existingWord) {
      return res.status(400).json({
        success: false,
        message: 'Это слово уже есть в словаре'
      });
    }
    
    vocabulary.words.push({
      word,
      translation,
      transcription,
      example,
      imageUrl,
      audioUrl
    });
    
    await vocabulary.save();
    
    res.status(201).json({
      success: true,
      message: 'Слово добавлено',
      data: vocabulary.words[vocabulary.words.length - 1]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Ошибка при добавлении слова',
      error: error.message
    });
  }
};

// Добавить несколько слов
exports.addWords = async (req, res) => {
  try {
    const vocabulary = await Vocabulary.findById(req.params.id);
    
    if (!vocabulary) {
      return res.status(404).json({
        success: false,
        message: 'Словарь не найден'
      });
    }
    
    if (vocabulary.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Вы не можете добавлять слова в этот словарь'
      });
    }
    
    const { words } = req.body;
    
    if (!Array.isArray(words) || words.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Необходимо передать массив слов'
      });
    }
    
    let added = 0;
    let skipped = 0;
    
    for (const wordData of words) {
      const existingWord = vocabulary.words.find(w => 
        w.word.toLowerCase() === wordData.word.toLowerCase()
      );
      
      if (!existingWord && wordData.word && wordData.translation) {
        vocabulary.words.push(wordData);
        added++;
      } else {
        skipped++;
      }
    }
    
    await vocabulary.save();
    
    res.status(201).json({
      success: true,
      message: `Добавлено ${added} слов, пропущено ${skipped}`,
      data: vocabulary
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Ошибка при добавлении слов',
      error: error.message
    });
  }
};

// Обновить слово
exports.updateWord = async (req, res) => {
  try {
    const vocabulary = await Vocabulary.findById(req.params.id);
    
    if (!vocabulary) {
      return res.status(404).json({
        success: false,
        message: 'Словарь не найден'
      });
    }
    
    if (vocabulary.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Вы не можете редактировать этот словарь'
      });
    }
    
    const word = vocabulary.words.id(req.params.wordId);
    
    if (!word) {
      return res.status(404).json({
        success: false,
        message: 'Слово не найдено'
      });
    }
    
    const { word: newWord, translation, transcription, example, imageUrl, audioUrl } = req.body;
    
    word.word = newWord || word.word;
    word.translation = translation || word.translation;
    word.transcription = transcription ?? word.transcription;
    word.example = example ?? word.example;
    word.imageUrl = imageUrl ?? word.imageUrl;
    word.audioUrl = audioUrl ?? word.audioUrl;
    
    await vocabulary.save();
    
    res.status(200).json({
      success: true,
      message: 'Слово обновлено',
      data: word
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Ошибка при обновлении слова',
      error: error.message
    });
  }
};

// Удалить слово
exports.deleteWord = async (req, res) => {
  try {
    const vocabulary = await Vocabulary.findById(req.params.id);
    
    if (!vocabulary) {
      return res.status(404).json({
        success: false,
        message: 'Словарь не найден'
      });
    }
    
    if (vocabulary.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Вы не можете редактировать этот словарь'
      });
    }
    
    const word = vocabulary.words.id(req.params.wordId);
    
    if (!word) {
      return res.status(404).json({
        success: false,
        message: 'Слово не найдено'
      });
    }
    
    word.deleteOne();
    await vocabulary.save();
    
    res.status(200).json({
      success: true,
      message: 'Слово удалено'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Ошибка при удалении слова',
      error: error.message
    });
  }
};

// Получить слова для изучения
exports.getWordsToLearn = async (req, res) => {
  try {
    const { limit = 10, mode = 'all' } = req.query;
    
    const vocabulary = await Vocabulary.findById(req.params.id);
    
    if (!vocabulary) {
      return res.status(404).json({
        success: false,
        message: 'Словарь не найден'
      });
    }
    
    if (!vocabulary.isPublic && vocabulary.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'У вас нет доступа к этому словарю'
      });
    }
    
    let words = [];
    const now = new Date();
    
    if (mode === 'new') {
      // Только новые слова
      words = vocabulary.words.filter(w => !w.lastReviewed);
    } else if (mode === 'review') {
      // Только слова для повторения
      words = vocabulary.words.filter(w => w.nextReview && w.nextReview <= now);
    } else if (mode === 'difficult') {
      // Сложные слова (много ошибок)
      words = vocabulary.words.filter(w => w.incorrectCount > w.correctCount);
    } else {
      // Все слова, приоритет: для повторения -> новые -> остальные
      const toReview = vocabulary.words.filter(w => w.nextReview && w.nextReview <= now);
      const newWords = vocabulary.words.filter(w => !w.lastReviewed);
      const others = vocabulary.words.filter(w => 
        w.lastReviewed && (!w.nextReview || w.nextReview > now)
      );
      words = [...toReview, ...newWords, ...others];
    }
    
    // Перемешиваем и ограничиваем
    words = words
      .sort(() => Math.random() - 0.5)
      .slice(0, parseInt(limit));
    
    res.status(200).json({
      success: true,
      count: words.length,
      totalInVocabulary: vocabulary.words.length,
      data: words
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Ошибка при получении слов',
      error: error.message
    });
  }
};

// Обновить прогресс изучения слова
exports.updateWordProgress = async (req, res) => {
  try {
    const { wordId, isCorrect } = req.body;
    
    const vocabulary = await Vocabulary.findById(req.params.id);
    
    if (!vocabulary) {
      return res.status(404).json({
        success: false,
        message: 'Словарь не найден'
      });
    }
    
    if (!vocabulary.isPublic && vocabulary.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'У вас нет доступа к этому словарю'
      });
    }
    
    const word = vocabulary.updateWordProgress(wordId, isCorrect);
    
    if (!word) {
      return res.status(404).json({
        success: false,
        message: 'Слово не найдено'
      });
    }
    
    vocabulary.stats.totalReviews += 1;
    vocabulary.stats.lastStudied = new Date();
    
    await vocabulary.save();
    
    res.status(200).json({
      success: true,
      message: isCorrect ? 'Правильно!' : 'Неправильно',
      data: {
        word,
        stats: vocabulary.stats
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Ошибка при обновлении прогресса',
      error: error.message
    });
  }
};

// Сбросить прогресс словаря
exports.resetProgress = async (req, res) => {
  try {
    const vocabulary = await Vocabulary.findById(req.params.id);
    
    if (!vocabulary) {
      return res.status(404).json({
        success: false,
        message: 'Словарь не найден'
      });
    }
    
    if (vocabulary.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Вы не можете сбросить прогресс этого словаря'
      });
    }
    
    // Сбрасываем прогресс всех слов
    vocabulary.words.forEach(word => {
      word.learned = false;
      word.correctCount = 0;
      word.incorrectCount = 0;
      word.lastReviewed = undefined;
      word.nextReview = undefined;
      word.memoryLevel = 0;
    });
    
    vocabulary.stats.learnedWords = 0;
    vocabulary.stats.totalReviews = 0;
    
    await vocabulary.save();
    
    res.status(200).json({
      success: true,
      message: 'Прогресс сброшен',
      data: vocabulary
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Ошибка при сбросе прогресса',
      error: error.message
    });
  }
};

// Копировать публичный словарь
exports.forkVocabulary = async (req, res) => {
  try {
    const originalVocabulary = await Vocabulary.findById(req.params.id);
    
    if (!originalVocabulary) {
      return res.status(404).json({
        success: false,
        message: 'Словарь не найден'
      });
    }
    
    if (!originalVocabulary.isPublic) {
      return res.status(403).json({
        success: false,
        message: 'Этот словарь приватный'
      });
    }
    
    // Создаём копию
    const newVocabulary = await Vocabulary.create({
      title: `${originalVocabulary.title} (копия)`,
      description: originalVocabulary.description,
      sourceLanguage: originalVocabulary.sourceLanguage,
      targetLanguage: originalVocabulary.targetLanguage,
      category: originalVocabulary.category,
      color: originalVocabulary.color,
      icon: originalVocabulary.icon,
      isPublic: false,
      words: originalVocabulary.words.map(w => ({
        word: w.word,
        translation: w.translation,
        transcription: w.transcription,
        example: w.example,
        imageUrl: w.imageUrl,
        audioUrl: w.audioUrl
      })),
      owner: req.user._id
    });
    
    // Увеличиваем счётчик форков оригинала
    originalVocabulary.forks += 1;
    await originalVocabulary.save();
    
    res.status(201).json({
      success: true,
      message: 'Словарь скопирован',
      data: newVocabulary
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Ошибка при копировании словаря',
      error: error.message
    });
  }
};

// Добавить/убрать из избранного
exports.toggleFavorite = async (req, res) => {
  try {
    const vocabulary = await Vocabulary.findById(req.params.id);
    
    if (!vocabulary) {
      return res.status(404).json({
        success: false,
        message: 'Словарь не найден'
      });
    }
    
    if (!vocabulary.isPublic) {
      return res.status(403).json({
        success: false,
        message: 'Этот словарь приватный'
      });
    }
    
    const userId = req.user._id;
    const isFavorite = vocabulary.favorites.includes(userId);
    
    if (isFavorite) {
      vocabulary.favorites = vocabulary.favorites.filter(id => id.toString() !== userId.toString());
    } else {
      vocabulary.favorites.push(userId);
    }
    
    await vocabulary.save();
    
    res.status(200).json({
      success: true,
      message: isFavorite ? 'Удалено из избранного' : 'Добавлено в избранное',
      isFavorite: !isFavorite
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Ошибка',
      error: error.message
    });
  }
};

// Получить избранные словари
exports.getFavorites = async (req, res) => {
  try {
    const vocabularies = await Vocabulary.find({
      favorites: req.user._id,
      isPublic: true
    })
      .select('-words')
      .populate('owner', 'username profile.avatar')
      .sort({ updatedAt: -1 });
    
    // Все словари в избранном - помечаем isFavorite = true
    const vocabulariesWithFavorite = vocabularies.map(vocab => {
      const vocabObj = vocab.toObject();
      vocabObj.isFavorite = true;
      return vocabObj;
    });
    
    res.status(200).json({
      success: true,
      count: vocabularies.length,
      data: vocabulariesWithFavorite
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Ошибка при получении избранных словарей',
      error: error.message
    });
  }
};
