import { useState, useEffect, useRef } from 'react';
import { 
  Crown, 
  Clock, 
  Trophy, 
  Star,
  ArrowLeft,
  RotateCcw,
  X,
  CheckCircle,
  XCircle,
  Zap,
  AlertTriangle,
  Skull,
  Timer,
  Target
} from 'lucide-react';

// Сложные вопросы для Ultimate Challenge
const HARD_QUESTIONS = [
  { question: "В каком году был подписан Вестфальский мир?", answers: ["1618", "1638", "1648", "1658"], correct: 2 },
  { question: "Какой элемент имеет атомный номер 79?", answers: ["Платина", "Золото", "Серебро", "Ртуть"], correct: 1 },
  { question: "Кто автор картины 'Звёздная ночь'?", answers: ["Моне", "Ван Гог", "Пикассо", "Дали"], correct: 1 },
  { question: "Столица Мьянмы?", answers: ["Янгон", "Мандалай", "Нейпьидо", "Багó"], correct: 2 },
  { question: "Формула азотной кислоты?", answers: ["HNO2", "HNO3", "H2NO3", "HN2O3"], correct: 1 },
  { question: "В каком году пала Византийская империя?", answers: ["1443", "1453", "1463", "1473"], correct: 1 },
  { question: "Кто написал 'Критику чистого разума'?", answers: ["Гегель", "Кант", "Ницше", "Шопенгауэр"], correct: 1 },
  { question: "Самая глубокая точка океана (метры)?", answers: ["10 994", "11 034", "10 916", "11 521"], correct: 1 },
  { question: "Год первой Нобелевской премии?", answers: ["1895", "1899", "1901", "1905"], correct: 2 },
  { question: "Какой газ самый лёгкий?", answers: ["Гелий", "Водород", "Неон", "Азот"], correct: 1 },
  { question: "Автор 'Улисса'?", answers: ["Вулф", "Джойс", "Пруст", "Кафка"], correct: 1 },
  { question: "Температура поверхности Солнца (°C)?", answers: ["4 500", "5 500", "6 500", "7 500"], correct: 1 },
  { question: "Год изобретения печатного станка Гутенберга?", answers: ["1430", "1440", "1450", "1460"], correct: 2 },
  { question: "Столица Бутана?", answers: ["Паро", "Тхимпху", "Пунакха", "Бумтанг"], correct: 1 },
  { question: "Кто открыл структуру ДНК?", answers: ["Мендель", "Уотсон и Крик", "Дарвин", "Флеминг"], correct: 1 },
  { question: "Самая высокая водопад в мире?", answers: ["Ниагара", "Виктория", "Анхель", "Игуасу"], correct: 2 },
  { question: "Год основания ООН?", answers: ["1943", "1945", "1947", "1949"], correct: 1 },
  { question: "Формула озона?", answers: ["O2", "O3", "O4", "O"], correct: 1 },
  { question: "Кто написал 'Капитал'?", answers: ["Энгельс", "Ленин", "Маркс", "Смит"], correct: 2 },
  { question: "Расстояние от Земли до Солнца (млн км)?", answers: ["120", "150", "180", "200"], correct: 1 },
];

const UltimateChallenge = ({ onClose, onGameEnd }) => {
  const [gameState, setGameState] = useState('menu'); // menu, playing, finished
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [perfectRun, setPerfectRun] = useState(true);
  const [wrongCount, setWrongCount] = useState(0);
  const timerRef = useRef(null);

  const TIME_PER_QUESTION = 20;
  const TOTAL_QUESTIONS = 15;

  const startGame = () => {
    const shuffled = [...HARD_QUESTIONS].sort(() => Math.random() - 0.5);
    setQuestions(shuffled.slice(0, TOTAL_QUESTIONS));
    setCurrentQuestion(0);
    setScore(0);
    setTimeLeft(TIME_PER_QUESTION);
    setTotalTime(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setPerfectRun(true);
    setWrongCount(0);
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
    setWrongCount(prev => prev + 1);
    setPerfectRun(false);
    setSelectedAnswer(-1);
    setShowResult(true);
    
    setTimeout(() => nextQuestion(), 1500);
  };

  const handleAnswer = (index) => {
    if (showResult || selectedAnswer !== null) return;
    
    if (timerRef.current) clearInterval(timerRef.current);
    
    const isCorrect = index === questions[currentQuestion].correct;
    // Сбалансированные очки
    const timeBonus = Math.floor(timeLeft / 5);
    
    if (isCorrect) {
      const basePoints = 8;
      setScore(prev => prev + basePoints + timeBonus);
    } else {
      setPerfectRun(false);
      setWrongCount(prev => prev + 1);
    }
    
    setSelectedAnswer(index);
    setShowResult(true);
    
    setTimeout(() => nextQuestion(), 1500);
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
    // Бонусы - сбалансированные
    const perfectBonus = perfectRun ? 50 : 0;
    const speedBonus = Math.min(30, Math.max(0, Math.floor((300 - totalTime) / 10)));
    const finalScore = score + perfectBonus + speedBonus;
    
    setScore(finalScore);
    setGameState('finished');
    
    if (onGameEnd) {
      onGameEnd(finalScore, 'ultimate');
    }
  };

  const getTimeColor = () => {
    if (timeLeft > 10) return 'text-green-500';
    if (timeLeft > 5) return 'text-yellow-500';
    return 'text-red-500 animate-pulse';
  };

  // Меню
  if (gameState === 'menu') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <div className="w-full max-w-lg bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden">
          <div className="relative p-6 bg-gradient-to-br from-amber-500 to-yellow-600">
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30"
            >
              <X size={20} />
            </button>
            <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center mx-auto mb-4">
              <Crown className="text-white" size={40} />
            </div>
            <h2 className="text-2xl font-bold text-white text-center">Ultimate Challenge</h2>
            <p className="text-white/80 text-center mt-1">Только для настоящих легенд!</p>
          </div>

          <div className="p-6 space-y-4">
            {/* Warning */}
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-red-600 dark:text-red-400">Внимание!</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Это самый сложный режим. Вопросы требуют глубоких знаний. Готов проверить себя?
                </p>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-amber-500/10 text-center">
                <Target className="w-6 h-6 text-amber-500 mx-auto mb-1" />
                <p className="text-sm font-bold text-gray-900 dark:text-white">{TOTAL_QUESTIONS}</p>
                <p className="text-xs text-gray-500">вопросов</p>
              </div>
              <div className="p-3 rounded-xl bg-purple-500/10 text-center">
                <Timer className="w-6 h-6 text-purple-500 mx-auto mb-1" />
                <p className="text-sm font-bold text-gray-900 dark:text-white">{TIME_PER_QUESTION}с</p>
                <p className="text-xs text-gray-500">на вопрос</p>
              </div>
              <div className="p-3 rounded-xl bg-green-500/10 text-center">
                <Trophy className="w-6 h-6 text-green-500 mx-auto mb-1" />
                <p className="text-sm font-bold text-gray-900 dark:text-white">x2</p>
                <p className="text-xs text-gray-500">очков</p>
              </div>
            </div>

            {/* Rules */}
            <div className="p-4 rounded-xl bg-gray-100 dark:bg-white/5">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Особенности:</h4>
              <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                <li>• Сложнейшие вопросы из разных областей</li>
                <li>• Бонус за скорость ответа</li>
                <li>• +1000 очков за идеальное прохождение!</li>
                <li>• Нет права на ошибку для максимума</li>
              </ul>
            </div>

            <button
              onClick={startGame}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 text-white font-bold text-lg hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <Crown size={24} />
              Принять вызов
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
        <div className="w-full max-w-2xl bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-amber-500 to-yellow-600">
            <div className="flex items-center justify-between mb-3">
              <button 
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30"
              >
                <ArrowLeft size={20} />
              </button>
              
              <div className="flex items-center gap-4 text-white">
                <div className="flex items-center gap-2">
                  <Trophy size={18} className="text-yellow-200" />
                  <span className="font-bold">{score}</span>
                </div>
                {perfectRun && (
                  <div className="px-3 py-1 rounded-full bg-white/20 text-sm font-bold flex items-center gap-1">
                    <Star size={14} className="text-yellow-200" />
                    Perfect!
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

          {/* Timer */}
          <div className="flex justify-center -mt-6">
            <div className={`w-16 h-16 rounded-full bg-white dark:bg-gray-800 shadow-lg flex items-center justify-center ${getTimeColor()}`}>
              <span className="text-2xl font-bold">{timeLeft}</span>
            </div>
          </div>

          {/* Difficulty Badge */}
          <div className="flex justify-center mt-2">
            <span className="px-3 py-1 rounded-full bg-red-500/10 text-red-600 dark:text-red-400 text-sm font-medium flex items-center gap-1">
              <Skull size={14} />
              Экстремальная сложность
            </span>
          </div>

          {/* Question */}
          <div className="p-6 pt-4">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white text-center mb-6">
              {question.question}
            </h2>

            {/* Answers */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {question.answers.map((answer, index) => {
                let buttonClass = 'bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 border-2 border-transparent';
                
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
                      <span className="w-8 h-8 rounded-lg bg-gray-200 dark:bg-white/10 flex items-center justify-center text-sm font-bold">
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
    const correctCount = TOTAL_QUESTIONS - wrongCount;
    const accuracy = Math.round((correctCount / TOTAL_QUESTIONS) * 100);
    
    const getGrade = () => {
      if (perfectRun) return { grade: 'S+', color: 'from-yellow-400 to-amber-500', text: 'ЛЕГЕНДАРНО!' };
      if (accuracy >= 90) return { grade: 'S', color: 'from-purple-400 to-pink-500', text: 'Превосходно!' };
      if (accuracy >= 80) return { grade: 'A', color: 'from-blue-400 to-cyan-500', text: 'Отлично!' };
      if (accuracy >= 70) return { grade: 'B', color: 'from-green-400 to-emerald-500', text: 'Хорошо!' };
      if (accuracy >= 60) return { grade: 'C', color: 'from-yellow-400 to-orange-500', text: 'Неплохо' };
      return { grade: 'D', color: 'from-gray-400 to-gray-600', text: 'Попробуй ещё' };
    };
    
    const { grade, color, text } = getGrade();
    
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden">
          <div className={`relative p-8 bg-gradient-to-br ${color} text-center`}>
            <div className="text-8xl font-black text-white/90 mb-2">{grade}</div>
            <h2 className="text-2xl font-bold text-white">{text}</h2>
            {perfectRun && (
              <div className="mt-2 flex justify-center">
                {[1, 2, 3, 4, 5].map(i => (
                  <Star key={i} size={24} className="text-yellow-200 fill-yellow-200" />
                ))}
              </div>
            )}
          </div>

          <div className="p-6 space-y-4">
            <div className="text-center">
              <p className="text-gray-600 dark:text-gray-400">Заработано очков</p>
              <p className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-yellow-600">
                +{score}
              </p>
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
                <Clock className="w-5 h-5 text-blue-500 mx-auto mb-1" />
                <p className="text-lg font-bold text-gray-900 dark:text-white">{Math.floor(totalTime / 60)}:{(totalTime % 60).toString().padStart(2, '0')}</p>
                <p className="text-xs text-gray-500">Время</p>
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
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 text-white font-bold flex items-center justify-center gap-2"
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

export default UltimateChallenge;
