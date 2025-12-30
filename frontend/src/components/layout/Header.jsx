import { useState, useEffect } from 'react';

const Header = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    window.location.href = '/';
  };

  return (
    <header className="header">
      <nav className="nav">
        <div className="nav-brand">
          <a href="/">QuizApp</a>
        </div>

        <div className="nav-links">
          <a href="/quizzes">Викторины</a>
          {user && <a href="/create-quiz">Создать викторину</a>}
          {user && <a href="/profile">Профиль</a>}
        </div>

        <div className="nav-auth">
          {user ? (
            <div className="user-menu">
              <span>Привет, {user.username}!</span>
              <button onClick={handleLogout} className="logout-btn">
                Выйти
              </button>
            </div>
          ) : (
            <div className="auth-links">
              <a href="/login" className="login-link">Войти</a>
              <a href="/register" className="register-link">Регистрация</a>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;