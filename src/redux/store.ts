import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { MarketReducer } from "./units/market/reducer";
import { CommonReducer } from "./units/common/reducer";
import { ReduxStoreState } from "../interfaces/state";

export const makeStore = () =>
  configureStore<ReduxStoreState>({
    reducer: combineReducers({
      common: CommonReducer,
      market: MarketReducer,
    }),
  });

export type AppStore = ReturnType<typeof makeStore>;
export type AppDispatch = AppStore["dispatch"];
