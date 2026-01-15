// frontend/src/components/vocabulary/CreateVocabulary.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import {
  Book,
  ArrowLeft,
  Globe,
  Lock,
  Plus,
  Trash2,
  Upload,
  Sparkles,
  Check,
  X,
  Wand2,
  Loader2
} from 'lucide-react';
import { vocabularyAPI } from '../../services/api';

const LANGUAGES = [
  { code: 'en', name: 'Английский', flag: '🇬🇧' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'de', name: 'Немецкий', flag: '🇩🇪' },
  { code: 'fr', name: 'Французский', flag: '🇫🇷' },
  { code: 'es', name: 'Испанский', flag: '🇪🇸' },
  { code: 'it', name: 'Итальянский', flag: '🇮🇹' },
  { code: 'zh', name: 'Китайский', flag: '🇨🇳' },
  { code: 'ja', name: 'Японский', flag: '🇯🇵' },
  { code: 'ko', name: 'Корейский', flag: '🇰🇷' },
  { code: 'ar', name: 'Арабский', flag: '🇸🇦' },
  { code: 'pt', name: 'Португальский', flag: '🇵🇹' },
  { code: 'other', name: 'Другой', flag: '🌐' }
];

const CATEGORIES = [
  { code: 'general', name: 'Общее', icon: '📚' },
  { code: 'business', name: 'Бизнес', icon: '💼' },
  { code: 'travel', name: 'Путешествия', icon: '✈️' },
  { code: 'food', name: 'Еда', icon: '🍕' },
  { code: 'technology', name: 'Технологии', icon: '💻' },
  { code: 'science', name: 'Наука', icon: '🔬' },
  { code: 'medicine', name: 'Медицина', icon: '⚕️' },
  { code: 'law', name: 'Право', icon: '⚖️' },
  { code: 'sport', name: 'Спорт', icon: '⚽' },
  { code: 'music', name: 'Музыка', icon: '🎵' },
  { code: 'art', name: 'Искусство', icon: '🎨' },
  { code: 'nature', name: 'Природа', icon: '🌿' },
  { code: 'custom', name: 'Своя тема', icon: '✨' }
];

const COLORS = [
  { code: 'purple', name: 'Фиолетовый', class: 'from-purple-500 to-pink-500' },
  { code: 'blue', name: 'Синий', class: 'from-blue-500 to-cyan-500' },
  { code: 'green', name: 'Зелёный', class: 'from-green-500 to-emerald-500' },
  { code: 'red', name: 'Красный', class: 'from-red-500 to-orange-500' },
  { code: 'orange', name: 'Оранжевый', class: 'from-orange-500 to-yellow-500' },
  { code: 'pink', name: 'Розовый', class: 'from-pink-500 to-rose-500' },
  { code: 'teal', name: 'Бирюзовый', class: 'from-teal-500 to-cyan-500' },
  { code: 'indigo', name: 'Индиго', class: 'from-indigo-500 to-purple-500' }
];

