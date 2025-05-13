import { useEffect, useState, useCallback } from "react";
import {
  initializeSocket,
  isSocketConnected,
  addEventListener,
  removeEventListener,
  joinGame,
  toggleReady,
  sendVote,
  sendChatMessage,
} from "./index";
import { useAuth } from "../context/AuthContext";

interface UseSocketProps {
  gameId?: string;
  autoJoin?: boolean;
}

export const useSocket = ({
  gameId,
  autoJoin = false,
}: UseSocketProps = {}) => {
  const [connected, setConnected] = useState(isSocketConnected());
  const { user } = useAuth();

  // 소켓 초기화
  useEffect(() => {
    initializeSocket();

    // 연결 상태 이벤트 핸들러
    const handleConnect = () => setConnected(true);
    const handleDisconnect = () => setConnected(false);

    // 이벤트 리스너 등록
    addEventListener("connect", handleConnect);
    addEventListener("disconnect", handleDisconnect);

    // 연결 상태 동기화
    setConnected(isSocketConnected());

    return () => {
      // 컴포넌트 언마운트 시 이벤트 리스너 제거
      removeEventListener("connect", handleConnect);
      removeEventListener("disconnect", handleDisconnect);
    };
  }, []);

  // 게임 참가
  useEffect(() => {
    if (autoJoin && gameId && user && connected) {
      joinGame(gameId, user.id, user.username);
    }
  }, [gameId, user, connected, autoJoin]);

  // 이벤트 리스너 등록
  const on = useCallback((event: string, handler: (...args: any[]) => void) => {
    addEventListener(event, handler);
    return () => removeEventListener(event, handler);
  }, []);

  // 준비 상태 변경
  const ready = useCallback(() => {
    if (!gameId || !user || !connected) return;
    toggleReady(gameId, user.id);
  }, [gameId, user, connected]);

  // 투표
  const vote = useCallback(
    (roundId: string, isPositive: boolean) => {
      if (!gameId || !user || !connected) return;
      sendVote(gameId, user.id, roundId, isPositive);
    },
    [gameId, user, connected]
  );

  // 채팅 메시지 전송
  const sendChat = useCallback(
    (message: string) => {
      if (!gameId || !user || !connected) return;
      sendChatMessage(gameId, user.id, user.username, message);
    },
    [gameId, user, connected]
  );

  return {
    connected,
    on,
    ready,
    vote,
    sendChat,
  };
};
