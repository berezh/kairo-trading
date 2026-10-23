import type { ActiveAssetPairRecord, AssetPairRecord } from "./data";
import type { DialogData } from "./dialog";

export type DialogState = Partial<DialogData>;

export interface ReduxStoreState {
  dialog: DialogState;
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