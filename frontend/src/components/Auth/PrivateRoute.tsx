import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface PrivateRouteProps {
    redirectPath?: string;
}

const PrivateRoute = ({ redirectPath = '/auth' }: PrivateRouteProps) => {
    const { isAuthenticated, loading } = useAuth();

    // 로딩 중일 때는 로딩 표시
    if (loading) {
        return (
            <div className="loading-screen">
                <div className="spinner"></div>
                <p>로딩 중...</p>
            </div>
        );
    }

    // 인증되지 않은 사용자는 로그인 페이지로 리디렉션
    if (!isAuthenticated) {
        return <Navigate to={redirectPath} replace />;
    }

    // 인증된 사용자는 하위 라우트로 이동
    return <Outlet />;
};

export default PrivateRoute; 