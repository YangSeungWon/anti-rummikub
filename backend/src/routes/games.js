const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');

// 게임 컨트롤러는 나중에 구현
// const gamesController = require('../controllers/games');

// 임시 게임 데이터
const games = [];

/**
 * @route GET /api/games
 * @desc 게임 목록 조회
 * @access Public
 */
router.get('/', (req, res) => {
    res.json({
        success: true,
        games: games.map(g => ({
            id: g.id,
            name: g.name,
            players: g.currentPlayers,
            maxPlayers: g.maxPlayers,
            status: g.status
        }))
    });
});

/**
 * @route POST /api/games
 * @desc 새 게임 생성
 * @access Private
 */
router.post('/', (req, res) => {
    const { name, maxPlayers = 8, isPrivate = false } = req.body;

    // 유효성 검사
    if (!name) {
        return res.status(400).json({ success: false, message: "게임 이름은 필수입니다." });
    }

    // 새 게임 생성
    const newGame = {
        id: uuidv4(),
        name,
        maxPlayers: parseInt(maxPlayers),
        currentPlayers: 1,
        isPrivate,
        status: 'waiting',
        createdAt: new Date(),
        creatorId: 'temporary-user-id' // 실제로는 인증 미들웨어에서 가져올 유저 ID
    };

    games.push(newGame);

    res.status(201).json({ success: true, game: newGame });
});

/**
 * @route GET /api/games/:id
 * @desc 특정 게임 정보 조회
 * @access Public
 */
router.get('/:id', (req, res) => {
    const game = games.find(g => g.id === req.params.id);

    if (!game) {
        return res.status(404).json({ success: false, message: "게임을 찾을 수 없습니다." });
    }

    res.json({ success: true, game });
});

/**
 * @route PUT /api/games/:id
 * @desc 게임 정보 업데이트
 * @access Private
 */
router.put('/:id', (req, res) => {
    const gameIndex = games.findIndex(g => g.id === req.params.id);

    if (gameIndex === -1) {
        return res.status(404).json({ success: false, message: "게임을 찾을 수 없습니다." });
    }

    // 간단한 업데이트 처리
    const updatedGame = {
        ...games[gameIndex],
        ...req.body,
        updatedAt: new Date()
    };

    games[gameIndex] = updatedGame;

    res.json({ success: true, game: updatedGame });
});

/**
 * @route POST /api/games/:id/join
 * @desc 게임 참가
 * @access Private
 */
router.post('/:id/join', (req, res) => {
    const game = games.find(g => g.id === req.params.id);

    if (!game) {
        return res.status(404).json({ success: false, message: "게임을 찾을 수 없습니다." });
    }

    if (game.currentPlayers >= game.maxPlayers) {
        return res.status(400).json({ success: false, message: "게임이 이미 꽉 찼습니다." });
    }

    if (game.status !== 'waiting') {
        return res.status(400).json({ success: false, message: "진행 중인 게임에는 참가할 수 없습니다." });
    }

    // 간단한 참가 처리
    game.currentPlayers += 1;

    res.json({ success: true, game });
});

module.exports = router; 