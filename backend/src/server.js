const http = require('http');
const app = require('./app');
const config = require('./config/env');
const { initializeWebSocket } = require('./websocket');

// 데이터베이스 마이그레이션
const { initializeDatabase } = require('./models/migrations');

// 서버 생성
const server = http.createServer(app);

/**
 * 서버 시작 함수
 */
const startServer = async () => {
    try {
        // 테스트 환경이 아닐 때만 데이터베이스 초기화
        if (process.env.NODE_ENV !== 'test') {
            await initializeDatabase();
            console.log('데이터베이스가 초기화되었습니다.');

            // WebSocket 초기화
            initializeWebSocket(server);
        }

        // 서버 시작
        const PORT = config.PORT;
        server.listen(PORT, () => {
            console.log(`서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
        });
    } catch (error) {
        console.error('서버 시작 실패:', error);
        process.exit(1);
    }
};

// 서버 시작
startServer();

module.exports = server; 