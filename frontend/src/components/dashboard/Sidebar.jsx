// frontend/src/components/dashboard/Sidebar.jsx
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
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
  ChevronDown,
  ChevronUp,
  Sparkles,
  BarChart3,
  Zap,
  Crown,
  Star,
  Flame
} from 'lucide-react';

const Sidebar = ({ darkMode, collapsed, onToggle }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [animateXP, setAnimateXP] = useState(false);
  const [userCardExpanded, setUserCardExpanded] = useState(false);

  // Получаем статистику пользователя
  const gameStats = user.gameStats || {};
  const totalPoints = gameStats.totalPoints || 0;
  const currentStreak = gameStats.currentStreak || 0;

  // Система уровней
  const getLevelInfo = (points) => {
    const levels = [
      { min: 0, max: 199, level: 1, name: 'Новичок', color: 'from-gray-400 to-gray-500', icon: '🌱' },
      { min: 200, max: 499, level: 2, name: 'Ученик', color: 'from-green-400 to-emerald-500', icon: '📚' },
      { min: 500, max: 999, level: 3, name: 'Знаток', color: 'from-blue-400 to-cyan-500', icon: '🎓' },
      { min: 1000, max: 1999, level: 4, name: 'Мастер', color: 'from-purple-400 to-pink-500', icon: '⭐' },
      { min: 2000, max: 3499, level: 5, name: 'Эксперт', color: 'from-orange-400 to-red-500', icon: '🔥' },
      { min: 3500, max: 4999, level: 6, name: 'Гуру', color: 'from-pink-400 to-rose-500', icon: '💎' },
      { min: 5000, max: 7499, level: 7, name: 'Легенда', color: 'from-yellow-400 to-amber-500', icon: '👑' },
      { min: 7500, max: 9999, level: 8, name: 'Титан', color: 'from-indigo-400 to-purple-600', icon: '⚡' },
      { min: 10000, max: Infinity, level: 9, name: 'The best', color: 'from-amber-300 via-yellow-400 to-orange-500', icon: '🏆' },
    ];
    
    for (const lvl of levels) {
      if (points >= lvl.min && points <= lvl.max) {
        const progress = ((points - lvl.min) / (lvl.max - lvl.min + 1)) * 100;
        const nextLevel = lvl.max + 1;
        return { ...lvl, progress: Math.min(progress, 100), nextLevel };
      }
    }
    return levels[levels.length - 1];
  };

  const levelInfo = getLevelInfo(totalPoints);

  useEffect(() => {
    setAnimateXP(true);
    const timer = setTimeout(() => setAnimateXP(false), 600);
    return () => clearTimeout(timer);
  }, [totalPoints]);

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
    { icon: BarChart3, label: 'Статистика', path: '/stats' },
    { icon: Trophy, label: 'Достижения', path: '/achievements' },
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
        <Icon size={20} className={`flex-shrink-0 transition-transform group-hover:scale-110 ${isActive ? 'text-purple-400' : ''}`} />
        {!collapsed && (
          <>
            <span className="flex-1 font-medium text-sm">{item.label}</span>
            {item.badge && (
              <span className={`
                px-2 py-0.5 text-xs rounded-full font-medium animate-pulse
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
        : 'bg-white border-r border-gray-200 shadow-sm'
      }
      ${collapsed ? 'w-20' : 'w-72'}
    `}>
      {/* Logo */}
      <div className={`
        flex items-center h-16 px-4 border-b
        ${darkMode ? 'border-white/5' : 'border-gray-200'}
        ${collapsed ? 'justify-center' : 'gap-3'}
      `}>
        <div className="relative">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/25">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-[#12121a] animate-pulse" />
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

      {/* User Card with XP - Always visible XP bar with expandable details */}
      {!collapsed && (
        <div className={`mx-3 mt-4 rounded-2xl overflow-hidden ${darkMode ? 'bg-gradient-to-br from-white/5 to-white/[0.02]' : 'bg-gradient-to-br from-gray-50 to-gray-100'}`}>
          {/* XP Bar - Always Visible */}
          <button
            onClick={() => setUserCardExpanded(!userCardExpanded)}
            className={`w-full px-4 py-3 flex items-center justify-between transition-all hover:bg-white/5 ${darkMode ? 'hover:bg-white/5' : 'hover:bg-gray-100'}`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${levelInfo.color} flex items-center justify-center shadow-lg ${animateXP ? 'animate-bounce' : ''}`}>
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <p className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'} ${animateXP ? 'text-purple-400' : ''} transition-colors`}>
                  {totalPoints.toLocaleString()} <span className="text-xs font-normal text-purple-400">XP</span>
                </p>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm">{levelInfo.icon}</span>
                  <span className={`text-xs font-medium ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                    {levelInfo.name}
                  </span>
                  {currentStreak > 0 && (
                    <div className="flex items-center gap-0.5 ml-1">
                      <Flame className="w-3 h-3 text-orange-400" />
                      <span className="text-xs font-bold text-orange-400">{currentStreak}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className={`p-1 rounded-lg transition-all ${darkMode ? 'hover:bg-white/10' : 'hover:bg-gray-200'}`}>
              {userCardExpanded ? (
                <ChevronUp className={`w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
              ) : (
                <ChevronDown className={`w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
              )}
            </div>
          </button>

          {/* Progress Bar - Always Visible */}
          <div className="px-4 pb-3">
            <div className={`h-2 rounded-full overflow-hidden ${darkMode ? 'bg-white/10' : 'bg-gray-200'}`}>
              <div 
                className={`h-full bg-gradient-to-r ${levelInfo.color} rounded-full transition-all duration-500 ease-out relative overflow-hidden`}
                style={{ width: `${levelInfo.progress}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
              </div>
            </div>
            <div className="flex justify-between text-[10px] mt-1">
              <span className={darkMode ? 'text-gray-500' : 'text-gray-400'}>Ур. {levelInfo.level}</span>
              <span className={darkMode ? 'text-gray-500' : 'text-gray-400'}>
                {levelInfo.nextLevel !== Infinity 
                  ? `${(levelInfo.nextLevel - totalPoints).toLocaleString()} XP до след.`
                  : '🎉 MAX'
                }
              </span>
            </div>
          </div>

          {/* Expandable Section */}
          <div className={`overflow-hidden transition-all duration-300 ease-in-out ${userCardExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
            {/* User Info */}
            <div className={`px-4 py-3 border-t ${darkMode ? 'border-white/10 bg-white/5' : 'border-gray-100 bg-white'}`}>
              <div className="flex items-center gap-3">
                <div className="relative">
                  {user.avatar?.url ? (
                    <img 
                      src={user.avatar.url} 
                      alt={user.username}
                      className="w-12 h-12 rounded-xl object-cover ring-2 ring-purple-500/30"
                    />
                  ) : (
                    <div className={`
                      w-12 h-12 rounded-xl bg-gradient-to-br ${getAvatarColor(user.username)}
                      flex items-center justify-center text-white font-bold text-lg ring-2 ring-purple-500/30
                    `}>
                      {user.username?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  )}
                  {/* Level Badge */}
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white text-xs font-bold shadow-lg">
                    {levelInfo.level}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`font-semibold text-sm truncate ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {user.username || 'Пользователь'}
                  </p>
                  <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {user.email || 'Нет email'}
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className={`grid grid-cols-3 divide-x ${darkMode ? 'divide-white/10 bg-white/[0.02]' : 'divide-gray-100 bg-gray-50'}`}>
              <div className="py-2.5 text-center">
                <Trophy className={`w-4 h-4 mx-auto mb-0.5 ${darkMode ? 'text-yellow-400' : 'text-yellow-500'}`} />
                <p className={`text-xs font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {gameStats.quizzesCompleted || 0}
                </p>
                <p className={`text-[10px] ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Пройдено</p>
              </div>
              <div className="py-2.5 text-center">
                <Star className={`w-4 h-4 mx-auto mb-0.5 ${darkMode ? 'text-purple-400' : 'text-purple-500'}`} />
                <p className={`text-xs font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {gameStats.averageScore || 0}%
                </p>
                <p className={`text-[10px] ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Средний</p>
              </div>
              <div className="py-2.5 text-center">
                <Flame className={`w-4 h-4 mx-auto mb-0.5 ${darkMode ? 'text-orange-400' : 'text-orange-500'}`} />
                <p className={`text-xs font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {gameStats.bestStreak || 0}
                </p>
                <p className={`text-[10px] ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Рекорд</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Collapsed XP indicator */}
      {collapsed && (
        <div className="mx-2 mt-4 p-2 rounded-xl text-center" title={`${totalPoints} XP • Уровень ${levelInfo.level}`}>
          <div className={`w-10 h-10 mx-auto rounded-xl bg-gradient-to-br ${levelInfo.color} flex items-center justify-center shadow-lg`}>
            <span className="text-white font-bold text-sm">{levelInfo.level}</span>
          </div>
          <div className={`mt-2 h-1 rounded-full ${darkMode ? 'bg-white/10' : 'bg-gray-200'}`}>
            <div 
              className={`h-full bg-gradient-to-r ${levelInfo.color} rounded-full`}
              style={{ width: `${levelInfo.progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-6 overflow-y-auto scrollbar-thin scrollbar-thumb-purple-500/20 scrollbar-track-transparent">
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
          <div className="mb-3 p-4 rounded-xl bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-orange-500/10 border border-purple-500/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-yellow-400/20 to-orange-500/20 rounded-full blur-xl" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-2">
                <Crown className="w-5 h-5 text-yellow-400" />
                <span className={`font-semibold text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Стать PRO
                </span>
                <span className="px-1.5 py-0.5 text-[10px] font-bold bg-yellow-400/20 text-yellow-500 rounded">
                  -50%
                </span>
              </div>
              <p className={`text-xs mb-3 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Безлимитные квизы, без рекламы, эксклюзивные темы
              </p>
              <button className="w-full py-2 px-3 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 text-white text-sm font-medium rounded-lg hover:opacity-90 transition-all hover:shadow-lg hover:shadow-purple-500/25 active:scale-[0.98]">
                Улучшить план
              </button>
            </div>
          </div>
        )}

        {/* Toggle & Logout */}
        <div className="flex items-center gap-2">
          <button
            onClick={onToggle}
            className={`
              flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg transition-all
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
              p-2.5 rounded-lg transition-all hover:scale-105 active:scale-95
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

      {/* Custom CSS for shimmer animation */}
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </aside>
  );
};

export default Sidebar;
