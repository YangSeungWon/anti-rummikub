import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type {
  GameState,
  GameParticipant,
  Topic,
  Vote,
  ChatMessage,
} from "../types";
import { gameApi } from "../api";

// 초기 상태 정의
const initialState: GameState = {
  id: "",
  status: "waiting",
  players: [],
  chatMessages: [],
  isLoading: false,
  error: null,
};

// 비동기 액션 생성자
export const fetchGame = createAsyncThunk(
  "game/fetchGame",
  async (gameId: string) => {
    const response = await gameApi.getGame(gameId);
    return response.data.game;
  }
);

export const joinGameAction = createAsyncThunk(
  "game/joinGame",
  async (gameId: string) => {
    const response = await gameApi.joinGame(gameId);
    return response.data.gameState;
  }
);

export const startGameAction = createAsyncThunk(
  "game/startGame",
  async (gameId: string) => {
    const response = await gameApi.startGame(gameId);
    return response.data.gameState;
  }
);

export const startTurnAction = createAsyncThunk(
  "game/startTurn",
  async (gameId: string) => {
    const response = await gameApi.startTurn(gameId);
    return response.data;
  }
);

export const voteAction = createAsyncThunk(
  "game/vote",
  async ({
    gameId,
    roundId,
    vote,
  }: {
    gameId: string;
    roundId: string;
    vote: "yes" | "no";
  }) => {
    const response = await gameApi.vote(gameId, { roundId, vote });
    return response.data;
  }
);

export const endTurnAction = createAsyncThunk(
  "game/endTurn",
  async ({ gameId, roundId }: { gameId: string; roundId: string }) => {
    const response = await gameApi.endTurn(gameId, { roundId });
    return response.data;
  }
);

// 게임 슬라이스
const gameSlice = createSlice({
  name: "game",
  initialState,
  reducers: {
    // 소켓 이벤트에 의한 상태 업데이트
    setGameState(state, action: PayloadAction<GameState>) {
      return { ...state, ...action.payload };
    },

    playerJoined(
      state,
      action: PayloadAction<{
        playerId: string;
        username: string;
        players: GameParticipant[];
      }>
    ) {
      state.players = action.payload.players;
    },

    playerReadyChanged(
      state,
      action: PayloadAction<{
        playerId: string;
        isReady: boolean;
        players: GameParticipant[];
      }>
    ) {
      state.players = action.payload.players;
    },

    gameStarted(
      state,
      action: PayloadAction<{
        gameId: string;
        currentRound: number;
        explainer: { id: string; username: string };
        topic: Topic;
      }>
    ) {
      state.status = "playing";
      state.currentRound = {
        roundNumber: action.payload.currentRound,
        explainerId: action.payload.explainer.id,
        status: "waiting",
        isBonus: false,
      };
      state.topic = action.payload.topic;
    },

    turnStarted(
      state,
      action: PayloadAction<{
        roundId: string;
        turnStartAt: string;
        gracePeriod: number;
      }>
    ) {
      if (state.currentRound) {
        state.currentRound.status = "explaining";
        state.currentRound.startTime = action.payload.turnStartAt;
      }
    },

    voteUpdate(
      state,
      action: PayloadAction<{
        roundId: string;
        votes: Vote;
        players: GameParticipant[];
      }>
    ) {
      state.votes = action.payload.votes;
      state.players = action.payload.players;
    },

    turnEnded(
      state,
      action: PayloadAction<{
        roundId: string;
        isExplanationAccepted: boolean;
        scoreUpdates: { playerId: string; score: number }[];
        nextRound: {
          roundNumber: number;
          explainerId: string;
          isBonus: boolean;
        } | null;
      }>
    ) {
      // 점수 업데이트
      state.players = state.players.map((player) => {
        const scoreUpdate = action.payload.scoreUpdates.find(
          (update) => update.playerId === player.id
        );
        if (scoreUpdate) {
          return { ...player, score: scoreUpdate.score };
        }
        return player;
      });

      // 다음 라운드가 있는 경우
      if (action.payload.nextRound) {
        state.currentRound = {
          roundNumber: action.payload.nextRound.roundNumber,
          explainerId: action.payload.nextRound.explainerId,
          status: "waiting",
          isBonus: action.payload.nextRound.isBonus,
        };
      } else {
        // 게임 종료
        state.status = "finished";
        state.currentRound = undefined;
      }

      // 투표 상태 초기화
      state.votes = undefined;
    },

    addChatMessage(state, action: PayloadAction<ChatMessage>) {
      state.chatMessages.push(action.payload);
    },

    reset() {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    // fetchGame
    builder.addCase(fetchGame.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchGame.fulfilled, (state, action) => {
      return { ...state, ...action.payload, isLoading: false };
    });
    builder.addCase(fetchGame.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.error.message || "게임을 불러오는 데 실패했습니다.";
    });

    // joinGame
    builder.addCase(joinGameAction.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(joinGameAction.fulfilled, (state, action) => {
      return { ...state, ...action.payload, isLoading: false };
    });
    builder.addCase(joinGameAction.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.error.message || "게임 참가에 실패했습니다.";
    });

    // 나머지 비동기 액션 핸들러 추가...
  },
});

// 액션 익스포트
export const {
  setGameState,
  playerJoined,
  playerReadyChanged,
  gameStarted,
  turnStarted,
  voteUpdate,
  turnEnded,
  addChatMessage,
  reset,
} = gameSlice.actions;

export default gameSlice.reducer;
