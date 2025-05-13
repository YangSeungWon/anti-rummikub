// 환경 변수 설정 로드
require('./test-env');

const { connect, closeDatabase, clearDatabase } = require('./setup-mongo');

// 모든 테스트 전에 실행
beforeAll(async () => {
    await connect();
});

// 각 테스트 후에 실행
afterEach(async () => {
    await clearDatabase();
});

// 모든 테스트 후에 실행
afterAll(async () => {
    await closeDatabase();
}); 