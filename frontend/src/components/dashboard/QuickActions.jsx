import { Link } from 'react-router-dom';
import { 
  Plus, 
  Play, 
  Heart, 
  BookOpen,
  ArrowRight,
  Sparkles
} from 'lucide-react';

const QuickActions = ({ likedQuizzes }) => {
  const actions = [
    {
      icon: Plus,
      label: 'Создать викторину',
      description: 'Новая викторина',
      path: '/create-quiz',
      color: 'from-indigo-500 to-purple-600',
      bgColor: 'bg-indigo-50 dark:bg-indigo-900/20'
    },
    {
      icon: Play,
      label: 'Играть',
      description: 'Все викторины',
      path: '/quizzes',
      color: 'from-emerald-500 to-teal-600',
      bgColor: 'bg-emerald-50 dark:bg-emerald-900/20'
    },
    {
      icon: Heart,
      label: 'Избранное',
      description: `${likedQuizzes.length} викторин`,
      path: '/liked',
      color: 'from-pink-500 to-rose-600',
      bgColor: 'bg-pink-50 dark:bg-pink-900/20'
    },
    {
      icon: BookOpen,
      label: 'Мои викторины',
      description: 'Управление',
      path: '/my-quizzes',
      color: 'from-amber-500 to-orange-600',
      bgColor: 'bg-amber-50 dark:bg-amber-900/20'
    }
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6">
      <div className="flex items-center gap-2 mb-6">
        <Sparkles className="w-5 h-5 text-amber-500" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Быстрые действия</h3>
      </div>

      <div className="space-y-3">
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <Link
              key={index}
              to={action.path}
              className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group"
            >
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900 dark:text-white">{action.label}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{action.description}</p>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 group-hover:translate-x-1 transition-all" />
            </Link>
          );
        })}
      </div>

      {/* Promo Card */}
      <div className="mt-6 p-4 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
        <h4 className="font-semibold mb-1">Создайте свою викторину</h4>
        <p className="text-sm text-indigo-100 mb-3">Поделитесь знаниями с другими пользователями</p>
        <Link
          to="/create-quiz"
          className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Создать
        </Link>
      </div>
    </div>
  );
};

export default QuickActions;
