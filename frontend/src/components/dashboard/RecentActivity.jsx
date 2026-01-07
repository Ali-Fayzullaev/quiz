import { Link } from 'react-router-dom';
import { 
  Trophy, 
  Target, 
  Clock, 
  ChevronRight,
  CheckCircle,
  XCircle
} from 'lucide-react';

const RecentActivity = ({ results }) => {
  const formatDate = (date) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now - d;
    
    if (diff < 60000) return 'Только что';
    if (diff < 3600000) return `${Math.floor(diff / 60000)} мин назад`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} ч назад`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)} дн назад`;
    
    return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
  };

  return (
    <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white">Недавняя активность</h3>
          <p className="text-sm text-gray-400">Ваши последние результаты</p>
        </div>
        <Link 
          to="/profile"
          className="flex items-center gap-1 text-sm font-medium text-purple-400 hover:text-purple-300 transition-colors"
        >
          Все <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      {results.length > 0 ? (
        <div className="space-y-3">
          {results.slice(0, 5).map((result, index) => {
            const isPassed = result.passed;
            return (
              <div 
                key={result._id || index}
                className="flex items-center gap-4 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
              >
                {/* Status Icon */}
                <div className={`
                  w-10 h-10 rounded-xl flex items-center justify-center
                  ${isPassed 
                    ? 'bg-emerald-500/20 text-emerald-400' 
                    : 'bg-red-500/20 text-red-400'
                  }
                `}>
                  {isPassed ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white truncate">
                    {result.quiz?.title || 'Викторина'}
                  </p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="flex items-center gap-1 text-xs text-gray-400">
                      <Target className="w-3 h-3" />
                      {result.correctAnswers || 0}/{result.totalQuestions || 0}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-gray-400">
                      <Clock className="w-3 h-3" />
                      {result.timeSpent || 0}с
                    </span>
                  </div>
                </div>

                {/* Score */}
                <div className="text-right">
                  <span className={`text-lg font-bold ${
                    isPassed ? 'text-emerald-400' : 'text-red-400'
                  }`}>
                    {result.percentage || result.score || 0}%
                  </span>
                  <p className="text-xs text-gray-500">
                    {formatDate(result.completedAt || result.createdAt)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-4">
            <Trophy className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-400">Пока нет результатов</p>
          <Link 
            to="/quizzes"
            className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition-colors"
          >
            Пройти викторину
          </Link>
        </div>
      )}
    </div>
  );
};

export default RecentActivity;
