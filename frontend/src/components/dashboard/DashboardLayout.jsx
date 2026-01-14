// frontend/src/components/dashboard/DashboardLayout.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import Sidebar from './Sidebar';
import { 
  Sun, 
  Moon, 
  Bell, 
  Search,
  Menu,
  X
} from 'lucide-react';


 const fetchAllData = async () => {
    try {
      const [profileRes,] = await Promise.allSettled([
        userAPI.getProfile()
      ]);

      if (profileRes.status === 'fulfilled') {
        setUser(profileRes.value.data.data?.user || profileRes.value.data.data);
      }

    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };


const DashboardLayout = ({ children }) => {
  const { darkMode, toggleTheme } = useTheme();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState([
    { id: 1, text: 'Новый комментарий к вашему квизу', time: '5 мин назад', unread: true },
    { id: 2, text: 'Ваш квиз прошли 100 раз!', time: '1 час назад', unread: true },
    { id: 3, text: 'Новое достижение разблокировано', time: '2 часа назад', unread: false },
  ]);
  const [showNotifications, setShowNotifications] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  // Закрыть мобильное меню при изменении маршрута
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/quizzes?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const unreadCount = notifications.filter(n => n.unread).length;

  const getAvatarColor = (username) => {
    const colors = [
      'from-purple-500 to-pink-500',
      'from-blue-500 to-cyan-500',
      'from-green-500 to-emerald-500',
      'from-orange-500 to-red-500',
      'from-indigo-500 to-purple-500',
      'from-yellow-500 to-orange-500',
    ];
    const index = username ? username.charCodeAt(0) % colors.length : 0;
    return colors[index];
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      darkMode 
        ? 'bg-[#0a0a0f] text-white' 
        : 'bg-gray-50 text-gray-900'
    }`}>
      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 h-full z-50
        transition-transform duration-300 lg:translate-x-0
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <Sidebar 
          darkMode={darkMode} 
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      </div>

      {/* Main Content */}
      <div className={`
        transition-all duration-300
        ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'}
      `}>
        {/* Top Header */}
        <header className={`
          sticky top-0 z-30 px-4 lg:px-12 py-4
          backdrop-blur-xl border-b
          ${darkMode 
            ? 'bg-[#0a0a0f]/80 border-white/5' 
            : 'bg-white/80 border-gray-200'
          }
        `}>
          <div className="flex items-center justify-between gap-4">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`
                lg:hidden p-2 rounded-lg transition-colors
                ${darkMode 
                  ? 'hover:bg-white/10 text-white' 
                  : 'hover:bg-gray-100 text-gray-700'
                }
              `}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="flex-1 max-w-xl">
              <div className={`
                relative flex items-center rounded-xl overflow-hidden
                ${darkMode ? 'bg-white/5' : 'bg-gray-100'}
              `}>
                <Search className={`absolute left-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} size={18} />
                <input
                  type="text"
                  placeholder="Поиск квизов, пользователей..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`
                    w-full py-3 pl-12 pr-4 bg-transparent outline-none
                    placeholder:text-gray-500
                    ${darkMode ? 'text-white' : 'text-gray-900'}
                  `}
                />
              </div>
            </form>

            {/* Right Actions */}
            <div className="flex items-center gap-2 lg:gap-4">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className={`
                  p-2.5 rounded-xl transition-all duration-300
                  ${darkMode 
                    ? 'bg-white/5 hover:bg-white/10 text-yellow-400' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }
                `}
              >
                {darkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>

              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className={`
                    p-2.5 rounded-xl transition-all duration-300 relative
                    ${darkMode 
                      ? 'bg-white/5 hover:bg-white/10 text-white' 
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }
                  `}
                >
                  <Bell size={20} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs flex items-center justify-center text-white font-medium">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {showNotifications && (
                  <div className={`
                    absolute right-0 top-full mt-2 w-80 rounded-xl overflow-hidden shadow-2xl
                    ${darkMode 
                      ? 'bg-[#1a1a2e] border border-white/10' 
                      : 'bg-white border border-gray-200'
                    }
                  `}>
                    <div className={`p-4 border-b ${darkMode ? 'border-white/10' : 'border-gray-200'}`}>
                      <h3 className="font-semibold">Уведомления</h3>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.map((notif) => (
                        <div 
                          key={notif.id}
                          className={`
                            p-4 border-b last:border-0 cursor-pointer transition-colors
                            ${darkMode 
                              ? 'border-white/5 hover:bg-white/5' 
                              : 'border-gray-100 hover:bg-gray-50'
                            }
                            ${notif.unread ? (darkMode ? 'bg-white/5' : 'bg-blue-50') : ''}
                          `}
                        >
                          <p className={`text-sm ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                            {notif.text}
                          </p>
                          <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                            {notif.time}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className={`p-3 border-t ${darkMode ? 'border-white/10' : 'border-gray-200'}`}>
                      <button className="w-full text-center text-sm text-purple-400 hover:text-purple-300 transition-colors">
                        Посмотреть все
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* User Avatar */}
              <button 
                onClick={() => navigate('/profile')}
                className="flex items-center gap-3"
              >
                {user?.profile.avatar?.url ? (
                  <img 
                    src={user.profile.avatar.url} 
                    alt={user.username}
                    className="w-10 h-10 rounded-xl object-cover ring-2 ring-purple-500/50"
                  />
                ) : (
                  <div className={`
                    w-10 h-10 rounded-xl bg-gradient-to-br ${getAvatarColor(user.username)}
                    flex items-center justify-center text-white font-bold ring-2 ring-purple-500/50
                  `}>
                    {user.username?.charAt(0).toUpperCase() || 'U'}
                  </div>
                )}
                <div className="hidden lg:block text-left">
                  <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {user.username || 'Пользователь'}
                  </p>
                  <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {user.email || ''}
                  </p>
                </div>
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 lg:p-12">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
