import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ArrowLeft, Trophy, Eye, EyeOff, Shuffle } from 'lucide-react';

const ColorMatch = ({ onEnd, onBack }) => {
  const [gameState, setGameState] = useState('ready'); // ready, playing, finished
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [level, setLevel] = useState(1);
  const [timeLeft, setTimeLeft] = useState(45);
  const [currentWord, setCurrentWord] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [wrongAnswers, setWrongAnswers] = useState(0);

  const colors = [
    { name: 'КРАСНЫЙ', value: '#EF4444', textColor: 'text-red-500' },
    { name: 'СИНИЙ', value: '#3B82F6', textColor: 'text-blue-500' },
    { name: 'ЗЕЛЁНЫЙ', value: '#22C55E', textColor: 'text-green-500' },
    { name: 'ЖЁЛТЫЙ', value: '#EAB308', textColor: 'text-yellow-500' },
    { name: 'ФИОЛЕТОВЫЙ', value: '#A855F7', textColor: 'text-purple-500' },
    { name: 'ОРАНЖЕВЫЙ', value: '#F97316', textColor: 'text-orange-500' },
    { name: 'РОЗОВЫЙ', value: '#EC4899', textColor: 'text-pink-500' },
    { name: 'ГОЛУБОЙ', value: '#06B6D4', textColor: 'text-cyan-500' },
  ];

  const generateWord = useCallback(() => {
    const wordColor = colors[Math.floor(Math.random() * colors.length)];
    let displayColor;
    
    // С увеличением уровня выше шанс несовпадения
    const matchChance = Math.max(0.5 - level * 0.05, 0.3);
    
    if (Math.random() < matchChance) {
      // Совпадает
      displayColor = wordColor;
    } else {
      // Не совпадает
      const otherColors = colors.filter(c => c.name !== wordColor.name);
      displayColor = otherColors[Math.floor(Math.random() * otherColors.length)];
    }
    
    return {
      word: wordColor.name,
      wordColorName: wordColor.name,
      displayColor: displayColor.value,
      displayColorName: displayColor.name,
      isMatch: wordColor.name === displayColor.name
    };
  }, [level]);

  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setLives(3);
    setLevel(1);
    setTimeLeft(45);
    setCorrectAnswers(0);
    setWrongAnswers(0);
    setCurrentWord(generateWord());
  };

  useEffect(() => {
    if (gameState !== 'playing') return;
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setGameState('finished');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [gameState]);

  useEffect(() => {
    if (lives <= 0) {
      setGameState('finished');
    }
  }, [lives]);

  // Повышение уровня каждые 10 правильных ответов
  useEffect(() => {
    if (correctAnswers > 0 && correctAnswers % 10 === 0) {
      setLevel(prev => Math.min(prev + 1, 10));
    }
  }, [correctAnswers]);

  const handleAnswer = (answer) => {
    if (gameState !== 'playing' || feedback) return;
    
    const isCorrect = (answer === 'match' && currentWord.isMatch) || 
                      (answer === 'different' && !currentWord.isMatch);
    
    if (isCorrect) {
      const pointsEarned = 10 + level * 5;
      setScore(prev => prev + pointsEarned);
      setCorrectAnswers(prev => prev + 1);
      setFeedback({ correct: true, points: pointsEarned });
    } else {
      setLives(prev => prev - 1);
      setWrongAnswers(prev => prev + 1);
      setFeedback({ correct: false });
    }
    
    setTimeout(() => {
      setFeedback(null);
      setCurrentWord(generateWord());
    }, 500);
  };

  const handleFinish = () => {
    onEnd(score, 'colormatch');
    onBack();
  };

  if (gameState === 'ready') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-900 via-purple-900 to-indigo-900 p-4">
        <div className="max-w-md mx-auto">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-white/80 hover:text-white mb-8"
          >
            <ArrowLeft className="w-5 h-5" />
            Назад
          </button>
          
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-pink-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Eye className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-4">Цветовой тест</h1>
            <p className="text-white/70 mb-6">
              Совпадает ли цвет ТЕКСТА с названием слова? Отвечай быстро - время ограничено!
            </p>
            
            <div className="bg-white/10 rounded-xl p-6 mb-6">
              <p className="text-white/60 mb-4">Пример:</p>
              <div className="text-4xl font-bold text-blue-500 mb-4">КРАСНЫЙ</div>
              <p className="text-white/60">
                Слово "КРАСНЫЙ" написано <span className="text-blue-400">синим</span> цветом = <span className="text-red-400">НЕ совпадает</span>
              </p>
            </div>
            
            <button
              onClick={startGame}
              className="w-full py-4 bg-gradient-to-r from-pink-500 to-purple-500 rounded-xl text-white font-bold text-xl hover:scale-105 transition-transform"
            >
              Начать тест
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'finished') {
    const accuracy = correctAnswers + wrongAnswers > 0 
      ? Math.round((correctAnswers / (correctAnswers + wrongAnswers)) * 100) 
      : 0;
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-900 via-purple-900 to-indigo-900 p-4">
        <div className="max-w-md mx-auto">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 text-center">
            <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-white mb-2">
              {lives > 0 ? 'Время вышло!' : 'Жизни закончились!'}
            </h2>
            
            <div className="space-y-4 my-8">
              <div className="bg-white/10 rounded-xl p-4">
                <div className="text-gray-400 text-sm">Правильных ответов</div>
                <div className="text-3xl font-bold text-green-400">{correctAnswers}</div>
              </div>
              
              <div className="bg-white/10 rounded-xl p-4">
                <div className="text-gray-400 text-sm">Точность</div>
                <div className="text-2xl font-bold text-blue-400">{accuracy}%</div>
              </div>
              
              <div className="bg-white/10 rounded-xl p-4">
                <div className="text-gray-400 text-sm">Достигнутый уровень</div>
                <div className="text-2xl font-bold text-purple-400">{level}</div>
              </div>
              
              <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-xl p-4 border border-yellow-500/30">
                <div className="text-gray-400 text-sm">Заработано очков</div>
                <div className="text-4xl font-bold text-yellow-400">+{score}</div>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={startGame}
                className="flex-1 py-3 bg-white/10 rounded-xl text-white font-bold hover:bg-white/20 transition"
              >
                Ещё раз
              </button>
              <button
                onClick={handleFinish}
                className="flex-1 py-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl text-white font-bold hover:scale-105 transition-transform"
              >
                Забрать очки
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-900 via-purple-900 to-indigo-900 p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={onBack}
            className="text-white/80 hover:text-white"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          
          <div className="flex items-center gap-2">
            {[...Array(3)].map((_, i) => (
              <span
                key={i}
                className={`text-2xl ${i < lives ? '' : 'opacity-30'}`}
              >
                ❤️
              </span>
            ))}
          </div>
          
          <div className={`px-4 py-2 rounded-xl ${
            timeLeft <= 10 ? 'bg-red-500/50 animate-pulse' : 'bg-white/10'
          }`}>
            <span className="text-white font-bold">{timeLeft}с</span>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-white/10 rounded-xl p-3 text-center">
            <div className="text-yellow-400 font-bold text-xl">{score}</div>
            <div className="text-white/60 text-xs">Очки</div>
          </div>
          <div className="bg-white/10 rounded-xl p-3 text-center">
            <div className="text-purple-400 font-bold text-xl">Ур. {level}</div>
            <div className="text-white/60 text-xs">Сложность</div>
          </div>
        </div>

        {/* Word Card */}
        <div className={`bg-white/10 backdrop-blur-lg rounded-2xl p-8 mb-6 transition-all ${
          feedback === null ? '' :
          feedback.correct ? 'ring-4 ring-green-500/50' : 'ring-4 ring-red-500/50'
        }`}>
          {currentWord && (
            <div className="text-center">
              <p className="text-white/60 mb-4">Совпадает ли цвет текста с названием?</p>
              <div 
                className="text-5xl font-bold py-8"
                style={{ color: currentWord.displayColor }}
              >
                {currentWord.word}
              </div>
            </div>
          )}
        </div>

        {/* Answer Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => handleAnswer('match')}
            disabled={feedback !== null}
            className="py-6 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl text-white font-bold text-xl hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100"
          >
            ✓ Совпадает
          </button>
          <button
            onClick={() => handleAnswer('different')}
            disabled={feedback !== null}
            className="py-6 bg-gradient-to-r from-red-500 to-rose-600 rounded-xl text-white font-bold text-xl hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100"
          >
            ✗ Нет
          </button>
        </div>

        {/* Feedback */}
        {feedback && (
          <div className={`mt-4 text-center text-xl font-bold ${
            feedback.correct ? 'text-green-400' : 'text-red-400'
          }`}>
            {feedback.correct ? `+${feedback.points} очков!` : 'Неправильно!'}
          </div>
        )}
      </div>
    </div>
  );
};

export default ColorMatch;
