import { authApi, gameApi } from "../api";

jest.mock("../api");

describe("API Client", () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    // Reset localStorage
    localStorage.clear();
  });

  describe("Auth API", () => {
    const mockUser = { id: "123", username: "testuser" };
    const mockToken = "test-token";
    const mockAuthResponse = {
      data: {
        success: true,
        token: mockToken,
        user: mockUser,
      },
    };

    test("login should return user and token", async () => {
      // Setup
      const credentials = { username: "testuser", password: "password" };
      (authApi.login as jest.Mock).mockResolvedValueOnce(mockAuthResponse);

      // Execute
      const result = await authApi.login(credentials);

      // Verify
      expect(authApi.login).toHaveBeenCalledWith(credentials);
      expect(result.data).toEqual(mockAuthResponse.data);
    });

    test("signup should return user and token", async () => {
      // Setup
      const signupData = { username: "newuser", password: "password" };
      (authApi.signup as jest.Mock).mockResolvedValueOnce(mockAuthResponse);

      // Execute
      const result = await authApi.signup(signupData);

      // Verify
      expect(authApi.signup).toHaveBeenCalledWith(signupData);
      expect(result.data).toEqual(mockAuthResponse.data);
    });

    test("getMe should return user info", async () => {
      // Setup
      (authApi.getMe as jest.Mock).mockResolvedValueOnce({
        data: { success: true, user: mockUser },
      });

      // Execute
      const result = await authApi.getMe();

      // Verify
      expect(authApi.getMe).toHaveBeenCalled();
      expect(result.data).toEqual({ success: true, user: mockUser });
    });
  });

  describe("Game API", () => {
    const mockGameId = "game123";
    const mockGame = {
      id: mockGameId,
      name: "Test Game",
      maxPlayers: 4,
      currentPlayers: 1,
      isPrivate: false,
      status: "waiting",
      createdAt: "2023-01-01T00:00:00Z",
      creatorId: "user123",
    };
    const mockGameResponse = {
      data: {
        success: true,
        game: mockGame,
      },
    };

    test("getGames should return list of games", async () => {
      // Setup
      (gameApi.getGames as jest.Mock).mockResolvedValueOnce({
        data: { success: true, games: [mockGame] },
      });

      // Execute
      const result = await gameApi.getGames();

      // Verify
      expect(gameApi.getGames).toHaveBeenCalled();
      expect(result.data.games).toEqual([mockGame]);
    });

    test("createGame should return created game", async () => {
      // Setup
      const gameData = { name: "New Game", maxPlayers: 4, isPrivate: false };
      (gameApi.createGame as jest.Mock).mockResolvedValueOnce(mockGameResponse);

      // Execute
      const result = await gameApi.createGame(gameData);

      // Verify
      expect(gameApi.createGame).toHaveBeenCalledWith(gameData);
      expect(result.data.game).toEqual(mockGame);
    });

    test("joinGame should join a game successfully", async () => {
      // Setup
      (gameApi.joinGame as jest.Mock).mockResolvedValueOnce({
        data: {
          success: true,
          gameState: {
            id: mockGameId,
            players: [{ id: "user123", username: "testuser" }],
          },
        },
      });

      // Execute
      const result = await gameApi.joinGame(mockGameId);

      // Verify
      expect(gameApi.joinGame).toHaveBeenCalledWith(mockGameId);
      expect(result.data.success).toBe(true);
    });

    test("startGame should start a game successfully", async () => {
      // Setup
      (gameApi.startGame as jest.Mock).mockResolvedValueOnce({
        data: {
          success: true,
          gameState: {
            id: mockGameId,
            status: "playing",
          },
        },
      });

      // Execute
      const result = await gameApi.startGame(mockGameId);

      // Verify
      expect(gameApi.startGame).toHaveBeenCalledWith(mockGameId);
      expect(result.data.success).toBe(true);
    });
  });
});
