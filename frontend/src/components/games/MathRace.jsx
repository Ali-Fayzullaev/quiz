import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ArrowLeft, Trophy, Calculator, Zap, Heart, Timer } from 'lucide-react';

const MathRace = ({ onEnd, onBack }) => {
  const [gameState, setGameState] = useState('ready'); // ready, playing, finished
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [problem, setProblem] = useState(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [difficulty, setDifficulty] = useState(1);
  const [problemsSolved, setProblemsSolved] = useState(0);
  const inputRef = useRef(null);

  const generateProblem = useCallback((diff) => {
    const operations = ['+', '-', '×'];
    if (diff >= 3) operations.push('÷');
    
    const operation = operations[Math.floor(Math.random() * operations.length)];
    let a, b, answer;
    
    const maxNum = Math.min(10 + diff * 5, 50);
    
    switch (operation) {
      case '+':
        a = Math.floor(Math.random() * maxNum) + 1;
        b = Math.floor(Math.random() * maxNum) + 1;
        answer = a + b;
        break;
      case '-':
        a = Math.floor(Math.random() * maxNum) + 10;
        b = Math.floor(Math.random() * Math.min(a, maxNum));
        answer = a - b;
        break;
      case '×':
        a = Math.floor(Math.random() * Math.min(maxNum / 2, 12)) + 2;
        b = Math.floor(Math.random() * Math.min(maxNum / 2, 12)) + 2;
        answer = a * b;
        break;
      case '÷':
        b = Math.floor(Math.random() * 10) + 2;
        answer = Math.floor(Math.random() * 10) + 1;
        a = b * answer;
        break;
      default:
        a = 1;
        b = 1;
        answer = 2;
    }
    
    return { a, b, operation, answer };
  }, []);

  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setStreak(0);
    setBestStreak(0);
    setTimeLeft(60);
    setDifficulty(1);
    setProblemsSolved(0);
    setProblem(generateProblem(1));
    setUserAnswer('');
  };

  useEffect(() => {
    if (gameState === 'playing' && inputRef.current) {
      inputRef.current.focus();
    }
  }, [gameState, problem]);

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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!userAnswer.trim() || gameState !== 'playing') return;
    
    const numAnswer = parseInt(userAnswer, 10);
    
    if (numAnswer === problem.answer) {
      // Правильно!
      const pointsEarned = 10 + streak * 2 + difficulty * 5;
      setScore(prev => prev + pointsEarned);
      setStreak(prev => prev + 1);
      setBestStreak(prev => Math.max(prev, streak + 1));
      setProblemsSolved(prev => prev + 1);
      setFeedback({ correct: true, points: pointsEarned });
      
      // Повышаем сложность каждые 5 задач
      if ((problemsSolved + 1) % 5 === 0) {
        setDifficulty(prev => Math.min(prev + 1, 5));
      }
      
      // Бонусное время за серию
      if ((streak + 1) % 5 === 0) {
        setTimeLeft(prev => Math.min(prev + 5, 90));
      }
    } else {
      // Неправильно
      setStreak(0);
      setFeedback({ correct: false, correctAnswer: problem.answer });
    }
    
    setTimeout(() => {
      setFeedback(null);
      setProblem(generateProblem(difficulty));
      setUserAnswer('');
    }, 500);
  };

  const handleFinish = () => {
    onEnd(score, 'mathrace');
    onBack();
  };

  if (gameState === 'ready') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-900 via-red-900 to-pink-900 p-4">
        <div className="max-w-md mx-auto">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-white/80 hover:text-white mb-8"
          >
            <ArrowLeft className="w-5 h-5" />
            Назад
          </button>
          
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 text-center">
            <Calculator className="w-20 h-20 text-orange-400 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-white mb-4">Математическая гонка</h1>
            <p className="text-white/70 mb-6">
              Реши как можно больше примеров за 60 секунд! Сложность растёт с каждым уровнем.
            </p>
            
            <div className="grid grid-cols-2 gap-4 mb-8 text-left">
              <div className="bg-white/10 rounded-xl p-4">
                <div className="flex items-center gap-2 text-green-400 mb-2">
                  <Zap className="w-5 h-5" />
                  <span className="font-bold">Серия</span>
                </div>
                <p className="text-white/60 text-sm">Бонус за каждый правильный ответ подряд</p>
              </div>
              <div className="bg-white/10 rounded-xl p-4">
                <div className="flex items-center gap-2 text-blue-400 mb-2">
                  <Timer className="w-5 h-5" />
                  <span className="font-bold">Время</span>
                </div>
                <p className="text-white/60 text-sm">+5 секунд за каждые 5 правильных ответов</p>
              </div>
            </div>
            
            <button
              onClick={startGame}
              className="w-full py-4 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl text-white font-bold text-xl hover:scale-105 transition-transform"
            >
              Начать гонку!
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'finished') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-900 via-red-900 to-pink-900 p-4">
        <div className="max-w-md mx-auto">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 text-center">
            <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-white mb-2">Время вышло!</h2>
            
            <div className="space-y-4 my-8">
              <div className="bg-white/10 rounded-xl p-4">
                <div className="text-gray-400 text-sm">Решено примеров</div>
                <div className="text-3xl font-bold text-green-400">{problemsSolved}</div>
              </div>
              
              <div className="bg-white/10 rounded-xl p-4">
                <div className="text-gray-400 text-sm">Лучшая серия</div>
                <div className="text-2xl font-bold text-orange-400">{bestStreak} 🔥</div>
              </div>
              
              <div className="bg-white/10 rounded-xl p-4">
                <div className="text-gray-400 text-sm">Достигнутая сложность</div>
                <div className="text-2xl font-bold text-purple-400">Уровень {difficulty}</div>
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
    <div className="min-h-screen bg-gradient-to-br from-orange-900 via-red-900 to-pink-900 p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={onBack}
            className="text-white/80 hover:text-white"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          
          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl ${
            timeLeft <= 10 ? 'bg-red-500/50 animate-pulse' : 'bg-white/10'
          }`}>
            <Timer className="w-5 h-5 text-white" />
            <span className="text-white font-bold text-xl">{timeLeft}с</span>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-white/10 rounded-xl p-3 text-center">
            <div className="text-yellow-400 font-bold text-xl">{score}</div>
            <div className="text-white/60 text-xs">Очки</div>
          </div>
          <div className="bg-white/10 rounded-xl p-3 text-center">
            <div className="text-orange-400 font-bold text-xl">{streak}🔥</div>
            <div className="text-white/60 text-xs">Серия</div>
          </div>
          <div className="bg-white/10 rounded-xl p-3 text-center">
            <div className="text-purple-400 font-bold text-xl">Ур.{difficulty}</div>
            <div className="text-white/60 text-xs">Сложность</div>
          </div>
        </div>

        {/* Problem Card */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 mb-6">
          {problem && (
            <div className="text-center">
              <div className="text-6xl font-bold text-white mb-8">
                {problem.a} {problem.operation} {problem.b}
              </div>
              
              <form onSubmit={handleSubmit}>
                <input
                  ref={inputRef}
                  type="number"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  className={`w-full text-center text-4xl font-bold py-4 rounded-xl bg-white/20 text-white placeholder-white/40 outline-none focus:ring-4 ${
                    feedback === null ? 'focus:ring-orange-500/50' :
                    feedback.correct ? 'ring-4 ring-green-500/50 bg-green-500/20' : 'ring-4 ring-red-500/50 bg-red-500/20'
                  }`}
                  placeholder="?"
                  autoComplete="off"
                />
                
                <button
                  type="submit"
                  className="w-full mt-4 py-4 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl text-white font-bold text-xl hover:scale-105 transition-transform"
                >
                  Ответить
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Feedback */}
        {feedback && (
          <div className={`text-center text-xl font-bold ${
            feedback.correct ? 'text-green-400' : 'text-red-400'
          }`}>
            {feedback.correct ? `+${feedback.points} очков!` : `Правильный ответ: ${feedback.correctAnswer}`}
          </div>
        )}
      </div>
    </div>
  );
};

export default MathRace;
