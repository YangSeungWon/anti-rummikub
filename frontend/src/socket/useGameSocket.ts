import { useEffect } from "react";
import { useSocket } from "./useSocket";
import { useAppDispatch } from "../store/hooks";
import {
  setGameState,
  playerJoined,
  playerReadyChanged,
  gameStarted,
  turnStarted,
  voteUpdate,
  turnEnded,
  addChatMessage,
} from "../store/gameSlice";
import type { ChatMessage, GameState } from "../types";

interface UseGameSocketProps {
  gameId: string;
  autoJoin?: boolean;
}

export const useGameSocket = ({
  gameId,
  autoJoin = false,
}: UseGameSocketProps) => {
  const dispatch = useAppDispatch();
  const { connected, on, ready, vote, sendChat } = useSocket({
    gameId,
    autoJoin,
  });

  // 소켓 이벤트 리스너 등록
  useEffect(() => {
    if (!connected) return;

    // 초기 게임 상태
    const unsubGameState = on("gameState", (gameState: GameState) => {
      dispatch(setGameState(gameState));
    });

    // 플레이어 참가
    const unsubPlayerJoined = on("playerJoined", (data) => {
      dispatch(playerJoined(data));
    });

    // 준비 상태 변경
    const unsubReadyChanged = on("playerReadyChanged", (data) => {
      dispatch(playerReadyChanged(data));
    });

    // 게임 시작
    const unsubGameStarted = on("gameStarted", (data) => {
      dispatch(gameStarted(data));
    });

    // 턴 시작
    const unsubTurnStarted = on("turnStarted", (data) => {
      dispatch(turnStarted(data));
    });

    // 투표 업데이트
    const unsubVoteUpdate = on("voteUpdate", (data) => {
      dispatch(voteUpdate(data));
    });

    // 턴 종료
    const unsubTurnEnded = on("turnEnded", (data) => {
      dispatch(turnEnded(data));
    });

    // 채팅 메시지
    const unsubChatMessage = on("newChatMessage", (data: ChatMessage) => {
      dispatch(addChatMessage(data));
    });

    // 컴포넌트 언마운트 시 이벤트 리스너 제거
    return () => {
      unsubGameState();
      unsubPlayerJoined();
      unsubReadyChanged();
      unsubGameStarted();
      unsubTurnStarted();
      unsubVoteUpdate();
      unsubTurnEnded();
      unsubChatMessage();
    };
  }, [connected, dispatch, gameId, on]);

  return {
    connected,
    ready,
    vote,
    sendChat,
  };
};
