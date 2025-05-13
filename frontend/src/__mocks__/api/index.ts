// Mock API module
export const authApi = {
  signup: jest.fn().mockResolvedValue({
    data: {
      success: true,
      token: "mock-token",
      user: { id: "user1", username: "testuser" },
    },
  }),
  login: jest.fn().mockResolvedValue({
    data: {
      success: true,
      token: "mock-token",
      user: { id: "user1", username: "testuser" },
    },
  }),
  getMe: jest.fn().mockResolvedValue({
    data: {
      success: true,
      user: { id: "user1", username: "testuser" },
    },
  }),
};

export const gameApi = {
  getGames: jest.fn().mockResolvedValue({
    data: {
      success: true,
      games: [
        {
          id: "game1",
          name: "Test Game",
          maxPlayers: 4,
          currentPlayers: 1,
          isPrivate: false,
          status: "waiting",
          createdAt: "2023-01-01T00:00:00Z",
          creatorId: "user1",
        },
      ],
    },
  }),
  createGame: jest.fn().mockResolvedValue({
    data: {
      success: true,
      game: {
        id: "game1",
        name: "Test Game",
        maxPlayers: 4,
        currentPlayers: 1,
        isPrivate: false,
        status: "waiting",
        createdAt: "2023-01-01T00:00:00Z",
        creatorId: "user1",
      },
    },
  }),
  getGame: jest.fn().mockResolvedValue({
    data: {
      success: true,
      game: {
        id: "game1",
        name: "Test Game",
        maxPlayers: 4,
        currentPlayers: 1,
        isPrivate: false,
        status: "waiting",
        createdAt: "2023-01-01T00:00:00Z",
        creatorId: "user1",
      },
    },
  }),
  joinGame: jest.fn().mockResolvedValue({
    data: {
      success: true,
      gameState: {
        id: "game1",
        status: "waiting",
        players: [
          { id: "user1", username: "testuser", isReady: false, score: 0 },
        ],
        chatMessages: [],
      },
    },
  }),
  startGame: jest.fn().mockResolvedValue({
    data: {
      success: true,
      gameState: {
        id: "game1",
        status: "playing",
        players: [
          { id: "user1", username: "testuser", isReady: true, score: 0 },
        ],
        chatMessages: [],
      },
    },
  }),
  startTurn: jest.fn().mockResolvedValue({
    data: {
      success: true,
    },
  }),
  vote: jest.fn().mockResolvedValue({
    data: {
      success: true,
    },
  }),
  endTurn: jest.fn().mockResolvedValue({
    data: {
      success: true,
    },
  }),
};

export const topicApi = {
  getTopics: jest.fn().mockResolvedValue({
    data: {
      success: true,
      topics: [
        {
          id: "topic1",
          content: "Test Topic",
          category: "general",
          difficulty: 2,
          isActive: true,
        },
      ],
    },
  }),
  getRandomTopic: jest.fn().mockResolvedValue({
    data: {
      success: true,
      topic: {
        id: "topic1",
        content: "Test Topic",
        category: "general",
        difficulty: 2,
        isActive: true,
      },
    },
  }),
};

const api = {
  post: jest.fn(),
  get: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
  interceptors: {
    request: {
      use: jest.fn(),
    },
    response: {
      use: jest.fn(),
    },
  },
};

export default api;
