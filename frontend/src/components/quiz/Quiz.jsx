import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { quizAPI, gameAPI } from '../../services/api';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import { Progress } from '../ui/Progress';
import { Badge } from '../ui/Badge';
import { cn } from '../../lib/utils';
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
  MessageCircle
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
      <div className="quiz-page-loading">
        <Loader2 className="quiz-loading-spinner" />
        <p>Загрузка викторины...</p>
      </div>
    );
  }

  // Error State
  if (!quiz) {
    return (
      <div className="quiz-page-error">
        <div className="quiz-error-card">
          <div className="quiz-error-icon">
            <XCircle />
          </div>
          <h2>Викторина не найдена</h2>
          <p>Возможно, она была удалена или перемещена</p>
          <Button onClick={() => navigate('/quizzes')} className="quiz-error-btn">
            <Home className="btn-icon" />
            К списку викторин
          </Button>
        </div>
      </div>
    );
  }

  // Results Screen
  if (finished && results) {
    const isPassed = results.passed;
    
    return (
      <div className="quiz-page-results">
        <div className="quiz-results-card">
          <div className={`quiz-results-bar ${isPassed ? 'passed' : 'failed'}`} />
          
          <div className="quiz-results-content">
            {/* Icon */}
            <div className="quiz-results-icon-wrap">
              {isPassed ? (
                <div className="quiz-results-icon passed">
                  <Trophy />
                </div>
              ) : (
                <div className="quiz-results-icon failed">
                  <Target />
                </div>
              )}
            </div>

            {/* Title */}
            <h1 className="quiz-results-title">
              {isPassed ? 'Поздравляем!' : 'Попробуйте ещё раз'}
            </h1>
            <p className="quiz-results-subtitle">{quiz.title}</p>

            {/* Score Circle */}
            <div className={`quiz-score-circle ${isPassed ? 'passed' : 'failed'}`}>
              <div className="quiz-score-value">{results.percentage}%</div>
              <div className="quiz-score-label">результат</div>
            </div>

            {/* Stats Grid */}
            <div className="quiz-results-stats">
              <div className="quiz-results-stat">
                <CheckCircle2 className="stat-icon correct" />
                <div className="stat-value">{results.correctAnswers}</div>
                <div className="stat-label">Правильных</div>
              </div>
              <div className="quiz-results-stat">
                <BarChart3 className="stat-icon total" />
                <div className="stat-value">{results.totalQuestions}</div>
                <div className="stat-label">Всего</div>
              </div>
              <div className="quiz-results-stat">
                <Timer className="stat-icon time" />
                <div className="stat-value">{results.timeSpent}с</div>
                <div className="stat-label">Время</div>
              </div>
            </div>

            {/* Points */}
            <div className="quiz-results-points">
              <div className="points-info">
                <div className="points-icon">
                  <Award />
                </div>
                <div className="points-text">
                  <span className="points-label">Заработано очков</span>
                  <span className="points-value">{results.score}</span>
                </div>
              </div>
              <Zap className="points-decoration" />
            </div>

            {/* Status */}
            <div className="quiz-results-status">
              <span className={`status-badge ${isPassed ? 'passed' : 'failed'}`}>
                {isPassed ? (
                  <>
                    <CheckCircle2 />
                    Тест пройден
                  </>
                ) : (
                  <>
                    <XCircle />
                    Тест не пройден
                  </>
                )}
              </span>
            </div>

            {/* Actions */}
            <div className="quiz-results-actions">
              <Button 
                variant="outline" 
                className="results-btn outline"
                onClick={() => navigate('/quizzes')}
              >
                <Home className="btn-icon" />
                К викторинам
              </Button>
              <Button 
                className="results-btn primary"
                onClick={() => window.location.reload()}
              >
                <RotateCcw className="btn-icon" />
                Пройти снова
              </Button>
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
      <div className="quiz-page-start">
        {/* Header */}
        <div className="quiz-page-header">
          <div className="quiz-header-content">
            <button 
              onClick={() => navigate('/quizzes')}
              className="quiz-back-btn"
            >
              <ChevronLeft />
              <span>Назад к викторинам</span>
            </button>
          </div>
        </div>

        <div className="quiz-start-container">
          {/* Main Card */}
          <div className="quiz-main-card">
            {/* Thumbnail */}
            {quiz.thumbnail?.url ? (
              <div className="quiz-thumbnail">
                <img src={quiz.thumbnail.url} alt={quiz.title} />
                <div className="quiz-thumbnail-overlay" />
                <div className="quiz-category-badge">
                  <BookOpen />
                  {getCategoryText(quiz.category)}
                </div>
              </div>
            ) : (
              <div className="quiz-thumbnail-placeholder">
                <Brain className="placeholder-icon" />
                <div className="quiz-category-badge">
                  <BookOpen />
                  {getCategoryText(quiz.category)}
                </div>
              </div>
            )}

            <div className="quiz-card-content">
              {/* Badges */}
              <div className="quiz-badges">
                <span className={`quiz-difficulty-badge ${difficulty.color}`}>
                  <span className={`difficulty-dot ${difficulty.dot}`} />
                  {difficulty.text}
                </span>
                {quiz.stats?.averageScore > 0 && (
                  <span className="quiz-rating-badge">
                    <Star className="star-icon" />
                    {Math.round(quiz.stats.averageScore)}% средний балл
                  </span>
                )}
              </div>

              {/* Title */}
              <h1 className="quiz-title">{quiz.title}</h1>

              {/* Description */}
              {quiz.description && (
                <p className="quiz-description">{quiz.description}</p>
              )}

              {/* Creator & Date */}
              <div className="quiz-meta-info">
                {creator.username && (
                  <div className="quiz-creator">
                    <div 
                      className="creator-avatar"
                      style={!creator.profile?.avatar?.url ? { backgroundColor: getAvatarColor(creator.username) } : {}}
                    >
                      {creator.profile?.avatar?.url ? (
                        <img src={creator.profile.avatar.url} alt="" />
                      ) : (
                        <span>{creator.username?.charAt(0).toUpperCase()}</span>
                      )}
                    </div>
                    <div className="creator-info">
                      <span className="creator-name">{creator.username}</span>
                      <span className="creator-role">Автор</span>
                    </div>
                  </div>
                )}
                
                {quiz.createdAt && (
                  <div className="quiz-date">
                    <Calendar />
                    <span>{formatDate(quiz.createdAt)}</span>
                  </div>
                )}
              </div>

              {/* Stats Grid */}
              <div className="quiz-stats-grid">
                <div className="quiz-stat-item">
                  <div className="stat-icon-wrap blue">
                    <Target />
                  </div>
                  <div className="stat-value">{questionsCount}</div>
                  <div className="stat-label">Вопросов</div>
                </div>
                
                <div className="quiz-stat-item">
                  <div className="stat-icon-wrap green">
                    <Users />
                  </div>
                  <div className="stat-value">{quiz.stats?.plays || 0}</div>
                  <div className="stat-label">Прошли</div>
                </div>
                
                <div className="quiz-stat-item">
                  <div className="stat-icon-wrap amber">
                    <Trophy />
                  </div>
                  <div className="stat-value">{quiz.settings?.passingScore || 70}%</div>
                  <div className="stat-label">Проходной</div>
                </div>
                
                <div className="quiz-stat-item">
                  <div className="stat-icon-wrap rose">
                    <Clock />
                  </div>
                  <div className="stat-value">
                    {quiz.timeLimit ? `${quiz.timeLimit}` : '∞'}
                  </div>
                  <div className="stat-label">
                    {quiz.timeLimit ? 'Минут' : 'Без лимита'}
                  </div>
                </div>
              </div>

              {/* Social Stats */}
              <div className="quiz-social-stats">
                <div className="social-stat">
                  <Eye />
                  <span>{quiz.stats?.views || 0} просмотров</span>
                </div>
                <div className="social-stat">
                  <Heart className={isLiked ? 'liked' : ''} />
                  <span>{likesCount} нравится</span>
                </div>
              </div>

              {/* Actions */}
              {questionsCount > 0 ? (
                <div className="quiz-actions">
                  <Button 
                    size="lg" 
                    className="quiz-start-btn"
                    onClick={startGame}
                  >
                    <Play />
                    Начать викторину
                  </Button>
                  
                  <div className="quiz-secondary-actions">
                    <button onClick={handleShare} className="secondary-action-btn">
                      <Share2 />
                      <span>Поделиться</span>
                    </button>
                    <button 
                      onClick={handleLike}
                      disabled={likeLoading}
                      className={`secondary-action-btn ${isLiked ? 'liked' : ''}`}
                    >
                      <Heart className={isLiked ? 'filled' : ''} />
                      <span>Нравится</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="quiz-no-questions">
                  <div className="no-questions-icon">
                    <XCircle />
                  </div>
                  <p>В этой викторине пока нет вопросов</p>
                  <span>Автор скоро добавит их</span>
                </div>
              )}
            </div>
          </div>

          {/* Comments Section */}
          <div className="quiz-comments-section">
            <div className="comments-header">
              <MessageCircle />
              <h2>Комментарии</h2>
            </div>
            <Comments quizId={id} />
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
    <div className="quiz-page-game">
      <div className="quiz-game-container">
        {/* Header */}
        <div className="quiz-game-header">
          <span className="question-counter">
            Вопрос {currentQuestion + 1} из {quiz.questions.length}
          </span>
          
          {timeLeft !== null && (
            <span className={`quiz-timer ${isTimeLow ? 'low' : ''}`}>
              <Clock />
              {formatTime(timeLeft)}
            </span>
          )}
        </div>
        
        {/* Progress bar */}
        <div className="quiz-progress-bar">
          <div 
            className="quiz-progress-fill"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Question Card */}
        <div className="quiz-question-card">
          <h2 className="quiz-question-text">
            {question.text || question.question}
          </h2>

          {question.image && (
            <img 
              src={question.image} 
              alt="Question" 
              className="quiz-question-image" 
            />
          )}

          {/* Answer Options */}
          <div className="quiz-answers">
            {question.options.map((option, index) => {
              const isSelected = answers[currentQuestion] === (option._id || index);
              const letter = String.fromCharCode(65 + index);
              
              return (
                <button
                  key={option._id || index}
                  onClick={() => handleAnswerSelect(option._id || index)}
                  className={`quiz-answer-btn ${isSelected ? 'selected' : ''}`}
                >
                  <span className={`answer-letter ${isSelected ? 'selected' : ''}`}>
                    {letter}
                  </span>
                  <span className="answer-text">
                    {option.text || option}
                  </span>
                  {isSelected && (
                    <CheckCircle2 className="answer-check" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Next Button */}
          {answers[currentQuestion] !== undefined && (
            <div className="quiz-next-action">
              <Button 
                size="lg" 
                className="quiz-next-btn"
                onClick={nextQuestion}
              >
                {currentQuestion < quiz.questions.length - 1 ? (
                  <>
                    Следующий вопрос
                    <ArrowRight />
                  </>
                ) : (
                  <>
                    <CheckCircle2 />
                    Завершить
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Quiz;
