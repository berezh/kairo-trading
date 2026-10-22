import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { MarketReducer } from "./features/market";
import type { ReduxStoreState } from "./interfaces/state";

export const makeStore = () =>
  configureStore<ReduxStoreState>({
    reducer: combineReducers({
      market: MarketReducer,
    }),
  });

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReduxStoreState;
export type AppDispatch = AppStore["dispatch"];
