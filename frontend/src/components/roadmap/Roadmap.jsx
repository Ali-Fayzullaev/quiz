// frontend/src/components/roadmap/Roadmap.jsx
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import {
  Star,
  Lock,
  CheckCircle,
  Trophy,
  Zap,
  Book,
  Brain,
  Target,
  Flame,
  Crown,
  Gift,
  Sparkles,
  Play,
  Award,
  Gem,
  MapPin,
  Rocket,
  Medal,
  Heart,
  Coins,
  Lightbulb,
  GraduationCap,
  Globe,
  TrendingUp,
  X
} from 'lucide-react';
import { quizAPI, vocabularyAPI, userAPI } from '../../services/api';

// Расширенная конфигурация уровней дорожной карты - 20 уровней
const ROADMAP_LEVELS = [
  // Уровень 1-5: Начало
  {
    id: 1,
    title: 'Первый шаг',
    description: 'Пройди свой первый квиз',
    icon: Star,
    color: 'from-green-400 to-emerald-500',
    requirement: { quizzes: 1 },
    reward: { xp: 25, coins: 10, badge: 'Первопроходец' },
    position: { x: 10, y: 90 }
  },
  {
    id: 2,
    title: 'Словарный запас',
    description: 'Выучи первые 10 слов',
    icon: Book,
    color: 'from-blue-400 to-cyan-500',
    requirement: { words: 10 },
    reward: { xp: 30, coins: 15, badge: 'Ученик' },
    position: { x: 25, y: 82 }
  },
  {
    id: 3,
    title: 'Любопытный',
    description: 'Пройди 3 разных квиза',
    icon: Lightbulb,
    color: 'from-yellow-400 to-amber-500',
    requirement: { quizzes: 3 },
    reward: { xp: 50, coins: 25, badge: 'Любопытный' },
    position: { x: 40, y: 75 }
  },
  {
    id: 4,
    title: 'Начинающий полиглот',
    description: 'Выучи 30 слов',
    icon: Globe,
    color: 'from-teal-400 to-cyan-500',
    requirement: { words: 30 },
    reward: { xp: 75, coins: 35, badge: 'Начинающий полиглот' },
    position: { x: 55, y: 70 }
  },
  {
    id: 5,
    title: 'Отличник',
    description: 'Набери 80%+ в любом квизе',
    icon: Target,
    color: 'from-orange-400 to-red-500',
    requirement: { perfectQuizzes: 1 },
    reward: { xp: 100, coins: 50, badge: 'Отличник' },
    position: { x: 70, y: 65 }
  },
  
  // Уровень 6-10: Развитие
  {
    id: 6,
    title: 'Исследователь',
    description: 'Пройди квизы в 2 категориях',
    icon: Brain,
    color: 'from-purple-400 to-pink-500',
    requirement: { categories: 2 },
    reward: { xp: 125, coins: 60, badge: 'Исследователь' },
    position: { x: 85, y: 58 }
  },
  {
    id: 7,
    title: 'Словарный мастер',
    description: 'Выучи 50 слов',
    icon: GraduationCap,
    color: 'from-indigo-400 to-purple-500',
    requirement: { words: 50 },
    reward: { xp: 150, coins: 75, badge: 'Словарный мастер' },
    position: { x: 80, y: 48 }
  },
  {
    id: 8,
    title: 'Активный игрок',
    description: 'Пройди 10 квизов',
    icon: Flame,
    color: 'from-red-400 to-orange-500',
    requirement: { quizzes: 10 },
    reward: { xp: 175, coins: 85, badge: 'Активист' },
    position: { x: 65, y: 42 }
  },
  {
    id: 9,
    title: 'Снайпер',
    description: 'Набери 80%+ в 3 квизах',
    icon: Zap,
    color: 'from-cyan-400 to-blue-500',
    requirement: { perfectQuizzes: 3 },
    reward: { xp: 200, coins: 100, badge: 'Снайпер' },
    position: { x: 50, y: 38 }
  },
  {
    id: 10,
    title: 'Создатель',
    description: 'Создай свой первый словарь',
    icon: Sparkles,
    color: 'from-pink-400 to-rose-500',
    requirement: { vocabularies: 1 },
    reward: { xp: 250, coins: 125, badge: 'Создатель' },
    position: { x: 35, y: 35 }
  },
  
  // Уровень 11-15: Мастерство
  {
    id: 11,
    title: 'Эрудит',
    description: 'Пройди квизы в 4 категориях',
    icon: Award,
    color: 'from-amber-400 to-yellow-500',
    requirement: { categories: 4 },
    reward: { xp: 300, coins: 150, badge: 'Эрудит' },
    position: { x: 20, y: 32 }
  },
  {
    id: 12,
    title: 'Полиглот',
    description: 'Выучи 100 слов',
    icon: Book,
    color: 'from-emerald-400 to-green-500',
    requirement: { words: 100 },
    reward: { xp: 350, coins: 175, badge: 'Полиглот' },
    position: { x: 15, y: 25 }
  },
  {
    id: 13,
    title: 'Марафонец',
    description: 'Пройди 20 квизов',
    icon: Medal,
    color: 'from-blue-400 to-indigo-500',
    requirement: { quizzes: 20 },
    reward: { xp: 400, coins: 200, badge: 'Марафонец' },
    position: { x: 30, y: 20 }
  },
  {
    id: 14,
    title: 'Перфекционист',
    description: 'Набери 80%+ в 7 квизах',
    icon: Target,
    color: 'from-violet-400 to-purple-500',
    requirement: { perfectQuizzes: 7 },
    reward: { xp: 450, coins: 225, badge: 'Перфекционист' },
    position: { x: 45, y: 18 }
  },
  {
    id: 15,
    title: 'Коллекционер',
    description: 'Создай 3 словаря с 20+ словами',
    icon: Gem,
    color: 'from-fuchsia-400 to-pink-500',
    requirement: { vocabularies: 3, wordsPerVocab: 20 },
    reward: { xp: 500, coins: 250, badge: 'Коллекционер' },
    position: { x: 60, y: 15 }
  },
  
  // Уровень 16-20: Легенда
  {
    id: 16,
    title: 'Мастер',
    description: 'Выучи 200 слов',
    icon: Crown,
    color: 'from-yellow-400 to-amber-500',
    requirement: { words: 200 },
    reward: { xp: 600, coins: 300, badge: 'Мастер слов' },
    position: { x: 75, y: 12 }
  },
  {
    id: 17,
    title: 'Профессор',
    description: 'Пройди 35 квизов с 80%+',
    icon: GraduationCap,
    color: 'from-rose-400 to-red-500',
    requirement: { quizzes: 35, perfectQuizzes: 10 },
    reward: { xp: 750, coins: 375, badge: 'Профессор' },
    position: { x: 85, y: 8 }
  },
  {
    id: 18,
    title: 'Энциклопедист',
    description: 'Пройди квизы в 6 категориях',
    icon: Brain,
    color: 'from-sky-400 to-blue-500',
    requirement: { categories: 6 },
    reward: { xp: 900, coins: 450, badge: 'Энциклопедист' },
    position: { x: 70, y: 5 }
  },
  {
    id: 19,
    title: 'Гуру',
    description: 'Выучи 500 слов и пройди 50 квизов',
    icon: Rocket,
    color: 'from-violet-500 to-purple-600',
    requirement: { words: 500, quizzes: 50 },
    reward: { xp: 1200, coins: 600, badge: 'Гуру' },
    position: { x: 50, y: 3 }
  },
  {
    id: 20,
    title: 'Легенда',
    description: 'Достигни вершины мастерства!',
    icon: Trophy,
    color: 'from-yellow-400 via-amber-500 to-orange-500',
    requirement: { words: 1000, quizzes: 100, perfectQuizzes: 25 },
    reward: { xp: 2000, coins: 1000, badge: '🏆 Легенда' },
    position: { x: 30, y: 2 }
  }
];

