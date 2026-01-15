const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const vocabularyController = require('../controllers/vocabularyController');

// Готовые наборы слов
router.get('/word-sets', authenticate, vocabularyController.getWordSets);
router.get('/word-sets/:category', authenticate, vocabularyController.getWordSetByCategory);

// Публичные роуты (требуют авторизацию для просмотра)
router.get('/public', authenticate, vocabularyController.getPublicVocabularies);

// Мои словари
router.get('/my', authenticate, vocabularyController.getMyVocabularies);

// Избранные словари
router.get('/favorites', authenticate, vocabularyController.getFavorites);

// CRUD для словарей
router.route('/')
  .post(authenticate, vocabularyController.createVocabulary);

router.route('/:id')
  .get(authenticate, vocabularyController.getVocabulary)
  .put(authenticate, vocabularyController.updateVocabulary)
  .delete(authenticate, vocabularyController.deleteVocabulary);

// Работа со словами
router.post('/:id/words', authenticate, vocabularyController.addWord);
router.post('/:id/words/bulk', authenticate, vocabularyController.addWords);
router.route('/:id/words/:wordId')
  .put(authenticate, vocabularyController.updateWord)
  .delete(authenticate, vocabularyController.deleteWord);

// Изучение
router.get('/:id/learn', authenticate, vocabularyController.getWordsToLearn);
router.post('/:id/progress', authenticate, vocabularyController.updateWordProgress);
router.post('/:id/reset', authenticate, vocabularyController.resetProgress);

// Социальные функции
router.post('/:id/fork', authenticate, vocabularyController.forkVocabulary);
router.post('/:id/favorite', authenticate, vocabularyController.toggleFavorite);

module.exports = router;
