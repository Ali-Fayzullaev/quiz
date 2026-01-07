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
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: Play,
      label: 'Играть',
      description: 'Все викторины',
      path: '/quizzes',
      color: 'from-emerald-500 to-teal-500'
    },
    {
      icon: Heart,
      label: 'Избранное',
      description: `${likedQuizzes.length} викторин`,
      path: '/liked',
      color: 'from-pink-500 to-rose-500'
    },
    {
      icon: BookOpen,
      label: 'Мои викторины',
      description: 'Управление',
      path: '/my-quizzes',
      color: 'from-amber-500 to-orange-500'
    }
  ];

  return (
    <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
      <div className="flex items-center gap-2 mb-6">
        <Sparkles className="w-5 h-5 text-amber-400" />
        <h3 className="text-lg font-semibold text-white">Быстрые действия</h3>
      </div>

      <div className="space-y-3">
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <Link
              key={index}
              to={action.path}
              className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors group"
            >
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-white">{action.label}</p>
                <p className="text-sm text-gray-400">{action.description}</p>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
            </Link>
          );
        })}
      </div>

      {/* Promo Card */}
      <div className="mt-6 p-4 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 text-white">
        <h4 className="font-semibold mb-1">Создайте свою викторину</h4>
        <p className="text-sm text-purple-100 mb-3">Поделитесь знаниями с другими пользователями</p>
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
