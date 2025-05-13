const mongoose = require('mongoose');

// 테스트용 모델 스키마
const UserSchema = new mongoose.Schema({
    username: { type: String, required: true },
    password: { type: String, required: true }
});

describe('MongoDB 인메모리 테스트', () => {
    let User;

    beforeAll(() => {
        // 모델 정의 - 인메모리 연결은 global setup에서 처리됨
        try {
            User = mongoose.model('User');
        } catch (e) {
            User = mongoose.model('User', UserSchema);
        }
    });

    it('should connect to the in-memory database', () => {
        expect(mongoose.connection.readyState).toBe(1); // 1: connected
    });

    it('should create and retrieve a user', async () => {
        // 사용자 생성
        const user = new User({
            username: 'testuser',
            password: 'password123'
        });

        await user.save();

        // 사용자 검색
        const foundUser = await User.findOne({ username: 'testuser' });
        expect(foundUser).toBeTruthy();
        expect(foundUser.username).toBe('testuser');
        expect(foundUser.password).toBe('password123');
    }, 10000);

    it('should update a user', async () => {
        // 사용자 생성
        const user = new User({
            username: 'updateuser',
            password: 'originalpass'
        });

        await user.save();

        // 사용자 업데이트
        await User.updateOne(
            { username: 'updateuser' },
            { $set: { password: 'newpass' } }
        );

        // 업데이트된 사용자 검색
        const updatedUser = await User.findOne({ username: 'updateuser' });
        expect(updatedUser.password).toBe('newpass');
    }, 10000);

    it('should delete a user', async () => {
        // 사용자 생성
        const user = new User({
            username: 'deleteuser',
            password: 'password123'
        });

        await user.save();

        // 사용자 삭제
        await User.deleteOne({ username: 'deleteuser' });

        // 삭제 확인
        const deletedUser = await User.findOne({ username: 'deleteuser' });
        expect(deletedUser).toBeNull();
    }, 10000);
});
