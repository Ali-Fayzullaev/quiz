import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Users, 
  Clock, 
  Trophy, 
  Star,
  ArrowLeft,
  RotateCcw,
  X,
  CheckCircle,
  XCircle,
  Bot,
  Crown,
  Medal,
  Zap
} from 'lucide-react';

// Вопросы для мультиплеера против бота
const QUESTIONS = [
  { question: "Химический символ золота?", answers: ["Au", "Ag", "Fe", "Cu"], correct: 0, difficulty: 1 },
  { question: "Столица Австралии?", answers: ["Сидней", "Мельбурн", "Канберра", "Перт"], correct: 2, difficulty: 2 },
  { question: "Год падения Римской империи?", answers: ["376", "410", "455", "476"], correct: 3, difficulty: 3 },
  { question: "Сколько сторон у додекаэдра?", answers: ["10", "12", "14", "20"], correct: 1, difficulty: 2 },
  { question: "Кто написал 'Божественную комедию'?", answers: ["Петрарка", "Боккаччо", "Данте", "Вергилий"], correct: 2, difficulty: 2 },
  { question: "Скорость звука в воздухе (м/с)?", answers: ["300", "331", "343", "400"], correct: 2, difficulty: 3 },
  { question: "Самая глубокая впадина в океане?", answers: ["Пуэрто-Рико", "Яванская", "Марианская", "Филиппинская"], correct: 2, difficulty: 1 },
  { question: "Год первой высадки на Луну?", answers: ["1967", "1968", "1969", "1970"], correct: 2, difficulty: 1 },
  { question: "Столица Португалии?", answers: ["Порту", "Лиссабон", "Брага", "Фару"], correct: 1, difficulty: 1 },
  { question: "Автор теории эволюции?", answers: ["Ламарк", "Мендель", "Дарвин", "Уоллес"], correct: 2, difficulty: 1 },
  { question: "Атомный номер углерода?", answers: ["4", "6", "8", "12"], correct: 1, difficulty: 2 },
  { question: "Год изобретения книгопечатания?", answers: ["1440", "1450", "1455", "1460"], correct: 2, difficulty: 3 },
  { question: "Самый твёрдый минерал?", answers: ["Корунд", "Топаз", "Алмаз", "Кварц"], correct: 2, difficulty: 1 },
  { question: "Столица Нидерландов?", answers: ["Роттердам", "Гаага", "Амстердам", "Утрехт"], correct: 2, difficulty: 1 },
  { question: "Формула серной кислоты?", answers: ["HCl", "HNO3", "H2SO4", "H3PO4"], correct: 2, difficulty: 2 },
];

const BOT_NAMES = [
  'QuizMaster AI', 'BrainBot', 'SmartBot', 'GeniusAI', 
  'KnowledgeBot', 'QuizWhiz', 'BrainiacBot', 'WisdomAI'
];

