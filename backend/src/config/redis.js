const redis = require('redis');
const config = require('./env');

const redisClient = redis.createClient({
    host: config.REDIS_HOST,
    port: config.REDIS_PORT,
    password: config.REDIS_PASSWORD || undefined
});

redisClient.on('connect', () => {
    console.log('Redis 연결 성공');
});

redisClient.on('error', (err) => {
    console.error('Redis 연결 에러:', err);
});

module.exports = redisClient; 