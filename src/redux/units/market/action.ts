import type { AssetPairRecord } from "@/interfaces/data";
import { createAction } from "@reduxjs/toolkit";

export const MarketActions = {
  init: createAction<AssetPairRecord[]>("market/init"),
  update: createAction<AssetPairRecord>("market/update"),
};