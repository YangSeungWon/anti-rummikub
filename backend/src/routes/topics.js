const express = require('express');
const router = express.Router();
const topicController = require('../controllers/topicController');
const { authMiddleware } = require('../middlewares/auth');

// 주제 목록 조회
router.get('/', topicController.getTopics);

// 랜덤 주제 조회
router.get('/random', topicController.getRandomTopic);

// 특정 주제 조회
router.get('/:topicId', topicController.getTopic);

// 주제 생성 (관리자 전용)
router.post('/', authMiddleware, topicController.createTopic);

// 주제 활성화/비활성화 토글 (관리자 전용)
router.patch('/:topicId/toggle', authMiddleware, topicController.toggleTopicActive);

module.exports = router; 