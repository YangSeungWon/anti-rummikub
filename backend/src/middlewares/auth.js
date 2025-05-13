const jwt = require('jsonwebtoken');
const config = require('../config/env');
const User = require('../models/User');

/**
 * JWT 토큰을 검증하여 사용자 정보를 요청 객체에 추가하는 미들웨어
 */
const authMiddleware = async (req, res, next) => {
    try {
        // 헤더에서 Authorization 토큰 추출
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: '인증 토큰이 필요합니다.'
            });
        }

        // Bearer 접두사 제거 후 토큰 추출
        const token = authHeader.split(' ')[1];

        // 토큰 검증
        const decoded = jwt.verify(token, config.JWT_SECRET);

        // 사용자 정보 조회
        const user = await User.findById(decoded.userId);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: '유효하지 않은 사용자입니다.'
            });
        }

        // 요청 객체에 사용자 정보 추가
        req.user = user;

        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: '유효하지 않은 토큰입니다.'
            });
        }

        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: '토큰이 만료되었습니다.'
            });
        }

        console.error('인증 미들웨어 오류:', error);

        return res.status(500).json({
            success: false,
            message: '서버 오류가 발생했습니다.'
        });
    }
};

/**
 * JWT 토큰 생성 함수
 */
const generateToken = (userId) => {
    return jwt.sign(
        { userId },
        config.JWT_SECRET,
        { expiresIn: config.JWT_EXPIRES_IN }
    );
};

module.exports = {
    authMiddleware,
    generateToken
}; 