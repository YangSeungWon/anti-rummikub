const socketIO = require('socket.io');
const redisClient = require('../config/redis');

// 활성 게임 세션 저장 (실제로는 Redis에 저장)
const activeSessions = new Map();

// 사용자-소켓 매핑 (실제로는 Redis에 저장)
const userSockets = new Map();

function initializeWebSocket(server) {
    const io = socketIO(server, {
        cors: {
            origin: process.env.CORS_ORIGIN || '*',
            methods: ['GET', 'POST']
        }
    });

    // 소켓 연결 이벤트
    io.on('connection', (socket) => {
        console.log(`새로운 클라이언트 연결: ${socket.id}`);

        // 게임 입장
        socket.on('joinGame', (data) => {
            const { gameId, userId, username } = data;

            if (!gameId || !userId) {
                return socket.emit('error', { message: '게임 ID와 사용자 ID는 필수입니다.' });
            }

            // 게임 세션 생성 또는 참가
            if (!activeSessions.has(gameId)) {
                activeSessions.set(gameId, {
                    id: gameId,
                    players: new Map(),
                    votes: new Map(),
                    currentRound: null,
                    status: 'waiting'
                });
            }

            const gameSession = activeSessions.get(gameId);

            // 플레이어 추가
            gameSession.players.set(userId, {
                id: userId,
                username,
                isReady: false,
                score: 0,
                socketId: socket.id
            });

            // 소켓을 해당 게임의 방에 참가
            socket.join(gameId);

            // 사용자-소켓 매핑 업데이트
            userSockets.set(userId, socket.id);

            // 모든 플레이어에게 게임 참가 알림
            io.to(gameId).emit('playerJoined', {
                playerId: userId,
                username,
                players: Array.from(gameSession.players.values())
            });
        });

        // 준비 상태 토글
        socket.on('toggleReady', (data) => {
            const { gameId, userId } = data;

            if (!gameId || !userId) {
                return socket.emit('error', { message: '게임 ID와 사용자 ID는 필수입니다.' });
            }

            const gameSession = activeSessions.get(gameId);

            if (!gameSession) {
                return socket.emit('error', { message: '게임을 찾을 수 없습니다.' });
            }

            const player = gameSession.players.get(userId);

            if (!player) {
                return socket.emit('error', { message: '게임에 참가하지 않은 플레이어입니다.' });
            }

            // 준비 상태 변경
            player.isReady = !player.isReady;

            // 모든 플레이어에게 준비 상태 변경 알림
            io.to(gameId).emit('playerReadyChanged', {
                playerId: userId,
                isReady: player.isReady,
                players: Array.from(gameSession.players.values())
            });

            // 모든 플레이어가 준비 상태면 게임 시작
            const allReady = Array.from(gameSession.players.values()).every(p => p.isReady);
            const minPlayers = 2; // 최소 2명 이상

            if (allReady && gameSession.players.size >= minPlayers) {
                // 게임 시작 처리
                startGame(gameId);
            }
        });

        // 투표 전송
        socket.on('vote', (data) => {
            const { gameId, userId, explanationId, isPositive } = data;

            if (!gameId || !userId || explanationId === undefined || isPositive === undefined) {
                return socket.emit('error', { message: '필수 파라미터가 누락되었습니다.' });
            }

            const gameSession = activeSessions.get(gameId);

            if (!gameSession) {
                return socket.emit('error', { message: '게임을 찾을 수 없습니다.' });
            }

            // 투표 기록
            if (!gameSession.votes.has(explanationId)) {
                gameSession.votes.set(explanationId, new Map());
            }

            const explanationVotes = gameSession.votes.get(explanationId);
            explanationVotes.set(userId, isPositive);

            // 실시간 투표 업데이트
            io.to(gameId).emit('voteUpdate', {
                explanationId,
                positive: Array.from(explanationVotes.values()).filter(v => v).length,
                negative: Array.from(explanationVotes.values()).filter(v => !v).length
            });
        });

        // 채팅 메시지
        socket.on('chatMessage', (data) => {
            const { gameId, userId, username, message } = data;

            if (!gameId || !userId || !message) {
                return socket.emit('error', { message: '필수 파라미터가 누락되었습니다.' });
            }

            // 모든 플레이어에게 채팅 메시지 전달
            io.to(gameId).emit('newChatMessage', {
                userId,
                username,
                message,
                timestamp: new Date()
            });
        });

        // 연결 해제
        socket.on('disconnect', () => {
            console.log(`클라이언트 연결 해제: ${socket.id}`);

            // 연결 해제 처리 로직...
        });
    });

    return io;
}

// 게임 시작 함수
function startGame(gameId) {
    const gameSession = activeSessions.get(gameId);

    if (!gameSession) {
        return;
    }

    // 게임 상태 변경
    gameSession.status = 'playing';
    gameSession.currentRound = 1;

    // 첫 설명자 선택 (임의)
    const players = Array.from(gameSession.players.values());
    const explainer = players[Math.floor(Math.random() * players.length)];

    // 게임 시작 알림
    const io = require('socket.io').instance; // 싱글톤 인스턴스
    io.to(gameId).emit('gameStarted', {
        status: 'playing',
        currentRound: 1,
        explainer: {
            id: explainer.id,
            username: explainer.username
        },
        // 임의의 주제 (실제로는 DB에서 가져올 것)
        topic: {
            id: 'topic-123',
            content: '자신의 체취를 좋아하는 냄새탐지견',
            category: '유머',
            difficulty: 2
        }
    });
}

module.exports = { initializeWebSocket }; 