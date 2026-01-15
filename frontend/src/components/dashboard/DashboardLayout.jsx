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
  Loader2
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
    const interval = setInterval(fetchUnreadCount, 30000); // каждые 30 сек
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

  // Отметить как прочитанное
  const handleMarkAsRead = async (notificationId, actionUrl) => {
    try {
      await notificationAPI.markAsRead(notificationId);
      setNotifications(prev => 
        prev.map(n => n._id === notificationId ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
      
      // Переходим по ссылке если есть
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
      'from-yellow-500 to-orange-500',
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
          p-4 border-b last:border-0 cursor-pointer transition-all duration-200 group
          ${darkMode 
            ? 'border-white/5 hover:bg-white/5' 
            : 'border-gray-100 hover:bg-gray-50'
          }
          ${!notification.read ? (darkMode ? 'bg-purple-500/10' : 'bg-purple-50') : ''}
        `}
      >
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className={`p-2 rounded-lg ${typeConfig.color}`}>
            <Icon className="w-4 h-4" />
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
              {notification.title}
            </p>
            <p className={`text-sm mt-0.5 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {notification.message}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                {formatTime(notification.createdAt)}
              </span>
              {!notification.read && (
                <span className="w-2 h-2 rounded-full bg-purple-500"></span>
              )}
            </div>
          </div>
          
          {/* Delete button */}
          <button
            onClick={(e) => handleDeleteNotification(e, notification._id)}
            className={`
              p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all
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
          isMobile={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
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
            ? 'bg-gray-950/80 border-gray-800' 
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
              <div className="relative z-30">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className={`
                    p-2.5 rounded-xl transition-all duration-300 relative
                    ${darkMode 
                      ? 'bg-white/5 hover:bg-white/10 text-white' 
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }
                    ${showNotifications ? (darkMode ? 'bg-white/10' : 'bg-gray-200') : ''}
                  `}
                >
                  <Bell size={20} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1.5 bg-red-500 rounded-full text-xs flex items-center justify-center text-white font-medium animate-pulse">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {showNotifications && (
                  <div className={`
                    absolute right-0 top-full mt-2 w-96 rounded-2xl overflow-hidden shadow-2xl
                    ${darkMode 
                      ? 'bg-gray-900 border border-gray-700' 
                      : 'bg-white border border-gray-200'
                    }
                  `}>
                    {/* Header */}
                    <div className={`p-4 border-b flex items-center justify-between ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                      <div className="flex items-center gap-2">
                        <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          Уведомления
                        </h3>
                        {unreadCount > 0 && (
                          <span className="px-2 py-0.5 text-xs font-medium bg-purple-500 text-white rounded-full">
                            {unreadCount} новых
                          </span>
                        )}
                      </div>
                      {unreadCount > 0 && (
                        <button
                          onClick={handleMarkAllAsRead}
                          disabled={markingRead}
                          className={`
                            text-sm flex items-center gap-1 transition-colors
                            ${darkMode ? 'text-purple-400 hover:text-purple-300' : 'text-purple-600 hover:text-purple-700'}
                          `}
                        >
                          {markingRead ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <CheckCheck className="w-4 h-4" />
                          )}
                          Прочитать все
                        </button>
                      )}
                    </div>
                    
                    {/* Notifications List */}
                    <div className="max-h-96 overflow-y-auto">
                      {loadingNotifications ? (
                        <div className="flex items-center justify-center py-10">
                          <Loader2 className="w-6 h-6 animate-spin text-purple-500" />
                        </div>
                      ) : notifications.length === 0 ? (
                        <div className={`text-center py-10 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                          <Bell className="w-12 h-12 mx-auto mb-3 opacity-50" />
                          <p>Нет уведомлений</p>
                        </div>
                      ) : (
                        notifications.map((notif) => (
                          <NotificationItem key={notif._id} notification={notif} />
                        ))
                      )}
                    </div>
                    
                    {/* Footer */}
                    {notifications.length > 0 && (
                      <div className={`p-3 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                        <button 
                          onClick={() => setShowNotifications(false)}
                          className={`
                            w-full text-center text-sm font-medium py-2 rounded-lg transition-colors
                            ${darkMode 
                              ? 'text-purple-400 hover:bg-purple-500/10' 
                              : 'text-purple-600 hover:bg-purple-50'
                            }
                          `}
                        >
                          Все уведомления
                        </button>
                      </div>
                    )}
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
