import axios, { AxiosError } from "axios";
import type { User } from "../types";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1초

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // 10초 타임아웃
});

// 요청 인터셉터
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 응답 인터셉터
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config;

    // 재시도 횟수 확인
    if (!originalRequest || !originalRequest.headers) {
      return Promise.reject(error);
    }

    const retryCount = parseInt(
      (originalRequest.headers["x-retry-count"] as string) || "0"
    );

    if (
      retryCount < MAX_RETRIES &&
      [408, 429, 500, 502, 503, 504].includes(error.response?.status || 0)
    ) {
      // 재시도 횟수 증가
      originalRequest.headers["x-retry-count"] = (retryCount + 1).toString();

      // 지수 백오프 (exponential backoff)
      const delay = RETRY_DELAY * Math.pow(2, retryCount);

      // 지정된 시간만큼 대기 후 요청 재시도
      await new Promise((resolve) => setTimeout(resolve, delay));
      return api(originalRequest);
    }

    // 인증 에러 처리
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      // 로그인 페이지로 리디렉션은 상태관리 시스템에서 처리
      // window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

// 인증 관련 API
export const authApi = {
  // 회원가입
  signup: (data: { username: string; password: string }) =>
    api.post<{ success: boolean; token: string; user: User }>(
      "/auth/signup",
      data
    ),

  // 로그인
  login: (data: { username: string; password: string }) =>
    api.post<{ success: boolean; token: string; user: User }>(
      "/auth/login",
      data
    ),

  // 내 정보 조회
  getMe: () => api.get<{ success: boolean; user: User }>("/auth/me"),
};

// 게임 관련 API
export const gameApi = {
  // 게임 목록 조회
  getGames: () => api.get("/games"),

  // 게임 생성
  createGame: (data: {
    name: string;
    maxPlayers?: number;
    isPrivate?: boolean;
  }) => api.post("/games", data),

  // 특정 게임 조회
  getGame: (id: string) => api.get(`/games/${id}`),

  // 게임 참가
  joinGame: (id: string) => api.post(`/games/${id}/join`),

  // 게임 시작
  startGame: (id: string) => api.post(`/games/${id}/start`),

  // 턴 시작
  startTurn: (id: string) => api.post(`/games/${id}/start-turn`),

  // 투표
  vote: (id: string, data: { roundId: string; vote: "yes" | "no" }) =>
    api.post(`/games/${id}/vote`, data),

  // 턴 종료
  endTurn: (id: string, data: { roundId: string }) =>
    api.post(`/games/${id}/end`, data),

  // 봇 1명 추가
  addBotToGame: (id: string) => api.post(`/games/${id}/add-bot`),

  // 남은 자리를 모두 봇으로 채우기
  fillBotsToGame: (id: string) => api.post(`/games/${id}/fill-bots`),
};

// 주제 관련 API
export const topicApi = {
  // 주제 목록 조회
  getTopics: (params?: { category?: string; difficulty?: number }) =>
    api.get("/topics", { params }),

  // 랜덤 주제 가져오기
  getRandomTopic: (params?: { category?: string }) =>
    api.get("/topics/random", { params }),
};

export default api;
