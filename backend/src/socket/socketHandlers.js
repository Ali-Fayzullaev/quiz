const logger = require('../config/logger');

// Активные соединения и комнаты
const activeUsers = new Map(); // userId -> socket
const gameRooms = new Map(); // roomId -> room data
const quizSessions = new Map(); // sessionId -> session data

// Регистрация всех обработчиков WebSocket событий
const registerHandlers = (socket, io) => {
    // Сохраняем соединение пользователя
    activeUsers.set(socket.userId, socket);
    
    // Уведомляем друзей о статусе "онлайн"
    notifyFriendsStatus(socket, io, 'online');
    
    // Регистрируем обработчики событий
    socket.on('user:status', (data) => handleUserStatus(socket, io, data));
    socket.on('quiz:join', (data) => handleQuizJoin(socket, io, data));
    socket.on('quiz:start', (data) => handleQuizStart(socket, io, data));
    socket.on('quiz:answer', (data) => handleQuizAnswer(socket, io, data));
    socket.on('quiz:complete', (data) => handleQuizComplete(socket, io, data));
    socket.on('room:create', (data) => handleRoomCreate(socket, io, data));
    socket.on('room:join', (data) => handleRoomJoin(socket, io, data));
    socket.on('room:leave', (data) => handleRoomLeave(socket, io, data));
    socket.on('challenge:send', (data) => handleChallengeSend(socket, io, data));
    socket.on('challenge:accept', (data) => handleChallengeAccept(socket, io, data));
    socket.on('message:send', (data) => handleMessageSend(socket, io, data));
    socket.on('typing:start', (data) => handleTypingStart(socket, io, data));
    socket.on('typing:stop', (data) => handleTypingStop(socket, io, data));
    
    // Обработчик отключения
    socket.on('disconnect', () => handleDisconnect(socket, io));
    
    logger.websocket(socket.id, socket.userId, 'handlers_registered');
};

// Обработка статуса пользователя
const handleUserStatus = (socket, io, data) => {
    try {
        const { status } = data;
        
        if (!['online', 'away', 'busy', 'offline'].includes(status)) {
            socket.emit('error', { message: 'Неверный статус' });
            return;
        }
        
        socket.user.status = status;
        notifyFriendsStatus(socket, io, status);
        
        logger.websocket(socket.id, socket.userId, 'status_update', { status });
    } catch (error) {
        logger.error('Handle user status error:', error);
        socket.emit('error', { message: 'Ошибка обновления статуса' });
    }
};

// Присоединение к викторине
const handleQuizJoin = (socket, io, data) => {
    try {
        const { quizId, sessionId } = data;
        
        if (!quizId) {
            socket.emit('error', { message: 'ID викторины обязателен' });
            return;
        }
        
        // Присоединяем к комнате викторины
        const roomName = `quiz_${quizId}`;
        socket.join(roomName);
        
        // Сохраняем информацию о сессии
        if (sessionId) {
            socket.currentSession = sessionId;
            
            if (!quizSessions.has(sessionId)) {
                quizSessions.set(sessionId, {
                    quizId,
                    userId: socket.userId,
                    startTime: new Date(),
                    answers: [],
                    currentQuestion: 0
                });
            }
        }
        
        socket.emit('quiz:joined', { 
            quizId, 
            sessionId,
            message: 'Успешно присоединились к викторине' 
        });
        
        logger.websocket(socket.id, socket.userId, 'quiz_join', { quizId, sessionId });
    } catch (error) {
        logger.error('Handle quiz join error:', error);
        socket.emit('error', { message: 'Ошибка присоединения к викторине' });
    }
};

// Начало викторины
const handleQuizStart = (socket, io, data) => {
    try {
        const { sessionId } = data;
        
        if (!sessionId || !quizSessions.has(sessionId)) {
            socket.emit('error', { message: 'Сессия не найдена' });
            return;
        }
        
        const session = quizSessions.get(sessionId);
        session.status = 'active';
        session.startTime = new Date();
        
        socket.emit('quiz:started', {
            sessionId,
            message: 'Викторина началась!',
            startTime: session.startTime
        });
        
        logger.websocket(socket.id, socket.userId, 'quiz_start', { sessionId });
    } catch (error) {
        logger.error('Handle quiz start error:', error);
        socket.emit('error', { message: 'Ошибка начала викторины' });
    }
};

