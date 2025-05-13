import { useState, FormEvent } from 'react';
import { useAuth } from '../../context/AuthContext';

interface LoginFormProps {
    onSuccess?: () => void;
    onToggleForm?: () => void;
}

const LoginForm = ({ onSuccess, onToggleForm }: LoginFormProps) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const { login, loading, error } = useAuth();

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setErrorMessage('');

        // 입력 유효성 검사
        if (!username.trim() || !password.trim()) {
            setErrorMessage('사용자명과 비밀번호를 모두 입력해주세요.');
            return;
        }

        try {
            await login(username, password);
            if (onSuccess) onSuccess();
        } catch (err) {
            console.error('로그인 처리 중 오류:', err);
        }
    };

    return (
        <div className="login-form">
            <h2>로그인</h2>

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

                <button type="submit" disabled={loading}>
                    {loading ? '로그인 중...' : '로그인'}
                </button>
            </form>

            <div className="form-footer">
                <p>
                    계정이 없으신가요?{' '}
                    <button
                        type="button"
                        className="link-button"
                        onClick={onToggleForm}
                        disabled={loading}
                    >
                        회원가입
                    </button>
                </p>
            </div>
        </div>
    );
};

export default LoginForm; 