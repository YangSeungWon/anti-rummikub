const express = require('express');
const router = express.Router();
const gameController = require('../controllers/gameController');
const { authMiddleware } = require('../middlewares/auth');

// 게임 목록 조회
router.get('/', gameController.getGames);

// 특정 게임 조회
router.get('/:gameId', gameController.getGame);

// 게임 생성
router.post('/', authMiddleware, gameController.createGame);

// 게임 참가
router.post('/:gameId/join', authMiddleware, gameController.joinGame);

// 게임 떠나기
router.post('/:gameId/leave', authMiddleware, gameController.leaveGame);

// 게임 시작
router.post('/:gameId/start', authMiddleware, gameController.startGame);

// 게임 종료
router.post('/:gameId/end', authMiddleware, gameController.endGame);

module.exports = router; 