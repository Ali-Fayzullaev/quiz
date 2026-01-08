import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Brain, 
  Trophy, 
  Clock, 
  RotateCcw, 
  ArrowLeft,
  Star,
  Sparkles,
  CheckCircle,
  Zap,
  X
} from 'lucide-react';

const EMOJIS = ['🎮', '🎯', '🚀', '⭐', '🔥', '💎', '🏆', '⚡', '🎪', '🎨', '🎭', '🎵'];

const MemoryGame = ({ onClose, onGameEnd }) => {
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [moves, setMoves] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [time, setTime] = useState(0);
  const [difficulty, setDifficulty] = useState(null);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [showCombo, setShowCombo] = useState(false);

  const difficulties = {
    easy: { pairs: 6, name: 'Легко', multiplier: 1, gridCols: 4 },
    medium: { pairs: 8, name: 'Средне', multiplier: 1.5, gridCols: 4 },
    hard: { pairs: 12, name: 'Сложно', multiplier: 2, gridCols: 6 }
  };

  // Инициализация игры
  const initializeGame = useCallback((diff) => {
    const { pairs } = difficulties[diff];
    const selectedEmojis = EMOJIS.slice(0, pairs);
    const cardPairs = [...selectedEmojis, ...selectedEmojis];
    
    // Перемешивание
    for (let i = cardPairs.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cardPairs[i], cardPairs[j]] = [cardPairs[j], cardPairs[i]];
    }
    
    setCards(cardPairs.map((emoji, index) => ({ id: index, emoji, isFlipped: false })));
    setFlipped([]);
    setMatched([]);
    setMoves(0);
    setTime(0);
    setScore(0);
    setCombo(0);
    setGameStarted(true);
    setGameOver(false);
    setDifficulty(diff);
  }, []);

  // Таймер
  useEffect(() => {
    let interval;
    if (gameStarted && !gameOver) {
      interval = setInterval(() => {
        setTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameStarted, gameOver]);

  // Проверка совпадения
  useEffect(() => {
    if (flipped.length === 2) {
      const [first, second] = flipped;
      
      if (cards[first].emoji === cards[second].emoji) {
        // Совпадение найдено!
        setMatched(prev => [...prev, first, second]);
        setCombo(prev => prev + 1);
        setShowCombo(true);
        setTimeout(() => setShowCombo(false), 800);
        
        // Подсчёт очков (базовые, без накопления)
        const comboBonus = Math.min(combo * 5, 30); // макс 30 бонус за комбо
        setScore(prev => prev + 10 + comboBonus);
        
        setFlipped([]);
      } else {
        // Нет совпадения
        setCombo(0);
        setTimeout(() => {
          setFlipped([]);
        }, 1000);
      }
      setMoves(prev => prev + 1);
    }
  }, [flipped, cards, combo, time]);

  // Проверка окончания игры
  useEffect(() => {
    if (gameStarted && cards.length > 0 && matched.length === cards.length) {
      setGameOver(true);
      
      // Финальный подсчёт - сбалансированный
      const { multiplier, pairs } = difficulties[difficulty];
      // Базовые очки за пары
      const baseScore = pairs * 20;
      // Бонус за время (макс 100 очков)
      const timeBonus = Math.max(0, Math.min(100, Math.round((120 - time) / 1.2)));
      // Бонус за минимум ходов (макс 50 очков)
      const perfectMoves = pairs;
      const movesBonus = moves <= perfectMoves * 2 ? Math.max(0, 50 - (moves - perfectMoves) * 5) : 0;
      
      const finalScore = Math.round((baseScore + timeBonus + movesBonus) * multiplier);
      
      setScore(finalScore);
      
      // Сохранение очков
      if (onGameEnd) {
        onGameEnd(finalScore, 'memory');
      }
    }
  }, [matched, cards, gameStarted, difficulty, time, moves, score, onGameEnd]);

  const handleCardClick = (index) => {
    if (
      flipped.length === 2 || 
      flipped.includes(index) || 
      matched.includes(index)
    ) {
      return;
    }
    
    setFlipped(prev => [...prev, index]);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStars = () => {
    const { pairs } = difficulties[difficulty];
    const perfectMoves = pairs;
    const ratio = perfectMoves / moves;
    
    if (ratio >= 0.8) return 3;
    if (ratio >= 0.5) return 2;
    return 1;
  };

  // Экран выбора сложности
  if (!gameStarted) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <div className="w-full max-w-lg bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="relative p-6 bg-gradient-to-br from-purple-500 to-pink-500">
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors"
            >
              <X size={20} />
            </button>
            <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center mx-auto mb-4">
              <Brain className="text-white" size={40} />
            </div>
            <h2 className="text-2xl font-bold text-white text-center">Memory Game</h2>
            <p className="text-white/80 text-center mt-1">Найди все пары карточек!</p>
          </div>

          {/* Difficulty Selection */}
          <div className="p-6 space-y-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white text-center mb-4">
              Выбери сложность
            </h3>
            
            <div className="grid grid-cols-3 gap-3">
              {Object.entries(difficulties).map(([key, { name, pairs, multiplier }]) => (
                <button
                  key={key}
                  onClick={() => initializeGame(key)}
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
                  <p className="text-sm text-gray-600 dark:text-gray-400">{pairs} пар</p>
                  <p className="text-xs text-gray-500 mt-1">x{multiplier} очков</p>
                </button>
              ))}
            </div>

            {/* How to play */}
            <div className="mt-6 p-4 rounded-xl bg-gray-100 dark:bg-white/5">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Как играть:</h4>
              <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                <li>• Кликай на карточки, чтобы перевернуть</li>
                <li>• Найди все пары одинаковых карточек</li>
                <li>• Меньше ходов = больше очков</li>
                <li>• Быстрее = бонус за время!</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Экран окончания игры
  if (gameOver) {
    const stars = getStars();
    
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden animate-bounce-in">
          {/* Confetti effect */}
          <div className="relative p-8 bg-gradient-to-br from-purple-500 to-pink-500 text-center overflow-hidden">
            <div className="absolute inset-0">
              {[...Array(20)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-2 h-2 rounded-full animate-float"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    backgroundColor: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1'][Math.floor(Math.random() * 4)],
                    animationDelay: `${Math.random() * 2}s`,
                    animationDuration: `${2 + Math.random() * 2}s`
                  }}
                />
              ))}
            </div>
            
            <Trophy className="w-16 h-16 text-yellow-300 mx-auto mb-3 animate-bounce" />
            <h2 className="text-3xl font-bold text-white">Победа!</h2>
            
            {/* Stars */}
            <div className="flex justify-center gap-2 mt-4">
              {[1, 2, 3].map((star) => (
                <Star
                  key={star}
                  size={32}
                  className={`transition-all duration-500 ${
                    star <= stars 
                      ? 'text-yellow-300 fill-yellow-300 scale-110' 
                      : 'text-white/30'
                  }`}
                  style={{ animationDelay: `${star * 0.2}s` }}
                />
              ))}
            </div>
          </div>

          <div className="p-6 space-y-4">
            {/* Score */}
            <div className="text-center">
              <p className="text-gray-600 dark:text-gray-400">Заработано очков</p>
              <p className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500">
                +{score}
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 rounded-xl bg-gray-100 dark:bg-white/5 text-center">
                <Clock className="w-5 h-5 text-purple-500 mx-auto mb-1" />
                <p className="text-lg font-bold text-gray-900 dark:text-white">{formatTime(time)}</p>
                <p className="text-xs text-gray-500">Время</p>
              </div>
              <div className="p-4 rounded-xl bg-gray-100 dark:bg-white/5 text-center">
                <RotateCcw className="w-5 h-5 text-pink-500 mx-auto mb-1" />
                <p className="text-lg font-bold text-gray-900 dark:text-white">{moves}</p>
                <p className="text-xs text-gray-500">Ходов</p>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={onClose}
                className="flex-1 py-3 rounded-xl bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-200 dark:hover:bg-white/20 transition-colors"
              >
                Выход
              </button>
              <button
                onClick={() => initializeGame(difficulty)}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2"
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

  // Игровой экран
  const { gridCols } = difficulties[difficulty];
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-between">
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          
          <div className="flex items-center gap-6 text-white">
            <div className="flex items-center gap-2">
              <Clock size={18} />
              <span className="font-mono font-bold">{formatTime(time)}</span>
            </div>
            <div className="flex items-center gap-2">
              <RotateCcw size={18} />
              <span className="font-mono font-bold">{moves}</span>
            </div>
            <div className="flex items-center gap-2">
              <Star size={18} className="text-yellow-300" />
              <span className="font-mono font-bold">{score}</span>
            </div>
          </div>
          
          <button 
            onClick={() => initializeGame(difficulty)}
            className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors"
          >
            <RotateCcw size={20} />
          </button>
        </div>

        {/* Combo indicator */}
        {showCombo && combo > 1 && (
          <div className="absolute top-24 left-1/2 -translate-x-1/2 z-10 animate-bounce">
            <div className="px-4 py-2 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold flex items-center gap-2 shadow-lg">
              <Zap size={18} />
              Combo x{combo}!
            </div>
          </div>
        )}

        {/* Game Board */}
        <div className="p-6">
          <div 
            className="grid gap-3 mx-auto"
            style={{ 
              gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))`,
              maxWidth: gridCols === 6 ? '500px' : '400px'
            }}
          >
            {cards.map((card, index) => {
              const isFlipped = flipped.includes(index) || matched.includes(index);
              const isMatched = matched.includes(index);
              
              return (
                <div
                  key={card.id}
                  onClick={() => handleCardClick(index)}
                  className={`aspect-square rounded-xl cursor-pointer transition-all duration-300 transform ${
                    isFlipped ? 'rotate-y-180' : ''
                  } ${isMatched ? 'scale-95 opacity-75' : 'hover:scale-105'}`}
                  style={{ perspective: '1000px' }}
                >
                  <div 
                    className={`relative w-full h-full transition-transform duration-500 transform-style-preserve-3d ${
                      isFlipped ? 'rotate-y-180' : ''
                    }`}
                  >
                    {/* Card Back */}
                    <div className={`absolute inset-0 rounded-xl flex items-center justify-center 
                                  bg-gradient-to-br from-purple-500 to-pink-500 backface-hidden
                                  shadow-lg hover:shadow-xl ${isFlipped ? 'invisible' : ''}`}>
                      <Sparkles className="text-white/50" size={24} />
                    </div>
                    
                    {/* Card Front */}
                    <div className={`absolute inset-0 rounded-xl flex items-center justify-center 
                                  bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700
                                  shadow-lg rotate-y-180 backface-hidden ${!isFlipped ? 'invisible' : ''}`}>
                      <span className="text-4xl">{card.emoji}</span>
                      {isMatched && (
                        <div className="absolute inset-0 rounded-xl bg-green-500/20 flex items-center justify-center">
                          <CheckCircle className="text-green-500" size={32} />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Progress */}
        <div className="px-6 pb-6">
          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
            <span>Прогресс</span>
            <span>{matched.length / 2} / {cards.length / 2} пар</span>
          </div>
          <div className="h-2 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500"
              style={{ width: `${(matched.length / cards.length) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemoryGame;
