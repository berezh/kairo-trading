import { MarketReducer } from "../features/market";

export interface ReduxStoreState {
  market: ReturnType<typeof MarketReducer>;
};