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
  Globe
} from 'lucide-react';
import { userAPI } from '../../services/api';

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
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('profile');
  
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
    { id: 'profile', label: 'Профиль', icon: User },
    { id: 'security', label: 'Безопасность', icon: Shield },
    { id: 'notifications', label: 'Уведомления', icon: Bell },
  ];

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
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">Настройки</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Управляйте своим профилем и настройками аккаунта</p>
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
          <div className="p-2 rounded-2xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 shadow-sm dark:shadow-none">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                    activeTab === tab.id
                      ? 'bg-purple-500/20 text-purple-600 dark:text-purple-400'
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
            <div className="p-6 rounded-2xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 shadow-sm dark:shadow-none">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Безопасность</h2>
              <p className="text-gray-600 dark:text-gray-400">Настройки безопасности будут доступны в ближайшее время.</p>
              
              <div className="mt-6 p-4 rounded-xl bg-yellow-50 dark:bg-yellow-500/10 border border-yellow-200 dark:border-yellow-500/20">
                <p className="text-yellow-700 dark:text-yellow-400 text-sm">🔒 Функция смены пароля скоро будет добавлена</p>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="p-6 rounded-2xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 shadow-sm dark:shadow-none">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Уведомления</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">Настройте, какие уведомления вы хотите получать.</p>
              
              <div className="space-y-4">
                {[
                  { label: 'Email уведомления', desc: 'Получать уведомления на email' },
                  { label: 'Новые комментарии', desc: 'Когда кто-то комментирует ваш квиз' },
                  { label: 'Новые лайки', desc: 'Когда кто-то ставит лайк вашему квизу' },
                  { label: 'Результаты', desc: 'Когда кто-то проходит ваш квиз' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-white/5">
                    <div>
                      <p className="text-gray-900 dark:text-white font-medium">{item.label}</p>
                      <p className="text-gray-500 dark:text-gray-400 text-sm">{item.desc}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked={i < 2} />
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
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileEditor;
