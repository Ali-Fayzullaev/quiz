import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  Heart,
  Trophy,
  Settings,
  User,
  Plus,
  Play,
  Gamepad2,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  BarChart3
} from 'lucide-react';

const Sidebar = ({ darkMode, collapsed, onToggle }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

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

  const mainNavItems = [
    { icon: LayoutDashboard, label: 'Обзор', path: '/dashboard' },
    { icon: BookOpen, label: 'Мои квизы', path: '/my-quizzes' },
    { icon: Heart, label: 'Избранное', path: '/liked' },
    { icon: BarChart3, label: 'Статистика', path: '/stats', badge: 'Скоро' },
    { icon: Trophy, label: 'Достижения', path: '/achievements', badge: 'Скоро' },
  ];

  const playNavItems = [
    { icon: Play, label: 'Все квизы', path: '/quizzes' },
    { icon: Plus, label: 'Создать квиз', path: '/create-quiz' },
    { icon: Gamepad2, label: 'Быстрая игра', path: '/quick-play', badge: 'Новое' },
  ];

  const accountNavItems = [
    { icon: User, label: 'Профиль', path: '/profile' },
    { icon: Settings, label: 'Настройки', path: '/profile/edit' },
  ];

  const NavItem = ({ item }) => {
    const isActive = location.pathname === item.path;
    const Icon = item.icon;
    const isDisabled = item.badge === 'Скоро';

    return (
      <Link
        to={isDisabled ? '#' : item.path}
        onClick={(e) => isDisabled && e.preventDefault()}
        className={`
          group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 relative
          ${isActive 
            ? darkMode 
              ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-white' 
              : 'bg-gradient-to-r from-purple-500/10 to-pink-500/10 text-purple-700'
            : darkMode
              ? 'text-gray-400 hover:text-white hover:bg-white/5' 
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }
          ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
          ${collapsed ? 'justify-center px-2' : ''}
        `}
        title={collapsed ? item.label : undefined}
      >
        {isActive && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-gradient-to-b from-purple-500 to-pink-500 rounded-r-full" />
        )}
        <Icon size={20} className={`flex-shrink-0 ${isActive ? 'text-purple-400' : ''}`} />
        {!collapsed && (
          <>
            <span className="flex-1 font-medium text-sm">{item.label}</span>
            {item.badge && (
              <span className={`
                px-2 py-0.5 text-xs rounded-full font-medium
                ${item.badge === 'Новое' 
                  ? 'bg-green-500/20 text-green-400' 
                  : 'bg-amber-500/20 text-amber-400'
                }
              `}>
                {item.badge}
              </span>
            )}
          </>
        )}
      </Link>
    );
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <aside className={`
      h-full transition-all duration-300 flex flex-col
      ${darkMode 
        ? 'bg-[#12121a] border-r border-white/5' 
        : 'bg-white border-r border-gray-200'
      }
      ${collapsed ? 'w-20' : 'w-64'}
    `}>
      {/* Logo */}
      <div className={`
        flex items-center h-16 px-4 border-b
        ${darkMode ? 'border-white/5' : 'border-gray-200'}
        ${collapsed ? 'justify-center' : 'gap-3'}
      `}>
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/25">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <div>
            <span className={`font-bold text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              QuizMaster
            </span>
            <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
              Платформа квизов
            </p>
          </div>
        )}
      </div>

      {/* User Card */}
      {!collapsed && (
        <div className={`
          mx-3 mt-4 p-3 rounded-xl
          ${darkMode ? 'bg-white/5' : 'bg-gray-50'}
        `}>
          <div className="flex items-center gap-3">
            {user.avatar?.url ? (
              <img 
                src={user.avatar.url} 
                alt={user.username}
                className="w-10 h-10 rounded-lg object-cover"
              />
            ) : (
              <div className={`
                w-10 h-10 rounded-lg bg-gradient-to-br ${getAvatarColor(user.username)}
                flex items-center justify-center text-white font-bold text-sm
              `}>
                {user.username?.charAt(0).toUpperCase() || 'U'}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className={`font-medium text-sm truncate ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {user.username || 'Пользователь'}
              </p>
              <p className={`text-xs truncate ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Уровень 1 • 0 XP
              </p>
            </div>
          </div>
          {/* XP Progress */}
          <div className="mt-3">
            <div className={`h-1.5 rounded-full overflow-hidden ${darkMode ? 'bg-white/10' : 'bg-gray-200'}`}>
              <div className="h-full w-1/4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" />
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-6 overflow-y-auto">
        {/* Main */}
        <div>
          {!collapsed && (
            <p className={`px-3 mb-2 text-xs font-semibold uppercase tracking-wider ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
              Главное
            </p>
          )}
          <div className="space-y-1">
            {mainNavItems.map((item) => (
              <NavItem key={item.path} item={item} />
            ))}
          </div>
        </div>

        {/* Play */}
        <div>
          {!collapsed && (
            <p className={`px-3 mb-2 text-xs font-semibold uppercase tracking-wider ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
              Играть
            </p>
          )}
          <div className="space-y-1">
            {playNavItems.map((item) => (
              <NavItem key={item.path} item={item} />
            ))}
          </div>
        </div>

        {/* Account */}
        <div>
          {!collapsed && (
            <p className={`px-3 mb-2 text-xs font-semibold uppercase tracking-wider ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
              Аккаунт
            </p>
          )}
          <div className="space-y-1">
            {accountNavItems.map((item) => (
              <NavItem key={item.path} item={item} />
            ))}
          </div>
        </div>
      </nav>

      {/* Bottom Section */}
      <div className={`p-3 border-t ${darkMode ? 'border-white/5' : 'border-gray-200'}`}>
        {/* Promo Card */}
        {!collapsed && (
          <div className="mb-3 p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="w-5 h-5 text-yellow-400" />
              <span className={`font-semibold text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Стать PRO
              </span>
            </div>
            <p className={`text-xs mb-3 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Разблокируйте все функции и уберите рекламу
            </p>
            <button className="w-full py-2 px-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-medium rounded-lg hover:opacity-90 transition-opacity">
              Улучшить план
            </button>
          </div>
        )}

        {/* Toggle & Logout */}
        <div className="flex items-center gap-2">
          <button
            onClick={onToggle}
            className={`
              flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg transition-colors
              ${darkMode 
                ? 'text-gray-400 hover:text-white hover:bg-white/5' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }
            `}
          >
            {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
            {!collapsed && <span className="text-sm">Свернуть</span>}
          </button>
          
          <button
            onClick={handleLogout}
            className={`
              p-2.5 rounded-lg transition-colors
              ${darkMode 
                ? 'text-red-400 hover:bg-red-500/10' 
                : 'text-red-500 hover:bg-red-50'
              }
            `}
            title="Выйти"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
