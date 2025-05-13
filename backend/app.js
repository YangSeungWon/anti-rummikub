const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Routes
const authRouter = require('./src/routes/auth');
const gamesRouter = require('./src/routes/games');
const topicsRouter = require('./src/routes/topics');

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(helmet({
    contentSecurityPolicy: false
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/games', gamesRouter);
app.use('/api/topics', topicsRouter);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
});

// Not found middleware
app.use((req, res, next) => {
    res.status(404).json({ message: '요청한 리소스를 찾을 수 없습니다.' });
});

module.exports = app; 