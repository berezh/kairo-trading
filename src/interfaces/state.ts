import type { ActiveAssetPairRecord, AssetPairRecord } from "./data";

export interface ReduxStoreState {
  common: CommonState;
  market: MarketState;
};

export interface MarketState {
  records: AssetPairRecord[];
  openRecords: AssetPairRecord[];
  activeRecord?: ActiveAssetPairRecord;
}

export interface CommonState {
  connected: boolean;
}