import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Play, 
  Zap, 
  Clock, 
  Users, 
  Trophy, 
  Shuffle,
  Flame,
  Target,
  Brain,
  Sparkles,
  ChevronRight,
  Star,
  TrendingUp,
  Loader2
} from 'lucide-react';
import { quizAPI } from '../../services/api';

const QuickPlay = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [quizzes, setQuizzes] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const response = await quizAPI.getQuizzes({ limit: 50 });
      console.log('QuickPlay response:', response.data);
      const data = response.data?.data || response.data;
      const quizList = data?.quizzes || data || [];
      setQuizzes(Array.isArray(quizList) ? quizList : []);
    } catch (err) {
      console.error('Error fetching quizzes:', err);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { id: 'all', label: 'Все', icon: '🎯' },
    { id: 'general', label: 'Общие', icon: '📚' },
    { id: 'science', label: 'Наука', icon: '🔬' },
    { id: 'history', label: 'История', icon: '📜' },
    { id: 'geography', label: 'География', icon: '🌍' },
    { id: 'sports', label: 'Спорт', icon: '⚽' },
    { id: 'technology', label: 'Технологии', icon: '💻' },
    { id: 'entertainment', label: 'Развлечения', icon: '🎭' },
  ];

  const difficulties = [
    { id: 'all', label: 'Любая', color: 'gray' },
    { id: 'beginner', label: 'Лёгкий', color: 'green' },
    { id: 'intermediate', label: 'Средний', color: 'yellow' },
    { id: 'advanced', label: 'Сложный', color: 'orange' },
    { id: 'expert', label: 'Эксперт', color: 'red' },
  ];

  const gameModes = [
    {
      id: 'random',
      title: 'Случайный квиз',
      description: 'Испытай удачу! Случайная викторина из всей коллекции',
      icon: Shuffle,
      gradient: 'from-purple-500 to-pink-500',
      action: () => {
        const randomQuiz = quizzes[Math.floor(Math.random() * quizzes.length)];
        if (randomQuiz) navigate(`/quiz/${randomQuiz._id}`);
      }
    },
    {
      id: 'speed',
      title: 'Скоростной режим',
      description: 'Только короткие квизы до 10 вопросов. Быстро и динамично!',
      icon: Zap,
      gradient: 'from-yellow-500 to-orange-500',
      action: () => {
        const shortQuizzes = quizzes.filter(q => q.questions?.length <= 10);
        const randomQuiz = shortQuizzes[Math.floor(Math.random() * shortQuizzes.length)];
        if (randomQuiz) navigate(`/quiz/${randomQuiz._id}`);
      }
    },
    {
      id: 'marathon',
      title: 'Марафон',
      description: 'Длинные квизы для настоящих знатоков. 15+ вопросов',
      icon: Flame,
      gradient: 'from-red-500 to-orange-500',
      action: () => {
        const longQuizzes = quizzes.filter(q => q.questions?.length >= 15);
        const randomQuiz = longQuizzes[Math.floor(Math.random() * longQuizzes.length)] 
          || quizzes[Math.floor(Math.random() * quizzes.length)];
        if (randomQuiz) navigate(`/quiz/${randomQuiz._id}`);
      }
    },
    {
      id: 'popular',
      title: 'Популярные',
      description: 'Самые популярные квизы по мнению сообщества',
      icon: TrendingUp,
      gradient: 'from-blue-500 to-cyan-500',
      action: () => {
        const sortedQuizzes = [...quizzes].sort((a, b) => 
          (b.stats?.plays || 0) - (a.stats?.plays || 0)
        );
        if (sortedQuizzes[0]) navigate(`/quiz/${sortedQuizzes[0]._id}`);
      }
    },
  ];

  const filteredQuizzes = quizzes.filter(quiz => {
    if (selectedCategory !== 'all' && quiz.category !== selectedCategory) return false;
    if (selectedDifficulty !== 'all' && quiz.difficulty !== selectedDifficulty) return false;
    return true;
  });

  const startRandomFiltered = () => {
    if (filteredQuizzes.length > 0) {
      const randomQuiz = filteredQuizzes[Math.floor(Math.random() * filteredQuizzes.length)];
      navigate(`/quiz/${randomQuiz._id}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
        <span className="ml-3 text-gray-600 dark:text-gray-400">Загрузка...</span>
      </div>
    );
  }

  // Если нет публичных квизов
  if (quizzes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-20 h-20 rounded-full bg-purple-500/20 flex items-center justify-center mb-4">
          <Play className="text-purple-500" size={40} />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Пока нет доступных квизов
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md">
          Создайте свой первый публичный квиз или подождите, пока другие пользователи добавят свои!
        </p>
        <button
          onClick={() => navigate('/create-quiz')}
          className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium rounded-xl hover:opacity-90 transition-opacity"
        >
          Создать квиз
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 mb-4">
          <Zap className="text-yellow-400" size={18} />
          <span className="text-purple-400 font-medium">Быстрый старт</span>
        </div>
        <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Быстрая игра
        </h1>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Выбери режим и начни играть мгновенно! Без регистрации, без ожидания.
        </p>
      </div>

      {/* Game Modes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {gameModes.map((mode) => {
          const Icon = mode.icon;
          return (
            <button
              key={mode.id}
              onClick={mode.action}
              disabled={quizzes.length === 0}
              className="group relative p-6 rounded-2xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 
                       hover:border-transparent hover:shadow-xl transition-all duration-300 text-left
                       disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${mode.gradient} opacity-0 group-hover:opacity-10 transition-opacity`} />
              
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${mode.gradient} 
                            flex items-center justify-center mb-4 shadow-lg`}>
                <Icon className="text-white" size={28} />
              </div>
              
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                {mode.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {mode.description}
              </p>
              
              <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                <ChevronRight className="text-purple-500" size={24} />
              </div>
            </button>
          );
        })}
      </div>

      {/* Custom Quick Play */}
      <div className="p-6 rounded-2xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 shadow-sm dark:shadow-none">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <Target className="text-white" size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Настрой свою игру</h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm">Выбери категорию и сложность</p>
          </div>
        </div>

        {/* Category Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Категория</label>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/30'
                    : 'bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Difficulty Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Сложность</label>
          <div className="flex flex-wrap gap-2">
            {difficulties.map((diff) => (
              <button
                key={diff.id}
                onClick={() => setSelectedDifficulty(diff.id)}
                className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  selectedDifficulty === diff.id
                    ? diff.color === 'gray' 
                      ? 'bg-gray-600 text-white'
                      : diff.color === 'green'
                        ? 'bg-green-500 text-white shadow-lg shadow-green-500/30'
                        : diff.color === 'yellow'
                          ? 'bg-yellow-500 text-white shadow-lg shadow-yellow-500/30'
                          : diff.color === 'orange'
                            ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30'
                            : 'bg-red-500 text-white shadow-lg shadow-red-500/30'
                    : 'bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10'
                }`}
              >
                {diff.label}
              </button>
            ))}
          </div>
        </div>

        {/* Start Button */}
        <div className="flex items-center justify-between">
          <p className="text-gray-600 dark:text-gray-400">
            Найдено: <span className="font-bold text-purple-500">{filteredQuizzes.length}</span> квизов
          </p>
          <button
            onClick={startRandomFiltered}
            disabled={filteredQuizzes.length === 0}
            className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 
                     text-white font-bold rounded-xl shadow-lg shadow-purple-500/30 
                     hover:shadow-xl hover:shadow-purple-500/40 transition-all
                     disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Play size={24} />
            <span>Начать игру</span>
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-center">
          <Brain className="w-8 h-8 text-purple-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{quizzes.length}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Всего квизов</p>
        </div>
        <div className="p-4 rounded-xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-center">
          <Users className="w-8 h-8 text-blue-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {quizzes.reduce((acc, q) => acc + (q.stats?.plays || 0), 0)}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Прохождений</p>
        </div>
        <div className="p-4 rounded-xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-center">
          <Star className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {quizzes.filter(q => (q.stats?.plays || 0) > 50).length}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Популярных</p>
        </div>
        <div className="p-4 rounded-xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-center">
          <Sparkles className="w-8 h-8 text-pink-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {new Set(quizzes.map(q => q.category)).size}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Категорий</p>
        </div>
      </div>
    </div>
  );
};

export default QuickPlay;
