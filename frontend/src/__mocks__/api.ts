// Mock API module
export const authApi = {
  signup: jest.fn(),
  login: jest.fn(),
  getMe: jest.fn(),
};

export const gameApi = {
  getGames: jest.fn(),
  createGame: jest.fn(),
  getGame: jest.fn(),
  joinGame: jest.fn(),
  startGame: jest.fn(),
  startTurn: jest.fn(),
  vote: jest.fn(),
  endTurn: jest.fn(),
};

export const topicApi = {
  getTopics: jest.fn(),
  getRandomTopic: jest.fn(),
};

export default {
  post: jest.fn(),
  get: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
  interceptors: {
    request: { use: jest.fn() },
    response: { use: jest.fn() },
  },
};
