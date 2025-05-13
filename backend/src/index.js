/**
 * 메인 진입점 파일
 * 
 * 실제 서버 실행을 위해 server.js를 로드합니다.
 * 테스트 환경에서는 app.js만 사용하고 server.js는 로드하지 않습니다.
 */

// 환경 변수 설정
require('dotenv').config();

// 서버 시작 (이 모듈을 직접 실행할 때만)
if (require.main === module) {
    require('./server');
    console.log(`환경: ${process.env.NODE_ENV || 'development'}`);
} else {
    // 다른 모듈에서 임포트할 때는 app 객체만 노출
    module.exports = require('./app');
} 