// Награды за действия
const ACTION_REWARDS = {
  completeQuiz: { xp: 10, coins: 5, label: 'За прохождение квиза' },
  perfectQuiz: { xp: 25, coins: 15, label: 'За 80%+ в квизе' },
  learnWord: { xp: 2, coins: 1, label: 'За выученное слово' },
  createVocabulary: { xp: 50, coins: 25, label: 'За создание словаря' },
  dailyLogin: { xp: 15, coins: 10, label: 'Ежедневный бонус' },
  streak3: { xp: 30, coins: 20, label: '3 дня подряд' },
  streak7: { xp: 100, coins: 50, label: 'Неделя подряд' },
  firstQuiz: { xp: 50, coins: 30, label: 'Первый квиз!' },
  first100Words: { xp: 200, coins: 100, label: '100 слов!' },
};

const Roadmap = () => {
  const { darkMode } = useTheme();
  const navigate = useNavigate();
  const mapRef = useRef(null);
  
  const [userProgress, setUserProgress] = useState({
    completedLevels: [],
    currentLevel: 1,
    totalXP: 0,
    totalCoins: 0,
    badges: [],
    stats: {
      quizzesPassed: 0,
      wordsLearned: 0,
      perfectQuizzes: 0,
      categories: [],
      vocabularies: 0,
      wordsPerVocab: 0
    }
  });
  
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [characterPosition, setCharacterPosition] = useState({ x: 10, y: 90 });
  const [isAnimating, setIsAnimating] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserProgress();
  }, []);

  useEffect(() => {
    // Анимация персонажа к текущему уровню
    const currentLevelData = ROADMAP_LEVELS.find(l => l.id === userProgress.currentLevel);
    if (currentLevelData && !loading) {
      animateCharacter(currentLevelData.position);
    }
  }, [userProgress.currentLevel, loading]);

  const fetchUserProgress = async () => {
    setLoading(true);
    try {
      // Получаем все данные параллельно
      const [quizResults, vocabularies, userProfile] = await Promise.all([
        quizAPI.getMyResults().catch(() => ({ data: { data: [] } })),
        vocabularyAPI.getMyVocabularies().catch(() => ({ data: { data: [] } })),
        userAPI.getProfile().catch(() => ({ data: { data: {} } }))
      ]);

      const results = quizResults.data?.data || [];
      const vocabs = vocabularies.data?.data || [];
      const user = userProfile.data?.data || userProfile.data || {};

      // Подсчитываем статистику
      const quizzesPassed = results.length;
      const perfectQuizzes = results.filter(r => (r.percentage || r.score) >= 80).length;
      const categories = [...new Set(results.map(r => r.quiz?.category).filter(Boolean))];
      
      let wordsLearned = 0;
      let maxWordsInVocab = 0;
      vocabs.forEach(v => {
        const learned = v.stats?.learnedWords || 0;
        const total = v.words?.length || v.stats?.totalWords || 0;
        wordsLearned += learned;
        if (total > maxWordsInVocab) maxWordsInVocab = total;
      });

      // Если нет данных о выученных словах, считаем общее количество слов
      if (wordsLearned === 0) {
        vocabs.forEach(v => {
          wordsLearned += v.words?.length || v.stats?.totalWords || 0;
        });
      }

      const vocabulariesWith20Words = vocabs.filter(v => 
        (v.words?.length || v.stats?.totalWords || 0) >= 20
      ).length;

      const stats = {
        quizzesPassed,
        wordsLearned,
        perfectQuizzes,
        categories,
        vocabularies: vocabs.length,
        wordsPerVocab: maxWordsInVocab,
        vocabulariesWith20Words
      };

      // Вычисляем XP и монеты на основе действий
      let earnedXP = 0;
      let earnedCoins = 0;

      // XP за квизы
      earnedXP += quizzesPassed * ACTION_REWARDS.completeQuiz.xp;
      earnedCoins += quizzesPassed * ACTION_REWARDS.completeQuiz.coins;

      // XP за отличные результаты
      earnedXP += perfectQuizzes * ACTION_REWARDS.perfectQuiz.xp;
      earnedCoins += perfectQuizzes * ACTION_REWARDS.perfectQuiz.coins;

      // XP за слова
      earnedXP += wordsLearned * ACTION_REWARDS.learnWord.xp;
      earnedCoins += wordsLearned * ACTION_REWARDS.learnWord.coins;

      // XP за словари
      earnedXP += vocabs.length * ACTION_REWARDS.createVocabulary.xp;
      earnedCoins += vocabs.length * ACTION_REWARDS.createVocabulary.coins;

      // Бонус за первый квиз
      if (quizzesPassed >= 1) {
        earnedXP += ACTION_REWARDS.firstQuiz.xp;
        earnedCoins += ACTION_REWARDS.firstQuiz.coins;
      }

      // Бонус за 100 слов
      if (wordsLearned >= 100) {
        earnedXP += ACTION_REWARDS.first100Words.xp;
        earnedCoins += ACTION_REWARDS.first100Words.coins;
      }

      // Добавляем XP из профиля пользователя если есть
      const gameStatsXP = user.gameStats?.totalPoints || 0;
      earnedXP += gameStatsXP;

      // Проверяем какие уровни пройдены
      const completedLevels = [];
      const badges = [];

      ROADMAP_LEVELS.forEach(level => {
        if (checkLevelComplete(level, stats)) {
          completedLevels.push(level.id);
          badges.push(level.reward.badge);
        }
      });

      // Добавляем XP за пройденные уровни
      completedLevels.forEach(levelId => {
        const level = ROADMAP_LEVELS.find(l => l.id === levelId);
        if (level) {
          earnedXP += level.reward.xp;
          earnedCoins += level.reward.coins;
        }
      });

      const currentLevel = completedLevels.length > 0 
        ? Math.min(Math.max(...completedLevels) + 1, ROADMAP_LEVELS.length)
        : 1;

      setUserProgress({
        completedLevels,
        currentLevel,
        totalXP: earnedXP,
        totalCoins: earnedCoins,
        badges,
        stats
      });

    } catch (error) {
      console.error('Error fetching progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkLevelComplete = (level, stats) => {
    const req = level.requirement;
    
    if (req.quizzes && stats.quizzesPassed < req.quizzes) return false;
    if (req.words && stats.wordsLearned < req.words) return false;
    if (req.perfectQuizzes && stats.perfectQuizzes < req.perfectQuizzes) return false;
    if (req.categories && stats.categories.length < req.categories) return false;
    if (req.vocabularies && stats.vocabularies < req.vocabularies) return false;
    if (req.wordsPerVocab && stats.wordsPerVocab < req.wordsPerVocab) return false;
    
    return true;
  };

  const animateCharacter = (targetPosition) => {
    setIsAnimating(true);
    
    const startPosition = { ...characterPosition };
    const duration = 1500;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function - более плавная
      const easeProgress = 1 - Math.pow(1 - progress, 4);
      
      setCharacterPosition({
        x: startPosition.x + (targetPosition.x - startPosition.x) * easeProgress,
        y: startPosition.y + (targetPosition.y - startPosition.y) * easeProgress
      });

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setIsAnimating(false);
      }
    };

    requestAnimationFrame(animate);
  };

  const handleLevelClick = (level) => {
    setSelectedLevel(level);
    
    const status = getLevelStatus(level);
    if (status === 'completed' || status === 'current') {
      animateCharacter(level.position);
    }
  };

  const getLevelStatus = (level) => {
    if (userProgress.completedLevels.includes(level.id)) return 'completed';
    if (level.id === userProgress.currentLevel) return 'current';
    
    // Проверяем, можно ли начать этот уровень (предыдущий должен быть завершён)
    const prevLevel = ROADMAP_LEVELS.find(l => l.id === level.id - 1);
    if (!prevLevel || userProgress.completedLevels.includes(prevLevel.id)) {
      return 'available';
    }
    
    return 'locked';
  };

  const getProgressPercent = (level) => {
    const req = level.requirement;
    const stats = userProgress.stats;
    let progress = 0;
    let total = 0;

    if (req.quizzes) {
      progress += Math.min(stats.quizzesPassed, req.quizzes);
      total += req.quizzes;
    }
    if (req.words) {
      progress += Math.min(stats.wordsLearned, req.words);
      total += req.words;
    }
    if (req.perfectQuizzes) {
      progress += Math.min(stats.perfectQuizzes, req.perfectQuizzes);
      total += req.perfectQuizzes;
    }
    if (req.categories) {
      progress += Math.min(stats.categories.length, req.categories);
      total += req.categories;
    }
    if (req.vocabularies) {
      progress += Math.min(stats.vocabularies, req.vocabularies);
      total += req.vocabularies;
    }

    return total > 0 ? Math.round((progress / total) * 100) : 0;
  };

  const startChallenge = (level) => {
    const req = level.requirement;
    
    if (req.words || req.vocabularies) {
      navigate('/vocabulary');
    } else if (req.quizzes || req.perfectQuizzes || req.categories) {
      navigate('/quizzes');
    } else {
      navigate('/dashboard');
    }
  };

  // SVG Path для дороги - извилистая тропинка
  const generatePath = () => {
    const points = ROADMAP_LEVELS.map(l => l.position);
    if (points.length < 2) return '';
    
    let path = `M ${points[0].x} ${points[0].y}`;
    
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      
      // Создаём плавные кривые Безье
      const midX = (prev.x + curr.x) / 2;
      const midY = (prev.y + curr.y) / 2;
      
      // Добавляем небольшое смещение для естественности
      const offsetX = (i % 2 === 0 ? 5 : -5);
      
      path += ` Q ${midX + offsetX} ${prev.y} ${midX} ${midY}`;
      path += ` Q ${midX - offsetX} ${curr.y} ${curr.x} ${curr.y}`;
    }
    
    return path;
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-gray-950' : 'bg-gradient-to-b from-sky-100 to-green-100'}`}>
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Загрузка карты...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-950' : 'bg-gradient-to-b from-sky-100 via-green-50 to-amber-50'}`}>
      {/* Header */}
      <div className={`sticky top-0 z-50 ${darkMode ? 'bg-gray-900/95' : 'bg-white/95'} backdrop-blur-lg border-b ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 shadow-lg">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Дорожная карта
                </h1>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Твой путь к мастерству • {ROADMAP_LEVELS.length} уровней
                </p>
              </div>
            </div>
            
            {/* Stats Bar */}
            <div className="flex items-center gap-4 sm:gap-6 flex-wrap">
              {/* XP */}
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-lg ${darkMode ? 'bg-purple-500/20' : 'bg-purple-100'}`}>
                  <Zap className="w-5 h-5 text-purple-500" />
                </div>
                <div>
                  <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>XP</p>
                  <p className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {userProgress.totalXP.toLocaleString()}
                  </p>
                </div>
              </div>
              
              {/* Coins */}
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-lg ${darkMode ? 'bg-yellow-500/20' : 'bg-yellow-100'}`}>
                  <Coins className="w-5 h-5 text-yellow-500" />
                </div>
                <div>
                  <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>Монеты</p>
                  <p className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {userProgress.totalCoins.toLocaleString()}
                  </p>
                </div>
              </div>
              
              {/* Badges */}
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-lg ${darkMode ? 'bg-pink-500/20' : 'bg-pink-100'}`}>
                  <Award className="w-5 h-5 text-pink-500" />
                </div>
                <div>
                  <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>Значки</p>
                  <p className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {userProgress.badges.length}/{ROADMAP_LEVELS.length}
                  </p>
                </div>
              </div>
              
              {/* Progress */}
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-lg ${darkMode ? 'bg-green-500/20' : 'bg-green-100'}`}>
                  <CheckCircle className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>Пройдено</p>
                  <p className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {userProgress.completedLevels.length}/{ROADMAP_LEVELS.length}
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Quick Stats */}
          <div className={`mt-4 p-3 rounded-xl ${darkMode ? 'bg-gray-800/50' : 'bg-gray-50'} flex flex-wrap gap-4 text-sm`}>
            <div className="flex items-center gap-2">
              <Target className={`w-4 h-4 ${darkMode ? 'text-blue-400' : 'text-blue-500'}`} />
              <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Квизов:</span>
              <span className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {userProgress.stats.quizzesPassed}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Book className={`w-4 h-4 ${darkMode ? 'text-green-400' : 'text-green-500'}`} />
              <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Слов:</span>
              <span className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {userProgress.stats.wordsLearned}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Star className={`w-4 h-4 ${darkMode ? 'text-yellow-400' : 'text-yellow-500'}`} />
              <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Отлично (80%+):</span>
              <span className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {userProgress.stats.perfectQuizzes}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Globe className={`w-4 h-4 ${darkMode ? 'text-purple-400' : 'text-purple-500'}`} />
              <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Категорий:</span>
              <span className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {userProgress.stats.categories.length}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className={`w-4 h-4 ${darkMode ? 'text-pink-400' : 'text-pink-500'}`} />
              <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Словарей:</span>
              <span className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {userProgress.stats.vocabularies}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Rewards Info */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className={`p-4 rounded-2xl ${darkMode ? 'bg-gradient-to-r from-purple-900/30 to-pink-900/30 border border-purple-700/30' : 'bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200'}`}>
          <h3 className={`font-bold mb-3 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            <Gift className="w-5 h-5 text-purple-500" />
            Награды за действия
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {Object.entries(ACTION_REWARDS).slice(0, 5).map(([key, reward]) => (
              <div key={key} className={`p-3 rounded-xl ${darkMode ? 'bg-gray-800/50' : 'bg-white/70'} text-center`}>
                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>{reward.label}</p>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-purple-500 font-bold">+{reward.xp} XP</span>
                  <span className="text-yellow-500 font-bold">+{reward.coins} 🪙</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Map Area */}
      <div className="relative" ref={mapRef}>
        <div className="max-w-7xl mx-auto px-4 pb-8">
          {/* Map Container */}
          <div className={`
            relative w-full rounded-3xl overflow-hidden
            ${darkMode 
              ? 'bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 border border-gray-700' 
              : 'bg-gradient-to-b from-sky-200 via-green-100 to-amber-100 border border-white/50'
            }
            shadow-2xl
          `}
          style={{ height: '700px' }}
          >
            {/* Background decorations */}
            <div className="absolute inset-0 overflow-hidden">
              {darkMode ? (
                // Stars for dark mode
                <>
                  {[...Array(80)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
                      style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                        animationDelay: `${Math.random() * 3}s`,
                        opacity: Math.random() * 0.6 + 0.2
                      }}
                    />
                  ))}
                  {/* Nebula effects */}
                  <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl" />
                  <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl" />
                </>
              ) : (
                // Clouds and decorations for light mode
                <>
                  {[...Array(8)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute bg-white/60 rounded-full blur-xl animate-float"
                      style={{
                        width: `${60 + Math.random() * 100}px`,
                        height: `${30 + Math.random() * 40}px`,
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 40}%`,
                        animationDelay: `${Math.random() * 5}s`
                      }}
                    />
                  ))}
                  {/* Grass and decorations */}
                  <div className="absolute bottom-0 left-0 w-full h-20 bg-gradient-to-t from-green-300/30 to-transparent" />
                </>
              )}
            </div>

            {/* SVG Path - Road */}
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              {/* Road glow */}
              <path
                d={generatePath()}
                fill="none"
                stroke={darkMode ? 'rgba(139, 92, 246, 0.3)' : 'rgba(0,0,0,0.1)'}
                strokeWidth="5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Main road */}
              <path
                d={generatePath()}
                fill="none"
                stroke={darkMode ? '#374151' : '#d1d5db'}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Road center line */}
              <path
                d={generatePath()}
                fill="none"
                stroke={darkMode ? '#6b7280' : '#f3f4f6'}
                strokeWidth="0.4"
                strokeDasharray="1.5 1.5"
                strokeLinecap="round"
              />
            </svg>

            {/* Level Nodes */}
            {ROADMAP_LEVELS.map((level) => {
              const status = getLevelStatus(level);
              const Icon = level.icon;
              const progress = getProgressPercent(level);
              
              return (
                <button
                  key={level.id}
                  onClick={() => handleLevelClick(level)}
                  className={`
                    absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300
                    ${status === 'locked' ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:scale-110'}
                    group z-10
                  `}
                  style={{
                    left: `${level.position.x}%`,
                    top: `${level.position.y}%`,
                  }}
                  disabled={status === 'locked'}
                >
                  {/* Glow effect */}
                  {(status === 'completed' || status === 'current') && (
                    <div className={`
                      absolute inset-0 rounded-full blur-xl animate-pulse
                      bg-gradient-to-br ${level.color}
                    `} style={{ width: '70px', height: '70px', margin: '-15px', opacity: 0.5 }} />
                  )}
                  
                  {/* Progress ring for current level */}
                  {status === 'current' && progress > 0 && (
                    <svg className="absolute -inset-2 w-[72px] h-[72px] -rotate-90">
                      <circle
                        cx="36"
                        cy="36"
                        r="32"
                        fill="none"
                        stroke={darkMode ? '#374151' : '#e5e7eb'}
                        strokeWidth="4"
                      />
                      <circle
                        cx="36"
                        cy="36"
                        r="32"
                        fill="none"
                        stroke="url(#progressGradient)"
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeDasharray={`${progress * 2.01} 201`}
                      />
                      <defs>
                        <linearGradient id="progressGradient">
                          <stop offset="0%" stopColor="#a855f7" />
                          <stop offset="100%" stopColor="#ec4899" />
                        </linearGradient>
                      </defs>
                    </svg>
                  )}
                  
                  {/* Node circle */}
                  <div className={`
                    relative w-14 h-14 rounded-full flex items-center justify-center
                    transition-all duration-300 shadow-lg
                    ${status === 'completed' 
                      ? `bg-gradient-to-br ${level.color}` 
                      : status === 'current'
                        ? `bg-gradient-to-br ${level.color} ring-4 ring-white/50`
                        : status === 'available'
                          ? darkMode ? 'bg-gray-700 ring-2 ring-purple-500/50' : 'bg-gray-200 ring-2 ring-purple-300'
                          : darkMode ? 'bg-gray-800' : 'bg-gray-300'
                    }
                  `}>
                    {status === 'completed' ? (
                      <CheckCircle className="w-7 h-7 text-white" />
                    ) : status === 'locked' ? (
                      <Lock className={`w-5 h-5 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
                    ) : (
                      <Icon className={`w-7 h-7 ${status === 'current' || status === 'available' ? 'text-white' : darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                    )}
                    
                    {/* Level number badge */}
                    <div className={`
                      absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold
                      ${status === 'completed' 
                        ? 'bg-green-500 text-white' 
                        : status === 'current'
                          ? 'bg-yellow-500 text-white animate-bounce'
                          : darkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-200 text-gray-500'
                      }
                    `}>
                      {level.id}
                    </div>
                  </div>
                  
                  {/* Tooltip */}
                  <div className={`
                    absolute left-1/2 -translate-x-1/2 mt-2 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap
                    opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20
                    ${darkMode ? 'bg-gray-800 text-white border border-gray-700' : 'bg-white text-gray-900 border border-gray-200'}
                    shadow-lg
                  `}>
                    <div className="font-bold">{level.title}</div>
                    <div className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      +{level.reward.xp} XP • +{level.reward.coins} 🪙
                    </div>
                  </div>
                </button>
              );
            })}

            {/* Character */}
            <div
              className={`
                absolute w-20 h-20 transform -translate-x-1/2 -translate-y-1/2 transition-all
                ${isAnimating ? 'duration-100' : 'duration-500'}
                z-20
              `}
              style={{
                left: `${characterPosition.x}%`,
                top: `${characterPosition.y}%`,
              }}
            >
              {/* Character shadow */}
              <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-10 h-3 bg-black/30 rounded-full blur-sm" />
              
              {/* Character container */}
              <div className={`
                relative w-14 h-14 mx-auto rounded-full overflow-hidden border-4
                ${darkMode ? 'border-yellow-400 bg-gray-800' : 'border-yellow-400 bg-white'}
                shadow-xl
                ${isAnimating ? 'animate-bounce' : ''}
              `}>
                <img 
                  src="/user.png" 
                  alt="Character"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <div className="hidden w-full h-full items-center justify-center text-2xl bg-gradient-to-br from-purple-500 to-pink-500">
                  🧑‍🎓
                </div>
              </div>
              
              {/* Name tag */}
              <div className={`
                absolute -bottom-5 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full text-xs font-bold whitespace-nowrap
                bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900
                shadow-lg
              `}>
                Ты здесь!
              </div>
            </div>

            {/* Finish flag */}
            <div className="absolute left-[30%] top-[2%] transform -translate-x-1/2 z-10">
              <div className="text-3xl animate-bounce">🏁</div>
            </div>
            
            {/* Start flag */}
            <div className="absolute left-[10%] top-[90%] transform -translate-x-1/2 -translate-y-1/2 z-10">
              <div className="text-2xl">🚀</div>
            </div>
          </div>

          {/* Level Details Panel */}
          {selectedLevel && (
            <div className={`
              mt-6 rounded-2xl overflow-hidden
              ${darkMode ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200'}
              shadow-xl
            `}>
              {/* Header */}
              <div className={`p-6 bg-gradient-to-r ${selectedLevel.color} relative`}>
                <button 
                  onClick={() => setSelectedLevel(null)}
                  className="absolute top-4 right-4 p-2 rounded-full bg-black/20 hover:bg-black/40 transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
                <div className="flex items-center gap-4">
                  <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm">
                    <selectedLevel.icon className="w-10 h-10 text-white" />
                  </div>
                  <div className="text-white">
                    <p className="text-sm opacity-80">Уровень {selectedLevel.id} из {ROADMAP_LEVELS.length}</p>
                    <h2 className="text-2xl font-bold">{selectedLevel.title}</h2>
                    <p className="opacity-90">{selectedLevel.description}</p>
                  </div>
                </div>
              </div>
              
              {/* Content */}
              <div className="p-6">
                <div className="grid md:grid-cols-3 gap-6">
                  {/* Progress */}
                  <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                    <h3 className={`font-semibold mb-3 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      <TrendingUp className="w-5 h-5 text-blue-500" />
                      Прогресс
                    </h3>
                    <div className={`h-4 rounded-full overflow-hidden ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                      <div 
                        className={`h-full bg-gradient-to-r ${selectedLevel.color} transition-all duration-500`}
                        style={{ width: `${getLevelStatus(selectedLevel) === 'completed' ? 100 : getProgressPercent(selectedLevel)}%` }}
                      />
                    </div>
                    <p className={`text-sm mt-2 font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {getLevelStatus(selectedLevel) === 'completed' 
                        ? '✅ Выполнено!' 
                        : `${getProgressPercent(selectedLevel)}% выполнено`
                      }
                    </p>
                  </div>
                  
                  {/* Requirements */}
                  <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                    <h3 className={`font-semibold mb-3 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      <Target className="w-5 h-5 text-orange-500" />
                      Требования
                    </h3>
                    <ul className="space-y-2">
                      {selectedLevel.requirement.quizzes && (
                        <li className={`flex items-center gap-2 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                          <Target className="w-4 h-4 text-blue-500 flex-shrink-0" />
                          <span>Пройти {selectedLevel.requirement.quizzes} квизов</span>
                          <span className="ml-auto font-medium">
                            {userProgress.stats.quizzesPassed}/{selectedLevel.requirement.quizzes}
                          </span>
                          {userProgress.stats.quizzesPassed >= selectedLevel.requirement.quizzes && (
                            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                          )}
                        </li>
                      )}
                      {selectedLevel.requirement.words && (
                        <li className={`flex items-center gap-2 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                          <Book className="w-4 h-4 text-green-500 flex-shrink-0" />
                          <span>Выучить {selectedLevel.requirement.words} слов</span>
                          <span className="ml-auto font-medium">
                            {userProgress.stats.wordsLearned}/{selectedLevel.requirement.words}
                          </span>
                          {userProgress.stats.wordsLearned >= selectedLevel.requirement.words && (
                            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                          )}
                        </li>
                      )}
                      {selectedLevel.requirement.perfectQuizzes && (
                        <li className={`flex items-center gap-2 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                          <Star className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                          <span>80%+ в {selectedLevel.requirement.perfectQuizzes} квизах</span>
                          <span className="ml-auto font-medium">
                            {userProgress.stats.perfectQuizzes}/{selectedLevel.requirement.perfectQuizzes}
                          </span>
                          {userProgress.stats.perfectQuizzes >= selectedLevel.requirement.perfectQuizzes && (
                            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                          )}
                        </li>
                      )}
                      {selectedLevel.requirement.categories && (
                        <li className={`flex items-center gap-2 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                          <Globe className="w-4 h-4 text-purple-500 flex-shrink-0" />
                          <span>Квизы в {selectedLevel.requirement.categories} категориях</span>
                          <span className="ml-auto font-medium">
                            {userProgress.stats.categories.length}/{selectedLevel.requirement.categories}
                          </span>
                          {userProgress.stats.categories.length >= selectedLevel.requirement.categories && (
                            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                          )}
                        </li>
                      )}
                      {selectedLevel.requirement.vocabularies && (
                        <li className={`flex items-center gap-2 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                          <Sparkles className="w-4 h-4 text-pink-500 flex-shrink-0" />
                          <span>Создать {selectedLevel.requirement.vocabularies} словарей</span>
                          <span className="ml-auto font-medium">
                            {userProgress.stats.vocabularies}/{selectedLevel.requirement.vocabularies}
                          </span>
                          {userProgress.stats.vocabularies >= selectedLevel.requirement.vocabularies && (
                            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                          )}
                        </li>
                      )}
                    </ul>
                  </div>
                  
                  {/* Reward */}
                  <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                    <h3 className={`font-semibold mb-3 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      <Gift className="w-5 h-5 text-purple-500" />
                      Награда
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500`}>
                          <Zap className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className={`font-bold text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            +{selectedLevel.reward.xp} XP
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg bg-gradient-to-br from-yellow-400 to-orange-500`}>
                          <Coins className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className={`font-bold text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            +{selectedLevel.reward.coins} монет
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg bg-gradient-to-br ${selectedLevel.color}`}>
                          <Award className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            Значок "{selectedLevel.reward.badge}"
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    {getLevelStatus(selectedLevel) !== 'locked' && getLevelStatus(selectedLevel) !== 'completed' && (
                      <button
                        onClick={() => startChallenge(selectedLevel)}
                        className={`
                          w-full mt-4 py-3 rounded-xl font-semibold text-white
                          bg-gradient-to-r ${selectedLevel.color}
                          hover:opacity-90 transition-all flex items-center justify-center gap-2
                          hover:scale-[1.02] active:scale-[0.98]
                        `}
                      >
                        <Play className="w-5 h-5" />
                        Начать выполнение
                      </button>
                    )}
                    
                    {getLevelStatus(selectedLevel) === 'completed' && (
                      <div className="mt-4 flex items-center justify-center gap-2 text-green-500 py-3 rounded-xl bg-green-500/10">
                        <CheckCircle className="w-6 h-6" />
                        <span className="font-bold text-lg">Выполнено!</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Badges Collection */}
          <div className={`
            mt-8 p-6 rounded-2xl
            ${darkMode ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200'}
          `}>
            <h2 className={`text-xl font-bold mb-4 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              <Trophy className="w-6 h-6 text-yellow-500" />
              Твоя коллекция значков ({userProgress.badges.length}/{ROADMAP_LEVELS.length})
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {ROADMAP_LEVELS.map((level) => {
                const earned = userProgress.badges.includes(level.reward.badge);
                return (
                  <div
                    key={level.id}
                    className={`
                      p-3 rounded-xl flex flex-col items-center gap-2 transition-all
                      ${earned 
                        ? `bg-gradient-to-br ${level.color} text-white shadow-lg` 
                        : darkMode 
                          ? 'bg-gray-800 text-gray-600' 
                          : 'bg-gray-100 text-gray-400'
                      }
                    `}
                  >
                    <div className={`p-2 rounded-full ${earned ? 'bg-white/20' : darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                      {earned ? <level.icon className="w-6 h-6" /> : <Lock className="w-6 h-6" />}
                    </div>
                    <span className="font-medium text-sm text-center">{level.reward.badge}</span>
                    <span className={`text-xs ${earned ? 'text-white/80' : ''}`}>Ур. {level.id}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      
      {/* CSS for animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default Roadmap;
