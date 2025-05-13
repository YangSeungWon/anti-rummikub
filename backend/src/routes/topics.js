const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');

// 주제 컨트롤러는 나중에 구현
// const topicsController = require('../controllers/topics');

// 임시 주제 데이터
const topics = [
    { id: uuidv4(), content: '자꾸 친구를 덫에 빠뜨리는 사과나무', category: '유머', difficulty: 1, isActive: true },
    { id: uuidv4(), content: '주인을 망각하게 만드는 반려동물', category: '유머', difficulty: 2, isActive: true },
    { id: uuidv4(), content: '지나치게 정직한 GPS 내비게이션', category: '유머', difficulty: 1, isActive: true },
    { id: uuidv4(), content: '밤에만 귀신이 나오는 복사기', category: '공포', difficulty: 3, isActive: true },
    { id: uuidv4(), content: '악취를 풍기는 고급 향수', category: '아이러니', difficulty: 2, isActive: true }
];

/**
 * @route GET /api/topics
 * @desc 주제 목록 조회
 * @access Public
 */
router.get('/', (req, res) => {
    const { category, difficulty } = req.query;

    let filteredTopics = [...topics];

    // 카테고리 필터링
    if (category) {
        filteredTopics = filteredTopics.filter(t => t.category === category);
    }

    // 난이도 필터링
    if (difficulty) {
        filteredTopics = filteredTopics.filter(t => t.difficulty === parseInt(difficulty));
    }

    // 활성화된 주제만 필터링
    filteredTopics = filteredTopics.filter(t => t.isActive);

    res.json({ success: true, topics: filteredTopics });
});

/**
 * @route GET /api/topics/random
 * @desc 랜덤 주제 추출
 * @access Public
 */
router.get('/random', (req, res) => {
    const { category } = req.query;

    // 활성화된 주제만 필터링
    let availableTopics = topics.filter(t => t.isActive);

    // 카테고리 필터링
    if (category) {
        availableTopics = availableTopics.filter(t => t.category === category);
    }

    if (availableTopics.length === 0) {
        return res.status(404).json({ success: false, message: "사용 가능한 주제가 없습니다." });
    }

    // 랜덤 주제 선택
    const randomTopic = availableTopics[Math.floor(Math.random() * availableTopics.length)];

    res.json({ success: true, topic: randomTopic });
});

/**
 * @route POST /api/topics
 * @desc 새 주제 추가
 * @access Private (Admin)
 */
router.post('/', (req, res) => {
    const { content, category, difficulty = 1 } = req.body;

    // 유효성 검사
    if (!content || !category) {
        return res.status(400).json({
            success: false,
            message: "주제 내용과 카테고리는 필수입니다."
        });
    }

    // 새 주제 추가
    const newTopic = {
        id: uuidv4(),
        content,
        category,
        difficulty: parseInt(difficulty),
        isActive: true
    };

    topics.push(newTopic);

    res.status(201).json({ success: true, topic: newTopic });
});

module.exports = router; 