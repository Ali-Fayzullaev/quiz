import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { quizAPI } from '../../services/api';
import { useTheme } from '../../context/ThemeContext';
import QuizCard from './QuizCard';
import { Search, Filter, Grid, List, Sparkles, Loader2 } from 'lucide-react';

const QuizList = () => {
  const { darkMode } = useTheme();
  const [searchParams] = useSearchParams();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: 'all',
    difficulty: 'all',
  });
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');

  const categories = [
    { value: 'all', label: 'Все категории', icon: '📚' },
    { value: 'general', label: 'Общие', icon: '🎯' },
    { value: 'science', label: 'Наука', icon: '🔬' },
    { value: 'history', label: 'История', icon: '📜' },
    { value: 'geography', label: 'География', icon: '🌍' },
    { value: 'sports', label: 'Спорт', icon: '⚽' },
    { value: 'entertainment', label: 'Развлечения', icon: '🎬' },
    { value: 'art', label: 'Искусство', icon: '🎨' },
    { value: 'literature', label: 'Литература', icon: '📖' },
    { value: 'music', label: 'Музыка', icon: '🎵' },
    { value: 'movies', label: 'Кино', icon: '🎥' },
    { value: 'technology', label: 'Технологии', icon: '💻' },
    { value: 'nature', label: 'Природа', icon: '🌿' },
    { value: 'food', label: 'Еда', icon: '🍕' },
    { value: 'gaming', label: 'Игры', icon: '🎮' },
    { value: 'anime', label: 'Аниме', icon: '🎌' },
  ];

  const difficulties = [
    { value: 'all', label: 'Любая сложность' },
    { value: 'beginner', label: 'Начинающий' },
    { value: 'intermediate', label: 'Средний' },
    { value: 'advanced', label: 'Продвинутый' },
    { value: 'expert', label: 'Эксперт' },
  ];

  const prepareQueryParams = useCallback(() => {
    const params = {};
    if (filters.search && filters.search.trim()) {
      params.search = filters.search.trim();
    }
    if (filters.category && filters.category !== 'all') {
      params.category = filters.category;
    }
    if (filters.difficulty && filters.difficulty !== 'all') {
      params.difficulty = filters.difficulty;
    }
    return params;
  }, [filters]);

  const fetchQuizzes = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = prepareQueryParams();
      const response = await quizAPI.getQuizzes(params);
      const data = response.data.data;
      setQuizzes(data.quizzes || []);
    } catch (err) {
      setError('Ошибка загрузки викторин');
      console.error('Quiz fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [prepareQueryParams]);

  useEffect(() => {
    fetchQuizzes();
  }, [filters.category, filters.difficulty, filters.search, fetchQuizzes]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters(prev => {
        if (prev.search !== searchInput) {
          return { ...prev, search: searchInput };
        }
        return prev;
      });
    }, 500);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const handleSearch = (e) => {
    e.preventDefault();
    setFilters(prev => ({ ...prev, search: searchInput }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className={`text-2xl lg:text-3xl font-bold flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            <Sparkles className="text-purple-500" />
            Все квизы
          </h1>
          <p className={`mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Найдите идеальный квиз для себя</p>
        </div>

        {/* View Toggle */}
        <div className={`flex items-center gap-1 p-1 rounded-lg ${darkMode ? 'bg-white/5' : 'bg-gray-100'}`}>
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-md transition-colors ${
              viewMode === 'grid' 
                ? 'bg-purple-500 text-white' 
                : darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <Grid size={18} />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-md transition-colors ${
              viewMode === 'list' 
                ? 'bg-purple-500 text-white' 
                : darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <List size={18} />
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className={`p-4 rounded-2xl backdrop-blur-sm ${
        darkMode 
          ? 'bg-white/5 border border-white/10' 
          : 'bg-white border border-gray-200 shadow-sm'
      }`}>
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Поиск квизов..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className={`w-full pl-12 pr-4 py-3 rounded-xl outline-none transition-all ${
                  darkMode 
                    ? 'bg-white/5 border border-white/10 text-white placeholder:text-gray-500 focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20' 
                    : 'bg-gray-50 border border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20'
                }`}
              />
            </div>
          </form>

          {/* Category Filter */}
          <div className="relative">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
            <select
              value={filters.category}
              onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
              className={`appearance-none w-full lg:w-48 pl-12 pr-10 py-3 rounded-xl outline-none cursor-pointer transition-all ${
                darkMode 
                  ? 'bg-white/5 border border-white/10 text-white focus:border-purple-500/50' 
                  : 'bg-gray-50 border border-gray-200 text-gray-900 focus:border-purple-500'
              }`}
            >
              {categories.map(cat => (
                <option key={cat.value} value={cat.value} className={darkMode ? 'bg-gray-900' : 'bg-white'}>
                  {cat.icon} {cat.label}
                </option>
              ))}
            </select>
          </div>

          {/* Difficulty Filter */}
          <select
            value={filters.difficulty}
            onChange={(e) => setFilters(prev => ({ ...prev, difficulty: e.target.value }))}
            className={`appearance-none w-full lg:w-44 px-4 py-3 rounded-xl outline-none cursor-pointer transition-all ${
              darkMode 
                ? 'bg-white/5 border border-white/10 text-white focus:border-purple-500/50' 
                : 'bg-gray-50 border border-gray-200 text-gray-900 focus:border-purple-500'
            }`}
          >
            {difficulties.map(diff => (
              <option key={diff.value} value={diff.value} className={darkMode ? 'bg-gray-900' : 'bg-white'}>
                {diff.label}
              </option>
            ))}
          </select>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-2 mt-4">
          {categories.slice(0, 8).map(cat => (
            <button
              key={cat.value}
              onClick={() => setFilters(prev => ({ ...prev, category: cat.value }))}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                filters.category === cat.value
                  ? 'bg-purple-500 text-white'
                  : darkMode 
                    ? 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900'
              }`}
            >
              {cat.icon} {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
          <span className={`ml-3 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Загрузка квизов...</span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className={`p-4 rounded-xl ${
          darkMode 
            ? 'bg-red-500/10 border border-red-500/20 text-red-400' 
            : 'bg-red-50 border border-red-200 text-red-600'
        }`}>
          {error}
        </div>
      )}

      {/* Quiz Grid */}
      {!loading && !error && (
        <div className={
          viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5'
            : 'space-y-4'
        }>
          {quizzes.length > 0 ? (
            quizzes.map(quiz => (
              <QuizCard 
                key={quiz._id} 
                quiz={quiz}
                viewMode={viewMode}
                darkMode={darkMode}
                onDelete={(deletedId) => {
                  setQuizzes(prev => prev.filter(q => q._id !== deletedId));
                }}
              />
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
                darkMode ? 'bg-white/5' : 'bg-gray-100'
              }`}>
                <Search className={`w-8 h-8 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
              </div>
              <h3 className={`text-xl font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-800'}`}>
                Квизы не найдены
              </h3>
              <p className={darkMode ? 'text-gray-500' : 'text-gray-600'}>
                Попробуйте изменить фильтры или поисковый запрос
              </p>
            </div>
          )}
        </div>
      )}

      {/* Results Count */}
      {!loading && quizzes.length > 0 && (
        <div className={`text-center text-sm ${darkMode ? 'text-gray-500' : 'text-gray-600'}`}>
          Найдено квизов: {quizzes.length}
        </div>
      )}
    </div>
  );
};

export default QuizList;