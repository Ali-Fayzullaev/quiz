import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Camera, 
  Save, 
  X, 
  Loader2, 
  Mail, 
  Calendar,
  FileText,
  Trash2,
  Check,
  AlertCircle,
  Shield,
  Bell,
  Globe,
  Lock,
  Eye,
  EyeOff,
  Palette,
  Moon,
  Sun,
  Monitor,
  Languages,
  UserX,
  Key,
  Smartphone,
  LogOut,
  AlertTriangle,
  Volume2,
  VolumeX,
  MessageSquare,
  Heart,
  Trophy,
  Zap
} from 'lucide-react';
import { userAPI } from '../../services/api';
import { useTheme } from '../../context/ThemeContext';

const getAvatarColor = (username) => {
  const colors = [
    'from-pink-500 to-rose-500',
    'from-violet-500 to-purple-500',
    'from-blue-500 to-cyan-500',
    'from-emerald-500 to-teal-500',
    'from-amber-500 to-orange-500',
  ];
  if (!username) return colors[0];
  const index = username.charCodeAt(0) % colors.length;
  return colors[index];
};

const ProfileEditor = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const { darkMode, toggleTheme } = useTheme();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('profile');
  
  // Состояние пароля
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [savingPassword, setSavingPassword] = useState(false);
  
  // Настройки уведомлений
  const [notifications, setNotifications] = useState({
    email: true,
    comments: true,
    likes: true,
    results: true,
    friendRequests: true,
    achievements: true,
    sound: true
  });
  
  // Настройки приватности
  const [privacy, setPrivacy] = useState({
    showProfile: true,
    showStats: true,
    showActivity: true,
    allowFriendRequests: true
  });
  
  // Настройки внешнего вида
  const [appearance, setAppearance] = useState({
    theme: 'system', // 'light', 'dark', 'system'
    language: 'ru'
  });
  
  // Удаление аккаунта
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);
  
  const [profile, setProfile] = useState({
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    bio: '',
    country: '',
    dateOfBirth: '',
    avatar: { url: '', cloudinaryId: '' }
  });
  
  const [avatarPreview, setAvatarPreview] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await userAPI.getProfile();
      const userData = response.data.data;
      
      setProfile({
        username: userData.username || '',
        email: userData.email || '',
        firstName: userData.profile?.firstName || '',
        lastName: userData.profile?.lastName || '',
        bio: userData.profile?.bio || '',
        country: userData.profile?.country || '',
        dateOfBirth: userData.profile?.dateOfBirth 
          ? new Date(userData.profile.dateOfBirth).toISOString().split('T')[0] 
          : '',
        avatar: userData.profile?.avatar || { url: '', cloudinaryId: '' }
      });
      
      if (userData.profile?.avatar?.url) {
        setAvatarPreview(userData.profile.avatar.url);
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError('Ошибка загрузки профиля');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
    setError('');
    setSuccess('');
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('Разрешены только изображения (jpeg, jpg, png, gif, webp)');
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      setError('Размер файла не должен превышать 5MB');
      return;
    }
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result);
    };
    reader.readAsDataURL(file);
    
    try {
      setUploadingAvatar(true);
      setError('');
      
      const formData = new FormData();
      formData.append('avatar', file);
      
      const response = await userAPI.uploadAvatar(formData);
      
      if (response.data.success) {
        setProfile(prev => ({
          ...prev,
          avatar: response.data.data.avatar
        }));
        setAvatarPreview(response.data.data.avatar.url);
        setSuccess('Аватар успешно загружен!');
      }
    } catch (err) {
      console.error('Error uploading avatar:', err);
      setError(err.response?.data?.message || 'Ошибка загрузки аватара');
      setAvatarPreview(profile.avatar?.url || '');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleDeleteAvatar = async () => {
    if (!profile.avatar?.cloudinaryId) return;
    if (!confirm('Вы уверены, что хотите удалить аватар?')) return;
    
    try {
      setUploadingAvatar(true);
      await userAPI.deleteAvatar();
      
      setProfile(prev => ({
        ...prev,
        avatar: { url: '', cloudinaryId: '' }
      }));
      setAvatarPreview('');
      setSuccess('Аватар удален');
    } catch (err) {
      console.error('Error deleting avatar:', err);
      setError('Ошибка удаления аватара');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      setError('');
      setSuccess('');
      
      const updateData = {
        username: profile.username,
        email: profile.email,
        firstName: profile.firstName,
        lastName: profile.lastName,
        bio: profile.bio,
        country: profile.country,
        dateOfBirth: profile.dateOfBirth || null
      };
      
      const response = await userAPI.updateProfile(updateData);
      
      if (response.data.success) {
        setSuccess('Профиль успешно обновлен!');
        // Уведомляем Sidebar об обновлении данных
        window.dispatchEvent(new CustomEvent('userStatsUpdated'));
        setTimeout(() => {
          navigate('/profile');
        }, 1500);
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err.response?.data?.message || 'Ошибка обновления профиля');
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Профиль', icon: User, color: 'from-purple-500 to-pink-500' },
    { id: 'security', label: 'Безопасность', icon: Shield, color: 'from-blue-500 to-cyan-500' },
    { id: 'notifications', label: 'Уведомления', icon: Bell, color: 'from-orange-500 to-red-500' },
    { id: 'appearance', label: 'Внешний вид', icon: Palette, color: 'from-violet-500 to-purple-500' },
    { id: 'privacy', label: 'Приватность', icon: Lock, color: 'from-emerald-500 to-teal-500' },
  ];

  // Обработка смены пароля
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('Новые пароли не совпадают');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setError('Пароль должен содержать минимум 6 символов');
      return;
    }

    try {
      setSavingPassword(true);
      await userAPI.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      setSuccess('Пароль успешно изменён!');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (err) {
      console.error('Error changing password:', err);
      setError(err.response?.data?.message || 'Ошибка при смене пароля');
    } finally {
      setSavingPassword(false);
    }
  };

  // Обработка удаления аккаунта
  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== profile.username) {
      setError('Введите имя пользователя для подтверждения');
      return;
    }

    try {
      setDeleting(true);
      // API для удаления аккаунта (нужно добавить на бэкенде)
      // await userAPI.deleteAccount();
      
      // Пока показываем заглушку
      setError('Функция удаления аккаунта временно недоступна. Обратитесь в поддержку.');
      setDeleting(false);
      setShowDeleteConfirm(false);
    } catch (err) {
      console.error('Error deleting account:', err);
      setError('Ошибка при удалении аккаунта');
      setDeleting(false);
    }
  };

  // Переключение уведомлений
  const toggleNotification = (key) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Переключение приватности
  const togglePrivacy = (key) => {
    setPrivacy(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Обработка темы
  const handleThemeChange = (theme) => {
    setAppearance(prev => ({ ...prev, theme }));
    if (theme === 'dark' && !darkMode) {
      toggleTheme();
    } else if (theme === 'light' && darkMode) {
      toggleTheme();
    }
    // Для 'system' можно добавить логику проверки системных настроек
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
        <span className="ml-3 text-gray-600 dark:text-gray-400">Загрузка профиля...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">Настройки</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Управляйте своим профилем и настройками аккаунта</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => navigate('/profile')}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 
                     text-gray-700 dark:text-white rounded-xl transition-colors"
          >
            <User size={18} />
            <span className="hidden sm:inline">Мой профиль</span>
          </button>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400">
          <AlertCircle size={20} />
          <span className="flex-1">{error}</span>
          <button onClick={() => setError('')} className="hover:text-red-500 dark:hover:text-red-300">
            <X size={18} />
          </button>
        </div>
      )}
      
      {success && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 text-green-600 dark:text-green-400">
          <Check size={20} />
          <span className="flex-1">{success}</span>
          <button onClick={() => setSuccess('')} className="hover:text-green-500 dark:hover:text-green-300">
            <X size={18} />
          </button>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Tabs */}
        <div className="lg:w-64 flex-shrink-0">
          <div className="p-2 rounded-2xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 shadow-sm dark:shadow-none lg:sticky lg:top-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r ' + tab.color + ' text-white shadow-lg'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <Icon size={20} />
                  <span className="font-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          {activeTab === 'profile' && (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Avatar Section */}
              <div className="p-6 rounded-2xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 shadow-sm dark:shadow-none">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Фото профиля</h2>
                
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                  <div className="relative">
                    <div 
                      onClick={handleAvatarClick}
                      className={`w-28 h-28 rounded-2xl bg-gradient-to-br ${getAvatarColor(profile.username)} 
                                flex items-center justify-center cursor-pointer overflow-hidden
                                ring-4 ring-gray-100 dark:ring-white/10 hover:ring-purple-500/50 transition-all`}
                    >
                      {avatarPreview ? (
                        <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-white text-4xl font-bold">
                          {profile.username?.charAt(0).toUpperCase() || 'U'}
                        </span>
                      )}
                      
                      {uploadingAvatar && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <Loader2 className="w-8 h-8 animate-spin text-white" />
                        </div>
                      )}
                      
                      <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Camera className="text-white" size={28} />
                      </div>
                    </div>
                    
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                  </div>
                  
                  <div className="space-y-3">
                    <p className="text-gray-600 dark:text-gray-400 text-sm">JPG, PNG, GIF или WebP. Максимум 5MB.</p>
                    <div className="flex gap-3">
                      <button 
                        type="button" 
                        onClick={handleAvatarClick}
                        disabled={uploadingAvatar}
                        className="flex items-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 
                                 text-white text-sm font-medium rounded-xl transition-colors disabled:opacity-50"
                      >
                        <Camera size={16} />
                        Загрузить
                      </button>
                      {profile.avatar?.url && (
                        <button 
                          type="button" 
                          onClick={handleDeleteAvatar}
                          disabled={uploadingAvatar}
                          className="flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20 
                                   text-red-600 dark:text-red-400 text-sm font-medium rounded-xl transition-colors disabled:opacity-50"
                        >
                          <Trash2 size={16} />
                          Удалить
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Basic Info */}
              <div className="p-6 rounded-2xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 shadow-sm dark:shadow-none">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Основная информация</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <User size={16} />
                      Имя пользователя
                    </label>
                    <input
                      type="text"
                      name="username"
                      value={profile.username}
                      onChange={handleInputChange}
                      placeholder="Введите имя пользователя"
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl 
                               text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 outline-none
                               focus:border-purple-500 dark:focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
                    />
                  </div>
                  
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <Mail size={16} />
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={profile.email}
                      onChange={handleInputChange}
                      placeholder="Введите email"
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl 
                               text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 outline-none
                               focus:border-purple-500 dark:focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
                    />
                  </div>
                  
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <User size={16} />
                      Имя
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={profile.firstName}
                      onChange={handleInputChange}
                      placeholder="Введите имя"
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl 
                               text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 outline-none
                               focus:border-purple-500 dark:focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
                    />
                  </div>
                  
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <User size={16} />
                      Фамилия
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={profile.lastName}
                      onChange={handleInputChange}
                      placeholder="Введите фамилию"
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl 
                               text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 outline-none
                               focus:border-purple-500 dark:focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
                    />
                  </div>
                  
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <Globe size={16} />
                      Страна
                    </label>
                    <input
                      type="text"
                      name="country"
                      value={profile.country}
                      onChange={handleInputChange}
                      placeholder="Введите страну"
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl 
                               text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 outline-none
                               focus:border-purple-500 dark:focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
                    />
                  </div>
                  
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <Calendar size={16} />
                      Дата рождения
                    </label>
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={profile.dateOfBirth}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl 
                               text-gray-900 dark:text-white outline-none
                               focus:border-purple-500 dark:focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
                    />
                  </div>
                </div>
                
                <div className="mt-4">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <FileText size={16} />
                    О себе
                  </label>
                  <textarea
                    name="bio"
                    value={profile.bio}
                    onChange={handleInputChange}
                    placeholder="Расскажите немного о себе..."
                    rows={4}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl 
                             text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 outline-none resize-none
                             focus:border-purple-500 dark:focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
                  />
                  <p className="text-right text-sm text-gray-500 mt-1">{profile.bio.length} / 500</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-4">
                <button 
                  type="button" 
                  onClick={() => navigate('/profile')}
                  className="flex items-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-white/10 dark:hover:bg-white/20 
                           text-gray-700 dark:text-white font-medium rounded-xl transition-colors"
                >
                  <X size={18} />
                  Отмена
                </button>
                <button 
                  type="submit" 
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 
                           hover:opacity-90 text-white font-medium rounded-xl transition-opacity disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <Loader2 className="animate-spin" size={18} />
                      Сохранение...
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      Сохранить
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              {/* Смена пароля */}
              <div className="p-6 rounded-2xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 shadow-sm dark:shadow-none">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                    <Key className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Смена пароля</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Обновите свой пароль для защиты аккаунта</p>
                  </div>
                </div>
                
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <Lock size={16} />
                      Текущий пароль
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.current ? 'text' : 'password'}
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                        placeholder="Введите текущий пароль"
                        className="w-full px-4 py-3 pr-12 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl 
                                 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 outline-none
                                 focus:border-purple-500 dark:focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      >
                        {showPasswords.current ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <Lock size={16} />
                      Новый пароль
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.new ? 'text' : 'password'}
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                        placeholder="Введите новый пароль"
                        className="w-full px-4 py-3 pr-12 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl 
                                 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 outline-none
                                 focus:border-purple-500 dark:focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      >
                        {showPasswords.new ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                    {passwordData.newPassword && (
                      <div className="mt-2 flex items-center gap-2">
                        <div className={`h-1.5 flex-1 rounded-full ${
                          passwordData.newPassword.length < 6 ? 'bg-red-400' :
                          passwordData.newPassword.length < 10 ? 'bg-yellow-400' : 'bg-green-400'
                        }`} />
                        <span className={`text-xs font-medium ${
                          passwordData.newPassword.length < 6 ? 'text-red-500' :
                          passwordData.newPassword.length < 10 ? 'text-yellow-500' : 'text-green-500'
                        }`}>
                          {passwordData.newPassword.length < 6 ? 'Слабый' :
                           passwordData.newPassword.length < 10 ? 'Средний' : 'Надёжный'}
                        </span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <Lock size={16} />
                      Подтвердите пароль
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.confirm ? 'text' : 'password'}
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        placeholder="Подтвердите новый пароль"
                        className={`w-full px-4 py-3 pr-12 bg-gray-50 dark:bg-white/5 border rounded-xl 
                                 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 outline-none
                                 focus:ring-2 focus:ring-purple-500/20 transition-all ${
                                   passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword
                                     ? 'border-red-400 dark:border-red-500/50 focus:border-red-500'
                                     : 'border-gray-200 dark:border-white/10 focus:border-purple-500 dark:focus:border-purple-500/50'
                                 }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      >
                        {showPasswords.confirm ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                    {passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword && (
                      <p className="text-red-500 text-sm mt-1">Пароли не совпадают</p>
                    )}
                  </div>

                  <button 
                    type="submit"
                    disabled={savingPassword || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 
                             hover:opacity-90 text-white font-medium rounded-xl transition-opacity disabled:opacity-50"
                  >
                    {savingPassword ? (
                      <>
                        <Loader2 className="animate-spin" size={18} />
                        Сохранение...
                      </>
                    ) : (
                      <>
                        <Key size={18} />
                        Изменить пароль
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Двухфакторная аутентификация */}
              <div className="p-6 rounded-2xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 shadow-sm dark:shadow-none">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                    <Smartphone className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Двухфакторная аутентификация</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Дополнительная защита вашего аккаунта</p>
                  </div>
                  <span className="px-3 py-1 text-xs font-medium bg-yellow-100 dark:bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 rounded-full">
                    Скоро
                  </span>
                </div>
                
                <div className="p-4 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10">
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    🔐 Двухфакторная аутентификация добавит дополнительный уровень безопасности, 
                    требуя код из приложения при входе в аккаунт.
                  </p>
                </div>
              </div>

              {/* Активные сессии */}
              <div className="p-6 rounded-2xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 shadow-sm dark:shadow-none">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <Monitor className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Активные сессии</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Устройства, на которых выполнен вход</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20">
                    <div className="flex items-center gap-3">
                      <Monitor className="w-5 h-5 text-green-600 dark:text-green-400" />
                      <div>
                        <p className="text-gray-900 dark:text-white font-medium">Текущее устройство</p>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">Активно сейчас</p>
                      </div>
                    </div>
                    <span className="flex items-center gap-1 text-green-600 dark:text-green-400 text-sm font-medium">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      Активна
                    </span>
                  </div>
                </div>

                <button 
                  onClick={() => {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    navigate('/login');
                  }}
                  className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-3 border border-red-200 dark:border-red-500/20 
                           text-red-600 dark:text-red-400 rounded-xl hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                >
                  <LogOut size={18} />
                  Выйти со всех устройств
                </button>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div className="p-6 rounded-2xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 shadow-sm dark:shadow-none">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                    <Bell className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Уведомления</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Настройте, какие уведомления хотите получать</p>
                  </div>
                </div>
              
                <div className="space-y-3">
                  {[
                    { key: 'email', icon: Mail, label: 'Email уведомления', desc: 'Получать важные уведомления на почту' },
                    { key: 'comments', icon: MessageSquare, label: 'Комментарии', desc: 'Когда кто-то комментирует ваш квиз' },
                    { key: 'likes', icon: Heart, label: 'Лайки', desc: 'Когда кто-то ставит лайк вашему контенту' },
                    { key: 'results', icon: Trophy, label: 'Результаты', desc: 'Когда кто-то проходит ваш квиз' },
                    { key: 'friendRequests', icon: User, label: 'Заявки в друзья', desc: 'Новые заявки в друзья' },
                    { key: 'achievements', icon: Zap, label: 'Достижения', desc: 'Уведомления о новых достижениях' },
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <div key={item.key} className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10">
                        <div className="flex items-center gap-3">
                          <Icon size={20} className="text-gray-500 dark:text-gray-400" />
                          <div>
                            <p className="text-gray-900 dark:text-white font-medium">{item.label}</p>
                            <p className="text-gray-500 dark:text-gray-400 text-sm">{item.desc}</p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            className="sr-only peer" 
                            checked={notifications[item.key]}
                            onChange={() => toggleNotification(item.key)}
                          />
                          <div className="w-11 h-6 bg-gray-200 dark:bg-white/10 peer-focus:outline-none rounded-full peer 
                                        peer-checked:after:translate-x-full peer-checked:bg-purple-500
                                        after:content-[''] after:absolute after:top-[2px] after:left-[2px] 
                                        after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all">
                          </div>
                        </label>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Звуковые уведомления */}
              <div className="p-6 rounded-2xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 shadow-sm dark:shadow-none">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {notifications.sound ? (
                      <Volume2 className="w-5 h-5 text-purple-500" />
                    ) : (
                      <VolumeX className="w-5 h-5 text-gray-400" />
                    )}
                    <div>
                      <p className="text-gray-900 dark:text-white font-medium">Звуковые уведомления</p>
                      <p className="text-gray-500 dark:text-gray-400 text-sm">Воспроизводить звук при получении уведомлений</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={notifications.sound}
                      onChange={() => toggleNotification('sound')}
                    />
                    <div className="w-11 h-6 bg-gray-200 dark:bg-white/10 peer-focus:outline-none rounded-full peer 
                                  peer-checked:after:translate-x-full peer-checked:bg-purple-500
                                  after:content-[''] after:absolute after:top-[2px] after:left-[2px] 
                                  after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all">
                    </div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="space-y-6">
              {/* Тема */}
              <div className="p-6 rounded-2xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 shadow-sm dark:shadow-none">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center">
                    <Palette className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Тема оформления</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Выберите предпочтительную цветовую схему</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'light', label: 'Светлая', icon: Sun, bg: 'bg-white border-gray-200', iconColor: 'text-yellow-500' },
                    { id: 'dark', label: 'Тёмная', icon: Moon, bg: 'bg-gray-900 border-gray-700', iconColor: 'text-blue-400' },
                    { id: 'system', label: 'Системная', icon: Monitor, bg: 'bg-gradient-to-br from-white to-gray-900 border-gray-400', iconColor: 'text-purple-500' },
                  ].map((theme) => {
                    const Icon = theme.icon;
                    const isActive = (theme.id === 'dark' && darkMode) || (theme.id === 'light' && !darkMode) || (theme.id === 'system' && appearance.theme === 'system');
                    return (
                      <button
                        key={theme.id}
                        onClick={() => handleThemeChange(theme.id)}
                        className={`relative p-4 rounded-xl border-2 transition-all ${
                          isActive
                            ? 'border-purple-500 ring-2 ring-purple-500/20'
                            : 'border-gray-200 dark:border-white/10 hover:border-purple-300 dark:hover:border-purple-500/50'
                        }`}
                      >
                        <div className="flex flex-col items-center gap-2">
                          <div className={`w-12 h-12 rounded-xl ${theme.bg} border flex items-center justify-center`}>
                            <Icon className={theme.iconColor} size={24} />
                          </div>
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{theme.label}</span>
                        </div>
                        {isActive && (
                          <div className="absolute top-2 right-2 w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
                            <Check size={12} className="text-white" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Язык */}
              <div className="p-6 rounded-2xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 shadow-sm dark:shadow-none">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
                    <Languages className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Язык интерфейса</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Выберите язык для отображения интерфейса</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { id: 'ru', label: 'Русский', flag: '🇷🇺' },
                    { id: 'en', label: 'English', flag: '🇺🇸' },
                    { id: 'de', label: 'Deutsch', flag: '🇩🇪', disabled: true },
                    { id: 'es', label: 'Español', flag: '🇪🇸', disabled: true },
                  ].map((lang) => (
                    <button
                      key={lang.id}
                      onClick={() => !lang.disabled && setAppearance(prev => ({ ...prev, language: lang.id }))}
                      disabled={lang.disabled}
                      className={`relative p-3 rounded-xl border-2 transition-all ${
                        appearance.language === lang.id
                          ? 'border-purple-500 bg-purple-50 dark:bg-purple-500/10'
                          : 'border-gray-200 dark:border-white/10 hover:border-purple-300 dark:hover:border-purple-500/50'
                      } ${lang.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <div className="flex items-center gap-2 justify-center">
                        <span className="text-xl">{lang.flag}</span>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{lang.label}</span>
                      </div>
                      {lang.disabled && (
                        <span className="absolute -top-2 -right-2 px-2 py-0.5 text-[10px] bg-yellow-100 dark:bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 rounded-full">
                          Скоро
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="space-y-6">
              {/* Настройки приватности */}
              <div className="p-6 rounded-2xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 shadow-sm dark:shadow-none">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                    <Lock className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Приватность профиля</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Управляйте видимостью вашей информации</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  {[
                    { key: 'showProfile', label: 'Публичный профиль', desc: 'Другие пользователи могут видеть ваш профиль' },
                    { key: 'showStats', label: 'Показывать статистику', desc: 'Отображать вашу статистику в профиле' },
                    { key: 'showActivity', label: 'Показывать активность', desc: 'Другие видят, когда вы были онлайн' },
                    { key: 'allowFriendRequests', label: 'Заявки в друзья', desc: 'Разрешить другим отправлять вам заявки' },
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10">
                      <div>
                        <p className="text-gray-900 dark:text-white font-medium">{item.label}</p>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">{item.desc}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer" 
                          checked={privacy[item.key]}
                          onChange={() => togglePrivacy(item.key)}
                        />
                        <div className="w-11 h-6 bg-gray-200 dark:bg-white/10 peer-focus:outline-none rounded-full peer 
                                      peer-checked:after:translate-x-full peer-checked:bg-purple-500
                                      after:content-[''] after:absolute after:top-[2px] after:left-[2px] 
                                      after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all">
                        </div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Удаление аккаунта */}
              <div className="p-6 rounded-2xl bg-red-50 dark:bg-red-500/5 border border-red-200 dark:border-red-500/20">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-rose-500 flex items-center justify-center">
                    <UserX className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-red-600 dark:text-red-400">Опасная зона</h2>
                    <p className="text-sm text-red-500/70 dark:text-red-400/70">Действия, которые нельзя отменить</p>
                  </div>
                </div>
                
                {!showDeleteConfirm ? (
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-500 hover:bg-red-600 
                             text-white font-medium rounded-xl transition-colors"
                  >
                    <Trash2 size={18} />
                    Удалить аккаунт
                  </button>
                ) : (
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-red-100 dark:bg-red-500/10 border border-red-300 dark:border-red-500/30">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-red-600 dark:text-red-400">
                          <p className="font-semibold mb-1">Вы уверены?</p>
                          <p>Это действие необратимо. Все ваши данные, квизы, результаты и достижения будут удалены навсегда.</p>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                        Введите <span className="text-red-500 font-bold">{profile.username}</span> для подтверждения:
                      </label>
                      <input
                        type="text"
                        value={deleteConfirmText}
                        onChange={(e) => setDeleteConfirmText(e.target.value)}
                        placeholder="Введите имя пользователя"
                        className="w-full px-4 py-3 bg-white dark:bg-white/5 border border-red-300 dark:border-red-500/30 rounded-xl 
                                 text-gray-900 dark:text-white placeholder:text-gray-400 outline-none
                                 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all"
                      />
                    </div>
                    
                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          setShowDeleteConfirm(false);
                          setDeleteConfirmText('');
                        }}
                        className="flex-1 px-4 py-3 bg-gray-200 dark:bg-white/10 hover:bg-gray-300 dark:hover:bg-white/20 
                                 text-gray-700 dark:text-white font-medium rounded-xl transition-colors"
                      >
                        Отмена
                      </button>
                      <button
                        onClick={handleDeleteAccount}
                        disabled={deleting || deleteConfirmText !== profile.username}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-500 hover:bg-red-600 
                                 text-white font-medium rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {deleting ? (
                          <>
                            <Loader2 className="animate-spin" size={18} />
                            Удаление...
                          </>
                        ) : (
                          <>
                            <Trash2 size={18} />
                            Удалить навсегда
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileEditor;
