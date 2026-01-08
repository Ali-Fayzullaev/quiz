import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ArrowLeft, Trophy, Target, Crosshair, Zap } from 'lucide-react';

const AimTrainer = ({ onEnd, onBack }) => {
  const [gameState, setGameState] = useState('ready'); // ready, playing, finished
  const [score, setScore] = useState(0);
  const [targets, setTargets] = useState([]);
  const [timeLeft, setTimeLeft] = useState(30);
  const [hits, setHits] = useState(0);
  const [misses, setMisses] = useState(0);
  const [combo, setCombo] = useState(0);
  const [bestCombo, setBestCombo] = useState(0);
  const [difficulty, setDifficulty] = useState('normal');
  const gameAreaRef = useRef(null);
  const targetIdRef = useRef(0);

  const difficulties = {
    easy: { size: 80, spawnRate: 1200, lifetime: 2500, name: 'Лёгкий' },
    normal: { size: 60, spawnRate: 900, lifetime: 2000, name: 'Нормальный' },
    hard: { size: 40, spawnRate: 700, lifetime: 1500, name: 'Сложный' },
  };

  const spawnTarget = useCallback(() => {
    if (!gameAreaRef.current) return;
    
    const config = difficulties[difficulty];
    const area = gameAreaRef.current.getBoundingClientRect();
    const padding = config.size;
    
    const x = Math.random() * (area.width - padding * 2) + padding / 2;
    const y = Math.random() * (area.height - padding * 2) + padding / 2;
    
    const newTarget = {
      id: targetIdRef.current++,
      x,
      y,
      size: config.size,
      createdAt: Date.now(),
      lifetime: config.lifetime,
    };
    
    setTargets(prev => [...prev, newTarget]);
    
    // Удаляем цель по истечении времени жизни
    setTimeout(() => {
      setTargets(prev => {
        const target = prev.find(t => t.id === newTarget.id);
        if (target) {
          setMisses(m => m + 1);
          setCombo(0);
        }
        return prev.filter(t => t.id !== newTarget.id);
      });
    }, config.lifetime);
  }, [difficulty]);

  const startGame = (diff) => {
    setDifficulty(diff);
    setGameState('playing');
    setScore(0);
    setTargets([]);
    setTimeLeft(30);
    setHits(0);
    setMisses(0);
    setCombo(0);
    setBestCombo(0);
    targetIdRef.current = 0;
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
    if (gameState !== 'playing') return;
    
    const config = difficulties[difficulty];
    const spawner = setInterval(spawnTarget, config.spawnRate);
    
    // Spawn first target immediately
    spawnTarget();
    
    return () => clearInterval(spawner);
  }, [gameState, difficulty, spawnTarget]);

  const handleTargetClick = (targetId, e) => {
    e.stopPropagation();
    
    setTargets(prev => prev.filter(t => t.id !== targetId));
    
    const newCombo = combo + 1;
    setCombo(newCombo);
    setBestCombo(prev => Math.max(prev, newCombo));
    setHits(prev => prev + 1);
    
    // Очки: базовые + бонус за комбо + бонус за сложность
    const comboBonus = Math.min(newCombo * 2, 20);
    const difficultyBonus = difficulty === 'hard' ? 15 : difficulty === 'normal' ? 10 : 5;
    const pointsEarned = 10 + comboBonus + difficultyBonus;
    
    setScore(prev => prev + pointsEarned);
  };

  const handleMiss = () => {
    if (gameState !== 'playing') return;
    setMisses(prev => prev + 1);
    setCombo(0);
  };

  const handleFinish = () => {
    onEnd(score, 'aimtrainer');
    onBack();
  };

  if (gameState === 'ready') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-zinc-900 to-neutral-900 p-4">
        <div className="max-w-md mx-auto">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-white/80 hover:text-white mb-8"
          >
            <ArrowLeft className="w-5 h-5" />
            Назад
          </button>
          
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 text-center">
            <Crosshair className="w-20 h-20 text-red-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-white mb-4">Тренировка прицеливания</h1>
            <p className="text-white/70 mb-8">
              Нажимай на появляющиеся цели как можно быстрее! Чем выше комбо - тем больше очков.
            </p>
            
            <div className="space-y-3">
              <p className="text-white/60 mb-2">Выбери сложность:</p>
              {Object.entries(difficulties).map(([key, config]) => (
                <button
                  key={key}
                  onClick={() => startGame(key)}
                  className={`w-full py-4 rounded-xl text-white font-bold text-lg transition-all hover:scale-105 ${
                    key === 'easy' ? 'bg-gradient-to-r from-green-500 to-emerald-600' :
                    key === 'normal' ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                    'bg-gradient-to-r from-red-500 to-rose-600'
                  }`}
                >
                  {config.name}
                  <span className="block text-sm font-normal opacity-80">
                    Размер цели: {config.size}px
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'finished') {
    const accuracy = hits + misses > 0 
      ? Math.round((hits / (hits + misses)) * 100) 
      : 0;
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-zinc-900 to-neutral-900 p-4">
        <div className="max-w-md mx-auto">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 text-center">
            <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-white mb-2">Время вышло!</h2>
            
            <div className="space-y-4 my-8">
              <div className="bg-white/10 rounded-xl p-4">
                <div className="text-gray-400 text-sm">Попаданий</div>
                <div className="text-3xl font-bold text-green-400">{hits}</div>
              </div>
              
              <div className="bg-white/10 rounded-xl p-4">
                <div className="text-gray-400 text-sm">Точность</div>
                <div className="text-2xl font-bold text-blue-400">{accuracy}%</div>
              </div>
              
              <div className="bg-white/10 rounded-xl p-4">
                <div className="text-gray-400 text-sm">Лучшее комбо</div>
                <div className="text-2xl font-bold text-orange-400">{bestCombo}x</div>
              </div>
              
              <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-xl p-4 border border-yellow-500/30">
                <div className="text-gray-400 text-sm">Заработано очков</div>
                <div className="text-4xl font-bold text-yellow-400">+{score}</div>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setGameState('ready')}
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-zinc-900 to-neutral-900 p-4">
      {/* Header */}
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={onBack}
            className="text-white/80 hover:text-white"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          
          <div className="flex items-center gap-4">
            <div className="bg-white/10 px-4 py-2 rounded-xl">
              <span className="text-yellow-400 font-bold">{score}</span>
              <span className="text-white/60 text-sm ml-1">очков</span>
            </div>
            
            {combo > 0 && (
              <div className="bg-orange-500/20 px-4 py-2 rounded-xl animate-pulse">
                <span className="text-orange-400 font-bold">{combo}x</span>
                <span className="text-white/60 text-sm ml-1">комбо</span>
              </div>
            )}
            
            <div className={`px-4 py-2 rounded-xl ${
              timeLeft <= 10 ? 'bg-red-500/50 animate-pulse' : 'bg-white/10'
            }`}>
              <span className="text-white font-bold">{timeLeft}с</span>
            </div>
          </div>
        </div>

        {/* Game Area */}
        <div
          ref={gameAreaRef}
          onClick={handleMiss}
          className="relative bg-black/30 rounded-2xl overflow-hidden cursor-crosshair"
          style={{ height: 'calc(100vh - 150px)', minHeight: '400px' }}
        >
          {/* Crosshair cursor style */}
          <style>{`
            .cursor-crosshair {
              cursor: crosshair;
            }
          `}</style>
          
          {/* Targets */}
          {targets.map((target) => {
            const elapsed = Date.now() - target.createdAt;
            const remaining = target.lifetime - elapsed;
            const progress = remaining / target.lifetime;
            
            return (
              <button
                key={target.id}
                onClick={(e) => handleTargetClick(target.id, e)}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-transform hover:scale-110 active:scale-90"
                style={{
                  left: target.x,
                  top: target.y,
                  width: target.size,
                  height: target.size,
                }}
              >
                <div
                  className="w-full h-full rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center shadow-lg shadow-red-500/30"
                  style={{
                    opacity: Math.max(progress, 0.3),
                  }}
                >
                  <div className="w-3/4 h-3/4 rounded-full bg-white/20 flex items-center justify-center">
                    <div className="w-1/2 h-1/2 rounded-full bg-white/30 flex items-center justify-center">
                      <div className="w-1/2 h-1/2 rounded-full bg-white/40" />
                    </div>
                  </div>
                </div>
                {/* Progress ring */}
                <svg
                  className="absolute inset-0 w-full h-full -rotate-90"
                  viewBox="0 0 100 100"
                >
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="rgba(255,255,255,0.2)"
                    strokeWidth="4"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="rgba(239,68,68,0.8)"
                    strokeWidth="4"
                    strokeDasharray={`${progress * 283} 283`}
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            );
          })}

          {/* Stats overlay */}
          <div className="absolute bottom-4 left-4 right-4 flex justify-between text-white/60 text-sm">
            <span>Попаданий: {hits}</span>
            <span>Промахов: {misses}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AimTrainer;