// Ответ на вопрос
const handleQuizAnswer = (socket, io, data) => {
    try {
        const { sessionId, questionId, answer, timeSpent } = data;
        
        if (!sessionId || !quizSessions.has(sessionId)) {
            socket.emit('error', { message: 'Сессия не найдена' });
            return;
        }
        
        const session = quizSessions.get(sessionId);
        
        // Сохраняем ответ
        session.answers.push({
            questionId,
            answer,
            timeSpent,
            timestamp: new Date()
        });
        
        session.currentQuestion++;
        
        socket.emit('quiz:answer_received', {
            sessionId,
            questionNumber: session.currentQuestion,
            message: 'Ответ получен'
        });
        
        logger.websocket(socket.id, socket.userId, 'quiz_answer', { sessionId, questionId });
    } catch (error) {
        logger.error('Handle quiz answer error:', error);
        socket.emit('error', { message: 'Ошибка обработки ответа' });
    }
};

// Завершение викторины
const handleQuizComplete = (socket, io, data) => {
    try {
        const { sessionId } = data;
        
        if (!sessionId || !quizSessions.has(sessionId)) {
            socket.emit('error', { message: 'Сессия не найдена' });
            return;
        }
        
        const session = quizSessions.get(sessionId);
        session.status = 'completed';
        session.endTime = new Date();
        session.duration = session.endTime - session.startTime;
        
        socket.emit('quiz:completed', {
            sessionId,
            duration: session.duration,
            answersCount: session.answers.length,
            message: 'Викторина завершена!'
        });
        
        // Уведомляем друзей о достижении
        notifyFriendsAchievement(socket, io, {
            type: 'quiz_completed',
            quizId: session.quizId,
            score: session.score || 0
        });
        
        // Очищаем сессию через некоторое время
        setTimeout(() => {
            quizSessions.delete(sessionId);
        }, 5 * 60 * 1000); // 5 минут
        
        logger.websocket(socket.id, socket.userId, 'quiz_complete', { sessionId });
    } catch (error) {
        logger.error('Handle quiz complete error:', error);
        socket.emit('error', { message: 'Ошибка завершения викторины' });
    }
};

// Создание комнаты
const handleRoomCreate = (socket, io, data) => {
    try {
        const { quizId, maxPlayers = 4, isPrivate = false } = data;
        
        if (!quizId) {
            socket.emit('error', { message: 'ID викторины обязателен' });
            return;
        }
        
        const roomId = `room_${Date.now()}_${Math.random().toString(36).slice(2)}`;
        
        const room = {
            id: roomId,
            quizId,
            creator: socket.userId,
            maxPlayers,
            isPrivate,
            players: [{
                userId: socket.userId,
                username: socket.user.username,
                socketId: socket.id,
                ready: false,
                joinedAt: new Date()
            }],
            status: 'waiting', // waiting, playing, finished
            createdAt: new Date()
        };
        
        gameRooms.set(roomId, room);
        socket.join(roomId);
        socket.currentRoom = roomId;
        
        socket.emit('room:created', {
            room: {
                ...room,
                players: room.players.map(p => ({
                    userId: p.userId,
                    username: p.username,
                    ready: p.ready,
                    joinedAt: p.joinedAt
                }))
            }
        });
        
        logger.websocket(socket.id, socket.userId, 'room_create', { roomId, quizId });
    } catch (error) {
        logger.error('Handle room create error:', error);
        socket.emit('error', { message: 'Ошибка создания комнаты' });
    }
};

