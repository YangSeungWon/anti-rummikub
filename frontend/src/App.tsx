import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { Provider } from 'react-redux';
import { store } from './store';
import { initializeSocket } from './socket';
import { AuthProvider } from './context/AuthContext';
import { AuthPage, PrivateRoute } from './components/Auth';
import Lobby from './components/Lobby';
import Game from './components/Game';
import './components/UI/UI.css';
import './App.css';

function App() {
  // 앱 로드 시 소켓 연결 초기화
  useEffect(() => {
    initializeSocket();

    // 컴포넌트 언마운트 시 소켓 연결 종료
    return () => {
      // disconnectSocket(); // 실제 앱에서는 필요할 수 있으나, SPA에서는 보통 유지
    };
  }, []);

  return (
    <Provider store={store}>
      <Router>
        <AuthProvider>
          <div className="app">
            <Routes>
              {/* 인증 페이지 */}
              <Route path="/auth" element={<AuthPage />} />

              {/* 인증이 필요한 페이지들 */}
              <Route element={<PrivateRoute />}>
                <Route path="/lobby" element={<Lobby />} />
                <Route path="/game/:id" element={<Game />} />
              </Route>

              {/* 기본 리디렉션 */}
              <Route path="/" element={<Navigate to="/auth" replace />} />
              <Route path="*" element={<Navigate to="/auth" replace />} />
            </Routes>
          </div>
        </AuthProvider>
      </Router>
    </Provider>
  );
}

export default App;
