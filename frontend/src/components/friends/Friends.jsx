// frontend/src/components/friends/Friends.jsx
import { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../../context/ThemeContext';
import {
  Users,
  Trophy,
  Search,
  UserPlus,
  UserMinus,
  UserCheck,
  UserX,
  Crown,
  Medal,
  Award,
  Flame,
  Zap,
  Book,
  Target,
  TrendingUp,
  Clock,
  ChevronDown,
  ChevronUp,
  X,
  Check,
  Loader2,
  Star,
  Heart,
  Shield,
  Swords,
  Filter,
  RefreshCw,
  MessageCircle,
  Eye
} from 'lucide-react';
import { friendsAPI } from '../../services/api';

// Конфигурация лиг
const LEAGUES = {
  bronze: { name: 'Бронза', color: 'from-amber-600 to-amber-800', icon: '🥉' },
  silver: { name: 'Серебро', color: 'from-gray-300 to-gray-500', icon: '🥈' },
  gold: { name: 'Золото', color: 'from-yellow-400 to-amber-500', icon: '🥇' },
  platinum: { name: 'Платина', color: 'from-cyan-300 to-blue-500', icon: '💎' },
  diamond: { name: 'Алмаз', color: 'from-purple-400 to-pink-500', icon: '💠' },
  master: { name: 'Мастер', color: 'from-red-500 to-orange-500', icon: '👑' }
};

// Получить цвет позиции в рейтинге
const getRankColor = (rank) => {
  if (rank === 1) return 'from-yellow-400 to-amber-500';
  if (rank === 2) return 'from-gray-300 to-gray-500';
  if (rank === 3) return 'from-amber-600 to-amber-800';
  return 'from-gray-600 to-gray-700';
};

const getRankIcon = (rank) => {
  if (rank === 1) return <Crown className="w-5 h-5 text-yellow-400" />;
  if (rank === 2) return <Medal className="w-5 h-5 text-gray-400" />;
  if (rank === 3) return <Medal className="w-5 h-5 text-amber-600" />;
  return null;
};

const Friends = () => {
  const { darkMode } = useTheme();
  
  // Состояния
  const [activeTab, setActiveTab] = useState('leaderboard'); // 'leaderboard', 'friends', 'requests'
  const [leaderboard, setLeaderboard] = useState([]);
  const [friends, setFriends] = useState([]);
  const [friendRequests, setFriendRequests] = useState({ incoming: [], outgoing: [] });
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [sortBy, setSortBy] = useState('points');
  const [showOnlyFriends, setShowOnlyFriends] = useState(false);
  const [actionLoading, setActionLoading] = useState({});

  // Загрузка данных
  useEffect(() => {
    fetchData();
  }, [activeTab, sortBy, showOnlyFriends]);

  // Поиск с debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.length >= 2) {
        searchUsers();
      } else {
        setSearchResults([]);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'leaderboard') {
        const response = showOnlyFriends
          ? await friendsAPI.getFriendsLeaderboard()
          : await friendsAPI.getLeaderboard({ sort: sortBy });
        setLeaderboard(response.data.data || []);
      } else if (activeTab === 'friends') {
        const response = await friendsAPI.getFriends();
        setFriends(response.data.data || []);
      } else if (activeTab === 'requests') {
        const response = await friendsAPI.getFriendRequests();
        setFriendRequests(response.data.data || { incoming: [], outgoing: [] });
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchUsers = async () => {
    setSearchLoading(true);
    try {
      const response = await friendsAPI.searchUsers(searchQuery);
      setSearchResults(response.data.data || []);
    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSendRequest = async (userId) => {
    setActionLoading(prev => ({ ...prev, [userId]: true }));
    try {
      await friendsAPI.sendFriendRequest(userId);
      // Обновляем UI
      setSearchResults(prev => prev.map(u => 
        u._id === userId ? { ...u, friendStatus: 'pending' } : u
      ));
      setLeaderboard(prev => prev.map(u => 
        u._id === userId ? { ...u, friendStatus: 'pending' } : u
      ));
      if (selectedUser?._id === userId) {
        setSelectedUser(prev => ({ ...prev, friendStatus: 'pending' }));
      }
    } catch (error) {
      console.error('Error sending request:', error);
    } finally {
      setActionLoading(prev => ({ ...prev, [userId]: false }));
    }
  };

  const handleAcceptRequest = async (userId) => {
    setActionLoading(prev => ({ ...prev, [userId]: true }));
    try {
      await friendsAPI.acceptFriendRequest(userId);
      fetchData();
    } catch (error) {
      console.error('Error accepting request:', error);
    } finally {
      setActionLoading(prev => ({ ...prev, [userId]: false }));
    }
  };

  const handleRejectRequest = async (userId) => {
    setActionLoading(prev => ({ ...prev, [userId]: true }));
    try {
      await friendsAPI.rejectFriendRequest(userId);
      fetchData();
    } catch (error) {
      console.error('Error rejecting request:', error);
    } finally {
      setActionLoading(prev => ({ ...prev, [userId]: false }));
    }
  };

  const handleCancelRequest = async (userId) => {
    setActionLoading(prev => ({ ...prev, [userId]: true }));
    try {
      await friendsAPI.cancelFriendRequest(userId);
      fetchData();
    } catch (error) {
      console.error('Error canceling request:', error);
    } finally {
      setActionLoading(prev => ({ ...prev, [userId]: false }));
    }
  };

  const handleRemoveFriend = async (userId) => {
    if (!confirm('Удалить из друзей?')) return;
    
    setActionLoading(prev => ({ ...prev, [userId]: true }));
    try {
      await friendsAPI.removeFriend(userId);
      fetchData();
      if (selectedUser?._id === userId) {
        setSelectedUser(prev => ({ ...prev, isFriend: false, friendStatus: null }));
      }
    } catch (error) {
      console.error('Error removing friend:', error);
    } finally {
      setActionLoading(prev => ({ ...prev, [userId]: false }));
    }
  };

  const handleViewProfile = async (userId) => {
    try {
      const response = await friendsAPI.getUserProfile(userId);
      setSelectedUser(response.data.data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  // Компонент карточки пользователя в лидерборде
  const LeaderboardCard = ({ user, index }) => {
    const isTop3 = user.rank <= 3;
    const league = LEAGUES[user.league] || LEAGUES.bronze;
    
    return (
      <div
        className={`
          relative p-4 rounded-2xl transition-all duration-300 cursor-pointer
          ${user.isCurrentUser 
            ? darkMode 
              ? 'bg-gradient-to-r from-purple-900/50 to-pink-900/50 border-2 border-purple-500' 
              : 'bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-300'
            : darkMode 
              ? 'bg-gray-800/50 hover:bg-gray-800 border border-gray-700' 
              : 'bg-white hover:bg-gray-50 border border-gray-200'
          }
          hover:scale-[1.01] hover:shadow-lg
        `}
        onClick={() => handleViewProfile(user._id)}
      >
        <div className="flex items-center gap-4">
          {/* Rank */}
          <div className={`
            flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg
            ${isTop3 
              ? `bg-gradient-to-br ${getRankColor(user.rank)} text-white shadow-lg` 
              : darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
            }
          `}>
            {getRankIcon(user.rank) || `#${user.rank}`}
          </div>
          
          {/* Avatar & Info */}
          <div className="flex-grow flex items-center gap-3">
            <div className="relative">
              <div className={`
                w-14 h-14 rounded-full overflow-hidden border-3
                ${isTop3 ? `border-2 border-gradient-to-br ${getRankColor(user.rank)}` : 'border-2 border-gray-300'}
              `}>
                {user.avatar ? (
                  <img src={user.avatar} alt={user.username} className="w-full h-full object-cover" />
                ) : (
                  <div className={`w-full h-full flex items-center justify-center text-xl font-bold
                    ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600'}
                  `}>
                    {user.username?.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              {/* League badge */}
              <div className="absolute -bottom-1 -right-1 text-lg">{league.icon}</div>
            </div>
            
            <div className="flex-grow">
              <div className="flex items-center gap-2">
                <h3 className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {user.username}
                </h3>
                {user.isCurrentUser && (
                  <span className="px-2 py-0.5 text-xs font-medium bg-purple-500 text-white rounded-full">
                    Вы
                  </span>
                )}
                {user.isFriend && !user.isCurrentUser && (
                  <Heart className="w-4 h-4 text-pink-500 fill-pink-500" />
                )}
              </div>
              <div className="flex items-center gap-3 mt-1">
                <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Ур. {user.level}
                </span>
                <span className={`text-sm ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                  {league.name}
                </span>
              </div>
            </div>
          </div>
          
          {/* Stats */}
          <div className="flex items-center gap-6">
            <div className="text-center hidden sm:block">
              <div className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Очки</div>
              <div className={`font-bold ${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>
                {user.totalPoints?.toLocaleString()}
              </div>
            </div>
            <div className="text-center hidden md:block">
              <div className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Квизов</div>
              <div className={`font-bold ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                {user.totalQuizResults || 0}
              </div>
            </div>
            <div className="text-center hidden md:block">
              <div className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Слов</div>
              <div className={`font-bold ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                {user.wordsLearned || 0}
              </div>
            </div>
            <div className="text-center">
              <div className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Серия</div>
              <div className={`font-bold flex items-center gap-1 ${darkMode ? 'text-orange-400' : 'text-orange-600'}`}>
                <Flame className="w-4 h-4" />
                {user.currentStreak || 0}
              </div>
            </div>
          </div>
          
          {/* Action button */}
          {!user.isCurrentUser && (
            <div className="flex-shrink-0">
              {user.isFriend ? (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveFriend(user._id);
                  }}
                  disabled={actionLoading[user._id]}
                  className={`p-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-red-500/20 text-red-400' : 'hover:bg-red-50 text-red-500'}`}
                >
                  {actionLoading[user._id] ? <Loader2 className="w-5 h-5 animate-spin" /> : <UserMinus className="w-5 h-5" />}
                </button>
              ) : user.friendStatus === 'pending' ? (
                <button disabled className={`p-2 rounded-lg ${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>
                  <Clock className="w-5 h-5" />
                </button>
              ) : (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSendRequest(user._id);
                  }}
                  disabled={actionLoading[user._id]}
                  className={`p-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-green-500/20 text-green-400' : 'hover:bg-green-50 text-green-500'}`}
                >
                  {actionLoading[user._id] ? <Loader2 className="w-5 h-5 animate-spin" /> : <UserPlus className="w-5 h-5" />}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Компонент карточки друга
  const FriendCard = ({ friend }) => {
    const league = LEAGUES[friend.league] || LEAGUES.bronze;
    
    return (
      <div
        className={`
          p-4 rounded-2xl transition-all duration-300 cursor-pointer
          ${darkMode ? 'bg-gray-800/50 hover:bg-gray-800 border border-gray-700' : 'bg-white hover:bg-gray-50 border border-gray-200'}
          hover:scale-[1.02] hover:shadow-lg
        `}
        onClick={() => handleViewProfile(friend._id)}
      >
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className="relative">
            <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-purple-400">
              {friend.avatar ? (
                <img src={friend.avatar} alt={friend.username} className="w-full h-full object-cover" />
              ) : (
                <div className={`w-full h-full flex items-center justify-center text-xl font-bold
                  ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600'}
                `}>
                  {friend.username?.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="absolute -bottom-1 -right-1 text-lg">{league.icon}</div>
          </div>
          
          {/* Info */}
          <div className="flex-grow">
            <h3 className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {friend.username}
            </h3>
            <div className="flex items-center gap-3 mt-1 text-sm">
              <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>Ур. {friend.level}</span>
              <span className={`flex items-center gap-1 ${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>
                <Zap className="w-3 h-3" />
                {friend.totalPoints?.toLocaleString()}
              </span>
            </div>
          </div>
          
          {/* Stats */}
          <div className="flex items-center gap-4 text-sm">
            <div className="text-center">
              <div className={darkMode ? 'text-gray-500' : 'text-gray-400'}>Квизов</div>
              <div className={`font-bold ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>{friend.totalQuizResults || 0}</div>
            </div>
            <div className="text-center">
              <div className={darkMode ? 'text-gray-500' : 'text-gray-400'}>Слов</div>
              <div className={`font-bold ${darkMode ? 'text-green-400' : 'text-green-600'}`}>{friend.wordsLearned || 0}</div>
            </div>
          </div>
          
          {/* Remove button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleRemoveFriend(friend._id);
            }}
            disabled={actionLoading[friend._id]}
            className={`p-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-red-500/20 text-red-400' : 'hover:bg-red-50 text-red-500'}`}
          >
            {actionLoading[friend._id] ? <Loader2 className="w-5 h-5 animate-spin" /> : <UserMinus className="w-5 h-5" />}
          </button>
        </div>
      </div>
    );
  };

  // Компонент карточки заявки
  const RequestCard = ({ user, type }) => {
    return (
      <div className={`
        p-4 rounded-xl flex items-center gap-4
        ${darkMode ? 'bg-gray-800/50 border border-gray-700' : 'bg-white border border-gray-200'}
      `}>
        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-gray-300">
          {user.avatar ? (
            <img src={user.avatar} alt={user.username} className="w-full h-full object-cover" />
          ) : (
            <div className={`w-full h-full flex items-center justify-center text-lg font-bold
              ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600'}
            `}>
              {user.username?.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        
        <div className="flex-grow">
          <h4 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {user.username}
          </h4>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Ур. {user.level} • {user.totalPoints?.toLocaleString()} очков
          </p>
        </div>
        
        {type === 'incoming' ? (
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleAcceptRequest(user._id)}
              disabled={actionLoading[user._id]}
              className="p-2 rounded-lg bg-green-500 hover:bg-green-600 text-white transition-colors"
            >
              {actionLoading[user._id] ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
            </button>
            <button
              onClick={() => handleRejectRequest(user._id)}
              disabled={actionLoading[user._id]}
              className="p-2 rounded-lg bg-red-500 hover:bg-red-600 text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => handleCancelRequest(user._id)}
            disabled={actionLoading[user._id]}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
              ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'}
            `}
          >
            {actionLoading[user._id] ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Отменить'}
          </button>
        )}
      </div>
    );
  };

  // Модальное окно профиля пользователя
  const UserProfileModal = () => {
    if (!selectedUser) return null;
    
    const league = LEAGUES[selectedUser.league] || LEAGUES.bronze;
    
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setSelectedUser(null)}>
        <div
          className={`
            w-full max-w-lg rounded-3xl overflow-hidden
            ${darkMode ? 'bg-gray-900' : 'bg-white'}
            shadow-2xl
          `}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className={`p-6 bg-gradient-to-br ${league.color} relative`}>
            <button
              onClick={() => setSelectedUser(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-black/20 hover:bg-black/40 transition-colors text-white"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-white/30">
                {selectedUser.avatar ? (
                  <img src={selectedUser.avatar} alt={selectedUser.username} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-3xl font-bold bg-white/20 text-white">
                    {selectedUser.username?.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="text-white">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  {selectedUser.username}
                  {selectedUser.isCurrentUser && (
                    <span className="px-2 py-0.5 text-xs bg-white/20 rounded-full">Вы</span>
                  )}
                </h2>
                <p className="opacity-80">
                  {selectedUser.firstName} {selectedUser.lastName}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-2xl">{league.icon}</span>
                  <span className="font-medium">{league.name}</span>
                  <span className="opacity-70">• Ур. {selectedUser.level}</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Stats Grid */}
          <div className="p-6">
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className={`p-4 rounded-xl text-center ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <Zap className={`w-6 h-6 mx-auto mb-1 ${darkMode ? 'text-yellow-400' : 'text-yellow-500'}`} />
                <div className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {selectedUser.totalPoints?.toLocaleString()}
                </div>
                <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Очков</div>
              </div>
              <div className={`p-4 rounded-xl text-center ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <Target className={`w-6 h-6 mx-auto mb-1 ${darkMode ? 'text-blue-400' : 'text-blue-500'}`} />
                <div className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {selectedUser.totalQuizResults || 0}
                </div>
                <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Квизов</div>
              </div>
              <div className={`p-4 rounded-xl text-center ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <Book className={`w-6 h-6 mx-auto mb-1 ${darkMode ? 'text-green-400' : 'text-green-500'}`} />
                <div className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {selectedUser.wordsLearned || 0}
                </div>
                <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Слов</div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className={`p-3 rounded-xl flex items-center gap-3 ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <Flame className={`w-5 h-5 ${darkMode ? 'text-orange-400' : 'text-orange-500'}`} />
                <div>
                  <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Текущая серия</div>
                  <div className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{selectedUser.currentStreak || 0} дней</div>
                </div>
              </div>
              <div className={`p-3 rounded-xl flex items-center gap-3 ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <Trophy className={`w-5 h-5 ${darkMode ? 'text-purple-400' : 'text-purple-500'}`} />
                <div>
                  <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Лучшая серия</div>
                  <div className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{selectedUser.bestStreak || 0} дней</div>
                </div>
              </div>
              <div className={`p-3 rounded-xl flex items-center gap-3 ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <Star className={`w-5 h-5 ${darkMode ? 'text-yellow-400' : 'text-yellow-500'}`} />
                <div>
                  <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Отлично (80%+)</div>
                  <div className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{selectedUser.perfectQuizzes || 0}</div>
                </div>
              </div>
              <div className={`p-3 rounded-xl flex items-center gap-3 ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <TrendingUp className={`w-5 h-5 ${darkMode ? 'text-cyan-400' : 'text-cyan-500'}`} />
                <div>
                  <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Средний балл</div>
                  <div className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{selectedUser.averageScore || 0}%</div>
                </div>
              </div>
            </div>
            
            {/* Action Button */}
            {!selectedUser.isCurrentUser && (
              <div className="flex gap-3">
                {selectedUser.isFriend ? (
                  <button
                    onClick={() => handleRemoveFriend(selectedUser._id)}
                    disabled={actionLoading[selectedUser._id]}
                    className="flex-1 py-3 rounded-xl font-semibold bg-red-500 hover:bg-red-600 text-white transition-colors flex items-center justify-center gap-2"
                  >
                    {actionLoading[selectedUser._id] ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <UserMinus className="w-5 h-5" />
                        Удалить из друзей
                      </>
                    )}
                  </button>
                ) : selectedUser.friendStatus === 'pending' ? (
                  <button
                    disabled
                    className={`flex-1 py-3 rounded-xl font-semibold ${darkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-500'} flex items-center justify-center gap-2`}
                  >
                    <Clock className="w-5 h-5" />
                    Заявка отправлена
                  </button>
                ) : selectedUser.hasIncomingRequest ? (
                  <button
                    onClick={() => handleAcceptRequest(selectedUser._id)}
                    disabled={actionLoading[selectedUser._id]}
                    className="flex-1 py-3 rounded-xl font-semibold bg-green-500 hover:bg-green-600 text-white transition-colors flex items-center justify-center gap-2"
                  >
                    {actionLoading[selectedUser._id] ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <UserCheck className="w-5 h-5" />
                        Принять заявку
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    onClick={() => handleSendRequest(selectedUser._id)}
                    disabled={actionLoading[selectedUser._id]}
                    className="flex-1 py-3 rounded-xl font-semibold bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white transition-colors flex items-center justify-center gap-2"
                  >
                    {actionLoading[selectedUser._id] ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <UserPlus className="w-5 h-5" />
                        Добавить в друзья
                      </>
                    )}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-950' : 'bg-gray-50'}`}>
      {/* Header */}
      <div className={`sticky top-0 z-40 ${darkMode ? 'bg-gray-900/95' : 'bg-white/95'} backdrop-blur-lg border-b ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Сообщество
                </h1>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Соревнуйся с друзьями
                </p>
              </div>
            </div>
            
            {/* Search */}
            <div className="w-full sm:w-auto relative">
              <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
              <input
                type="text"
                placeholder="Поиск пользователей..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`
                  w-full sm:w-80 pl-10 pr-4 py-2.5 rounded-xl border transition-colors
                  ${darkMode 
                    ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-purple-500' 
                    : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-purple-500'
                  }
                  focus:outline-none focus:ring-2 focus:ring-purple-500/20
                `}
              />
              
              {/* Search Results Dropdown */}
              {searchResults.length > 0 && (
                <div className={`
                  absolute top-full mt-2 w-full rounded-xl shadow-xl overflow-hidden z-50
                  ${darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}
                `}>
                  {searchResults.map(user => (
                    <div
                      key={user._id}
                      className={`p-3 flex items-center gap-3 cursor-pointer transition-colors
                        ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}
                      `}
                      onClick={() => {
                        handleViewProfile(user._id);
                        setSearchQuery('');
                        setSearchResults([]);
                      }}
                    >
                      <div className="w-10 h-10 rounded-full overflow-hidden">
                        {user.avatar ? (
                          <img src={user.avatar} alt={user.username} className="w-full h-full object-cover" />
                        ) : (
                          <div className={`w-full h-full flex items-center justify-center font-bold
                            ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600'}
                          `}>
                            {user.username?.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="flex-grow">
                        <div className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {user.username}
                        </div>
                        <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          Ур. {user.level}
                        </div>
                      </div>
                      {user.isFriend && <Heart className="w-4 h-4 text-pink-500 fill-pink-500" />}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {/* Tabs */}
          <div className="flex items-center gap-2 mt-4">
            {[
              { id: 'leaderboard', label: 'Лидерборд', icon: Trophy },
              { id: 'friends', label: 'Друзья', icon: Heart, count: friends.length },
              { id: 'requests', label: 'Заявки', icon: UserPlus, count: friendRequests.incoming?.length }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  px-4 py-2 rounded-xl font-medium flex items-center gap-2 transition-all
                  ${activeTab === tab.id
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                    : darkMode
                      ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }
                `}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
                {tab.count > 0 && (
                  <span className={`
                    px-1.5 py-0.5 text-xs rounded-full
                    ${activeTab === tab.id ? 'bg-white/20' : 'bg-purple-500 text-white'}
                  `}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Leaderboard Tab */}
        {activeTab === 'leaderboard' && (
          <>
            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className={`
                  px-4 py-2 rounded-xl border transition-colors
                  ${darkMode 
                    ? 'bg-gray-800 border-gray-700 text-white' 
                    : 'bg-white border-gray-200 text-gray-900'
                  }
                `}
              >
                <option value="points">По очкам</option>
                <option value="quizzes">По квизам</option>
                <option value="level">По уровню</option>
                <option value="streak">По серии</option>
              </select>
              
              <button
                onClick={() => setShowOnlyFriends(!showOnlyFriends)}
                className={`
                  px-4 py-2 rounded-xl font-medium flex items-center gap-2 transition-all
                  ${showOnlyFriends
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                    : darkMode
                      ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                  }
                `}
              >
                <Heart className={`w-4 h-4 ${showOnlyFriends ? 'fill-white' : ''}`} />
                Только друзья
              </button>
              
              <button
                onClick={fetchData}
                className={`p-2 rounded-xl transition-colors ${darkMode ? 'bg-gray-800 hover:bg-gray-700 text-gray-300' : 'bg-white hover:bg-gray-50 text-gray-600 border border-gray-200'}`}
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>
            
            {/* Leaderboard List */}
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
              </div>
            ) : leaderboard.length === 0 ? (
              <div className={`text-center py-20 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>Пользователи не найдены</p>
              </div>
            ) : (
              <div className="space-y-3">
                {leaderboard.map((user, index) => (
                  <LeaderboardCard key={user._id} user={user} index={index} />
                ))}
              </div>
            )}
          </>
        )}
        
        {/* Friends Tab */}
        {activeTab === 'friends' && (
          <>
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
              </div>
            ) : friends.length === 0 ? (
              <div className={`text-center py-20 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                <Heart className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg mb-2">У вас пока нет друзей</p>
                <p>Найдите друзей в лидерборде или по поиску</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {friends.map(friend => (
                  <FriendCard key={friend._id} friend={friend} />
                ))}
              </div>
            )}
          </>
        )}
        
        {/* Requests Tab */}
        {activeTab === 'requests' && (
          <div className="space-y-6">
            {/* Incoming */}
            <div>
              <h2 className={`text-lg font-bold mb-3 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                <UserPlus className="w-5 h-5 text-green-500" />
                Входящие заявки ({friendRequests.incoming?.length || 0})
              </h2>
              {loading ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 className="w-6 h-6 animate-spin text-purple-500" />
                </div>
              ) : friendRequests.incoming?.length === 0 ? (
                <p className={`text-center py-8 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                  Нет входящих заявок
                </p>
              ) : (
                <div className="space-y-3">
                  {friendRequests.incoming?.map(user => (
                    <RequestCard key={user._id} user={user} type="incoming" />
                  ))}
                </div>
              )}
            </div>
            
            {/* Outgoing */}
            <div>
              <h2 className={`text-lg font-bold mb-3 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                <Clock className="w-5 h-5 text-yellow-500" />
                Исходящие заявки ({friendRequests.outgoing?.length || 0})
              </h2>
              {friendRequests.outgoing?.length === 0 ? (
                <p className={`text-center py-8 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                  Нет исходящих заявок
                </p>
              ) : (
                <div className="space-y-3">
                  {friendRequests.outgoing?.map(user => (
                    <RequestCard key={user._id} user={user} type="outgoing" />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* User Profile Modal */}
      <UserProfileModal />
    </div>
  );
};

export default Friends;
