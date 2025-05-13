import { useState, FormEvent } from 'react';
import { useAuth } from '../../context/AuthContext';

interface SignupFormProps {
    onSuccess?: () => void;
    onToggleForm?: () => void;
}

const SignupForm = ({ onSuccess, onToggleForm }: SignupFormProps) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const { signup, loading, error } = useAuth();

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setErrorMessage('');

        // 입력 유효성 검사
        if (!username.trim() || !password.trim() || !confirmPassword.trim()) {
            setErrorMessage('모든 필드를 입력해주세요.');
            return;
        }

        // 비밀번호 일치 확인
        if (password !== confirmPassword) {
            setErrorMessage('비밀번호가 일치하지 않습니다.');
            return;
        }

        // 비밀번호 길이 확인
        if (password.length < 6) {
            setErrorMessage('비밀번호는 최소 6자 이상이어야 합니다.');
            return;
        }

        try {
            await signup(username, password);
            if (onSuccess) onSuccess();
        } catch (err) {
            console.error('회원가입 처리 중 오류:', err);
        }
    };

    return (
        <div className="signup-form">
            <h2>회원가입</h2>

            {(errorMessage || error) && (
                <div className="error-message">
                    {errorMessage || error}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="username">사용자명</label>
                    <input
                        type="text"
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        disabled={loading}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="password">비밀번호</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={loading}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="confirmPassword">비밀번호 확인</label>
                    <input
                        type="password"
                        id="confirmPassword"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        disabled={loading}
                        required
                    />
                </div>

                <button type="submit" disabled={loading}>
                    {loading ? '처리 중...' : '회원가입'}
                </button>
            </form>

            <div className="form-footer">
                <p>
                    이미 계정이 있으신가요?{' '}
                    <button
                        type="button"
                        className="link-button"
                        onClick={onToggleForm}
                        disabled={loading}
                    >
                        로그인
                    </button>
                </p>
            </div>
        </div>
    );
};

export default SignupForm; 