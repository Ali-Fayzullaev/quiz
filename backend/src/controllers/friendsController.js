// backend/src/controllers/friendsController.js
const User = require('../models/User');
const Vocabulary = require('../models/Vocabulary');
const Result = require('../models/Result');

// Получить всех пользователей (лидерборд)
exports.getLeaderboard = async (req, res) => {
  try {
    const { sort = 'points', limit = 50, page = 1 } = req.query;
    const skip = (page - 1) * limit;

    let sortOption = {};
    switch (sort) {
      case 'points':
        sortOption = { 'gameStats.totalPoints': -1 };
        break;
      case 'quizzes':
        sortOption = { 'gameStats.quizzesCompleted': -1 };
        break;
      case 'level':
        sortOption = { 'gameStats.level': -1 };
        break;
      case 'streak':
        sortOption = { 'gameStats.currentStreak': -1 };
        break;
      default:
        sortOption = { 'gameStats.totalPoints': -1 };
    }

    const users = await User.find({ 
      status: 'active',
      'settings.privacy.showProfile': { $ne: false }
    })
      .select('username profile.firstName profile.lastName profile.avatar gameStats rating createdAt')
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit));

    // Получаем дополнительную статистику для каждого пользователя
    const usersWithStats = await Promise.all(users.map(async (user, index) => {
      // Получаем количество словарей и слов
      const vocabularies = await Vocabulary.find({ owner: user._id });
      const wordsLearned = vocabularies.reduce((acc, v) => {
        return acc + (v.words?.filter(w => w.learned)?.length || 0);
      }, 0);
      const totalWords = vocabularies.reduce((acc, v) => {
        return acc + (v.words?.length || 0);
      }, 0);

      // Получаем результаты квизов
      const results = await Result.find({ user: user._id });
      const perfectQuizzes = results.filter(r => r.percentage >= 80).length;

      // Проверяем, друг ли это текущему пользователю
      const currentUser = await User.findById(req.user._id);
      const friendRelation = currentUser?.friends?.find(
        f => f.userId?.toString() === user._id.toString()
      );

      return {
        _id: user._id,
        rank: skip + index + 1,
        username: user.username,
        avatar: user.profile?.avatar?.url,
        firstName: user.profile?.firstName,
        lastName: user.profile?.lastName,
        level: user.gameStats?.level || 1,
        totalPoints: user.gameStats?.totalPoints || 0,
        quizzesCompleted: user.gameStats?.quizzesCompleted || 0,
        currentStreak: user.gameStats?.currentStreak || 0,
        bestStreak: user.gameStats?.bestStreak || 0,
        rating: user.rating?.current || 1000,
        league: user.rating?.league || 'bronze',
        wordsLearned,
        totalWords,
        vocabulariesCount: vocabularies.length,
        perfectQuizzes,
        totalQuizResults: results.length,
        joinedAt: user.createdAt,
        isFriend: friendRelation?.status === 'accepted',
        friendStatus: friendRelation?.status || null,
        isCurrentUser: user._id.toString() === req.user._id.toString()
      };
    }));

    const total = await User.countDocuments({ 
      status: 'active',
      'settings.privacy.showProfile': { $ne: false }
    });

    res.json({
      success: true,
      data: usersWithStats,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error getting leaderboard:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Ошибка при получении лидерборда' 
    });
  }
};

// Получить список друзей
exports.getFriends = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate({
        path: 'friends.userId',
        select: 'username profile.firstName profile.lastName profile.avatar gameStats rating'
      });

    const friends = await Promise.all(
      user.friends
        .filter(f => f.status === 'accepted' && f.userId)
        .map(async (friend) => {
          const friendUser = friend.userId;
          
          // Получаем статистику друга
          const vocabularies = await Vocabulary.find({ owner: friendUser._id });
          const wordsLearned = vocabularies.reduce((acc, v) => {
            return acc + (v.words?.filter(w => w.learned)?.length || 0);
          }, 0);

          const results = await Result.find({ user: friendUser._id });

          return {
            _id: friendUser._id,
            username: friendUser.username,
            avatar: friendUser.profile?.avatar?.url,
            firstName: friendUser.profile?.firstName,
            lastName: friendUser.profile?.lastName,
            level: friendUser.gameStats?.level || 1,
            totalPoints: friendUser.gameStats?.totalPoints || 0,
            quizzesCompleted: friendUser.gameStats?.quizzesCompleted || 0,
            currentStreak: friendUser.gameStats?.currentStreak || 0,
            rating: friendUser.rating?.current || 1000,
            league: friendUser.rating?.league || 'bronze',
            wordsLearned,
            vocabulariesCount: vocabularies.length,
            totalQuizResults: results.length,
            addedAt: friend.addedAt
          };
        })
    );

    res.json({
      success: true,
      data: friends
    });
  } catch (error) {
    console.error('Error getting friends:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Ошибка при получении списка друзей' 
    });
  }
};

