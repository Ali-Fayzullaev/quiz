import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { userAPI, quizAPI } from '../../services/api';
import { useTheme } from '../../context/ThemeContext';
import { 
  Heart,
  Loader2,
  Play,
  Search,
  HelpCircle,
  Clock,
  Users,
  HeartOff,
  X
} from 'lucide-react';

const getAvatarColor = (username) => {
  const colors = [
    'from-pink-500 to-rose-500',
    'from-violet-500 to-purple-500',
    'from-blue-500 to-cyan-500',
    'from-emerald-500 to-teal-500',
    'from-amber-500 to-orange-500',
  ];
  if (!username) return colors[0];
  const index = username.charCodeAt(0) % colors.length;
  return colors[index];
};

const getCategoryIcon = (category) => {
  const icons = {
    'general': '🎯', 'science': '🔬', 'history': '📜', 'geography': '🌍',
    'sports': '⚽', 'entertainment': '🎬', 'technology': '💻', 'gaming': '🎮',
    'art': '🎨', 'music': '🎵', 'movies': '🎥', 'anime': '🎌',
  };
  return icons[category] || '📚';
};

const LikedQuizzes = () => {
  const { darkMode } = useTheme();
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [removingId, setRemovingId] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    fetchLikedQuizzes();
  }, []);

  const fetchLikedQuizzes = async () => {
    try {
      const response = await userAPI.getLikedQuizzes();
      setQuizzes(response.data.data?.quizzes || []);
    } catch (err) {
      console.error('Ошибка загрузки избранного:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUnlike = async (quizId, e) => {
    e.preventDefault();
    e.stopPropagation();
    
    setRemovingId(quizId);
    try {
      await quizAPI.toggleLike(quizId);
      setQuizzes(prev => prev.filter(q => q._id !== quizId));
    } catch (err) {
      console.error('Ошибка удаления из избранного:', err);
    } finally {
      setRemovingId(null);
    }
  };

  const getDifficultyStyle = (difficulty) => {
    const baseStyles = {
      'beginner': darkMode ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-700',
      'easy': darkMode ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-700',
      'intermediate': darkMode ? 'bg-yellow-500/20 text-yellow-400' : 'bg-yellow-100 text-yellow-700',
      'medium': darkMode ? 'bg-yellow-500/20 text-yellow-400' : 'bg-yellow-100 text-yellow-700',
      'advanced': darkMode ? 'bg-orange-500/20 text-orange-400' : 'bg-orange-100 text-orange-700',
      'hard': darkMode ? 'bg-orange-500/20 text-orange-400' : 'bg-orange-100 text-orange-700',
      'expert': darkMode ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-700',
    };
    return baseStyles[difficulty] || (darkMode ? 'bg-gray-500/20 text-gray-400' : 'bg-gray-100 text-gray-600');
  };

  const getDifficultyText = (difficulty) => {
    const texts = {
      'beginner': 'Начинающий', 'easy': 'Лёгкий', 'intermediate': 'Средний',
      'medium': 'Средний', 'advanced': 'Сложный', 'hard': 'Сложный', 'expert': 'Эксперт'
    };
    return texts[difficulty] || difficulty;
  };

  const filteredQuizzes = quizzes.filter(quiz =>
    quiz.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    quiz.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
        <span className={`ml-3 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Загрузка избранного...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className={`text-2xl lg:text-3xl font-bold flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            <Heart className="text-pink-500" fill="currentColor" />
            Избранное
          </h1>
          <p className={`mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{quizzes.length} квизов в избранном</p>
        </div>

        {/* Search */}
        {quizzes.length > 0 && (
          <div className="relative max-w-md w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Поиск в избранном..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-12 pr-4 py-3 rounded-xl outline-none transition-all ${
                darkMode 
                  ? 'bg-white/5 border border-white/10 text-white placeholder:text-gray-500 focus:border-purple-500/50' 
                  : 'bg-white border border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-purple-500 shadow-sm'
              }`}
            />
          </div>
        )}
      </div>

      {/* Quizzes Grid */}
      {filteredQuizzes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredQuizzes.map(quiz => (
            <div 
              key={quiz._id}
              className={`group relative rounded-xl overflow-hidden transition-all duration-300 ${
                darkMode 
                  ? 'bg-white/5 border border-white/10 hover:border-pink-500/30 hover:shadow-xl hover:shadow-pink-500/10' 
                  : 'bg-white border border-gray-200 hover:border-pink-300 hover:shadow-lg'
              }`}
            >
              {/* Thumbnail */}
              <Link to={`/quiz/${quiz._id}`} className="block">
                <div className="relative h-40 overflow-hidden">
                  {quiz.thumbnail?.url || quiz.thumbnail ? (
                    <img 
                      src={quiz.thumbnail?.url || quiz.thumbnail} 
                      alt={quiz.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className={`w-full h-full flex items-center justify-center ${
                      darkMode 
                        ? 'bg-gradient-to-br from-pink-500/20 to-purple-500/20' 
                        : 'bg-gradient-to-br from-pink-100 to-purple-100'
                    }`}>
                      <span className="text-5xl">{getCategoryIcon(quiz.category)}</span>
                    </div>
                  )}
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                  {/* Play Button */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="w-12 h-12 rounded-full bg-pink-500 text-white flex items-center justify-center 
                                 shadow-lg shadow-pink-500/40 hover:scale-110 transition-transform">
                      <Play size={20} fill="currentColor" className="ml-0.5" />
                    </span>
                  </div>
                </div>
              </Link>

              {/* Difficulty Badge */}
              <div className="absolute top-3 left-3">
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getDifficultyStyle(quiz.difficulty)}`}>
                  {getDifficultyText(quiz.difficulty)}
                </span>
              </div>

              {/* Remove Button */}
              <button
                onClick={(e) => handleUnlike(quiz._id, e)}
                disabled={removingId === quiz._id}
                className="absolute top-3 right-3 p-2 rounded-full bg-black/40 backdrop-blur-sm text-white 
                         hover:bg-red-500 transition-all disabled:opacity-50 group/btn"
                title="Удалить из избранного"
              >
                {removingId === quiz._id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <X size={16} className="group-hover/btn:scale-110 transition-transform" />
                )}
              </button>

              {/* Content */}
              <div className="p-4">
                <Link to={`/quiz/${quiz._id}`}>
                  <h3 className={`font-semibold text-base line-clamp-1 group-hover:text-pink-500 transition-colors ${
                    darkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {quiz.title}
                  </h3>
                </Link>
                {quiz.description && (
                  <p className={`text-sm line-clamp-2 mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {quiz.description}
                  </p>
                )}
                
                {/* Creator */}
                {quiz.creator && (
                  <div className="flex items-center gap-2 mt-3">
                    <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${getAvatarColor(quiz.creator.username)} 
                                  flex items-center justify-center overflow-hidden`}>
                      {quiz.creator.profile?.avatar?.url ? (
                        <img src={quiz.creator.profile.avatar.url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-white text-xs font-medium">
                          {quiz.creator.username?.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {quiz.creator.username}
                    </span>
                  </div>
                )}

                {/* Stats */}
                <div className={`flex items-center gap-4 mt-3 pt-3 text-xs ${
                  darkMode ? 'border-t border-white/10 text-gray-500' : 'border-t border-gray-100 text-gray-500'
                }`}>
                  <span className="flex items-center gap-1">
                    <HelpCircle size={13} />
                    {quiz.questions?.length || 0}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users size={13} />
                    {quiz.stats?.plays || 0}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={13} />
                    {quiz.timeLimit || '∞'} мин
                  </span>
                  <span className="flex items-center gap-1 ml-auto text-pink-500">
                    <Heart size={13} fill="currentColor" />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : quizzes.length === 0 ? (
        <div className="text-center py-20">
          <div className={`w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center ${
            darkMode ? 'bg-pink-500/10' : 'bg-pink-50'
          }`}>
            <HeartOff className={`w-10 h-10 ${darkMode ? 'text-pink-400' : 'text-pink-500'}`} />
          </div>
          <h3 className={`text-xl font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-800'}`}>
            В избранном пока пусто
          </h3>
          <p className={`mb-6 max-w-sm mx-auto ${darkMode ? 'text-gray-500' : 'text-gray-600'}`}>
            Нажмите ❤️ на понравившемся квизе, чтобы добавить его в избранное
          </p>
          <Link 
            to="/quizzes"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 
                     text-white font-medium rounded-xl hover:opacity-90 transition-opacity"
          >
            <Play size={20} />
            Перейти к квизам
          </Link>
        </div>
      ) : (
        <div className="text-center py-20">
          <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
            darkMode ? 'bg-white/5' : 'bg-gray-100'
          }`}>
            <Search className={`w-8 h-8 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
          </div>
          <h3 className={`text-xl font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-800'}`}>
            Ничего не найдено
          </h3>
          <p className={darkMode ? 'text-gray-500' : 'text-gray-600'}>Попробуйте изменить поисковый запрос</p>
        </div>
      )}
    </div>
  );
};

export default LikedQuizzes;
