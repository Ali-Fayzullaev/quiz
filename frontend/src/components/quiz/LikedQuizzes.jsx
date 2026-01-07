import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { userAPI, quizAPI } from '../../services/api';
import { 
  Heart,
  Loader2,
  Play,
  Search,
  HelpCircle,
  Clock,
  Users,
  HeartOff
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
    const styles = {
      'beginner': 'bg-green-500/20 text-green-400 border-green-500/30',
      'easy': 'bg-green-500/20 text-green-400 border-green-500/30',
      'intermediate': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      'medium': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      'advanced': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      'hard': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      'expert': 'bg-red-500/20 text-red-400 border-red-500/30',
    };
    return styles[difficulty] || 'bg-gray-500/20 text-gray-400 border-gray-500/30';
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
        <span className="ml-3 text-gray-400">Загрузка избранного...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold flex items-center gap-2">
            <Heart className="text-pink-500" fill="currentColor" />
            Избранное
          </h1>
          <p className="text-gray-400 mt-1">{quizzes.length} квизов в избранном</p>
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
              className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl 
                       text-white placeholder:text-gray-500 outline-none focus:border-purple-500/50 transition-all"
            />
          </div>
        )}
      </div>

      {/* Quizzes Grid */}
      {filteredQuizzes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredQuizzes.map(quiz => (
            <Link 
              to={`/quiz/${quiz._id}`} 
              key={quiz._id}
              className="group relative rounded-2xl overflow-hidden bg-white/5 border border-white/10 
                       hover:border-pink-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-pink-500/10"
            >
              {/* Thumbnail */}
              <div className="relative h-44 overflow-hidden">
                {quiz.thumbnail?.url || quiz.thumbnail ? (
                  <img 
                    src={quiz.thumbnail?.url || quiz.thumbnail} 
                    alt={quiz.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-pink-500/20 to-purple-500/20 flex items-center justify-center">
                    <span className="text-6xl">{getCategoryIcon(quiz.category)}</span>
                  </div>
                )}
                
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                
                {/* Difficulty */}
                <div className="absolute top-3 left-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getDifficultyStyle(quiz.difficulty)}`}>
                    {getDifficultyText(quiz.difficulty)}
                  </span>
                </div>

                {/* Remove from favorites */}
                <button
                  onClick={(e) => handleUnlike(quiz._id, e)}
                  disabled={removingId === quiz._id}
                  className="absolute top-3 right-3 p-2 rounded-full bg-pink-500 text-white 
                           hover:bg-pink-600 transition-all disabled:opacity-50"
                >
                  {removingId === quiz._id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Heart size={16} fill="currentColor" />
                  )}
                </button>

                {/* Play Button Overlay */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="w-14 h-14 rounded-full bg-pink-500 text-white flex items-center justify-center 
                               shadow-lg shadow-pink-500/50 hover:scale-110 transition-transform">
                    <Play size={24} fill="currentColor" className="ml-1" />
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="font-bold text-lg text-white line-clamp-1 group-hover:text-pink-400 transition-colors">
                  {quiz.title}
                </h3>
                {quiz.description && (
                  <p className="text-sm text-gray-400 line-clamp-2 mt-1 h-10">{quiz.description}</p>
                )}
                
                {/* Creator */}
                {quiz.creator && (
                  <div className="flex items-center gap-2 mt-4">
                    <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${getAvatarColor(quiz.creator.username)} 
                                  flex items-center justify-center overflow-hidden`}>
                      {quiz.creator.profile?.avatar?.url ? (
                        <img src={quiz.creator.profile.avatar.url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-white text-xs font-medium">
                          {quiz.creator.username?.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <span className="text-sm text-gray-400">{quiz.creator.username}</span>
                  </div>
                )}

                {/* Stats */}
                <div className="flex items-center gap-4 mt-4 pt-4 border-t border-white/10 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <HelpCircle size={14} />
                    {quiz.questions?.length || 0}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users size={14} />
                    {quiz.stats?.plays || 0}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={14} />
                    {quiz.timeLimit || '∞'} мин
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : quizzes.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-pink-500/10 flex items-center justify-center">
            <HeartOff className="w-12 h-12 text-pink-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-300 mb-2">В избранном пока пусто</h3>
          <p className="text-gray-500 mb-6 max-w-sm mx-auto">
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
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
            <Search className="w-10 h-10 text-gray-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-300 mb-2">Ничего не найдено</h3>
          <p className="text-gray-500">Попробуйте изменить поисковый запрос</p>
        </div>
      )}
    </div>
  );
};

export default LikedQuizzes;
