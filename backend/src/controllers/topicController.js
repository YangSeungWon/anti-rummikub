const Topic = require('../models/Topic');

/**
 * 모든 주제 조회
 */
const getTopics = async (req, res) => {
    try {
        const { category, difficulty } = req.query;

        const filters = {};

        if (category) {
            filters.category = category;
        }

        if (difficulty) {
            filters.difficulty = parseInt(difficulty);
        }

        const topics = await Topic.findAll(filters);

        res.status(200).json({
            success: true,
            topics
        });
    } catch (error) {
        console.error('주제 목록 조회 오류:', error);

        res.status(500).json({
            success: false,
            message: '주제 목록을 조회하는 중 오류가 발생했습니다.'
        });
    }
};

/**
 * 특정 주제 조회
 */
const getTopic = async (req, res) => {
    try {
        const { topicId } = req.params;

        const topic = await Topic.findById(topicId);

        if (!topic) {
            return res.status(404).json({
                success: false,
                message: '주제를 찾을 수 없습니다.'
            });
        }

        res.status(200).json({
            success: true,
            topic
        });
    } catch (error) {
        console.error('주제 조회 오류:', error);

        res.status(500).json({
            success: false,
            message: '주제를 조회하는 중 오류가 발생했습니다.'
        });
    }
};

/**
 * 랜덤 주제 조회
 */
const getRandomTopic = async (req, res) => {
    try {
        const { category } = req.query;

        const topic = await Topic.getRandom(category);

        if (!topic) {
            return res.status(404).json({
                success: false,
                message: '조건에 맞는 주제를 찾을 수 없습니다.'
            });
        }

        res.status(200).json({
            success: true,
            topic
        });
    } catch (error) {
        console.error('랜덤 주제 조회 오류:', error);

        res.status(500).json({
            success: false,
            message: '랜덤 주제를 조회하는 중 오류가 발생했습니다.'
        });
    }
};

/**
 * 주제 생성 (관리자 전용)
 */
const createTopic = async (req, res) => {
    try {
        const { content, category, difficulty } = req.body;

        // 필수 필드 검증
        if (!content || !category) {
            return res.status(400).json({
                success: false,
                message: '주제 내용과 카테고리가 필요합니다.'
            });
        }

        // 주제 생성
        const topicData = {
            content,
            category,
            difficulty: difficulty || 1 // 기본값 1
        };

        const topic = await Topic.create(topicData);

        res.status(201).json({
            success: true,
            message: '주제가 생성되었습니다.',
            topic
        });
    } catch (error) {
        console.error('주제 생성 오류:', error);

        res.status(500).json({
            success: false,
            message: '주제를 생성하는 중 오류가 발생했습니다.'
        });
    }
};

/**
 * 주제 활성화/비활성화 토글 (관리자 전용)
 */
const toggleTopicActive = async (req, res) => {
    try {
        const { topicId } = req.params;

        const topic = await Topic.toggleActive(topicId);

        res.status(200).json({
            success: true,
            message: `주제가 ${topic.isActive ? '활성화' : '비활성화'} 되었습니다.`,
            topic
        });
    } catch (error) {
        console.error('주제 활성화/비활성화 오류:', error);

        if (error.message.includes('찾을 수 없습니다')) {
            return res.status(404).json({
                success: false,
                message: error.message
            });
        }

        res.status(500).json({
            success: false,
            message: '주제 상태를 변경하는 중 오류가 발생했습니다.'
        });
    }
};

module.exports = {
    getTopics,
    getTopic,
    getRandomTopic,
    createTopic,
    toggleTopicActive
}; 