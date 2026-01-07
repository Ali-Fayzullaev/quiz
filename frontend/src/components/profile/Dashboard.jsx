import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { userAPI, quizAPI } from '../../services/api';
import { 
  User, 
  Mail, 
  Calendar, 
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
  Brain,
  TrendingUp,
  Award,
  Zap,
  ChevronRight,
  Plus,
  BarChart3,
  Star,
  Flame,
  Crown,
  Sparkles
} from 'lucide-react';

// Функция для генерации цвета на основе имени
const getAvatarColor = (username) => {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
    '#F8B500', '#00CED1', '#FF69B4', '#32CD32', '#FFD700'
  ];
  if (!username) return colors[0];
  const index = username.charCodeAt(0) % colors.length;
  return colors[index];
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [likedQuizzes, setLikedQuizzes] = useState([]);
  const [recentResults, setRecentResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      // Получаем все данные параллельно
      const [profileRes, statsRes, quizzesRes, likedRes, resultsRes] = await Promise.allSettled([
        userAPI.getProfile(),
        userAPI.getUserStats(),
        userAPI.getUserQuizzes(),
        userAPI.getLikedQuizzes(),
        userAPI.getUserResults()
      ]);

      if (profileRes.status === 'fulfilled') {
        const userData = profileRes.value.data.data?.user || profileRes.value.data.data;
        setUser(userData);
      }

      if (statsRes.status === 'fulfilled') {
        setStats(statsRes.value.data.data);
      }

      if (quizzesRes.status === 'fulfilled') {
        setQuizzes(quizzesRes.value.data.data?.quizzes || []);
      }

      if (likedRes.status === 'fulfilled') {
        setLikedQuizzes(likedRes.value.data.data?.quizzes || []);
      }

      if (resultsRes.status === 'fulfilled') {
        setRecentResults(resultsRes.value.data.data?.results || []);
      }

    } catch (err) {
      console.error('Ошибка загрузки данных:', err);
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
      month: 'short'
    });
  };

  const getLevelInfo = (experience) => {
    const level = Math.floor(experience / 1000) + 1;
    const currentExp = experience % 1000;
    const progress = (currentExp / 1000) * 100;
    return { level, currentExp, progress };
  };

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-loading">
          <Loader2 className="animate-spin" size={48} />
          <p>Загрузка дашборда...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    navigate('/login');
    return null;
  }

  const levelInfo = getLevelInfo(stats?.experience || user?.gameStats?.experience || 0);

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">
        {/* Welcome Section */}
        <div className="dashboard-welcome">
          <div className="welcome-content">
            <div className="welcome-text">
              <span className="welcome-greeting">Добро пожаловать! 👋</span>
              <h1 className="welcome-name">
                {user.profile?.firstName || user.username}
              </h1>
              <p className="welcome-subtitle">
                Готовы к новым знаниям сегодня?
              </p>
            </div>
            <div className="welcome-actions">
              <Link to="/create-quiz" className="welcome-btn primary">
                <Plus size={20} />
                Создать викторину
              </Link>
              <Link to="/quizzes" className="welcome-btn secondary">
                <Play size={20} />
                Играть
              </Link>
            </div>
          </div>
          
          {/* User Card */}
          <div className="dashboard-user-card">
            <div 
              className="user-card-avatar"
              style={!user.profile?.avatar?.url ? { backgroundColor: getAvatarColor(user.username) } : {}}
            >
              {user.profile?.avatar?.url ? (
                <img src={user.profile.avatar.url} alt={user.username} />
              ) : (
                <span>{user.username?.charAt(0).toUpperCase()}</span>
              )}
              <div className="user-level-badge">
                <Crown size={12} />
                <span>{levelInfo.level}</span>
              </div>
            </div>
            <div className="user-card-info">
              <h3>{user.username}</h3>
              <p>{user.email}</p>
            </div>
            <button 
              className="user-card-edit"
              onClick={() => navigate('/profile/edit')}
            >
              <Edit2 size={16} />
            </button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="dashboard-stats">
          <div className="stat-card gradient-blue">
            <div className="stat-card-icon">
              <BookOpen />
            </div>
            <div className="stat-card-content">
              <span className="stat-card-value">{quizzes.length}</span>
              <span className="stat-card-label">Создано викторин</span>
            </div>
            <Sparkles className="stat-card-decoration" />
          </div>

          <div className="stat-card gradient-green">
            <div className="stat-card-icon">
              <Target />
            </div>
            <div className="stat-card-content">
              <span className="stat-card-value">{stats?.quizzesCompleted || user?.gameStats?.quizzesCompleted || 0}</span>
              <span className="stat-card-label">Пройдено</span>
            </div>
            <Zap className="stat-card-decoration" />
          </div>

          <div className="stat-card gradient-amber">
            <div className="stat-card-icon">
              <Trophy />
            </div>
            <div className="stat-card-content">
              <span className="stat-card-value">{stats?.totalPoints || user?.gameStats?.totalPoints || 0}</span>
              <span className="stat-card-label">Очков</span>
            </div>
            <Award className="stat-card-decoration" />
          </div>

          <div className="stat-card gradient-rose">
            <div className="stat-card-icon">
              <Heart />
            </div>
            <div className="stat-card-content">
              <span className="stat-card-value">{likedQuizzes.length}</span>
              <span className="stat-card-label">В избранном</span>
            </div>
            <Star className="stat-card-decoration" />
          </div>
        </div>

        {/* Level Progress */}
        <div className="dashboard-level-card">
          <div className="level-card-header">
            <div className="level-info">
              <Flame className="level-icon" />
              <div>
                <span className="level-title">Уровень {levelInfo.level}</span>
                <span className="level-subtitle">{levelInfo.currentExp} / 1000 XP до следующего</span>
              </div>
            </div>
            <div className="level-badge">
              <TrendingUp size={16} />
              <span>+{stats?.weeklyXP || 0} за неделю</span>
            </div>
          </div>
          <div className="level-progress-bar">
            <div 
              className="level-progress-fill"
              style={{ width: `${levelInfo.progress}%` }}
            />
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="dashboard-grid">
          {/* My Quizzes */}
          <div className="dashboard-section">
            <div className="section-header">
              <h2>
                <BookOpen size={20} />
                Мои викторины
              </h2>
              <Link to="/my-quizzes" className="section-link">
                Все <ChevronRight size={16} />
              </Link>
            </div>
            
            {quizzes.length > 0 ? (
              <div className="dashboard-quizzes">
                {quizzes.slice(0, 3).map(quiz => (
                  <Link 
                    to={`/quiz/${quiz._id}`} 
                    key={quiz._id}
                    className="dashboard-quiz-card"
                  >
                    <div className="quiz-card-thumb">
                      {quiz.thumbnail?.url ? (
                        <img src={quiz.thumbnail.url} alt={quiz.title} />
                      ) : (
                        <div className="quiz-card-thumb-placeholder">
                          <Brain size={24} />
                        </div>
                      )}
                    </div>
                    <div className="quiz-card-body">
                      <h4>{quiz.title}</h4>
                      <div className="quiz-card-meta">
                        <span><Target size={14} /> {quiz.questions?.length || 0} вопросов</span>
                        <span><Play size={14} /> {quiz.stats?.plays || 0}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="dashboard-empty">
                <BookOpen size={32} />
                <p>Создайте свою первую викторину</p>
                <Link to="/create-quiz" className="dashboard-empty-btn">
                  <Plus size={16} />
                  Создать
                </Link>
              </div>
            )}
          </div>

          {/* Liked Quizzes */}
          <div className="dashboard-section">
            <div className="section-header">
              <h2>
                <Heart size={20} />
                Избранное
              </h2>
              <Link to="/liked" className="section-link">
                Все <ChevronRight size={16} />
              </Link>
            </div>
            
            {likedQuizzes.length > 0 ? (
              <div className="dashboard-quizzes">
                {likedQuizzes.slice(0, 3).map(quiz => (
                  <Link 
                    to={`/quiz/${quiz._id}`} 
                    key={quiz._id}
                    className="dashboard-quiz-card"
                  >
                    <div className="quiz-card-thumb">
                      {quiz.thumbnail?.url ? (
                        <img src={quiz.thumbnail.url} alt={quiz.title} />
                      ) : (
                        <div className="quiz-card-thumb-placeholder">
                          <Brain size={24} />
                        </div>
                      )}
                    </div>
                    <div className="quiz-card-body">
                      <h4>{quiz.title}</h4>
                      <div className="quiz-card-meta">
                        <span className="quiz-creator-mini">
                          {quiz.creator?.username || 'Автор'}
                        </span>
                        <span><Heart size={14} className="liked" /></span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="dashboard-empty">
                <Heart size={32} />
                <p>Нажмите ❤️ на викторине, чтобы добавить в избранное</p>
                <Link to="/quizzes" className="dashboard-empty-btn">
                  <Play size={16} />
                  К викторинам
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        {recentResults.length > 0 && (
          <div className="dashboard-section full-width">
            <div className="section-header">
              <h2>
                <BarChart3 size={20} />
                Недавняя активность
              </h2>
            </div>
            
            <div className="dashboard-activity">
              {recentResults.slice(0, 5).map((result, index) => (
                <div key={result._id || index} className="activity-item">
                  <div className={`activity-icon ${result.passed ? 'success' : 'failed'}`}>
                    {result.passed ? <Trophy size={18} /> : <Target size={18} />}
                  </div>
                  <div className="activity-content">
                    <span className="activity-title">{result.quiz?.title || 'Викторина'}</span>
                    <span className="activity-date">{formatDate(result.completedAt || result.createdAt)}</span>
                  </div>
                  <div className="activity-score">
                    <span className={result.passed ? 'success' : 'failed'}>
                      {result.percentage || result.score}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="dashboard-actions">
          <Link to="/profile" className="action-card">
            <User size={24} />
            <span>Профиль</span>
          </Link>
          <Link to="/my-quizzes" className="action-card">
            <BookOpen size={24} />
            <span>Мои викторины</span>
          </Link>
          <Link to="/liked" className="action-card">
            <Heart size={24} />
            <span>Избранное</span>
          </Link>
          <button onClick={handleLogout} className="action-card logout">
            <LogOut size={24} />
            <span>Выйти</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
