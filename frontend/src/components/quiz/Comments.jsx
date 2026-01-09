import { useState, useEffect } from 'react';
import { commentAPI } from '../../services/api';
import { useTheme } from '../../context/ThemeContext';
import { Heart, MessageCircle, Trash2, Send, User, Loader2 } from 'lucide-react';

// Функция для генерации цвета на основе имени пользователя
const getAvatarColor = (username) => {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
    '#F8B500', '#00CED1', '#FF69B4', '#32CD32', '#FFD700'
  ];
  if (!username) return colors[0];
  const index = username.charCodeAt(0) % colors.length;
  return colors[index];
};

const CommentItem = ({ 
  comment, 
  isReply = false, 
  userId, 
  isLoggedIn, 
  replyTo, 
  replyText, 
  submitting,
  darkMode,
  onReplyTextChange,
  onSetReplyTo,
  onReply,
  onLike,
  onDelete,
  formatDate
}) => {
  const canDelete = userId === (comment.user?._id || comment.user?.id || comment.user);
  const avatarUrl = comment.user?.profile?.avatar?.url || comment.user?.profile?.avatar;
  const username = comment.user?.username || 'Аноним';
  
  return (
    <div className={`${isReply ? 'ml-8 mt-3' : 'mb-4'}`}>
      <div className={`p-4 rounded-xl ${
        darkMode 
          ? 'bg-white/5 border border-white/10' 
          : 'bg-gray-50 border border-gray-100'
      }`}>
        {/* Header */}
        <div className="flex items-center gap-3 mb-3">
          <div 
            className="w-8 h-8 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0"
            style={!avatarUrl ? { backgroundColor: getAvatarColor(username) } : {}}
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="text-white text-sm font-medium">{username.charAt(0).toUpperCase()}</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className={`font-medium text-sm truncate ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {username}
            </div>
            <div className={`text-xs ${darkMode ? 'text-white/40' : 'text-gray-400'}`}>
              {formatDate(comment.createdAt)}
              {comment.isEdited && <span className="ml-1">(изм.)</span>}
            </div>
          </div>
        </div>
        
        {/* Text */}
        <p className={`text-sm leading-relaxed mb-3 ${darkMode ? 'text-white/80' : 'text-gray-700'}`}>
          {comment.text}
        </p>
        
        {/* Actions */}
        <div className="flex items-center gap-3">
          <button 
            className={`flex items-center gap-1.5 text-sm transition-colors ${
              comment.isLiked 
                ? 'text-pink-500' 
                : darkMode ? 'text-white/40 hover:text-pink-400' : 'text-gray-400 hover:text-pink-500'
            }`}
            onClick={() => onLike(comment._id)}
            disabled={!isLoggedIn}
          >
            <Heart className={`w-4 h-4 ${comment.isLiked ? 'fill-current' : ''}`} />
            <span>{comment.likesCount || 0}</span>
          </button>
          
          {!isReply && isLoggedIn && (
            <button 
              className={`flex items-center gap-1.5 text-sm transition-colors ${
                darkMode ? 'text-white/40 hover:text-purple-400' : 'text-gray-400 hover:text-purple-500'
              }`}
              onClick={() => onSetReplyTo(replyTo === comment._id ? null : comment._id)}
            >
              <MessageCircle className="w-4 h-4" />
              <span>Ответить</span>
            </button>
          )}
          
          {canDelete && (
            <button 
              className={`flex items-center gap-1.5 text-sm transition-colors ${
                darkMode ? 'text-white/40 hover:text-red-400' : 'text-gray-400 hover:text-red-500'
              }`}
              onClick={() => onDelete(comment._id)}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Reply Form */}
      {replyTo === comment._id && (
        <div className={`mt-3 ml-8 p-3 rounded-xl ${darkMode ? 'bg-white/5' : 'bg-gray-50'}`}>
          <textarea
            value={replyText}
            onChange={(e) => onReplyTextChange(e.target.value)}
            placeholder="Напишите ответ..."
            rows="2"
            autoFocus
            className={`w-full px-3 py-2 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 ${
              darkMode 
                ? 'bg-white/10 text-white placeholder-white/40 border border-white/10' 
                : 'bg-white text-gray-900 placeholder-gray-400 border border-gray-200'
            }`}
          />
          <div className="flex justify-end gap-2 mt-2">
            <button 
              onClick={() => { onSetReplyTo(null); onReplyTextChange(''); }}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                darkMode 
                  ? 'text-white/60 hover:text-white hover:bg-white/10' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              Отмена
            </button>
            <button 
              onClick={() => onReply(comment._id)}
              disabled={submitting || !replyText.trim()}
              className="px-3 py-1.5 bg-purple-500 text-white rounded-lg text-sm font-medium hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Отправить
            </button>
          </div>
        </div>
      )}

      {/* Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-3">
          {comment.replies.map(reply => (
            <CommentItem 
              key={reply._id} 
              comment={reply} 
              isReply={true}
              userId={userId}
              isLoggedIn={isLoggedIn}
              replyTo={replyTo}
              replyText={replyText}
              submitting={submitting}
              darkMode={darkMode}
              onReplyTextChange={onReplyTextChange}
              onSetReplyTo={onSetReplyTo}
              onReply={onReply}
              onLike={onLike}
              onDelete={onDelete}
              formatDate={formatDate}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const Comments = ({ quizId }) => {
  const { darkMode } = useTheme();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const userId = currentUser.id || currentUser._id;
  const isLoggedIn = !!userId;

  useEffect(() => {
    fetchComments();
  }, [quizId, page]);

  const fetchComments = async () => {
    try {
      const response = await commentAPI.getComments(quizId, page);
      const data = response.data.data;
      
      if (page === 1) {
        setComments(data.comments);
      } else {
        setComments(prev => [...prev, ...data.comments]);
      }
      setPagination(data.pagination);
    } catch (err) {
      console.error('Ошибка загрузки комментариев:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !isLoggedIn) return;

    setSubmitting(true);
    setError('');
    
    try {
      const response = await commentAPI.addComment(quizId, { text: newComment });
      setComments([response.data.data.comment, ...comments]);
      setNewComment('');
    } catch (err) {
      setError('Ошибка при добавлении комментария');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReply = async (parentId) => {
    if (!replyText.trim() || !isLoggedIn) return;

    setSubmitting(true);
    try {
      const response = await commentAPI.addComment(quizId, { 
        text: replyText, 
        parentComment: parentId 
      });
      
      // Добавляем ответ к нужному комментарию
      setComments(comments.map(comment => {
        if (comment._id === parentId) {
          return {
            ...comment,
            replies: [...(comment.replies || []), response.data.data.comment]
          };
        }
        return comment;
      }));
      
      setReplyTo(null);
      setReplyText('');
    } catch (err) {
      console.error('Ошибка при ответе:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleLike = async (commentId) => {
    if (!isLoggedIn) return;

    try {
      const response = await commentAPI.toggleLike(quizId, commentId);
      const { liked, likesCount } = response.data.data;

      setComments(comments.map(comment => {
        if (comment._id === commentId) {
          return { ...comment, likesCount, isLiked: liked };
        }
        // Проверяем в ответах
        if (comment.replies) {
          return {
            ...comment,
            replies: comment.replies.map(reply => {
              if (reply._id === commentId) {
                return { ...reply, likesCount, isLiked: liked };
              }
              return reply;
            })
          };
        }
        return comment;
      }));
    } catch (err) {
      console.error('Ошибка лайка:', err);
    }
  };

  const handleDelete = async (commentId) => {
    if (!window.confirm('Удалить комментарий?')) return;

    try {
      await commentAPI.deleteComment(quizId, commentId);
      setComments(comments.filter(c => c._id !== commentId).map(comment => ({
        ...comment,
        replies: comment.replies?.filter(r => r._id !== commentId)
      })));
    } catch (err) {
      console.error('Ошибка удаления:', err);
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'только что';
    if (diff < 3600000) return `${Math.floor(diff / 60000)} мин назад`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} ч назад`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)} дн назад`;
    
    return date.toLocaleDateString('ru-RU');
  };

  return (
    <div className="comments-section">
      {/* Add Comment Form */}
      {isLoggedIn ? (
        <form onSubmit={handleSubmit} className="mb-6">
          <div className="relative">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Напишите комментарий..."
              rows="3"
              maxLength={1000}
              className={`w-full px-4 py-3 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                darkMode 
                  ? 'bg-white/10 text-white placeholder-white/40 border border-white/10' 
                  : 'bg-gray-50 text-gray-900 placeholder-gray-400 border border-gray-200'
              }`}
            />
          </div>
          {error && (
            <p className="text-red-400 text-sm mt-2">{error}</p>
          )}
          <div className="flex items-center justify-between mt-3">
            <span className={`text-xs ${darkMode ? 'text-white/40' : 'text-gray-400'}`}>
              {newComment.length}/1000
            </span>
            <button 
              type="submit" 
              disabled={submitting || !newComment.trim()}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              <span>{submitting ? 'Отправка...' : 'Отправить'}</span>
            </button>
          </div>
        </form>
      ) : (
        <div className={`text-center py-6 rounded-xl mb-6 ${darkMode ? 'bg-white/5' : 'bg-gray-50'}`}>
          <User className={`w-10 h-10 mx-auto mb-3 ${darkMode ? 'text-white/20' : 'text-gray-300'}`} />
          <p className={`text-sm mb-3 ${darkMode ? 'text-white/60' : 'text-gray-500'}`}>
            Войдите, чтобы оставить комментарий
          </p>
          <a 
            href="/login" 
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Войти
          </a>
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-1">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className={`w-6 h-6 animate-spin ${darkMode ? 'text-purple-400' : 'text-purple-500'}`} />
          </div>
        ) : comments.length === 0 ? (
          <div className={`text-center py-8 rounded-xl ${darkMode ? 'bg-white/5' : 'bg-gray-50'}`}>
            <MessageCircle className={`w-10 h-10 mx-auto mb-3 ${darkMode ? 'text-white/20' : 'text-gray-300'}`} />
            <p className={`text-sm ${darkMode ? 'text-white/60' : 'text-gray-500'}`}>
              Пока нет комментариев. Будьте первым!
            </p>
          </div>
        ) : (
          <>
            {comments.map(comment => (
              <CommentItem 
                key={comment._id} 
                comment={comment}
                userId={userId}
                isLoggedIn={isLoggedIn}
                replyTo={replyTo}
                replyText={replyText}
                submitting={submitting}
                darkMode={darkMode}
                onReplyTextChange={setReplyText}
                onSetReplyTo={setReplyTo}
                onReply={handleReply}
                onLike={handleLike}
                onDelete={handleDelete}
                formatDate={formatDate}
              />
            ))}
            
            {pagination?.hasNext && (
              <button 
                onClick={() => setPage(page + 1)}
                className={`w-full py-3 rounded-xl text-sm font-medium transition-colors ${
                  darkMode 
                    ? 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white' 
                    : 'bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                }`}
              >
                Загрузить ещё
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Comments;
