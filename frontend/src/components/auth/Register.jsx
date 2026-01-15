import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Loader2, Eye, EyeOff, Sparkles, Check, ArrowRight } from 'lucide-react';
import { authAPI } from '../../services/api';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    firstName: '',
    lastName: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await authAPI.register(formData);
      
      // Сохраняем токен и данные пользователя
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      
      setSuccess(true);
      
      // Перенаправляем на dashboard через 2 секунды
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка регистрации');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f] px-4 py-8">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 -left-32 w-96 h-96 bg-green-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl" />
        </div>
        
        <div className="relative text-center p-8 rounded-2xl bg-white/5 border border-white/10 max-w-md">
          <div className="w-16 h-16 rounded-2xl bg-green-500/20 flex items-center justify-center mx-auto mb-4">
            <Check className="text-green-400" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Добро пожаловать!</h2>
          <p className="text-gray-400 mb-6">
            Ваш аккаунт успешно создан. Сейчас вы будете перенаправлены в личный кабинет.
          </p>
          <div className="flex items-center justify-center gap-2 text-purple-400">
            <Loader2 className="animate-spin" size={18} />
            <span>Перенаправление...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f] px-4 py-8">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/25">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold text-white">QuizMaster</span>
        </div>

        {/* Card */}
        <div className="p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-white">Создать аккаунт</h2>
            <p className="text-gray-400 mt-1">Присоединяйтесь к QuizMaster</p>
          </div>
          
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                <User size={16} />
                Имя пользователя <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Введите username"
                required
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl 
                         text-white placeholder:text-gray-500 outline-none
                         focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                <Mail size={16} />
                Email <span className="text-red-400">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Введите email"
                required
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl 
                         text-white placeholder:text-gray-500 outline-none
                         focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                <Lock size={16} />
                Пароль <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Минимум 6 символов"
                  required
                  minLength={6}
                  className="w-full px-4 py-3 pr-12 bg-white/5 border border-white/10 rounded-xl 
                           text-white placeholder:text-gray-500 outline-none
                           focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {formData.password && (
                <div className="mt-2 flex items-center gap-2">
                  <div className={`h-1 flex-1 rounded-full ${
                    formData.password.length < 6 ? 'bg-red-400' :
                    formData.password.length < 10 ? 'bg-yellow-400' : 'bg-green-400'
                  }`} />
                  <span className={`text-xs ${
                    formData.password.length < 6 ? 'text-red-400' :
                    formData.password.length < 10 ? 'text-yellow-400' : 'text-green-400'
                  }`}>
                    {formData.password.length < 6 ? 'Слабый' :
                     formData.password.length < 10 ? 'Средний' : 'Надёжный'}
                  </span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                  Имя
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="Ваше имя"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl 
                           text-white placeholder:text-gray-500 outline-none
                           focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                  Фамилия
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Ваша фамилия"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl 
                           text-white placeholder:text-gray-500 outline-none
                           focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 mt-2
                       bg-gradient-to-r from-purple-500 to-pink-500 
                       hover:opacity-90 text-white font-medium rounded-xl 
                       transition-opacity disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  Создаём аккаунт...
                </>
              ) : (
                <>
                  Зарегистрироваться
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400">
              Уже есть аккаунт?{' '}
              <Link to="/login" className="text-purple-400 hover:text-purple-300 font-medium transition-colors">
                Войти
              </Link>
            </p>
          </div>
        </div>

        <p className="mt-6 text-center text-gray-500 text-sm">
          © 2026 QuizMaster. Все права защищены.
        </p>
      </div>
    </div>
  );
};

export default Register;