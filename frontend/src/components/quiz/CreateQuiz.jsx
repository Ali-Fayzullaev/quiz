import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  ToggleLeft,
  ChevronDown,
  FileText,
  Eye,
  EyeOff,
  Sparkles
} from 'lucide-react';
import { quizAPI } from '../../services/api';

const CreateQuiz = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
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
  const [activeStep, setActiveStep] = useState(1);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
  }, []);

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
    setFormData(prev => ({
      ...prev,
      questions: [...prev.questions, newQuestion]
    }));

    setCurrentQuestion({
      question: '',
      type: 'multiple-choice',
      options: ['', '', '', ''],
      correctAnswer: 0,
      explanation: '',
      timeLimit: 30
    });

    setError('');
    setSuccess('Вопрос добавлен!');
    setTimeout(() => setSuccess(''), 2000);
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
      // Преобразуем isPublic в visibility для backend
      const submitData = {
        ...formData,
        visibility: formData.isPublic ? 'public' : 'private'
      };
      delete submitData.isPublic; // Убираем isPublic, backend использует visibility
      
      console.log('Submitting quiz with visibility:', submitData.visibility);
      
      const response = await quizAPI.createQuiz(submitData);
      setSuccess('Квиз успешно создан!');
      
      const quizId = response.data?.data?.quiz?._id || response.data?.quiz?._id;
      
      setTimeout(() => {
        if (quizId) {
          window.location.href = `/quiz/${quizId}`;
        } else {
          window.location.href = '/quizzes';
        }
      }, 2000);
      
    } catch (err) {
      console.error('Ошибка создания квиза:', err.response?.data || err);
      
      if (err.response?.status === 401) {
        setError('Сессия истекла. Пожалуйста, войдите снова.');
        setIsAuthenticated(false);
      } else {
        setError(err.response?.data?.error || err.response?.data?.message || 'Ошибка при создании квиза');
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
    { value: 'beginner', label: 'Начинающий', color: 'text-green-400 bg-green-500/10' },
    { value: 'intermediate', label: 'Средний', color: 'text-yellow-400 bg-yellow-500/10' },
    { value: 'advanced', label: 'Продвинутый', color: 'text-orange-400 bg-orange-500/10' },
    { value: 'expert', label: 'Эксперт', color: 'text-red-400 bg-red-500/10' }
  ];

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center p-8 rounded-2xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 max-w-md shadow-lg dark:shadow-none">
          <div className="w-16 h-16 rounded-2xl bg-purple-500/20 flex items-center justify-center mx-auto mb-4">
            <Sparkles className="text-purple-500 dark:text-purple-400" size={32} />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Требуется авторизация</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">Для создания квиза необходимо войти в систему</p>
          <div className="flex gap-3 justify-center">
            <button 
              onClick={() => navigate('/login')} 
              className="px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white font-medium rounded-xl transition-colors"
            >
              Войти
            </button>
            <button 
              onClick={() => navigate('/register')} 
              className="px-6 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-white/10 dark:hover:bg-white/20 text-gray-700 dark:text-white font-medium rounded-xl transition-colors"
            >
              Регистрация
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">Создать квиз</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Создайте свой уникальный квиз</p>
        </div>
        
        {/* Progress Steps */}
        <div className="flex items-center gap-2">
          {[1, 2].map((step) => (
            <button
              key={step}
              onClick={() => setActiveStep(step)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors ${
                activeStep === step
                  ? 'bg-purple-500/20 text-purple-600 dark:text-purple-400'
                  : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10'
              }`}
            >
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium ${
                activeStep === step ? 'bg-purple-500 text-white' : 'bg-gray-200 dark:bg-white/10 text-gray-600 dark:text-gray-400'
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
        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400">
          <AlertCircle size={20} />
          <span className="flex-1">{error}</span>
          <button onClick={() => setError('')} className="hover:text-red-500 dark:hover:text-red-300">
            <X size={18} />
          </button>
        </div>
      )}
      
      {success && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 text-green-600 dark:text-green-400">
          <Check size={20} />
          <span className="flex-1">{success}</span>
          <button onClick={() => setSuccess('')} className="hover:text-green-500 dark:hover:text-green-300">
            <X size={18} />
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Step 1: Quiz Info */}
        {activeStep === 1 && (
          <div className="space-y-6">
            {/* Basic Info Card */}
            <div className="p-6 rounded-2xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 shadow-sm dark:shadow-none">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <FileText size={20} className="text-purple-500 dark:text-purple-400" />
                Основная информация
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Название квиза *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleFormChange}
                    placeholder="Введите название квиза"
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl 
                             text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 outline-none
                             focus:border-purple-500 dark:focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Описание
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleFormChange}
                    placeholder="Опишите ваш квиз..."
                    rows={3}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl 
                             text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 outline-none resize-none
                             focus:border-purple-500 dark:focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Category & Settings */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Category */}
              <div className="p-6 rounded-2xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 shadow-sm dark:shadow-none">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Категория</h2>
                <div className="grid grid-cols-2 gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, category: cat.value }))}
                      className={`flex items-center gap-2 px-4 py-3 rounded-xl text-left transition-all ${
                        formData.category === cat.value
                          ? 'bg-purple-500/20 border-purple-500 dark:border-purple-500/50 text-purple-600 dark:text-purple-400 border'
                          : 'bg-gray-50 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 border border-transparent'
                      }`}
                    >
                      <span>{cat.icon}</span>
                      <span className="text-sm font-medium">{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Settings */}
              <div className="p-6 rounded-2xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 shadow-sm dark:shadow-none">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Настройки</h2>
                
                <div className="space-y-4">
                  {/* Difficulty */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Сложность</label>
                    <div className="flex flex-wrap gap-2">
                      {difficulties.map((diff) => (
                        <button
                          key={diff.value}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, difficulty: diff.value }))}
                          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                            formData.difficulty === diff.value
                              ? diff.color + ' ring-2 ring-current'
                              : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10'
                          }`}
                        >
                          {diff.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Time Limit */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <Clock size={16} />
                      Время на квиз (минут)
                    </label>
                    <input
                      type="number"
                      name="timeLimit"
                      value={formData.timeLimit}
                      onChange={handleFormChange}
                      min="1"
                      max="180"
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl 
                               text-gray-900 dark:text-white outline-none
                               focus:border-purple-500 dark:focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
                    />
                  </div>

                  {/* Public Toggle */}
                  <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-white/5">
                    <div className="flex items-center gap-3">
                      {formData.isPublic ? <Eye size={20} className="text-green-500 dark:text-green-400" /> : <EyeOff size={20} className="text-gray-400" />}
                      <div>
                        <p className="text-gray-900 dark:text-white font-medium">Публичный квиз</p>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">Виден всем пользователям</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        name="isPublic"
                        checked={formData.isPublic}
                        onChange={handleFormChange}
                        className="sr-only peer" 
                      />
                      <div className="w-11 h-6 bg-gray-200 dark:bg-white/10 peer-focus:outline-none rounded-full peer 
                                    peer-checked:after:translate-x-full peer-checked:bg-purple-500
                                    after:content-[''] after:absolute after:top-[2px] after:left-[2px] 
                                    after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all">
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Next Step Button */}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setActiveStep(2)}
                className="flex items-center gap-2 px-6 py-3 bg-purple-500 hover:bg-purple-600 
                         text-white font-medium rounded-xl transition-colors"
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
            <div className="p-6 rounded-2xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 shadow-sm dark:shadow-none">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <HelpCircle size={20} className="text-purple-500 dark:text-purple-400" />
                Добавить вопрос
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Текст вопроса *
                  </label>
                  <input
                    type="text"
                    name="question"
                    value={currentQuestion.question}
                    onChange={handleQuestionChange}
                    placeholder="Введите вопрос"
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl 
                             text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 outline-none
                             focus:border-purple-500 dark:focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Тип вопроса</label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setCurrentQuestion(prev => ({ ...prev, type: 'multiple-choice', options: ['', '', '', ''] }))}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-all ${
                          currentQuestion.type === 'multiple-choice'
                            ? 'bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-500 dark:border-purple-500/50'
                            : 'bg-gray-50 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 border border-transparent'
                        }`}
                      >
                        <ListChecks size={18} />
                        Выбор
                      </button>
                      <button
                        type="button"
                        onClick={() => setCurrentQuestion(prev => ({ ...prev, type: 'true-false', options: ['Правда', 'Ложь'], correctAnswer: 0 }))}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-all ${
                          currentQuestion.type === 'true-false'
                            ? 'bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-500 dark:border-purple-500/50'
                            : 'bg-gray-50 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 border border-transparent'
                        }`}
                      >
                        <ToggleLeft size={18} />
                        Да/Нет
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <Clock size={16} />
                      Время (секунд)
                    </label>
                    <input
                      type="number"
                      name="timeLimit"
                      value={currentQuestion.timeLimit}
                      onChange={handleQuestionChange}
                      min="5"
                      max="120"
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl 
                               text-gray-900 dark:text-white outline-none
                               focus:border-purple-500 dark:focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
                    />
                  </div>
                </div>

                {/* Options for Multiple Choice */}
                {currentQuestion.type === 'multiple-choice' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Варианты ответов (выберите правильный)
                    </label>
                    <div className="space-y-2">
                      {currentQuestion.options.map((option, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => setCurrentQuestion(prev => ({ ...prev, correctAnswer: index }))}
                            className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${
                              currentQuestion.correctAnswer === index
                                ? 'bg-green-500 text-white'
                                : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10'
                            }`}
                          >
                            {currentQuestion.correctAnswer === index ? <Check size={18} /> : index + 1}
                          </button>
                          <input
                            type="text"
                            value={option}
                            onChange={(e) => handleOptionChange(index, e.target.value)}
                            placeholder={`Вариант ${index + 1}`}
                            className="flex-1 px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl 
                                     text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 outline-none
                                     focus:border-purple-500 dark:focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Options for True/False */}
                {currentQuestion.type === 'true-false' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Правильный ответ
                    </label>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setCurrentQuestion(prev => ({ ...prev, correctAnswer: 0, options: ['Правда', 'Ложь'] }))}
                        className={`flex-1 py-3 rounded-xl font-medium transition-all ${
                          currentQuestion.correctAnswer === 0
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10'
                        }`}
                      >
                        ✓ Правда
                      </button>
                      <button
                        type="button"
                        onClick={() => setCurrentQuestion(prev => ({ ...prev, correctAnswer: 1, options: ['Правда', 'Ложь'] }))}
                        className={`flex-1 py-3 rounded-xl font-medium transition-all ${
                          currentQuestion.correctAnswer === 1
                            ? 'bg-red-500 text-white'
                            : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10'
                        }`}
                      >
                        ✗ Ложь
                      </button>
                    </div>
                  </div>
                )}

                {/* Explanation */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Объяснение (опционально)
                  </label>
                  <textarea
                    name="explanation"
                    value={currentQuestion.explanation}
                    onChange={handleQuestionChange}
                    placeholder="Объяснение правильного ответа..."
                    rows={2}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl 
                             text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 outline-none resize-none
                             focus:border-purple-500 dark:focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
                  />
                </div>

                <button
                  type="button"
                  onClick={addQuestion}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 
                           bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90
                           text-white font-medium rounded-xl transition-opacity"
                >
                  <Plus size={18} />
                  Добавить вопрос
                </button>
              </div>
            </div>

            {/* Questions List */}
            {formData.questions.length > 0 && (
              <div className="p-6 rounded-2xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 shadow-sm dark:shadow-none">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Добавленные вопросы ({formData.questions.length})
                </h2>
                
                <div className="space-y-3">
                  {formData.questions.map((question, index) => (
                    <div 
                      key={index} 
                      className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 dark:bg-white/5 group"
                    >
                      <span className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-600 dark:text-purple-400 
                                     flex items-center justify-center font-bold flex-shrink-0">
                        {index + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-900 dark:text-white font-medium truncate">{question.question}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs px-2 py-1 rounded-full bg-gray-200 dark:bg-white/10 text-gray-600 dark:text-gray-400">
                            {question.type === 'multiple-choice' ? 'Выбор' : 'Да/Нет'}
                          </span>
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <Clock size={12} />
                            {question.timeLimit}с
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeQuestion(index)}
                        className="p-2 text-gray-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 
                                 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-between gap-4">
              <button
                type="button"
                onClick={() => setActiveStep(1)}
                className="flex items-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-white/10 dark:hover:bg-white/20 
                         text-gray-700 dark:text-white font-medium rounded-xl transition-colors"
              >
                <ChevronDown className="rotate-90" size={18} />
                Назад
              </button>
              
              <button
                type="submit"
                disabled={loading || formData.questions.length === 0}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 
                         hover:opacity-90 text-white font-medium rounded-xl transition-opacity 
                         disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    Создание...
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    Создать квиз
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default CreateQuiz;