// Присоединение к комнате
const handleRoomJoin = (socket, io, data) => {
    try {
        const { roomId } = data;
        
        if (!roomId || !gameRooms.has(roomId)) {
            socket.emit('error', { message: 'Комната не найдена' });
            return;
        }
        
        const room = gameRooms.get(roomId);
        
        if (room.players.length >= room.maxPlayers) {
            socket.emit('error', { message: 'Комната заполнена' });
            return;
        }
        
        if (room.status !== 'waiting') {
            socket.emit('error', { message: 'Игра уже началась' });
            return;
        }
        
        // Проверяем, не в комнате ли уже пользователь
        const existingPlayer = room.players.find(p => p.userId === socket.userId);
        if (existingPlayer) {
            socket.emit('error', { message: 'Вы уже в этой комнате' });
            return;
        }
        
        // Добавляем игрока
        room.players.push({
            userId: socket.userId,
            username: socket.user.username,
            socketId: socket.id,
            ready: false,
            joinedAt: new Date()
        });
        
        socket.join(roomId);
        socket.currentRoom = roomId;
        
        // Уведомляем всех в комнате
        io.to(roomId).emit('room:player_joined', {
            player: {
                userId: socket.userId,
                username: socket.user.username,
                joinedAt: new Date()
            },
            playersCount: room.players.length,
            maxPlayers: room.maxPlayers
        });
        
        logger.websocket(socket.id, socket.userId, 'room_join', { roomId });
    } catch (error) {
        logger.error('Handle room join error:', error);
        socket.emit('error', { message: 'Ошибка присоединения к комнате' });
    }
};

// Покинуть комнату
const handleRoomLeave = (socket, io, data) => {
    try {
        const roomId = data?.roomId || socket.currentRoom;
        
        if (!roomId || !gameRooms.has(roomId)) {
            return;
        }
        
        const room = gameRooms.get(roomId);
        const playerIndex = room.players.findIndex(p => p.userId === socket.userId);
        
        if (playerIndex === -1) {
            return;
        }
        
        // Удаляем игрока
        room.players.splice(playerIndex, 1);
        socket.leave(roomId);
        socket.currentRoom = null;
        
        // Если комната пустая, удаляем её
        if (room.players.length === 0) {
            gameRooms.delete(roomId);
            logger.websocket(socket.id, socket.userId, 'room_deleted', { roomId });
            return;
        }
        
        // Если создатель ушел, назначаем нового
        if (room.creator === socket.userId && room.players.length > 0) {
            room.creator = room.players[0].userId;
        }
        
        // Уведомляем оставшихся игроков
        io.to(roomId).emit('room:player_left', {
            userId: socket.userId,
            playersCount: room.players.length,
            newCreator: room.creator
        });
        
        logger.websocket(socket.id, socket.userId, 'room_leave', { roomId });
    } catch (error) {
        logger.error('Handle room leave error:', error);
    }
};

// Отправка вызова
const handleChallengeSend = (socket, io, data) => {
    try {
        const { opponentId, quizId, message } = data;
        
        if (!opponentId || !quizId) {
            socket.emit('error', { message: 'ID противника и викторины обязательны' });
            return;
        }
        
        const opponentSocket = activeUsers.get(opponentId);
        
        if (!opponentSocket) {
            socket.emit('error', { message: 'Пользователь не в сети' });
            return;
        }
        
        const challenge = {
            id: `challenge_${Date.now()}`,
            from: {
                userId: socket.userId,
                username: socket.user.username,
                avatar: socket.user.profile?.avatar
            },
            to: opponentId,
            quizId,
            message,
            createdAt: new Date(),
            expiresAt: new Date(Date.now() + 5 * 60 * 1000) // 5 минут
        };
        
        // Отправляем вызов
        opponentSocket.emit('challenge:received', challenge);
        
        socket.emit('challenge:sent', {
            challengeId: challenge.id,
            message: 'Вызов отправлен!'
        });
        
        logger.websocket(socket.id, socket.userId, 'challenge_send', { opponentId, quizId });
    } catch (error) {
        logger.error('Handle challenge send error:', error);
        socket.emit('error', { message: 'Ошибка отправки вызова' });
    }
};

// Принятие вызова
const handleChallengeAccept = (socket, io, data) => {
    try {
        const { challengeId } = data;
        
        if (!challengeId) {
            socket.emit('error', { message: 'ID вызова обязателен' });
            return;
        }
        
        // Здесь должна быть логика поиска и валидации вызова
        // Пока что просто эмитим успех
        
        socket.emit('challenge:accepted', {
            challengeId,
            message: 'Вызов принят! Готовимся к дуэли...'
        });
        
        logger.websocket(socket.id, socket.userId, 'challenge_accept', { challengeId });
    } catch (error) {
        logger.error('Handle challenge accept error:', error);
        socket.emit('error', { message: 'Ошибка принятия вызова' });
    }
};

