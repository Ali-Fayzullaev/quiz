import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { quizAPI } from '../../services/api';
import { 
  Plus, Eye, BarChart3, Edit3, Trash2, FileText, 
  Clock, HelpCircle, Play, Loader2, X, Search, Filter
} from 'lucide-react';

const MyQuizzes = () => {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
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
      setError('Ошибка загрузки ваших квизов');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (quizId) => {
    setDeleting(true);
    try {
      await quizAPI.deleteQuiz(quizId);
      setQuizzes(prev => prev.filter(q => q._id !== quizId));
      setDeleteConfirm(null);
    } catch (err) {
      console.error('Ошибка удаления:', err);
    } finally {
      setDeleting(false);
    }
  };

  const getDifficultyStyle = (difficulty) => {
    const styles = {
      'beginner': 'bg-green-500/20 text-green-400',
      'intermediate': 'bg-yellow-500/20 text-yellow-400',
      'advanced': 'bg-orange-500/20 text-orange-400',
      'expert': 'bg-red-500/20 text-red-400',
    };
    return styles[difficulty] || 'bg-gray-500/20 text-gray-400';
  };

  const getDifficultyText = (difficulty) => {
    const texts = {
      'beginner': 'Начинающий',
      'intermediate': 'Средний',
      'advanced': 'Продвинутый',
      'expert': 'Эксперт',
    };
    return texts[difficulty] || difficulty;
  };

  const getStatusStyle = (status) => {
    const styles = {
      'draft': 'bg-gray-500/20 text-gray-400',
      'published': 'bg-green-500/20 text-green-400',
      'archived': 'bg-yellow-500/20 text-yellow-400',
    };
    return styles[status] || 'bg-gray-500/20 text-gray-400';
  };

  const getStatusText = (status) => {
    const texts = {
      'draft': 'Черновик',
      'published': 'Опубликован',
      'archived': 'В архиве',
    };
    return texts[status] || status;
  };

  const getCategoryIcon = (category) => {
    const icons = {
      'general': '🎯', 'science': '🔬', 'history': '📜', 'geography': '🌍',
      'sports': '⚽', 'entertainment': '🎬', 'technology': '💻', 'gaming': '🎮',
      'art': '🎨', 'music': '🎵', 'movies': '🎥', 'anime': '🎌',
    };
    return icons[category] || '📚';
  };

  // Filter quizzes
  const filteredQuizzes = quizzes.filter(quiz => {
    const matchesSearch = quiz.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         quiz.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || quiz.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (!userId) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold flex items-center gap-2">
            <FileText className="text-purple-400" />
            Мои квизы
          </h1>
          <p className="text-gray-400 mt-1">Управляйте своими квизами</p>
        </div>

        <button
          onClick={() => navigate('/create-quiz')}
          className="flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-purple-500 to-pink-500 
                   text-white font-medium rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-purple-500/25"
        >
          <Plus size={20} />
          Создать квиз
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Поиск квизов..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl 
                     text-white placeholder:text-gray-500 outline-none focus:border-purple-500/50 transition-all"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2 p-1 rounded-xl bg-white/5">
          {['all', 'published', 'draft', 'archived'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === status
                  ? 'bg-purple-500 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {status === 'all' ? 'Все' : getStatusText(status)}
            </button>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
          <span className="ml-3 text-gray-400">Загрузка квизов...</span>
        </div>
      ) : filteredQuizzes.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-white/5 flex items-center justify-center">
            <FileText className="w-12 h-12 text-gray-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-300 mb-2">
            {searchQuery || statusFilter !== 'all' ? 'Квизы не найдены' : 'У вас пока нет квизов'}
          </h3>
          <p className="text-gray-500 mb-6">
            {searchQuery || statusFilter !== 'all' 
              ? 'Попробуйте изменить параметры поиска' 
              : 'Создайте свой первый квиз и поделитесь им с друзьями!'
            }
          </p>
          {!searchQuery && statusFilter === 'all' && (
            <button
              onClick={() => navigate('/create-quiz')}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium rounded-xl hover:opacity-90 transition-opacity"
            >
              Создать первый квиз
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredQuizzes.map(quiz => (
            <div 
              key={quiz._id} 
              className="group p-4 lg:p-5 rounded-2xl bg-white/5 border border-white/10 
                       hover:border-purple-500/30 transition-all"
            >
              <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                {/* Quiz Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-3">
                    {/* Thumbnail */}
                    <div className="w-16 h-16 flex-shrink-0 rounded-xl overflow-hidden bg-gradient-to-br from-purple-500/20 to-pink-500/20">
                      {quiz.thumbnail ? (
                        <img src={quiz.thumbnail} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl">
                          {getCategoryIcon(quiz.category)}
                        </div>
                      )}
                    </div>

                    {/* Title & Description */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-lg text-white truncate">{quiz.title}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusStyle(quiz.status)}`}>
                          {getStatusText(quiz.status)}
                        </span>
                      </div>
                      <p className="text-gray-400 text-sm line-clamp-1 mt-1">
                        {quiz.description || 'Нет описания'}
                      </p>

                      {/* Meta */}
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                        <span className={`px-2 py-0.5 rounded-full text-xs ${getDifficultyStyle(quiz.difficulty)}`}>
                          {getDifficultyText(quiz.difficulty)}
                        </span>
                        <span className="flex items-center gap-1">
                          <HelpCircle size={14} />
                          {quiz.questions?.length || 0}
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye size={14} />
                          {quiz.stats?.views || 0}
                        </span>
                        <span className="flex items-center gap-1">
                          <Play size={14} />
                          {quiz.stats?.plays || 0}
                        </span>
                        <span className="hidden sm:flex items-center gap-1">
                          <Clock size={14} />
                          {new Date(quiz.createdAt).toLocaleDateString('ru-RU')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 lg:gap-3">
                  <button
                    onClick={() => navigate(`/quiz/${quiz._id}`)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 
                             text-gray-300 text-sm transition-colors"
                  >
                    <Eye size={16} />
                    <span className="hidden sm:inline">Смотреть</span>
                  </button>
                  <button
                    onClick={() => navigate(`/quiz/${quiz._id}/stats`)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 
                             text-gray-300 text-sm transition-colors"
                  >
                    <BarChart3 size={16} />
                    <span className="hidden sm:inline">Статистика</span>
                  </button>
                  <button
                    onClick={() => navigate(`/edit-quiz/${quiz._id}`)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 
                             text-purple-400 text-sm transition-colors"
                  >
                    <Edit3 size={16} />
                    <span className="hidden sm:inline">Редактировать</span>
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(quiz)}
                    className="flex items-center justify-center p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 
                             text-red-400 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Stats Summary */}
      {!loading && quizzes.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-4 rounded-2xl bg-white/5 border border-white/10">
          <div className="text-center">
            <p className="text-2xl font-bold text-white">{quizzes.length}</p>
            <p className="text-sm text-gray-400">Всего квизов</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-400">
              {quizzes.filter(q => q.status === 'published').length}
            </p>
            <p className="text-sm text-gray-400">Опубликовано</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-400">
              {quizzes.reduce((acc, q) => acc + (q.stats?.plays || 0), 0)}
            </p>
            <p className="text-sm text-gray-400">Всего игр</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-pink-400">
              {quizzes.reduce((acc, q) => acc + (q.stats?.views || 0), 0)}
            </p>
            <p className="text-sm text-gray-400">Просмотров</p>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteConfirm && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setDeleteConfirm(null)}
        >
          <div 
            className="bg-[#1a1a2e] rounded-2xl p-6 max-w-md w-full border border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-xl font-bold text-white">Удалить квиз?</h4>
              <button onClick={() => setDeleteConfirm(null)} className="text-gray-400 hover:text-white">
                <X size={24} />
              </button>
            </div>
            <p className="text-gray-400 mb-2">
              Вы уверены, что хотите удалить "<span className="text-white font-medium">{deleteConfirm.title}</span>"?
            </p>
            <p className="text-red-400 text-sm mb-6">
              ⚠️ Это действие нельзя отменить. Все результаты и статистика будут потеряны.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium transition-colors"
              >
                Отмена
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm._id)}
                disabled={deleting}
                className="flex-1 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-medium transition-colors disabled:opacity-50"
              >
                {deleting ? 'Удаление...' : 'Удалить'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyQuizzes;
