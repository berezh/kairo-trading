export interface AssetPairRecord {
  symbol: string;
  bid: string;
  ask: string;
  ts: number;
  seq: number;
}


export interface AssetRecord {
  symbol: string;
  precision: number;
}