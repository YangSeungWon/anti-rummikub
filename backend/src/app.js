const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const config = require('./config/env');

// 라우터
const authRouter = require('./routes/auth');
const gamesRouter = require('./routes/games');
const topicsRouter = require('./routes/topics');

// 앱 초기화
const app = express();

// 미들웨어
app.use(cors({
    origin: config.CORS_ORIGIN,
    credentials: true
}));
app.use(helmet({
    contentSecurityPolicy: false
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 기본 라우트
app.get('/', (req, res) => {
    res.json({ message: 'Anti-Rummikub API 서버가 정상 작동 중입니다.' });
});

// API 라우터
app.use('/api/auth', authRouter);
app.use('/api/games', gamesRouter);
app.use('/api/topics', topicsRouter);

// 404 핸들러
app.use((req, res, next) => {
    res.status(404).json({ message: '요청한 리소스를 찾을 수 없습니다.' });
});

// 에러 핸들러
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
});

module.exports = app; 