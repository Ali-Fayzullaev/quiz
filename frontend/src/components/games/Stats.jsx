import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart3, 
  TrendingUp, 
  Target, 
  Clock, 
  CheckCircle,
  XCircle,
  Percent,
  Flame,
  Zap,
  BookOpen,
  Loader2,
  Sparkles,
  Medal,
  ArrowUp,
  Play
} from 'lucide-react';
import { userAPI } from '../../services/api';

const Stats = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [timeRange, setTimeRange] = useState('all');
  const [animateStats, setAnimateStats] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      

      const [profileResponse, quizzesResponse] = await Promise.all([
        userAPI.getProfile(),
        userAPI.getUserQuizzes().catch(() => ({ data: { data: [] } }))
      ]);
      

      
      // Backend возвращает { success: true, data: user }
      const user = profileResponse.data?.data || profileResponse.data?.user || profileResponse.data;
      const gameStats = user?.gameStats;
      
      // Получаем количество созданных квизов
      const quizzes = quizzesResponse.data?.data || quizzesResponse.data?.quizzes || quizzesResponse.data || [];
      const quizzesCreated = Array.isArray(quizzes) ? quizzes.length : 0;
      
      console.log('Stats - Found gameStats:', gameStats);
      console.log('Stats - Quizzes created:', quizzesCreated);
      
      if (gameStats) {
        setStats({
          totalPoints: gameStats.totalPoints || 0,
          quizzesCompleted: gameStats.quizzesCompleted || 0,
          quizzesCreated: quizzesCreated,
          correctAnswers: 0,
          wrongAnswers: 0,
          averageScore: gameStats.averageScore || 0,
          totalTimePlayed: 0,
          longestStreak: gameStats.bestStreak || 0,
          currentStreak: gameStats.currentStreak || 0,
          level: gameStats.level || 1,
          experience: gameStats.experience || 0,
          bestCategory: 'general',
          weeklyProgress: [65, 78, 82, 70, 90, 85, 88],
          categoryStats: [
            { category: 'Наука', completed: 12, avgScore: 85 },
            { category: 'История', completed: 8, avgScore: 78 },
            { category: 'География', completed: 6, avgScore: 92 },
            { category: 'Технологии', completed: 5, avgScore: 88 },
            { category: 'Спорт', completed: 3, avgScore: 70 },
          ]
        });
        console.log('✅ Stats set, points:', gameStats.totalPoints, 'created:', quizzesCreated);
      } else {
        throw new Error('No gameStats found');
      }
    } catch (err) {
      console.error('❌ Error fetching stats:', err);
      // Используем моковые данные если API не работает
      setStats({
        totalPoints: 0,
        quizzesCompleted: 0,
        quizzesCreated: 0,
        correctAnswers: 0,
        wrongAnswers: 0,
        averageScore: 0,
        totalTimePlayed: 0,
        longestStreak: 0,
        currentStreak: 0,
        bestCategory: 'general',
        weeklyProgress: [0, 0, 0, 0, 0, 0, 0],
        categoryStats: []
      });
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}ч ${minutes}м`;
    return `${minutes} мин`;
  };

  const getLevel = (points) => {
    if (points >= 10000) return { level: 9, name: 'Бог квизов', color: 'from-amber-300 via-yellow-400 to-orange-500', icon: '🏆', min: 10000, max: Infinity };
    if (points >= 7500) return { level: 8, name: 'Титан', color: 'from-indigo-400 to-purple-600', icon: '⚡', min: 7500, max: 9999 };
    if (points >= 5000) return { level: 7, name: 'Легенда', color: 'from-yellow-400 to-amber-500', icon: '👑', min: 5000, max: 7499 };
    if (points >= 3500) return { level: 6, name: 'Гуру', color: 'from-pink-400 to-rose-500', icon: '💎', min: 3500, max: 4999 };
    if (points >= 2000) return { level: 5, name: 'Эксперт', color: 'from-orange-400 to-red-500', icon: '🔥', min: 2000, max: 3499 };
    if (points >= 1000) return { level: 4, name: 'Мастер', color: 'from-purple-400 to-pink-500', icon: '⭐', min: 1000, max: 1999 };
    if (points >= 500) return { level: 3, name: 'Знаток', color: 'from-blue-400 to-cyan-500', icon: '🎓', min: 500, max: 999 };
    if (points >= 200) return { level: 2, name: 'Ученик', color: 'from-green-400 to-emerald-500', icon: '📚', min: 200, max: 499 };
    return { level: 1, name: 'Новичок', color: 'from-gray-400 to-gray-500', icon: '🌱', min: 0, max: 199 };
  };

  const getNextLevelPoints = (points) => {
    const levels = [0, 200, 500, 1000, 2000, 3500, 5000, 7500, 10000];
    for (let i = 0; i < levels.length; i++) {
      if (points < levels[i]) return levels[i];
    }
    return levels[levels.length - 1];
  };

  useEffect(() => {
    if (stats) {
      setTimeout(() => setAnimateStats(true), 100);
    }
  }, [stats]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/30 animate-pulse">
            <BarChart3 className="w-8 h-8 text-white" />
          </div>
          <Loader2 className="w-6 h-6 absolute -bottom-1 -right-1 animate-spin text-purple-500" />
        </div>
        <p className="text-gray-600 dark:text-gray-400 font-medium">Загрузка статистики...</p>
      </div>
    );
  }

  const levelInfo = getLevel(stats?.totalPoints || 0);
  const nextLevelPoints = getNextLevelPoints(stats?.totalPoints || 0);
  const currentLevelMin = levelInfo.min || 0;
  const progressToNextLevel = nextLevelPoints > currentLevelMin 
    ? (((stats?.totalPoints || 0) - currentLevelMin) / (nextLevelPoints - currentLevelMin)) * 100 
    : 100;

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/25">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">Статистика</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mt-1 ml-[52px]">Отслеживай свой прогресс и достижения</p>
        </div>
        
        {/* Time Range Selector */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10">
          {['week', 'month', 'all'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                timeRange === range
                  ? 'bg-white dark:bg-white/10 text-purple-600 dark:text-purple-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {range === 'week' ? 'Неделя' : range === 'month' ? 'Месяц' : 'Всё время'}
            </button>
          ))}
        </div>
      </div>

      {/* Level Card - Hero Section */}
      <div className={`relative p-6 md:p-8 rounded-3xl bg-gradient-to-br ${levelInfo.color} overflow-hidden shadow-xl`}>
        {/* Background decorations */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        
        {/* Sparkle effects */}
        <Sparkles className="absolute top-4 right-4 w-6 h-6 text-white/30 animate-pulse" />
        <Sparkles className="absolute bottom-8 right-16 w-4 h-4 text-white/20 animate-pulse" style={{ animationDelay: '0.5s' }} />
        
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            {/* Level Badge */}
            <div className="relative">
              <div className="w-24 h-24 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-2xl border border-white/20">
                <span className="text-5xl">{levelInfo.icon}</span>
              </div>
              <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-lg">
                <span className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-br from-purple-600 to-pink-600">
                  {levelInfo.level}
                </span>
              </div>
            </div>
            
            <div>
              <p className="text-white/70 text-sm font-medium mb-1">Текущий уровень</p>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">{levelInfo.name}</h2>
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-300" />
                <span className="text-2xl font-bold text-white">{(stats?.totalPoints || 0).toLocaleString()}</span>
                <span className="text-white/70 text-sm">XP</span>
              </div>
            </div>
          </div>
          
          {/* Progress to next level */}
          <div className="flex-1 max-w-md">
            <div className="flex justify-between text-white/80 text-sm mb-2">
              <span className="flex items-center gap-1">
                <ArrowUp className="w-4 h-4" />
                До следующего уровня
              </span>
              <span className="font-bold">{(nextLevelPoints - (stats?.totalPoints || 0)).toLocaleString()} XP</span>
            </div>
            <div className="relative h-4 bg-black/20 rounded-full overflow-hidden backdrop-blur-sm">
              <div 
                className="h-full bg-white rounded-full transition-all duration-1000 ease-out relative overflow-hidden"
                style={{ width: animateStats ? `${Math.min(progressToNextLevel, 100)}%` : '0%' }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent animate-shimmer" />
              </div>
            </div>
            <p className="text-white/60 text-xs mt-2 text-right">
              {Math.round(progressToNextLevel)}% завершено
            </p>
          </div>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="group p-5 rounded-2xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 hover:border-purple-500/50 transition-all hover:shadow-lg hover:shadow-purple-500/10">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-600/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <Zap className="text-purple-500" size={24} />
          </div>
          <p className={`text-2xl font-bold text-gray-900 dark:text-white transition-all ${animateStats ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
            {(stats?.totalPoints || 0).toLocaleString()}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Всего XP</p>
        </div>

        <div className="group p-5 rounded-2xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 hover:border-green-500/50 transition-all hover:shadow-lg hover:shadow-green-500/10">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-600/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <Target className="text-green-500" size={24} />
          </div>
          <p className={`text-2xl font-bold text-gray-900 dark:text-white transition-all delay-75 ${animateStats ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
            {stats?.quizzesCompleted || 0}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Квизов пройдено</p>
        </div>

        <div className="group p-5 rounded-2xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 hover:border-blue-500/50 transition-all hover:shadow-lg hover:shadow-blue-500/10">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-600/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <Percent className="text-blue-500" size={24} />
          </div>
          <p className={`text-2xl font-bold text-gray-900 dark:text-white transition-all delay-100 ${animateStats ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
            {stats?.averageScore || 0}%
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Средний балл</p>
        </div>

        <div className="group p-5 rounded-2xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 hover:border-orange-500/50 transition-all hover:shadow-lg hover:shadow-orange-500/10">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500/20 to-red-600/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <Flame className="text-orange-500" size={24} />
          </div>
          <p className={`text-2xl font-bold text-gray-900 dark:text-white transition-all delay-150 ${animateStats ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
            {stats?.currentStreak || 0}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Дней подряд</p>
        </div>
      </div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Answers Breakdown */}
        <div className="p-6 rounded-2xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <BarChart3 size={18} className="text-purple-500" />
            </div>
            Статистика ответов
          </h3>
          
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-green-500/5 border border-green-500/20">
              <div className="flex justify-between items-center mb-2">
                <span className="flex items-center gap-2 text-green-600 dark:text-green-400 font-medium">
                  <CheckCircle size={18} /> Правильные
                </span>
                <span className="text-xl font-bold text-green-600 dark:text-green-400">{stats?.correctAnswers || 0}</span>
              </div>
              <div className="h-3 bg-green-500/20 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full transition-all duration-1000"
                  style={{ 
                    width: animateStats ? `${((stats?.correctAnswers || 0) / ((stats?.correctAnswers || 0) + (stats?.wrongAnswers || 1))) * 100}%` : '0%'
                  }}
                />
              </div>
            </div>
            
            <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/20">
              <div className="flex justify-between items-center mb-2">
                <span className="flex items-center gap-2 text-red-600 dark:text-red-400 font-medium">
                  <XCircle size={18} /> Неправильные
                </span>
                <span className="text-xl font-bold text-red-600 dark:text-red-400">{stats?.wrongAnswers || 0}</span>
              </div>
              <div className="h-3 bg-red-500/20 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-red-400 to-rose-500 rounded-full transition-all duration-1000"
                  style={{ 
                    width: animateStats ? `${((stats?.wrongAnswers || 0) / ((stats?.correctAnswers || 0) + (stats?.wrongAnswers || 1))) * 100}%` : '0%'
                  }}
                />
              </div>
            </div>
          </div>
          
          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-white/10 grid grid-cols-2 gap-4">
            <div className="text-center p-3 rounded-xl bg-gray-50 dark:bg-white/5">
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {(stats?.correctAnswers || 0) + (stats?.wrongAnswers || 0)}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Всего ответов</p>
            </div>
            <div className="text-center p-3 rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10">
              <p className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500">
                {Math.round(((stats?.correctAnswers || 0) / ((stats?.correctAnswers || 0) + (stats?.wrongAnswers || 1))) * 100)}%
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Точность</p>
            </div>
          </div>
        </div>

        {/* Category Stats */}
        <div className="p-6 rounded-2xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <BookOpen size={18} className="text-blue-500" />
            </div>
            По категориям
          </h3>
          
          <div className="space-y-3">
            {stats?.categoryStats?.length > 0 ? stats.categoryStats.map((cat, index) => (
              <div key={index} className="flex items-center gap-4 p-3 rounded-xl bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-gray-900 dark:text-white font-medium">{cat.category}</span>
                    <span className="text-gray-500 dark:text-gray-400">{cat.completed} квизов</span>
                  </div>
                  <div className="h-2 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-1000"
                      style={{ width: animateStats ? `${cat.avgScore}%` : '0%', transitionDelay: `${index * 100}ms` }}
                    />
                  </div>
                </div>
                <div className="w-14 h-10 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                  <span className="text-sm font-bold text-purple-500">{cat.avgScore}%</span>
                </div>
              </div>
            )) : (
              <div className="text-center py-8">
                <BookOpen className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                <p className="text-gray-500 dark:text-gray-400">Пройдите квизы, чтобы увидеть статистику по категориям</p>
              </div>
            )}
          </div>
        </div>

        {/* Time & Streaks */}
        <div className="p-6 rounded-2xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
              <Clock size={18} className="text-amber-500" />
            </div>
            Время и достижения
          </h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 text-center group hover:scale-[1.02] transition-transform">
              <div className="w-12 h-12 mx-auto mb-2 rounded-xl bg-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Clock className="w-6 h-6 text-blue-500" />
              </div>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {formatTime(stats?.totalTimePlayed || 0)}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">В игре</p>
            </div>
            <div className="p-4 rounded-xl bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/20 text-center group hover:scale-[1.02] transition-transform">
              <div className="w-12 h-12 mx-auto mb-2 rounded-xl bg-orange-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Medal className="w-6 h-6 text-orange-500" />
              </div>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {stats?.longestStreak || 0} дней
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Лучшая серия</p>
            </div>
            <div className="p-4 rounded-xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 text-center group hover:scale-[1.02] transition-transform">
              <div className="w-12 h-12 mx-auto mb-2 rounded-xl bg-green-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <BookOpen className="w-6 h-6 text-green-500" />
              </div>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {stats?.quizzesCreated || 0}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Создано</p>
            </div>
            <div className="p-4 rounded-xl bg-gradient-to-br from-yellow-500/10 to-amber-500/10 border border-yellow-500/20 text-center group hover:scale-[1.02] transition-transform">
              <div className="w-12 h-12 mx-auto mb-2 rounded-xl bg-yellow-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Flame className="w-6 h-6 text-yellow-500" />
              </div>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {stats?.currentStreak || 0} дней
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Текущая серия</p>
            </div>
          </div>
        </div>

        {/* Weekly Progress */}
        <div className="p-6 rounded-2xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
              <TrendingUp size={18} className="text-emerald-500" />
            </div>
            Активность за неделю
          </h3>
          
          <div className="flex items-end justify-between h-40 gap-2 pt-4">
            {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map((day, index) => {
              const value = stats?.weeklyProgress?.[index] || 0;
              const isToday = new Date().getDay() === (index === 6 ? 0 : index + 1);
              return (
                <div key={day} className="flex-1 flex flex-col items-center gap-2 group">
                  <div className="w-full h-full flex items-end">
                    <div 
                      className={`w-full rounded-t-lg transition-all duration-700 ease-out relative overflow-hidden ${
                        isToday 
                          ? 'bg-gradient-to-t from-purple-600 to-pink-500' 
                          : 'bg-gradient-to-t from-purple-500/80 to-pink-500/80'
                      }`}
                      style={{ 
                        height: animateStats ? `${value}%` : '0%',
                        transitionDelay: `${index * 50}ms`
                      }}
                    >
                      {value > 0 && (
                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 px-1.5 py-0.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                          {value}%
                        </div>
                      )}
                    </div>
                  </div>
                  <span className={`text-xs font-medium ${
                    isToday 
                      ? 'text-purple-500 dark:text-purple-400' 
                      : 'text-gray-500 dark:text-gray-400'
                  }`}>{day}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="relative p-8 rounded-3xl bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-orange-500/10 border border-purple-500/20 text-center overflow-hidden">
        <div className="absolute top-0 left-1/4 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-32 h-32 bg-pink-500/20 rounded-full blur-3xl" />
        
        <div className="relative">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/20 text-purple-500 dark:text-purple-400 text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4" />
            Продолжай прогресс
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Хочешь улучшить статистику?
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
            Проходи больше квизов, зарабатывай XP и открывай новые уровни!
          </p>
          <button
            onClick={() => navigate('/quick-play')}
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 text-white font-bold rounded-xl 
                     shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Play className="w-5 h-5" />
            Начать играть
          </button>
        </div>
      </div>

      {/* Shimmer animation */}
      <style>{`
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

export default Stats;
