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

// Initialize socket outside of component to prevent re-initialization
const socket = initializeSocket();

function App() {
  // App cleanup on unmount
  useEffect(() => {
    return () => {
      // Cleanup code if needed
    };
  }, []);

  return (
    <Provider store={store}>
      <AuthProvider>
        <Router>
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
        </Router>
      </AuthProvider>
    </Provider>
  );
}

export default App;
