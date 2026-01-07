import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { quizAPI, gameAPI } from '../../services/api';
import './Quiz.css';

const Quiz = () => {
  const { id } = useParams();
  const [quiz, setQuiz] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [gameId, setGameId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [gameStarted, setGameStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);
  const [finished, setFinished] = useState(false);
  const [results, setResults] = useState(null);

  useEffect(() => {
    fetchQuiz();
  }, [id]);

  useEffect(() => {
    if (timeLeft > 0 && gameStarted && !finished) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && gameStarted) {
      finishQuiz();
    }
  }, [timeLeft, gameStarted, finished]);

  const fetchQuiz = async () => {
    try {
      const response = await quizAPI.getQuizById(id);
      const quizData = response.data.data?.quiz || response.data.data;
      console.log('Quiz data:', quizData); // Для отладки
      setQuiz(quizData);
      if (quizData?.timeLimit) {
        setTimeLeft(quizData.timeLimit * 60); // Convert to seconds
      }
    } catch (err) {
      console.error('Ошибка загрузки викторины:', err);
    } finally {
      setLoading(false);
    }
  };

  const startGame = async () => {
    try {
      const response = await gameAPI.startGame(id);
      console.log('StartGame response:', response.data); // Для отладки
      
      const gameData = response.data.data;
      setGameId(gameData.sessionId);
      
      // Обновляем вопросы из ответа сервера (они могут быть перемешаны)
      if (gameData.questions) {
        setQuiz(prev => ({
          ...prev,
          questions: gameData.questions
        }));
      }
      
      setGameStarted(true);
    } catch (err) {
      console.error('Ошибка начала игры:', err);
    }
  };

  const handleAnswerSelect = (answer) => {
    setAnswers({
      ...answers,
      [currentQuestion]: answer
    });
  };

  const submitCurrentAnswer = async () => {
    if (!gameId || answers[currentQuestion] === undefined) return null;

    try {
      console.log('Отправляем ответ:', {
        sessionId: gameId,
        questionId: quiz.questions[currentQuestion]._id,
        answer: answers[currentQuestion]
      });
      
      const response = await gameAPI.submitAnswer(gameId, quiz.questions[currentQuestion]._id, answers[currentQuestion]);
      console.log('Ответ отправлен успешно:', response.data);
      return response.data;
    } catch (err) {
      console.error('Ошибка отправки ответа:', err);
      throw err;
    }
  };

  const nextQuestion = async () => {
    try {
      // Отправляем текущий ответ
      const response = await submitCurrentAnswer();
      
      // Проверяем, вернул ли сервер финальные результаты
      if (response?.data?.result) {
        // Игра завершена сервером
        setResults(response.data.result);
        setFinished(true);
        return;
      }
      
      if (currentQuestion < quiz.questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
      } else {
        // На случай если сервер не вернул результаты автоматически
        await finishQuiz();
      }
    } catch (err) {
      console.error('Ошибка при переходе к следующему вопросу:', err);
    }
  };

  const finishQuiz = async () => {
    if (!gameId) {
      console.error('gameId отсутствует');
      return;
    }

    try {
      console.log('Получаем результаты для gameId:', gameId);
      const response = await gameAPI.getGameResult(gameId);
      console.log('Результаты получены:', response.data);
      
      setResults(response.data.data);
      setFinished(true);
    } catch (err) {
      console.error('Ошибка завершения викторины:', err);
      alert('Произошла ошибка при завершении викторины: ' + (err.response?.data?.error || err.message));
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) return (
    <div className="quiz-container">
      <div className="loading">
        <div className="loading-spinner"></div>
        <p>Загрузка викторины...</p>
      </div>
    </div>
  );
  
  if (!quiz) return (
    <div className="quiz-container">
      <div className="error">Викторина не найдена</div>
    </div>
  );

  if (finished && results) {
    return (
      <div className="quiz-container">
        <div className="quiz-results">
          <h2>🎉 Результаты викторины</h2>
          <h3>{quiz.title}</h3>
          
          <div className="results-summary">
            <div className="score">
              Правильных ответов: {results.correctAnswers}/{results.totalQuestions}
            </div>
            <div className="percentage">
              {results.percentage}%
            </div>
            <div className="points">
              🏆 Очки: {results.score}
            </div>
            <div className="time">
              ⏱️ Время: {results.timeSpent} секунд
            </div>
            <div className={`status ${results.passed ? 'passed' : 'failed'}`}>
              {results.passed ? '✅ Тест пройден!' : '❌ Тест не пройден'}
            </div>
          </div>

          <div className="results-actions">
            <button onClick={() => window.location.href = '/quizzes'}>
              🏠 Вернуться к викторинам
            </button>
            <button onClick={() => window.location.reload()}>
              🔄 Пройти еще раз
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!gameStarted) {
    // Проверяем, что questions это массив
    const questionsCount = Array.isArray(quiz.questions) ? quiz.questions.length : 0;
    
    return (
      <div className="quiz-container">
        <div className="quiz-start">
          <h1>🧠 {quiz.title}</h1>
          <p>{quiz.description}</p>
          
          <div className="quiz-info">
            <p>📝 Вопросов: <strong>{questionsCount}</strong></p>
            <p>🏷️ Категория: <strong>{quiz.category}</strong></p>
            <p>⭐ Сложность: <strong>{quiz.difficulty}</strong></p>
            {quiz.timeLimit && (
              <p>⏰ Время: <strong>{quiz.timeLimit} минут</strong></p>
            )}
          </div>

          {questionsCount > 0 ? (
            <button className="start-game-btn" onClick={startGame}>
              🚀 Начать викторину
            </button>
          ) : (
            <div className="no-questions">
              😔 В этой викторине пока нет вопросов
            </div>
          )}
        </div>
      </div>
    );
  }

  const question = quiz.questions[currentQuestion];

  return (
    <div className="quiz-container">
      <div className="quiz-game">
        <div className="quiz-header">
          <div className="quiz-progress">
            📊 Вопрос {currentQuestion + 1} из {quiz.questions.length}
          </div>
          {timeLeft !== null && (
            <div className="quiz-timer">
              ⏰ {formatTime(timeLeft)}
            </div>
          )}
        </div>

        <div className="question-container">
          <h2>{question.text || question.question}</h2>
          
          {question.image && (
            <img src={question.image} alt="Question" className="question-image" />
          )}

          <div className="answers-container">
            {question.options.map((option, index) => (
              <button
                key={option._id || index}
                className={`answer-btn ${answers[currentQuestion] === (option._id || index) ? 'selected' : ''}`}
                onClick={() => handleAnswerSelect(option._id || index)}
              >
                <span style={{marginRight: '10px', fontSize: '1.2em'}}>
                  {String.fromCharCode(65 + index)}
                </span>
                {option.text || option}
              </button>
            ))}
          </div>

          <div className="quiz-actions">
            {answers[currentQuestion] && (
              <button onClick={nextQuestion} className="next-btn">
                {currentQuestion < quiz.questions.length - 1 ? '➡️ Следующий вопрос' : '✅ Завершить'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Quiz;