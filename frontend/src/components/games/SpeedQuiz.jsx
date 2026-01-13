import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Zap, 
  Clock, 
  Trophy, 
  Star,
  ArrowLeft,
  RotateCcw,
  X,
  CheckCircle,
  XCircle,
  Timer,
  Flame
} from 'lucide-react';

// Вопросы для Speed Quiz
const QUESTIONS = [
  // Общие знания
  { question: "Столица Франции?", answers: ["Париж", "Лондон", "Берлин", "Мадрид"], correct: 0, category: "География" },
  { question: "Сколько планет в Солнечной системе?", answers: ["7", "8", "9", "10"], correct: 1, category: "Наука" },
  { question: "Кто написал 'Войну и мир'?", answers: ["Достоевский", "Толстой", "Чехов", "Пушкин"], correct: 1, category: "Литература" },
  { question: "Какой газ составляет большую часть атмосферы?", answers: ["Кислород", "Азот", "Углекислый газ", "Водород"], correct: 1, category: "Наука" },
  { question: "В каком году началась Вторая мировая война?", answers: ["1937", "1938", "1939", "1940"], correct: 2, category: "История" },
  { question: "Какая самая длинная река в мире?", answers: ["Амазонка", "Нил", "Янцзы", "Миссисипи"], correct: 1, category: "География" },
  { question: "Сколько костей в теле взрослого человека?", answers: ["186", "206", "226", "256"], correct: 1, category: "Наука" },
  { question: "Кто нарисовал 'Мону Лизу'?", answers: ["Микеланджело", "Рафаэль", "Да Винчи", "Ботичелли"], correct: 2, category: "Искусство" },
  { question: "Какой элемент имеет символ 'Au'?", answers: ["Серебро", "Золото", "Алюминий", "Медь"], correct: 1, category: "Наука" },
  { question: "Столица Японии?", answers: ["Киото", "Осака", "Токио", "Йокогама"], correct: 2, category: "География" },
  { question: "Кто создал теорию относительности?", answers: ["Ньютон", "Эйнштейн", "Бор", "Планк"], correct: 1, category: "Наука" },
  { question: "Самое большое животное на Земле?", answers: ["Слон", "Синий кит", "Жираф", "Акула"], correct: 1, category: "Природа" },
  { question: "В каком году человек впервые полетел в космос?", answers: ["1957", "1961", "1965", "1969"], correct: 1, category: "История" },
  { question: "Сколько континентов на Земле?", answers: ["5", "6", "7", "8"], correct: 2, category: "География" },
  { question: "Какой язык самый распространённый в мире?", answers: ["Английский", "Испанский", "Китайский", "Хинди"], correct: 2, category: "Общие знания" },
  { question: "Формула воды?", answers: ["H2O", "CO2", "NaCl", "O2"], correct: 0, category: "Наука" },
  { question: "Кто написал 'Гамлета'?", answers: ["Мольер", "Шекспир", "Гёте", "Байрон"], correct: 1, category: "Литература" },
  { question: "Какая страна самая большая по площади?", answers: ["Канада", "США", "Китай", "Россия"], correct: 3, category: "География" },
  { question: "Сколько цветов в радуге?", answers: ["5", "6", "7", "8"], correct: 2, category: "Наука" },
  { question: "Столица Австралии?", answers: ["Сидней", "Мельбурн", "Канберра", "Брисбен"], correct: 2, category: "География" },
];

