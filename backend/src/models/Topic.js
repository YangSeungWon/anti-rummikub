const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');

class Topic {
    // 주제 생성
    static async create(topicData) {
        const { content, category, difficulty = 1 } = topicData;
        const id = uuidv4();

        const query = `
      INSERT INTO topics (id, content, category, difficulty, is_active) 
      VALUES ($1, $2, $3, $4, true) 
      RETURNING *
    `;

        const result = await db.query(query, [id, content, category, difficulty]);
        return this.formatTopicData(result.rows[0]);
    }

    // 모든 주제 조회
    static async findAll(filters = {}) {
        let query = 'SELECT * FROM topics WHERE is_active = true';
        const params = [];

        // 카테고리 필터
        if (filters.category) {
            query += ` AND category = $${params.length + 1}`;
            params.push(filters.category);
        }

        // 난이도 필터
        if (filters.difficulty) {
            query += ` AND difficulty = $${params.length + 1}`;
            params.push(filters.difficulty);
        }

        query += ' ORDER BY category, difficulty, content';

        const result = await db.query(query, params);
        return result.rows.map(topic => this.formatTopicData(topic));
    }

    // ID로 주제 조회
    static async findById(id) {
        const query = 'SELECT * FROM topics WHERE id = $1';
        const result = await db.query(query, [id]);

        if (result.rows.length === 0) {
            return null;
        }

        return this.formatTopicData(result.rows[0]);
    }

    // 랜덤 주제 조회
    static async getRandom(category = null) {
        let query = 'SELECT * FROM topics WHERE is_active = true';
        const params = [];

        if (category) {
            query += ' AND category = $1';
            params.push(category);
        }

        query += ' ORDER BY RANDOM() LIMIT 1';

        const result = await db.query(query, params);

        if (result.rows.length === 0) {
            return null;
        }

        return this.formatTopicData(result.rows[0]);
    }

    // 주제 활성화/비활성화
    static async toggleActive(id) {
        const query = `
      UPDATE topics 
      SET is_active = NOT is_active 
      WHERE id = $1
      RETURNING *
    `;

        const result = await db.query(query, [id]);

        if (result.rows.length === 0) {
            throw new Error('주제를 찾을 수 없습니다.');
        }

        return this.formatTopicData(result.rows[0]);
    }

    // 주제 데이터 포맷팅
    static formatTopicData(topicData) {
        return {
            id: topicData.id,
            content: topicData.content,
            category: topicData.category,
            difficulty: topicData.difficulty,
            isActive: topicData.is_active
        };
    }
}

module.exports = Topic; 