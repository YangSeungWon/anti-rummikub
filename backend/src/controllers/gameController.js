const Game = require('../models/Game');
const Round = require('../models/Round');

/**
 * 게임 목록 조회
 */
const getGames = async (req, res) => {
    try {
        const games = await Game.findAll();

        res.status(200).json({
            success: true,
            games
        });
    } catch (error) {
        console.error('게임 목록 조회 오류:', error);

        res.status(500).json({
            success: false,
            message: '게임 목록을 조회하는 중 오류가 발생했습니다.'
        });
    }
};

/**
 * 게임 생성
 */
const createGame = async (req, res) => {
    try {
        const { name, maxPlayers, isPrivate } = req.body;
        const user = req.user;

        // 게임 이름 필수 확인
        if (!name) {
            return res.status(400).json({
                success: false,
                message: '게임 이름이 필요합니다.'
            });
        }

        // 게임 생성
        const gameData = {
            name,
            maxPlayers: maxPlayers || 8, // 기본값 8
            isPrivate: isPrivate || false, // 기본값 false
            creatorId: user.id
        };

        const game = await Game.create(gameData);

        res.status(201).json({
            success: true,
            message: '게임이 생성되었습니다.',
            game
        });
    } catch (error) {
        console.error('게임 생성 오류:', error);

        res.status(500).json({
            success: false,
            message: '게임을 생성하는 중 오류가 발생했습니다.'
        });
    }
};

/**
 * 특정 게임 조회
 */
const getGame = async (req, res) => {
    try {
        const { gameId } = req.params;

        const gameState = await Game.getGameState(gameId);

        if (!gameState) {
            return res.status(404).json({
                success: false,
                message: '게임을 찾을 수 없습니다.'
            });
        }

        res.status(200).json({
            success: true,
            game: gameState
        });
    } catch (error) {
        console.error('게임 조회 오류:', error);

        res.status(500).json({
            success: false,
            message: '게임을 조회하는 중 오류가 발생했습니다.'
        });
    }
};

/**
 * 게임 참가
 */
const joinGame = async (req, res) => {
    try {
        const { gameId } = req.params;
        const user = req.user;

        const gameState = await Game.join(gameId, user.id);

        res.status(200).json({
            success: true,
            message: '게임에 참가했습니다.',
            gameState
        });
    } catch (error) {
        console.error('게임 참가 오류:', error);

        if (error.message.includes('이미 참가')) {
            return res.status(409).json({
                success: false,
                message: error.message
            });
        }
        if (error.message.includes('가득') || error.message.includes('시작된 게임')) {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }

        res.status(500).json({
            success: false,
            message: '게임에 참가하는 중 오류가 발생했습니다.'
        });
    }
};

/**
 * 게임 떠나기
 */
const leaveGame = async (req, res) => {
    try {
        const { gameId } = req.params;
        const user = req.user;

        // 게임에서 나가기
        await Game.leave(gameId, user.id);

        res.status(200).json({
            success: true,
            message: '게임에서 나갔습니다.'
        });
    } catch (error) {
        console.error('게임 떠나기 오류:', error);

        if (error.message.includes('참가하지 않았거나') || error.message.includes('찾을 수 없습니다')) {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }

        res.status(500).json({
            success: false,
            message: '게임에서 나가는 중 오류가 발생했습니다.'
        });
    }
};

/**
 * 게임 시작
 */
const startGame = async (req, res) => {
    try {
        const { gameId } = req.params;
        const user = req.user;

        // 게임 상태 확인
        const game = await Game.findById(gameId);

        if (!game) {
            return res.status(404).json({
                success: false,
                message: '게임을 찾을 수 없습니다.'
            });
        }

        // 방장만 게임을 시작할 수 있음
        if (game.creatorId !== user.id) {
            return res.status(403).json({
                success: false,
                message: '방장만 게임을 시작할 수 있습니다.'
            });
        }

        // 게임 시작
        const gameState = await Game.start(gameId);

        res.status(200).json({
            success: true,
            message: '게임이 시작되었습니다.',
            gameState
        });
    } catch (error) {
        console.error('게임 시작 오류:', error);

        if (error.message.includes('최소') || error.message.includes('준비 상태') || error.message.includes('이미 시작된')) {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }

        res.status(500).json({
            success: false,
            message: '게임을 시작하는 중 오류가 발생했습니다.'
        });
    }
};

