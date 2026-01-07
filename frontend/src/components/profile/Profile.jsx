import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { userAPI, quizAPI } from '../../services/api';
import { 
  User, 
  Mail, 
  Calendar, 
  MapPin, 
  Edit2, 
  Trophy, 
  Target, 
  BookOpen, 
  Clock,
  Eye,
  Play,
  Heart,
  Loader2,
  LogOut,
  Settings,
  HelpCircle,
  Star,
  Award
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
  };
  return icons[category] || '📚';
};

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const profileRes = await userAPI.getProfile();
      const userData = profileRes.data.data?.user || profileRes.data.data;
      setUser(userData);

      try {
        const statsRes = await userAPI.getUserStats();
        setStats(statsRes.data.data);
      } catch (e) {
        console.log('Stats not available');
      }

      const quizzesRes = await quizAPI.getQuizzes({ creator: userData._id });
      setQuizzes(quizzesRes.data.data?.quizzes || []);

    } catch (err) {
      console.error('Ошибка загрузки профиля:', err);
      if (err.response?.status === 401) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
        <span className="ml-3 text-gray-400">Загрузка профиля...</span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-20">
        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-red-500/10 flex items-center justify-center">
          <User className="w-10 h-10 text-red-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-300 mb-2">Не удалось загрузить профиль</h3>
        <p className="text-gray-500 mb-6">Попробуйте войти в аккаунт снова</p>
        <button 
          onClick={() => navigate('/login')}
          className="px-6 py-3 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition-colors"
        >
          Войти
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="relative rounded-2xl overflow-hidden bg-white/5 border border-white/10">
        {/* Cover */}
        <div className="h-32 lg:h-48 bg-gradient-to-r from-purple-500/30 via-pink-500/30 to-orange-500/30" />
        
        {/* Content */}
        <div className="px-4 lg:px-6 pb-6">
          {/* Avatar */}
          <div className="flex flex-col lg:flex-row lg:items-end gap-4 -mt-16 lg:-mt-20">
            <div className={`w-28 h-28 lg:w-36 lg:h-36 rounded-2xl bg-gradient-to-br ${getAvatarColor(user.username)} 
                          flex items-center justify-center border-4 border-[#0a0a0f] overflow-hidden`}>
              {user.profile?.avatar?.url ? (
                <img src={user.profile.avatar.url} alt={user.username} className="w-full h-full object-cover" />
              ) : (
                <span className="text-white text-4xl lg:text-5xl font-bold">
                  {user.username?.charAt(0).toUpperCase()}
                </span>
              )}
            </div>

            <div className="flex-1 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-white">
                  {user.profile?.firstName && user.profile?.lastName 
                    ? `${user.profile.firstName} ${user.profile.lastName}`
                    : user.username
                  }
                </h1>
                <p className="text-gray-400">@{user.username}</p>
              </div>

              <button 
                onClick={() => navigate('/profile/edit')}
                className="flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 
                         text-white rounded-xl transition-colors"
              >
                <Edit2 size={18} />
                Редактировать
              </button>
            </div>
          </div>

          {/* Bio */}
          {user.profile?.bio && (
            <p className="mt-4 text-gray-300 max-w-2xl">{user.profile.bio}</p>
          )}

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <Mail size={16} />
              <span>{user.email}</span>
            </div>
            {user.createdAt && (
              <div className="flex items-center gap-2">
                <Calendar size={16} />
                <span>На сайте с {formatDate(user.createdAt)}</span>
              </div>
            )}
            {user.profile?.location && (
              <div className="flex items-center gap-2">
                <MapPin size={16} />
                <span>{user.profile.location}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20">
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center mb-3">
            <BookOpen className="text-blue-400" size={20} />
          </div>
          <p className="text-2xl font-bold text-white">{quizzes.length}</p>
          <p className="text-sm text-gray-400">Квизов создано</p>
        </div>
        
        <div className="p-4 rounded-2xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20">
          <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center mb-3">
            <Target className="text-green-400" size={20} />
          </div>
          <p className="text-2xl font-bold text-white">{stats?.quizzesCompleted || 0}</p>
          <p className="text-sm text-gray-400">Пройдено</p>
        </div>
        
        <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center mb-3">
            <Trophy className="text-amber-400" size={20} />
          </div>
          <p className="text-2xl font-bold text-white">{stats?.totalPoints || 0}</p>
          <p className="text-sm text-gray-400">Очков</p>
        </div>
        
        <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center mb-3">
            <Star className="text-purple-400" size={20} />
          </div>
          <p className="text-2xl font-bold text-white">{stats?.averageScore || 0}%</p>
          <p className="text-sm text-gray-400">Средний балл</p>
        </div>
      </div>

      {/* Achievements */}
      <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-white mb-4">
          <Award className="text-yellow-400" />
          Достижения
        </h2>
        <div className="flex flex-wrap gap-3">
          {[
            { icon: '🎯', name: 'Первый квиз', unlocked: quizzes.length > 0 },
            { icon: '🏆', name: '100 очков', unlocked: (stats?.totalPoints || 0) >= 100 },
            { icon: '🎮', name: '10 игр', unlocked: (stats?.quizzesCompleted || 0) >= 10 },
            { icon: '⭐', name: 'Отличник', unlocked: (stats?.averageScore || 0) >= 80 },
          ].map((achievement, i) => (
            <div 
              key={i}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${
                achievement.unlocked 
                  ? 'bg-yellow-500/10 border-yellow-500/30 text-white' 
                  : 'bg-white/5 border-white/10 text-gray-500 opacity-50'
              }`}
            >
              <span className="text-xl">{achievement.icon}</span>
              <span className="text-sm font-medium">{achievement.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* My Quizzes */}
      <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
            <BookOpen className="text-purple-400" />
            Мои квизы
          </h2>
          {quizzes.length > 3 && (
            <Link to="/my-quizzes" className="text-sm text-purple-400 hover:text-purple-300">
              Все квизы →
            </Link>
          )}
        </div>
        
        {quizzes.length > 0 ? (
          <div className="space-y-3">
            {quizzes.slice(0, 3).map(quiz => (
              <Link 
                to={`/quiz/${quiz._id}`} 
                key={quiz._id}
                className="flex items-center gap-4 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
              >
                <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 
                              flex items-center justify-center overflow-hidden flex-shrink-0">
                  {quiz.thumbnail ? (
                    <img src={quiz.thumbnail} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl">{getCategoryIcon(quiz.category)}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-white truncate">{quiz.title}</h3>
                  <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <HelpCircle size={12} />
                      {quiz.questions?.length || 0}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye size={12} />
                      {quiz.stats?.views || 0}
                    </span>
                    <span className="flex items-center gap-1">
                      <Play size={12} />
                      {quiz.stats?.plays || 0}
                    </span>
                  </div>
                </div>
                <Play className="text-purple-400 flex-shrink-0" size={20} />
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <BookOpen className="w-12 h-12 mx-auto mb-3 text-gray-600" />
            <p className="text-gray-400 mb-4">Вы ещё не создали ни одного квиза</p>
            <Link 
              to="/create-quiz"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-purple-500 hover:bg-purple-600 
                       text-white rounded-xl transition-colors"
            >
              Создать первый квиз
            </Link>
          </div>
        )}
      </div>

      {/* Settings */}
      <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-white mb-4">
          <Settings className="text-gray-400" />
          Настройки
        </h2>
        
        <div className="space-y-2">
          <Link 
            to="/profile/edit"
            className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 text-gray-300 transition-colors"
          >
            <Edit2 size={20} />
            <span>Редактировать профиль</span>
          </Link>
          <Link 
            to="/my-quizzes"
            className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 text-gray-300 transition-colors"
          >
            <BookOpen size={20} />
            <span>Мои квизы</span>
          </Link>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 p-3 rounded-xl hover:bg-red-500/10 text-red-400 w-full transition-colors"
          >
            <LogOut size={20} />
            <span>Выйти из аккаунта</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
