import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
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
  (error) => {
    if (error.response && error.response.status === 401) {
      // 인증 에러 처리
      localStorage.removeItem("token");
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

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
