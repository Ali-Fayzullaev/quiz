// frontend/src/components/vocabulary/CreateVocabulary.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  X
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

const CreateVocabulary = ({ darkMode }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
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

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const validWords = words.filter(w => w.word.trim() && w.translation.trim());
      
      const response = await vocabularyAPI.createVocabulary({
        ...formData,
        words: validWords
      });

      navigate(`/vocabulary/${response.data.data._id}`);
    } catch (error) {
      console.error('Error creating vocabulary:', error);
      alert('Ошибка при создании словаря');
    } finally {
      setLoading(false);
    }
  };

  const selectedColor = COLORS.find(c => c.code === formData.color);

  return (
    <div className={`min-h-screen p-6 ${darkMode ? 'bg-[#0a0a0f]' : 'bg-gray-50'}`}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate('/vocabulary')}
            className={`p-2 rounded-xl transition-colors ${darkMode ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
          >
            <ArrowLeft className={`w-6 h-6 ${darkMode ? 'text-white' : 'text-gray-900'}`} />
          </button>
          <div>
            <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Создать словарь
            </h1>
            <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Шаг {step} из 2
            </p>
          </div>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
          <div className={`flex-1 h-2 rounded-full overflow-hidden ${darkMode ? 'bg-white/10' : 'bg-gray-200'}`}>
            <div 
              className={`h-full bg-gradient-to-r ${selectedColor?.class} transition-all duration-500`}
              style={{ width: step === 1 ? '50%' : '100%' }}
            />
          </div>
        </div>

        {step === 1 ? (
          /* Step 1: Basic Info */
          <div className={`rounded-2xl p-6 ${darkMode ? 'bg-white/5' : 'bg-white border border-gray-200'}`}>
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
                      ? 'bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-purple-500' 
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
                      ? 'bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-purple-500' 
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
                        ? 'bg-white/5 border-white/10 text-white focus:border-purple-500' 
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
                        ? 'bg-white/5 border-white/10 text-white focus:border-purple-500' 
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
                            ? 'bg-white/5 hover:bg-white/10 text-gray-300'
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
              <div className={`flex items-center justify-between p-4 rounded-xl ${darkMode ? 'bg-white/5' : 'bg-gray-100'}`}>
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
                    ${formData.isPublic ? 'bg-green-500' : darkMode ? 'bg-white/20' : 'bg-gray-300'}
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
          <div className={`rounded-2xl p-6 ${darkMode ? 'bg-white/5' : 'bg-white border border-gray-200'}`}>
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Добавить слова
              </h2>
              <button
                onClick={() => setShowBulkInput(!showBulkInput)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors ${darkMode ? 'bg-white/10 hover:bg-white/15 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
              >
                <Upload className="w-4 h-4" />
                Импорт списком
              </button>
            </div>

            {/* Bulk import */}
            {showBulkInput && (
              <div className={`mb-6 p-4 rounded-xl ${darkMode ? 'bg-white/5' : 'bg-gray-100'}`}>
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
                      ? 'bg-white/5 border-white/10 text-white placeholder-gray-500' 
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
                    className={`px-4 py-2 rounded-lg transition-colors ${darkMode ? 'bg-white/10 hover:bg-white/15 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}`}
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
                  className={`p-4 rounded-xl ${darkMode ? 'bg-white/5' : 'bg-gray-50'}`}
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
                            ? 'bg-white/5 border-white/10 text-white placeholder-gray-500' 
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
                            ? 'bg-white/5 border-white/10 text-white placeholder-gray-500' 
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
                            ? 'bg-white/5 border-white/10 text-white placeholder-gray-500' 
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
                            ? 'bg-white/5 border-white/10 text-white placeholder-gray-500' 
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

            {/* Add word button */}
            <button
              onClick={addWord}
              className={`
                w-full mt-4 py-3 border-2 border-dashed rounded-xl flex items-center justify-center gap-2 transition-colors
                ${darkMode 
                  ? 'border-white/20 text-gray-400 hover:border-purple-500 hover:text-purple-400' 
                  : 'border-gray-300 text-gray-500 hover:border-purple-500 hover:text-purple-600'
                }
              `}
            >
              <Plus className="w-5 h-5" />
              Добавить слово
            </button>

            {/* Actions */}
            <div className="flex justify-between mt-8">
              <button
                onClick={() => setStep(1)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-colors ${darkMode ? 'bg-white/10 hover:bg-white/15 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
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
                    Создание...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Создать словарь
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
