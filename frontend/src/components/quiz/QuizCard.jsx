import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { quizAPI } from '../../services/api';
import { Heart, Play, Edit3, Trash2, Clock, HelpCircle, Eye, Users, X } from 'lucide-react';

// Функция для генерации цвета на основе имени пользователя
const getAvatarColor = (username) => {
  const colors = [
    'from-pink-500 to-rose-500',
    'from-violet-500 to-purple-500',
    'from-blue-500 to-cyan-500',
    'from-emerald-500 to-teal-500',
    'from-amber-500 to-orange-500',
    'from-red-500 to-pink-500',
  ];
  if (!username) return colors[0];
  const index = username.charCodeAt(0) % colors.length;
  return colors[index];
};

const getCategoryIcon = (category) => {
  const icons = {
    'general': '🎯',
    'science': '🔬',
    'history': '📜',
    'geography': '🌍',
    'sports': '⚽',
    'entertainment': '🎬',
    'art': '🎨',
    'literature': '📖',
    'music': '🎵',
    'movies': '🎥',
    'technology': '💻',
    'nature': '🌿',
    'food': '🍕',
    'gaming': '🎮',
    'anime': '🎌',
  };
  return icons[category] || '📚';
};

const QuizCard = ({ quiz, viewMode = 'grid', onDelete }) => {
  const navigate = useNavigate();
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(quiz.likes?.length || 0);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const userId = currentUser.id || currentUser._id;
  const creatorId = quiz.creator?._id || quiz.creator?.id || quiz.creator;
  const isOwner = userId && creatorId && userId === creatorId;

  const handleLike = async (e) => {
    e.stopPropagation();
    try {
      await quizAPI.toggleLike(quiz._id);
      setLiked(!liked);
      setLikesCount(prev => liked ? prev - 1 : prev + 1);
    } catch (err) {
      console.error('Ошибка лайка:', err);
    }
  };

  const handleStartQuiz = () => {
    navigate(`/quiz/${quiz._id}`);
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    navigate(`/edit-quiz/${quiz._id}`);
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await quizAPI.deleteQuiz(quiz._id);
      if (onDelete) {
        onDelete(quiz._id);
      }
    } catch (err) {
      console.error('Ошибка удаления:', err);
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const getDifficultyStyle = (difficulty) => {
    const styles = {
      'beginner': 'bg-green-500/20 text-green-400 border-green-500/30',
      'easy': 'bg-green-500/20 text-green-400 border-green-500/30',
      'intermediate': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      'medium': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      'advanced': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      'hard': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      'expert': 'bg-red-500/20 text-red-400 border-red-500/30',
    };
    return styles[difficulty] || 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  };

  const getDifficultyText = (difficulty) => {
    const texts = {
      'beginner': 'Начинающий',
      'easy': 'Легкий',
      'intermediate': 'Средний',
      'medium': 'Средний',
      'advanced': 'Продвинутый',
      'hard': 'Сложный',
      'expert': 'Эксперт',
    };
    return texts[difficulty] || difficulty;
  };

  // List view
  if (viewMode === 'list') {
    return (
      <div 
        onClick={handleStartQuiz}
        className="group flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10 
                   hover:bg-white/10 hover:border-purple-500/30 cursor-pointer transition-all"
      >
        {/* Thumbnail */}
        <div className="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gradient-to-br from-purple-500/20 to-pink-500/20">
          {quiz.thumbnail ? (
            <img src={quiz.thumbnail} alt={quiz.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-3xl">
              {getCategoryIcon(quiz.category)}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-white truncate group-hover:text-purple-400 transition-colors">
            {quiz.title}
          </h3>
          <p className="text-sm text-gray-400 line-clamp-1 mt-1">{quiz.description}</p>
          <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <HelpCircle size={12} />
              {quiz.questions?.length || 0}
            </span>
            <span className="flex items-center gap-1">
              <Clock size={12} />
              {quiz.timeLimit || '∞'} мин
            </span>
            <span className={`px-2 py-0.5 rounded-full border ${getDifficultyStyle(quiz.difficulty)}`}>
              {getDifficultyText(quiz.difficulty)}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleLike}
            className={`p-2 rounded-lg transition-colors ${
              liked ? 'bg-pink-500/20 text-pink-400' : 'hover:bg-white/10 text-gray-400'
            }`}
          >
            <Heart size={18} fill={liked ? 'currentColor' : 'none'} />
          </button>
          <button className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white text-sm font-medium rounded-lg transition-colors">
            Играть
          </button>
        </div>
      </div>
    );
  }

  // Grid view (default)
  return (
    <div className="group relative rounded-2xl overflow-hidden bg-white/5 border border-white/10 
                    hover:border-purple-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/10">
      {/* Thumbnail */}
      <div className="relative h-44 overflow-hidden">
        {quiz.thumbnail ? (
          <img 
            src={quiz.thumbnail} 
            alt={quiz.title} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
            <span className="text-6xl">{getCategoryIcon(quiz.category)}</span>
          </div>
        )}
        
        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
        
        {/* Category Badge */}
        <div className="absolute top-3 left-3">
          <span className="px-3 py-1 rounded-full bg-black/50 backdrop-blur-sm text-white text-xs font-medium">
            {getCategoryIcon(quiz.category)} {quiz.category}
          </span>
        </div>

        {/* Like Button */}
        <button
          onClick={handleLike}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-sm transition-all ${
            liked 
              ? 'bg-pink-500 text-white' 
              : 'bg-black/50 text-white hover:bg-pink-500'
          }`}
        >
          <Heart size={16} fill={liked ? 'currentColor' : 'none'} />
        </button>

        {/* Play Button Overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={handleStartQuiz}
            className="w-14 h-14 rounded-full bg-purple-500 text-white flex items-center justify-center 
                     shadow-lg shadow-purple-500/50 hover:scale-110 transition-transform"
          >
            <Play size={24} fill="currentColor" className="ml-1" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-bold text-lg text-white line-clamp-1 group-hover:text-purple-400 transition-colors">
          {quiz.title}
        </h3>
        <p className="text-sm text-gray-400 line-clamp-2 mt-1 h-10">
          {quiz.description}
        </p>

        {/* Stats */}
        <div className="flex items-center gap-4 mt-4 text-sm text-gray-500">
          <span className="flex items-center gap-1.5">
            <HelpCircle size={14} />
            {quiz.questions?.length || 0} вопросов
          </span>
          <span className="flex items-center gap-1.5">
            <Clock size={14} />
            {quiz.timeLimit || '∞'} мин
          </span>
        </div>

        {/* Difficulty & Likes */}
        <div className="flex items-center justify-between mt-4">
          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getDifficultyStyle(quiz.difficulty)}`}>
            {getDifficultyText(quiz.difficulty)}
          </span>
          <div className="flex items-center gap-3 text-sm text-gray-400">
            <span className="flex items-center gap-1">
              <Heart size={14} className="text-pink-400" />
              {likesCount}
            </span>
            <span className="flex items-center gap-1">
              <Eye size={14} />
              {quiz.stats?.views || 0}
            </span>
          </div>
        </div>

        {/* Creator */}
        {quiz.creator && (
          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/10">
            <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${getAvatarColor(quiz.creator.username)} 
                          flex items-center justify-center overflow-hidden`}>
              {quiz.creator.profile?.avatar?.url ? (
                <img src={quiz.creator.profile.avatar.url} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-white text-sm font-medium">
                  {quiz.creator.username?.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <span className="text-sm text-gray-400">{quiz.creator.username}</span>
          </div>
        )}

        {/* Owner Actions */}
        {isOwner && (
          <div className="flex gap-2 mt-4">
            <button
              onClick={handleEdit}
              className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg 
                       bg-white/5 hover:bg-white/10 text-gray-300 text-sm transition-colors"
            >
              <Edit3 size={14} />
              Редактировать
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(true); }}
              className="flex items-center justify-center p-2 rounded-lg 
                       bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
            >
              <Trash2 size={14} />
            </button>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
             onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(false); }}>
          <div className="bg-[#1a1a2e] rounded-2xl p-6 max-w-sm w-full border border-white/10"
               onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-bold text-white">Удалить квиз?</h4>
              <button onClick={() => setShowDeleteConfirm(false)} className="text-gray-400 hover:text-white">
                <X size={20} />
              </button>
            </div>
            <p className="text-gray-400 mb-6">
              Вы уверены, что хотите удалить "{quiz.title}"? Это действие нельзя отменить.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                Отмена
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white transition-colors disabled:opacity-50"
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

export default QuizCard;