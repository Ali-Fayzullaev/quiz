import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Camera, 
  Save, 
  X, 
  Loader2, 
  Mail, 
  MapPin, 
  Calendar,
  FileText,
  ArrowLeft,
  Trash2,
  Check,
  AlertCircle
} from 'lucide-react';
import { userAPI } from '../../services/api';

const ProfileEditor = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
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
    
    // Проверка типа файла
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('Разрешены только изображения (jpeg, jpg, png, gif, webp)');
      return;
    }
    
    // Проверка размера (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Размер файла не должен превышать 5MB');
      return;
    }
    
    // Показываем превью
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result);
    };
    reader.readAsDataURL(file);
    
    // Загружаем на сервер
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
      // Возвращаем старое превью
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

  if (loading) {
    return (
      <div className="profile-editor-page">
        <div className="profile-editor-loading">
          <Loader2 className="animate-spin" size={48} />
          <p>Загрузка профиля...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-editor-page">
      <div className="profile-editor-container">
        {/* Header */}
        <div className="profile-editor-header">
          <button 
            className="profile-editor-back"
            onClick={() => navigate('/profile')}
          >
            <ArrowLeft size={20} />
            <span>Назад к профилю</span>
          </button>
          <h1>Редактирование профиля</h1>
        </div>

        {/* Messages */}
        {error && (
          <div className="profile-editor-message error">
            <AlertCircle size={20} />
            <span>{error}</span>
            <button onClick={() => setError('')}>
              <X size={18} />
            </button>
          </div>
        )}
        
        {success && (
          <div className="profile-editor-message success">
            <Check size={20} />
            <span>{success}</span>
            <button onClick={() => setSuccess('')}>
              <X size={18} />
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="profile-editor-form">
          {/* Avatar Section */}
          <div className="profile-editor-avatar-section">
            <div className="profile-editor-avatar-wrapper">
              <div 
                className="profile-editor-avatar"
                onClick={handleAvatarClick}
              >
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar" />
                ) : (
                  <div className="profile-editor-avatar-placeholder">
                    <User size={48} />
                  </div>
                )}
                
                {uploadingAvatar && (
                  <div className="profile-editor-avatar-loading">
                    <Loader2 className="animate-spin" size={32} />
                  </div>
                )}
                
                <div className="profile-editor-avatar-overlay">
                  <Camera size={24} />
                  <span>Изменить</span>
                </div>
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                onChange={handleAvatarChange}
                style={{ display: 'none' }}
              />
            </div>
            
            <div className="profile-editor-avatar-info">
              <h3>Фото профиля</h3>
              <p>JPG, PNG, GIF или WebP. Максимум 5MB.</p>
              <div className="profile-editor-avatar-buttons">
                <button 
                  type="button" 
                  className="btn-upload"
                  onClick={handleAvatarClick}
                  disabled={uploadingAvatar}
                >
                  <Camera size={18} />
                  Загрузить фото
                </button>
                {profile.avatar?.url && (
                  <button 
                    type="button" 
                    className="btn-delete-avatar"
                    onClick={handleDeleteAvatar}
                    disabled={uploadingAvatar}
                  >
                    <Trash2 size={18} />
                    Удалить
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Form Fields */}
          <div className="profile-editor-fields">
            <div className="profile-editor-row">
              <div className="profile-editor-field">
                <label htmlFor="username">
                  <User size={16} />
                  Имя пользователя
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={profile.username}
                  onChange={handleInputChange}
                  placeholder="Введите имя пользователя"
                />
              </div>
              
              <div className="profile-editor-field">
                <label htmlFor="email">
                  <Mail size={16} />
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={profile.email}
                  onChange={handleInputChange}
                  placeholder="Введите email"
                />
              </div>
            </div>

            <div className="profile-editor-row">
              <div className="profile-editor-field">
                <label htmlFor="firstName">
                  <User size={16} />
                  Имя
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={profile.firstName}
                  onChange={handleInputChange}
                  placeholder="Введите имя"
                />
              </div>
              
              <div className="profile-editor-field">
                <label htmlFor="lastName">
                  <User size={16} />
                  Фамилия
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={profile.lastName}
                  onChange={handleInputChange}
                  placeholder="Введите фамилию"
                />
              </div>
            </div>

            <div className="profile-editor-row">
              <div className="profile-editor-field">
                <label htmlFor="country">
                  <MapPin size={16} />
                  Страна
                </label>
                <input
                  type="text"
                  id="country"
                  name="country"
                  value={profile.country}
                  onChange={handleInputChange}
                  placeholder="Введите страну"
                />
              </div>
              
              <div className="profile-editor-field">
                <label htmlFor="dateOfBirth">
                  <Calendar size={16} />
                  Дата рождения
                </label>
                <input
                  type="date"
                  id="dateOfBirth"
                  name="dateOfBirth"
                  value={profile.dateOfBirth}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="profile-editor-field full-width">
              <label htmlFor="bio">
                <FileText size={16} />
                О себе
              </label>
              <textarea
                id="bio"
                name="bio"
                value={profile.bio}
                onChange={handleInputChange}
                placeholder="Расскажите немного о себе..."
                rows={4}
              />
              <span className="char-count">{profile.bio.length} / 500</span>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="profile-editor-actions">
            <button 
              type="button" 
              className="btn-cancel"
              onClick={() => navigate('/profile')}
            >
              <X size={18} />
              Отмена
            </button>
            <button 
              type="submit" 
              className="btn-save"
              disabled={saving}
            >
              {saving ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  Сохранение...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Сохранить изменения
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileEditor;