// Получить заявки в друзья
exports.getFriendRequests = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate({
        path: 'friends.userId',
        select: 'username profile.firstName profile.lastName profile.avatar gameStats'
      });

    // Входящие заявки - те, кто отправил нам заявку
    const incomingRequests = [];
    
    // Ищем пользователей, которые добавили нас в друзья со статусом pending
    const usersWithPendingRequests = await User.find({
      'friends.userId': req.user._id,
      'friends.status': 'pending'
    }).select('username profile.firstName profile.lastName profile.avatar gameStats');

    usersWithPendingRequests.forEach(u => {
      incomingRequests.push({
        _id: u._id,
        username: u.username,
        avatar: u.profile?.avatar?.url,
        firstName: u.profile?.firstName,
        lastName: u.profile?.lastName,
        level: u.gameStats?.level || 1,
        totalPoints: u.gameStats?.totalPoints || 0
      });
    });

    // Исходящие заявки
    const outgoingRequests = user.friends
      .filter(f => f.status === 'pending' && f.userId)
      .map(f => ({
        _id: f.userId._id,
        username: f.userId.username,
        avatar: f.userId.profile?.avatar?.url,
        firstName: f.userId.profile?.firstName,
        lastName: f.userId.profile?.lastName,
        level: f.userId.gameStats?.level || 1,
        totalPoints: f.userId.gameStats?.totalPoints || 0,
        sentAt: f.addedAt
      }));

    res.json({
      success: true,
      data: {
        incoming: incomingRequests,
        outgoing: outgoingRequests
      }
    });
  } catch (error) {
    console.error('Error getting friend requests:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Ошибка при получении заявок в друзья' 
    });
  }
};

// Отправить заявку в друзья
exports.sendFriendRequest = async (req, res) => {
  try {
    const { userId } = req.params;

    if (userId === req.user._id.toString()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Нельзя добавить себя в друзья' 
      });
    }

    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return res.status(404).json({ 
        success: false, 
        message: 'Пользователь не найден' 
      });
    }

    // Проверяем настройки приватности
    if (!targetUser.settings?.privacy?.allowFriendRequests) {
      return res.status(403).json({ 
        success: false, 
        message: 'Пользователь не принимает заявки в друзья' 
      });
    }

    const currentUser = await User.findById(req.user._id);

    // Проверяем, есть ли уже заявка или дружба
    const existingFriend = currentUser.friends?.find(
      f => f.userId?.toString() === userId
    );

    if (existingFriend) {
      if (existingFriend.status === 'accepted') {
        return res.status(400).json({ 
          success: false, 
          message: 'Вы уже друзья' 
        });
      }
      if (existingFriend.status === 'pending') {
        return res.status(400).json({ 
          success: false, 
          message: 'Заявка уже отправлена' 
        });
      }
    }

    // Проверяем, отправил ли целевой пользователь нам заявку
    const theirRequest = targetUser.friends?.find(
      f => f.userId?.toString() === req.user._id.toString() && f.status === 'pending'
    );

    if (theirRequest) {
      // Автоматически принимаем их заявку
      theirRequest.status = 'accepted';
      await targetUser.save();

      // Добавляем их в наши друзья
      currentUser.friends = currentUser.friends || [];
      currentUser.friends.push({
        userId,
        status: 'accepted',
        addedAt: new Date()
      });
      await currentUser.save();

      return res.json({
        success: true,
        message: 'Вы теперь друзья!',
        status: 'accepted'
      });
    }

    // Добавляем заявку
    currentUser.friends = currentUser.friends || [];
    currentUser.friends.push({
      userId,
      status: 'pending',
      addedAt: new Date()
    });
    await currentUser.save();

    res.json({
      success: true,
      message: 'Заявка отправлена',
      status: 'pending'
    });
  } catch (error) {
    console.error('Error sending friend request:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Ошибка при отправке заявки' 
    });
  }
};

