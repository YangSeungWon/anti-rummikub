import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';
import { useAuth } from '../../context/AuthContext';

const AuthPage = () => {
    const [isLoginMode, setIsLoginMode] = useState(true);
    const { isAuthenticated, loading } = useAuth();
    const navigate = useNavigate();

    // 이미 인증된 사용자는 로비로 리디렉션
    if (isAuthenticated) {
        return <Navigate to="/lobby" replace />;
    }

    const handleAuthSuccess = () => {
        navigate('/lobby');
    };

    const toggleForm = () => {
        setIsLoginMode(!isLoginMode);
    };

    return (
        <div className="auth-page">
            <div className="auth-container">
                <div className="game-logo">
                    <h1>Anti-Rummikub</h1>
                    <p>Improv Showdown</p>
                </div>

                <div className="auth-form-container">
                    {isLoginMode ? (
                        <LoginForm
                            onSuccess={handleAuthSuccess}
                            onToggleForm={toggleForm}
                        />
                    ) : (
                        <SignupForm
                            onSuccess={handleAuthSuccess}
                            onToggleForm={toggleForm}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default AuthPage; 