import { useState, useEffect, useRef } from 'react';
import { 
  Gem, 
  Clock, 
  Trophy, 
  Star,
  ArrowLeft,
  RotateCcw,
  X,
  CheckCircle,
  XCircle,
  Crown,
  Medal,
  Sparkles,
  Zap,
  Timer,
  Target,
  Award
} from 'lucide-react';

// Эксклюзивные вопросы высшей сложности
const ELITE_QUESTIONS = [
  { question: "В каком году Эйнштейн получил Нобелевскую премию?", answers: ["1919", "1921", "1923", "1925"], correct: 1, points: 300 },
  { question: "Какой элемент имеет самую высокую температуру плавления?", answers: ["Вольфрам", "Рений", "Осмий", "Тантал"], correct: 0, points: 350 },
  { question: "Столица Лихтенштейна?", answers: ["Вадуц", "Шаан", "Бальцерс", "Тризен"], correct: 0, points: 300 },
  { question: "Год подписания Великой хартии вольностей?", answers: ["1205", "1215", "1225", "1235"], correct: 1, points: 350 },
  { question: "Кто автор теоремы о неполноте?", answers: ["Гильберт", "Гёдель", "Рассел", "Тьюринг"], correct: 1, points: 400 },
  { question: "Самый редкий химический элемент в земной коре?", answers: ["Астат", "Франций", "Прометий", "Технеций"], correct: 0, points: 400 },
  { question: "Год первого успешного полёта на Марс?", answers: ["1965", "1969", "1971", "1975"], correct: 2, points: 350 },
  { question: "Кто написал 'Феноменологию духа'?", answers: ["Кант", "Гегель", "Фихте", "Шеллинг"], correct: 1, points: 350 },
  { question: "Диаметр протона (фм)?", answers: ["0.84", "0.87", "0.92", "1.00"], correct: 0, points: 500 },
  { question: "Год основания Оксфордского университета?", answers: ["1096", "1167", "1209", "1231"], correct: 0, points: 400 },
  { question: "Автор 'Трактата о человеческой природе'?", answers: ["Локк", "Юм", "Беркли", "Бэкон"], correct: 1, points: 350 },
  { question: "Постоянная Планка (×10⁻³⁴ Дж·с)?", answers: ["5.63", "6.02", "6.63", "7.23"], correct: 2, points: 450 },
];

