import { createContext, useState, useContext, useEffect } from 'react';
import type { ReactNode } from 'react';
import { authApi } from '../api';
import type { User } from '../types';

// 컨텍스트 인터페이스 정의
interface AuthContextType {
    user: User | null;
    token: string | null;
    loading: boolean;
    error: string | null;
    login: (username: string, password: string) => Promise<void>;
    signup: (username: string, password: string) => Promise<void>;
    logout: () => void;
    isAuthenticated: boolean;
}

// 초기 컨텍스트 값
const initialAuthContext: AuthContextType = {
    user: null,
    token: null,
    loading: false,
    error: null,
    login: async () => { },
    signup: async () => { },
    logout: () => { },
    isAuthenticated: false,
};

// 컨텍스트 생성
export const AuthContext = createContext<AuthContextType>(initialAuthContext);

// 컨텍스트 훅
export const useAuth = () => useContext(AuthContext);

// 컨텍스트 Provider 컴포넌트
export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // 로컬 스토리지에서 인증 정보 로드
    useEffect(() => {
        console.log('AuthProvider useEffect 실행');
        const loadAuthData = async () => {
            try {
                const storedToken = localStorage.getItem('token');
                const storedUser = localStorage.getItem('user');

                if (storedToken && storedUser) {
                    setToken(storedToken);
                    setUser(JSON.parse(storedUser));
                }

                // 토큰이 있으면 서버에서 현재 사용자 정보 검증
                if (storedToken) {
                    try {
                        console.log('Calling authApi.getMe()...');
                        const response = await authApi.getMe();
                        console.log('authApi.getMe() result:', response);
                        if (response.data.success) {
                            setUser(response.data.user);
                            localStorage.setItem('user', JSON.stringify(response.data.user));
                        } else {
                            // 토큰이 유효하지 않으면 로그아웃
                            localStorage.removeItem('token');
                            localStorage.removeItem('user');
                            setToken(null);
                            setUser(null);
                        }
                    } catch (error) {
                        console.error('사용자 정보 검증 실패:', error);
                        localStorage.removeItem('token');
                        localStorage.removeItem('user');
                        setToken(null);
                        setUser(null);
                    }
                }
            } catch (error) {
                console.error('인증 데이터 로드 실패:', error);
            } finally {
                setLoading(false);
            }
        };

        loadAuthData();
    }, []);

    // 로그인
    const login = async (username: string, password: string) => {
        setLoading(true);
        setError(null);

        try {
            const response = await authApi.login({ username, password });

            if (response.data.success) {
                const { token: newToken, user: userData } = response.data;

                // 로컬 스토리지에 저장
                localStorage.setItem('token', newToken);
                localStorage.setItem('user', JSON.stringify(userData));

                // 상태 업데이트
                setToken(newToken);
                setUser(userData);
            } else {
                setError('로그인에 실패했습니다.');
            }
        } catch (error) {
            console.error('로그인 오류:', error);
            setError('로그인 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    // 회원가입
    const signup = async (username: string, password: string) => {
        setLoading(true);
        setError(null);

        try {
            const response = await authApi.signup({ username, password });

            if (response.data.success) {
                const { token: newToken, user: userData } = response.data;

                // 로컬 스토리지에 저장
                localStorage.setItem('token', newToken);
                localStorage.setItem('user', JSON.stringify(userData));

                // 상태 업데이트
                setToken(newToken);
                setUser(userData);
            } else {
                setError('회원가입에 실패했습니다.');
            }
        } catch (error) {
            console.error('회원가입 오류:', error);
            setError('회원가입 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    // 로그아웃
    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
    };

    // 현재 로그인 상태
    const isAuthenticated = !!user && !!token;

    // Provider 값
    const value = {
        user,
        token,
        loading,
        error,
        login,
        signup,
        logout,
        isAuthenticated,
    };

    if (loading) {
        return <div>로딩 중...</div>;
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 