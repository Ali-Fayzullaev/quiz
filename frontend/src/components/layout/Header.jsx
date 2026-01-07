import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Heart } from 'lucide-react';

// Функция для генерации цвета
const getAvatarColor = (username) => {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
  ];
  if (!username) return colors[0];
  const index = username.charCodeAt(0) % colors.length;
  return colors[index];
};

const Header = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    
    // Слушаем изменения в localStorage
    const handleStorage = () => {
      const userData = localStorage.getItem('user');
      setUser(userData ? JSON.parse(userData) : null);
    };
    
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/');
  };

  return (
    <header className="header">
      <nav className="nav">
        <div className="nav-brand">
          <Link to="/">QuizApp</Link>
        </div>

        <div className="nav-links">
          <Link to="/quizzes">Викторины</Link>
          {user && <Link to="/dashboard">Дашборд</Link>}
          {user && <Link to="/my-quizzes">Мои викторины</Link>}
          {user && <Link to="/liked" className="nav-liked"><Heart size={16} /> Избранное</Link>}
        </div>

        <div className="nav-auth">
          {user ? (
            <div className="user-menu">
              <Link to="/profile" className="user-menu-avatar">
                <div 
                  className="nav-avatar"
                  style={{ backgroundColor: getAvatarColor(user.username) }}
                >
                  {user.avatar ? (
                    <img src={user.avatar} alt="" />
                  ) : (
                    <span>{user.username?.charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <span className="nav-username">{user.username}</span>
              </Link>
              <button onClick={handleLogout} className="logout-btn">
                Выйти
              </button>
            </div>
          ) : (
            <div className="auth-links">
              <Link to="/login" className="login-link">Войти</Link>
              <Link to="/register" className="register-link">Регистрация</Link>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;