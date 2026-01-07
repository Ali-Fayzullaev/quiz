import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { quizAPI } from '../../services/api';

const QuizStats = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStats();
  }, [id]);

  const fetchStats = async () => {
    try {
      const response = await quizAPI.getStats(id);
      setStats(response.data.data);
    } catch (err) {
      console.error('Ошибка загрузки статистики:', err);
      if (err.response?.status === 403) {
        setError('У вас нет доступа к статистике этого квиза');
      } else {
        setError('Ошибка загрузки статистики');
      }
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    if (!seconds) return '0 сек';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins > 0) {
      return `${mins} мин ${secs} сек`;
    }
    return `${secs} сек`;
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="quiz-stats-container">
        <div className="loading">Загрузка статистики...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="quiz-stats-container">
        <div className="error-message">{error}</div>
        <button onClick={() => navigate('/my-quizzes')} className="back-btn">
          ← Назад к моим квизам
        </button>
      </div>
    );
  }

  if (!stats) return null;

  const { quiz, statistics, scoreDistribution, topResults, recentResults } = stats;

  return (
    <div className="quiz-stats-container">
      <div className="stats-header">
        <button onClick={() => navigate('/my-quizzes')} className="back-btn">
          ← Назад
        </button>
        <h1>Статистика: {quiz.title}</h1>
      </div>

      {/* Основная статистика */}
      <div className="stats-overview">
        <div className="stat-card">
          <div className="stat-icon">👁️</div>
          <div className="stat-value">{quiz.views || 0}</div>
          <div className="stat-label">Просмотров</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🎮</div>
          <div className="stat-value">{statistics.totalAttempts}</div>
          <div className="stat-label">Прохождений</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-value">{statistics.passedCount}</div>
          <div className="stat-label">Прошли</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">❌</div>
          <div className="stat-value">{statistics.failedCount}</div>
          <div className="stat-label">Не прошли</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-value">{statistics.passRate}%</div>
          <div className="stat-label">Успешность</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⭐</div>
          <div className="stat-value">{statistics.averageScore}%</div>
          <div className="stat-label">Средний балл</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⏱️</div>
          <div className="stat-value">{formatTime(statistics.averageTime)}</div>
          <div className="stat-label">Среднее время</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">❤️</div>
          <div className="stat-value">{quiz.likes || 0}</div>
          <div className="stat-label">Лайков</div>
        </div>
      </div>

      {/* Распределение оценок */}
      <div className="stats-section">
        <h2>Распределение результатов</h2>
        <div className="score-distribution">
          <div className="distribution-bar">
            <div className="bar-segment excellent" style={{ width: `${statistics.totalAttempts ? (scoreDistribution.excellent / statistics.totalAttempts) * 100 : 0}%` }}>
              <span>Отлично (90-100%)</span>
            </div>
          </div>
          <div className="distribution-legend">
            <span className="legend-item excellent">🏆 Отлично: {scoreDistribution.excellent}</span>
            <span className="legend-item good">👍 Хорошо: {scoreDistribution.good}</span>
            <span className="legend-item average">😐 Средне: {scoreDistribution.average}</span>
            <span className="legend-item poor">👎 Плохо: {scoreDistribution.poor}</span>
          </div>
        </div>
      </div>

      {/* Топ результатов */}
      {topResults.length > 0 && (
        <div className="stats-section">
          <h2>🏆 Топ-10 лучших результатов</h2>
          <div className="results-table">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Пользователь</th>
                  <th>Баллы</th>
                  <th>Процент</th>
                  <th>Время</th>
                  <th>Дата</th>
                </tr>
              </thead>
              <tbody>
                {topResults.map((result, index) => (
                  <tr key={result._id} className={index < 3 ? `top-${index + 1}` : ''}>
                    <td className="rank">
                      {index === 0 && '🥇'}
                      {index === 1 && '🥈'}
                      {index === 2 && '🥉'}
                      {index > 2 && index + 1}
                    </td>
                    <td className="user">
                      {result.user?.username || 'Аноним'}
                    </td>
                    <td>{result.score}/{result.maxPossibleScore}</td>
                    <td className="percentage">{result.percentage.toFixed(1)}%</td>
                    <td>{formatTime(result.timeSpent)}</td>
                    <td>{formatDate(result.endTime || result.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Последние прохождения */}
      {recentResults.length > 0 && (
        <div className="stats-section">
          <h2>📋 Последние прохождения</h2>
          <div className="recent-results">
            {recentResults.map((result) => (
              <div key={result._id} className={`result-card ${result.passed ? 'passed' : 'failed'}`}>
                <div className="result-user">
                  <span className="username">{result.user?.username || 'Аноним'}</span>
                  <span className="date">{formatDate(result.completedAt)}</span>
                </div>
                <div className="result-details">
                  <span className="score">
                    {result.percentage.toFixed(0)}%
                    {result.passed ? ' ✅' : ' ❌'}
                  </span>
                  <span className="answers">
                    ✓ {result.correctAnswers} / ✗ {result.incorrectAnswers}
                  </span>
                  <span className="time">⏱️ {formatTime(result.timeSpent)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {statistics.totalAttempts === 0 && (
        <div className="no-data">
          <div className="no-data-icon">📊</div>
          <h3>Пока нет данных</h3>
          <p>Статистика появится после первого прохождения квиза</p>
        </div>
      )}
    </div>
  );
};

export default QuizStats;