const SpeedQuiz = ({ onClose, onGameEnd }) => {
  const [gameState, setGameState] = useState('menu'); // menu, playing, finished
  const [difficulty, setDifficulty] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const timerRef = useRef(null);

  const difficulties = {
    easy: { questions: 10, timePerQuestion: 15, name: 'Легко', multiplier: 1 },
    medium: { questions: 15, timePerQuestion: 10, name: 'Средне', multiplier: 1.5 },
    hard: { questions: 20, timePerQuestion: 7, name: 'Сложно', multiplier: 2 }
  };

  const startGame = (diff) => {
    const config = difficulties[diff];
    // Перемешиваем и берём нужное количество вопросов
    const shuffled = [...QUESTIONS].sort(() => Math.random() - 0.5);
    const selectedQuestions = shuffled.slice(0, config.questions);
    
    setDifficulty(diff);
    setQuestions(selectedQuestions);
    setCurrentQuestion(0);
    setScore(0);
    setTimeLeft(config.timePerQuestion);
    setTotalTime(0);
    setAnswers([]);
    setSelectedAnswer(null);
    setShowResult(false);
    setStreak(0);
    setMaxStreak(0);
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
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [gameState, showResult, currentQuestion]);

  const handleTimeout = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setAnswers(prev => [...prev, { correct: false, time: 0 }]);
    setStreak(0);
    setSelectedAnswer(-1);
    setShowResult(true);
    
    setTimeout(() => {
      nextQuestion();
    }, 1500);
  };

  const handleAnswer = (index) => {
    if (showResult || selectedAnswer !== null) return;
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    const isCorrect = index === questions[currentQuestion].correct;
    // Сбалансированные очки
    const timeBonus = Math.floor(timeLeft / 3);
    const streakBonus = Math.min(streak, 5);
    
    if (isCorrect) {
      const questionScore = 5 + timeBonus + streakBonus;
      setScore(prev => prev + questionScore);
      setStreak(prev => {
        const newStreak = prev + 1;
        if (newStreak > maxStreak) setMaxStreak(newStreak);
        return newStreak;
      });
    } else {
      setStreak(0);
    }
    
    setAnswers(prev => [...prev, { 
      correct: isCorrect, 
      time: difficulties[difficulty].timePerQuestion - timeLeft,
      selected: index
    }]);
    setSelectedAnswer(index);
    setShowResult(true);
    
    setTimeout(() => {
      nextQuestion();
    }, 1500);
  };

  const nextQuestion = () => {
    if (currentQuestion + 1 >= questions.length) {
      finishGame();
    } else {
      setCurrentQuestion(prev => prev + 1);
      setTimeLeft(difficulties[difficulty].timePerQuestion);
      setSelectedAnswer(null);
      setShowResult(false);
    }
  };

  const finishGame = () => {
    const { multiplier } = difficulties[difficulty];
    const correctCount = answers.filter(a => a.correct).length + (selectedAnswer === questions[currentQuestion]?.correct ? 1 : 0);
    const accuracy = Math.round((correctCount / questions.length) * 100);
    const finalScore = Math.round(score * multiplier);
    
    setScore(finalScore);
    setGameState('finished');
    
    if (onGameEnd) {
      onGameEnd(finalScore, 'speed');
    }
  };

  const getTimeColor = () => {
    const config = difficulties[difficulty];
    const percentage = timeLeft / config.timePerQuestion;
    if (percentage > 0.5) return 'text-green-500';
    if (percentage > 0.25) return 'text-yellow-500';
    return 'text-red-500 animate-pulse';
  };

  // Меню
  if (gameState === 'menu') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <div className="w-full max-w-lg bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden">
          <div className="relative p-6 bg-gradient-to-br from-yellow-500 to-orange-500">
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors"
            >
              <X size={20} />
            </button>
            <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center mx-auto mb-4">
              <Zap className="text-white" size={40} />
            </div>
            <h2 className="text-2xl font-bold text-white text-center">Speed Quiz</h2>
            <p className="text-white/80 text-center mt-1">Отвечай быстро — время идёт!</p>
          </div>

          <div className="p-6 space-y-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white text-center">Выбери сложность</h3>
            
            <div className="grid grid-cols-3 gap-3">
              {Object.entries(difficulties).map(([key, { name, questions, timePerQuestion, multiplier }]) => (
                <button
                  key={key}
                  onClick={() => startGame(key)}
                  className={`p-4 rounded-xl border-2 transition-all hover:scale-105 ${
                    key === 'easy' 
                      ? 'border-green-500 bg-green-500/10 hover:bg-green-500/20' 
                      : key === 'medium'
                        ? 'border-yellow-500 bg-yellow-500/10 hover:bg-yellow-500/20'
                        : 'border-red-500 bg-red-500/10 hover:bg-red-500/20'
                  }`}
                >
                  <p className={`font-bold text-lg ${
                    key === 'easy' ? 'text-green-600' : key === 'medium' ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {name}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{questions} вопросов</p>
                  <p className="text-xs text-gray-500">{timePerQuestion} сек/вопрос</p>
                  <p className="text-xs text-purple-500 mt-1">x{multiplier} очков</p>
                </button>
              ))}
            </div>

            <div className="mt-6 p-4 rounded-xl bg-gray-100 dark:bg-white/5">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Как играть:</h4>
              <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                <li>• Отвечай на вопросы до истечения времени</li>
                <li>• Быстрые ответы дают больше очков</li>
                <li>• Собирай серии правильных ответов!</li>
                <li>• Неправильный ответ сбрасывает серию</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Игровой экран
  if (gameState === 'playing') {
    const question = questions[currentQuestion];
    const config = difficulties[difficulty];
    const progress = ((currentQuestion) / questions.length) * 100;
    
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <div className="w-full max-w-2xl bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-yellow-500 to-orange-500">
            <div className="flex items-center justify-between mb-4">
              <button 
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30"
              >
                <ArrowLeft size={20} />
              </button>
              
              <div className="flex items-center gap-6 text-white">
                <div className="flex items-center gap-2">
                  <Trophy size={18} className="text-yellow-200" />
                  <span className="font-bold">{score}</span>
                </div>
                {streak > 0 && (
                  <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-white/20 animate-pulse">
                    <Flame size={16} className="text-orange-200" />
                    <span className="font-bold">{streak}x</span>
                  </div>
                )}
              </div>
              
              <div className="text-white font-mono">
                {currentQuestion + 1}/{questions.length}
              </div>
            </div>
            
            {/* Progress bar */}
            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
              <div 
                className="h-full bg-white rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Timer */}
          <div className="flex justify-center -mt-6">
            <div className={`w-16 h-16 rounded-full bg-white dark:bg-gray-800 shadow-lg flex items-center justify-center ${getTimeColor()}`}>
              <span className="text-2xl font-bold">{timeLeft}</span>
            </div>
          </div>

          {/* Question */}
          <div className="p-6 pt-4">
            <div className="text-center mb-2">
              <span className="px-3 py-1 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 text-sm">
                {question.category}
              </span>
            </div>
            
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white text-center mb-6">
              {question.question}
            </h2>

            {/* Answers */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {question.answers.map((answer, index) => {
                let buttonClass = 'bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 border-2 border-transparent';
                
                if (showResult) {
                  if (index === question.correct) {
                    buttonClass = 'bg-green-500/20 border-2 border-green-500 text-green-700 dark:text-green-400';
                  } else if (index === selectedAnswer && index !== question.correct) {
                    buttonClass = 'bg-red-500/20 border-2 border-red-500 text-red-700 dark:text-red-400';
                  } else {
                    buttonClass = 'bg-gray-100 dark:bg-white/5 opacity-50';
                  }
                }
                
                return (
                  <button
                    key={index}
                    onClick={() => handleAnswer(index)}
                    disabled={showResult}
                    className={`p-4 rounded-xl font-medium transition-all ${buttonClass} ${
                      !showResult ? 'hover:scale-[1.02]' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-lg bg-gray-200 dark:bg-white/10 flex items-center justify-center text-sm font-bold">
                        {String.fromCharCode(65 + index)}
                      </span>
                      <span className="text-gray-900 dark:text-white">{answer}</span>
                      {showResult && index === question.correct && (
                        <CheckCircle className="ml-auto text-green-500" size={20} />
                      )}
                      {showResult && index === selectedAnswer && index !== question.correct && (
                        <XCircle className="ml-auto text-red-500" size={20} />
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
    const accuracy = Math.round((correctCount / questions.length) * 100);
    const avgTime = Math.round(answers.reduce((acc, a) => acc + a.time, 0) / answers.length * 10) / 10;
    
    const getStars = () => {
      if (accuracy >= 90) return 3;
      if (accuracy >= 70) return 2;
      return 1;
    };
    
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden">
          <div className="relative p-8 bg-gradient-to-br from-yellow-500 to-orange-500 text-center">
            <Trophy className="w-16 h-16 text-yellow-200 mx-auto mb-3" />
            <h2 className="text-3xl font-bold text-white">Результат!</h2>
            
            <div className="flex justify-center gap-2 mt-4">
              {[1, 2, 3].map((star) => (
                <Star
                  key={star}
                  size={32}
                  className={`${star <= getStars() ? 'text-yellow-200 fill-yellow-200' : 'text-white/30'}`}
                />
              ))}
            </div>
          </div>

          <div className="p-6 space-y-4">
            <div className="text-center">
              <p className="text-gray-600 dark:text-gray-400">Заработано очков</p>
              <p className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-orange-500">
                +{score}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 rounded-xl bg-gray-100 dark:bg-white/5 text-center">
                <CheckCircle className="w-5 h-5 text-green-500 mx-auto mb-1" />
                <p className="text-lg font-bold text-gray-900 dark:text-white">{correctCount}/{questions.length}</p>
                <p className="text-xs text-gray-500">Правильно</p>
              </div>
              <div className="p-4 rounded-xl bg-gray-100 dark:bg-white/5 text-center">
                <Timer className="w-5 h-5 text-blue-500 mx-auto mb-1" />
                <p className="text-lg font-bold text-gray-900 dark:text-white">{avgTime}с</p>
                <p className="text-xs text-gray-500">Ср. время</p>
              </div>
              <div className="p-4 rounded-xl bg-gray-100 dark:bg-white/5 text-center">
                <Star className="w-5 h-5 text-yellow-500 mx-auto mb-1" />
                <p className="text-lg font-bold text-gray-900 dark:text-white">{accuracy}%</p>
                <p className="text-xs text-gray-500">Точность</p>
              </div>
              <div className="p-4 rounded-xl bg-gray-100 dark:bg-white/5 text-center">
                <Flame className="w-5 h-5 text-orange-500 mx-auto mb-1" />
                <p className="text-lg font-bold text-gray-900 dark:text-white">{maxStreak}x</p>
                <p className="text-xs text-gray-500">Макс. серия</p>
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
                onClick={() => startGame(difficulty)}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold flex items-center justify-center gap-2"
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

export default SpeedQuiz;
