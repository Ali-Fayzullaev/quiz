// frontend/src/components/vocabulary/LearnVocabulary.jsx
import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Volume2,
  Check,
  X,
  RotateCcw,
  Zap,
  Target,
  Trophy,
  Flame,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Shuffle,
  BookOpen,
  Lightbulb,
  Keyboard
} from 'lucide-react';
import { vocabularyAPI } from '../../services/api';

const COLORS = {
  purple: 'from-purple-500 to-pink-500',
  blue: 'from-blue-500 to-cyan-500',
  green: 'from-green-500 to-emerald-500',
  red: 'from-red-500 to-orange-500',
  orange: 'from-orange-500 to-yellow-500',
  pink: 'from-pink-500 to-rose-500',
  teal: 'from-teal-500 to-cyan-500',
  indigo: 'from-indigo-500 to-purple-500'
};

const LearnVocabulary = ({ darkMode }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [vocabulary, setVocabulary] = useState(null);
  const [words, setWords] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState('flashcard'); // flashcard, quiz, typing
  const [showTranslation, setShowTranslation] = useState(false);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState(null); // { correct: boolean, message: string }
  const [stats, setStats] = useState({ correct: 0, incorrect: 0, streak: 0 });
  const [isFlipped, setIsFlipped] = useState(false);
  const [quizOptions, setQuizOptions] = useState([]);
  const [sessionComplete, setSessionComplete] = useState(false);

  useEffect(() => {
    fetchData();
  }, [id]);

  useEffect(() => {
    // Keyboard shortcuts
    const handleKeyPress = (e) => {
      if (mode === 'flashcard') {
        if (e.code === 'Space') {
          e.preventDefault();
          setIsFlipped(!isFlipped);
        } else if (e.code === 'ArrowRight' || e.code === 'KeyD') {
          handleAnswer(true);
        } else if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
          handleAnswer(false);
        }
      } else if (mode === 'typing' && e.code === 'Enter') {
        checkTypingAnswer();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [mode, isFlipped, currentIndex, userAnswer]);

  const fetchData = async () => {
    try {
      const [vocabResponse, wordsResponse] = await Promise.all([
        vocabularyAPI.getVocabulary(id),
        vocabularyAPI.getWordsToLearn(id, { limit: 20 })
      ]);
      
      setVocabulary(vocabResponse.data.data);
      const fetchedWords = wordsResponse.data.data || [];
      setWords(shuffleArray(fetchedWords));
    } catch (error) {
      console.error('Error fetching data:', error);
      navigate('/vocabulary');
    } finally {
      setLoading(false);
    }
  };

  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const generateQuizOptions = useCallback((correctWord) => {
    if (!vocabulary?.words) return [];
    
    const otherWords = vocabulary.words
      .filter(w => w._id !== correctWord._id)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    
    const options = [...otherWords.map(w => w.translation), correctWord.translation];
    return shuffleArray(options);
  }, [vocabulary]);

  useEffect(() => {
    if (mode === 'quiz' && words[currentIndex]) {
      setQuizOptions(generateQuizOptions(words[currentIndex]));
    }
  }, [currentIndex, mode, words, generateQuizOptions]);

  const handleAnswer = async (isCorrect) => {
    const currentWord = words[currentIndex];
    
    try {
      await vocabularyAPI.updateWordProgress(id, {
        wordId: currentWord._id,
        isCorrect
      });
    } catch (error) {
      console.error('Error updating progress:', error);
    }

    setStats(prev => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      incorrect: prev.incorrect + (isCorrect ? 0 : 1),
      streak: isCorrect ? prev.streak + 1 : 0
    }));

    setFeedback({
      correct: isCorrect,
      message: isCorrect ? 'Отлично! 🎉' : 'Повторим ещё раз 💪'
    });

    setTimeout(() => {
      setFeedback(null);
      nextWord();
    }, 1000);
  };

  const checkTypingAnswer = () => {
    const currentWord = words[currentIndex];
    const isCorrect = userAnswer.toLowerCase().trim() === currentWord.translation.toLowerCase().trim();
    
    setFeedback({
      correct: isCorrect,
      message: isCorrect ? 'Правильно! 🎉' : `Правильный ответ: ${currentWord.translation}`
    });

    handleAnswer(isCorrect);
    setUserAnswer('');
  };

  const handleQuizAnswer = (answer) => {
    const currentWord = words[currentIndex];
    const isCorrect = answer === currentWord.translation;
    
    setFeedback({
      correct: isCorrect,
      message: isCorrect ? 'Верно! 🎉' : `Правильный ответ: ${currentWord.translation}`
    });

    handleAnswer(isCorrect);
  };

  const nextWord = () => {
    setIsFlipped(false);
    setShowTranslation(false);
    
    if (currentIndex < words.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setSessionComplete(true);
    }
  };

  const prevWord = () => {
    if (currentIndex > 0) {
      setIsFlipped(false);
      setShowTranslation(false);
      setCurrentIndex(currentIndex - 1);
    }
  };

  const restartSession = () => {
    setWords(shuffleArray(words));
    setCurrentIndex(0);
    setStats({ correct: 0, incorrect: 0, streak: 0 });
    setSessionComplete(false);
    setFeedback(null);
    setIsFlipped(false);
  };

  const speakWord = (text, lang = 'en') => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang === 'en' ? 'en-US' : lang === 'ru' ? 'ru-RU' : lang;
    speechSynthesis.speak(utterance);
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-[#0a0a0f]' : 'bg-gray-50'}`}>
        <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!vocabulary || words.length === 0) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-[#0a0a0f]' : 'bg-gray-50'}`}>
        <div className="text-center">
          <BookOpen className={`w-16 h-16 mx-auto mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
          <h2 className={`text-xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Нет слов для изучения
          </h2>
          <p className={`mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Добавьте слова в словарь, чтобы начать
          </p>
          <button
            onClick={() => navigate(`/vocabulary/${id}`)}
            className="px-6 py-2 bg-purple-500 text-white rounded-xl"
          >
            Вернуться к словарю
          </button>
        </div>
      </div>
    );
  }

  const colorClass = COLORS[vocabulary.color] || COLORS.purple;
  const currentWord = words[currentIndex];
  const progress = ((currentIndex + 1) / words.length) * 100;

  // Session Complete Screen
  if (sessionComplete) {
    const accuracy = stats.correct + stats.incorrect > 0
      ? Math.round((stats.correct / (stats.correct + stats.incorrect)) * 100)
      : 0;

    return (
      <div className={`min-h-screen flex items-center justify-center p-6 ${darkMode ? 'bg-[#0a0a0f]' : 'bg-gray-50'}`}>
        <div className={`max-w-md w-full rounded-3xl p-8 text-center ${darkMode ? 'bg-white/5' : 'bg-white shadow-xl'}`}>
          <div className={`w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br ${colorClass} flex items-center justify-center`}>
            <Trophy className="w-12 h-12 text-white" />
          </div>
          
          <h2 className={`text-2xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Сессия завершена! 🎉
          </h2>
          <p className={`mb-8 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Отличная работа! Продолжайте в том же духе.
          </p>

          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className={`p-4 rounded-xl ${darkMode ? 'bg-white/5' : 'bg-gray-100'}`}>
              <Check className="w-6 h-6 mx-auto mb-2 text-green-500" />
              <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{stats.correct}</p>
              <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>Правильно</p>
            </div>
            <div className={`p-4 rounded-xl ${darkMode ? 'bg-white/5' : 'bg-gray-100'}`}>
              <X className="w-6 h-6 mx-auto mb-2 text-red-500" />
              <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{stats.incorrect}</p>
              <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>Ошибки</p>
            </div>
            <div className={`p-4 rounded-xl ${darkMode ? 'bg-white/5' : 'bg-gray-100'}`}>
              <Target className="w-6 h-6 mx-auto mb-2 text-purple-500" />
              <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{accuracy}%</p>
              <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>Точность</p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={restartSession}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium bg-gradient-to-r ${colorClass} text-white`}
            >
              <RotateCcw className="w-5 h-5" />
              Ещё раз
            </button>
            <button
              onClick={() => navigate(`/vocabulary/${id}`)}
              className={`flex-1 py-3 rounded-xl font-medium ${darkMode ? 'bg-white/10 text-white' : 'bg-gray-100 text-gray-700'}`}
            >
              Завершить
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-[#0a0a0f]' : 'bg-gray-50'}`}>
      {/* Header */}
      <div className={`sticky top-0 z-10 backdrop-blur-xl ${darkMode ? 'bg-[#0a0a0f]/80' : 'bg-white/80'} border-b ${darkMode ? 'border-white/5' : 'border-gray-200'}`}>
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigate(`/vocabulary/${id}`)}
              className={`flex items-center gap-2 ${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline">{vocabulary.title}</span>
            </button>

            <div className="flex items-center gap-4">
              {/* Stats */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <Check className="w-4 h-4 text-green-500" />
                  <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{stats.correct}</span>
                </div>
                <div className="flex items-center gap-1">
                  <X className="w-4 h-4 text-red-500" />
                  <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{stats.incorrect}</span>
                </div>
                {stats.streak >= 3 && (
                  <div className="flex items-center gap-1 px-2 py-0.5 bg-orange-500/20 rounded-full">
                    <Flame className="w-4 h-4 text-orange-500" />
                    <span className="text-sm font-bold text-orange-500">{stats.streak}</span>
                  </div>
                )}
              </div>

              {/* Mode Selector */}
              <div className={`flex rounded-xl overflow-hidden ${darkMode ? 'bg-white/5' : 'bg-gray-100'}`}>
                {[
                  { id: 'flashcard', icon: BookOpen, label: 'Карточки' },
                  { id: 'quiz', icon: Lightbulb, label: 'Тест' },
                  { id: 'typing', icon: Keyboard, label: 'Ввод' }
                ].map(m => (
                  <button
                    key={m.id}
                    onClick={() => setMode(m.id)}
                    className={`p-2 transition-colors ${mode === m.id ? `bg-gradient-to-r ${colorClass} text-white` : darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
                    title={m.label}
                  >
                    <m.icon className="w-5 h-5" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Progress */}
          <div className="flex items-center gap-3">
            <span className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
              {currentIndex + 1} / {words.length}
            </span>
            <div className={`flex-1 h-2 rounded-full overflow-hidden ${darkMode ? 'bg-white/10' : 'bg-gray-200'}`}>
              <div 
                className={`h-full bg-gradient-to-r ${colorClass} transition-all duration-300`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-6 py-8">
        {/* Flashcard Mode */}
        {mode === 'flashcard' && (
          <div className="perspective-1000">
            <div
              onClick={() => setIsFlipped(!isFlipped)}
              className={`
                relative w-full aspect-[3/2] cursor-pointer transition-transform duration-500 transform-style-3d
                ${isFlipped ? 'rotate-y-180' : ''}
              `}
              style={{ transformStyle: 'preserve-3d' }}
            >
              {/* Front */}
              <div 
                className={`
                  absolute inset-0 rounded-3xl p-8 flex flex-col items-center justify-center backface-hidden
                  ${darkMode ? 'bg-white/5' : 'bg-white shadow-xl'}
                `}
                style={{ backfaceVisibility: 'hidden' }}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    speakWord(currentWord.word, vocabulary.sourceLanguage);
                  }}
                  className={`absolute top-4 right-4 p-2 rounded-xl transition-colors ${darkMode ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
                >
                  <Volume2 className={`w-6 h-6 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                </button>
                
                <span className={`text-4xl md:text-5xl font-bold text-center ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {currentWord.word}
                </span>
                {currentWord.transcription && (
                  <span className={`mt-3 text-lg ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                    [{currentWord.transcription}]
                  </span>
                )}
                <p className={`mt-6 text-sm ${darkMode ? 'text-gray-600' : 'text-gray-400'}`}>
                  Нажмите, чтобы перевернуть
                </p>
              </div>

              {/* Back */}
              <div 
                className={`
                  absolute inset-0 rounded-3xl p-8 flex flex-col items-center justify-center rotate-y-180 backface-hidden
                  bg-gradient-to-br ${colorClass}
                `}
                style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
              >
                <span className="text-4xl md:text-5xl font-bold text-center text-white">
                  {currentWord.translation}
                </span>
                {currentWord.example && (
                  <p className="mt-6 text-white/70 text-center italic">
                    "{currentWord.example}"
                  </p>
                )}
              </div>
            </div>

            {/* Answer Buttons */}
            <div className="flex gap-4 mt-8">
              <button
                onClick={() => handleAnswer(false)}
                className={`
                  flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl font-medium transition-all
                  ${darkMode ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' : 'bg-red-100 text-red-600 hover:bg-red-200'}
                `}
              >
                <X className="w-6 h-6" />
                Ещё учу (A)
              </button>
              <button
                onClick={() => handleAnswer(true)}
                className={`
                  flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl font-medium transition-all
                  ${darkMode ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' : 'bg-green-100 text-green-600 hover:bg-green-200'}
                `}
              >
                <Check className="w-6 h-6" />
                Знаю (D)
              </button>
            </div>
          </div>
        )}

        {/* Quiz Mode */}
        {mode === 'quiz' && (
          <div>
            <div className={`rounded-3xl p-8 text-center mb-8 ${darkMode ? 'bg-white/5' : 'bg-white shadow-xl'}`}>
              <button
                onClick={() => speakWord(currentWord.word, vocabulary.sourceLanguage)}
                className={`absolute top-4 right-4 p-2 rounded-xl transition-colors ${darkMode ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
              >
                <Volume2 className={`w-6 h-6 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
              </button>
              
              <p className={`text-sm mb-4 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                Выберите правильный перевод:
              </p>
              <span className={`text-4xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {currentWord.word}
              </span>
              {currentWord.transcription && (
                <p className={`mt-2 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                  [{currentWord.transcription}]
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 gap-3">
              {quizOptions.map((option, index) => (
                <button
                  key={index}
                  onClick={() => !feedback && handleQuizAnswer(option)}
                  disabled={!!feedback}
                  className={`
                    p-4 rounded-xl text-left font-medium transition-all
                    ${feedback
                      ? option === currentWord.translation
                        ? 'bg-green-500 text-white'
                        : feedback.correct === false && option === feedback.message?.split(': ')[1]
                          ? 'bg-red-500 text-white'
                          : darkMode ? 'bg-white/5 text-gray-500' : 'bg-gray-100 text-gray-400'
                      : darkMode
                        ? 'bg-white/5 text-white hover:bg-white/10'
                        : 'bg-white text-gray-900 hover:bg-gray-50 shadow'
                    }
                  `}
                >
                  <span className={`inline-block w-8 h-8 rounded-lg mr-3 text-center leading-8 ${darkMode ? 'bg-white/10' : 'bg-gray-100'}`}>
                    {index + 1}
                  </span>
                  {option}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Typing Mode */}
        {mode === 'typing' && (
          <div>
            <div className={`rounded-3xl p-8 text-center mb-8 ${darkMode ? 'bg-white/5' : 'bg-white shadow-xl'}`}>
              <button
                onClick={() => speakWord(currentWord.word, vocabulary.sourceLanguage)}
                className={`mb-4 p-2 rounded-xl transition-colors ${darkMode ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
              >
                <Volume2 className={`w-6 h-6 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
              </button>
              
              <span className={`block text-4xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {currentWord.word}
              </span>
              {currentWord.transcription && (
                <p className={`mt-2 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                  [{currentWord.transcription}]
                </p>
              )}
            </div>

            <div className="relative">
              <input
                type="text"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && checkTypingAnswer()}
                placeholder="Введите перевод..."
                disabled={!!feedback}
                autoFocus
                className={`
                  w-full px-6 py-4 text-xl rounded-2xl border-2 transition-all text-center
                  ${feedback
                    ? feedback.correct
                      ? 'border-green-500 bg-green-500/10'
                      : 'border-red-500 bg-red-500/10'
                    : darkMode
                      ? 'bg-white/5 border-white/10 text-white focus:border-purple-500'
                      : 'bg-white border-gray-200 focus:border-purple-500'
                  }
                `}
              />
            </div>

            <button
              onClick={checkTypingAnswer}
              disabled={!userAnswer.trim() || !!feedback}
              className={`
                w-full mt-4 py-4 rounded-2xl font-medium transition-all
                ${!userAnswer.trim() || !!feedback
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : `bg-gradient-to-r ${colorClass} text-white hover:opacity-90`
                }
              `}
            >
              Проверить
            </button>

            <button
              onClick={() => setShowTranslation(!showTranslation)}
              className={`w-full mt-3 py-3 rounded-xl flex items-center justify-center gap-2 transition-colors ${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'}`}
            >
              {showTranslation ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              {showTranslation ? `Ответ: ${currentWord.translation}` : 'Показать подсказку'}
            </button>
          </div>
        )}

        {/* Feedback Toast */}
        {feedback && (
          <div className={`
            fixed bottom-8 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full font-medium shadow-lg
            ${feedback.correct ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}
          `}>
            {feedback.message}
          </div>
        )}

        {/* Navigation hints */}
        <p className={`text-center mt-8 text-sm ${darkMode ? 'text-gray-600' : 'text-gray-400'}`}>
          {mode === 'flashcard' 
            ? 'Пробел — перевернуть • A — не знаю • D — знаю'
            : mode === 'typing'
              ? 'Enter — проверить ответ'
              : 'Выберите правильный вариант'
          }
        </p>
      </div>

      {/* Custom styles for 3D flip */}
      <style>{`
        .perspective-1000 { perspective: 1000px; }
        .transform-style-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
      `}</style>
    </div>
  );
};

export default LearnVocabulary;
