import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Heart, Sparkles, LogOut, Menu, X, BookOpen, FolderOpen } from 'lucide-react';

// Функция для генерации цвета
const getAvatarColor = (username) => {
  const colors = [
    '#a855f7', '#ec4899', '#3b82f6', '#10b981', '#f59e0b',
    '#ef4444', '#8b5cf6', '#06b6d4', '#f97316', '#84cc16'
  ];
  if (!username) return colors[0];
  const index = username.charCodeAt(0) % colors.length;
  return colors[index];
};

const Header = () => {
  const [user, setUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
    <header className="sticky top-0 z-50 bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-white/10">
      <nav className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-white hidden sm:block">QuizMaster</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-1">
          <Link to="/quizzes" className="px-4 py-2 text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors flex items-center gap-2">
            <BookOpen size={18} />
            Викторины
          </Link>
          {user && (
            <>
              <Link to="/dashboard" className="px-4 py-2 text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors flex items-center gap-2">
                <LayoutDashboard size={18} />
                Дашборд
              </Link>
              <Link to="/my-quizzes" className="px-4 py-2 text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors flex items-center gap-2">
                <FolderOpen size={18} />
                Мои квизы
              </Link>
              <Link to="/liked" className="px-4 py-2 text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors flex items-center gap-2">
                <Heart size={18} />
                Избранное
              </Link>
            </>
          )}
        </div>

        {/* Desktop Auth */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <Link to="/profile" className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/5 transition-colors">
                <div 
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-medium text-sm overflow-hidden"
                  style={{ backgroundColor: getAvatarColor(user.username) }}
                >
                  {user.avatar ? (
                    <img src={user.avatar.url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    user.username?.charAt(0).toUpperCase()
                  )}
                </div>
                <span className="text-white font-medium">{user.username}</span>
              </Link>
              <button 
                onClick={handleLogout} 
                className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                title="Выйти"
              >
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="px-4 py-2 text-gray-300 hover:text-white transition-colors">
                Войти
              </Link>
              <Link to="/register" className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium rounded-xl hover:opacity-90 transition-opacity">
                Регистрация
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0a0a0f] border-t border-white/10">
          <div className="px-4 py-4 space-y-2">
            <Link to="/quizzes" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition-colors">
              <BookOpen size={20} />
              Викторины
            </Link>
            {user && (
              <>
                <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition-colors">
                  <LayoutDashboard size={20} />
                  Дашборд
                </Link>
                <Link to="/my-quizzes" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition-colors">
                  <FolderOpen size={20} />
                  Мои квизы
                </Link>
                <Link to="/liked" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition-colors">
                  <Heart size={20} />
                  Избранное
                </Link>
              </>
            )}
            
            <div className="pt-2 border-t border-white/10">
              {user ? (
                <div className="space-y-2">
                  <Link to="/profile" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition-colors">
                    <div 
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-medium text-sm"
                      style={{ backgroundColor: getAvatarColor(user.username) }}
                    >
                      {user.username?.charAt(0).toUpperCase()}
                    </div>
                    Профиль
                  </Link>
                  <button 
                    onClick={() => { handleLogout(); setMobileMenuOpen(false); }} 
                    className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
                  >
                    <LogOut size={20} />
                    Выйти
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 text-center text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition-colors">
                    Войти
                  </Link>
                  <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 text-center bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium rounded-xl hover:opacity-90 transition-opacity">
                    Регистрация
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;