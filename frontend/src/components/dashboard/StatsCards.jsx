import { 
  BookOpen, 
  Target, 
  Trophy, 
  Heart,
  Eye,
  Play,
  TrendingUp,
  TrendingDown
} from 'lucide-react';

const StatsCards = ({ 
  quizzesCount, 
  completedCount, 
  totalPoints, 
  likedCount,
  totalViews,
  totalPlays
}) => {
  const stats = [
    {
      label: 'Создано',
      value: quizzesCount,
      change: '+12%',
      positive: true,
      icon: BookOpen,
      color: 'from-blue-500 to-indigo-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      textColor: 'text-blue-600 dark:text-blue-400'
    },
    {
      label: 'Пройдено',
      value: completedCount,
      change: '+8%',
      positive: true,
      icon: Target,
      color: 'from-emerald-500 to-teal-600',
      bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
      textColor: 'text-emerald-600 dark:text-emerald-400'
    },
    {
      label: 'Очков',
      value: totalPoints.toLocaleString(),
      change: '+24%',
      positive: true,
      icon: Trophy,
      color: 'from-amber-500 to-orange-600',
      bgColor: 'bg-amber-50 dark:bg-amber-900/20',
      textColor: 'text-amber-600 dark:text-amber-400'
    },
    {
      label: 'В избранном',
      value: likedCount,
      change: '+5%',
      positive: true,
      icon: Heart,
      color: 'from-pink-500 to-rose-600',
      bgColor: 'bg-pink-50 dark:bg-pink-900/20',
      textColor: 'text-pink-600 dark:text-pink-400'
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div
            key={index}
            className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-shadow duration-300"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`p-2.5 rounded-xl ${stat.bgColor}`}>
                <Icon className={`w-5 h-5 ${stat.textColor}`} />
              </div>
              <div className={`flex items-center gap-1 text-xs font-medium ${
                stat.positive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
              }`}>
                {stat.positive ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                {stat.change}
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{stat.label}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StatsCards;
