import { MarketReducer } from "../redux/features/market";

export interface ReduxStoreState {
  market: ReturnType<typeof MarketReducer>;
};