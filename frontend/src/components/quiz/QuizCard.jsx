import { useState } from 'react';
import { quizAPI } from '../../services/api';

const QuizCard = ({ quiz }) => {
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(quiz.likes?.length || 0);

  const handleLike = async () => {
    try {
      await quizAPI.toggleLike(quiz._id);
      setLiked(!liked);
      setLikesCount(prev => liked ? prev - 1 : prev + 1);
    } catch (err) {
      console.error('Ошибка лайка:', err);
    }
  };

  const handleStartQuiz = () => {
    window.location.href = `/quiz/${quiz._id}`;
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return '#4CAF50';
      case 'medium': return '#FF9800';
      case 'hard': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  const getDifficultyText = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'Легкая';
      case 'medium': return 'Средняя';
      case 'hard': return 'Сложная';
      default: return difficulty;
    }
  };

  return (
    <div className="quiz-card">
      {quiz.thumbnail && (
        <div className="quiz-card-image">
          <img src={quiz.thumbnail} alt={quiz.title} />
        </div>
      )}
      
      <div className="quiz-card-content">
        <h3 className="quiz-title">{quiz.title}</h3>
        <p className="quiz-description">{quiz.description}</p>
        
        <div className="quiz-meta">
          <span className="quiz-category">{quiz.category}</span>
          <span 
            className="quiz-difficulty"
            style={{ backgroundColor: getDifficultyColor(quiz.difficulty) }}
          >
            {getDifficultyText(quiz.difficulty)}
          </span>
        </div>

        <div className="quiz-stats">
          <span>Вопросов: {quiz.questions?.length || 0}</span>
          <span>Время: {quiz.timeLimit ? `${quiz.timeLimit} мин` : 'Без ограничений'}</span>
        </div>

        <div className="quiz-actions">
          <button className="start-quiz-btn" onClick={handleStartQuiz}>
            Начать викторину
          </button>
          
          <button 
            className={`like-btn ${liked ? 'liked' : ''}`}
            onClick={handleLike}
          >
            ❤️ {likesCount}
          </button>
        </div>

        {quiz.creator && (
          <div className="quiz-creator">
            <span>Создал: {quiz.creator.username}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizCard;