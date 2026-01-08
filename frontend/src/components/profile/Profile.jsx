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
  Brain,
  Award,
  TrendingUp,
  Zap,
  Star,
  ChevronRight
} from 'lucide-react';

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('quizzes');

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
      // Получаем профиль пользователя
      const profileRes = await userAPI.getProfile();
      const userData = profileRes.data.data?.user || profileRes.data.data;
      setUser(userData);

      // Получаем статистику
      try {
        const statsRes = await userAPI.getUserStats();
        setStats(statsRes.data.data);
      } catch (e) {
        console.log('Stats not available');
      }

      // Получаем викторины пользователя
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
      <div className="profile-page">
        <div className="profile-container">
          <div className="quiz-page-loading">
            <Loader2 className="quiz-loading-spinner" />
            <p>Загрузка профиля...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="profile-page">
        <div className="profile-container">
          <div className="quiz-error-card">
            <h2>Не удалось загрузить профиль</h2>
            <p>Попробуйте войти в аккаунт снова</p>
            <button onClick={() => navigate('/login')} className="quiz-error-btn">
              Войти
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="w-full ">
        {/* Header Card */}
        <div className="profile-header-card">
          <div className="profile-cover" />
          
          <div className="profile-header-content">
            {/* Avatar */}
            <div className="profile-avatar-wrap">
              <div className="profile-avatar">
                {user.profile?.avatar?.url ? (
                  <img src={user.profile.avatar.url} alt={user.username} />
                ) : (
                  <span>{user.username?.charAt(0).toUpperCase()}</span>
                )}
              </div>
            </div>

            {/* Edit Button */}
            <button className="profile-edit-btn" onClick={() => navigate('/profile/edit')}>
              <Edit2 />
              Редактировать
            </button>

            {/* User Info */}
            <div className="profile-user-info">
              <h1>
                {user.profile?.firstName && user.profile?.lastName 
                  ? `${user.profile.firstName} ${user.profile.lastName}`
                  : user.username
                }
              </h1>
              <p className="profile-username">@{user.username}</p>
              
              {user.profile?.bio && (
                <p className="profile-bio">{user.profile.bio}</p>
              )}

              <div className="profile-meta">
                <div className="profile-meta-item">
                  <Mail />
                  <span>{user.email}</span>
                </div>
                {user.createdAt && (
                  <div className="profile-meta-item">
                    <Calendar />
                    <span>На сайте с {formatDate(user.createdAt)}</span>
                  </div>
                )}
                {user.profile?.location && (
                  <div className="profile-meta-item">
                    <MapPin />
                    <span>{user.profile.location}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="profile-stats-grid">
          <div className="profile-stat-card">
            <div className="stat-icon blue">
              <BookOpen />
            </div>
            <div className="stat-value">{quizzes.length}</div>
            <div className="stat-label">Викторин создано</div>
          </div>
          
          <div className="profile-stat-card">
            <div className="stat-icon green">
              <Target />
            </div>
            <div className="stat-value">{stats?.quizzesCompleted || 0}</div>
            <div className="stat-label">Пройдено</div>
          </div>
          
          <div className="profile-stat-card">
            <div className="stat-icon amber">
              <Trophy />
            </div>
            <div className="stat-value">{stats?.totalPoints || 0}</div>
            <div className="stat-label">Очков</div>
          </div>
          
          <div className="profile-stat-card">
            <div className="stat-icon rose">
              <TrendingUp />
            </div>
            <div className="stat-value">{stats?.averageScore || 0}%</div>
            <div className="stat-label">Средний балл</div>
          </div>
        </div>

        {/* Achievements Section */}
        <div className="profile-section">
          <h2>
            <Award />
            Достижения
          </h2>
          
          <div className="achievements-grid">
            <div className={`achievement-item ${quizzes.length >= 1 ? 'unlocked' : 'locked'}`}>
              <div className="achievement-icon">
                <Zap />
              </div>
              <div className="achievement-info">
                <h4>Первый квиз</h4>
                <p>Создайте свой первый квиз</p>
              </div>
              {quizzes.length >= 1 && <Star className="achievement-star" />}
            </div>
            
            <div className={`achievement-item ${quizzes.length >= 5 ? 'unlocked' : 'locked'}`}>
              <div className="achievement-icon">
                <BookOpen />
              </div>
              <div className="achievement-info">
                <h4>Автор</h4>
                <p>Создайте 5 квизов</p>
              </div>
              {quizzes.length >= 5 && <Star className="achievement-star" />}
            </div>
            
            <div className={`achievement-item ${(stats?.quizzesCompleted || 0) >= 10 ? 'unlocked' : 'locked'}`}>
              <div className="achievement-icon">
                <Target />
              </div>
              <div className="achievement-info">
                <h4>Знаток</h4>
                <p>Пройдите 10 квизов</p>
              </div>
              {(stats?.quizzesCompleted || 0) >= 10 && <Star className="achievement-star" />}
            </div>
            
            <div className={`achievement-item ${(stats?.totalPoints || 0) >= 1000 ? 'unlocked' : 'locked'}`}>
              <div className="achievement-icon">
                <Trophy />
              </div>
              <div className="achievement-info">
                <h4>Мастер</h4>
                <p>Наберите 1000 очков</p>
              </div>
              {(stats?.totalPoints || 0) >= 1000 && <Star className="achievement-star" />}
            </div>
          </div>
        </div>

        {/* My Quizzes Section */}
        <div className="profile-section">
          <h2>
            <BookOpen />
            Мои викторины
          </h2>
          
          {quizzes.length > 0 ? (
            <div className="profile-quizzes-list">
              {quizzes.slice(0, 5).map(quiz => (
                <Link 
                  to={`/quiz/${quiz._id}`} 
                  key={quiz._id}
                  className="profile-quiz-item"
                >
                  <div className="profile-quiz-thumb">
                    {quiz.thumbnail?.url ? (
                      <img src={quiz.thumbnail.url} alt={quiz.title} />
                    ) : (
                      <Brain />
                    )}
                  </div>
                  <div className="profile-quiz-info">
                    <h3>{quiz.title}</h3>
                    <p>{quiz.questions?.length || 0} вопросов</p>
                    <div className="profile-quiz-stats">
                      <span><Eye /> {quiz.stats?.views || 0}</span>
                      <span><Play /> {quiz.stats?.plays || 0}</span>
                      <span><Heart /> {quiz.likesCount || quiz.social?.likes?.length || 0}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="profile-empty">
              <BookOpen />
              <p>Вы ещё не создали ни одной викторины</p>
              <Link to="/create-quiz" className="quiz-start-btn" style={{ marginTop: '16px', display: 'inline-flex' }}>
                Создать первую викторину
              </Link>
            </div>
          )}
          
          {quizzes.length > 5 && (
            <Link to="/my-quizzes" className="load-more-btn" style={{ marginTop: '16px', display: 'block', textDecoration: 'none' }}>
              Показать все викторины ({quizzes.length})
            </Link>
          )}
        </div>

        {/* Actions */}
        <div className="profile-section">
          <h2>
            <Settings />
            Быстрые действия
          </h2>
          
          <div className="profile-actions-grid">
            <Link to="/create-quiz" className="profile-action-card primary">
              <div className="action-icon">
                <Brain />
              </div>
              <div className="action-info">
                <h4>Создать квиз</h4>
                <p>Новая викторина</p>
              </div>
              <ChevronRight className="action-arrow" />
            </Link>
            
            <Link to="/my-quizzes" className="profile-action-card">
              <div className="action-icon">
                <BookOpen />
              </div>
              <div className="action-info">
                <h4>Мои викторины</h4>
                <p>{quizzes.length} квизов</p>
              </div>
              <ChevronRight className="action-arrow" />
            </Link>
            
            <Link to="/quizzes" className="profile-action-card">
              <div className="action-icon">
                <Play />
              </div>
              <div className="action-info">
                <h4>Все квизы</h4>
                <p>Найти викторину</p>
              </div>
              <ChevronRight className="action-arrow" />
            </Link>
            
            <button onClick={handleLogout} className="profile-action-card danger">
              <div className="action-icon">
                <LogOut />
              </div>
              <div className="action-info">
                <h4>Выйти</h4>
                <p>Из аккаунта</p>
              </div>
              <ChevronRight className="action-arrow" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
