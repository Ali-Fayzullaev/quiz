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
  Brain
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
    <div className="profile-page">
      <div className="profile-container">
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
              <Clock />
            </div>
            <div className="stat-value">{stats?.averageScore || 0}%</div>
            <div className="stat-label">Средний балл</div>
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
            Настройки
          </h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <Link to="/my-quizzes" className="secondary-action-btn" style={{ padding: '12px', background: '#f9fafb', borderRadius: '8px', textDecoration: 'none', color: '#374151' }}>
              <BookOpen style={{ width: '20px', height: '20px' }} />
              <span>Мои викторины</span>
            </Link>
            
            <button 
              onClick={handleLogout}
              className="secondary-action-btn"
              style={{ 
                padding: '12px', 
                background: '#fef2f2', 
                borderRadius: '8px', 
                color: '#dc2626',
                border: 'none',
                cursor: 'pointer',
                width: '100%',
                justifyContent: 'flex-start'
              }}
            >
              <LogOut style={{ width: '20px', height: '20px' }} />
              <span>Выйти из аккаунта</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
