import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { quizAPI } from '../../services/api';

const MyQuizzes = () => {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  // Поддержка и id и _id (бэкенд возвращает id)
  const userId = currentUser.id || currentUser._id;

  useEffect(() => {
    if (!userId) {
      navigate('/login');
      return;
    }
    fetchMyQuizzes();
  }, []);

  const fetchMyQuizzes = async () => {
    setLoading(true);
    try {
      const response = await quizAPI.getQuizzes({ creator: userId });
      const data = response.data.data;
      setQuizzes(data.quizzes || []);
    } catch (err) {
      setError('Ошибка загрузки ваших викторин');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (quizId) => {
    navigate(`/edit-quiz/${quizId}`);
  };

  const handleDelete = async (quizId) => {
    setDeleting(true);
    try {
      await quizAPI.deleteQuiz(quizId);
      setQuizzes(prev => prev.filter(q => q._id !== quizId));
      setDeleteConfirm(null);
    } catch (err) {
      console.error('Ошибка удаления:', err);
      alert('Не удалось удалить викторину');
    } finally {
      setDeleting(false);
    }
  };

  const handleView = (quizId) => {
    navigate(`/quiz/${quizId}`);
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'beginner': return '#4CAF50';
      case 'intermediate': return '#FF9800';
      case 'advanced': return '#F44336';
      case 'expert': return '#9C27B0';
      default: return '#9E9E9E';
    }
  };

  const getDifficultyText = (difficulty) => {
    switch (difficulty) {
      case 'beginner': return 'Начинающий';
      case 'intermediate': return 'Средний';
      case 'advanced': return 'Продвинутый';
      case 'expert': return 'Эксперт';
      default: return difficulty;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'draft': return 'Черновик';
      case 'published': return 'Опубликован';
      case 'archived': return 'В архиве';
      default: return status;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'draft': return '#9E9E9E';
      case 'published': return '#4CAF50';
      case 'archived': return '#FF9800';
      default: return '#9E9E9E';
    }
  };

  const getCategoryText = (category) => {
    const categories = {
      general: 'Общие',
      science: 'Наука',
      history: 'История',
      geography: 'География',
      sports: 'Спорт',
      entertainment: 'Развлечения',
      technology: 'Технологии',
      art: 'Искусство',
      music: 'Музыка',
      movies: 'Кино',
      literature: 'Литература',
      nature: 'Природа',
      food: 'Еда',
      travel: 'Путешествия',
      languages: 'Языки',
      mathematics: 'Математика',
      business: 'Бизнес',
      gaming: 'Игры',
      anime: 'Аниме',
      custom: 'Другое'
    };
    return categories[category] || category;
  };

  if (!userId) {
    return null;
  }

  return (
    <div className="my-quizzes-container">
      <div className="my-quizzes-header">
        <h1>Мои викторины</h1>
        <button 
          className="create-new-btn"
          onClick={() => navigate('/create-quiz')}
        >
          + Создать новую
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading">Загрузка ваших викторин...</div>
      ) : quizzes.length === 0 ? (
        <div className="no-quizzes">
          <div className="no-quizzes-icon">📝</div>
          <h2>У вас пока нет викторин</h2>
          <p>Создайте свою первую викторину и поделитесь ей с друзьями!</p>
          <button 
            className="create-first-btn"
            onClick={() => navigate('/create-quiz')}
          >
            Создать викторину
          </button>
        </div>
      ) : (
        <div className="my-quizzes-list">
          {quizzes.map(quiz => (
            <div key={quiz._id} className="my-quiz-card">
              <div className="my-quiz-info">
                <div className="my-quiz-header">
                  <h3 className="my-quiz-title">{quiz.title}</h3>
                  <span 
                    className="quiz-status"
                    style={{ backgroundColor: getStatusColor(quiz.status) }}
                  >
                    {getStatusText(quiz.status)}
                  </span>
                </div>
                
                <p className="my-quiz-description">
                  {quiz.description || 'Нет описания'}
                </p>

                <div className="my-quiz-meta">
                  <span className="meta-item">
                    📂 {getCategoryText(quiz.category)}
                  </span>
                  <span 
                    className="meta-item difficulty"
                    style={{ backgroundColor: getDifficultyColor(quiz.difficulty) }}
                  >
                    {getDifficultyText(quiz.difficulty)}
                  </span>
                  <span className="meta-item">
                    ❓ {quiz.questions?.length || 0} вопросов
                  </span>
                  <span className="meta-item">
                    👁️ {quiz.stats?.views || 0} просмотров
                  </span>
                  <span className="meta-item">
                    🎮 {quiz.stats?.plays || 0} игр
                  </span>
                </div>

                <div className="my-quiz-date">
                  Создано: {new Date(quiz.createdAt).toLocaleDateString('ru-RU')}
                </div>
              </div>

              <div className="my-quiz-actions">
                <button 
                  className="action-btn view-btn"
                  onClick={() => handleView(quiz._id)}
                >
                  👁️ Смотреть
                </button>
                <button 
                  className="action-btn edit-btn"
                  onClick={() => handleEdit(quiz._id)}
                >
                  ✏️ Редактировать
                </button>
                <button 
                  className="action-btn delete-btn"
                  onClick={() => setDeleteConfirm(quiz)}
                >
                  🗑️ Удалить
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Модальное окно подтверждения удаления */}
      {deleteConfirm && (
        <div className="delete-modal-overlay">
          <div className="delete-modal">
            <h3>Удалить викторину?</h3>
            <p>
              Вы уверены, что хотите удалить викторину "<strong>{deleteConfirm.title}</strong>"?
            </p>
            <p className="delete-warning">
              Это действие нельзя отменить. Все результаты и статистика будут потеряны.
            </p>
            <div className="delete-modal-actions">
              <button 
                className="confirm-delete-btn"
                onClick={() => handleDelete(deleteConfirm._id)}
                disabled={deleting}
              >
                {deleting ? 'Удаление...' : 'Да, удалить'}
              </button>
              <button 
                className="cancel-btn"
                onClick={() => setDeleteConfirm(null)}
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyQuizzes;
