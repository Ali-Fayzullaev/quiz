import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Flame, 
  Clock, 
  Trophy, 
  Star,
  ArrowLeft,
  RotateCcw,
  X,
  CheckCircle,
  XCircle,
  Heart,
  Zap,
  Shield
} from 'lucide-react';

// Большой пул вопросов для бесконечного режима
const QUESTIONS_POOL = [
  { question: "Столица Италии?", answers: ["Рим", "Милан", "Венеция", "Флоренция"], correct: 0 },
  { question: "Сколько океанов на Земле?", answers: ["3", "4", "5", "6"], correct: 2 },
  { question: "Кто изобрёл лампочку?", answers: ["Тесла", "Эдисон", "Белл", "Форд"], correct: 1 },
  { question: "Самая высокая гора в мире?", answers: ["К2", "Эверест", "Канченджанга", "Лхоцзе"], correct: 1 },
  { question: "Символ химического элемента кислорода?", answers: ["O", "Ox", "Ok", "On"], correct: 0 },
  { question: "Год основания Google?", answers: ["1996", "1998", "2000", "2002"], correct: 1 },
  { question: "Автор 'Преступления и наказания'?", answers: ["Толстой", "Достоевский", "Тургенев", "Гоголь"], correct: 1 },
  { question: "Скорость света (км/с)?", answers: ["200 000", "300 000", "400 000", "500 000"], correct: 1 },
  { question: "Столица Бразилии?", answers: ["Рио", "Сан-Паулу", "Бразилиа", "Сальвадор"], correct: 2 },
  { question: "Кто написал 'Евгения Онегина'?", answers: ["Лермонтов", "Пушкин", "Гоголь", "Тютчев"], correct: 1 },
  { question: "Самый маленький континент?", answers: ["Европа", "Австралия", "Антарктида", "Ю. Америка"], correct: 1 },
  { question: "Год первого полёта братьев Райт?", answers: ["1901", "1903", "1905", "1907"], correct: 1 },
  { question: "Формула метана?", answers: ["CH4", "C2H6", "CO2", "H2O"], correct: 0 },
  { question: "Столица Канады?", answers: ["Торонто", "Оттава", "Монреаль", "Ванкувер"], correct: 1 },
  { question: "Кто написал 'Ромео и Джульетту'?", answers: ["Мольер", "Шекспир", "Данте", "Гёте"], correct: 1 },
  { question: "Сколько зубов у взрослого человека?", answers: ["28", "30", "32", "34"], correct: 2 },
  { question: "Год основания Apple?", answers: ["1974", "1976", "1978", "1980"], correct: 1 },
  { question: "Самый большой океан?", answers: ["Атлантический", "Индийский", "Тихий", "Северный"], correct: 2 },
  { question: "Столица Германии?", answers: ["Мюнхен", "Берлин", "Гамбург", "Кёльн"], correct: 1 },
  { question: "Температура кипения воды (°C)?", answers: ["90", "95", "100", "105"], correct: 2 },
  { question: "Кто создал Windows?", answers: ["Джобс", "Гейтс", "Возняк", "Цукерберг"], correct: 1 },
  { question: "Самая длинная кость в теле?", answers: ["Позвоночник", "Бедренная", "Плечевая", "Голень"], correct: 1 },
  { question: "Столица Испании?", answers: ["Барселона", "Мадрид", "Севилья", "Валенсия"], correct: 1 },
  { question: "Год окончания ВОВ?", answers: ["1944", "1945", "1946", "1947"], correct: 1 },
  { question: "Планета, известная как 'Красная'?", answers: ["Венера", "Марс", "Юпитер", "Сатурн"], correct: 1 },
  { question: "Кто открыл пенициллин?", answers: ["Пастер", "Флеминг", "Кох", "Дженнер"], correct: 1 },
  { question: "Столица Китая?", answers: ["Шанхай", "Гонконг", "Пекин", "Гуанчжоу"], correct: 2 },
  { question: "Автор 'Анны Карениной'?", answers: ["Достоевский", "Толстой", "Чехов", "Булгаков"], correct: 1 },
  { question: "Сколько хромосом у человека?", answers: ["44", "46", "48", "50"], correct: 1 },
  { question: "Год изобретения телефона?", answers: ["1866", "1876", "1886", "1896"], correct: 1 },
];

const QuizRush = ({ onClose, onGameEnd }) => {
  const [gameState, setGameState] = useState('menu'); // menu, playing, finished
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [time, setTime] = useState(0);
  const [powerUps, setPowerUps] = useState({
    skip: 2,
    fiftyFifty: 2,
    extraLife: 1
  });
  const [hiddenAnswers, setHiddenAnswers] = useState([]);
  const [usedQuestions, setUsedQuestions] = useState(new Set());
  const timerRef = useRef(null);

  const startGame = () => {
    // Перемешиваем вопросы
    const shuffled = [...QUESTIONS_POOL].sort(() => Math.random() - 0.5);
    setQuestions(shuffled);
    setCurrentQuestion(0);
    setScore(0);
    setLives(3);
    setStreak(0);
    setMaxStreak(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setTime(0);
    setPowerUps({ skip: 2, fiftyFifty: 2, extraLife: 1 });
    setHiddenAnswers([]);
    setUsedQuestions(new Set());
    setGameState('playing');
  };

  // Таймер
  useEffect(() => {
    if (gameState === 'playing') {
      timerRef.current = setInterval(() => {
        setTime(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState]);

  const getNextQuestion = useCallback(() => {
    // Если закончились вопросы - перемешиваем заново
    if (currentQuestion >= questions.length - 1) {
      const shuffled = [...QUESTIONS_POOL].sort(() => Math.random() - 0.5);
      setQuestions(shuffled);
      setCurrentQuestion(0);
    } else {
      setCurrentQuestion(prev => prev + 1);
    }
    setSelectedAnswer(null);
    setShowResult(false);
    setHiddenAnswers([]);
  }, [currentQuestion, questions.length]);

  const handleAnswer = (index) => {
    if (showResult || selectedAnswer !== null) return;
    
    const isCorrect = index === questions[currentQuestion].correct;
    
    if (isCorrect) {
      const basePoints = 100;
      const streakBonus = streak * 20;
      setScore(prev => prev + basePoints + streakBonus);
      setStreak(prev => {
        const newStreak = prev + 1;
        if (newStreak > maxStreak) setMaxStreak(newStreak);
        return newStreak;
      });
    } else {
      setStreak(0);
      setLives(prev => {
        if (prev <= 1) {
          finishGame();
          return 0;
        }
        return prev - 1;
      });
    }
    
    setSelectedAnswer(index);
    setShowResult(true);
    
    if (lives > 1 || isCorrect) {
      setTimeout(() => {
        getNextQuestion();
      }, 1200);
    }
  };

  const usePowerUp = (type) => {
    if (powerUps[type] <= 0 || showResult) return;
    
    setPowerUps(prev => ({ ...prev, [type]: prev[type] - 1 }));
    
    switch (type) {
      case 'skip':
        // Пропустить вопрос без потери жизни
        getNextQuestion();
        break;
      case 'fiftyFifty':
        // Убрать 2 неправильных ответа
        const correctIndex = questions[currentQuestion].correct;
        const wrongIndices = [0, 1, 2, 3].filter(i => i !== correctIndex);
        const toHide = wrongIndices.sort(() => Math.random() - 0.5).slice(0, 2);
        setHiddenAnswers(toHide);
        break;
      case 'extraLife':
        // Добавить жизнь
        setLives(prev => Math.min(prev + 1, 5));
        break;
    }
  };

  const finishGame = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    
    // Бонусы за время выживания
    const timeBonus = Math.floor(time / 10) * 5;
    const finalScore = score + timeBonus;
    setScore(finalScore);
    setGameState('finished');
    
    if (onGameEnd) {
      onGameEnd(finalScore, 'rush');
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Меню
  if (gameState === 'menu') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <div className="w-full max-w-lg bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden">
          <div className="relative p-6 bg-gradient-to-br from-red-500 to-orange-500">
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30"
            >
              <X size={20} />
            </button>
            <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center mx-auto mb-4">
              <Flame className="text-white" size={40} />
            </div>
            <h2 className="text-2xl font-bold text-white text-center">Quiz Rush</h2>
            <p className="text-white/80 text-center mt-1">Бесконечный режим выживания!</p>
          </div>

          <div className="p-6 space-y-4">
            {/* Game Stats Preview */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-red-500/10 text-center">
                <Heart className="w-6 h-6 text-red-500 mx-auto mb-1" />
                <p className="text-sm font-bold text-gray-900 dark:text-white">3 жизни</p>
              </div>
              <div className="p-3 rounded-xl bg-yellow-500/10 text-center">
                <Zap className="w-6 h-6 text-yellow-500 mx-auto mb-1" />
                <p className="text-sm font-bold text-gray-900 dark:text-white">∞ вопросов</p>
              </div>
              <div className="p-3 rounded-xl bg-purple-500/10 text-center">
                <Shield className="w-6 h-6 text-purple-500 mx-auto mb-1" />
                <p className="text-sm font-bold text-gray-900 dark:text-white">5 бустеров</p>
              </div>
            </div>

            {/* Power-ups explanation */}
            <div className="p-4 rounded-xl bg-gray-100 dark:bg-white/5">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Бустеры:</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                  <span className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-500">↷</span>
                  <span><b>Пропуск (x2)</b> — пропустить вопрос без потери жизни</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                  <span className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-500">½</span>
                  <span><b>50/50 (x2)</b> — убрать 2 неправильных ответа</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                  <span className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center text-red-500">♥</span>
                  <span><b>Жизнь (x1)</b> — восстановить одну жизнь</span>
                </div>
              </div>
            </div>

            <button
              onClick={startGame}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-red-500 to-orange-500 text-white font-bold text-lg hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <Flame size={24} />
              Начать Rush!
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Игровой экран
  if (gameState === 'playing' && questions.length > 0) {
    const question = questions[currentQuestion];
    
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <div className="w-full max-w-2xl bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-red-500 to-orange-500">
            <div className="flex items-center justify-between mb-3">
              <button 
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30"
              >
                <ArrowLeft size={20} />
              </button>
              
              <div className="flex items-center gap-4 text-white">
                {/* Lives */}
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Heart 
                      key={i} 
                      size={20} 
                      className={i < lives ? 'text-red-200 fill-red-200' : 'text-white/30'} 
                    />
                  ))}
                </div>
                
                {/* Score */}
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/20">
                  <Trophy size={16} className="text-yellow-200" />
                  <span className="font-bold">{score}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2 text-white">
                <Clock size={16} />
                <span className="font-mono">{formatTime(time)}</span>
              </div>
            </div>

            {/* Streak indicator */}
            {streak > 0 && (
              <div className="flex justify-center">
                <div className="px-4 py-1 rounded-full bg-white/20 text-white text-sm font-bold flex items-center gap-2">
                  <Flame size={16} className="text-yellow-200" />
                  Серия: {streak}x (бонус +{streak * 20})
                </div>
              </div>
            )}
          </div>

          {/* Question Counter */}
          <div className="flex justify-center -mt-4">
            <div className="px-6 py-2 rounded-full bg-white dark:bg-gray-800 shadow-lg text-gray-900 dark:text-white font-bold">
              Вопрос #{currentQuestion + 1}
            </div>
          </div>

          {/* Question */}
          <div className="p-6 pt-4">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white text-center mb-6">
              {question.question}
            </h2>

            {/* Answers */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
              {question.answers.map((answer, index) => {
                if (hiddenAnswers.includes(index)) {
                  return (
                    <div 
                      key={index}
                      className="p-4 rounded-xl bg-gray-100 dark:bg-white/5 opacity-30"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-lg bg-gray-200 dark:bg-white/10 flex items-center justify-center text-sm font-bold">
                          {String.fromCharCode(65 + index)}
                        </span>
                        <span className="text-gray-400 line-through">{answer}</span>
                      </div>
                    </div>
                  );
                }
                
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

            {/* Power-ups */}
            <div className="flex justify-center gap-3">
              <button
                onClick={() => usePowerUp('skip')}
                disabled={powerUps.skip <= 0 || showResult}
                className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-all ${
                  powerUps.skip > 0 && !showResult
                    ? 'bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400'
                    : 'bg-gray-100 dark:bg-white/5 text-gray-400 cursor-not-allowed'
                }`}
              >
                <RotateCcw size={20} />
                <span className="text-xs font-medium">Пропуск ({powerUps.skip})</span>
              </button>
              
              <button
                onClick={() => usePowerUp('fiftyFifty')}
                disabled={powerUps.fiftyFifty <= 0 || showResult || hiddenAnswers.length > 0}
                className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-all ${
                  powerUps.fiftyFifty > 0 && !showResult && hiddenAnswers.length === 0
                    ? 'bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-400'
                    : 'bg-gray-100 dark:bg-white/5 text-gray-400 cursor-not-allowed'
                }`}
              >
                <span className="text-lg font-bold">½</span>
                <span className="text-xs font-medium">50/50 ({powerUps.fiftyFifty})</span>
              </button>
              
              <button
                onClick={() => usePowerUp('extraLife')}
                disabled={powerUps.extraLife <= 0 || lives >= 5}
                className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-all ${
                  powerUps.extraLife > 0 && lives < 5
                    ? 'bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400'
                    : 'bg-gray-100 dark:bg-white/5 text-gray-400 cursor-not-allowed'
                }`}
              >
                <Heart size={20} />
                <span className="text-xs font-medium">+Жизнь ({powerUps.extraLife})</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Результаты
  if (gameState === 'finished') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden">
          <div className="relative p-8 bg-gradient-to-br from-red-500 to-orange-500 text-center">
            <div className="absolute inset-0 overflow-hidden">
              {[...Array(15)].map((_, i) => (
                <Flame
                  key={i}
                  size={24}
                  className="absolute text-white/20 animate-float"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 2}s`
                  }}
                />
              ))}
            </div>
            
            <Trophy className="w-16 h-16 text-yellow-200 mx-auto mb-3 relative z-10" />
            <h2 className="text-3xl font-bold text-white relative z-10">Game Over!</h2>
            <p className="text-white/80 mt-1 relative z-10">Отличная попытка!</p>
          </div>

          <div className="p-6 space-y-4">
            <div className="text-center">
              <p className="text-gray-600 dark:text-gray-400">Заработано очков</p>
              <p className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">
                +{score}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="p-4 rounded-xl bg-gray-100 dark:bg-white/5 text-center">
                <CheckCircle className="w-5 h-5 text-green-500 mx-auto mb-1" />
                <p className="text-lg font-bold text-gray-900 dark:text-white">{currentQuestion}</p>
                <p className="text-xs text-gray-500">Вопросов</p>
              </div>
              <div className="p-4 rounded-xl bg-gray-100 dark:bg-white/5 text-center">
                <Clock className="w-5 h-5 text-blue-500 mx-auto mb-1" />
                <p className="text-lg font-bold text-gray-900 dark:text-white">{formatTime(time)}</p>
                <p className="text-xs text-gray-500">Время</p>
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
                onClick={startGame}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-red-500 to-orange-500 text-white font-bold flex items-center justify-center gap-2"
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

export default QuizRush;