// Принять заявку в друзья
exports.acceptFriendRequest = async (req, res) => {
  try {
    const { userId } = req.params;

    const requester = await User.findById(userId);
    if (!requester) {
      return res.status(404).json({ 
        success: false, 
        message: 'Пользователь не найден' 
      });
    }

    // Находим их заявку к нам
    const theirRequest = requester.friends?.find(
      f => f.userId?.toString() === req.user._id.toString() && f.status === 'pending'
    );

    if (!theirRequest) {
      return res.status(404).json({ 
        success: false, 
        message: 'Заявка не найдена' 
      });
    }

    // Принимаем их заявку
    theirRequest.status = 'accepted';
    await requester.save();

    // Добавляем их в наши друзья
    const currentUser = await User.findById(req.user._id);
    currentUser.friends = currentUser.friends || [];
    
    const existingFriend = currentUser.friends.find(
      f => f.userId?.toString() === userId
    );

    if (existingFriend) {
      existingFriend.status = 'accepted';
    } else {
      currentUser.friends.push({
        userId,
        status: 'accepted',
        addedAt: new Date()
      });
    }
    await currentUser.save();

    res.json({
      success: true,
      message: 'Заявка принята'
    });
  } catch (error) {
    console.error('Error accepting friend request:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Ошибка при принятии заявки' 
    });
  }
};

// Отклонить заявку в друзья
exports.rejectFriendRequest = async (req, res) => {
  try {
    const { userId } = req.params;

    const requester = await User.findById(userId);
    if (!requester) {
      return res.status(404).json({ 
        success: false, 
        message: 'Пользователь не найден' 
      });
    }

    // Удаляем их заявку
    requester.friends = requester.friends?.filter(
      f => f.userId?.toString() !== req.user._id.toString()
    );
    await requester.save();

    res.json({
      success: true,
      message: 'Заявка отклонена'
    });
  } catch (error) {
    console.error('Error rejecting friend request:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Ошибка при отклонении заявки' 
    });
  }
};

// Удалить из друзей
exports.removeFriend = async (req, res) => {
  try {
    const { userId } = req.params;

    // Удаляем из наших друзей
    const currentUser = await User.findById(req.user._id);
    currentUser.friends = currentUser.friends?.filter(
      f => f.userId?.toString() !== userId
    );
    await currentUser.save();

    // Удаляем нас из их друзей
    const friend = await User.findById(userId);
    if (friend) {
      friend.friends = friend.friends?.filter(
        f => f.userId?.toString() !== req.user._id.toString()
      );
      await friend.save();
    }

    res.json({
      success: true,
      message: 'Друг удалён'
    });
  } catch (error) {
    console.error('Error removing friend:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Ошибка при удалении друга' 
    });
  }
};

// Отменить исходящую заявку
exports.cancelFriendRequest = async (req, res) => {
  try {
    const { userId } = req.params;

    const currentUser = await User.findById(req.user._id);
    currentUser.friends = currentUser.friends?.filter(
      f => !(f.userId?.toString() === userId && f.status === 'pending')
    );
    await currentUser.save();

    res.json({
      success: true,
      message: 'Заявка отменена'
    });
  } catch (error) {
    console.error('Error canceling friend request:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Ошибка при отмене заявки' 
    });
  }
};

// Получить профиль пользователя
exports.getUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId)
      .select('username profile gameStats rating createdAt');

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'Пользователь не найден' 
      });
    }

    // Получаем статистику
    const vocabularies = await Vocabulary.find({ owner: userId });
    const wordsLearned = vocabularies.reduce((acc, v) => {
      return acc + (v.words?.filter(w => w.learned)?.length || 0);
    }, 0);
    const totalWords = vocabularies.reduce((acc, v) => {
      return acc + (v.words?.length || 0);
    }, 0);

    const results = await Result.find({ user: userId });
    const perfectQuizzes = results.filter(r => r.percentage >= 80).length;
    const averageScore = results.length > 0
      ? Math.round(results.reduce((acc, r) => acc + (r.percentage || 0), 0) / results.length)
      : 0;

    // Проверяем статус дружбы
    const currentUser = await User.findById(req.user._id);
    const friendRelation = currentUser?.friends?.find(
      f => f.userId?.toString() === userId
    );

    // Проверяем, отправил ли этот пользователь нам заявку
    const theirRequest = user.friends?.find?.(
      f => f.userId?.toString() === req.user._id.toString() && f.status === 'pending'
    );

    res.json({
      success: true,
      data: {
        _id: user._id,
        username: user.username,
        avatar: user.profile?.avatar?.url,
        firstName: user.profile?.firstName,
        lastName: user.profile?.lastName,
        bio: user.profile?.bio,
        level: user.gameStats?.level || 1,
        totalPoints: user.gameStats?.totalPoints || 0,
        experience: user.gameStats?.experience || 0,
        quizzesCompleted: user.gameStats?.quizzesCompleted || 0,
        currentStreak: user.gameStats?.currentStreak || 0,
        bestStreak: user.gameStats?.bestStreak || 0,
        rating: user.rating?.current || 1000,
        league: user.rating?.league || 'bronze',
        wordsLearned,
        totalWords,
        vocabulariesCount: vocabularies.length,
        perfectQuizzes,
        totalQuizResults: results.length,
        averageScore,
        joinedAt: user.createdAt,
        isFriend: friendRelation?.status === 'accepted',
        friendStatus: friendRelation?.status || null,
        hasIncomingRequest: !!theirRequest,
        isCurrentUser: userId === req.user._id.toString()
      }
    });
  } catch (error) {
    console.error('Error getting user profile:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Ошибка при получении профиля' 
    });
  }
};

// Поиск пользователей
exports.searchUsers = async (req, res) => {
  try {
    const { q, limit = 20 } = req.query;

    if (!q || q.length < 2) {
      return res.json({ success: true, data: [] });
    }

    const users = await User.find({
      $or: [
        { username: { $regex: q, $options: 'i' } },
        { 'profile.firstName': { $regex: q, $options: 'i' } },
        { 'profile.lastName': { $regex: q, $options: 'i' } }
      ],
      status: 'active',
      _id: { $ne: req.user._id }
    })
      .select('username profile.firstName profile.lastName profile.avatar gameStats')
      .limit(parseInt(limit));

    const currentUser = await User.findById(req.user._id);

    const usersWithStatus = users.map(user => {
      const friendRelation = currentUser?.friends?.find(
        f => f.userId?.toString() === user._id.toString()
      );

      return {
        _id: user._id,
        username: user.username,
        avatar: user.profile?.avatar?.url,
        firstName: user.profile?.firstName,
        lastName: user.profile?.lastName,
        level: user.gameStats?.level || 1,
        totalPoints: user.gameStats?.totalPoints || 0,
        isFriend: friendRelation?.status === 'accepted',
        friendStatus: friendRelation?.status || null
      };
    });

    res.json({
      success: true,
      data: usersWithStatus
    });
  } catch (error) {
    console.error('Error searching users:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Ошибка при поиске пользователей' 
    });
  }
};

// Получить лидерборд только друзей
exports.getFriendsLeaderboard = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    const friendIds = user.friends
      ?.filter(f => f.status === 'accepted')
      ?.map(f => f.userId) || [];

    // Добавляем себя в список
    friendIds.push(req.user._id);

    const friends = await User.find({ _id: { $in: friendIds } })
      .select('username profile.firstName profile.lastName profile.avatar gameStats rating')
      .sort({ 'gameStats.totalPoints': -1 });

    const leaderboard = await Promise.all(friends.map(async (friend, index) => {
      const vocabularies = await Vocabulary.find({ owner: friend._id });
      const wordsLearned = vocabularies.reduce((acc, v) => {
        return acc + (v.words?.filter(w => w.learned)?.length || 0);
      }, 0);

      const results = await Result.find({ user: friend._id });

      return {
        _id: friend._id,
        rank: index + 1,
        username: friend.username,
        avatar: friend.profile?.avatar?.url,
        firstName: friend.profile?.firstName,
        lastName: friend.profile?.lastName,
        level: friend.gameStats?.level || 1,
        totalPoints: friend.gameStats?.totalPoints || 0,
        quizzesCompleted: friend.gameStats?.quizzesCompleted || 0,
        currentStreak: friend.gameStats?.currentStreak || 0,
        rating: friend.rating?.current || 1000,
        league: friend.rating?.league || 'bronze',
        wordsLearned,
        vocabulariesCount: vocabularies.length,
        totalQuizResults: results.length,
        isCurrentUser: friend._id.toString() === req.user._id.toString()
      };
    }));

    res.json({
      success: true,
      data: leaderboard
    });
  } catch (error) {
    console.error('Error getting friends leaderboard:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Ошибка при получении лидерборда друзей' 
    });
  }
};
