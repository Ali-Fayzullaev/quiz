import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { userAPI } from '../../services/api';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  RadialBarChart,
  RadialBar,
  Legend,
  LineChart,
  Line
} from 'recharts';
import { 
  BookOpen, 
  Target, 
  Trophy, 
  Heart,
  Eye,
  Play,
  TrendingUp,
  TrendingDown,
  Zap,
  Award,
  Flame,
  Star,
  Calendar,
  Clock,
  ChevronRight,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  Sparkles,
  Crown,
  Gamepad2,
  Brain,
  Users,
  ArrowUpRight,
  MoreHorizontal
} from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [likedQuizzes, setLikedQuizzes] = useState([]);
  const [recentResults, setRecentResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeChartTab, setActiveChartTab] = useState('performance');
  const [chartPeriod, setChartPeriod] = useState('week');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      const [profileRes, statsRes, quizzesRes, likedRes, resultsRes] = await Promise.allSettled([
        userAPI.getProfile(),
        userAPI.getUserStats(),
        userAPI.getUserQuizzes(),
        userAPI.getLikedQuizzes(),
        userAPI.getUserResults()
      ]);

      if (profileRes.status === 'fulfilled') {
        setUser(profileRes.value.data.data?.user || profileRes.value.data.data);
      }
      if (statsRes.status === 'fulfilled') {
        setStats(statsRes.value.data.data);
      }
      if (quizzesRes.status === 'fulfilled') {
        const data = quizzesRes.value.data.data;
        setQuizzes(Array.isArray(data) ? data : data?.quizzes || []);
      }
      if (likedRes.status === 'fulfilled') {
        setLikedQuizzes(likedRes.value.data.data?.quizzes || []);
      }
      if (resultsRes.status === 'fulfilled') {
        setRecentResults(resultsRes.value.data.data?.results || []);
      }
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-purple-500/30 rounded-full" />
            <div className="absolute inset-0 w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
          </div>
          <p className={`text-lg font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Загрузка данных...</p>
        </div>
      </div>
    );
  }

  // Данные для графиков
  const totalPoints = stats?.totalPoints || user?.gameStats?.totalPoints || 0;
  const completedCount = stats?.quizzesCompleted || user?.gameStats?.quizzesCompleted || 0;
  const level = user?.gameStats?.level || Math.floor(totalPoints / 1000) + 1;
  const experience = user?.gameStats?.experience || totalPoints % 1000;
  const currentStreak = user?.gameStats?.currentStreak || 0;
  const bestStreak = user?.gameStats?.bestStreak || 0;

  const totalViews = quizzes.reduce((acc, q) => acc + (q.stats?.views || 0), 0);
  const totalPlays = quizzes.reduce((acc, q) => acc + (q.stats?.plays || 0), 0);

  // Данные для графика производительности
  const performanceData = recentResults.slice(0, 7).map((result, index) => ({
    name: new Date(result.completedAt || result.createdAt).toLocaleDateString('ru-RU', { 
      day: '2-digit', 
      month: 'short' 
    }),
    score: result.percentage || result.score || 0,
    points: result.pointsEarned || Math.round((result.percentage || 0) * 10),
    time: Math.round((result.timeSpent || 0) / 60)
  })).reverse();

  // Заполнить пустые данные
  const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
  const chartData = performanceData.length > 0 ? performanceData : weekDays.map(day => ({
    name: day,
    score: Math.floor(Math.random() * 40) + 60,
    points: Math.floor(Math.random() * 200) + 50,
    time: Math.floor(Math.random() * 10) + 2
  }));

  // Данные по категориям
  const categoryData = quizzes.reduce((acc, quiz) => {
    const category = quiz.category || 'other';
    const existing = acc.find(item => item.name === category);
    if (existing) {
      existing.value += 1;
      existing.plays += quiz.stats?.plays || 0;
    } else {
      acc.push({ 
        name: category, 
        value: 1, 
        plays: quiz.stats?.plays || 0 
      });
    }
    return acc;
  }, []);

  const categoryNames = {
    general: 'Общие',
    science: 'Наука',
    history: 'История',
    geography: 'География',
    sports: 'Спорт',
    entertainment: 'Развлечения',
    technology: 'Технологии',
    other: 'Другое'
  };

  const COLORS = [
    '#a855f7', '#ec4899', '#06b6d4', '#f59e0b', 
    '#10b981', '#6366f1', '#ef4444', '#84cc16'
  ];

  // Данные для радиального графика
  const skillsData = [
    { name: 'Точность', value: Math.min(100, Math.round(completedCount > 0 ? (totalPoints / completedCount / 10) : 75)), fill: '#a855f7' },
    { name: 'Скорость', value: Math.min(100, Math.round(70 + Math.random() * 20)), fill: '#ec4899' },
    { name: 'Знания', value: Math.min(100, Math.round(level * 8)), fill: '#06b6d4' },
    { name: 'Активность', value: Math.min(100, Math.round(completedCount * 5)), fill: '#10b981' },
  ];

  // Статистические карточки
  const statsCards = [
    {
      label: 'Создано квизов',
      value: quizzes.length,
      change: '+' + Math.max(1, Math.floor(quizzes.length * 0.1)),
      positive: true,
      icon: BookOpen,
      gradient: 'from-blue-500 to-cyan-500',
      bgGlow: 'bg-blue-500'
    },
    {
      label: 'Пройдено',
      value: completedCount,
      change: '+' + Math.max(1, Math.floor(completedCount * 0.08)),
      positive: true,
      icon: Target,
      gradient: 'from-emerald-500 to-teal-500',
      bgGlow: 'bg-emerald-500'
    },
    {
      label: 'Всего очков',
      value: totalPoints.toLocaleString(),
      change: '+' + Math.max(100, Math.floor(totalPoints * 0.05)).toLocaleString(),
      positive: true,
      icon: Trophy,
      gradient: 'from-amber-500 to-orange-500',
      bgGlow: 'bg-amber-500'
    },
    {
      label: 'Уровень',
      value: level,
      change: `${experience}/1000 XP`,
      positive: true,
      icon: Crown,
      gradient: 'from-purple-500 to-pink-500',
      bgGlow: 'bg-purple-500'
    },
  ];

  const savedUser = JSON.parse(localStorage.getItem('user') || '{}');
  const displayName = user?.profile?.firstName || user?.username || savedUser?.username || 'Пользователь';
  const avatar = user?.profile?.avatar.url;

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className={`backdrop-blur-xl rounded-2xl p-4 border shadow-2xl ${
          darkMode 
            ? 'bg-gray-900/90 border-white/20' 
            : 'bg-white/90 border-gray-200'
        }`}>
          <p className={`text-sm font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{label}</p>
          {payload.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {item.name}: <span className="font-semibold" style={{ color: item.color }}>{item.value}</span>
              </p>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8 pb-8">
      {/* Welcome Header */}
      <div className={`relative overflow-hidden rounded-3xl p-8 ${
        darkMode 
          ? 'bg-gradient-to-br from-purple-900/50 via-pink-900/30 to-blue-900/50 border border-white/10' 
          : 'bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100 border border-purple-200/50'
      }`}>
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-purple-500 rounded-full blur-3xl opacity-20" />
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-pink-500 rounded-full blur-3xl opacity-20" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500 rounded-full blur-3xl opacity-10" />
        </div>

        <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            {/* Avatar with Level Ring */}
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 rounded-full blur opacity-75 animate-pulse" />
              <div className={`relative w-20 h-20 rounded-full overflow-hidden border-4 ${
                darkMode ? 'border-gray-800' : 'border-white'
              }`}>
                {avatar ? (
                  <img src={avatar} alt={displayName} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-2xl font-bold">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-white dark:border-gray-800 shadow-lg">
                {level}
              </div>
            </div>

            <div>
              <p className={`text-sm font-medium ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                Добро пожаловать! 👋
              </p>
              <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {displayName}
              </h1>
              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-orange-500" />
                  <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {currentStreak} дней подряд
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Trophy className="w-4 h-4 text-amber-500" />
                  <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Лучшая серия: {bestStreak}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* XP Progress */}
          <div className={`w-full md:w-72 p-4 rounded-2xl backdrop-blur-sm ${
            darkMode ? 'bg-white/5 border border-white/10' : 'bg-white/70 border border-white'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Прогресс уровня
              </span>
              <span className={`text-sm font-bold ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                {experience} / 1000 XP
              </span>
            </div>
            <div className={`h-3 rounded-full overflow-hidden ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
              <div 
                className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 rounded-full transition-all duration-500 relative overflow-hidden"
                style={{ width: `${(experience / 1000) * 100}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
              </div>
            </div>
            <p className={`text-xs mt-2 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
              Ещё {1000 - experience} XP до уровня {level + 1}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className={`group relative overflow-hidden rounded-2xl p-5 transition-all duration-500 hover:scale-[1.02] cursor-pointer ${
                darkMode 
                  ? 'bg-white/5 border border-white/10 hover:border-white/20' 
                  : 'bg-white border border-gray-200 hover:shadow-xl hover:shadow-gray-200/50'
              }`}
            >
              {/* Glow Effect */}
              <div className={`absolute -top-12 -right-12 w-24 h-24 ${stat.bgGlow} rounded-full blur-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-500`} />
              
              <div className="relative">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.gradient} shadow-lg`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
                    stat.positive 
                      ? darkMode ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-600' 
                      : darkMode ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-600'
                  }`}>
                    {stat.positive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {stat.change}
                  </div>
                </div>
                <div>
                  <h3 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {stat.value}
                  </h3>
                  <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {stat.label}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Charts Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Performance Chart */}
        <div className={`xl:col-span-2 rounded-3xl p-6 ${
          darkMode 
            ? 'bg-white/5 border border-white/10' 
            : 'bg-white border border-gray-200 shadow-sm'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Аналитика
              </h3>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Ваши результаты и прогресс
              </p>
            </div>
            
            {/* Tabs */}
            <div className={`flex rounded-xl p-1 ${darkMode ? 'bg-white/5' : 'bg-gray-100'}`}>
              {[
                { id: 'performance', label: 'Результаты', icon: Activity },
                { id: 'categories', label: 'Категории', icon: PieChartIcon },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveChartTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                    activeChartTab === tab.id
                      ? darkMode 
                        ? 'bg-purple-500/20 text-purple-400 shadow-lg shadow-purple-500/10' 
                        : 'bg-white text-purple-600 shadow-md'
                      : darkMode 
                        ? 'text-gray-400 hover:text-white' 
                        : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Period Filter */}
          {activeChartTab === 'performance' && (
            <div className="flex gap-2 mb-6">
              {[
                { id: 'week', label: 'Неделя' },
                { id: 'month', label: 'Месяц' },
                { id: 'year', label: 'Год' }
              ].map((period) => (
                <button
                  key={period.id}
                  onClick={() => setChartPeriod(period.id)}
                  className={`px-4 py-1.5 text-sm font-medium rounded-full transition-all ${
                    chartPeriod === period.id
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/25'
                      : darkMode 
                        ? 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white' 
                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700'
                  }`}
                >
                  {period.label}
                </button>
              ))}
            </div>
          )}

          {/* Chart */}
          <div className="h-80">
            {activeChartTab === 'performance' ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#a855f7" stopOpacity={0.4}/>
                      <stop offset="50%" stopColor="#ec4899" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorPoints" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid 
                    strokeDasharray="3 3" 
                    stroke={darkMode ? '#374151' : '#e5e7eb'} 
                    vertical={false}
                  />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: darkMode ? '#9ca3af' : '#6b7280', fontSize: 12 }}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: darkMode ? '#9ca3af' : '#6b7280', fontSize: 12 }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="score"
                    name="Результат %"
                    stroke="#a855f7"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorScore)"
                  />
                  <Area
                    type="monotone"
                    dataKey="points"
                    name="Очки"
                    stroke="#06b6d4"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorPoints)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center h-full gap-8">
                {/* Pie Chart */}
                <div className="w-1/2 h-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <defs>
                        {COLORS.map((color, index) => (
                          <linearGradient key={index} id={`gradient-${index}`} x1="0" y1="0" x2="1" y2="1">
                            <stop offset="0%" stopColor={color} stopOpacity={1}/>
                            <stop offset="100%" stopColor={color} stopOpacity={0.7}/>
                          </linearGradient>
                        ))}
                      </defs>
                      <Pie
                        data={categoryData.length ? categoryData : [{ name: 'Нет данных', value: 1 }]}
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={110}
                        paddingAngle={3}
                        dataKey="value"
                        stroke="none"
                      >
                        {categoryData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={`url(#gradient-${index % COLORS.length})`}
                            className="drop-shadow-lg"
                          />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                
                {/* Legend */}
                <div className="w-1/2 space-y-3">
                  <h4 className={`text-sm font-semibold mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Распределение по категориям
                  </h4>
                  {(categoryData.length ? categoryData : [{ name: 'general', value: 0 }]).slice(0, 6).map((item, index) => (
                    <div 
                      key={item.name} 
                      className={`flex items-center justify-between p-3 rounded-xl transition-colors ${
                        darkMode ? 'hover:bg-white/5' : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-4 h-4 rounded-lg shadow-lg"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          {categoryNames[item.name] || item.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {item.value}
                        </span>
                        <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                          квизов
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Skills Radar / Progress */}
        <div className={`rounded-3xl p-6 ${
          darkMode 
            ? 'bg-white/5 border border-white/10' 
            : 'bg-white border border-gray-200 shadow-sm'
        }`}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Навыки
              </h3>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Ваш профиль умений
              </p>
            </div>
            <button className={`p-2 rounded-xl transition-colors ${
              darkMode ? 'hover:bg-white/10' : 'hover:bg-gray-100'
            }`}>
              <MoreHorizontal className={darkMode ? 'text-gray-400' : 'text-gray-500'} size={20} />
            </button>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart 
                cx="50%" 
                cy="50%" 
                innerRadius="30%" 
                outerRadius="90%" 
                data={skillsData}
                startAngle={90}
                endAngle={-270}
              >
                <RadialBar
                  minAngle={15}
                  background={{ fill: darkMode ? '#1f2937' : '#f3f4f6' }}
                  clockWise
                  dataKey="value"
                  cornerRadius={10}
                />
                <Tooltip content={<CustomTooltip />} />
              </RadialBarChart>
            </ResponsiveContainer>
          </div>

          {/* Skills Legend */}
          <div className="grid grid-cols-2 gap-3 mt-4">
            {skillsData.map((skill, index) => (
              <div 
                key={skill.name}
                className={`flex items-center gap-2 p-2 rounded-xl ${
                  darkMode ? 'bg-white/5' : 'bg-gray-50'
                }`}
              >
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: skill.fill }}
                />
                <div className="flex-1 min-w-0">
                  <p className={`text-xs truncate ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {skill.name}
                  </p>
                  <p className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {skill.value}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className={`xl:col-span-2 rounded-3xl p-6 ${
          darkMode 
            ? 'bg-white/5 border border-white/10' 
            : 'bg-white border border-gray-200 shadow-sm'
        }`}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Недавняя активность
              </h3>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Последние пройденные квизы
              </p>
            </div>
            <button 
              onClick={() => navigate('/stats')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                darkMode 
                  ? 'bg-white/5 text-gray-300 hover:bg-white/10' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Все результаты
              <ChevronRight size={16} />
            </button>
          </div>

          <div className="space-y-3">
            {recentResults.slice(0, 5).length > 0 ? (
              recentResults.slice(0, 5).map((result, index) => (
                <div 
                  key={result._id || index}
                  className={`flex items-center gap-4 p-4 rounded-2xl transition-all hover:scale-[1.01] cursor-pointer ${
                    darkMode 
                      ? 'bg-white/5 hover:bg-white/10' 
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    (result.percentage || 0) >= 80 
                      ? 'bg-gradient-to-br from-emerald-500 to-teal-500' 
                      : (result.percentage || 0) >= 50 
                        ? 'bg-gradient-to-br from-amber-500 to-orange-500' 
                        : 'bg-gradient-to-br from-red-500 to-pink-500'
                  }`}>
                    <span className="text-white font-bold">{result.percentage || 0}%</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className={`font-semibold truncate ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {result.quiz?.title || 'Квиз'}
                    </h4>
                    <div className="flex items-center gap-3 mt-1">
                      <span className={`text-xs flex items-center gap-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        <Target size={12} />
                        {result.correctAnswers || 0}/{result.totalQuestions || 0}
                      </span>
                      <span className={`text-xs flex items-center gap-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        <Clock size={12} />
                        {Math.round((result.timeSpent || 0) / 60)} мин
                      </span>
                      <span className={`text-xs flex items-center gap-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        <Calendar size={12} />
                        {new Date(result.completedAt || result.createdAt).toLocaleDateString('ru-RU')}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                      darkMode ? 'bg-purple-500/20 text-purple-400' : 'bg-purple-100 text-purple-600'
                    }`}>
                      +{result.pointsEarned || Math.round((result.percentage || 0) * 10)} XP
                    </div>
                    <ChevronRight className={darkMode ? 'text-gray-600' : 'text-gray-400'} size={20} />
                  </div>
                </div>
              ))
            ) : (
              <div className={`text-center py-12 rounded-2xl ${darkMode ? 'bg-white/5' : 'bg-gray-50'}`}>
                <Brain className={`w-16 h-16 mx-auto mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
                <p className={`font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Пока нет активности
                </p>
                <p className={`text-sm mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                  Начните проходить квизы, чтобы увидеть статистику
                </p>
                <button
                  onClick={() => navigate('/quick-play')}
                  className="mt-4 px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium rounded-xl hover:opacity-90 transition-opacity"
                >
                  Начать игру
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className={`rounded-3xl p-6 ${
          darkMode 
            ? 'bg-white/5 border border-white/10' 
            : 'bg-white border border-gray-200 shadow-sm'
        }`}>
          <h3 className={`text-xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Быстрые действия
          </h3>

          <div className="space-y-3">
            {[
              { 
                icon: Play, 
                label: 'Быстрая игра', 
                desc: 'Начать случайный квиз',
                gradient: 'from-purple-500 to-pink-500',
                path: '/quick-play'
              },
              { 
                icon: BookOpen, 
                label: 'Создать квиз', 
                desc: 'Новая викторина',
                gradient: 'from-blue-500 to-cyan-500',
                path: '/create-quiz'
              },
              { 
                icon: Gamepad2, 
                label: 'Мини-игры', 
                desc: 'Развлекательные игры',
                gradient: 'from-emerald-500 to-teal-500',
                path: '/games'
              },
              { 
                icon: Award, 
                label: 'Достижения', 
                desc: 'Ваши награды',
                gradient: 'from-amber-500 to-orange-500',
                path: '/achievements'
              },
              { 
                icon: BarChart3, 
                label: 'Статистика', 
                desc: 'Подробная аналитика',
                gradient: 'from-indigo-500 to-purple-500',
                path: '/stats'
              },
            ].map((action, index) => {
              const Icon = action.icon;
              return (
                <button
                  key={index}
                  onClick={() => navigate(action.path)}
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all hover:scale-[1.02] ${
                    darkMode 
                      ? 'bg-white/5 hover:bg-white/10' 
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.gradient} flex items-center justify-center shadow-lg`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 text-left">
                    <h4 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {action.label}
                    </h4>
                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {action.desc}
                    </p>
                  </div>
                  <ArrowUpRight className={`${darkMode ? 'text-gray-600' : 'text-gray-400'}`} size={18} />
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* CSS for shimmer animation */}
      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
