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
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor для обработки ошибок
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
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
};

// Game API
export const gameAPI = {
  startGame: (quizId, gameType = 'solo') => api.post(`/games/start/${quizId}`, { gameType }),
  submitAnswer: (gameId, questionId, answer) => 
    api.post(`/games/${gameId}/answer`, { questionId, answer }),
  getGameResult: (gameId) => api.get(`/games/${gameId}/result`),
  getLeaderboard: (quizId) => api.get(`/games/leaderboard/${quizId}`),
};

// User API
export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (profileData) => api.put('/users/profile', profileData),
  getUserStats: () => api.get('/users/stats'),
  getAchievements: () => api.get('/users/achievements'),
  uploadAvatar: (formData) => api.post('/users/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
};

export default api;