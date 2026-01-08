import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Zap, Target, Clock, Trophy, ArrowLeft } from 'lucide-react';

const ReactionGame = ({ onEnd, onBack }) => {
  const [gameState, setGameState] = useState('ready'); // ready, waiting, click, result, finished
  const [results, setResults] = useState([]);
  const [currentRound, setCurrentRound] = useState(0);
  const [backgroundColor, setBackgroundColor] = useState('bg-blue-500');
  const [startTime, setStartTime] = useState(null);
  const [showEarly, setShowEarly] = useState(false);
  const timeoutRef = useRef(null);
  const totalRounds = 5;

  const startRound = useCallback(() => {
    setGameState('waiting');
    setBackgroundColor('bg-red-500');
    setShowEarly(false);
    
    // Случайная задержка от 1 до 4 секунд
    const delay = Math.random() * 3000 + 1000;
    
    timeoutRef.current = setTimeout(() => {
      setBackgroundColor('bg-green-500');
      setGameState('click');
      setStartTime(Date.now());
    }, delay);
  }, []);

  const handleClick = () => {
    if (gameState === 'ready') {
      startRound();
      return;
    }
    
    if (gameState === 'waiting') {
      // Кликнули слишком рано!
      clearTimeout(timeoutRef.current);
      setShowEarly(true);
      setBackgroundColor('bg-yellow-500');
      
      setTimeout(() => {
        if (currentRound + 1 >= totalRounds) {
          setGameState('finished');
        } else {
          setCurrentRound(prev => prev + 1);
          startRound();
        }
      }, 1500);
      return;
    }
    
    if (gameState === 'click') {
      const reactionTime = Date.now() - startTime;
      setResults(prev => [...prev, reactionTime]);
      setGameState('result');
      setBackgroundColor('bg-blue-500');
      
      setTimeout(() => {
        if (currentRound + 1 >= totalRounds) {
          setGameState('finished');
        } else {
          setCurrentRound(prev => prev + 1);
          startRound();
        }
      }, 1500);
    }
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const calculateScore = () => {
    if (results.length === 0) return 0;
    const avgTime = results.reduce((a, b) => a + b, 0) / results.length;
    
    // Чем быстрее реакция, тем больше очков
    // 200ms и меньше = максимум очков
    // 500ms+ = минимум очков
    if (avgTime <= 200) return 500;
    if (avgTime <= 250) return 400;
    if (avgTime <= 300) return 300;
    if (avgTime <= 350) return 200;
    if (avgTime <= 400) return 150;
    if (avgTime <= 500) return 100;
    return 50;
  };

  const getReactionRating = (time) => {
    if (time <= 200) return { text: 'Молниеносно! ⚡', color: 'text-yellow-400' };
    if (time <= 250) return { text: 'Отлично! 🎯', color: 'text-green-400' };
    if (time <= 300) return { text: 'Хорошо! 👍', color: 'text-blue-400' };
    if (time <= 400) return { text: 'Нормально 👌', color: 'text-gray-400' };
    return { text: 'Можно лучше 🐢', color: 'text-red-400' };
  };

  const handleFinish = () => {
    const score = calculateScore();
    onEnd(score, 'reaction');
    onBack();
  };

  if (gameState === 'finished') {
    const avgTime = results.length > 0 
      ? Math.round(results.reduce((a, b) => a + b, 0) / results.length)
      : 0;
    const bestTime = results.length > 0 ? Math.min(...results) : 0;
    const score = calculateScore();
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 p-4">
        <div className="max-w-md mx-auto">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 text-center">
            <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-white mb-6">Результаты</h2>
            
            <div className="space-y-4 mb-8">
              <div className="bg-white/10 rounded-xl p-4">
                <div className="text-gray-400 text-sm">Среднее время реакции</div>
                <div className="text-3xl font-bold text-green-400">{avgTime} мс</div>
              </div>
              
              <div className="bg-white/10 rounded-xl p-4">
                <div className="text-gray-400 text-sm">Лучшее время</div>
                <div className="text-2xl font-bold text-yellow-400">{bestTime} мс</div>
              </div>
              
              <div className="bg-white/10 rounded-xl p-4">
                <div className="text-gray-400 text-sm">Успешных попыток</div>
                <div className="text-2xl font-bold text-blue-400">{results.length}/{totalRounds}</div>
              </div>
              
              <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-xl p-4 border border-yellow-500/30">
                <div className="text-gray-400 text-sm">Заработано очков</div>
                <div className="text-4xl font-bold text-yellow-400">+{score}</div>
              </div>
            </div>
            
            <div className="flex gap-3">
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
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900">
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-white/80 hover:text-white"
        >
          <ArrowLeft className="w-5 h-5" />
          Назад
        </button>
        <div className="flex items-center gap-2 text-white">
          <Target className="w-5 h-5" />
          <span>Раунд {currentRound + 1}/{totalRounds}</span>
        </div>
      </div>

      {/* Game Area */}
      <div 
        onClick={handleClick}
        className={`mx-4 rounded-3xl ${backgroundColor} transition-colors duration-100 cursor-pointer select-none`}
        style={{ height: 'calc(100vh - 120px)' }}
      >
        <div className="h-full flex flex-col items-center justify-center p-8">
          {gameState === 'ready' && (
            <>
              <Zap className="w-24 h-24 text-white mb-6" />
              <h2 className="text-3xl font-bold text-white mb-4">Проверь реакцию!</h2>
              <p className="text-white/80 text-center text-lg mb-6">
                Нажми когда экран станет <span className="text-green-300 font-bold">ЗЕЛЁНЫМ</span>
              </p>
              <div className="px-8 py-4 bg-white/20 rounded-xl text-white text-xl font-bold">
                Нажми чтобы начать
              </div>
            </>
          )}
          
          {gameState === 'waiting' && !showEarly && (
            <>
              <Clock className="w-24 h-24 text-white mb-6 animate-pulse" />
              <h2 className="text-3xl font-bold text-white">Жди...</h2>
              <p className="text-white/80 text-xl mt-4">Не нажимай пока!</p>
            </>
          )}
          
          {showEarly && (
            <>
              <div className="text-6xl mb-4">😅</div>
              <h2 className="text-3xl font-bold text-white">Слишком рано!</h2>
              <p className="text-white/80 text-xl mt-2">Жди зелёный цвет</p>
            </>
          )}
          
          {gameState === 'click' && (
            <>
              <Target className="w-32 h-32 text-white mb-6 animate-bounce" />
              <h2 className="text-5xl font-bold text-white">ЖМИИ!</h2>
            </>
          )}
          
          {gameState === 'result' && results.length > 0 && (
            <>
              <div className="text-6xl mb-4">
                {results[results.length - 1] <= 250 ? '⚡' : results[results.length - 1] <= 350 ? '🎯' : '👍'}
              </div>
              <h2 className={`text-4xl font-bold ${getReactionRating(results[results.length - 1]).color}`}>
                {results[results.length - 1]} мс
              </h2>
              <p className={`text-xl mt-2 ${getReactionRating(results[results.length - 1]).color}`}>
                {getReactionRating(results[results.length - 1]).text}
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReactionGame;
