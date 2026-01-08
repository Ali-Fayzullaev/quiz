import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

// Создание instance для axios с базовыми настройками
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor для автоматического добавления токена
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Для отладки - можно удалить после исправления
    console.log('API Request:', config.method?.toUpperCase(), config.url, 'Token:', token ? 'есть' : 'нет');
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor для обработки ошибок
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Только если токен истёк или невалиден И это не страница логина/регистрации
    if (error.response?.status === 401) {
      const isAuthRoute = error.config?.url?.includes('/auth/');
      
      // Не очищаем токен для auth роутов (login, register и т.д.)
      if (!isAuthRoute) {
        // Проверяем код ошибки от сервера
        const errorCode = error.response?.data?.code;
        
        // Очищаем только если токен реально невалиден
        if (errorCode === 'TOKEN_EXPIRED' || errorCode === 'INVALID_TOKEN' || errorCode === 'TOKEN_REVOKED') {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  logout: () => api.post('/auth/logout'),
  verifyEmail: (code) => api.post('/auth/verify-email', { code }),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post('/auth/reset-password', { token, password }),
};

// Quiz API
export const quizAPI = {
  getQuizzes: (params = {}) => api.get('/quizzes', { params }),
  getQuizById: (id) => api.get(`/quizzes/${id}`),
  createQuiz: (quizData) => api.post('/quizzes', quizData),
  updateQuiz: (id, quizData) => api.put(`/quizzes/${id}`, quizData),
  deleteQuiz: (id) => api.delete(`/quizzes/${id}`),
  toggleLike: (id) => api.post(`/quizzes/${id}/toggle-like`),
  getPopular: () => api.get('/quizzes/popular'),
  getStats: (id) => api.get(`/quizzes/${id}/stats`),
};

// Comment API
export const commentAPI = {
  getComments: (quizId, page = 1) => api.get(`/quizzes/${quizId}/comments`, { params: { page } }),
  addComment: (quizId, data) => api.post(`/quizzes/${quizId}/comments`, data),
  updateComment: (quizId, commentId, data) => api.put(`/quizzes/${quizId}/comments/${commentId}`, data),
  deleteComment: (quizId, commentId) => api.delete(`/quizzes/${quizId}/comments/${commentId}`),
  toggleLike: (quizId, commentId) => api.post(`/quizzes/${quizId}/comments/${commentId}/like`),
};

// Game API
export const gameAPI = {
  startGame: (quizId, gameType = 'solo') => api.post(`/game/start/${quizId}`, { gameType }),
  submitAnswer: (sessionId, questionId, answer) => 
    api.post(`/game/answer`, { sessionId, questionId, answer }),
  getGameResult: (resultId) => api.get(`/game/results/${resultId}`),
  getLeaderboard: (quizId) => api.get(`/game/leaderboard/${quizId}`),
};

// User API
export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (profileData) => api.put('/users/profile', profileData),
  getUserStats: () => api.get('/users/stats'),
  getGameStats: () => api.get('/users/game-stats'),
  addGamePoints: (points, gameType) => api.post('/users/game-points', { points, gameType }),
  getAchievements: () => api.get('/users/achievements'),
  getUserQuizzes: () => api.get('/users/quizzes'),
  getUserResults: () => api.get('/users/results'),
  getLikedQuizzes: () => api.get('/users/liked-quizzes'),
  uploadAvatar: (formData) => api.post('/users/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteAvatar: () => api.delete('/users/avatar'),
  changePassword: (passwordData) => api.put('/users/password', passwordData),
};

export default api;