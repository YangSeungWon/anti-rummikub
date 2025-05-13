const { Server } = require('socket.io');
const config = require('../config/env');
const Game = require('../models/Game');
const Round = require('../models/Round');
const redis = require('../config/redis');

// 게임 ID와 소켓 연결 정보 매핑 (메모리 스토리지)
const gameConnections = new Map(); // gameId -> Set(socketId)

// 소켓 ID와 게임, 유저 정보 매핑
const socketConnections = new Map(); // socketId -> { gameId, userId, username }

/**
 * WebSocket 서버 초기화
 */
const initializeWebSocket = (httpServer) => {
    const io = new Server(httpServer, {
        cors: {
            origin: config.CORS_ORIGIN,
            methods: ['GET', 'POST'],
            credentials: true
        }
    });

    console.log('WebSocket 서버 초기화');

    io.on('connection', (socket) => {
        console.log(`클라이언트 연결됨: ${socket.id}`);

        // 게임 방 참가
        socket.on('joinGame', async (data) => {
            try {
                const { gameId, userId, username } = data;

                if (!gameId || !userId || !username) {
                    socket.emit('error', { message: '필수 정보가 누락되었습니다.' });
                    return;
                }

                console.log(`사용자 ${username}(${userId})이 게임 ${gameId}에 참가했습니다.`);

                // 게임 연결 정보 업데이트
                if (!gameConnections.has(gameId)) {
                    gameConnections.set(gameId, new Set());
                }
                gameConnections.get(gameId).add(socket.id);

                // 소켓 연결 정보 저장
                socketConnections.set(socket.id, { gameId, userId, username });

                // 소켓을 게임 방에 참가시킴
                socket.join(gameId);

                // DB의 socket_id 업데이트
                await updateSocketIdInDb(gameId, userId, socket.id);

                // 현재 게임 상태 조회
                const gameState = await Game.getGameState(gameId);

                // 방의 다른 참가자들에게 새 참가자 알림
                socket.to(gameId).emit('playerJoined', {
                    playerId: userId,
                    username: username,
                    players: gameState.players
                });

                // 참가자 자신에게도 현재 플레이어 목록 전송
                socket.emit('gameState', gameState);
            } catch (error) {
                console.error('게임 참가 오류:', error);
                socket.emit('error', { message: '게임 참가 중 오류가 발생했습니다.' });
            }
        });

        // 준비 상태 변경
        socket.on('toggleReady', async (data) => {
            try {
                const { gameId, userId } = data;

                if (!gameId || !userId) {
                    socket.emit('error', { message: '필수 정보가 누락되었습니다.' });
                    return;
                }

                // 준비 상태 토글
                const isReady = await Game.toggleReady(gameId, userId);

                // 현재 게임 상태 조회
                const gameState = await Game.getGameState(gameId);

                // 방의 모든 참가자에게 준비 상태 변경 알림
                io.to(gameId).emit('playerReadyChanged', {
                    playerId: userId,
                    isReady,
                    players: gameState.players
                });

                // 모든 플레이어가 준비 완료인지 확인
                const allReady = gameState.players.every(player => player.isReady);
                const enoughPlayers = gameState.players.length >= 2;

                // 자동 게임 시작 조건 확인 (모두 준비 완료 시)
                if (allReady && enoughPlayers && gameState.status === 'waiting') {
                    // 게임 생성자 확인
                    const creatorPlayer = gameState.players.find(p => p.id === gameState.creatorId);

                    if (creatorPlayer) {
                        // 게임 시작
                        const startedGameState = await Game.start(gameId);

                        // 게임 시작 이벤트 발송
                        io.to(gameId).emit('gameStarted', {
                            gameId,
                            currentRound: startedGameState.currentRound?.roundNumber || 1,
                            explainer: {
                                id: startedGameState.currentRound?.explainerId,
                                username: gameState.players.find(
                                    p => p.id === startedGameState.currentRound?.explainerId
                                )?.username
                            },
                            topic: startedGameState.currentRound?.topic
                        });
                    }
                }
            } catch (error) {
                console.error('준비 상태 변경 오류:', error);
                socket.emit('error', { message: '준비 상태 변경 중 오류가 발생했습니다.' });
            }
        });

        // 투표
        socket.on('vote', async (data) => {
            try {
                const { gameId, userId, roundId, isPositive } = data;

                if (!gameId || !userId || !roundId || isPositive === undefined) {
                    socket.emit('error', { message: '필수 정보가 누락되었습니다.' });
                    return;
                }

                // 투표 처리
                const votes = await Round.vote(roundId, userId, isPositive);

                // 현재 게임 상태 조회
                const gameState = await Game.getGameState(gameId);

                // 방의 모든 참가자에게 투표 상태 업데이트 알림
                io.to(gameId).emit('voteUpdate', {
                    gameId,
                    roundId,
                    votes,
                    players: gameState.players
                });

                // 모든 참가자가 투표했는지 확인
                const totalPlayers = gameState.players.length;
                const explainerId = gameState.currentRound?.explainerId;
                const totalVoters = totalPlayers - 1; // 설명자 제외
                const totalVotes = votes.positive + votes.negative;

                // 투표가 완료되면 자동으로 턴 종료
                if (totalVotes >= totalVoters) {
                    // 턴 종료 및 점수 계산
                    const endResult = await Round.end(roundId);

                    // 턴 종료 이벤트 발송
                    io.to(gameId).emit('turnEnded', {
                        gameId,
                        roundId,
                        isExplanationAccepted: endResult.isExplanationAccepted,
                        scoreUpdates: endResult.scoreUpdates,
                        nextRound: endResult.nextRound
                    });
                }
            } catch (error) {
                console.error('투표 오류:', error);
                socket.emit('error', { message: '투표 처리 중 오류가 발생했습니다.' });
            }
        });

        // 채팅 메시지
        socket.on('chatMessage', (data) => {
            try {
                const { gameId, userId, username, message } = data;

                if (!gameId || !userId || !username || !message) {
                    socket.emit('error', { message: '필수 정보가 누락되었습니다.' });
                    return;
                }

                const timestamp = new Date().toISOString();

                // 채팅 메시지를 방의 모든 참가자에게 전송
                io.to(gameId).emit('newChatMessage', {
                    userId,
                    username,
                    message,
                    timestamp
                });
            } catch (error) {
                console.error('채팅 메시지 오류:', error);
                socket.emit('error', { message: '채팅 메시지 전송 중 오류가 발생했습니다.' });
            }
        });

        // 연결 종료
        socket.on('disconnect', async () => {
            console.log(`클라이언트 연결 종료: ${socket.id}`);

            // 연결 정보 확인
            const connection = socketConnections.get(socket.id);

            if (connection) {
                const { gameId, userId, username } = connection;

                // 게임 연결 정보 업데이트
                if (gameConnections.has(gameId)) {
                    gameConnections.get(gameId).delete(socket.id);

                    // 빈 게임 방이면 정보 제거
                    if (gameConnections.get(gameId).size === 0) {
                        gameConnections.delete(gameId);
                    }
                }

                // 소켓 연결 정보 제거
                socketConnections.delete(socket.id);

                try {
                    // DB의 socket_id 업데이트 (연결 종료)
                    await updateSocketIdInDb(gameId, userId, null);

                    // 현재 게임 상태 조회
                    const gameState = await Game.getGameState(gameId);

                    // 방의 다른 참가자들에게 연결 종료 알림
                    socket.to(gameId).emit('playerDisconnected', {
                        playerId: userId,
                        username,
                        players: gameState.players
                    });
                } catch (error) {
                    console.error('연결 종료 처리 오류:', error);
                }
            }
        });
    });

    return io;
};

/**
 * DB에 소켓 ID 업데이트
 */
async function updateSocketIdInDb(gameId, userId, socketId) {
    try {
        const query = `
      UPDATE game_participants 
      SET socket_id = $1 
      WHERE game_id = $2 AND user_id = $3
    `;

        await require('../config/db').query(query, [socketId, gameId, userId]);
    } catch (error) {
        console.error('소켓 ID 업데이트 오류:', error);
        throw error;
    }
}

module.exports = { initializeWebSocket }; 