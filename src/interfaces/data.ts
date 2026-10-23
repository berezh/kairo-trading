import type { OrderSide } from "@/interfaces/order";

export interface AssetPairRecord {
  symbol: string;
  bid: string;
  ask: string;
  ts: number;
  seq: number;
}

export interface ActiveAssetPairRecord  extends AssetPairRecord {
  side?: OrderSide;
}


export interface AssetRecord {
  symbol: string;
  precision: number;
}