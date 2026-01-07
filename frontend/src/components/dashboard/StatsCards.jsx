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
      color: 'from-blue-500 to-cyan-500',
      iconBg: 'bg-blue-500/20',
      iconColor: 'text-blue-400'
    },
    {
      label: 'Пройдено',
      value: completedCount,
      change: '+8%',
      positive: true,
      icon: Target,
      color: 'from-emerald-500 to-teal-500',
      iconBg: 'bg-emerald-500/20',
      iconColor: 'text-emerald-400'
    },
    {
      label: 'Очков',
      value: totalPoints.toLocaleString(),
      change: '+24%',
      positive: true,
      icon: Trophy,
      color: 'from-amber-500 to-orange-500',
      iconBg: 'bg-amber-500/20',
      iconColor: 'text-amber-400'
    },
    {
      label: 'В избранном',
      value: likedCount,
      change: '+5%',
      positive: true,
      icon: Heart,
      color: 'from-pink-500 to-rose-500',
      iconBg: 'bg-pink-500/20',
      iconColor: 'text-pink-400'
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div
            key={index}
            className="rounded-2xl p-5 bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`p-2.5 rounded-xl ${stat.iconBg}`}>
                <Icon className={`w-5 h-5 ${stat.iconColor}`} />
              </div>
              <div className={`flex items-center gap-1 text-xs font-medium ${
                stat.positive ? 'text-emerald-400' : 'text-red-400'
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
              <h3 className="text-2xl font-bold text-white">{stat.value}</h3>
              <p className="text-sm text-gray-400 mt-1">{stat.label}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StatsCards;