const CreateVocabulary = () => {
  const { darkMode } = useTheme();
  const navigate = useNavigate();
  const { id } = useParams(); // Получаем id для редактирования
  const isEditMode = Boolean(id);
  
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditMode);
  const [step, setStep] = useState(1); // 1 - основное, 2 - слова
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    sourceLanguage: 'en',
    targetLanguage: 'ru',
    category: 'general',
    color: 'purple',
    isPublic: false
  });

  const [words, setWords] = useState([
    { word: '', translation: '', transcription: '', example: '' }
  ]);

  const [bulkInput, setBulkInput] = useState('');
  const [showBulkInput, setShowBulkInput] = useState(false);
  const [showWordSets, setShowWordSets] = useState(false);
  const [loadingWordSet, setLoadingWordSet] = useState(false);

  // Загружаем данные словаря при редактировании
  useEffect(() => {
    if (isEditMode && id) {
      const fetchVocabulary = async () => {
        try {
          const response = await vocabularyAPI.getVocabulary(id);
          const vocab = response.data.data;
          
          setFormData({
            title: vocab.title || '',
            description: vocab.description || '',
            sourceLanguage: vocab.sourceLanguage || 'en',
            targetLanguage: vocab.targetLanguage || 'ru',
            category: vocab.category || 'general',
            color: vocab.color || 'purple',
            isPublic: vocab.isPublic || false
          });
          
          if (vocab.words && vocab.words.length > 0) {
            setWords(vocab.words.map(w => ({
              word: w.word || '',
              translation: w.translation || '',
              transcription: w.transcription || '',
              example: w.example || ''
            })));
          }
        } catch (error) {
          console.error('Error fetching vocabulary:', error);
          alert('Ошибка при загрузке словаря');
          navigate('/vocabulary');
        } finally {
          setInitialLoading(false);
        }
      };
      
      fetchVocabulary();
    }
  }, [id, isEditMode, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleWordChange = (index, field, value) => {
    const newWords = [...words];
    newWords[index][field] = value;
    setWords(newWords);
  };

  const addWord = () => {
    setWords([...words, { word: '', translation: '', transcription: '', example: '' }]);
  };

  const removeWord = (index) => {
    if (words.length > 1) {
      setWords(words.filter((_, i) => i !== index));
    }
  };

  const clearAllWords = () => {
    if (window.confirm('Удалить все слова?')) {
      setWords([{ word: '', translation: '', transcription: '', example: '' }]);
    }
  };

  const handleBulkImport = () => {
    const lines = bulkInput.trim().split('\n');
    const newWords = lines
      .map(line => {
        const parts = line.split(/[-–—=:]/).map(p => p.trim());
        if (parts.length >= 2) {
          return {
            word: parts[0],
            translation: parts[1],
            transcription: parts[2] || '',
            example: ''
          };
        }
        return null;
      })
      .filter(Boolean);

    if (newWords.length > 0) {
      setWords([...words.filter(w => w.word || w.translation), ...newWords]);
      setBulkInput('');
      setShowBulkInput(false);
    }
  };

  // Загрузить готовый набор слов
  const handleLoadWordSet = async () => {
    setLoadingWordSet(true);
    try {
      const response = await vocabularyAPI.getWordSetByCategory(
        formData.category,
        formData.sourceLanguage,
        formData.targetLanguage
      );
      
      const wordSetData = response.data.data;
      
      if (wordSetData && wordSetData.length > 0) {
        const newWords = wordSetData.map(w => ({
          word: w.word,
          translation: w.translation,
          transcription: w.transcription || '',
          example: w.example || ''
        }));
        
        // Добавляем к существующим (или заменяем пустые)
        const existingWords = words.filter(w => w.word.trim() || w.translation.trim());
        setWords(existingWords.length > 0 ? [...existingWords, ...newWords] : newWords);
        setShowWordSets(false);
      }
    } catch (error) {
      console.error('Error loading word set:', error);
      alert('Набор слов для этой категории не найден');
    } finally {
      setLoadingWordSet(false);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const validWords = words.filter(w => w.word.trim() && w.translation.trim());
      
      const data = {
        ...formData,
        words: validWords
      };

      let response;
      if (isEditMode) {
        response = await vocabularyAPI.updateVocabulary(id, data);
        navigate(`/vocabulary/${id}`);
      } else {
        response = await vocabularyAPI.createVocabulary(data);
        navigate(`/vocabulary/${response.data.data._id}`);
      }
    } catch (error) {
      console.error('Error saving vocabulary:', error);
      alert(isEditMode ? 'Ошибка при сохранении словаря' : 'Ошибка при создании словаря');
    } finally {
      setLoading(false);
    }
  };

  const selectedColor = COLORS.find(c => c.code === formData.color);

  // Показываем загрузку при редактировании
  if (initialLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-gray-950' : 'bg-gray-50'}`}>
        <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className={`min-h-screen p-4 sm:p-6 ${darkMode ? 'bg-gray-950' : 'bg-gray-50'}`}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate(isEditMode ? `/vocabulary/${id}` : '/vocabulary')}
            className={`p-2 rounded-xl transition-colors ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
          >
            <ArrowLeft className={`w-6 h-6 ${darkMode ? 'text-white' : 'text-gray-900'}`} />
          </button>
          <div>
            <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {isEditMode ? 'Редактировать словарь' : 'Создать словарь'}
            </h1>
            <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Шаг {step} из 2
            </p>
          </div>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
          <div className={`flex-1 h-2 rounded-full overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-gray-200'}`}>
            <div 
              className={`h-full bg-gradient-to-r ${selectedColor?.class} transition-all duration-500`}
              style={{ width: step === 1 ? '50%' : '100%' }}
            />
          </div>
        </div>

        {step === 1 ? (
          /* Step 1: Basic Info */
          <div className={`rounded-2xl p-6 ${darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
            <h2 className={`text-xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Основная информация
            </h2>

            <div className="space-y-6">
              {/* Title */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Название словаря *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Например: Бизнес английский"
                  className={`
                    w-full px-4 py-3 rounded-xl border transition-all
                    ${darkMode 
                      ? 'bg-gray-900 border-gray-700 text-white placeholder-gray-500 focus:border-purple-500' 
                      : 'bg-gray-50 border-gray-200 focus:border-purple-500'
                    }
                  `}
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Описание
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Краткое описание словаря..."
                  rows={3}
                  className={`
                    w-full px-4 py-3 rounded-xl border transition-all resize-none
                    ${darkMode 
                      ? 'bg-gray-900 border-gray-700 text-white placeholder-gray-500 focus:border-purple-500' 
                      : 'bg-gray-50 border-gray-200 focus:border-purple-500'
                    }
                  `}
                />
              </div>

              {/* Languages */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Язык оригинала
                  </label>
                  <select
                    name="sourceLanguage"
                    value={formData.sourceLanguage}
                    onChange={handleChange}
                    className={`
                      w-full px-4 py-3 rounded-xl border transition-all cursor-pointer
                      ${darkMode 
                        ? 'bg-gray-900 border-gray-700 text-white focus:border-purple-500' 
                        : 'bg-gray-50 border-gray-200 focus:border-purple-500'
                      }
                    `}
                  >
                    {LANGUAGES.map(lang => (
                      <option key={lang.code} value={lang.code}>
                        {lang.flag} {lang.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Язык перевода
                  </label>
                  <select
                    name="targetLanguage"
                    value={formData.targetLanguage}
                    onChange={handleChange}
                    className={`
                      w-full px-4 py-3 rounded-xl border transition-all cursor-pointer
                      ${darkMode 
                        ? 'bg-gray-900 border-gray-700 text-white focus:border-purple-500' 
                        : 'bg-gray-50 border-gray-200 focus:border-purple-500'
                      }
                    `}
                  >
                    {LANGUAGES.map(lang => (
                      <option key={lang.code} value={lang.code}>
                        {lang.flag} {lang.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Category */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Категория
                </label>
                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat.code}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, category: cat.code }))}
                      className={`
                        p-3 rounded-xl text-center transition-all
                        ${formData.category === cat.code
                          ? `bg-gradient-to-r ${selectedColor?.class} text-white`
                          : darkMode
                            ? 'bg-gray-900 hover:bg-gray-700 text-gray-300'
                            : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                        }
                      `}
                    >
                      <span className="text-xl block mb-1">{cat.icon}</span>
                      <span className="text-xs">{cat.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Color */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Цвет
                </label>
                <div className="flex flex-wrap gap-3">
                  {COLORS.map(color => (
                    <button
                      key={color.code}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, color: color.code }))}
                      className={`
                        w-10 h-10 rounded-xl bg-gradient-to-br ${color.class} transition-all
                        ${formData.color === color.code ? 'ring-2 ring-offset-2 ring-purple-500 scale-110' : 'hover:scale-105'}
                      `}
                    >
                      {formData.color === color.code && (
                        <Check className="w-5 h-5 text-white mx-auto" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Public toggle */}
              <div className={`flex items-center justify-between p-4 rounded-xl ${darkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
                <div className="flex items-center gap-3">
                  {formData.isPublic ? (
                    <Globe className={`w-5 h-5 ${darkMode ? 'text-green-400' : 'text-green-500'}`} />
                  ) : (
                    <Lock className={`w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                  )}
                  <div>
                    <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {formData.isPublic ? 'Публичный словарь' : 'Приватный словарь'}
                    </p>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {formData.isPublic ? 'Другие пользователи смогут найти и копировать' : 'Только вы можете видеть'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, isPublic: !prev.isPublic }))}
                  className={`
                    relative w-12 h-6 rounded-full transition-colors
                    ${formData.isPublic ? 'bg-green-500' : darkMode ? 'bg-gray-600' : 'bg-gray-300'}
                  `}
                >
                  <div className={`
                    absolute top-1 w-4 h-4 rounded-full bg-white transition-transform
                    ${formData.isPublic ? 'left-7' : 'left-1'}
                  `} />
                </button>
              </div>
            </div>

            {/* Next button */}
            <div className="flex justify-end mt-8">
              <button
                onClick={() => setStep(2)}
                disabled={!formData.title.trim()}
                className={`
                  flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all
                  ${formData.title.trim()
                    ? `bg-gradient-to-r ${selectedColor?.class} text-white hover:opacity-90`
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }
                `}
              >
                Далее: Добавить слова
              </button>
            </div>
          </div>
        ) : (
          /* Step 2: Add Words */
          <div className={`rounded-2xl p-6 ${darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
              <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Добавить слова
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setShowWordSets(!showWordSets);
                    setShowBulkInput(false);
                  }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors ${
                    showWordSets 
                      ? 'bg-purple-500 text-white' 
                      : darkMode 
                        ? 'bg-purple-500/20 hover:bg-purple-500/30 text-purple-400' 
                        : 'bg-purple-100 hover:bg-purple-200 text-purple-700'
                  }`}
                >
                  <Wand2 className="w-4 h-4" />
                  <span className="hidden sm:inline">Готовые слова</span>
                </button>
                <button
                  onClick={() => {
                    setShowBulkInput(!showBulkInput);
                    setShowWordSets(false);
                  }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
                >
                  <Upload className="w-4 h-4" />
                  <span className="hidden sm:inline">Импорт</span>
                </button>
              </div>
            </div>

            {/* Word Sets Panel */}
            {showWordSets && (
              <div className={`mb-6 p-4 rounded-xl ${darkMode ? 'bg-gradient-to-br from-purple-900/30 to-pink-900/30 border border-purple-500/30' : 'bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200'}`}>
                <div className="flex items-start gap-3 mb-3">
                  <div className={`p-2 rounded-lg ${darkMode ? 'bg-purple-500/20' : 'bg-purple-100'}`}>
                    <Sparkles className="w-5 h-5 text-purple-500" />
                  </div>
                  <div>
                    <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      Загрузить готовый набор слов
                    </h3>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Добавить 25 популярных слов по категории "{CATEGORIES.find(c => c.code === formData.category)?.name || formData.category}"
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleLoadWordSet}
                  disabled={loadingWordSet}
                  className={`
                    w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all
                    bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:opacity-90
                    ${loadingWordSet ? 'opacity-70 cursor-wait' : ''}
                  `}
                >
                  {loadingWordSet ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Загрузка...
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-5 h-5" />
                      Добавить готовые слова
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Bulk import */}
            {showBulkInput && (
              <div className={`mb-6 p-4 rounded-xl ${darkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
                <p className={`text-sm mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Введите слова в формате: слово - перевод (каждое с новой строки)
                </p>
                <textarea
                  value={bulkInput}
                  onChange={(e) => setBulkInput(e.target.value)}
                  placeholder="hello - привет&#10;world - мир&#10;book - книга"
                  rows={5}
                  className={`
                    w-full px-4 py-3 rounded-xl border transition-all resize-none mb-3
                    ${darkMode 
                      ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' 
                      : 'bg-white border-gray-200'
                    }
                  `}
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleBulkImport}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                  >
                    Импортировать
                  </button>
                  <button
                    onClick={() => setShowBulkInput(false)}
                    className={`px-4 py-2 rounded-lg transition-colors ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}`}
                  >
                    Отмена
                  </button>
                </div>
              </div>
            )}

            {/* Words list */}
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
              {words.map((word, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-xl ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}
                >
                  <div className="flex items-start gap-4">
                    <span className={`
                      w-8 h-8 flex-shrink-0 rounded-lg flex items-center justify-center font-bold text-sm
                      bg-gradient-to-r ${selectedColor?.class} text-white
                    `}>
                      {index + 1}
                    </span>
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                      <input
                        type="text"
                        placeholder="Слово"
                        value={word.word}
                        onChange={(e) => handleWordChange(index, 'word', e.target.value)}
                        className={`
                          px-4 py-2 rounded-lg border transition-all
                          ${darkMode 
                            ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' 
                            : 'bg-white border-gray-200'
                          }
                        `}
                      />
                      <input
                        type="text"
                        placeholder="Перевод"
                        value={word.translation}
                        onChange={(e) => handleWordChange(index, 'translation', e.target.value)}
                        className={`
                          px-4 py-2 rounded-lg border transition-all
                          ${darkMode 
                            ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' 
                            : 'bg-white border-gray-200'
                          }
                        `}
                      />
                      <input
                        type="text"
                        placeholder="Транскрипция (опционально)"
                        value={word.transcription}
                        onChange={(e) => handleWordChange(index, 'transcription', e.target.value)}
                        className={`
                          px-4 py-2 rounded-lg border transition-all
                          ${darkMode 
                            ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' 
                            : 'bg-white border-gray-200'
                          }
                        `}
                      />
                      <input
                        type="text"
                        placeholder="Пример использования (опционально)"
                        value={word.example}
                        onChange={(e) => handleWordChange(index, 'example', e.target.value)}
                        className={`
                          px-4 py-2 rounded-lg border transition-all
                          ${darkMode 
                            ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' 
                            : 'bg-white border-gray-200'
                          }
                        `}
                      />
                    </div>
                    <button
                      onClick={() => removeWord(index)}
                      disabled={words.length === 1}
                      className={`
                        p-2 rounded-lg transition-colors
                        ${words.length === 1 
                          ? 'opacity-30 cursor-not-allowed' 
                          : 'hover:bg-red-500/10 text-red-500'
                        }
                      `}
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Add word button and Clear all */}
            <div className="flex gap-3 mt-4">
              <button
                onClick={addWord}
                className={`
                  flex-1 py-3 border-2 border-dashed rounded-xl flex items-center justify-center gap-2 transition-colors
                  ${darkMode 
                    ? 'border-white/20 text-gray-400 hover:border-purple-500 hover:text-purple-400' 
                    : 'border-gray-300 text-gray-500 hover:border-purple-500 hover:text-purple-600'
                  }
                `}
              >
                <Plus className="w-5 h-5" />
                Добавить слово
              </button>
              
              {words.length > 1 && (
                <button
                  onClick={clearAllWords}
                  className={`
                    px-4 py-3 rounded-xl flex items-center justify-center gap-2 transition-colors
                    ${darkMode 
                      ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20' 
                      : 'bg-red-50 text-red-500 hover:bg-red-100'
                    }
                  `}
                >
                  <Trash2 className="w-5 h-5" />
                  <span className="hidden sm:inline">Удалить всё</span>
                </button>
              )}
            </div>

            {/* Actions */}
            <div className="flex justify-between mt-8">
              <button
                onClick={() => setStep(1)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-colors ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
              >
                <ArrowLeft className="w-5 h-5" />
                Назад
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading || words.filter(w => w.word && w.translation).length === 0}
                className={`
                  flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all
                  ${loading || words.filter(w => w.word && w.translation).length === 0
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : `bg-gradient-to-r ${selectedColor?.class} text-white hover:opacity-90 hover:shadow-lg hover:shadow-purple-500/25`
                  }
                `}
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {isEditMode ? 'Сохранение...' : 'Создание...'}
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    {isEditMode ? 'Сохранить изменения' : 'Создать словарь'}
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateVocabulary;