// Отправка сообщения
const handleMessageSend = (socket, io, data) => {
    try {
        const { recipientId, content, type = 'text' } = data;
        
        if (!recipientId || !content) {
            socket.emit('error', { message: 'Получатель и содержимое сообщения обязательны' });
            return;
        }
        
        const recipientSocket = activeUsers.get(recipientId);
        
        const message = {
            id: `msg_${Date.now()}`,
            from: {
                userId: socket.userId,
                username: socket.user.username,
                avatar: socket.user.profile?.avatar
            },
            content,
            type,
            timestamp: new Date()
        };
        
        if (recipientSocket) {
            recipientSocket.emit('message:received', message);
        }
        
        socket.emit('message:sent', {
            messageId: message.id,
            status: recipientSocket ? 'delivered' : 'offline'
        });
        
        logger.websocket(socket.id, socket.userId, 'message_send', { recipientId, type });
    } catch (error) {
        logger.error('Handle message send error:', error);
        socket.emit('error', { message: 'Ошибка отправки сообщения' });
    }
};

// Индикатор печатания
const handleTypingStart = (socket, io, data) => {
    try {
        const { recipientId } = data;
        
        if (!recipientId) return;
        
        const recipientSocket = activeUsers.get(recipientId);
        if (recipientSocket) {
            recipientSocket.emit('typing:started', {
                userId: socket.userId,
                username: socket.user.username
            });
        }
    } catch (error) {
        logger.error('Handle typing start error:', error);
    }
};

const handleTypingStop = (socket, io, data) => {
    try {
        const { recipientId } = data;
        
        if (!recipientId) return;
        
        const recipientSocket = activeUsers.get(recipientId);
        if (recipientSocket) {
            recipientSocket.emit('typing:stopped', {
                userId: socket.userId
            });
        }
    } catch (error) {
        logger.error('Handle typing stop error:', error);
    }
};

// Обработка отключения
const handleDisconnect = (socket, io) => {
    try {
        // Удаляем из активных пользователей
        activeUsers.delete(socket.userId);
        
        // Уведомляем друзей об офлайн статусе
        notifyFriendsStatus(socket, io, 'offline');
        
        // Покидаем все комнаты
        if (socket.currentRoom) {
            handleRoomLeave(socket, io, { roomId: socket.currentRoom });
        }
        
        // Очищаем активные сессии
        if (socket.currentSession) {
            const session = quizSessions.get(socket.currentSession);
            if (session) {
                session.status = 'abandoned';
                session.endTime = new Date();
            }
        }
        
        logger.websocket(socket.id, socket.userId, 'disconnect');
    } catch (error) {
        logger.error('Handle disconnect error:', error);
    }
};

// Уведомление друзей о статусе
const notifyFriendsStatus = async (socket, io, status) => {
    try {
        // Здесь должна быть логика получения списка друзей из базы
        // и отправки им уведомлений о смене статуса
        
        const friendsIds = socket.user.friends?.map(f => f.userId.toString()) || [];
        
        friendsIds.forEach(friendId => {
            const friendSocket = activeUsers.get(friendId);
            if (friendSocket) {
                friendSocket.emit('friend:status_changed', {
                    userId: socket.userId,
                    username: socket.user.username,
                    status,
                    timestamp: new Date()
                });
            }
        });
    } catch (error) {
        logger.error('Notify friends status error:', error);
    }
};

// Уведомление друзей о достижении
const notifyFriendsAchievement = async (socket, io, achievement) => {
    try {
        const friendsIds = socket.user.friends?.map(f => f.userId.toString()) || [];
        
        friendsIds.forEach(friendId => {
            const friendSocket = activeUsers.get(friendId);
            if (friendSocket) {
                friendSocket.emit('friend:achievement', {
                    userId: socket.userId,
                    username: socket.user.username,
                    achievement,
                    timestamp: new Date()
                });
            }
        });
    } catch (error) {
        logger.error('Notify friends achievement error:', error);
    }
};

// Экспорт всех обработчиков
module.exports = {
    registerHandlers,
    activeUsers,
    gameRooms,
    quizSessions
};