/**
 * 턴 시작
 */
const startTurn = async (req, res) => {
    try {
        const { gameId } = req.params;
        const user = req.user;

        // 현재 라운드 조회
        const currentRound = await Round.getCurrentRound(gameId);

        if (!currentRound) {
            return res.status(404).json({
                success: false,
                message: '현재 라운드 정보를 찾을 수 없습니다.'
            });
        }

        // 설명자만 턴을 시작할 수 있음
        if (currentRound.explainerId !== user.id) {
            return res.status(403).json({
                success: false,
                message: '설명자만 턴을 시작할 수 있습니다.'
            });
        }

        // 이미 시작된 라운드인지 확인
        if (currentRound.status !== 'waiting') {
            return res.status(400).json({
                success: false,
                message: '이미 시작된 라운드입니다.'
            });
        }

        // 라운드 시작
        const startedRound = await Round.start(currentRound.id);

        res.status(200).json({
            success: true,
            message: '턴이 시작되었습니다.',
            roundId: startedRound.id,
            turnStartAt: startedRound.startTime,
            gracePeriod: 5 // 5초의 준비 시간
        });
    } catch (error) {
        console.error('턴 시작 오류:', error);

        res.status(500).json({
            success: false,
            message: '턴을 시작하는 중 오류가 발생했습니다.'
        });
    }
};

/**
 * 투표 처리
 */
const vote = async (req, res) => {
    try {
        const { gameId } = req.params;
        const { roundId, vote: voteType } = req.body;
        const user = req.user;

        if (!roundId || !voteType) {
            return res.status(400).json({
                success: false,
                message: '라운드 ID와 투표 유형이 필요합니다.'
            });
        }

        const isPositive = voteType === 'yes';

        // 투표 처리
        const voteResult = await Round.vote(roundId, user.id, isPositive);

        // 투표 결과 확인 (모든 참가자가 투표했는지)
        // 실제 구현에서는 소켓으로 실시간 업데이트

        res.status(200).json({
            success: true,
            message: '투표가 처리되었습니다.',
            roundId,
            votes: voteResult
        });
    } catch (error) {
        console.error('투표 처리 오류:', error);

        if (error.message.includes('설명자는 투표할 수 없습니다')) {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }

        res.status(500).json({
            success: false,
            message: '투표를 처리하는 중 오류가 발생했습니다.'
        });
    }
};

/**
 * 턴 종료 및 점수 계산
 */
const endTurn = async (req, res) => {
    try {
        const { gameId } = req.params;
        const { roundId } = req.body;

        if (!roundId) {
            return res.status(400).json({
                success: false,
                message: '라운드 ID가 필요합니다.'
            });
        }

        // 턴 종료 및 점수 계산
        const endResult = await Round.end(roundId);

        res.status(200).json({
            success: true,
            message: '턴이 종료되었습니다.',
            roundId: endResult.roundId,
            isExplanationAccepted: endResult.isExplanationAccepted,
            scoreUpdates: endResult.scoreUpdates,
            nextRound: endResult.nextRound
        });
    } catch (error) {
        console.error('턴 종료 오류:', error);

        res.status(500).json({
            success: false,
            message: '턴을 종료하는 중 오류가 발생했습니다.'
        });
    }
};

/**
 * 게임 종료
 */
const endGame = async (req, res) => {
    try {
        const { gameId } = req.params;
        const user = req.user;

        // 게임 상태 확인
        const game = await Game.findById(gameId);

        if (!game) {
            return res.status(404).json({
                success: false,
                message: '게임을 찾을 수 없습니다.'
            });
        }

        // 방장만 게임을 종료할 수 있음
        if (game.creatorId !== user.id) {
            return res.status(403).json({
                success: false,
                message: '방장만 게임을 종료할 수 있습니다.'
            });
        }

        // 게임 종료
        const gameState = await Game.end(gameId);

        res.status(200).json({
            success: true,
            message: '게임이 종료되었습니다.',
            gameState
        });
    } catch (error) {
        console.error('게임 종료 오류:', error);

        res.status(500).json({
            success: false,
            message: '게임을 종료하는 중 오류가 발생했습니다.'
        });
    }
};

module.exports = {
    getGames,
    createGame,
    getGame,
    joinGame,
    leaveGame,
    startGame,
    startTurn,
    vote,
    endTurn,
    endGame
}; 