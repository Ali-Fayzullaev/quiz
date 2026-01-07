import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { userAPI } from '../../services/api';
import StatsCards from './StatsCards';
import QuizChart from './QuizChart';
import RecentActivity from './RecentActivity';
import QuickActions from './QuickActions';
import TopQuizzes from './TopQuizzes';

const Dashboard = () => {
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [likedQuizzes, setLikedQuizzes] = useState([]);
  const [recentResults, setRecentResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      const [profileRes, statsRes, quizzesRes, likedRes, resultsRes] = await Promise.allSettled([
        userAPI.getProfile(),
        userAPI.getUserStats(),
        userAPI.getUserQuizzes(),
        userAPI.getLikedQuizzes(),
        userAPI.getUserResults()
      ]);

      if (profileRes.status === 'fulfilled') {
        setUser(profileRes.value.data.data?.user || profileRes.value.data.data);
      }
      if (statsRes.status === 'fulfilled') {
        setStats(statsRes.value.data.data);
      }
      if (quizzesRes.status === 'fulfilled') {
        setQuizzes(quizzesRes.value.data.data?.quizzes || []);
      }
      if (likedRes.status === 'fulfilled') {
        setLikedQuizzes(likedRes.value.data.data?.quizzes || []);
      }
      if (resultsRes.status === 'fulfilled') {
        setRecentResults(resultsRes.value.data.data?.results || []);
      }
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
          <p className={darkMode ? 'text-gray-400' : 'text-gray-500'}>Загрузка...</p>
        </div>
      </div>
    );
  }

  // Подготовка данных для графиков
  const chartData = recentResults.slice(0, 7).map((result) => ({
    name: new Date(result.completedAt || result.createdAt).toLocaleDateString('ru-RU', { day: '2-digit', month: 'short' }),
    score: result.percentage || result.score || 0,
    quizzes: 1
  })).reverse();

  const totalViews = quizzes.reduce((acc, q) => acc + (q.stats?.views || 0), 0);
  const totalPlays = quizzes.reduce((acc, q) => acc + (q.stats?.plays || 0), 0);

  const savedUser = JSON.parse(localStorage.getItem('user') || '{}');
  const displayName = user?.profile?.firstName || savedUser?.username || 'Пользователь';

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h1 className={`text-2xl lg:text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Обзор</h1>
        <p className={`mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Добро пожаловать, {displayName}! 👋</p>
      </div>

      {/* Stats Cards */}
      <StatsCards 
        quizzesCount={quizzes.length}
        completedCount={stats?.quizzesCompleted || user?.gameStats?.quizzesCompleted || 0}
        totalPoints={stats?.totalPoints || user?.gameStats?.totalPoints || 0}
        likedCount={likedQuizzes.length}
        totalViews={totalViews}
        totalPlays={totalPlays}
        darkMode={darkMode}
      />

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="xl:col-span-2">
          <QuizChart data={chartData} quizzes={quizzes} darkMode={darkMode} />
        </div>

        {/* Top Quizzes */}
        <div>
          <TopQuizzes quizzes={quizzes} darkMode={darkMode} />
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="xl:col-span-2">
          <RecentActivity results={recentResults} darkMode={darkMode} />
        </div>

        {/* Quick Actions */}
        <div>
          <QuickActions likedQuizzes={likedQuizzes} darkMode={darkMode} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
