import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { quizAPI } from '../../services/api';
import { 
  Plus, 
  Trash2, 
  Save, 
  Loader2, 
  AlertCircle, 
  Check, 
  X,
  Clock,
  HelpCircle,
  ListChecks,
  ChevronDown,
  FileText,
  Eye,
  EyeOff,
  Sparkles,
  Edit2,
  ArrowLeft
} from 'lucide-react';

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
  const [activeStep, setActiveStep] = useState(1);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
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
      
      const creatorId = quizData.creator?._id || quizData.creator?.id || quizData.creator;
      if (currentUserId !== creatorId) {
        setIsOwner(false);
        setError('Вы не можете редактировать этот квиз');
        setLoadingQuiz(false);
        return;
      }
      
      setIsOwner(true);
      
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
      setFormData(prev => ({
        ...prev,
        questions: prev.questions.map((q, i) => 
          i === editingQuestionIndex ? newQuestion : q
        )
      }));
      setEditingQuestionIndex(null);
      setSuccess('Вопрос обновлен!');
    } else {
      setFormData(prev => ({
        ...prev,
        questions: [...prev.questions, newQuestion]
      }));
      setSuccess('Вопрос добавлен!');
    }

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
    { value: 'general', label: 'Общие знания', icon: '📚' },
    { value: 'science', label: 'Наука', icon: '🔬' },
    { value: 'history', label: 'История', icon: '📜' },
    { value: 'geography', label: 'География', icon: '🌍' },
    { value: 'sports', label: 'Спорт', icon: '⚽' },
    { value: 'entertainment', label: 'Развлечения', icon: '🎭' },
    { value: 'technology', label: 'Технологии', icon: '💻' },
    { value: 'art', label: 'Искусство', icon: '🎨' },
    { value: 'music', label: 'Музыка', icon: '🎵' },
    { value: 'movies', label: 'Кино', icon: '🎬' }
  ];

  const difficulties = [
    { value: 'beginner', label: 'Начинающий' },
    { value: 'intermediate', label: 'Средний' },
    { value: 'advanced', label: 'Продвинутый' },
    { value: 'expert', label: 'Эксперт' }
  ];

  if (loadingQuiz) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-purple-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Загрузка квиза...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center p-8 rounded-2xl bg-white/5 border border-white/10 max-w-md">
          <div className="w-16 h-16 rounded-2xl bg-purple-500/20 flex items-center justify-center mx-auto mb-4">
            <Sparkles className="text-purple-400" size={32} />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Требуется авторизация</h2>
          <p className="text-gray-400 mb-6">Для редактирования квиза необходимо войти в систему</p>
          <button 
            onClick={() => navigate('/login')} 
            className="px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white font-medium rounded-xl transition-colors"
          >
            Войти
          </button>
        </div>
      </div>
    );
  }

  if (!isOwner) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center p-8 rounded-2xl bg-white/5 border border-white/10 max-w-md">
          <div className="w-16 h-16 rounded-2xl bg-red-500/20 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="text-red-400" size={32} />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Нет доступа</h2>
          <p className="text-gray-400 mb-6">У вас нет прав для редактирования этого квиза</p>
          <button 
            onClick={() => navigate('/quizzes')} 
            className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl transition-colors"
          >
            К списку квизов
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <button 
            onClick={() => navigate(`/quiz/${id}`)}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-2"
          >
            <ArrowLeft size={18} />
            <span>Назад к квизу</span>
          </button>
          <h1 className="text-2xl lg:text-3xl font-bold text-white">Редактировать квиз</h1>
          <p className="text-gray-400 mt-1">Внесите изменения в ваш квиз</p>
        </div>
        
        {/* Progress Steps */}
        <div className="flex items-center gap-2">
          {[1, 2].map((step) => (
            <button
              key={step}
              onClick={() => setActiveStep(step)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors ${
                activeStep === step
                  ? 'bg-purple-500/20 text-purple-400'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium ${
                activeStep === step ? 'bg-purple-500 text-white' : 'bg-white/10'
              }`}>
                {step}
              </span>
              <span className="hidden sm:inline">{step === 1 ? 'Информация' : 'Вопросы'}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
          <AlertCircle size={20} />
          <span className="flex-1">{error}</span>
          <button onClick={() => setError('')} className="hover:text-red-300">
            <X size={18} />
          </button>
        </div>
      )}
      
      {success && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400">
          <Check size={20} />
          <span className="flex-1">{success}</span>
          <button onClick={() => setSuccess('')} className="hover:text-green-300">
            <X size={18} />
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Step 1: Quiz Info */}
        {activeStep === 1 && (
          <div className="space-y-6">
            {/* Basic Info Card */}
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <FileText size={20} className="text-purple-400" />
                Основная информация
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Название квиза *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleFormChange}
                    placeholder="Введите название квиза"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl 
                             text-white placeholder:text-gray-500 outline-none
                             focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Описание
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleFormChange}
                    placeholder="Опишите ваш квиз..."
                    rows={3}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl 
                             text-white placeholder:text-gray-500 outline-none resize-none
                             focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Category & Difficulty */}
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <ListChecks size={20} className="text-purple-400" />
                Категория и сложность
              </h2>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Категория</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleFormChange}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none cursor-pointer focus:border-purple-500/50 transition-all"
                  >
                    {categories.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.icon} {cat.label}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Сложность</label>
                  <select
                    name="difficulty"
                    value={formData.difficulty}
                    onChange={handleFormChange}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none cursor-pointer focus:border-purple-500/50 transition-all"
                  >
                    {difficulties.map(diff => (
                      <option key={diff.value} value={diff.value}>{diff.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Settings */}
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Clock size={20} className="text-purple-400" />
                Настройки
              </h2>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Время на квиз (минуты)</label>
                  <input
                    type="number"
                    name="timeLimit"
                    value={formData.timeLimit}
                    onChange={handleFormChange}
                    min="1"
                    max="180"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-purple-500/50 transition-all"
                  />
                </div>
                
                <div className="flex items-center">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <div className={`w-12 h-7 rounded-full transition-colors ${formData.isPublic ? 'bg-purple-500' : 'bg-white/10'}`}>
                      <div className={`w-5 h-5 rounded-full bg-white mt-1 transition-transform ${formData.isPublic ? 'translate-x-6' : 'translate-x-1'}`} />
                    </div>
                    <input type="checkbox" name="isPublic" checked={formData.isPublic} onChange={handleFormChange} className="hidden" />
                    <div className="flex items-center gap-2">
                      {formData.isPublic ? <Eye size={18} className="text-purple-400" /> : <EyeOff size={18} className="text-gray-400" />}
                      <span className="text-gray-300">{formData.isPublic ? 'Публичный квиз' : 'Приватный квиз'}</span>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setActiveStep(2)}
                className="px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white font-medium rounded-xl transition-colors flex items-center gap-2"
              >
                Далее: Вопросы
                <ChevronDown className="rotate-[-90deg]" size={18} />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Questions */}
        {activeStep === 2 && (
          <div className="space-y-6">
            {/* Add Question Card */}
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <HelpCircle size={20} className="text-purple-400" />
                {editingQuestionIndex !== null ? `Редактировать вопрос #${editingQuestionIndex + 1}` : 'Добавить вопрос'}
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Текст вопроса</label>
                  <input
                    type="text"
                    name="question"
                    value={currentQuestion.question}
                    onChange={handleQuestionChange}
                    placeholder="Введите вопрос"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-gray-500 outline-none focus:border-purple-500/50 transition-all"
                  />
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Тип вопроса</label>
                    <select
                      name="type"
                      value={currentQuestion.type}
                      onChange={handleQuestionChange}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none cursor-pointer focus:border-purple-500/50 transition-all"
                    >
                      <option value="multiple-choice">Множественный выбор</option>
                      <option value="true-false">Правда/Ложь</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Время на вопрос (сек)</label>
                    <input
                      type="number"
                      name="timeLimit"
                      value={currentQuestion.timeLimit}
                      onChange={handleQuestionChange}
                      min="5"
                      max="120"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-purple-500/50 transition-all"
                    />
                  </div>
                </div>

                {currentQuestion.type === 'multiple-choice' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Варианты ответов</label>
                    <div className="space-y-2">
                      {currentQuestion.options.map((option, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <input
                            type="text"
                            value={option}
                            onChange={(e) => handleOptionChange(index, e.target.value)}
                            placeholder={`Вариант ${index + 1}`}
                            className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-gray-500 outline-none focus:border-purple-500/50 transition-all"
                          />
                          <label className={`flex items-center gap-2 px-4 py-3 rounded-xl cursor-pointer transition-all ${
                            currentQuestion.correctAnswer === index 
                              ? 'bg-green-500/20 border border-green-500/50 text-green-400' 
                              : 'bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10'
                          }`}>
                            <input
                              type="radio"
                              name="correctAnswer"
                              value={index}
                              checked={currentQuestion.correctAnswer === index}
                              onChange={(e) => setCurrentQuestion(prev => ({ ...prev, correctAnswer: parseInt(e.target.value) }))}
                              className="hidden"
                            />
                            <Check size={16} className={currentQuestion.correctAnswer === index ? 'opacity-100' : 'opacity-0'} />
                            <span className="text-sm">Правильный</span>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {currentQuestion.type === 'true-false' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Правильный ответ</label>
                    <div className="flex gap-3">
                      {[{ value: 0, label: 'Правда' }, { value: 1, label: 'Ложь' }].map((item) => (
                        <button
                          key={item.value}
                          type="button"
                          onClick={() => setCurrentQuestion(prev => ({ ...prev, correctAnswer: item.value, options: ['Правда', 'Ложь'] }))}
                          className={`flex-1 px-4 py-3 rounded-xl transition-all ${
                            currentQuestion.correctAnswer === item.value
                              ? 'bg-green-500/20 border border-green-500/50 text-green-400'
                              : 'bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Объяснение (опционально)</label>
                  <textarea
                    name="explanation"
                    value={currentQuestion.explanation}
                    onChange={handleQuestionChange}
                    placeholder="Объяснение правильного ответа"
                    rows={2}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-gray-500 outline-none resize-none focus:border-purple-500/50 transition-all"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={addQuestion}
                    className="flex-1 px-4 py-3 bg-purple-500 hover:bg-purple-600 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    {editingQuestionIndex !== null ? (<><Check size={18} />Сохранить изменения</>) : (<><Plus size={18} />Добавить вопрос</>)}
                  </button>
                  {editingQuestionIndex !== null && (
                    <button type="button" onClick={cancelEditQuestion} className="px-4 py-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl transition-colors">
                      Отмена
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Questions List */}
            {formData.questions.length > 0 && (
              <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <ListChecks size={20} className="text-purple-400" />
                  Вопросы квиза ({formData.questions.length})
                </h2>
                
                <div className="space-y-3">
                  {formData.questions.map((question, index) => (
                    <div key={index} className={`p-4 rounded-xl transition-all ${editingQuestionIndex === index ? 'bg-purple-500/20 border border-purple-500/50' : 'bg-white/5 border border-white/10'}`}>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <span className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400 font-medium shrink-0">{index + 1}</span>
                          <div className="min-w-0 flex-1">
                            <p className="text-white font-medium truncate">{question.question}</p>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="text-xs px-2 py-1 rounded-md bg-white/10 text-gray-400">{question.type === 'multiple-choice' ? 'Выбор' : 'Да/Нет'}</span>
                              <span className="text-xs text-gray-500 flex items-center gap-1"><Clock size={12} />{question.timeLimit}с</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button type="button" onClick={() => editQuestion(index)} disabled={editingQuestionIndex !== null} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors disabled:opacity-50">
                            <Edit2 size={16} />
                          </button>
                          <button type="button" onClick={() => removeQuestion(index)} className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Navigation & Submit */}
            <div className="flex flex-col sm:flex-row gap-3 justify-between">
              <button type="button" onClick={() => setActiveStep(1)} className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2">
                <ChevronDown className="rotate-90" size={18} />
                Назад
              </button>
              
              <div className="flex gap-3">
                <button type="button" onClick={() => navigate(`/quiz/${id}`)} className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl transition-colors">
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={loading || formData.questions.length === 0}
                  className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90 disabled:opacity-50 text-white font-medium rounded-xl transition-all flex items-center gap-2"
                >
                  {loading ? (<><Loader2 size={18} className="animate-spin" />Сохранение...</>) : (<><Save size={18} />Сохранить изменения</>)}
                </button>
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default EditQuiz;
