// backend/src/routes/friendsRoutes.js
const express = require('express');
const router = express.Router();
const friendsController = require('../controllers/friendsController');
const { authenticate } = require('../middleware/auth');

// Все роуты защищены
router.use(authenticate);

// Лидерборд
router.get('/leaderboard', friendsController.getLeaderboard);
router.get('/leaderboard/friends', friendsController.getFriendsLeaderboard);

// Поиск пользователей
router.get('/search', friendsController.searchUsers);

// Друзья
router.get('/', friendsController.getFriends);
router.get('/requests', friendsController.getFriendRequests);

// Профиль пользователя
router.get('/user/:userId', friendsController.getUserProfile);

// Действия с друзьями
router.post('/request/:userId', friendsController.sendFriendRequest);
router.post('/accept/:userId', friendsController.acceptFriendRequest);
router.post('/reject/:userId', friendsController.rejectFriendRequest);
router.delete('/remove/:userId', friendsController.removeFriend);
router.delete('/cancel/:userId', friendsController.cancelFriendRequest);

module.exports = router;
