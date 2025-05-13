import { io, Socket } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:3000";

// 소켓 인스턴스
let socket: Socket;

// 연결 상태
let isConnected = false;

// 이벤트 핸들러 저장소
type EventHandlerType = (...args: any[]) => void;
const eventHandlers: Map<string, Set<EventHandlerType>> = new Map();

// 소켓 연결 초기화
export const initializeSocket = (): Socket => {
  if (!socket) {
    socket = io(SOCKET_URL);

    // 기본 이벤트 리스너 등록
    socket.on("connect", () => {
      console.log("소켓 서버에 연결되었습니다.");
      isConnected = true;
      triggerEvent("connect");
    });

    socket.on("disconnect", () => {
      console.log("소켓 서버와 연결이 끊어졌습니다.");
      isConnected = false;
      triggerEvent("disconnect");
    });

    socket.on("error", (error) => {
      console.error("소켓 에러:", error);
      triggerEvent("error", error);
    });

    // 게임 관련 이벤트 리스너
    socket.on("playerJoined", (data) => triggerEvent("playerJoined", data));
    socket.on("playerReadyChanged", (data) =>
      triggerEvent("playerReadyChanged", data)
    );
    socket.on("gameStarted", (data) => triggerEvent("gameStarted", data));
    socket.on("voteUpdate", (data) => triggerEvent("voteUpdate", data));
    socket.on("newChatMessage", (data) => triggerEvent("newChatMessage", data));
  }

  return socket;
};

// 소켓 연결 여부 확인
export const isSocketConnected = (): boolean => isConnected;

// 게임 참가
export const joinGame = (
  gameId: string,
  userId: string,
  username: string
): void => {
  if (!isConnected) {
    console.warn("소켓이 연결되어 있지 않습니다.");
    return;
  }

  socket.emit("joinGame", { gameId, userId, username });
};

// 준비 상태 토글
export const toggleReady = (gameId: string, userId: string): void => {
  if (!isConnected) {
    console.warn("소켓이 연결되어 있지 않습니다.");
    return;
  }

  socket.emit("toggleReady", { gameId, userId });
};

// 투표
export const sendVote = (
  gameId: string,
  userId: string,
  explanationId: string,
  isPositive: boolean
): void => {
  if (!isConnected) {
    console.warn("소켓이 연결되어 있지 않습니다.");
    return;
  }

  socket.emit("vote", { gameId, userId, explanationId, isPositive });
};

// 채팅 메시지 전송
export const sendChatMessage = (
  gameId: string,
  userId: string,
  username: string,
  message: string
): void => {
  if (!isConnected) {
    console.warn("소켓이 연결되어 있지 않습니다.");
    return;
  }

  socket.emit("chatMessage", { gameId, userId, username, message });
};

// 이벤트 리스너 등록
export const addEventListener = (
  event: string,
  handler: EventHandlerType
): void => {
  if (!eventHandlers.has(event)) {
    eventHandlers.set(event, new Set());
  }

  eventHandlers.get(event)?.add(handler);
};

// 이벤트 리스너 제거
export const removeEventListener = (
  event: string,
  handler: EventHandlerType
): void => {
  const handlers = eventHandlers.get(event);

  if (handlers) {
    handlers.delete(handler);

    if (handlers.size === 0) {
      eventHandlers.delete(event);
    }
  }
};

// 이벤트 트리거
const triggerEvent = (event: string, ...args: any[]): void => {
  const handlers = eventHandlers.get(event);

  if (handlers) {
    handlers.forEach((handler) => handler(...args));
  }
};

// 소켓 연결 종료
export const disconnectSocket = (): void => {
  if (socket) {
    socket.disconnect();
    isConnected = false;
  }
};
