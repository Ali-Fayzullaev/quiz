// frontend/src/components/vocabulary/VocabularyList.jsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Book,
  Plus,
  Search,
  Globe,
  Lock,
  MoreVertical,
  Edit,
  Trash2,
  Copy,
  Play,
  Heart,
  Users,
  TrendingUp,
  Filter,
  BookOpen,
  Sparkles
} from 'lucide-react';
import { vocabularyAPI } from '../../services/api';

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

const CATEGORIES = {
  general: 'Общее',
  business: 'Бизнес',
  travel: 'Путешествия',
  food: 'Еда',
  technology: 'Технологии',
  science: 'Наука',
  medicine: 'Медицина',
  law: 'Право',
  sport: 'Спорт',
  music: 'Музыка',
  art: 'Искусство',
  nature: 'Природа',
  custom: 'Своя тема'
};

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

const VocabularyList = ({ darkMode }) => {
  const navigate = useNavigate();
  const [vocabularies, setVocabularies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('my'); // 'my', 'public', 'favorites'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [menuOpen, setMenuOpen] = useState(null);

  useEffect(() => {
    fetchVocabularies();
  }, [activeTab]);

  const fetchVocabularies = async () => {
    setLoading(true);
    try {
      let response;
      if (activeTab === 'my') {
        response = await vocabularyAPI.getMyVocabularies();
      } else if (activeTab === 'public') {
        response = await vocabularyAPI.getPublicVocabularies({ category: selectedCategory, search: searchQuery });
      } else {
        response = await vocabularyAPI.getFavorites();
      }
      setVocabularies(response.data.data || []);
    } catch (error) {
      console.error('Error fetching vocabularies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Вы уверены, что хотите удалить этот словарь?')) return;
    
    try {
      await vocabularyAPI.deleteVocabulary(id);
      setVocabularies(vocabularies.filter(v => v._id !== id));
    } catch (error) {
      console.error('Error deleting vocabulary:', error);
    }
  };

  const handleFork = async (id) => {
    try {
      const response = await vocabularyAPI.forkVocabulary(id);
      navigate(`/vocabulary/${response.data.data._id}`);
    } catch (error) {
      console.error('Error forking vocabulary:', error);
    }
  };

  const handleToggleFavorite = async (id) => {
    try {
      await vocabularyAPI.toggleFavorite(id);
      fetchVocabularies();
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const filteredVocabularies = vocabularies.filter(v => {
    if (searchQuery && !v.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (selectedCategory !== 'all' && v.category !== selectedCategory) {
      return false;
    }
    return true;
  });

  const VocabularyCard = ({ vocabulary }) => {
    const progress = vocabulary.stats?.totalWords > 0
      ? Math.round((vocabulary.stats.learnedWords / vocabulary.stats.totalWords) * 100)
      : 0;

    return (
      <div className={`
        relative group rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-xl
        ${darkMode ? 'bg-white/5 hover:bg-white/10' : 'bg-white hover:shadow-lg border border-gray-100'}
      `}>
        {/* Gradient Header */}
        <div className={`h-24 bg-gradient-to-br ${COLORS[vocabulary.color] || COLORS.purple} relative overflow-hidden`}>
          <div className="absolute inset-0 bg-black/10" />
          <div className="absolute bottom-3 left-4 flex items-center gap-2">
            <span className="text-2xl">{LANGUAGES[vocabulary.sourceLanguage]?.flag}</span>
            <span className="text-white/70">→</span>
            <span className="text-2xl">{LANGUAGES[vocabulary.targetLanguage]?.flag}</span>
          </div>
          {vocabulary.isPublic ? (
            <Globe className="absolute top-3 right-3 w-5 h-5 text-white/70" />
          ) : (
            <Lock className="absolute top-3 right-3 w-5 h-5 text-white/70" />
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <h3 className={`font-bold text-lg line-clamp-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {vocabulary.title}
            </h3>
            <div className="relative">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  setMenuOpen(menuOpen === vocabulary._id ? null : vocabulary._id);
                }}
                className={`p-1 rounded-lg transition-colors ${darkMode ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
              >
                <MoreVertical className={`w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
              </button>
              
              {/* Dropdown Menu */}
              {menuOpen === vocabulary._id && (
                <div className={`
                  absolute right-0 top-8 w-48 rounded-xl shadow-lg z-50 overflow-hidden
                  ${darkMode ? 'bg-[#1a1a2e] border border-white/10' : 'bg-white border border-gray-200'}
                `}>
                  <Link
                    to={`/vocabulary/${vocabulary._id}/learn`}
                    className={`flex items-center gap-3 px-4 py-3 transition-colors ${darkMode ? 'hover:bg-white/5 text-white' : 'hover:bg-gray-50 text-gray-700'}`}
                  >
                    <Play className="w-4 h-4 text-green-500" />
                    Учить
                  </Link>
                  {activeTab === 'my' && (
                    <>
                      <Link
                        to={`/vocabulary/${vocabulary._id}/edit`}
                        className={`flex items-center gap-3 px-4 py-3 transition-colors ${darkMode ? 'hover:bg-white/5 text-white' : 'hover:bg-gray-50 text-gray-700'}`}
                      >
                        <Edit className="w-4 h-4 text-blue-500" />
                        Редактировать
                      </Link>
                      <button
                        onClick={() => handleDelete(vocabulary._id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 transition-colors text-red-500 ${darkMode ? 'hover:bg-white/5' : 'hover:bg-gray-50'}`}
                      >
                        <Trash2 className="w-4 h-4" />
                        Удалить
                      </button>
                    </>
                  )}
                  {activeTab === 'public' && (
                    <>
                      <button
                        onClick={() => handleFork(vocabulary._id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 transition-colors ${darkMode ? 'hover:bg-white/5 text-white' : 'hover:bg-gray-50 text-gray-700'}`}
                      >
                        <Copy className="w-4 h-4 text-purple-500" />
                        Копировать себе
                      </button>
                      <button
                        onClick={() => handleToggleFavorite(vocabulary._id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 transition-colors ${darkMode ? 'hover:bg-white/5 text-white' : 'hover:bg-gray-50 text-gray-700'}`}
                      >
                        <Heart className={`w-4 h-4 ${vocabulary.isFavorite ? 'fill-red-500 text-red-500' : 'text-red-500'}`} />
                        {vocabulary.isFavorite ? 'Убрать из избранного' : 'В избранное'}
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {vocabulary.description && (
            <p className={`text-sm line-clamp-2 mb-3 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {vocabulary.description}
            </p>
          )}

          {/* Stats */}
          <div className="flex items-center gap-4 mb-3">
            <div className="flex items-center gap-1.5">
              <BookOpen className={`w-4 h-4 ${darkMode ? 'text-purple-400' : 'text-purple-500'}`} />
              <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {vocabulary.stats?.totalWords || 0} слов
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <TrendingUp className={`w-4 h-4 ${darkMode ? 'text-green-400' : 'text-green-500'}`} />
              <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {progress}%
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className={`h-2 rounded-full overflow-hidden ${darkMode ? 'bg-white/10' : 'bg-gray-100'}`}>
            <div
              className={`h-full bg-gradient-to-r ${COLORS[vocabulary.color] || COLORS.purple} transition-all duration-500`}
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Category Badge */}
          <div className="mt-3 flex items-center justify-between">
            <span className={`
              text-xs px-2 py-1 rounded-full
              ${darkMode ? 'bg-white/10 text-gray-300' : 'bg-gray-100 text-gray-600'}
            `}>
              {CATEGORIES[vocabulary.category] || vocabulary.category}
            </span>
            {vocabulary.owner && activeTab === 'public' && (
              <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                от {vocabulary.owner.username}
              </span>
            )}
          </div>
        </div>

        {/* Click overlay */}
        <Link
          to={`/vocabulary/${vocabulary._id}`}
          className="absolute inset-0"
          onClick={(e) => menuOpen && e.preventDefault()}
        />
      </div>
    );
  };

  return (
    <div className={`min-h-screen p-6 ${darkMode ? 'bg-[#0a0a0f]' : 'bg-gray-50'}`}>
      {/* Header */}
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className={`text-3xl font-bold flex items-center gap-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Book className="w-6 h-6 text-white" />
              </div>
              Словарь
            </h1>
            <p className={`mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Создавайте и изучайте слова в интерактивном режиме
            </p>
          </div>

          <Link
            to="/vocabulary/create"
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium rounded-xl hover:opacity-90 transition-all hover:shadow-lg hover:shadow-purple-500/25"
          >
            <Plus className="w-5 h-5" />
            Создать словарь
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 mb-6">
          {[
            { id: 'my', label: 'Мои словари', icon: BookOpen },
            { id: 'public', label: 'Публичные', icon: Globe },
            { id: 'favorites', label: 'Избранное', icon: Heart }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all
                ${activeTab === tab.id
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/25'
                  : darkMode
                    ? 'text-gray-400 hover:text-white hover:bg-white/5'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }
              `}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
            <input
              type="text"
              placeholder="Поиск словарей..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`
                w-full pl-12 pr-4 py-3 rounded-xl border transition-all
                ${darkMode 
                  ? 'bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-purple-500' 
                  : 'bg-white border-gray-200 focus:border-purple-500'
                }
              `}
            />
          </div>

          <div className="relative">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className={`
                appearance-none px-4 py-3 pr-10 rounded-xl border transition-all cursor-pointer
                ${darkMode 
                  ? 'bg-white/5 border-white/10 text-white focus:border-purple-500' 
                  : 'bg-white border-gray-200 focus:border-purple-500'
                }
              `}
            >
              <option value="all">Все категории</option>
              {Object.entries(CATEGORIES).map(([key, value]) => (
                <option key={key} value={key}>{value}</option>
              ))}
            </select>
            <Filter className={`absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className={`h-64 rounded-2xl animate-pulse ${darkMode ? 'bg-white/5' : 'bg-gray-200'}`} />
            ))}
          </div>
        ) : filteredVocabularies.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredVocabularies.map(vocabulary => (
              <VocabularyCard key={vocabulary._id} vocabulary={vocabulary} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className={`w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center ${darkMode ? 'bg-white/5' : 'bg-gray-100'}`}>
              <Sparkles className={`w-12 h-12 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
            </div>
            <h3 className={`text-xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {activeTab === 'my' ? 'У вас пока нет словарей' : 'Словари не найдены'}
            </h3>
            <p className={`mb-6 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {activeTab === 'my' 
                ? 'Создайте свой первый словарь и начните учить слова!'
                : 'Попробуйте изменить параметры поиска'
              }
            </p>
            {activeTab === 'my' && (
              <Link
                to="/vocabulary/create"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium rounded-xl"
              >
                <Plus className="w-5 h-5" />
                Создать словарь
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Click outside to close menu */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setMenuOpen(null)}
        />
      )}
    </div>
  );
};

export default VocabularyList;
