import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart3, 
  TrendingUp, 
  Trophy, 
  Target, 
  Clock, 
  CheckCircle,
  XCircle,
  Percent,
  Calendar,
  Award,
  Flame,
  Star,
  Brain,
  Zap,
  BookOpen,
  Loader2
} from 'lucide-react';
import { userAPI } from '../../services/api';

const Stats = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [timeRange, setTimeRange] = useState('all');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await userAPI.getUserStats();
      setStats(response.data.data);
    } catch (err) {
      console.error('Error fetching stats:', err);
      // Используем моковые данные если API не работает
      setStats({
        totalPoints: 2450,
        quizzesCompleted: 34,
        quizzesCreated: 8,
        correctAnswers: 287,
        wrongAnswers: 63,
        averageScore: 82,
        totalTimePlayed: 4520,
        longestStreak: 12,
        currentStreak: 5,
        bestCategory: 'science',
        weeklyProgress: [65, 78, 82, 70, 90, 85, 88],
        categoryStats: [
          { category: 'Наука', completed: 12, avgScore: 85 },
          { category: 'История', completed: 8, avgScore: 78 },
          { category: 'География', completed: 6, avgScore: 92 },
          { category: 'Технологии', completed: 5, avgScore: 88 },
          { category: 'Спорт', completed: 3, avgScore: 70 },
        ]
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
    if (points >= 10000) return { level: 10, name: 'Легенда', color: 'from-yellow-400 to-amber-600' };
    if (points >= 7500) return { level: 9, name: 'Грандмастер', color: 'from-purple-400 to-pink-600' };
    if (points >= 5000) return { level: 8, name: 'Мастер', color: 'from-red-400 to-rose-600' };
    if (points >= 3500) return { level: 7, name: 'Эксперт', color: 'from-orange-400 to-red-500' };
    if (points >= 2500) return { level: 6, name: 'Профессионал', color: 'from-blue-400 to-indigo-600' };
    if (points >= 1500) return { level: 5, name: 'Знаток', color: 'from-cyan-400 to-blue-500' };
    if (points >= 1000) return { level: 4, name: 'Умелец', color: 'from-green-400 to-emerald-600' };
    if (points >= 500) return { level: 3, name: 'Ученик', color: 'from-lime-400 to-green-500' };
    if (points >= 200) return { level: 2, name: 'Новичок', color: 'from-gray-400 to-gray-600' };
    return { level: 1, name: 'Начинающий', color: 'from-gray-300 to-gray-500' };
  };

  const getNextLevelPoints = (points) => {
    const levels = [0, 200, 500, 1000, 1500, 2500, 3500, 5000, 7500, 10000];
    for (let i = 0; i < levels.length; i++) {
      if (points < levels[i]) return levels[i];
    }
    return levels[levels.length - 1];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
        <span className="ml-3 text-gray-600 dark:text-gray-400">Загрузка статистики...</span>
      </div>
    );
  }

  const levelInfo = getLevel(stats?.totalPoints || 0);
  const nextLevelPoints = getNextLevelPoints(stats?.totalPoints || 0);
  const progressToNextLevel = ((stats?.totalPoints || 0) / nextLevelPoints) * 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">Статистика</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Отслеживай свой прогресс и достижения</p>
        </div>
        
        {/* Time Range Selector */}
        <div className="flex items-center gap-2 p-1 rounded-xl bg-gray-100 dark:bg-white/5">
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

      {/* Level Card */}
      <div className={`relative p-6 rounded-2xl bg-gradient-to-br ${levelInfo.color} overflow-hidden`}>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
              <span className="text-4xl font-bold text-white">{levelInfo.level}</span>
            </div>
            <div>
              <p className="text-white/80 text-sm font-medium">Текущий уровень</p>
              <h2 className="text-3xl font-bold text-white">{levelInfo.name}</h2>
              <p className="text-white/80 text-sm mt-1">{stats?.totalPoints || 0} очков</p>
            </div>
          </div>
          
          <div className="flex-1 max-w-md">
            <div className="flex justify-between text-white/80 text-sm mb-2">
              <span>Прогресс до следующего уровня</span>
              <span>{nextLevelPoints - (stats?.totalPoints || 0)} очков осталось</span>
            </div>
            <div className="h-4 bg-white/20 rounded-full overflow-hidden">
              <div 
                className="h-full bg-white rounded-full transition-all duration-500"
                style={{ width: `${Math.min(progressToNextLevel, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10">
          <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center mb-3">
            <Trophy className="text-purple-500" size={24} />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.totalPoints || 0}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Всего очков</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10">
          <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center mb-3">
            <Target className="text-green-500" size={24} />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.quizzesCompleted || 0}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Квизов пройдено</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10">
          <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center mb-3">
            <Percent className="text-blue-500" size={24} />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.averageScore || 0}%</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Средний балл</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10">
          <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center mb-3">
            <Flame className="text-orange-500" size={24} />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.currentStreak || 0}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Серия дней</p>
        </div>
      </div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Answers Breakdown */}
        <div className="p-6 rounded-2xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <BarChart3 size={20} className="text-purple-500" />
            Статистика ответов
          </h3>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="flex items-center gap-2 text-green-600 dark:text-green-400">
                  <CheckCircle size={16} /> Правильные
                </span>
                <span className="text-gray-900 dark:text-white font-bold">{stats?.correctAnswers || 0}</span>
              </div>
              <div className="h-3 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-green-500 rounded-full"
                  style={{ 
                    width: `${((stats?.correctAnswers || 0) / ((stats?.correctAnswers || 0) + (stats?.wrongAnswers || 1))) * 100}%` 
                  }}
                />
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="flex items-center gap-2 text-red-600 dark:text-red-400">
                  <XCircle size={16} /> Неправильные
                </span>
                <span className="text-gray-900 dark:text-white font-bold">{stats?.wrongAnswers || 0}</span>
              </div>
              <div className="h-3 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-red-500 rounded-full"
                  style={{ 
                    width: `${((stats?.wrongAnswers || 0) / ((stats?.correctAnswers || 0) + (stats?.wrongAnswers || 1))) * 100}%` 
                  }}
                />
              </div>
            </div>
          </div>
          
          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-white/10 grid grid-cols-2 gap-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {stats?.correctAnswers + stats?.wrongAnswers || 0}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Всего ответов</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-purple-500">
                {Math.round(((stats?.correctAnswers || 0) / ((stats?.correctAnswers || 0) + (stats?.wrongAnswers || 1))) * 100)}%
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Точность</p>
            </div>
          </div>
        </div>

        {/* Category Stats */}
        <div className="p-6 rounded-2xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <BookOpen size={20} className="text-purple-500" />
            По категориям
          </h3>
          
          <div className="space-y-3">
            {stats?.categoryStats?.map((cat, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-900 dark:text-white font-medium">{cat.category}</span>
                    <span className="text-gray-600 dark:text-gray-400">{cat.completed} квизов</span>
                  </div>
                  <div className="h-2 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                      style={{ width: `${cat.avgScore}%` }}
                    />
                  </div>
                </div>
                <span className="text-sm font-bold text-purple-500 w-12 text-right">{cat.avgScore}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Time & Streaks */}
        <div className="p-6 rounded-2xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Clock size={20} className="text-purple-500" />
            Время и серии
          </h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-gray-50 dark:bg-white/5 text-center">
              <Clock className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {formatTime(stats?.totalTimePlayed || 0)}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Время в игре</p>
            </div>
            <div className="p-4 rounded-xl bg-gray-50 dark:bg-white/5 text-center">
              <Flame className="w-8 h-8 text-orange-500 mx-auto mb-2" />
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {stats?.longestStreak || 0} дней
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Лучшая серия</p>
            </div>
            <div className="p-4 rounded-xl bg-gray-50 dark:bg-white/5 text-center">
              <BookOpen className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {stats?.quizzesCreated || 0}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Создано квизов</p>
            </div>
            <div className="p-4 rounded-xl bg-gray-50 dark:bg-white/5 text-center">
              <Zap className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
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
            <TrendingUp size={20} className="text-purple-500" />
            Прогресс за неделю
          </h3>
          
          <div className="flex items-end justify-between h-40 gap-2">
            {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map((day, index) => (
              <div key={day} className="flex-1 flex flex-col items-center gap-2">
                <div 
                  className="w-full bg-gradient-to-t from-purple-500 to-pink-500 rounded-t-lg transition-all"
                  style={{ height: `${stats?.weeklyProgress?.[index] || 0}%` }}
                />
                <span className="text-xs text-gray-600 dark:text-gray-400">{day}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 text-center">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          Хочешь улучшить статистику?
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Проходи больше квизов и зарабатывай очки!
        </p>
        <button
          onClick={() => navigate('/quick-play')}
          className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-xl 
                   shadow-lg shadow-purple-500/30 hover:shadow-xl transition-all"
        >
          Начать играть
        </button>
      </div>
    </div>
  );
};

export default Stats;
