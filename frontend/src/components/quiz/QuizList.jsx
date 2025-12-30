import { useState, useEffect } from 'react';
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

  useEffect(() => {
    fetchQuizzes();
  }, [filters]);

  const fetchQuizzes = async () => {
    setLoading(true);
    try {
      const response = await quizAPI.getQuizzes(filters);
      setQuizzes(response.data.data.quizzes);
    } catch (err) {
      setError('Ошибка загрузки викторин');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchQuizzes();
  };

  if (loading) return <div className="loading">Загружаем викторины...</div>;
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
            value={filters.search}
            onChange={handleFilterChange}
          />
          <button type="submit">Поиск</button>
        </form>

        <div className="filter-controls">
          <select name="category" value={filters.category} onChange={handleFilterChange}>
            <option value="all">Все категории</option>
            <option value="science">Наука</option>
            <option value="history">История</option>
            <option value="sports">Спорт</option>
            <option value="entertainment">Развлечения</option>
            <option value="geography">География</option>
            <option value="literature">Литература</option>
          </select>

          <select name="difficulty" value={filters.difficulty} onChange={handleFilterChange}>
            <option value="all">Любая сложность</option>
            <option value="easy">Легкая</option>
            <option value="medium">Средняя</option>
            <option value="hard">Сложная</option>
          </select>
        </div>
      </div>

      {/* Список викторин */}
      <div className="quiz-grid">
        {quizzes.length > 0 ? (
          quizzes.map(quiz => (
            <QuizCard key={quiz._id} quiz={quiz} />
          ))
        ) : (
          <p>Викторины не найдены</p>
        )}
      </div>
    </div>
  );
};

export default QuizList;