const { v4: uuidv4 } = require('uuid');
const User = require('../models/User');
const { generateToken } = require('../middlewares/auth');

/**
 * 회원가입 처리
 */
const signup = async (req, res) => {
    try {
        const { username, password } = req.body;

        // 필수 필드 검증
        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: '사용자명과 비밀번호가 필요합니다.'
            });
        }

        // 사용자명 중복 확인
        const existingUser = await User.findByUsername(username);

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: '이미 사용 중인 사용자명입니다.'
            });
        }

        // UUID 생성
        const userId = uuidv4();

        // 사용자 생성
        const userData = {
            id: userId,
            username,
            password
        };

        const newUser = await User.create(userData);

        // JWT 토큰 생성
        const token = generateToken(newUser.id);

        res.status(201).json({
            success: true,
            message: '회원가입이 완료되었습니다.',
            token,
            user: {
                id: newUser.id,
                username: newUser.username
            }
        });
    } catch (error) {
        console.error('회원가입 오류:', error);

        res.status(500).json({
            success: false,
            message: '회원가입 중 오류가 발생했습니다.'
        });
    }
};

/**
 * 로그인 처리
 */
const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        // 필수 필드 검증
        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: '사용자명과 비밀번호가 필요합니다.'
            });
        }

        // 사용자 조회
        const user = await User.findByUsername(username);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: '사용자명 또는 비밀번호가 올바르지 않습니다.'
            });
        }

        // 비밀번호 검증
        const isPasswordValid = await User.validatePassword(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: '사용자명 또는 비밀번호가 올바르지 않습니다.'
            });
        }

        // JWT 토큰 생성
        const token = generateToken(user.id);

        res.status(200).json({
            success: true,
            message: '로그인에 성공했습니다.',
            token,
            user: {
                id: user.id,
                username: user.username
            }
        });
    } catch (error) {
        console.error('로그인 오류:', error);

        res.status(500).json({
            success: false,
            message: '로그인 중 오류가 발생했습니다.'
        });
    }
};

/**
 * 내 정보 조회
 */
const getMe = async (req, res) => {
    try {
        const user = req.user;

        res.status(200).json({
            success: true,
            user: {
                id: user.id,
                username: user.username,
                rankPoints: user.rank_points
            }
        });
    } catch (error) {
        console.error('사용자 정보 조회 오류:', error);

        res.status(500).json({
            success: false,
            message: '사용자 정보를 조회하는 중 오류가 발생했습니다.'
        });
    }
};

module.exports = {
    signup,
    login,
    getMe
}; 