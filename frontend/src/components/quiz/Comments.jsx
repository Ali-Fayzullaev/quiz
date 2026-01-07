import { useState, useEffect } from 'react';
import { commentAPI } from '../../services/api';

// Вынесенный компонент элемента комментария (чтобы не терялся фокус)
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
    <div className={`comment-item ${isReply ? 'reply' : ''}`}>
      <div className="comment-header">
        <div className="comment-user">
          <div 
            className="user-avatar"
            style={!avatarUrl ? { backgroundColor: getAvatarColor(username) } : {}}
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt="" />
            ) : (
              <span>{username.charAt(0).toUpperCase()}</span>
            )}
          </div>
          <div className="user-info">
            <span className="username">{username}</span>
            <span className="date">{formatDate(comment.createdAt)}</span>
            {comment.isEdited && <span className="edited">(изменено)</span>}
          </div>
        </div>
      </div>
      
      <div className="comment-text">{comment.text}</div>
      
      <div className="comment-actions">
        <button 
          className={`like-btn ${comment.isLiked ? 'liked' : ''}`}
          onClick={() => onLike(comment._id)}
          disabled={!isLoggedIn}
        >
          ❤️ {comment.likesCount || 0}
        </button>
        
        {!isReply && isLoggedIn && (
          <button 
            className="reply-btn"
            onClick={() => onSetReplyTo(replyTo === comment._id ? null : comment._id)}
          >
            💬 Ответить
          </button>
        )}
        
        {canDelete && (
          <button 
            className="delete-btn"
            onClick={() => onDelete(comment._id)}
          >
            🗑️
          </button>
        )}
      </div>

      {/* Форма ответа */}
      {replyTo === comment._id && (
        <div className="reply-form">
          <textarea
            value={replyText}
            onChange={(e) => onReplyTextChange(e.target.value)}
            placeholder="Напишите ответ..."
            rows="2"
            autoFocus
          />
          <div className="reply-actions">
            <button 
              onClick={() => onReply(comment._id)}
              disabled={submitting || !replyText.trim()}
            >
              Отправить
            </button>
            <button onClick={() => { onSetReplyTo(null); onReplyTextChange(''); }}>
              Отмена
            </button>
          </div>
        </div>
      )}

      {/* Ответы на комментарий */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="comment-replies">
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
      <h3>💬 Комментарии</h3>

      {/* Форма добавления комментария */}
      {isLoggedIn ? (
        <form onSubmit={handleSubmit} className="comment-form">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Напишите комментарий..."
            rows="3"
            maxLength={1000}
          />
          {error && <div className="error-text">{error}</div>}
          <div className="form-actions">
            <span className="char-count">{newComment.length}/1000</span>
            <button 
              type="submit" 
              disabled={submitting || !newComment.trim()}
            >
              {submitting ? 'Отправка...' : 'Отправить'}
            </button>
          </div>
        </form>
      ) : (
        <div className="login-prompt">
          <p>Войдите, чтобы оставить комментарий</p>
          <a href="/login">Войти</a>
        </div>
      )}

      {/* Список комментариев */}
      <div className="comments-list">
        {loading ? (
          <div className="loading">Загрузка комментариев...</div>
        ) : comments.length === 0 ? (
          <div className="no-comments">
            <p>Пока нет комментариев. Будьте первым!</p>
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
                className="load-more-btn"
                onClick={() => setPage(page + 1)}
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
