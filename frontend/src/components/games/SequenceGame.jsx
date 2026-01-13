import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Trophy, Brain, Lightbulb } from 'lucide-react';

const SequenceGame = ({ onEnd, onBack }) => {
  const [gameState, setGameState] = useState('ready'); // ready, showing, input, result, finished
  const [sequence, setSequence] = useState([]);
  const [playerInput, setPlayerInput] = useState([]);
  const [level, setLevel] = useState(1);
  const [showingIndex, setShowingIndex] = useState(-1);
  const [score, setScore] = useState(0);
  const [activeButton, setActiveButton] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const [highestLevel, setHighestLevel] = useState(0);

  const colors = [
    { id: 0, bg: 'bg-red-500', active: 'bg-red-300', name: 'Красный' },
    { id: 1, bg: 'bg-blue-500', active: 'bg-blue-300', name: 'Синий' },
    { id: 2, bg: 'bg-green-500', active: 'bg-green-300', name: 'Зелёный' },
    { id: 3, bg: 'bg-yellow-500', active: 'bg-yellow-300', name: 'Жёлтый' },
  ];

  const generateSequence = useCallback((length) => {
    const newSequence = [];
    for (let i = 0; i < length; i++) {
      newSequence.push(Math.floor(Math.random() * 4));
    }
    return newSequence;
  }, []);

  const playSequence = useCallback(async (seq) => {
    setGameState('showing');
    setShowingIndex(-1);
    
    await new Promise(r => setTimeout(r, 500));
    
    for (let i = 0; i < seq.length; i++) {
      setShowingIndex(i);
      setActiveButton(seq[i]);
      await new Promise(r => setTimeout(r, 600));
      setActiveButton(null);
      await new Promise(r => setTimeout(r, 300));
    }
    
    setShowingIndex(-1);
    setGameState('input');
    setPlayerInput([]);
  }, []);

  const startGame = () => {
    const newSequence = generateSequence(3); // Начинаем с 3 элементов
    setSequence(newSequence);
    setLevel(1);
    setScore(0);
    setHighestLevel(0);
    playSequence(newSequence);
  };

  const handleButtonClick = (colorId) => {
    if (gameState !== 'input') return;
    
    setActiveButton(colorId);
    setTimeout(() => setActiveButton(null), 200);
    
    const newInput = [...playerInput, colorId];
    setPlayerInput(newInput);
    
    // Проверяем каждое нажатие
    const inputIndex = newInput.length - 1;
    if (newInput[inputIndex] !== sequence[inputIndex]) {
      // Ошибка!
      setIsCorrect(false);
      setGameState('result');
      setHighestLevel(Math.max(highestLevel, level));
      
      setTimeout(() => {
        setGameState('finished');
      }, 1500);
      return;
    }
    
    // Если всю последовательность ввели правильно
    if (newInput.length === sequence.length) {
      setIsCorrect(true);
      setGameState('result');
      // Сбалансированные очки: 15 базовых + 5 за уровень + 3 за элемент последовательности
      const levelScore = 15 + level * 5 + sequence.length * 3;
      setScore(prev => prev + levelScore);
      setHighestLevel(Math.max(highestLevel, level));
      
      setTimeout(() => {
        // Следующий уровень - добавляем один элемент
        const newSequence = [...sequence, Math.floor(Math.random() * 4)];
        setSequence(newSequence);
        setLevel(prev => prev + 1);
        playSequence(newSequence);
      }, 1500);
    }
  };

  const calculateFinalScore = () => {
    const baseScore = score;
    // Уменьшенный бонус за уровень
    const levelBonus = highestLevel * 10;
    return baseScore + levelBonus;
  };

  const handleFinish = () => {
    onEnd(calculateFinalScore(), 'sequence');
    onBack();
  };

  if (gameState === 'ready') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 p-4">
        <div className="max-w-md mx-auto">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-white/80 hover:text-white mb-8"
          >
            <ArrowLeft className="w-5 h-5" />
            Назад
          </button>
          
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 text-center">
            <Brain className="w-20 h-20 text-purple-400 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-white mb-4">Запомни последовательность</h1>
            <p className="text-white/70 mb-8">
              Запомни порядок цветов и повтори его! С каждым уровнем последовательность становится длиннее.
            </p>
            
            <div className="grid grid-cols-2 gap-4 mb-8">
              {colors.map((color) => (
                <div
                  key={color.id}
                  className={`${color.bg} rounded-xl p-6 opacity-60`}
                />
              ))}
            </div>
            
            <button
              onClick={startGame}
              className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-white font-bold text-xl hover:scale-105 transition-transform"
            >
              Начать игру
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'finished') {
    const finalScore = calculateFinalScore();
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 p-4">
        <div className="max-w-md mx-auto">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 text-center">
            <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-white mb-2">Игра окончена!</h2>
            <p className="text-white/60 mb-6">Ты допустил ошибку</p>
            
            <div className="space-y-4 mb-8">
              <div className="bg-white/10 rounded-xl p-4">
                <div className="text-gray-400 text-sm">Достигнутый уровень</div>
                <div className="text-3xl font-bold text-purple-400">{highestLevel}</div>
              </div>
              
              <div className="bg-white/10 rounded-xl p-4">
                <div className="text-gray-400 text-sm">Максимальная длина</div>
                <div className="text-2xl font-bold text-blue-400">{sequence.length - 1} элементов</div>
              </div>
              
              <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-xl p-4 border border-yellow-500/30">
                <div className="text-gray-400 text-sm">Заработано очков</div>
                <div className="text-4xl font-bold text-yellow-400">+{finalScore}</div>
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
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-white/80 hover:text-white"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-4">
            <div className="bg-white/10 px-4 py-2 rounded-xl">
              <span className="text-white/60 text-sm">Уровень</span>
              <span className="text-white font-bold ml-2">{level}</span>
            </div>
            <div className="bg-white/10 px-4 py-2 rounded-xl">
              <span className="text-white/60 text-sm">Очки</span>
              <span className="text-yellow-400 font-bold ml-2">{score}</span>
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="text-center mb-6">
          {gameState === 'showing' && (
            <div className="flex items-center justify-center gap-2 text-white">
              <Lightbulb className="w-6 h-6 text-yellow-400 animate-pulse" />
              <span className="text-xl">Запоминай! ({showingIndex + 1}/{sequence.length})</span>
            </div>
          )}
          {gameState === 'input' && (
            <div className="text-white text-xl">
              Твой ход: {playerInput.length}/{sequence.length}
            </div>
          )}
          {gameState === 'result' && (
            <div className={`text-2xl font-bold ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
              {isCorrect ? '✓ Правильно!' : '✗ Ошибка!'}
            </div>
          )}
        </div>

        {/* Game Board */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6">
          <div className="grid grid-cols-2 gap-4">
            {colors.map((color) => (
              <button
                key={color.id}
                onClick={() => handleButtonClick(color.id)}
                disabled={gameState !== 'input'}
                className={`
                  ${activeButton === color.id ? color.active : color.bg}
                  ${activeButton === color.id ? 'scale-95' : 'scale-100'}
                  rounded-xl p-8 transition-all duration-150
                  ${gameState === 'input' ? 'cursor-pointer hover:opacity-90 active:scale-95' : 'cursor-not-allowed'}
                  ${gameState !== 'input' && activeButton !== color.id ? 'opacity-60' : 'opacity-100'}
                `}
              />
            ))}
          </div>
        </div>

        {/* Sequence Progress */}
        <div className="mt-6 flex justify-center gap-2">
          {sequence.map((_, index) => (
            <div
              key={index}
              className={`w-3 h-3 rounded-full transition-colors ${
                index < playerInput.length
                  ? 'bg-green-400'
                  : showingIndex >= index
                  ? 'bg-yellow-400'
                  : 'bg-white/20'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default SequenceGame;
