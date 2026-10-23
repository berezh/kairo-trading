import type { AssetPairRecord } from "./data";

export interface ReduxStoreState {
  common: CommonState;
  market: MarketState;
};

export interface MarketState {
  items: AssetPairRecord[];
  openItems: AssetPairRecord[];
}

export interface CommonState {
  connected: boolean;
}