const ExclusiveArena = ({ onClose, onGameEnd }) => {
  const [gameState, setGameState] = useState('menu'); // menu, playing, finished
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [multiplier, setMultiplier] = useState(1);
  const [streak, setStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [answers, setAnswers] = useState([]);
  const [showMultiplierBonus, setShowMultiplierBonus] = useState(false);
  const timerRef = useRef(null);

  const TIME_PER_QUESTION = 25;
  const TOTAL_QUESTIONS = 10;

  const startGame = () => {
    const shuffled = [...ELITE_QUESTIONS].sort(() => Math.random() - 0.5);
    setQuestions(shuffled.slice(0, TOTAL_QUESTIONS));
    setCurrentQuestion(0);
    setScore(0);
    setMultiplier(1);
    setStreak(0);
    setTimeLeft(TIME_PER_QUESTION);
    setTotalTime(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setAnswers([]);
    setGameState('playing');
  };

  // Таймер
  useEffect(() => {
    if (gameState === 'playing' && !showResult) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleTimeout();
            return 0;
          }
          return prev - 1;
        });
        setTotalTime(prev => prev + 1);
      }, 1000);
    }
    
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState, showResult, currentQuestion]);

  const handleTimeout = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setMultiplier(1);
    setStreak(0);
    setAnswers(prev => [...prev, { correct: false, time: TIME_PER_QUESTION }]);
    setSelectedAnswer(-1);
    setShowResult(true);
    
    setTimeout(() => nextQuestion(), 2000);
  };

  const handleAnswer = (index) => {
    if (showResult || selectedAnswer !== null) return;
    
    if (timerRef.current) clearInterval(timerRef.current);
    
    const question = questions[currentQuestion];
    const isCorrect = index === question.correct;
    const responseTime = TIME_PER_QUESTION - timeLeft;
    // Сбалансированные очки
    const timeBonus = Math.floor(timeLeft / 5);
    
    if (isCorrect) {
      // Базовые 8 очков + бонус за время + небольшой мультипликатор
      const earnedPoints = Math.round((8 + timeBonus) * multiplier);
      setScore(prev => prev + earnedPoints);
      
      const newStreak = streak + 1;
      setStreak(newStreak);
      
      // Увеличение множителя каждые 3 правильных ответа (макс 1.5x)
      if (newStreak % 3 === 0 && multiplier < 1.5) {
        setMultiplier(prev => Math.min(prev + 0.25, 1.5));
        setShowMultiplierBonus(true);
        setTimeout(() => setShowMultiplierBonus(false), 1500);
      }
    } else {
      setMultiplier(1);
      setStreak(0);
    }
    
    setAnswers(prev => [...prev, { correct: isCorrect, time: responseTime }]);
    setSelectedAnswer(index);
    setShowResult(true);
    
    setTimeout(() => nextQuestion(), 2000);
  };

  const nextQuestion = () => {
    if (currentQuestion + 1 >= questions.length) {
      finishGame();
    } else {
      setCurrentQuestion(prev => prev + 1);
      setTimeLeft(TIME_PER_QUESTION);
      setSelectedAnswer(null);
      setShowResult(false);
    }
  };

  const finishGame = () => {
    const correctCount = answers.filter(a => a.correct).length + (selectedAnswer === questions[currentQuestion]?.correct ? 1 : 0);
    // Сбалансированные бонусы
    const perfectBonus = correctCount === TOTAL_QUESTIONS ? 50 : 0;
    const speedBonus = Math.min(30, Math.max(0, Math.floor((TOTAL_QUESTIONS * TIME_PER_QUESTION - totalTime) / 5)));
    const finalScore = score + perfectBonus + speedBonus;
    
    setScore(finalScore);
    setGameState('finished');
    
    if (onGameEnd) {
      onGameEnd(finalScore, 'exclusive');
    }
  };

  const getTimeColor = () => {
    if (timeLeft > 15) return 'text-green-500';
    if (timeLeft > 8) return 'text-yellow-500';
    return 'text-red-500 animate-pulse';
  };

  // Меню
  if (gameState === 'menu') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <div className="w-full max-w-lg bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden">
          <div className="relative p-6 bg-gradient-to-br from-rose-500 to-red-600">
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30"
            >
              <X size={20} />
            </button>
            
            {/* Sparkle effects */}
            <div className="absolute inset-0 overflow-hidden">
              {[...Array(10)].map((_, i) => (
                <Sparkles
                  key={i}
                  size={16}
                  className="absolute text-white/30 animate-pulse"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 2}s`
                  }}
                />
              ))}
            </div>
            
            <div className="relative w-20 h-20 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center mx-auto mb-4">
              <Gem className="text-white" size={40} />
            </div>
            <h2 className="text-2xl font-bold text-white text-center relative">Эксклюзивная Арена</h2>
            <p className="text-white/80 text-center mt-1 relative">Элитный турнирный режим</p>
          </div>

          <div className="p-6 space-y-4">
            {/* Elite badge */}
            <div className="flex justify-center">
              <div className="px-4 py-2 rounded-full bg-gradient-to-r from-rose-500/20 to-red-500/20 border border-rose-500/30 flex items-center gap-2">
                <Crown className="w-5 h-5 text-rose-500" />
                <span className="font-bold text-rose-600 dark:text-rose-400">ЭКСКЛЮЗИВНЫЙ КОНТЕНТ</span>
              </div>
            </div>

            {/* Features */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20">
                <Zap className="w-8 h-8 text-purple-500 mb-2" />
                <p className="font-bold text-gray-900 dark:text-white">Множитель</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">До x3 за серии!</p>
              </div>
              <div className="p-4 rounded-xl bg-gradient-to-br from-amber-500/10 to-yellow-500/10 border border-amber-500/20">
                <Trophy className="w-8 h-8 text-amber-500 mb-2" />
                <p className="font-bold text-gray-900 dark:text-white">Макс. очки</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">До 500 за вопрос</p>
              </div>
            </div>

            {/* Stats preview */}
            <div className="flex justify-center gap-6 py-3">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{TOTAL_QUESTIONS}</p>
                <p className="text-xs text-gray-500">Вопросов</p>
              </div>
              <div className="w-px bg-gray-200 dark:bg-white/10" />
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{TIME_PER_QUESTION}с</p>
                <p className="text-xs text-gray-500">На ответ</p>
              </div>
              <div className="w-px bg-gray-200 dark:bg-white/10" />
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">x3</p>
                <p className="text-xs text-gray-500">Макс. бонус</p>
              </div>
            </div>

            {/* Rules */}
            <div className="p-4 rounded-xl bg-gray-100 dark:bg-white/5">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Система множителя:</h4>
              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center justify-between">
                  <span>3 правильных подряд</span>
                  <span className="font-bold text-purple-500">x1.5</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>6 правильных подряд</span>
                  <span className="font-bold text-purple-500">x2.0</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>9 правильных подряд</span>
                  <span className="font-bold text-purple-500">x2.5</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Все правильно!</span>
                  <span className="font-bold text-yellow-500">x3.0 + 2000</span>
                </div>
              </div>
            </div>

            <button
              onClick={startGame}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-rose-500 to-red-600 text-white font-bold text-lg hover:shadow-lg hover:shadow-rose-500/30 transition-all flex items-center justify-center gap-2"
            >
              <Gem size={24} />
              Войти в Арену
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Игровой экран
  if (gameState === 'playing') {
    const question = questions[currentQuestion];
    const progress = ((currentQuestion) / questions.length) * 100;
    
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <div className="w-full max-w-2xl bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden relative">
          {/* Multiplier Bonus Animation */}
          {showMultiplierBonus && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/30 backdrop-blur-sm">
              <div className="px-8 py-6 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 text-white text-center animate-bounce">
                <Zap size={48} className="mx-auto mb-2" />
                <p className="text-3xl font-black">x{multiplier}</p>
                <p className="text-lg">МНОЖИТЕЛЬ!</p>
              </div>
            </div>
          )}

          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-rose-500 to-red-600">
            <div className="flex items-center justify-between mb-3">
              <button 
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30"
              >
                <ArrowLeft size={20} />
              </button>
              
              <div className="flex items-center gap-4 text-white">
                {/* Multiplier */}
                <div className={`px-3 py-1 rounded-full font-bold flex items-center gap-1 ${
                  multiplier > 1 ? 'bg-purple-500 animate-pulse' : 'bg-white/20'
                }`}>
                  <Zap size={16} />
                  x{multiplier}
                </div>
                
                {/* Score */}
                <div className="flex items-center gap-2">
                  <Trophy size={18} className="text-yellow-200" />
                  <span className="font-bold">{score}</span>
                </div>
                
                {/* Streak */}
                {streak > 0 && (
                  <div className="flex items-center gap-1">
                    <span className="text-orange-200">🔥</span>
                    <span className="font-bold">{streak}</span>
                  </div>
                )}
              </div>
              
              <div className="text-white font-mono">
                {currentQuestion + 1}/{questions.length}
              </div>
            </div>
            
            {/* Progress */}
            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
              <div 
                className="h-full bg-white rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Timer + Points */}
          <div className="flex justify-center items-center gap-4 -mt-5">
            <div className={`w-14 h-14 rounded-full bg-white dark:bg-gray-800 shadow-lg flex items-center justify-center ${getTimeColor()}`}>
              <span className="text-xl font-bold">{timeLeft}</span>
            </div>
            <div className="px-4 py-2 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 text-white shadow-lg">
              <span className="font-bold">{question.points} pts</span>
            </div>
          </div>

          {/* Question */}
          <div className="p-6 pt-4">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white text-center mb-6">
              {question.question}
            </h2>

            {/* Answers */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {question.answers.map((answer, index) => {
                let buttonClass = 'bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 border-2 border-transparent hover:border-rose-500/50';
                
                if (showResult) {
                  if (index === question.correct) {
                    buttonClass = 'bg-green-500/20 border-2 border-green-500';
                  } else if (index === selectedAnswer && index !== question.correct) {
                    buttonClass = 'bg-red-500/20 border-2 border-red-500';
                  } else {
                    buttonClass = 'bg-gray-100 dark:bg-white/5 opacity-50';
                  }
                }
                
                return (
                  <button
                    key={index}
                    onClick={() => handleAnswer(index)}
                    disabled={showResult}
                    className={`p-4 rounded-xl font-medium transition-all ${buttonClass}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-rose-500/20 to-red-500/20 flex items-center justify-center text-sm font-bold text-rose-600 dark:text-rose-400">
                        {String.fromCharCode(65 + index)}
                      </span>
                      <span className="text-gray-900 dark:text-white text-left">{answer}</span>
                      {showResult && index === question.correct && (
                        <CheckCircle className="ml-auto text-green-500 flex-shrink-0" size={20} />
                      )}
                      {showResult && index === selectedAnswer && index !== question.correct && (
                        <XCircle className="ml-auto text-red-500 flex-shrink-0" size={20} />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Результаты
  if (gameState === 'finished') {
    const correctCount = answers.filter(a => a.correct).length;
    const accuracy = Math.round((correctCount / TOTAL_QUESTIONS) * 100);
    const isPerfect = correctCount === TOTAL_QUESTIONS;
    
    const getRank = () => {
      if (isPerfect) return { rank: 'ЛЕГЕНДА', icon: Crown, color: 'from-yellow-400 to-amber-500' };
      if (accuracy >= 90) return { rank: 'МАСТЕР', icon: Trophy, color: 'from-purple-400 to-pink-500' };
      if (accuracy >= 80) return { rank: 'ЭКСПЕРТ', icon: Award, color: 'from-blue-400 to-cyan-500' };
      if (accuracy >= 70) return { rank: 'ЗНАТОК', icon: Medal, color: 'from-green-400 to-emerald-500' };
      return { rank: 'НОВИЧОК', icon: Star, color: 'from-gray-400 to-gray-500' };
    };
    
    const { rank, icon: RankIcon, color } = getRank();
    
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden">
          <div className={`relative p-8 bg-gradient-to-br ${color} text-center overflow-hidden`}>
            {/* Sparkles for perfect */}
            {isPerfect && (
              <div className="absolute inset-0">
                {[...Array(20)].map((_, i) => (
                  <Sparkles
                    key={i}
                    size={16}
                    className="absolute text-white/50 animate-pulse"
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                      animationDelay: `${Math.random() * 2}s`
                    }}
                  />
                ))}
              </div>
            )}
            
            <RankIcon className="w-16 h-16 text-white mx-auto mb-3 relative z-10" />
            <h2 className="text-3xl font-bold text-white relative z-10">{rank}</h2>
            <p className="text-white/80 relative z-10">Арена завершена!</p>
          </div>

          <div className="p-6 space-y-4">
            <div className="text-center">
              <p className="text-gray-600 dark:text-gray-400">Заработано очков</p>
              <p className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-red-600">
                +{score}
              </p>
              {isPerfect && (
                <p className="text-sm text-yellow-500 font-medium mt-1">🎉 +2000 бонус за идеальную игру!</p>
              )}
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="p-4 rounded-xl bg-gray-100 dark:bg-white/5 text-center">
                <CheckCircle className="w-5 h-5 text-green-500 mx-auto mb-1" />
                <p className="text-lg font-bold text-gray-900 dark:text-white">{correctCount}/{TOTAL_QUESTIONS}</p>
                <p className="text-xs text-gray-500">Верно</p>
              </div>
              <div className="p-4 rounded-xl bg-gray-100 dark:bg-white/5 text-center">
                <Target className="w-5 h-5 text-purple-500 mx-auto mb-1" />
                <p className="text-lg font-bold text-gray-900 dark:text-white">{accuracy}%</p>
                <p className="text-xs text-gray-500">Точность</p>
              </div>
              <div className="p-4 rounded-xl bg-gray-100 dark:bg-white/5 text-center">
                <Zap className="w-5 h-5 text-orange-500 mx-auto mb-1" />
                <p className="text-lg font-bold text-gray-900 dark:text-white">x{multiplier}</p>
                <p className="text-xs text-gray-500">Множитель</p>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={onClose}
                className="flex-1 py-3 rounded-xl bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300 font-medium"
              >
                Выход
              </button>
              <button
                onClick={startGame}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-rose-500 to-red-600 text-white font-bold flex items-center justify-center gap-2"
              >
                <RotateCcw size={18} />
                Ещё раз
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default ExclusiveArena;
