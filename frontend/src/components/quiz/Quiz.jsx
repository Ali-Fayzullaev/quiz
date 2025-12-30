import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { quizAPI, gameAPI } from '../../services/api';

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
      setQuiz(response.data.data);
      if (response.data.data.timeLimit) {
        setTimeLeft(response.data.data.timeLimit * 60); // Convert to seconds
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
      setGameId(response.data.data._id);
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

  const nextQuestion = () => {
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = async () => {
    if (!gameId) return;

    setFinished(true);
    try {
      // Submit all answers
      for (let i = 0; i < quiz.questions.length; i++) {
        if (answers[i]) {
          await gameAPI.submitAnswer(gameId, quiz.questions[i]._id, answers[i]);
        }
      }

      // Get results
      const response = await gameAPI.getGameResult(gameId);
      setResults(response.data.data);
    } catch (err) {
      console.error('Ошибка завершения викторины:', err);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) return <div className="loading">Загрузка викторины...</div>;
  if (!quiz) return <div className="error">Викторина не найдена</div>;

  if (finished && results) {
    return (
      <div className="quiz-results">
        <h2>Результаты викторины</h2>
        <h3>{quiz.title}</h3>
        
        <div className="results-summary">
          <div className="score">
            Ваш результат: {results.score}/{results.totalQuestions}
          </div>
          <div className="percentage">
            {Math.round((results.score / results.totalQuestions) * 100)}%
          </div>
          <div className="time">
            Время: {results.timeSpent} секунд
          </div>
        </div>

        <div className="results-actions">
          <button onClick={() => window.location.href = '/quizzes'}>
            Вернуться к викторинам
          </button>
          <button onClick={() => window.location.reload()}>
            Пройти еще раз
          </button>
        </div>
      </div>
    );
  }

  if (!gameStarted) {
    return (
      <div className="quiz-start">
        <h1>{quiz.title}</h1>
        <p>{quiz.description}</p>
        
        <div className="quiz-info">
          <p>Вопросов: {quiz.questions.length}</p>
          <p>Категория: {quiz.category}</p>
          <p>Сложность: {quiz.difficulty}</p>
          {quiz.timeLimit && (
            <p>Время: {quiz.timeLimit} минут</p>
          )}
        </div>

        <button className="start-game-btn" onClick={startGame}>
          Начать викторину
        </button>
      </div>
    );
  }

  const question = quiz.questions[currentQuestion];

  return (
    <div className="quiz-game">
      <div className="quiz-header">
        <div className="quiz-progress">
          Вопрос {currentQuestion + 1} из {quiz.questions.length}
        </div>
        {timeLeft !== null && (
          <div className="quiz-timer">
            Время: {formatTime(timeLeft)}
          </div>
        )}
      </div>

      <div className="question-container">
        <h2>{question.question}</h2>
        
        {question.image && (
          <img src={question.image} alt="Question" className="question-image" />
        )}

        <div className="answers-container">
          {question.options.map((option, index) => (
            <button
              key={index}
              className={`answer-btn ${answers[currentQuestion] === option ? 'selected' : ''}`}
              onClick={() => handleAnswerSelect(option)}
            >
              {option}
            </button>
          ))}
        </div>

        <div className="quiz-actions">
          {answers[currentQuestion] && (
            <button onClick={nextQuestion} className="next-btn">
              {currentQuestion < quiz.questions.length - 1 ? 'Следующий вопрос' : 'Завершить'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Quiz;