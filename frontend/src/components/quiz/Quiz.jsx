import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  Sparkles,
  Brain,
  Zap,
  Award,
  Timer,
  BarChart3,
  Loader2
} from 'lucide-react';

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

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getDifficultyColor = (difficulty) => {
    const colors = {
      easy: 'success',
      medium: 'warning',
      hard: 'destructive'
    };
    return colors[difficulty] || 'secondary';
  };

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-white/10 backdrop-blur-lg border-white/20">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-12 w-12 text-purple-400 animate-spin mb-4" />
            <p className="text-white/80 text-lg">Загрузка викторины...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error State
  if (!quiz) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-white/10 backdrop-blur-lg border-white/20">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <XCircle className="h-16 w-16 text-red-400 mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Викторина не найдена</h2>
            <p className="text-white/60 mb-6">Возможно, она была удалена или перемещена</p>
            <Button variant="quiz" onClick={() => navigate('/quizzes')}>
              <Home className="mr-2 h-4 w-4" />
              К списку викторин
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Results Screen
  if (finished && results) {
    const isPassed = results.passed;
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-lg bg-white/10 backdrop-blur-lg border-white/20 overflow-hidden">
          <div className={cn(
            "h-2",
            isPassed ? "bg-gradient-to-r from-emerald-400 to-green-500" : "bg-gradient-to-r from-red-400 to-rose-500"
          )} />
          
          <CardHeader className="text-center pb-2">
            <div className="mx-auto mb-4">
              {isPassed ? (
                <div className="relative">
                  <Trophy className="h-20 w-20 text-yellow-400 animate-bounce" />
                  <Sparkles className="h-6 w-6 text-yellow-300 absolute -top-1 -right-1 animate-pulse" />
                </div>
              ) : (
                <Target className="h-20 w-20 text-purple-400" />
              )}
            </div>
            <CardTitle className="text-3xl text-white mb-2">
              {isPassed ? '🎉 Поздравляем!' : 'Попробуйте ещё раз!'}
            </CardTitle>
            <CardDescription className="text-white/70 text-lg">
              {quiz.title}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Score Circle */}
            <div className="flex justify-center">
              <div className={cn(
                "relative w-36 h-36 rounded-full flex items-center justify-center",
                "bg-gradient-to-br shadow-2xl",
                isPassed ? "from-emerald-500/20 to-green-600/20" : "from-purple-500/20 to-violet-600/20"
              )}>
                <div className="text-center">
                  <div className="text-4xl font-bold text-white">{results.percentage}%</div>
                  <div className="text-white/60 text-sm">результат</div>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white/5 rounded-xl p-4 text-center">
                <CheckCircle2 className="h-6 w-6 text-emerald-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{results.correctAnswers}</div>
                <div className="text-xs text-white/60">Правильных</div>
              </div>
              <div className="bg-white/5 rounded-xl p-4 text-center">
                <BarChart3 className="h-6 w-6 text-purple-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{results.totalQuestions}</div>
                <div className="text-xs text-white/60">Всего</div>
              </div>
              <div className="bg-white/5 rounded-xl p-4 text-center">
                <Timer className="h-6 w-6 text-blue-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{results.timeSpent}с</div>
                <div className="text-xs text-white/60">Время</div>
              </div>
            </div>

            {/* Points */}
            <div className="bg-gradient-to-r from-violet-500/20 to-purple-500/20 rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Award className="h-8 w-8 text-yellow-400" />
                <div>
                  <div className="text-white/60 text-sm">Заработано очков</div>
                  <div className="text-2xl font-bold text-white">{results.score}</div>
                </div>
              </div>
              <Zap className="h-10 w-10 text-yellow-400/50" />
            </div>

            {/* Status Badge */}
            <div className="flex justify-center">
              <Badge 
                variant={isPassed ? "success" : "destructive"} 
                className="px-4 py-2 text-base"
              >
                {isPassed ? (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Тест пройден
                  </>
                ) : (
                  <>
                    <XCircle className="mr-2 h-4 w-4" />
                    Тест не пройден
                  </>
                )}
              </Badge>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button 
                variant="outline" 
                className="flex-1 border-white/20 text-white hover:bg-white/10"
                onClick={() => navigate('/quizzes')}
              >
                <Home className="mr-2 h-4 w-4" />
                К викторинам
              </Button>
              <Button 
                variant="quiz" 
                className="flex-1"
                onClick={() => window.location.reload()}
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Пройти снова
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Start Screen
  if (!gameStarted) {
    const questionsCount = Array.isArray(quiz.questions) ? quiz.questions.length : 0;
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
        <div className="max-w-lg mx-auto">
          <Card className="w-full bg-white/10 backdrop-blur-lg border-white/20 overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500" />
            
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-4 bg-gradient-to-br from-violet-500/20 to-purple-600/20 rounded-2xl w-fit">
                <Brain className="h-16 w-16 text-purple-400" />
              </div>
              <CardTitle className="text-3xl text-white mb-3">{quiz.title}</CardTitle>
              <CardDescription className="text-white/70 text-base">
                {quiz.description}
              </CardDescription>
            </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Quiz Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 rounded-xl p-4 flex items-center gap-3">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <Target className="h-5 w-5 text-purple-400" />
                </div>
                <div>
                  <div className="text-white/60 text-xs">Вопросов</div>
                  <div className="text-white font-semibold">{questionsCount}</div>
                </div>
              </div>
              
              <div className="bg-white/5 rounded-xl p-4 flex items-center gap-3">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <BarChart3 className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <div className="text-white/60 text-xs">Категория</div>
                  <div className="text-white font-semibold">{quiz.category}</div>
                </div>
              </div>
              
              <div className="bg-white/5 rounded-xl p-4 flex items-center gap-3">
                <div className="p-2 bg-amber-500/20 rounded-lg">
                  <Zap className="h-5 w-5 text-amber-400" />
                </div>
                <div>
                  <div className="text-white/60 text-xs">Сложность</div>
                  <Badge variant={getDifficultyColor(quiz.difficulty)} className="mt-1">
                    {quiz.difficulty}
                  </Badge>
                </div>
              </div>
              
              {quiz.timeLimit && (
                <div className="bg-white/5 rounded-xl p-4 flex items-center gap-3">
                  <div className="p-2 bg-rose-500/20 rounded-lg">
                    <Clock className="h-5 w-5 text-rose-400" />
                  </div>
                  <div>
                    <div className="text-white/60 text-xs">Время</div>
                    <div className="text-white font-semibold">{quiz.timeLimit} мин</div>
                  </div>
                </div>
              )}
            </div>

            {/* Start Button */}
            {questionsCount > 0 ? (
              <Button 
                variant="quiz" 
                size="xl" 
                className="w-full animate-pulse-glow"
                onClick={startGame}
              >
                <Sparkles className="mr-2 h-5 w-5" />
                Начать викторину
              </Button>
            ) : (
              <div className="text-center py-6 bg-white/5 rounded-xl">
                <XCircle className="h-12 w-12 text-white/40 mx-auto mb-3" />
                <p className="text-white/60">В этой викторине пока нет вопросов</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Секция комментариев */}
        <div className="mt-6">
          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardContent className="pt-6">
              <Comments quizId={id} />
            </CardContent>
          </Card>
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6 space-y-4">
          <div className="flex items-center justify-between">
            <Badge variant="secondary" className="bg-white/10 text-white border-white/20">
              Вопрос {currentQuestion + 1} из {quiz.questions.length}
            </Badge>
            
            {timeLeft !== null && (
              <Badge 
                variant={isTimeLow ? "destructive" : "secondary"}
                className={cn(
                  "bg-white/10 border-white/20 text-white",
                  isTimeLow && "animate-pulse bg-red-500/20 border-red-500/30"
                )}
              >
                <Clock className="mr-1 h-3 w-3" />
                {formatTime(timeLeft)}
              </Badge>
            )}
          </div>
          
          <Progress value={currentQuestion + 1} max={quiz.questions.length} />
        </div>

        {/* Question Card */}
        <Card className="bg-white/10 backdrop-blur-lg border-white/20 overflow-hidden">
          <CardHeader>
            <CardTitle className="text-xl md:text-2xl text-white leading-relaxed">
              {question.text || question.question}
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-3">
            {question.image && (
              <img 
                src={question.image} 
                alt="Question" 
                className="w-full rounded-xl mb-4 max-h-64 object-cover" 
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
                    className={cn(
                      "w-full p-4 rounded-xl text-left transition-all duration-200",
                      "flex items-center gap-4 group",
                      "border-2",
                      isSelected
                        ? "bg-gradient-to-r from-violet-500/30 to-purple-500/30 border-purple-400 shadow-lg shadow-purple-500/20"
                        : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
                    )}
                  >
                    <span className={cn(
                      "flex items-center justify-center w-10 h-10 rounded-lg font-bold text-lg transition-all",
                      isSelected
                        ? "bg-purple-500 text-white"
                        : "bg-white/10 text-white/60 group-hover:bg-white/20 group-hover:text-white"
                    )}>
                      {letter}
                    </span>
                    <span className={cn(
                      "text-base flex-1",
                      isSelected ? "text-white font-medium" : "text-white/80"
                    )}>
                      {option.text || option}
                    </span>
                    {isSelected && (
                      <CheckCircle2 className="h-5 w-5 text-purple-400" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Next Button */}
            {answers[currentQuestion] !== undefined && (
              <div className="pt-4">
                <Button 
                  variant="quiz" 
                  size="lg" 
                  className="w-full"
                  onClick={nextQuestion}
                >
                  {currentQuestion < quiz.questions.length - 1 ? (
                    <>
                      Следующий вопрос
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="mr-2 h-5 w-5" />
                      Завершить
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Quiz;
