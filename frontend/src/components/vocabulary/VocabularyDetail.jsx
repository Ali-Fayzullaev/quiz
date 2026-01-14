// frontend/src/components/vocabulary/VocabularyDetail.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Book,
  ArrowLeft,
  Play,
  Edit,
  Trash2,
  Plus,
  Search,
  MoreVertical,
  Volume2,
  Globe,
  Lock,
  TrendingUp,
  Target,
  RotateCcw,
  Check,
  X,
  BookOpen
} from 'lucide-react';
import { vocabularyAPI } from '../../services/api';

const COLORS = {
  purple: 'from-purple-500 to-pink-500',
  blue: 'from-blue-500 to-cyan-500',
  green: 'from-green-500 to-emerald-500',
  red: 'from-red-500 to-orange-500',
  orange: 'from-orange-500 to-yellow-500',
  pink: 'from-pink-500 to-rose-500',
  teal: 'from-teal-500 to-cyan-500',
  indigo: 'from-indigo-500 to-purple-500'
};

const LANGUAGES = {
  en: { name: 'Английский', flag: '🇬🇧' },
  ru: { name: 'Русский', flag: '🇷🇺' },
  de: { name: 'Немецкий', flag: '🇩🇪' },
  fr: { name: 'Французский', flag: '🇫🇷' },
  es: { name: 'Испанский', flag: '🇪🇸' },
  it: { name: 'Итальянский', flag: '🇮🇹' },
  zh: { name: 'Китайский', flag: '🇨🇳' },
  ja: { name: 'Японский', flag: '🇯🇵' },
  ko: { name: 'Корейский', flag: '🇰🇷' },
  ar: { name: 'Арабский', flag: '🇸🇦' },
  pt: { name: 'Португальский', flag: '🇵🇹' },
  other: { name: 'Другой', flag: '🌐' }
};

