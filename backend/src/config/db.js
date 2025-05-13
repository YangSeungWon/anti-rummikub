const { Pool } = require('pg');
const config = require('./env');

const pool = new Pool({
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

module.exports = {
    query: (text, params) => pool.query(text, params),
    pool
}; 