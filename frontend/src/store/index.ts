import { configureStore } from "@reduxjs/toolkit";
import gameReducer from "./gameSlice";

export const store = configureStore({
  reducer: {
    game: gameReducer,
    // 추가 리듀서가 필요하면 여기에 추가
  },
});

// 스토어의 RootState 및 AppDispatch 타입 익스포트
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
