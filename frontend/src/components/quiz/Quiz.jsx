import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { quizAPI, gameAPI } from '../../services/api';
import Comments from './Comments';
import {
  Clock,
  Trophy,
  Target,
  CheckCircle2,
  XCircle,
  ArrowRight,
  RotateCcw,
  Home,
  Brain,
  Award,
  Timer,
  BarChart3,
  Loader2,
  Users,
  Star,
  Play,
  Eye,
  Heart,
  Share2,
  BookOpen,
  ChevronLeft,
  Calendar,
  Zap,
  MessageCircle,
  Sparkles
} from 'lucide-react';

// Функция для генерации цвета на основе имени пользователя
const getAvatarColor = (username) => {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
    '#F8B500', '#00CED1', '#FF69B4', '#32CD32', '#FFD700'
  ];
  if (!username) return colors[0];
  const index = username.charCodeAt(0) % colors.length;
  return colors[index];
};

const Quiz = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [gameId, setGameId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [gameStarted, setGameStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);
  const [finished, setFinished] = useState(false);
  const [results, setResults] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [likeLoading, setLikeLoading] = useState(false);

  useEffect(() => {
    fetchQuiz();
  }, [id]);

  useEffect(() => {
    if (timeLeft > 0 && gameStarted && !finished) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && gameStarted) {
      finishQuiz();
    }
  }, [timeLeft, gameStarted, finished]);

  const fetchQuiz = async () => {
    try {
      const response = await quizAPI.getQuizById(id);
      const quizData = response.data.data?.quiz || response.data.data;
      setQuiz(quizData);
      setLikesCount(quizData.stats?.likes || quizData.likesCount || 0);
      
      // Проверяем, лайкнул ли текущий пользователь
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (user._id && quizData.social?.likes) {
        const userLiked = quizData.social.likes.some(like => 
          like.user === user._id || like.user?._id === user._id
        );
        setIsLiked(userLiked);
      }
      
      if (quizData?.timeLimit) {
        setTimeLeft(quizData.timeLimit * 60);
      }
    } catch (err) {
      console.error('Ошибка загрузки викторины:', err);
    } finally {
      setLoading(false);
    }
  };

  const startGame = async () => {
    try {
      const response = await gameAPI.startGame(id);
      const gameData = response.data.data;
      setGameId(gameData.sessionId);
      
      if (gameData.questions) {
        setQuiz(prev => ({
          ...prev,
          questions: gameData.questions
        }));
      }
      
      setGameStarted(true);
    } catch (err) {
      console.error('Ошибка начала игры:', err);
    }
  };

  const handleAnswerSelect = (answer) => {
    setAnswers({
      ...answers,
      [currentQuestion]: answer
    });
  };

  const submitCurrentAnswer = async () => {
    if (!gameId || answers[currentQuestion] === undefined) return null;

    try {
      const response = await gameAPI.submitAnswer(
        gameId, 
        quiz.questions[currentQuestion]._id, 
        answers[currentQuestion]
      );
      return response.data;
    } catch (err) {
      console.error('Ошибка отправки ответа:', err);
      throw err;
    }
  };

  const nextQuestion = async () => {
    try {
      const response = await submitCurrentAnswer();
      
      if (response?.data?.result) {
        setResults(response.data.result);
        setFinished(true);
        return;
      }
      
      if (currentQuestion < quiz.questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
      } else {
        await finishQuiz();
      }
    } catch (err) {
      console.error('Ошибка при переходе к следующему вопросу:', err);
    }
  };

  const finishQuiz = async () => {
    if (!gameId) return;

    try {
      const response = await gameAPI.getGameResult(gameId);
      setResults(response.data.data);
      setFinished(true);
    } catch (err) {
      console.error('Ошибка завершения викторины:', err);
    }
  };

  const handleLike = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    setLikeLoading(true);
    try {
      const response = await quizAPI.toggleLike(id);
      const data = response.data.data;
      setIsLiked(data.isLiked);
      setLikesCount(data.totalLikes);
    } catch (err) {
      console.error('Ошибка лайка:', err);
    } finally {
      setLikeLoading(false);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: quiz.title,
          text: quiz.description,
          url: url
        });
      } catch (err) {
        console.log('Отменено');
      }
    } else {
      navigator.clipboard.writeText(url);
      alert('Ссылка скопирована!');
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getDifficultyData = (difficulty) => {
    const data = {
      beginner: { text: 'Начинающий', color: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500' },
      easy: { text: 'Лёгкий', color: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500' },
      intermediate: { text: 'Средний', color: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500' },
      medium: { text: 'Средний', color: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500' },
      advanced: { text: 'Сложный', color: 'bg-rose-100 text-rose-700', dot: 'bg-rose-500' },
      hard: { text: 'Сложный', color: 'bg-rose-100 text-rose-700', dot: 'bg-rose-500' },
      expert: { text: 'Эксперт', color: 'bg-purple-100 text-purple-700', dot: 'bg-purple-500' }
    };
    return data[difficulty] || { text: difficulty, color: 'bg-gray-100 text-gray-700', dot: 'bg-gray-500' };
  };

  const getCategoryText = (category) => {
    const categories = {
      general: 'Общие знания',
      science: 'Наука',
      history: 'История',
      geography: 'География',
      sports: 'Спорт',
      entertainment: 'Развлечения',
      technology: 'Технологии',
      art: 'Искусство',
      music: 'Музыка',
      movies: 'Кино',
      literature: 'Литература',
      nature: 'Природа',
      food: 'Еда',
      travel: 'Путешествия',
      languages: 'Языки',
      mathematics: 'Математика',
      business: 'Бизнес',
      gaming: 'Игры',
      anime: 'Аниме',
      custom: 'Другое'
    };
    return categories[category] || category;
  };

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-purple-500 animate-spin mx-auto mb-4" />
          <p className="text-white/60">Загрузка викторины...</p>
        </div>
      </div>
    );
  }

  // Error State
  if (!quiz) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center max-w-md">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Викторина не найдена</h2>
          <p className="text-white/60 mb-6">Возможно, она была удалена или перемещена</p>
          <button 
            onClick={() => navigate('/quizzes')} 
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium hover:opacity-90 transition-opacity"
          >
            <Home className="w-4 h-4" />
            К списку викторин
          </button>
        </div>
      </div>
    );
  }

  // Results Screen
  if (finished && results) {
    const isPassed = results.passed;
    
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4">
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden max-w-lg w-full">
          {/* Top bar */}
          <div className={`h-2 ${isPassed ? 'bg-gradient-to-r from-emerald-500 to-green-500' : 'bg-gradient-to-r from-red-500 to-orange-500'}`} />
          
          <div className="p-8 text-center">
            {/* Icon */}
            <div className="mb-4">
              {isPassed ? (
                <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto">
                  <Trophy className="w-10 h-10 text-emerald-400" />
                </div>
              ) : (
                <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto">
                  <Target className="w-10 h-10 text-red-400" />
                </div>
              )}
            </div>

            {/* Title */}
            <h1 className="text-2xl font-bold text-white mb-1">
              {isPassed ? 'Поздравляем!' : 'Попробуйте ещё раз'}
            </h1>
            <p className="text-white/60 mb-6">{quiz.title}</p>

            {/* Score Circle */}
            <div className={`w-32 h-32 rounded-full mx-auto mb-6 flex flex-col items-center justify-center ${
              isPassed 
                ? 'bg-gradient-to-br from-emerald-500/20 to-green-500/20 border-2 border-emerald-500/50' 
                : 'bg-gradient-to-br from-red-500/20 to-orange-500/20 border-2 border-red-500/50'
            }`}>
              <div className={`text-3xl font-bold ${isPassed ? 'text-emerald-400' : 'text-red-400'}`}>
                {results.percentage}%
              </div>
              <div className="text-white/40 text-sm">результат</div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-white/5 rounded-xl p-4 text-center">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 mx-auto mb-2" />
                <div className="text-xl font-bold text-white">{results.correctAnswers}</div>
                <div className="text-xs text-white/40">Правильных</div>
              </div>
              <div className="bg-white/5 rounded-xl p-4 text-center">
                <BarChart3 className="w-5 h-5 text-purple-400 mx-auto mb-2" />
                <div className="text-xl font-bold text-white">{results.totalQuestions}</div>
                <div className="text-xs text-white/40">Всего</div>
              </div>
              <div className="bg-white/5 rounded-xl p-4 text-center">
                <Timer className="w-5 h-5 text-amber-400 mx-auto mb-2" />
                <div className="text-xl font-bold text-white">{results.timeSpent}с</div>
                <div className="text-xs text-white/40">Время</div>
              </div>
            </div>

            {/* Points */}
            <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl p-4 flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-500/30 rounded-lg flex items-center justify-center">
                  <Award className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <div className="text-white/60 text-sm">Заработано очков</div>
                  <div className="text-xl font-bold text-white">{results.score}</div>
                </div>
              </div>
              <Zap className="w-6 h-6 text-yellow-400" />
            </div>

            {/* Status */}
            <div className="mb-6">
              <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
                isPassed 
                  ? 'bg-emerald-500/20 text-emerald-400' 
                  : 'bg-red-500/20 text-red-400'
              }`}>
                {isPassed ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Тест пройден
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4" />
                    Тест не пройден
                  </>
                )}
              </span>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button 
                onClick={() => navigate('/quizzes')}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white/5 border border-white/10 text-white rounded-xl font-medium hover:bg-white/10 transition-colors"
              >
                <Home className="w-4 h-4" />
                К викторинам
              </button>
              <button 
                onClick={() => window.location.reload()}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium hover:opacity-90 transition-opacity"
              >
                <RotateCcw className="w-4 h-4" />
                Пройти снова
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Start Screen
  if (!gameStarted) {
    const questionsCount = Array.isArray(quiz.questions) ? quiz.questions.length : 0;
    const creator = quiz.creator || {};
    const difficulty = getDifficultyData(quiz.difficulty);
    
    return (
      <div className="min-h-screen bg-[#0a0a0f]">
        {/* Header */}
        <div className="border-b border-white/10 bg-white/5 backdrop-blur-sm sticky top-0 z-10">
          <div className="max-w-5xl mx-auto px-4 py-4">
            <button 
              onClick={() => navigate('/quizzes')}
              className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
              <span>Назад к викторинам</span>
            </button>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main Card */}
            <div className="lg:col-span-2">
              <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                {/* Thumbnail */}
                {quiz.thumbnail?.url ? (
                  <div className="relative h-64 overflow-hidden">
                    <img src={quiz.thumbnail.url} alt={quiz.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                    <div className="absolute bottom-4 left-4 flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-full">
                      <BookOpen className="w-4 h-4 text-purple-400" />
                      <span className="text-white text-sm">{getCategoryText(quiz.category)}</span>
                    </div>
                  </div>
                ) : (
                  <div className="relative h-48 bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                    <Brain className="w-16 h-16 text-purple-400/50" />
                    <div className="absolute bottom-4 left-4 flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-full">
                      <BookOpen className="w-4 h-4 text-purple-400" />
                      <span className="text-white text-sm">{getCategoryText(quiz.category)}</span>
                    </div>
                  </div>
                )}

                <div className="p-6">
                  {/* Badges */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${difficulty.color}`}>
                      <span className={`w-2 h-2 rounded-full ${difficulty.dot}`} />
                      {difficulty.text}
                    </span>
                    {quiz.stats?.averageScore > 0 && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/20 text-amber-400 rounded-full text-sm">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        {Math.round(quiz.stats.averageScore)}% средний балл
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h1 className="text-2xl font-bold text-white mb-3">{quiz.title}</h1>

                  {/* Description */}
                  {quiz.description && (
                    <p className="text-white/60 mb-6 leading-relaxed">{quiz.description}</p>
                  )}

                  {/* Creator & Date */}
                  <div className="flex flex-wrap items-center gap-4 mb-6 pb-6 border-b border-white/10">
                    {creator.username && (
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden"
                          style={!creator.profile?.avatar?.url ? { backgroundColor: getAvatarColor(creator.username) } : {}}
                        >
                          {creator.profile?.avatar?.url ? (
                            <img src={creator.profile.avatar.url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-white font-medium">{creator.username?.charAt(0).toUpperCase()}</span>
                          )}
                        </div>
                        <div>
                          <div className="text-white font-medium">{creator.username}</div>
                          <div className="text-white/40 text-sm">Автор</div>
                        </div>
                      </div>
                    )}
                    
                    {quiz.createdAt && (
                      <div className="flex items-center gap-2 text-white/40 text-sm">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(quiz.createdAt)}</span>
                      </div>
                    )}
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white/5 rounded-xl p-4 text-center">
                      <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                        <Target className="w-5 h-5 text-blue-400" />
                      </div>
                      <div className="text-xl font-bold text-white">{questionsCount}</div>
                      <div className="text-xs text-white/40">Вопросов</div>
                    </div>
                    
                    <div className="bg-white/5 rounded-xl p-4 text-center">
                      <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                        <Users className="w-5 h-5 text-emerald-400" />
                      </div>
                      <div className="text-xl font-bold text-white">{quiz.stats?.plays || 0}</div>
                      <div className="text-xs text-white/40">Прошли</div>
                    </div>
                    
                    <div className="bg-white/5 rounded-xl p-4 text-center">
                      <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                        <Trophy className="w-5 h-5 text-amber-400" />
                      </div>
                      <div className="text-xl font-bold text-white">{quiz.settings?.passingScore || 70}%</div>
                      <div className="text-xs text-white/40">Проходной</div>
                    </div>
                    
                    <div className="bg-white/5 rounded-xl p-4 text-center">
                      <div className="w-10 h-10 bg-rose-500/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                        <Clock className="w-5 h-5 text-rose-400" />
                      </div>
                      <div className="text-xl font-bold text-white">
                        {quiz.timeLimit ? `${quiz.timeLimit}` : '∞'}
                      </div>
                      <div className="text-xs text-white/40">
                        {quiz.timeLimit ? 'Минут' : 'Без лимита'}
                      </div>
                    </div>
                  </div>

                  {/* Social Stats */}
                  <div className="flex items-center gap-4 text-white/40 text-sm mb-6">
                    <div className="flex items-center gap-1.5">
                      <Eye className="w-4 h-4" />
                      <span>{quiz.stats?.views || 0} просмотров</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Heart className={`w-4 h-4 ${isLiked ? 'text-pink-500 fill-current' : ''}`} />
                      <span>{likesCount} нравится</span>
                    </div>
                  </div>

                  {/* Actions */}
                  {questionsCount > 0 ? (
                    <div className="space-y-4">
                      <button 
                        onClick={startGame}
                        className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold text-lg hover:opacity-90 transition-opacity group"
                      >
                        <Play className="w-6 h-6" />
                        Начать викторину
                        <Sparkles className="w-5 h-5 opacity-60 group-hover:opacity-100 transition-opacity" />
                      </button>
                      
                      <div className="flex gap-3">
                        <button 
                          onClick={handleShare} 
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white/5 border border-white/10 text-white rounded-xl hover:bg-white/10 transition-colors"
                        >
                          <Share2 className="w-4 h-4" />
                          <span>Поделиться</span>
                        </button>
                        <button 
                          onClick={handleLike}
                          disabled={likeLoading}
                          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-colors ${
                            isLiked 
                              ? 'bg-pink-500/20 border border-pink-500/50 text-pink-400' 
                              : 'bg-white/5 border border-white/10 text-white hover:bg-white/10'
                          }`}
                        >
                          <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                          <span>Нравится</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white/5 rounded-xl p-6 text-center">
                      <div className="w-12 h-12 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                        <XCircle className="w-6 h-6 text-amber-400" />
                      </div>
                      <p className="text-white font-medium mb-1">В этой викторине пока нет вопросов</p>
                      <span className="text-white/40 text-sm">Автор скоро добавит их</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar - Comments */}
            <div className="lg:col-span-1">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 sticky top-24">
                <div className="flex items-center gap-2 mb-4">
                  <MessageCircle className="w-5 h-5 text-purple-400" />
                  <h2 className="text-lg font-semibold text-white">Комментарии</h2>
                </div>
                <Comments quizId={id} />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Game Screen
  const question = quiz.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / quiz.questions.length) * 100;
  const isTimeLow = timeLeft !== null && timeLeft < 30;

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col">
      {/* Header */}
      <div className="border-b border-white/10 bg-white/5 backdrop-blur-sm">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <span className="text-white font-medium">
            Вопрос <span className="text-purple-400">{currentQuestion + 1}</span> из {quiz.questions.length}
          </span>
          
          {timeLeft !== null && (
            <span className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
              isTimeLow 
                ? 'bg-red-500/20 text-red-400 animate-pulse' 
                : 'bg-white/10 text-white'
            }`}>
              <Clock className="w-4 h-4" />
              {formatTime(timeLeft)}
            </span>
          )}
        </div>
        
        {/* Progress bar */}
        <div className="h-1 bg-white/10">
          <div 
            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question Card */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-3xl">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8">
            <h2 className="text-xl md:text-2xl font-bold text-white mb-6 text-center">
              {question.text || question.question}
            </h2>

            {question.image && (
              <img 
                src={question.image} 
                alt="Question" 
                className="max-w-full max-h-64 object-contain mx-auto rounded-xl mb-6" 
              />
            )}

            {/* Answer Options */}
            <div className="space-y-3">
              {question.options.map((option, index) => {
                const isSelected = answers[currentQuestion] === (option._id || index);
                const letter = String.fromCharCode(65 + index);
                
                return (
                  <button
                    key={option._id || index}
                    onClick={() => handleAnswerSelect(option._id || index)}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all ${
                      isSelected 
                        ? 'bg-purple-500/20 border-2 border-purple-500' 
                        : 'bg-white/5 border-2 border-transparent hover:bg-white/10 hover:border-white/20'
                    }`}
                  >
                    <span className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg shrink-0 ${
                      isSelected 
                        ? 'bg-purple-500 text-white' 
                        : 'bg-white/10 text-white/60'
                    }`}>
                      {letter}
                    </span>
                    <span className="text-white text-left flex-1">
                      {option.text || option}
                    </span>
                    {isSelected && (
                      <CheckCircle2 className="w-6 h-6 text-purple-400 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Next Button */}
            {answers[currentQuestion] !== undefined && (
              <div className="mt-6 flex justify-end">
                <button 
                  onClick={nextQuestion}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium hover:opacity-90 transition-opacity"
                >
                  {currentQuestion < quiz.questions.length - 1 ? (
                    <>
                      Следующий вопрос
                      <ArrowRight className="w-5 h-5" />
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-5 h-5" />
                      Завершить
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Quiz;
