const db = require('../config/db');
const bcrypt = require('bcrypt');

class User {
    // 사용자 생성
    static async create(userData) {
        const { username, password } = userData;

        // 비밀번호 해싱
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const query = `
      INSERT INTO users (username, password) 
      VALUES ($1, $2) 
      RETURNING id, username, created_at
    `;

        const result = await db.query(query, [username, hashedPassword]);
        return result.rows[0];
    }

    // 사용자명으로 사용자 찾기
    static async findByUsername(username) {
        const query = 'SELECT * FROM users WHERE username = $1';
        const result = await db.query(query, [username]);
        return result.rows[0];
    }

    // ID로 사용자 찾기
    static async findById(id) {
        const query = 'SELECT id, username, created_at FROM users WHERE id = $1';
        const result = await db.query(query, [id]);
        return result.rows[0];
    }

    // 비밀번호 검증
    static async validatePassword(plainPassword, hashedPassword) {
        return await bcrypt.compare(plainPassword, hashedPassword);
    }
}

module.exports = User; 