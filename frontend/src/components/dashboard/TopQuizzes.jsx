import { Link } from 'react-router-dom';
import { 
  Eye, 
  Play, 
  Heart,
  ChevronRight,
  Brain,
  BarChart3
} from 'lucide-react';

const TopQuizzes = ({ quizzes }) => {
  // Сортируем по просмотрам/играм
  const sortedQuizzes = [...quizzes]
    .sort((a, b) => (b.stats?.plays || 0) - (a.stats?.plays || 0))
    .slice(0, 5);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 h-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-indigo-500" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Топ викторин</h3>
        </div>
        <Link 
          to="/my-quizzes"
          className="flex items-center gap-1 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700"
        >
          Все <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      {sortedQuizzes.length > 0 ? (
        <div className="space-y-4">
          {sortedQuizzes.map((quiz, index) => (
            <Link
              key={quiz._id}
              to={`/quiz/${quiz._id}`}
              className="flex items-center gap-3 group"
            >
              {/* Thumbnail */}
              <div className="relative w-12 h-12 rounded-xl overflow-hidden flex-shrink-0">
                {quiz.thumbnail?.url ? (
                  <img 
                    src={quiz.thumbnail.url} 
                    alt={quiz.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 flex items-center justify-center">
                    <Brain className="w-6 h-6 text-indigo-500 dark:text-indigo-400" />
                  </div>
                )}
                {/* Rank Badge */}
                <div className="absolute -top-1 -left-1 w-5 h-5 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                  <span className="text-[10px] font-bold text-white">{index + 1}</span>
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {quiz.title}
                </p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                    <Play className="w-3 h-3" />
                    {quiz.stats?.plays || 0}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                    <Eye className="w-3 h-3" />
                    {quiz.stats?.views || 0}
                  </span>
                </div>
              </div>

              {/* Progress */}
              <div className="w-16">
                <div className="h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full"
                    style={{ 
                      width: `${Math.min(100, (quiz.stats?.plays || 0) / Math.max(...sortedQuizzes.map(q => q.stats?.plays || 1)) * 100)}%` 
                    }}
                  />
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="w-14 h-14 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mx-auto mb-3">
            <Brain className="w-7 h-7 text-gray-400" />
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-sm">Создайте первую викторину</p>
          <Link 
            to="/create-quiz"
            className="inline-flex items-center gap-2 mt-3 px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Создать
          </Link>
        </div>
      )}
    </div>
  );
};

export default TopQuizzes;