const VocabularyDetail = ({ darkMode }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vocabulary, setVocabulary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all'); // all, learned, new
  const [editingWord, setEditingWord] = useState(null);
  const [showAddWord, setShowAddWord] = useState(false);
  const [newWord, setNewWord] = useState({ word: '', translation: '', transcription: '', example: '' });

  useEffect(() => {
    fetchVocabulary();
  }, [id]);

  const fetchVocabulary = async () => {
    try {
      const response = await vocabularyAPI.getVocabulary(id);
      setVocabulary(response.data.data);
    } catch (error) {
      console.error('Error fetching vocabulary:', error);
      navigate('/vocabulary');
    } finally {
      setLoading(false);
    }
  };

  const handleAddWord = async () => {
    if (!newWord.word.trim() || !newWord.translation.trim()) return;

    try {
      await vocabularyAPI.addWord(id, newWord);
      await fetchVocabulary();
      setNewWord({ word: '', translation: '', transcription: '', example: '' });
      setShowAddWord(false);
    } catch (error) {
      console.error('Error adding word:', error);
    }
  };

  const handleDeleteWord = async (wordId) => {
    if (!confirm('Удалить это слово?')) return;

    try {
      await vocabularyAPI.deleteWord(id, wordId);
      await fetchVocabulary();
    } catch (error) {
      console.error('Error deleting word:', error);
    }
  };

  const handleUpdateWord = async (wordId) => {
    try {
      await vocabularyAPI.updateWord(id, wordId, editingWord);
      await fetchVocabulary();
      setEditingWord(null);
    } catch (error) {
      console.error('Error updating word:', error);
    }
  };

  const handleResetProgress = async () => {
    if (!confirm('Сбросить весь прогресс изучения? Это действие нельзя отменить.')) return;

    try {
      await vocabularyAPI.resetProgress(id);
      await fetchVocabulary();
    } catch (error) {
      console.error('Error resetting progress:', error);
    }
  };

  const speakWord = (text, lang = 'en') => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang === 'en' ? 'en-US' : lang === 'ru' ? 'ru-RU' : lang;
    speechSynthesis.speak(utterance);
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-[#0a0a0f]' : 'bg-gray-50'}`}>
        <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!vocabulary) return null;

  const colorClass = COLORS[vocabulary.color] || COLORS.purple;
  const progress = vocabulary.stats?.totalWords > 0
    ? Math.round((vocabulary.stats.learnedWords / vocabulary.stats.totalWords) * 100)
    : 0;

  const filteredWords = vocabulary.words.filter(word => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (!word.word.toLowerCase().includes(query) && !word.translation.toLowerCase().includes(query)) {
        return false;
      }
    }
    if (filter === 'learned' && !word.learned) return false;
    if (filter === 'new' && word.lastReviewed) return false;
    return true;
  });

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-[#0a0a0f]' : 'bg-gray-50'}`}>
      {/* Hero Header */}
      <div className={`bg-gradient-to-br ${colorClass} relative overflow-hidden`}>
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        
        <div className="relative max-w-7xl mx-auto px-6 py-8">
          <button
            onClick={() => navigate('/vocabulary')}
            className="flex items-center gap-2 text-white/80 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            Назад к словарям
          </button>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">{LANGUAGES[vocabulary.sourceLanguage]?.flag}</span>
                <span className="text-white/50">→</span>
                <span className="text-3xl">{LANGUAGES[vocabulary.targetLanguage]?.flag}</span>
                {vocabulary.isPublic ? (
                  <Globe className="w-5 h-5 text-white/70 ml-2" />
                ) : (
                  <Lock className="w-5 h-5 text-white/70 ml-2" />
                )}
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                {vocabulary.title}
              </h1>
              {vocabulary.description && (
                <p className="text-white/70 max-w-2xl">
                  {vocabulary.description}
                </p>
              )}
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                to={`/vocabulary/${id}/learn`}
                className="flex items-center gap-2 px-6 py-3 bg-white text-gray-900 font-medium rounded-xl hover:bg-white/90 transition-all shadow-lg"
              >
                <Play className="w-5 h-5" />
                Учить
              </Link>
              <Link
                to={`/vocabulary/${id}/edit`}
                className="flex items-center gap-2 px-4 py-3 bg-white/20 text-white font-medium rounded-xl hover:bg-white/30 transition-all backdrop-blur-sm"
              >
                <Edit className="w-5 h-5" />
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <BookOpen className="w-6 h-6 text-white/70 mb-2" />
              <p className="text-2xl font-bold text-white">{vocabulary.stats?.totalWords || 0}</p>
              <p className="text-white/70 text-sm">Всего слов</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <Check className="w-6 h-6 text-white/70 mb-2" />
              <p className="text-2xl font-bold text-white">{vocabulary.stats?.learnedWords || 0}</p>
              <p className="text-white/70 text-sm">Выучено</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <TrendingUp className="w-6 h-6 text-white/70 mb-2" />
              <p className="text-2xl font-bold text-white">{progress}%</p>
              <p className="text-white/70 text-sm">Прогресс</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <Target className="w-6 h-6 text-white/70 mb-2" />
              <p className="text-2xl font-bold text-white">{vocabulary.stats?.totalReviews || 0}</p>
              <p className="text-white/70 text-sm">Повторений</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Toolbar */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
            <input
              type="text"
              placeholder="Поиск слов..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`
                w-full pl-12 pr-4 py-3 rounded-xl border transition-all
                ${darkMode 
                  ? 'bg-white/5 border-white/10 text-white placeholder-gray-500' 
                  : 'bg-white border-gray-200'
                }
              `}
            />
          </div>

          <div className="flex gap-2">
            {['all', 'learned', 'new'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`
                  px-4 py-2 rounded-xl font-medium transition-all
                  ${filter === f
                    ? `bg-gradient-to-r ${colorClass} text-white`
                    : darkMode
                      ? 'bg-white/5 text-gray-400 hover:bg-white/10'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }
                `}
              >
                {f === 'all' ? 'Все' : f === 'learned' ? 'Выучено' : 'Новые'}
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowAddWord(true)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium bg-gradient-to-r ${colorClass} text-white hover:opacity-90 transition-all`}
          >
            <Plus className="w-5 h-5" />
            Добавить
          </button>

          <button
            onClick={handleResetProgress}
            className={`p-3 rounded-xl transition-colors ${darkMode ? 'bg-white/5 hover:bg-white/10 text-gray-400' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'}`}
            title="Сбросить прогресс"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>

        {/* Add Word Form */}
        {showAddWord && (
          <div className={`mb-6 p-6 rounded-2xl ${darkMode ? 'bg-white/5' : 'bg-white border border-gray-200'}`}>
            <h3 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Добавить слово
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <input
                type="text"
                placeholder="Слово"
                value={newWord.word}
                onChange={(e) => setNewWord({ ...newWord, word: e.target.value })}
                className={`px-4 py-3 rounded-xl border ${darkMode ? 'bg-white/5 border-white/10 text-white' : 'border-gray-200'}`}
              />
              <input
                type="text"
                placeholder="Перевод"
                value={newWord.translation}
                onChange={(e) => setNewWord({ ...newWord, translation: e.target.value })}
                className={`px-4 py-3 rounded-xl border ${darkMode ? 'bg-white/5 border-white/10 text-white' : 'border-gray-200'}`}
              />
              <input
                type="text"
                placeholder="Транскрипция (опционально)"
                value={newWord.transcription}
                onChange={(e) => setNewWord({ ...newWord, transcription: e.target.value })}
                className={`px-4 py-3 rounded-xl border ${darkMode ? 'bg-white/5 border-white/10 text-white' : 'border-gray-200'}`}
              />
              <input
                type="text"
                placeholder="Пример (опционально)"
                value={newWord.example}
                onChange={(e) => setNewWord({ ...newWord, example: e.target.value })}
                className={`px-4 py-3 rounded-xl border ${darkMode ? 'bg-white/5 border-white/10 text-white' : 'border-gray-200'}`}
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleAddWord}
                className={`px-6 py-2 rounded-xl font-medium bg-gradient-to-r ${colorClass} text-white`}
              >
                Добавить
              </button>
              <button
                onClick={() => setShowAddWord(false)}
                className={`px-6 py-2 rounded-xl font-medium ${darkMode ? 'bg-white/10 text-white' : 'bg-gray-100 text-gray-700'}`}
              >
                Отмена
              </button>
            </div>
          </div>
        )}

        {/* Words List */}
        <div className="space-y-3">
          {filteredWords.length > 0 ? (
            filteredWords.map((word, index) => (
              <div
                key={word._id}
                className={`
                  group p-4 rounded-xl transition-all
                  ${darkMode ? 'bg-white/5 hover:bg-white/10' : 'bg-white hover:shadow-md border border-gray-100'}
                `}
              >
                {editingWord?._id === word._id ? (
                  /* Edit Mode */
                  <div className="flex items-center gap-4">
                    <input
                      type="text"
                      value={editingWord.word}
                      onChange={(e) => setEditingWord({ ...editingWord, word: e.target.value })}
                      className={`flex-1 px-3 py-2 rounded-lg border ${darkMode ? 'bg-white/5 border-white/10 text-white' : 'border-gray-200'}`}
                    />
                    <input
                      type="text"
                      value={editingWord.translation}
                      onChange={(e) => setEditingWord({ ...editingWord, translation: e.target.value })}
                      className={`flex-1 px-3 py-2 rounded-lg border ${darkMode ? 'bg-white/5 border-white/10 text-white' : 'border-gray-200'}`}
                    />
                    <button
                      onClick={() => handleUpdateWord(word._id)}
                      className="p-2 rounded-lg bg-green-500 text-white hover:bg-green-600"
                    >
                      <Check className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setEditingWord(null)}
                      className="p-2 rounded-lg bg-gray-500 text-white hover:bg-gray-600"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  /* View Mode */
                  <div className="flex items-center gap-4">
                    <span className={`
                      w-8 h-8 flex-shrink-0 rounded-lg flex items-center justify-center font-bold text-sm
                      ${word.learned 
                        ? 'bg-green-500 text-white' 
                        : `bg-gradient-to-r ${colorClass} text-white`
                      }
                    `}>
                      {word.learned ? <Check className="w-4 h-4" /> : index + 1}
                    </span>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {word.word}
                        </span>
                        {word.transcription && (
                          <span className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                            [{word.transcription}]
                          </span>
                        )}
                        <button
                          onClick={() => speakWord(word.word, vocabulary.sourceLanguage)}
                          className={`p-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity ${darkMode ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
                        >
                          <Volume2 className={`w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                        </button>
                      </div>
                      <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {word.translation}
                      </p>
                      {word.example && (
                        <p className={`text-sm mt-1 italic ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                          "{word.example}"
                        </p>
                      )}
                    </div>

                    {/* Memory Level Indicator */}
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map(level => (
                        <div
                          key={level}
                          className={`w-2 h-6 rounded-full ${
                            level <= word.memoryLevel
                              ? 'bg-green-500'
                              : darkMode ? 'bg-white/10' : 'bg-gray-200'
                          }`}
                        />
                      ))}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => setEditingWord({ ...word })}
                        className={`p-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteWord(word._id)}
                        className="p-2 rounded-lg hover:bg-red-500/10 text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <BookOpen className={`w-16 h-16 mx-auto mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-300'}`} />
              <p className={`text-lg font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {searchQuery ? 'Слова не найдены' : 'В словаре пока нет слов'}
              </p>
              {!searchQuery && (
                <button
                  onClick={() => setShowAddWord(true)}
                  className={`mt-4 px-6 py-2 rounded-xl font-medium bg-gradient-to-r ${colorClass} text-white`}
                >
                  Добавить первое слово
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VocabularyDetail;
