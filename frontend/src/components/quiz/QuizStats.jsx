import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { quizAPI } from '../../services/api';
import { 
  ArrowLeft, 
  Eye, 
  Gamepad2, 
  CheckCircle, 
  XCircle, 
  TrendingUp, 
  Star, 
  Clock, 
  Heart,
  Trophy,
  BarChart3,
  Users,
  Loader2,
  AlertCircle,
  Calendar
} from 'lucide-react';

const QuizStats = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStats();
  }, [id]);

  const fetchStats = async () => {
    try {
      const response = await quizAPI.getStats(id);
      setStats(response.data.data);
    } catch (err) {
      console.error('Ошибка загрузки статистики:', err);
      if (err.response?.status === 403) {
        setError('У вас нет доступа к статистике этого квиза');
      } else {
        setError('Ошибка загрузки статистики');
      }
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    if (!seconds) return '0 сек';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins > 0) {
      return `${mins} мин ${secs} сек`;
    }
    return `${secs} сек`;
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-purple-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Загрузка статистики...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center p-8 rounded-2xl bg-white/5 border border-white/10 max-w-md">
          <div className="w-16 h-16 rounded-2xl bg-red-500/20 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="text-red-400" size={32} />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Ошибка</h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <button 
            onClick={() => navigate('/my-quizzes')}
            className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl transition-colors flex items-center gap-2 mx-auto"
          >
            <ArrowLeft size={18} />
            Назад к моим квизам
          </button>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const { quiz, statistics, scoreDistribution, topResults, recentResults } = stats;

  const statCards = [
    { icon: Eye, value: quiz.views || 0, label: 'Просмотров', color: 'text-blue-400', bg: 'bg-blue-500/20' },
    { icon: Gamepad2, value: statistics.totalAttempts, label: 'Прохождений', color: 'text-purple-400', bg: 'bg-purple-500/20' },
    { icon: CheckCircle, value: statistics.passedCount, label: 'Прошли', color: 'text-green-400', bg: 'bg-green-500/20' },
    { icon: XCircle, value: statistics.failedCount, label: 'Не прошли', color: 'text-red-400', bg: 'bg-red-500/20' },
    { icon: TrendingUp, value: `${statistics.passRate}%`, label: 'Успешность', color: 'text-cyan-400', bg: 'bg-cyan-500/20' },
    { icon: Star, value: `${statistics.averageScore}%`, label: 'Средний балл', color: 'text-yellow-400', bg: 'bg-yellow-500/20' },
    { icon: Clock, value: formatTime(statistics.averageTime), label: 'Среднее время', color: 'text-orange-400', bg: 'bg-orange-500/20' },
    { icon: Heart, value: quiz.likes || 0, label: 'Лайков', color: 'text-pink-400', bg: 'bg-pink-500/20' },
  ];

  const distributionData = [
    { label: 'Отлично', range: '90-100%', count: scoreDistribution.excellent, color: 'bg-green-500', icon: '🏆' },
    { label: 'Хорошо', range: '70-89%', count: scoreDistribution.good, color: 'bg-blue-500', icon: '👍' },
    { label: 'Средне', range: '50-69%', count: scoreDistribution.average, color: 'bg-yellow-500', icon: '😐' },
    { label: 'Плохо', range: '0-49%', count: scoreDistribution.poor, color: 'bg-red-500', icon: '👎' },
  ];

  const total = statistics.totalAttempts || 1;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <button 
            onClick={() => navigate('/my-quizzes')}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-2"
          >
            <ArrowLeft size={18} />
            <span>К моим квизам</span>
          </button>
          <h1 className="text-2xl lg:text-3xl font-bold text-white">Статистика квиза</h1>
          <p className="text-gray-400 mt-1">{quiz.title}</p>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-lg bg-purple-500/20 text-purple-400 text-sm font-medium flex items-center gap-2">
            <BarChart3 size={16} />
            Аналитика
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <div key={index} className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/[0.07] transition-colors">
            <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mb-3`}>
              <stat.icon className={stat.color} size={20} />
            </div>
            <div className="text-2xl font-bold text-white">{stat.value}</div>
            <div className="text-sm text-gray-400">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Score Distribution */}
      <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <BarChart3 size={20} className="text-purple-400" />
          Распределение результатов
        </h2>
        
        <div className="space-y-4">
          {distributionData.map((item, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{item.icon}</span>
                  <span className="text-white font-medium">{item.label}</span>
                  <span className="text-gray-500 text-sm">({item.range})</span>
                </div>
                <span className="text-gray-300 font-medium">{item.count}</span>
              </div>
              <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${item.color} rounded-full transition-all duration-500`}
                  style={{ width: `${(item.count / total) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Results */}
      {topResults.length > 0 && (
        <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Trophy size={20} className="text-yellow-400" />
            Топ-10 лучших результатов
          </h2>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left text-gray-400 font-medium text-sm py-3 px-2">#</th>
                  <th className="text-left text-gray-400 font-medium text-sm py-3 px-2">Пользователь</th>
                  <th className="text-left text-gray-400 font-medium text-sm py-3 px-2">Баллы</th>
                  <th className="text-left text-gray-400 font-medium text-sm py-3 px-2">Процент</th>
                  <th className="text-left text-gray-400 font-medium text-sm py-3 px-2 hidden sm:table-cell">Время</th>
                  <th className="text-left text-gray-400 font-medium text-sm py-3 px-2 hidden md:table-cell">Дата</th>
                </tr>
              </thead>
              <tbody>
                {topResults.map((result, index) => (
                  <tr key={result._id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="py-3 px-2">
                      {index === 0 && <span className="text-xl">🥇</span>}
                      {index === 1 && <span className="text-xl">🥈</span>}
                      {index === 2 && <span className="text-xl">🥉</span>}
                      {index > 2 && <span className="text-gray-400">{index + 1}</span>}
                    </td>
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-medium text-sm">
                          {(result.user?.username || 'A')[0].toUpperCase()}
                        </div>
                        <span className="text-white font-medium">{result.user?.username || 'Аноним'}</span>
                      </div>
                    </td>
                    <td className="py-3 px-2 text-gray-300">{result.score}/{result.maxPossibleScore}</td>
                    <td className="py-3 px-2">
                      <span className={`px-2 py-1 rounded-md text-sm font-medium ${
                        result.percentage >= 90 ? 'bg-green-500/20 text-green-400' :
                        result.percentage >= 70 ? 'bg-blue-500/20 text-blue-400' :
                        result.percentage >= 50 ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {result.percentage.toFixed(1)}%
                      </span>
                    </td>
                    <td className="py-3 px-2 text-gray-400 hidden sm:table-cell">{formatTime(result.timeSpent)}</td>
                    <td className="py-3 px-2 text-gray-400 hidden md:table-cell">{formatDate(result.endTime || result.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Recent Results */}
      {recentResults.length > 0 && (
        <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Users size={20} className="text-purple-400" />
            Последние прохождения
          </h2>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentResults.map((result) => (
              <div 
                key={result._id} 
                className={`p-4 rounded-xl border transition-colors ${
                  result.passed 
                    ? 'bg-green-500/5 border-green-500/20 hover:bg-green-500/10' 
                    : 'bg-red-500/5 border-red-500/20 hover:bg-red-500/10'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white font-medium text-sm">
                      {(result.user?.username || 'A')[0].toUpperCase()}
                    </div>
                    <span className="text-white font-medium">{result.user?.username || 'Аноним'}</span>
                  </div>
                  <span className={`text-lg ${result.passed ? 'text-green-400' : 'text-red-400'}`}>
                    {result.passed ? '✅' : '❌'}
                  </span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm">Результат</span>
                    <span className={`font-bold ${result.passed ? 'text-green-400' : 'text-red-400'}`}>
                      {result.percentage.toFixed(0)}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm">Ответы</span>
                    <span className="text-gray-300">
                      <span className="text-green-400">✓{result.correctAnswers}</span>
                      {' / '}
                      <span className="text-red-400">✗{result.incorrectAnswers}</span>
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm flex items-center gap-1">
                      <Clock size={14} />
                      Время
                    </span>
                    <span className="text-gray-300">{formatTime(result.timeSpent)}</span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-white/10">
                    <span className="text-gray-500 text-xs flex items-center gap-1">
                      <Calendar size={12} />
                      {formatDate(result.completedAt)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Data State */}
      {statistics.totalAttempts === 0 && (
        <div className="p-12 rounded-2xl bg-white/5 border border-white/10 text-center">
          <div className="w-16 h-16 rounded-2xl bg-purple-500/20 flex items-center justify-center mx-auto mb-4">
            <BarChart3 className="text-purple-400" size={32} />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Пока нет данных</h3>
          <p className="text-gray-400">Статистика появится после первого прохождения квиза</p>
        </div>
      )}
    </div>
  );
};

export default QuizStats;
