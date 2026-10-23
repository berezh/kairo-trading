import type { ActiveAssetPairRecord, AssetPairRecord } from "@/interfaces/data";
import { createAction } from "@reduxjs/toolkit";

export const MarketActions = {
  init: createAction<AssetPairRecord[]>("market/init"),
  update: createAction<AssetPairRecord>("market/update"),
  setActive: createAction<ActiveAssetPairRecord | undefined>("market/setActive"),
};