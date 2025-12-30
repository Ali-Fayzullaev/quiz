import { useState } from 'react';
import { quizAPI } from '../../services/api';
import './CreateQuiz.css';

const CreateQuiz = () => {
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

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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

    setFormData(prev => ({
      ...prev,
      questions: [...prev.questions, { ...currentQuestion }]
    }));

    // Сброс текущего вопроса
    setCurrentQuestion({
      question: '',
      type: 'multiple-choice',
      options: ['', '', '', ''],
      correctAnswer: 0,
      explanation: '',
      timeLimit: 30
    });

    setError('');
  };

  const removeQuestion = (index) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index)
    }));
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
      const response = await quizAPI.createQuiz(formData);
      setSuccess('Квиз успешно создан!');
      
      // Перенаправляем на страницу квиза через 2 секунды
      setTimeout(() => {
        window.location.href = `/quiz/${response.data.data.quiz._id}`;
      }, 2000);
      
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка при создании квиза');
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
    { value: 'movies', label: 'Кино' }
  ];

  const difficulties = [
    { value: 'beginner', label: 'Начинающий' },
    { value: 'intermediate', label: 'Средний' },
    { value: 'advanced', label: 'Продвинутый' },
    { value: 'expert', label: 'Эксперт' }
  ];

  return (
    <div className="create-quiz-container">
      <h1>Создать квиз</h1>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

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

        {/* Добавление вопросов */}
        <div className="questions-section">
          <h2>Вопросы</h2>

          <div className="current-question">
            <h3>Добавить вопрос</h3>
            
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

            <button type="button" onClick={addQuestion} className="add-question-btn">
              Добавить вопрос
            </button>
          </div>

          {/* Список добавленных вопросов */}
          {formData.questions.length > 0 && (
            <div className="questions-list">
              <h3>Добавленные вопросы ({formData.questions.length})</h3>
              {formData.questions.map((question, index) => (
                <div key={index} className="question-preview">
                  <div className="question-header">
                    <span className="question-number">{index + 1}.</span>
                    <span className="question-text">{question.question}</span>
                    <button
                      type="button"
                      onClick={() => removeQuestion(index)}
                      className="remove-question-btn"
                    >
                      Удалить
                    </button>
                  </div>
                  <div className="question-details">
                    <span className="question-type">{question.type === 'multiple-choice' ? 'Выбор' : 'Да/Нет'}</span>
                    <span className="question-time">{question.timeLimit}с</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Кнопка создания */}
        <div className="form-actions">
          <button
            type="submit"
            disabled={loading || formData.questions.length === 0}
            className="create-quiz-btn"
          >
            {loading ? 'Создание...' : 'Создать квиз'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateQuiz;