import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { initializeSocket } from './socket';
import Lobby from './components/Lobby';
import Game from './components/Game';
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
    <Router>
      <div className="app">
        <Routes>
          <Route path="/" element={<Lobby />} />
          <Route path="/game/:id" element={<Game />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
