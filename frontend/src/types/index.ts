// 사용자 타입
export interface User {
  id: string;
  username: string;
  email?: string;
  profileImage?: string;
  rankPoints?: number;
}

// 게임 타입
export interface Game {
  id: string;
  name: string;
  maxPlayers: number;
  currentPlayers: number;
  isPrivate: boolean;
  status: "waiting" | "playing" | "finished";
  createdAt: string;
  creatorId: string;
}

// 게임 참가자 타입
export interface GameParticipant {
  id: string;
  username: string;
  isReady: boolean;
  score: number;
  socketId?: string;
}

// 라운드 타입
export interface Round {
  id?: string;
  roundNumber: number;
  explainerId: string;
  startTime?: string;
  endTime?: string;
  status: "waiting" | "explaining" | "voting" | "finished";
  isBonus: boolean;
}

// 주제 타입
export interface Topic {
  id: string;
  content: string;
  category: string;
  difficulty: number;
  isActive: boolean;
}

// 설명 타입
export interface Explanation {
  id: string;
  roundId: string;
  userId: string;
  content: string;
  createdAt: string;
  isAccepted?: boolean;
}

// 투표 타입
export interface Vote {
  explanationId: string;
  positive: number;
  negative: number;
}

// 채팅 메시지 타입
export interface ChatMessage {
  userId: string;
  username: string;
  message: string;
  timestamp: string;
}

// 게임 상태 타입
export interface GameState {
  id: string;
  name?: string;
  creatorId?: string;
  maxPlayers?: number;
  status: "waiting" | "playing" | "finished";
  players: GameParticipant[];
  currentRound?: Round;
  topic?: Topic;
  explanation?: Explanation;
  votes?: Vote;
  chatMessages: ChatMessage[];
  // 상태 관리 필드
  isLoading?: boolean;
  error?: string | null;
}

// API 응답 타입
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

// Export all types as a namespace to avoid direct imports
const Types = {
  User,
  Game,
  GameParticipant,
  Round,
  Topic,
  Explanation,
  Vote,
  ChatMessage,
  GameState,
  ApiResponse,
};

export default Types;
