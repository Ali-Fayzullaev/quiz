import { useState, useEffect, useCallback } from 'react';
import { quizAPI } from '../../services/api';
import QuizCard from './QuizCard';

const QuizList = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    search: '',
    category: 'all',
    difficulty: 'all',
  });
  const [searchInput, setSearchInput] = useState('');

  // Функция для подготовки параметров запроса
  const prepareQueryParams = useCallback(() => {
    const params = {};
    
    // Добавляем только непустые параметры и не 'all'
    if (filters.search && filters.search.trim()) {
      params.search = filters.search.trim();
    }
    if (filters.category && filters.category !== 'all') {
      params.category = filters.category;
    }
    if (filters.difficulty && filters.difficulty !== 'all') {
      params.difficulty = filters.difficulty;
    }
    
    return params;
  }, [filters]);

  const fetchQuizzes = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = prepareQueryParams();
      console.log('Fetching quizzes with params:', params);
      const response = await quizAPI.getQuizzes(params);
      const data = response.data.data;
      setQuizzes(data.quizzes || []);
    } catch (err) {
      setError('Ошибка загрузки викторин');
      console.error('Quiz fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [prepareQueryParams]);

  // Загружаем квизы при изменении любого фильтра
  useEffect(() => {
    fetchQuizzes();
  }, [filters.category, filters.difficulty, filters.search, fetchQuizzes]);

  // Дебаунс для поиска - не запускаем запрос при каждом нажатии клавиши
  useEffect(() => {
    // Устанавливаем таймер для поиска
    const timer = setTimeout(() => {
      setFilters(prev => {
        if (prev.search !== searchInput) {
          return { ...prev, search: searchInput };
        }
        return prev;
      });
    }, 500);
    
    return () => clearTimeout(timer);
  }, [searchInput]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'search') {
      setSearchInput(value);
    } else {
      setFilters(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // Сразу применяем поиск
    setFilters(prev => ({ ...prev, search: searchInput }));
  };

  if (error) return <div className="error">{error}</div>;

  return (
    <div className="quiz-list-container">
      <h1>Викторины</h1>
      
      {/* Фильтры и поиск */}
      <div className="quiz-filters">
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            name="search"
            placeholder="Поиск викторин..."
            value={searchInput}
            onChange={handleFilterChange}
          />
          <button type="submit">Поиск</button>
        </form>

        <div className="filter-controls">
          <select name="category" value={filters.category} onChange={handleFilterChange}>
            <option value="all">Все категории</option>
            <option value="general">Общие</option>
            <option value="science">Наука</option>
            <option value="history">История</option>
            <option value="geography">География</option>
            <option value="sports">Спорт</option>
            <option value="entertainment">Развлечения</option>
            <option value="art">Искусство</option>
            <option value="literature">Литература</option>
            <option value="music">Музыка</option>
            <option value="movies">Кино</option>
            <option value="technology">Технологии</option>
            <option value="nature">Природа</option>
            <option value="food">Еда</option>
            <option value="travel">Путешествия</option>
            <option value="languages">Языки</option>
            <option value="mathematics">Математика</option>
            <option value="business">Бизнес</option>
            <option value="gaming">Игры</option>
            <option value="anime">Аниме</option>
            <option value="custom">Другое</option>
          </select>

          <select name="difficulty" value={filters.difficulty} onChange={handleFilterChange}>
            <option value="all">Любая сложность</option>
            <option value="beginner">Начинающий</option>
            <option value="intermediate">Средний</option>
            <option value="advanced">Продвинутый</option>
            <option value="expert">Эксперт</option>
          </select>
        </div>
      </div>

      {/* Индикатор загрузки при фильтрации */}
      {loading && <div className="loading-overlay">Загружаем...</div>}

      {/* Список викторин */}
      <div className="quiz-grid">
        {quizzes.length > 0 ? (
          quizzes.map(quiz => (
            <QuizCard 
              key={quiz._id} 
              quiz={quiz} 
              onDelete={(deletedId) => {
                setQuizzes(prev => prev.filter(q => q._id !== deletedId));
              }}
            />
          ))
        ) : (
          <p>Викторины не найдены</p>
        )}
      </div>
    </div>
  );
};

export default QuizList;