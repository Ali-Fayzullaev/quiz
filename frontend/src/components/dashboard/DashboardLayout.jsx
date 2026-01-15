// frontend/src/components/dashboard/DashboardLayout.jsx
import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import Sidebar from './Sidebar';
import { notificationAPI } from '../../services/api';
import { 
  Sun, 
  Moon, 
  Bell, 
  Search,
  Menu,
  X,
  UserPlus,
  UserCheck,
  MessageCircle,
  Heart,
  Trophy,
  Target,
  Flame,
  Star,
  CheckCheck,
  Trash2,
  Loader2,
  Command
} from 'lucide-react';

// Иконки для типов уведомлений
const NOTIFICATION_ICONS = {
  friend_request: { icon: UserPlus, color: 'text-blue-400 bg-blue-500/20' },
  friend_accepted: { icon: UserCheck, color: 'text-green-400 bg-green-500/20' },
  comment: { icon: MessageCircle, color: 'text-purple-400 bg-purple-500/20' },
  comment_reply: { icon: MessageCircle, color: 'text-indigo-400 bg-indigo-500/20' },
  quiz_like: { icon: Heart, color: 'text-pink-400 bg-pink-500/20' },
  quiz_completed: { icon: Target, color: 'text-cyan-400 bg-cyan-500/20' },
  achievement: { icon: Trophy, color: 'text-yellow-400 bg-yellow-500/20' },
  level_up: { icon: Star, color: 'text-amber-400 bg-amber-500/20' },
  streak: { icon: Flame, color: 'text-orange-400 bg-orange-500/20' },
  system: { icon: Bell, color: 'text-gray-400 bg-gray-500/20' }
};

// Форматирование времени
const formatTime = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now - date;
  
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  
  if (minutes < 1) return 'только что';
  if (minutes < 60) return `${minutes} мин назад`;
  if (hours < 24) return `${hours} ч назад`;
  if (days < 7) return `${days} дн назад`;
  
  return date.toLocaleDateString('ru-RU');
};

const DashboardLayout = ({ children }) => {
  const { darkMode, toggleTheme } = useTheme();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [markingRead, setMarkingRead] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  // Загрузка уведомлений
  const fetchNotifications = useCallback(async () => {
    try {
      setLoadingNotifications(true);
      const response = await notificationAPI.getNotifications({ limit: 20 });
      if (response.data.success) {
        setNotifications(response.data.data.notifications || []);
        setUnreadCount(response.data.data.unreadCount || 0);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoadingNotifications(false);
    }
  }, []);

  // Получить количество непрочитанных
  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await notificationAPI.getUnreadCount();
      if (response.data.success) {
        setUnreadCount(response.data.data.count || 0);
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  }, []);

  // Загружаем при монтировании и периодически
  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  // Загружаем полный список при открытии dropdown
  useEffect(() => {
    if (showNotifications) {
      fetchNotifications();
    }
  }, [showNotifications, fetchNotifications]);

  // Закрыть мобильное меню при изменении маршрута
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Горячие клавиши
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        document.getElementById('search-input')?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Отметить как прочитанное
  const handleMarkAsRead = async (notificationId, actionUrl) => {
    try {
      await notificationAPI.markAsRead(notificationId);
      setNotifications(prev => 
        prev.map(n => n._id === notificationId ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
      
      if (actionUrl) {
        setShowNotifications(false);
        navigate(actionUrl);
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Отметить все как прочитанные
  const handleMarkAllAsRead = async () => {
    try {
      setMarkingRead(true);
      await notificationAPI.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    } finally {
      setMarkingRead(false);
    }
  };

  // Удалить уведомление
  const handleDeleteNotification = async (e, notificationId) => {
    e.stopPropagation();
    try {
      await notificationAPI.deleteNotification(notificationId);
      setNotifications(prev => prev.filter(n => n._id !== notificationId));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/quizzes?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const getAvatarColor = (username) => {
    const colors = [
      'from-purple-500 to-pink-500',
      'from-blue-500 to-cyan-500',
      'from-green-500 to-emerald-500',
      'from-orange-500 to-red-500',
      'from-indigo-500 to-purple-500',
    ];
    const index = username ? username.charCodeAt(0) % colors.length : 0;
    return colors[index];
  };

  // Компонент уведомления
  const NotificationItem = ({ notification }) => {
    const typeConfig = NOTIFICATION_ICONS[notification.type] || NOTIFICATION_ICONS.system;
    const Icon = typeConfig.icon;
    
    return (
      <div 
        onClick={() => handleMarkAsRead(notification._id, notification.actionUrl)}
        className={`
          p-3 sm:p-4 cursor-pointer transition-all duration-200 group
          ${darkMode 
            ? 'hover:bg-white/5' 
            : 'hover:bg-gray-50'
          }
          ${!notification.read ? (darkMode ? 'bg-purple-500/10' : 'bg-purple-50') : ''}
        `}
      >
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-xl flex-shrink-0 ${typeConfig.color}`}>
            <Icon className="w-4 h-4" />
          </div>
          
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-medium line-clamp-1 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
              {notification.title}
            </p>
            <p className={`text-sm mt-0.5 line-clamp-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {notification.message}
            </p>
            <div className="flex items-center gap-2 mt-1.5">
              <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                {formatTime(notification.createdAt)}
              </span>
              {!notification.read && (
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse"></span>
              )}
            </div>
          </div>
          
          <button
            onClick={(e) => handleDeleteNotification(e, notification._id)}
            className={`
              p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all flex-shrink-0
              ${darkMode ? 'hover:bg-red-500/20 text-red-400' : 'hover:bg-red-50 text-red-500'}
            `}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      darkMode 
        ? 'bg-gray-950 text-white' 
        : 'bg-gray-50 text-gray-900'
    }`}>
      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Click outside to close notifications */}
      {showNotifications && (
        <div 
          className="fixed inset-0 z-20"
          onClick={() => setShowNotifications(false)}
        />
      )}

      {/* Sidebar - Desktop */}
      <aside className={`
        fixed top-0 left-0 h-full z-50
        hidden lg:block
        transition-all duration-300
      `}>
        <Sidebar 
          darkMode={darkMode} 
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          isMobile={false}
        />
      </aside>

      {/* Sidebar - Mobile */}
      <div className={`
        fixed top-0 left-0 h-full z-50
        lg:hidden
        transition-transform duration-300
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <Sidebar 
          darkMode={darkMode} 
          collapsed={false}
          isMobile={true}
          onClose={() => setMobileMenuOpen(false)}
        />
      </div>

      {/* Main Content */}
      <div className={`
        min-h-screen
        transition-all duration-300
        ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-72'}
      `}>
        {/* Top Header */}
        <header className={`
          sticky top-0 z-30
          px-3 sm:px-4 lg:px-6 xl:px-8
          py-3 sm:py-4
          backdrop-blur-xl
          border-b
          ${darkMode 
            ? 'bg-gray-950/90 border-gray-800/50' 
            : 'bg-white/90 border-gray-200/50'
          }
        `}>
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`
                lg:hidden p-2 sm:p-2.5 rounded-xl transition-all active:scale-95
                ${darkMode 
                  ? 'hover:bg-white/10 text-white bg-white/5' 
                  : 'hover:bg-gray-100 text-gray-700 bg-gray-50'
                }
              `}
            >
              <Menu size={22} />
            </button>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="flex-1 max-w-2xl">
              <div className={`
                relative flex items-center rounded-xl sm:rounded-2xl overflow-hidden
                transition-all duration-300
                ${searchFocused 
                  ? darkMode 
                    ? 'bg-white/10 ring-2 ring-purple-500/50' 
                    : 'bg-white ring-2 ring-purple-500/50 shadow-lg'
                  : darkMode 
                    ? 'bg-white/5' 
                    : 'bg-gray-100'
                }
              `}>
                <Search className={`
                  absolute left-3 sm:left-4 w-4 h-4 sm:w-5 sm:h-5 transition-colors
                  ${searchFocused 
                    ? darkMode ? 'text-purple-400' : 'text-purple-500'
                    : darkMode ? 'text-gray-500' : 'text-gray-400'
                  }
                `} />
                <input
                  id="search-input"
                  type="text"
                  placeholder="Поиск квизов..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                  className={`
                    w-full py-2.5 sm:py-3 pl-10 sm:pl-12 pr-4 sm:pr-24 bg-transparent outline-none
                    text-sm sm:text-base
                    placeholder:text-gray-500
                    ${darkMode ? 'text-white' : 'text-gray-900'}
                  `}
                />
                {/* Keyboard shortcut hint - Desktop only */}
                <div className={`
                  hidden sm:flex absolute right-3 items-center gap-1
                  px-2 py-1 rounded-lg text-xs font-medium
                  ${darkMode ? 'bg-white/10 text-gray-400' : 'bg-gray-200 text-gray-500'}
                `}>
                  <Command className="w-3 h-3" />
                  <span>K</span>
                </div>
              </div>
            </form>

            {/* Right Actions */}
            <div className="flex items-center gap-1.5 sm:gap-2 lg:gap-3">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className={`
                  p-2 sm:p-2.5 rounded-xl transition-all duration-300 active:scale-95
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
                    p-2 sm:p-2.5 rounded-xl transition-all duration-300 relative active:scale-95
                    ${darkMode 
                      ? 'bg-white/5 hover:bg-white/10 text-white' 
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }
                    ${showNotifications ? (darkMode ? 'bg-white/10 ring-2 ring-purple-500/50' : 'bg-gray-200 ring-2 ring-purple-500/50') : ''}
                  `}
                >
                  <Bell size={20} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1.5 bg-gradient-to-r from-red-500 to-pink-500 rounded-full text-xs flex items-center justify-center text-white font-bold shadow-lg shadow-red-500/30">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {showNotifications && (
                  <div className={`
                    absolute top-full mt-2
                    w-[calc(100vw-24px)] sm:w-96
                    max-w-[400px]
                    right-0 sm:right-0
                    rounded-2xl overflow-hidden shadow-2xl
                    ${darkMode 
                      ? 'bg-gray-900 border border-gray-700/50' 
                      : 'bg-white border border-gray-200'
                    }
                  `}>
                    {/* Header */}
                    <div className={`
                      p-3 sm:p-4 border-b flex items-center justify-between
                      ${darkMode ? 'border-gray-700/50' : 'border-gray-100'}
                    `}>
                      <div className="flex items-center gap-2">
                        <h3 className={`font-bold text-base ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          Уведомления
                        </h3>
                        {unreadCount > 0 && (
                          <span className="px-2 py-0.5 text-xs font-bold bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full">
                            {unreadCount}
                          </span>
                        )}
                      </div>
                      {unreadCount > 0 && (
                        <button
                          onClick={handleMarkAllAsRead}
                          disabled={markingRead}
                          className={`
                            text-xs sm:text-sm flex items-center gap-1 font-medium transition-colors
                            ${darkMode ? 'text-purple-400 hover:text-purple-300' : 'text-purple-600 hover:text-purple-700'}
                          `}
                        >
                          {markingRead ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <CheckCheck className="w-4 h-4" />
                          )}
                          <span className="hidden sm:inline">Прочитать все</span>
                        </button>
                      )}
                    </div>
                    
                    {/* Notifications List */}
                    <div className="max-h-[60vh] sm:max-h-96 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800/50">
                      {loadingNotifications ? (
                        <div className="flex items-center justify-center py-12">
                          <Loader2 className="w-6 h-6 animate-spin text-purple-500" />
                        </div>
                      ) : notifications.length === 0 ? (
                        <div className={`text-center py-12 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                          <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center ${darkMode ? 'bg-white/5' : 'bg-gray-100'}`}>
                            <Bell className="w-8 h-8 opacity-50" />
                          </div>
                          <p className="font-medium">Нет уведомлений</p>
                          <p className="text-sm mt-1 opacity-75">Здесь появятся ваши уведомления</p>
                        </div>
                      ) : (
                        notifications.map((notif) => (
                          <NotificationItem key={notif._id} notification={notif} />
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* User Avatar */}
              <button 
                onClick={() => navigate('/profile')}
                className={`
                  flex items-center gap-2 sm:gap-3 p-1.5 sm:p-2 rounded-xl transition-all active:scale-95
                  ${darkMode ? 'hover:bg-white/5' : 'hover:bg-gray-50'}
                `}
              >
                {user?.profile?.avatar?.url ? (
                  <img 
                    src={user.profile.avatar.url} 
                    alt={user.username}
                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl object-cover ring-2 ring-purple-500/30"
                  />
                ) : (
                  <div className={`
                    w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br ${getAvatarColor(user.username)}
                    flex items-center justify-center text-white font-bold text-sm sm:text-base ring-2 ring-purple-500/30
                  `}>
                    {user.username?.charAt(0).toUpperCase() || 'U'}
                  </div>
                )}
                <div className="hidden xl:block text-left">
                  <p className={`text-sm font-semibold line-clamp-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {user.username || 'Пользователь'}
                  </p>
                  <p className={`text-xs line-clamp-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {user.email || ''}
                  </p>
                </div>
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-3 sm:p-4 lg:p-6 xl:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