const BrainBattle = ({ onClose, onGameEnd }) => {
  const [gameState, setGameState] = useState('menu'); // menu, waiting, playing, finished
  const [difficulty, setDifficulty] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [playerScore, setPlayerScore] = useState(0);
  const [botScore, setBotScore] = useState(0);
  const [playerAnswer, setPlayerAnswer] = useState(null);
  const [botAnswer, setBotAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [botName, setBotName] = useState('');
  const [botThinking, setBotThinking] = useState(false);
  const [roundWinner, setRoundWinner] = useState(null);
  const timerRef = useRef(null);

  const difficulties = {
    easy: { questions: 7, time: 15, name: 'Легко', botAccuracy: 0.5, botSpeed: [3, 8] },
    medium: { questions: 10, time: 12, name: 'Средне', botAccuracy: 0.7, botSpeed: [2, 6] },
    hard: { questions: 12, time: 10, name: 'Сложно', botAccuracy: 0.85, botSpeed: [1, 4] }
  };

  const startGame = (diff) => {
    setDifficulty(diff);
    setBotName(BOT_NAMES[Math.floor(Math.random() * BOT_NAMES.length)]);
    setGameState('waiting');
    
    // Имитация поиска противника
    setTimeout(() => {
      const config = difficulties[diff];
      const shuffled = [...QUESTIONS].sort(() => Math.random() - 0.5);
      setQuestions(shuffled.slice(0, config.questions));
      setCurrentQuestion(0);
      setPlayerScore(0);
      setBotScore(0);
      setPlayerAnswer(null);
      setBotAnswer(null);
      setShowResult(false);
      setTimeLeft(config.time);
      setGameState('playing');
    }, 2000);
  };

  // Ответ бота
  const botTurn = useCallback(() => {
    if (!difficulty || showResult) return;
    
    const config = difficulties[difficulty];
    const question = questions[currentQuestion];
    
    // Случайное время ответа бота
    const [minSpeed, maxSpeed] = config.botSpeed;
    const botResponseTime = (minSpeed + Math.random() * (maxSpeed - minSpeed)) * 1000;
    
    setBotThinking(true);
    
    setTimeout(() => {
      if (showResult) return;
      
      // Бот отвечает правильно с определённой вероятностью
      const isCorrect = Math.random() < config.botAccuracy;
      
      let answer;
      if (isCorrect) {
        answer = question.correct;
      } else {
        // Случайный неправильный ответ
        const wrongAnswers = [0, 1, 2, 3].filter(i => i !== question.correct);
        answer = wrongAnswers[Math.floor(Math.random() * wrongAnswers.length)];
      }
      
      setBotAnswer(answer);
      setBotThinking(false);
    }, botResponseTime);
  }, [difficulty, questions, currentQuestion, showResult]);

  // Таймер
  useEffect(() => {
    if (gameState === 'playing' && !showResult) {
      // Запуск хода бота
      botTurn();
      
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleRoundEnd();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState, showResult, currentQuestion, botTurn]);

  // Проверка окончания раунда
  useEffect(() => {
    if (playerAnswer !== null && botAnswer !== null && !showResult) {
      if (timerRef.current) clearInterval(timerRef.current);
      handleRoundEnd();
    }
  }, [playerAnswer, botAnswer]);

  const handlePlayerAnswer = (index) => {
    if (showResult || playerAnswer !== null) return;
    setPlayerAnswer(index);
  };

  const handleRoundEnd = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    
    const question = questions[currentQuestion];
    const playerCorrect = playerAnswer === question.correct;
    const botCorrect = botAnswer === question.correct;
    
    if (playerCorrect && !botCorrect) {
      setPlayerScore(prev => prev + 1);
      setRoundWinner('player');
    } else if (!playerCorrect && botCorrect) {
      setBotScore(prev => prev + 1);
      setRoundWinner('bot');
    } else if (playerCorrect && botCorrect) {
      // Оба правильно - ничья, никто не получает очко
      setRoundWinner('tie');
    } else {
      // Оба неправильно
      setRoundWinner('none');
    }
    
    setShowResult(true);
    
    setTimeout(() => {
      if (currentQuestion + 1 >= questions.length) {
        finishGame();
      } else {
        setCurrentQuestion(prev => prev + 1);
        setTimeLeft(difficulties[difficulty].time);
        setPlayerAnswer(null);
        setBotAnswer(null);
        setShowResult(false);
        setRoundWinner(null);
      }
    }, 2000);
  };

  const finishGame = () => {
    // Подсчёт очков - сбалансированный
    const baseScore = playerScore * 10; // 10 очков за правильный ответ
    const winBonus = playerScore > botScore ? 30 : 0;
    const perfectBonus = botScore === 0 ? 20 : 0;
    const finalScore = baseScore + winBonus + perfectBonus;
    
    setPlayerScore(finalScore);
    setGameState('finished');
    
    if (onGameEnd) {
      onGameEnd(finalScore, 'battle');
    }
  };

  // Меню
  if (gameState === 'menu') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <div className="w-full max-w-lg bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden">
          <div className="relative p-6 bg-gradient-to-br from-blue-500 to-cyan-500">
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30"
            >
              <X size={20} />
            </button>
            <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center mx-auto mb-4">
              <Users className="text-white" size={40} />
            </div>
            <h2 className="text-2xl font-bold text-white text-center">Brain Battle</h2>
            <p className="text-white/80 text-center mt-1">Сразись с AI противником!</p>
          </div>

          <div className="p-6 space-y-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white text-center">Выбери сложность</h3>
            
            <div className="grid grid-cols-3 gap-3">
              {Object.entries(difficulties).map(([key, { name, questions, time }]) => (
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
                  <p className="text-sm text-gray-600 dark:text-gray-400">{questions} раундов</p>
                  <p className="text-xs text-gray-500">{time} сек/раунд</p>
                </button>
              ))}
            </div>

            <div className="mt-6 p-4 rounded-xl bg-gray-100 dark:bg-white/5">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Правила:</h4>
              <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                <li>• Отвечай быстрее противника</li>
                <li>• Правильный ответ = 1 очко</li>
                <li>• Выигравший получает бонус!</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Поиск противника
  if (gameState === 'waiting') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-3xl shadow-2xl p-8 text-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mx-auto mb-6 animate-pulse">
            <Bot className="text-white" size={40} />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Поиск противника...</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">Подбираем достойного соперника</p>
          
          <div className="flex justify-center gap-2">
            {[0, 1, 2].map(i => (
              <div 
                key={i}
                className="w-3 h-3 rounded-full bg-blue-500 animate-bounce"
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Игровой экран
  if (gameState === 'playing') {
    const question = questions[currentQuestion];
    const config = difficulties[difficulty];
    
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <div className="w-full max-w-2xl bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden">
          {/* Header с игроками */}
          <div className="p-4 bg-gradient-to-r from-blue-500 to-cyan-500">
            <div className="flex items-center justify-between">
              {/* Игрок */}
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-full bg-white/20 flex items-center justify-center ${
                  roundWinner === 'player' ? 'ring-4 ring-green-400' : ''
                }`}>
                  <Crown className="text-yellow-200" size={24} />
                </div>
                <div className="text-white">
                  <p className="font-bold">Вы</p>
                  <p className="text-2xl font-bold">{Math.floor(playerScore / 150) || playerScore}</p>
                </div>
              </div>
              
              {/* VS + Timer */}
              <div className="text-center">
                <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto
                              ${timeLeft <= 3 ? 'bg-red-500 animate-pulse' : 'bg-white/20'}`}>
                  <span className="text-2xl font-bold text-white">{timeLeft}</span>
                </div>
                <p className="text-white/60 text-sm mt-1">Раунд {currentQuestion + 1}/{questions.length}</p>
              </div>
              
              {/* Бот */}
              <div className="flex items-center gap-3">
                <div className="text-white text-right">
                  <p className="font-bold">{botName}</p>
                  <p className="text-2xl font-bold">{botScore}</p>
                </div>
                <div className={`w-12 h-12 rounded-full bg-white/20 flex items-center justify-center ${
                  botThinking ? 'animate-pulse' : ''
                } ${roundWinner === 'bot' ? 'ring-4 ring-green-400' : ''}`}>
                  <Bot className="text-white" size={24} />
                </div>
              </div>
            </div>
          </div>

          {/* Question */}
          <div className="p-6">
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
                  } else if ((index === playerAnswer || index === botAnswer) && index !== question.correct) {
                    buttonClass = 'bg-red-500/20 border-2 border-red-500';
                  } else {
                    buttonClass = 'bg-gray-100 dark:bg-white/5 opacity-50';
                  }
                } else if (index === playerAnswer) {
                  buttonClass = 'bg-blue-500/20 border-2 border-blue-500';
                }
                
                return (
                  <button
                    key={index}
                    onClick={() => handlePlayerAnswer(index)}
                    disabled={showResult || playerAnswer !== null}
                    className={`p-4 rounded-xl font-medium transition-all ${buttonClass} relative`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-lg bg-gray-200 dark:bg-white/10 flex items-center justify-center text-sm font-bold">
                        {String.fromCharCode(65 + index)}
                      </span>
                      <span className="text-gray-900 dark:text-white">{answer}</span>
                      
                      {/* Показатели кто выбрал */}
                      <div className="ml-auto flex gap-1">
                        {showResult && index === playerAnswer && (
                          <span className="px-2 py-0.5 rounded-full bg-blue-500 text-white text-xs">Вы</span>
                        )}
                        {showResult && index === botAnswer && (
                          <span className="px-2 py-0.5 rounded-full bg-purple-500 text-white text-xs">AI</span>
                        )}
                      </div>
                    </div>
                    
                    {showResult && index === question.correct && (
                      <CheckCircle className="absolute top-2 right-2 text-green-500" size={20} />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Round result */}
            {showResult && roundWinner && (
              <div className={`mt-4 p-4 rounded-xl text-center ${
                roundWinner === 'player' ? 'bg-green-500/20 text-green-600' :
                roundWinner === 'bot' ? 'bg-red-500/20 text-red-600' :
                roundWinner === 'tie' ? 'bg-yellow-500/20 text-yellow-600' :
                'bg-gray-500/20 text-gray-600'
              }`}>
                <p className="font-bold text-lg">
                  {roundWinner === 'player' ? '🎉 Вы выиграли раунд!' :
                   roundWinner === 'bot' ? `😔 ${botName} выиграл раунд` :
                   roundWinner === 'tie' ? '🤝 Ничья!' :
                   '❌ Никто не ответил правильно'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Результаты
  if (gameState === 'finished') {
    const originalPlayerScore = Math.floor(playerScore / 150) || 0;
    const playerWon = originalPlayerScore > botScore;
    const tie = originalPlayerScore === botScore;
    
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden">
          <div className={`relative p-8 text-center ${
            playerWon ? 'bg-gradient-to-br from-yellow-400 to-orange-500' :
            tie ? 'bg-gradient-to-br from-blue-400 to-purple-500' :
            'bg-gradient-to-br from-gray-400 to-gray-600'
          }`}>
            {playerWon ? (
              <>
                <Trophy className="w-16 h-16 text-yellow-200 mx-auto mb-3" />
                <h2 className="text-3xl font-bold text-white">Победа!</h2>
              </>
            ) : tie ? (
              <>
                <Medal className="w-16 h-16 text-white mx-auto mb-3" />
                <h2 className="text-3xl font-bold text-white">Ничья!</h2>
              </>
            ) : (
              <>
                <XCircle className="w-16 h-16 text-white/80 mx-auto mb-3" />
                <h2 className="text-3xl font-bold text-white">Поражение</h2>
              </>
            )}
            
            <p className="text-white/80 mt-2">
              {playerWon ? `Вы победили ${botName}!` : 
               tie ? 'Достойная битва!' : 
               `${botName} оказался сильнее`}
            </p>
          </div>

          <div className="p-6 space-y-4">
            {/* Score comparison */}
            <div className="flex items-center justify-center gap-8">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto mb-2">
                  <Crown className="text-blue-500" size={32} />
                </div>
                <p className="font-bold text-gray-900 dark:text-white">Вы</p>
                <p className="text-2xl font-bold text-blue-500">{originalPlayerScore}</p>
              </div>
              
              <div className="text-4xl font-bold text-gray-300">VS</div>
              
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto mb-2">
                  <Bot className="text-purple-500" size={32} />
                </div>
                <p className="font-bold text-gray-900 dark:text-white">{botName}</p>
                <p className="text-2xl font-bold text-purple-500">{botScore}</p>
              </div>
            </div>

            {/* Points earned */}
            <div className="text-center p-4 rounded-xl bg-gray-100 dark:bg-white/5">
              <p className="text-gray-600 dark:text-gray-400">Заработано очков</p>
              <p className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-cyan-500">
                +{playerScore}
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={onClose}
                className="flex-1 py-3 rounded-xl bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300 font-medium"
              >
                Выход
              </button>
              <button
                onClick={() => {
                  setGameState('menu');
                  setPlayerScore(0);
                }}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold flex items-center justify-center gap-2"
              >
                <RotateCcw size={18} />
                Реванш
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default BrainBattle;
