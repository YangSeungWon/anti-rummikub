const { Pool } = require('pg');
const config = require('./env');

// 테스트 환경에서는 PostgreSQL 연결 스킵
let pool;

if (process.env.NODE_ENV !== 'test') {
    pool = new Pool({
        host: config.DB_HOST,
        port: config.DB_PORT,
        database: config.DB_NAME,
        user: config.DB_USER,
        password: config.DB_PASSWORD,
    });

    // 연결 테스트
    pool.query('SELECT NOW()')
        .then(() => console.log('PostgreSQL 데이터베이스 연결 성공'))
        .catch(err => console.error('PostgreSQL 데이터베이스 연결 실패:', err));
} else {
    console.log('테스트 환경에서는 PostgreSQL 연결을 생략합니다.');
    // 테스트용 더미 풀 제공
    pool = {
        query: () => Promise.resolve({ rows: [] }),
        connect: () => ({
            query: () => Promise.resolve({ rows: [] }),
            release: () => { }
        }),
    };
}

module.exports = {
    query: (text, params) => pool.query(text, params),
    pool
}; 