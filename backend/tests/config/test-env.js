// 테스트 환경 변수 설정
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-key';

// 콘솔 로그를 조용하게 하기(필요시)
if (process.env.SILENT_LOGS) {
    global.console = {
        ...console,
        log: jest.fn(),
        info: jest.fn(),
        debug: jest.fn(),
        // 에러와 경고는 테스트 디버깅을 위해 유지
        error: console.error,
        warn: console.warn,
    };
} 