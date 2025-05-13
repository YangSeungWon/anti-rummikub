const db = require('../config/db');

/**
 * 데이터베이스 테이블 생성 및 초기 데이터 설정
 */
const setupDatabase = async () => {
    const client = await db.pool.connect();

    try {
        await client.query('BEGIN');

        // users 테이블
        await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(100) NOT NULL,
        email VARCHAR(100),
        profile_image VARCHAR(255),
        rank_points INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

        // games 테이블
        await client.query(`
      CREATE TABLE IF NOT EXISTS games (
        id UUID PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        max_players INTEGER NOT NULL DEFAULT 8,
        current_players INTEGER NOT NULL DEFAULT 0,
        is_private BOOLEAN NOT NULL DEFAULT false,
        status VARCHAR(20) NOT NULL DEFAULT 'waiting',
        creator_id UUID REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

        // topics 테이블
        await client.query(`
      CREATE TABLE IF NOT EXISTS topics (
        id UUID PRIMARY KEY,
        content TEXT NOT NULL,
        category VARCHAR(50) NOT NULL,
        difficulty INTEGER NOT NULL DEFAULT 1,
        is_active BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

        // rounds 테이블
        await client.query(`
      CREATE TABLE IF NOT EXISTS rounds (
        id UUID PRIMARY KEY,
        game_id UUID REFERENCES games(id) ON DELETE CASCADE,
        round_number INTEGER NOT NULL,
        explainer_id UUID REFERENCES users(id),
        topic_id UUID REFERENCES topics(id),
        status VARCHAR(20) NOT NULL DEFAULT 'waiting',
        is_bonus BOOLEAN NOT NULL DEFAULT false,
        start_time TIMESTAMP,
        end_time TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

        // explanations 테이블
        await client.query(`
      CREATE TABLE IF NOT EXISTS explanations (
        id UUID PRIMARY KEY,
        round_id UUID REFERENCES rounds(id) ON DELETE CASCADE,
        content TEXT,
        is_accepted BOOLEAN,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

        // votes 테이블
        await client.query(`
      CREATE TABLE IF NOT EXISTS votes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        round_id UUID REFERENCES rounds(id) ON DELETE CASCADE,
        user_id UUID REFERENCES users(id),
        explanation_id UUID REFERENCES explanations(id) ON DELETE CASCADE,
        is_positive BOOLEAN NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(round_id, user_id)
      )
    `);

        // game_participants 테이블
        await client.query(`
      CREATE TABLE IF NOT EXISTS game_participants (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        game_id UUID REFERENCES games(id) ON DELETE CASCADE,
        user_id UUID REFERENCES users(id),
        is_ready BOOLEAN NOT NULL DEFAULT false,
        score INTEGER NOT NULL DEFAULT 0,
        socket_id VARCHAR(100),
        joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(game_id, user_id)
      )
    `);

        // session_tokens 테이블
        await client.query(`
      CREATE TABLE IF NOT EXISTS session_tokens (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        token VARCHAR(500) NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

        // 샘플 주제 데이터 추가
        const sampleTopics = [
            { category: '일상', content: '아침에 일어나기', difficulty: 1 },
            { category: '일상', content: '치과 방문', difficulty: 2 },
            { category: '일상', content: '대중교통 이용하기', difficulty: 1 },
            { category: '직업', content: '바리스타', difficulty: 2 },
            { category: '직업', content: '프로그래머', difficulty: 2 },
            { category: '직업', content: '교사', difficulty: 1 },
            { category: '감정', content: '설렘', difficulty: 3 },
            { category: '감정', content: '후회', difficulty: 2 },
            { category: '감정', content: '불안', difficulty: 2 },
            { category: '장소', content: '도서관', difficulty: 1 },
            { category: '장소', content: '놀이공원', difficulty: 1 },
            { category: '장소', content: '공항', difficulty: 2 },
            { category: '활동', content: '요리하기', difficulty: 1 },
            { category: '활동', content: '등산', difficulty: 2 },
            { category: '활동', content: '독서', difficulty: 2 }
        ];

        for (const topic of sampleTopics) {
            await client.query(`
        INSERT INTO topics (id, content, category, difficulty, is_active)
        VALUES (gen_random_uuid(), $1, $2, $3, true)
        ON CONFLICT DO NOTHING
      `, [topic.content, topic.category, topic.difficulty]);
        }

        await client.query('COMMIT');
        console.log('데이터베이스 설정 완료');
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('데이터베이스 설정 오류:', error);
        throw error;
    } finally {
        client.release();
    }
};

// 데이터베이스 초기화 실행
const initializeDatabase = async () => {
    try {
        await setupDatabase();
    } catch (error) {
        console.error('데이터베이스 초기화 실패:', error);
        process.exit(1);
    }
};

module.exports = { initializeDatabase }; 