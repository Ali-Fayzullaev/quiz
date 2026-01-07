import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { quizAPI } from '../../services/api';
import './CreateQuiz.css';

const EditQuiz = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [loadingQuiz, setLoadingQuiz] = useState(true);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'general',
    difficulty: 'beginner',
    timeLimit: 30,
    isPublic: true,
    questions: []
  });

  const [currentQuestion, setCurrentQuestion] = useState({
    question: '',
    type: 'multiple-choice',
    options: ['', '', '', ''],
    correctAnswer: 0,
    explanation: '',
    timeLimit: 30
  });

  const [editingQuestionIndex, setEditingQuestionIndex] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Загрузка квиза при монтировании
  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    // Поддержка и id и _id
    const userId = user.id || user._id;
    
    if (!token) {
      setIsAuthenticated(false);
      setLoadingQuiz(false);
      return;
    }
    
    setIsAuthenticated(true);
    loadQuiz(userId);
  }, [id]);

  const loadQuiz = async (currentUserId) => {
    try {
      const response = await quizAPI.getQuizById(id);
      const quizData = response.data.data?.quiz || response.data.data;
      
      // Проверяем, является ли пользователь владельцем (поддержка и id и _id)
      const creatorId = quizData.creator?._id || quizData.creator?.id || quizData.creator;
      if (currentUserId !== creatorId) {
        setIsOwner(false);
        setError('Вы не можете редактировать этот квиз');
        setLoadingQuiz(false);
        return;
      }
      
      setIsOwner(true);
      
      // Преобразуем вопросы в нужный формат
      const questions = (quizData.questions || []).map(q => ({
        _id: q._id,
        question: q.question || q.text || '',
        type: q.type || 'multiple-choice',
        options: q.options || ['', '', '', ''],
        correctAnswer: q.correctAnswer ?? 0,
        explanation: q.explanation || '',
        timeLimit: q.timeLimit || 30
      }));
      
      setFormData({
        title: quizData.title || '',
        description: quizData.description || '',
        category: quizData.category || 'general',
        difficulty: quizData.difficulty || 'beginner',
        timeLimit: quizData.timeLimit || quizData.settings?.timeLimit || 30,
        isPublic: quizData.visibility === 'public',
        questions
      });
    } catch (err) {
      console.error('Ошибка загрузки квиза:', err);
      setError('Не удалось загрузить квиз');
    } finally {
      setLoadingQuiz(false);
    }
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleQuestionChange = (e) => {
    const { name, value } = e.target;
    setCurrentQuestion(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleOptionChange = (index, value) => {
    setCurrentQuestion(prev => ({
      ...prev,
      options: prev.options.map((option, i) => i === index ? value : option)
    }));
  };

  const addQuestion = () => {
    if (!currentQuestion.question.trim()) {
      setError('Введите текст вопроса');
      return;
    }

    if (currentQuestion.type === 'multiple-choice' && currentQuestion.options.some(opt => !opt.trim())) {
      setError('Заполните все варианты ответов');
      return;
    }

    const newQuestion = { ...currentQuestion };

    if (editingQuestionIndex !== null) {
      // Редактирование существующего вопроса
      setFormData(prev => ({
        ...prev,
        questions: prev.questions.map((q, i) => 
          i === editingQuestionIndex ? newQuestion : q
        )
      }));
      setEditingQuestionIndex(null);
      setSuccess('Вопрос обновлен!');
    } else {
      // Добавление нового вопроса
      setFormData(prev => ({
        ...prev,
        questions: [...prev.questions, newQuestion]
      }));
      setSuccess('Вопрос добавлен!');
    }

    // Сброс формы вопроса
    setCurrentQuestion({
      question: '',
      type: 'multiple-choice',
      options: ['', '', '', ''],
      correctAnswer: 0,
      explanation: '',
      timeLimit: 30
    });

    setError('');
    setTimeout(() => setSuccess(''), 2000);
  };

  const editQuestion = (index) => {
    const question = formData.questions[index];
    setCurrentQuestion({
      question: question.question,
      type: question.type,
      options: question.options || ['', '', '', ''],
      correctAnswer: question.correctAnswer,
      explanation: question.explanation || '',
      timeLimit: question.timeLimit || 30
    });
    setEditingQuestionIndex(index);
  };

  const cancelEditQuestion = () => {
    setCurrentQuestion({
      question: '',
      type: 'multiple-choice',
      options: ['', '', '', ''],
      correctAnswer: 0,
      explanation: '',
      timeLimit: 30
    });
    setEditingQuestionIndex(null);
  };

  const removeQuestion = (index) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index)
    }));
    
    // Если удаляем редактируемый вопрос
    if (editingQuestionIndex === index) {
      cancelEditQuestion();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      setError('Введите название квиза');
      return;
    }

    if (formData.questions.length === 0) {
      setError('Добавьте хотя бы один вопрос');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      await quizAPI.updateQuiz(id, formData);
      setSuccess('Квиз успешно обновлен!');
      
      setTimeout(() => {
        navigate(`/quiz/${id}`);
      }, 1500);
      
    } catch (err) {
      console.error('Ошибка обновления квиза:', err.response?.data || err);
      
      if (err.response?.status === 401) {
        setError('Сессия истекла. Пожалуйста, войдите снова.');
        setIsAuthenticated(false);
      } else if (err.response?.status === 403) {
        setError('У вас нет прав для редактирования этого квиза');
      } else {
        setError(err.response?.data?.error || err.response?.data?.message || 'Ошибка при обновлении квиза');
      }
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { value: 'general', label: 'Общие знания' },
    { value: 'science', label: 'Наука' },
    { value: 'history', label: 'История' },
    { value: 'geography', label: 'География' },
    { value: 'sports', label: 'Спорт' },
    { value: 'entertainment', label: 'Развлечения' },
    { value: 'technology', label: 'Технологии' },
    { value: 'art', label: 'Искусство' },
    { value: 'music', label: 'Музыка' },
    { value: 'movies', label: 'Кино' },
    { value: 'literature', label: 'Литература' },
    { value: 'nature', label: 'Природа' },
    { value: 'food', label: 'Еда' },
    { value: 'travel', label: 'Путешествия' },
    { value: 'languages', label: 'Языки' },
    { value: 'mathematics', label: 'Математика' },
    { value: 'business', label: 'Бизнес' },
    { value: 'gaming', label: 'Игры' },
    { value: 'anime', label: 'Аниме' },
    { value: 'custom', label: 'Другое' }
  ];

  const difficulties = [
    { value: 'beginner', label: 'Начинающий' },
    { value: 'intermediate', label: 'Средний' },
    { value: 'advanced', label: 'Продвинутый' },
    { value: 'expert', label: 'Эксперт' }
  ];

  if (loadingQuiz) {
    return (
      <div className="create-quiz-container">
        <div className="loading">Загрузка квиза...</div>
      </div>
    );
  }

  return (
    <div className="create-quiz-container">
      <h1>Редактировать квиз</h1>

      {!isAuthenticated && (
        <div className="auth-warning">
          <p>Для редактирования квиза необходимо войти в систему</p>
          <button onClick={() => navigate('/login')} className="login-btn">
            Войти
          </button>
        </div>
      )}

      {isAuthenticated && !isOwner && (
        <div className="auth-warning">
          <p>У вас нет прав для редактирования этого квиза</p>
          <button onClick={() => navigate('/quizzes')} className="login-btn">
            К списку квизов
          </button>
        </div>
      )}

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      {isAuthenticated && isOwner && (
      <form onSubmit={handleSubmit} className="create-quiz-form">
        {/* Основная информация о квизе */}
        <div className="quiz-info-section">
          <h2>Информация о квизе</h2>
          
          <div className="form-group">
            <label htmlFor="title">Название квиза:</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleFormChange}
              placeholder="Введите название квиза"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Описание:</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleFormChange}
              placeholder="Описание квиза"
              rows="3"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="category">Категория:</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleFormChange}
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="difficulty">Сложность:</label>
              <select
                id="difficulty"
                name="difficulty"
                value={formData.difficulty}
                onChange={handleFormChange}
              >
                {difficulties.map(diff => (
                  <option key={diff.value} value={diff.value}>
                    {diff.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="timeLimit">Время на квиз (мин):</label>
              <input
                type="number"
                id="timeLimit"
                name="timeLimit"
                value={formData.timeLimit}
                onChange={handleFormChange}
                min="1"
                max="180"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="isPublic"
                checked={formData.isPublic}
                onChange={handleFormChange}
              />
              Публичный квиз
            </label>
          </div>
        </div>

        {/* Редактирование/добавление вопросов */}
        <div className="questions-section">
          <h2>Вопросы</h2>

          <div className="current-question">
            <h3>
              {editingQuestionIndex !== null 
                ? `Редактировать вопрос #${editingQuestionIndex + 1}` 
                : 'Добавить вопрос'
              }
            </h3>
            
            <div className="form-group">
              <label htmlFor="question">Текст вопроса:</label>
              <input
                type="text"
                id="question"
                name="question"
                value={currentQuestion.question}
                onChange={handleQuestionChange}
                placeholder="Введите вопрос"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="type">Тип вопроса:</label>
                <select
                  id="type"
                  name="type"
                  value={currentQuestion.type}
                  onChange={handleQuestionChange}
                >
                  <option value="multiple-choice">Множественный выбор</option>
                  <option value="true-false">Правда/Ложь</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="questionTimeLimit">Время на вопрос (сек):</label>
                <input
                  type="number"
                  id="questionTimeLimit"
                  name="timeLimit"
                  value={currentQuestion.timeLimit}
                  onChange={handleQuestionChange}
                  min="5"
                  max="120"
                />
              </div>
            </div>

            {currentQuestion.type === 'multiple-choice' && (
              <div className="options-section">
                <label>Варианты ответов:</label>
                {currentQuestion.options.map((option, index) => (
                  <div key={index} className="option-row">
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => handleOptionChange(index, e.target.value)}
                      placeholder={`Вариант ${index + 1}`}
                    />
                    <label className="correct-answer-label">
                      <input
                        type="radio"
                        name="correctAnswer"
                        value={index}
                        checked={currentQuestion.correctAnswer === index}
                        onChange={(e) => setCurrentQuestion(prev => ({
                          ...prev,
                          correctAnswer: parseInt(e.target.value)
                        }))}
                      />
                      Правильный
                    </label>
                  </div>
                ))}
              </div>
            )}

            {currentQuestion.type === 'true-false' && (
              <div className="true-false-section">
                <label>Правильный ответ:</label>
                <div className="radio-group">
                  <label>
                    <input
                      type="radio"
                      name="correctTrueFalse"
                      value="true"
                      checked={currentQuestion.correctAnswer === 0}
                      onChange={() => setCurrentQuestion(prev => ({
                        ...prev,
                        correctAnswer: 0,
                        options: ['Правда', 'Ложь']
                      }))}
                    />
                    Правда
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="correctTrueFalse"
                      value="false"
                      checked={currentQuestion.correctAnswer === 1}
                      onChange={() => setCurrentQuestion(prev => ({
                        ...prev,
                        correctAnswer: 1,
                        options: ['Правда', 'Ложь']
                      }))}
                    />
                    Ложь
                  </label>
                </div>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="explanation">Объяснение (опционально):</label>
              <textarea
                id="explanation"
                name="explanation"
                value={currentQuestion.explanation}
                onChange={handleQuestionChange}
                placeholder="Объяснение правильного ответа"
                rows="2"
              />
            </div>

            <div className="question-form-actions">
              <button type="button" onClick={addQuestion} className="add-question-btn">
                {editingQuestionIndex !== null ? 'Сохранить изменения' : 'Добавить вопрос'}
              </button>
              {editingQuestionIndex !== null && (
                <button type="button" onClick={cancelEditQuestion} className="cancel-edit-btn">
                  Отмена
                </button>
              )}
            </div>
          </div>

          {/* Список вопросов */}
          {formData.questions.length > 0 && (
            <div className="questions-list">
              <h3>Вопросы квиза ({formData.questions.length})</h3>
              {formData.questions.map((question, index) => (
                <div key={index} className={`question-preview ${editingQuestionIndex === index ? 'editing' : ''}`}>
                  <div className="question-header">
                    <span className="question-number">{index + 1}.</span>
                    <span className="question-text">{question.question}</span>
                    <div className="question-actions">
                      <button
                        type="button"
                        onClick={() => editQuestion(index)}
                        className="edit-question-btn"
                        disabled={editingQuestionIndex !== null}
                      >
                        ✏️
                      </button>
                      <button
                        type="button"
                        onClick={() => removeQuestion(index)}
                        className="remove-question-btn"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                  <div className="question-details">
                    <span className="question-type">
                      {question.type === 'multiple-choice' ? 'Выбор' : 'Да/Нет'}
                    </span>
                    <span className="question-time">{question.timeLimit}с</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Кнопки действий */}
        <div className="form-actions">
          <button
            type="button"
            onClick={() => navigate(`/quiz/${id}`)}
            className="cancel-btn"
          >
            Отмена
          </button>
          <button
            type="submit"
            disabled={loading || formData.questions.length === 0}
            className="create-quiz-btn"
          >
            {loading ? 'Сохранение...' : 'Сохранить изменения'}
          </button>
        </div>
      </form>
      )}
    </div>
  );
};

export default EditQuiz;
