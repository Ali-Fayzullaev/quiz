import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { quizAPI } from '../../services/api';

const QuizCard = ({ quiz, onDelete }) => {
  const navigate = useNavigate();
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(quiz.likes?.length || 0);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Получаем текущего пользователя (поддержка и id и _id)
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const userId = currentUser.id || currentUser._id;
  const creatorId = quiz.creator?._id || quiz.creator?.id || quiz.creator;
  const isOwner = userId && creatorId && userId === creatorId;

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
    navigate(`/quiz/${quiz._id}`);
  };

  const handleEdit = () => {
    navigate(`/edit-quiz/${quiz._id}`);
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await quizAPI.deleteQuiz(quiz._id);
      if (onDelete) {
        onDelete(quiz._id);
      }
    } catch (err) {
      console.error('Ошибка удаления:', err);
      alert('Не удалось удалить квиз');
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'beginner': return '#4CAF50';
      case 'easy': return '#4CAF50';
      case 'intermediate': return '#FF9800';
      case 'medium': return '#FF9800';
      case 'advanced': return '#F44336';
      case 'hard': return '#F44336';
      case 'expert': return '#9C27B0';
      default: return '#9E9E9E';
    }
  };

  const getDifficultyText = (difficulty) => {
    switch (difficulty) {
      case 'beginner': return 'Начинающий';
      case 'easy': return 'Легкая';
      case 'intermediate': return 'Средний';
      case 'medium': return 'Средняя';
      case 'advanced': return 'Продвинутый';
      case 'hard': return 'Сложная';
      case 'expert': return 'Эксперт';
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

        {/* Кнопки для владельца квиза */}
        {isOwner && (
          <div className="quiz-owner-actions">
            <button className="edit-quiz-btn" onClick={handleEdit}>
              ✏️ Редактировать
            </button>
            <button 
              className="delete-quiz-btn" 
              onClick={() => setShowDeleteConfirm(true)}
              disabled={deleting}
            >
              🗑️ Удалить
            </button>
          </div>
        )}

        {/* Модальное окно подтверждения удаления */}
        {showDeleteConfirm && (
          <div className="delete-confirm-overlay">
            <div className="delete-confirm-modal">
              <h4>Удалить квиз?</h4>
              <p>Вы уверены, что хотите удалить "{quiz.title}"? Это действие нельзя отменить.</p>
              <div className="delete-confirm-actions">
                <button 
                  className="confirm-delete-btn" 
                  onClick={handleDelete}
                  disabled={deleting}
                >
                  {deleting ? 'Удаление...' : 'Да, удалить'}
                </button>
                <button 
                  className="cancel-delete-btn" 
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  Отмена
                </button>
              </div>
            </div>
          </div>
        )}

        {quiz.creator && (
          <div className="quiz-creator">
            <span>Создал: {quiz.creator.username || 'Неизвестно'}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizCard;