import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Trophy, 
  Star, 
  Lock, 
  Unlock,
  Zap,
  Target,
  Flame,
  Brain,
  Award,
  Crown,
  Gem,
  Sparkles,
  Play,
  CheckCircle,
  Clock,
  Users,
  Heart,
  BookOpen,
  Gamepad2,
  Gift,
  Rocket,
  Medal,
  Shield,
  Loader2,
  Plus
} from 'lucide-react';
import { userAPI } from '../../services/api';
import MemoryGame from './MemoryGame';
import SpeedQuiz from './SpeedQuiz';
import BrainBattle from './BrainBattle';
import QuizRush from './QuizRush';
import UltimateChallenge from './UltimateChallenge';
import ExclusiveArena from './ExclusiveArena';
import ReactionGame from './ReactionGame';
import SequenceGame from './SequenceGame';
import MathRace from './MathRace';
import ColorMatch from './ColorMatch';
import AimTrainer from './AimTrainer';

const Achievements = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userStats, setUserStats] = useState(null);
  const [selectedGame, setSelectedGame] = useState(null);
  const [activeTab, setActiveTab] = useState('achievements');
  const [activeGame, setActiveGame] = useState(null);
  const [pointsAnimation, setPointsAnimation] = useState(null);

  useEffect(() => {
    fetchUserStats();
  }, []);

  const fetchUserStats = async () => {
    try {
      setLoading(true);
      
      // Получаем профиль пользователя
      const profileResponse = await userAPI.getProfile();
      console.log('Full profile response:', profileResponse.data);
      
      // Backend возвращает { success: true, data: user }
      // Поэтому user находится в profileResponse.data.data
      const user = profileResponse.data?.data || profileResponse.data?.user || profileResponse.data;
      const gameStats = user?.gameStats;
      
      console.log('User object:', user);
      console.log('Found gameStats:', gameStats);
      
      if (gameStats && typeof gameStats.totalPoints === 'number') {
        setUserStats({
          totalPoints: gameStats.totalPoints || 0,
          experience: gameStats.experience || 0,
          level: gameStats.level || 1,
          quizzesCompleted: gameStats.quizzesCompleted || 0,
          currentStreak: gameStats.currentStreak || 0,
          longestStreak: gameStats.bestStreak || 0,
        });
        console.log('✅ Set userStats, points:', gameStats.totalPoints);
      } else {
        console.log('⚠️ gameStats not found in profile, trying game-stats endpoint...');
        // Если в профиле нет - пробуем отдельный эндпоинт
        const response = await userAPI.getGameStats();
        console.log('Game stats response:', response.data);
        const data = response.data?.data || response.data || {};
        
        setUserStats({
          totalPoints: data.totalPoints || 0,
          experience: data.experience || 0,
          level: data.level || 1,
          quizzesCompleted: data.quizzesCompleted || 0,
          currentStreak: data.currentStreak || 0,
          longestStreak: data.bestStreak || 0,
        });
      }
    } catch (err) {
      console.error('❌ Error fetching stats:', err);
      console.error('Error details:', err.response?.data);
      setUserStats({
        totalPoints: 0,
        experience: 0,
        level: 1,
        quizzesCompleted: 0,
        currentStreak: 0,
        longestStreak: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const achievements = [
    // Достижения за очки
    {
      id: 'first_points',
      title: 'Первые шаги',
      description: 'Набери 100 очков',
      icon: Star,
      color: 'from-gray-400 to-gray-600',
      requirement: 100,
      type: 'points',
      reward: 'Открывает: Memory Game'
    },
    {
      id: 'rising_star',
      title: 'Восходящая звезда',
      description: 'Набери 500 очков',
      icon: Zap,
      color: 'from-yellow-400 to-orange-500',
      requirement: 500,
      type: 'points',
      reward: 'Открывает: Speed Quiz'
    },
    {
      id: 'knowledge_seeker',
      title: 'Искатель знаний',
      description: 'Набери 1000 очков',
      icon: Brain,
      color: 'from-blue-400 to-cyan-500',
      requirement: 1000,
      type: 'points',
      reward: 'Открывает: Brain Battle'
    },
    {
      id: 'quiz_master',
      title: 'Мастер квизов',
      description: 'Набери 2500 очков',
      icon: Trophy,
      color: 'from-purple-400 to-pink-500',
      requirement: 2500,
      type: 'points',
      reward: 'Открывает: Quiz Rush'
    },
    {
      id: 'legend',
      title: 'Легенда',
      description: 'Набери 5000 очков',
      icon: Crown,
      color: 'from-amber-400 to-yellow-600',
      requirement: 5000,
      type: 'points',
      reward: 'Открывает: Ultimate Challenge'
    },
    {
      id: 'ultimate',
      title: 'Бессмертный',
      description: 'Набери 10000 очков',
      icon: Gem,
      color: 'from-red-400 to-rose-600',
      requirement: 10000,
      type: 'points',
      reward: 'Открывает: Все игры + Эксклюзивы'
    },
    
    // Достижения за квизы
    {
      id: 'first_quiz',
      title: 'Первый квиз',
      description: 'Пройди свой первый квиз',
      icon: Target,
      color: 'from-green-400 to-emerald-500',
      requirement: 1,
      type: 'quizzes',
      reward: '+50 бонусных очков'
    },
    {
      id: 'quiz_lover',
      title: 'Любитель квизов',
      description: 'Пройди 10 квизов',
      icon: Heart,
      color: 'from-pink-400 to-rose-500',
      requirement: 10,
      type: 'quizzes',
      reward: '+100 бонусных очков'
    },
    {
      id: 'quiz_addict',
      title: 'Зависимость от квизов',
      description: 'Пройди 50 квизов',
      icon: Flame,
      color: 'from-orange-400 to-red-500',
      requirement: 50,
      type: 'quizzes',
      reward: '+250 бонусных очков'
    },
    
    // Достижения за создание
    {
      id: 'creator',
      title: 'Создатель',
      description: 'Создай свой первый квиз',
      icon: BookOpen,
      color: 'from-indigo-400 to-purple-500',
      requirement: 1,
      type: 'created',
      reward: '+100 бонусных очков'
    },
    {
      id: 'author',
      title: 'Автор',
      description: 'Создай 5 квизов',
      icon: Award,
      color: 'from-teal-400 to-cyan-500',
      requirement: 5,
      type: 'created',
      reward: '+200 бонусных очков'
    },
    
    // Достижения за серии
    {
      id: 'streak_starter',
      title: 'Начало серии',
      description: 'Играй 3 дня подряд',
      icon: Rocket,
      color: 'from-violet-400 to-purple-600',
      requirement: 3,
      type: 'streak',
      reward: 'Множитель очков x1.5'
    },
    {
      id: 'streak_master',
      title: 'Мастер серий',
      description: 'Играй 7 дней подряд',
      icon: Shield,
      color: 'from-emerald-400 to-teal-600',
      requirement: 7,
      type: 'streak',
      reward: 'Множитель очков x2'
    },
  ];

  const games = [
    {
      id: 'memory',
      title: 'Memory Game',
      description: 'Классическая игра на память. Найди все пары карточек!',
      icon: Brain,
      color: 'from-purple-500 to-pink-500',
      requiredPoints: 100,
      players: '1 игрок',
      time: '3-5 мин',
    },
    {
      id: 'reaction',
      title: 'Тест реакции',
      description: 'Проверь свою скорость реакции! Нажимай когда экран станет зелёным.',
      icon: Zap,
      color: 'from-green-500 to-emerald-500',
      requiredPoints: 100,
      players: '1 игрок',
      time: '1-2 мин',
    },
    {
      id: 'sequence',
      title: 'Последовательность',
      description: 'Запомни порядок цветов и повтори! С каждым уровнем сложнее.',
      icon: Sparkles,
      color: 'from-violet-500 to-purple-500',
      requiredPoints: 300,
      players: '1 игрок',
      time: '3-5 мин',
    },
    {
      id: 'mathrace',
      title: 'Математическая гонка',
      description: 'Реши как можно больше примеров за 60 секунд!',
      icon: Target,
      color: 'from-orange-500 to-red-500',
      requiredPoints: 600,
      players: '1 игрок',
      time: '1 мин',
    },
    {
      id: 'colormatch',
      title: 'Цветовой тест',
      description: 'Совпадает ли цвет текста с названием? Тест на внимательность!',
      icon: Heart,
      color: 'from-pink-500 to-rose-500',
      requiredPoints: 1000,
      players: '1 игрок',
      time: '1-2 мин',
    },
    {
      id: 'aimtrainer',
      title: 'Тренировка прицела',
      description: 'Нажимай на цели как можно быстрее! Тренируй точность.',
      icon: Gamepad2,
      color: 'from-slate-500 to-zinc-600',
      requiredPoints: 1500,
      players: '1 игрок',
      time: '30 сек',
    },
    {
      id: 'speed',
      title: 'Speed Quiz',
      description: 'Отвечай на вопросы как можно быстрее! Время ограничено.',
      icon: Clock,
      color: 'from-yellow-500 to-orange-500',
      requiredPoints: 2000,
      players: '1 игрок',
      time: '2-3 мин',
    },
    {
      id: 'battle',
      title: 'Brain Battle',
      description: 'Сражайся с AI в реальном времени!',
      icon: Users,
      color: 'from-blue-500 to-cyan-500',
      requiredPoints: 3000,
      players: '1 vs AI',
      time: '5-10 мин',
    },
    {
      id: 'rush',
      title: 'Quiz Rush',
      description: 'Бесконечный режим! Сколько вопросов ты осилишь?',
      icon: Flame,
      color: 'from-red-500 to-orange-500',
      requiredPoints: 5000,
      players: '1 игрок',
      time: 'Бесконечно',
    },
    {
      id: 'ultimate',
      title: 'Ultimate Challenge',
      description: 'Самые сложные вопросы. Только для легенд!',
      icon: Crown,
      color: 'from-amber-500 to-yellow-600',
      requiredPoints: 8000,
      players: '1 игрок',
      time: '10-15 мин',
    },
    {
      id: 'exclusive',
      title: 'Эксклюзивная арена',
      description: 'Турнирный режим с призами для топ игроков',
      icon: Gem,
      color: 'from-rose-500 to-red-600',
      requiredPoints: 15000,
      players: '1 игрок',
      time: '15-20 мин',
    },
  ];

  const isAchievementUnlocked = (achievement) => {
    const points = userStats?.totalPoints || 0;
    const quizzes = userStats?.quizzesCompleted || 0;
    const created = userStats?.quizzesCreated || 0;
    const streak = userStats?.longestStreak || 0;

    switch (achievement.type) {
      case 'points': return points >= achievement.requirement;
      case 'quizzes': return quizzes >= achievement.requirement;
      case 'created': return created >= achievement.requirement;
      case 'streak': return streak >= achievement.requirement;
      default: return false;
    }
  };

  const getProgress = (achievement) => {
    const points = userStats?.totalPoints || 0;
    const quizzes = userStats?.quizzesCompleted || 0;
    const created = userStats?.quizzesCreated || 0;
    const streak = userStats?.longestStreak || 0;

    let current = 0;
    switch (achievement.type) {
      case 'points': current = points; break;
      case 'quizzes': current = quizzes; break;
      case 'created': current = created; break;
      case 'streak': current = streak; break;
    }

    return Math.min((current / achievement.requirement) * 100, 100);
  };

  const isGameUnlocked = (game) => {
    return (userStats?.totalPoints || 0) >= game.requiredPoints;
  };

  // Обработка окончания игры и добавление очков
  const handleGameEnd = useCallback(async (earnedPoints, gameType) => {
    // Убеждаемся что все значения - числа
    const currentPoints = parseInt(userStats?.totalPoints, 10) || 0;
    const earned = parseInt(earnedPoints, 10) || 0;
    const newTotal = currentPoints + earned;
    
    // Обновляем локальное состояние сразу
    setUserStats(prev => ({
      ...prev,
      totalPoints: newTotal
    }));
    
    // Показываем анимацию заработанных очков
    setPointsAnimation(earned);
    setTimeout(() => setPointsAnimation(null), 3000);
    
    // Сохраняем на сервер
    try {
      const response = await userAPI.addGamePoints(earned, gameType);
      // Обновляем из ответа сервера (более точные данные)
      if (response.data.success) {
        setUserStats(prev => ({
          ...prev,
          totalPoints: response.data.data.totalPoints,
          experience: response.data.data.experience,
          level: response.data.data.level
        }));
      }
    } catch (err) {
      console.error('Error saving points to server:', err);
      // Очки уже обновлены локально, ничего не делаем
    }
  }, [userStats]);

  // Запуск игры
  const startGame = (game) => {
    if (!isGameUnlocked(game)) return;
    setSelectedGame(null);
    setActiveGame(game.id);
  };

  const unlockedCount = achievements.filter(a => isAchievementUnlocked(a)).length;

  // Показываем загрузку пока данные не пришли с сервера
  if (loading || userStats === null) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
        <span className="ml-3 text-gray-600 dark:text-gray-400">Загрузка статистики...</span>
      </div>
    );
  }

  // Рендер активной игры
  if (activeGame) {
    switch (activeGame) {
      case 'memory':
        return <MemoryGame onClose={() => setActiveGame(null)} onGameEnd={handleGameEnd} />;
      case 'reaction':
        return <ReactionGame onEnd={handleGameEnd} onBack={() => setActiveGame(null)} />;
      case 'sequence':
        return <SequenceGame onEnd={handleGameEnd} onBack={() => setActiveGame(null)} />;
      case 'mathrace':
        return <MathRace onEnd={handleGameEnd} onBack={() => setActiveGame(null)} />;
      case 'colormatch':
        return <ColorMatch onEnd={handleGameEnd} onBack={() => setActiveGame(null)} />;
      case 'aimtrainer':
        return <AimTrainer onEnd={handleGameEnd} onBack={() => setActiveGame(null)} />;
      case 'speed':
        return <SpeedQuiz onClose={() => setActiveGame(null)} onGameEnd={handleGameEnd} />;
      case 'battle':
        return <BrainBattle onClose={() => setActiveGame(null)} onGameEnd={handleGameEnd} />;
      case 'rush':
        return <QuizRush onClose={() => setActiveGame(null)} onGameEnd={handleGameEnd} />;
      case 'ultimate':
        return <UltimateChallenge onClose={() => setActiveGame(null)} onGameEnd={handleGameEnd} />;
      case 'exclusive':
        return <ExclusiveArena onClose={() => setActiveGame(null)} onGameEnd={handleGameEnd} />;
      default:
        setActiveGame(null);
    }
  }

  return (
    <div className="space-y-6">
      {/* Points Animation */}
      {pointsAnimation && (
        <div className="fixed top-20 right-8 z-50 animate-bounce">
          <div className="px-6 py-4 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-2xl flex items-center gap-3">
            <Plus className="w-6 h-6" />
            <span className="text-2xl font-bold">+{pointsAnimation}</span>
            <span className="text-white/80">очков!</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">Достижения и игры</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Разблокируй игры, зарабатывая очки!
          </p>
        </div>
        
        {/* Points Display */}
        <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 relative overflow-hidden">
          <div className={`absolute inset-0 bg-gradient-to-r from-green-500/30 to-emerald-500/30 transition-opacity duration-500 ${pointsAnimation ? 'opacity-100' : 'opacity-0'}`} />
          <Trophy className="text-yellow-500 relative z-10" size={28} />
          <div className="relative z-10">
            <p className="text-sm text-gray-600 dark:text-gray-400">Твои очки</p>
            <p className={`text-2xl font-bold text-gray-900 dark:text-white transition-all ${pointsAnimation ? 'scale-110 text-green-500' : ''}`}>
              {userStats?.totalPoints || 0}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1 rounded-xl bg-gray-100 dark:bg-white/5">
        <button
          onClick={() => setActiveTab('achievements')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
            activeTab === 'achievements'
              ? 'bg-white dark:bg-white/10 text-purple-600 dark:text-purple-400 shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <Medal size={20} />
          <span>Достижения ({unlockedCount}/{achievements.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('games')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
            activeTab === 'games'
              ? 'bg-white dark:bg-white/10 text-purple-600 dark:text-purple-400 shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <Gamepad2 size={20} />
          <span>Игры ({games.filter(g => isGameUnlocked(g)).length}/{games.length})</span>
        </button>
      </div>

      {/* Achievements Tab */}
      {activeTab === 'achievements' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {achievements.map((achievement) => {
            const unlocked = isAchievementUnlocked(achievement);
            const progress = getProgress(achievement);
            const Icon = achievement.icon;

            return (
              <div
                key={achievement.id}
                className={`relative p-5 rounded-2xl border transition-all duration-300 ${
                  unlocked
                    ? 'bg-white dark:bg-white/5 border-purple-500/50 shadow-lg shadow-purple-500/10'
                    : 'bg-gray-50 dark:bg-white/[0.02] border-gray-200 dark:border-white/5 opacity-75'
                }`}
              >
                {/* Unlocked Badge */}
                {unlocked && (
                  <div className="absolute -top-2 -right-2">
                    <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center shadow-lg">
                      <CheckCircle className="text-white" size={18} />
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-4">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${achievement.color} 
                                flex items-center justify-center shadow-lg ${!unlocked && 'grayscale opacity-50'}`}>
                    <Icon className="text-white" size={28} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className={`font-bold ${unlocked ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                      {achievement.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                      {achievement.description}
                    </p>
                    
                    {/* Progress Bar */}
                    {!unlocked && (
                      <div className="mt-3">
                        <div className="h-2 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
                          <div 
                            className={`h-full bg-gradient-to-r ${achievement.color} rounded-full transition-all`}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{Math.round(progress)}%</p>
                      </div>
                    )}
                    
                    {/* Reward */}
                    <div className={`mt-3 flex items-center gap-2 text-xs ${
                      unlocked ? 'text-purple-600 dark:text-purple-400' : 'text-gray-500'
                    }`}>
                      <Gift size={14} />
                      <span>{achievement.reward}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Games Tab */}
      {activeTab === 'games' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {games.map((game) => {
            const unlocked = isGameUnlocked(game);
            const Icon = game.icon;
            const pointsNeeded = game.requiredPoints - (userStats?.totalPoints || 0);

            return (
              <div
                key={game.id}
                onClick={() => unlocked && setSelectedGame(game)}
                className={`group relative overflow-hidden rounded-2xl transition-all duration-300 cursor-pointer ${
                  unlocked
                    ? 'hover:scale-[1.02] hover:shadow-2xl'
                    : 'opacity-60'
                }`}
              >
                {/* Background Gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${game.color} ${!unlocked && 'grayscale'}`} />
                
                {/* Overlay Pattern */}
                <div className="absolute inset-0 opacity-20">
                  <div className="absolute top-0 right-0 w-40 h-40 bg-white/20 rounded-full -translate-y-1/2 translate-x-1/2" />
                  <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/20 rounded-full translate-y-1/2 -translate-x-1/2" />
                </div>
                
                {/* Content */}
                <div className="relative p-6">
                  {/* Lock/Unlock Badge */}
                  <div className="absolute top-4 right-4">
                    {unlocked ? (
                      <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
                        <Unlock className="text-white" size={20} />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-black/30 backdrop-blur flex items-center justify-center">
                        <Lock className="text-white/70" size={20} />
                      </div>
                    )}
                  </div>
                  
                  <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center mb-4">
                    <Icon className="text-white" size={32} />
                  </div>
                  
                  <h3 className="text-xl font-bold text-white mb-2">{game.title}</h3>
                  <p className="text-white/80 text-sm mb-4">{game.description}</p>
                  
                  {/* Game Info */}
                  <div className="flex items-center gap-4 text-white/70 text-sm">
                    <span className="flex items-center gap-1">
                      <Users size={14} />
                      {game.players}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={14} />
                      {game.time}
                    </span>
                  </div>
                  
                  {/* Unlock Requirement */}
                  {!unlocked && (
                    <div className="mt-4 p-3 rounded-xl bg-black/30 backdrop-blur">
                      <p className="text-white/90 text-sm font-medium text-center">
                        Требуется: <span className="text-yellow-300">{game.requiredPoints}</span> очков
                      </p>
                      <p className="text-white/60 text-xs text-center mt-1">
                        Ещё {pointsNeeded} очков до разблокировки
                      </p>
                    </div>
                  )}
                  
                  {/* Play Button */}
                  {unlocked && (
                    <button className="mt-4 w-full py-3 bg-white/20 hover:bg-white/30 backdrop-blur rounded-xl 
                                     text-white font-bold flex items-center justify-center gap-2 transition-all">
                      <Play size={20} />
                      Играть
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Game Modal */}
      {selectedGame && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => setSelectedGame(null)}
        >
          <div 
            className="w-full max-w-lg p-6 rounded-2xl bg-white dark:bg-gray-900 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${selectedGame.color} 
                          flex items-center justify-center mx-auto mb-4 shadow-lg`}>
              <selectedGame.icon className="text-white" size={40} />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-2">
              {selectedGame.title}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
              {selectedGame.description}
            </p>
            
            <div className="flex justify-center gap-4 mb-6">
              <div className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-white/10 text-center">
                <Users className="w-5 h-5 text-gray-600 dark:text-gray-400 mx-auto mb-1" />
                <p className="text-sm text-gray-900 dark:text-white font-medium">{selectedGame.players}</p>
              </div>
              <div className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-white/10 text-center">
                <Clock className="w-5 h-5 text-gray-600 dark:text-gray-400 mx-auto mb-1" />
                <p className="text-sm text-gray-900 dark:text-white font-medium">{selectedGame.time}</p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setSelectedGame(null)}
                className="flex-1 py-3 rounded-xl bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-200 dark:hover:bg-white/20 transition-colors"
              >
                Отмена
              </button>
              <button
                onClick={() => startGame(selectedGame)}
                className={`flex-1 py-3 rounded-xl bg-gradient-to-r ${selectedGame.color} text-white font-bold 
                          shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2`}
              >
                <Play size={20} />
                Начать игру
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
          <Sparkles className="text-yellow-500" size={24} />
          Как заработать больше очков?
        </h3>
        <ul className="space-y-2 text-gray-600 dark:text-gray-400">
          <li className="flex items-center gap-2">
            <CheckCircle size={16} className="text-green-500" />
            Проходи квизы каждый день — бонус за серию!
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle size={16} className="text-green-500" />
            Отвечай правильно — больше очков за точность
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle size={16} className="text-green-500" />
            Создавай свои квизы — очки за каждое прохождение другими
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle size={16} className="text-green-500" />
            Отвечай быстрее — бонус за скорость!
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Achievements;
