import { ReduxStoreState } from "@/interfaces/state";
import type { AssetPairRecord } from "@/interfaces/data";
import { createAction, createReducer } from "@reduxjs/toolkit";

export interface MarketState {
  items: AssetPairRecord[];
};

const sampleTimestamp = new Date().getTime();

export const initialQuotes: AssetPairRecord[] = [
    { symbol: "EURUSD", bid: "1.08412", ask: "1.08415", ts: sampleTimestamp, seq: 98213 },
    { symbol: "USDJPY", bid: "149.382", ask: "149.386", ts: sampleTimestamp, seq: 98214 },
    { symbol: "GBPUSD", bid: "1.29740", ask: "1.29745", ts: sampleTimestamp, seq: 98215 },
    { symbol: "USDCHF", bid: "0.86521", ask: "0.86525", ts: sampleTimestamp, seq: 98216 },
    { symbol: "AUDUSD", bid: "0.66182", ask: "0.66186", ts: sampleTimestamp, seq: 98217 },
    { symbol: "USDCAD", bid: "1.37642", ask: "1.37647", ts: sampleTimestamp, seq: 98218 },
    { symbol: "NZDUSD", bid: "0.60124", ask: "0.60129", ts: sampleTimestamp, seq: 98219 },
    { symbol: "EURGBP", bid: "0.83562", ask: "0.83567", ts: sampleTimestamp, seq: 98220 },
    { symbol: "EURJPY", bid: "161.972", ask: "161.978", ts: sampleTimestamp, seq: 98221 },
    { symbol: "GBPJPY", bid: "193.821", ask: "193.829", ts: sampleTimestamp, seq: 98222 },
    { symbol: "AUDJPY", bid: "98.842", ask: "98.848", ts: sampleTimestamp, seq: 98223 },
    { symbol: "EURCHF", bid: "0.93814", ask: "0.93820", ts: sampleTimestamp, seq: 98224 },
    { symbol: "EURAUD", bid: "1.63820", ask: "1.63828", ts: sampleTimestamp, seq: 98225 },
    { symbol: "EURCAD", bid: "1.49218", ask: "1.49226", ts: sampleTimestamp, seq: 98226 },
    { symbol: "EURNZD", bid: "1.80264", ask: "1.80276", ts: sampleTimestamp, seq: 98227 },
    { symbol: "GBPCHF", bid: "1.12248", ask: "1.12256", ts: sampleTimestamp, seq: 98228 },
    { symbol: "GBPAUD", bid: "1.96018", ask: "1.96028", ts: sampleTimestamp, seq: 98229 },
    { symbol: "GBPCAD", bid: "1.78602", ask: "1.78612", ts: sampleTimestamp, seq: 98230 },
    { symbol: "GBPNZD", bid: "2.15730", ask: "2.15744", ts: sampleTimestamp, seq: 98231 },
    { symbol: "AUDCAD", bid: "0.91108", ask: "0.91115", ts: sampleTimestamp, seq: 98232 },
    { symbol: "AUDCHF", bid: "0.57248", ask: "0.57254", ts: sampleTimestamp, seq: 98233 },
    { symbol: "AUDNZD", bid: "1.10072", ask: "1.10080", ts: sampleTimestamp, seq: 98234 },
    { symbol: "CADJPY", bid: "108.544", ask: "108.551", ts: sampleTimestamp, seq: 98235 },
    { symbol: "CHFJPY", bid: "172.654", ask: "172.663", ts: sampleTimestamp, seq: 98236 },
    { symbol: "NZDJPY", bid: "89.842", ask: "89.850", ts: sampleTimestamp, seq: 98237 },
    { symbol: "CADCHF", bid: "0.62840", ask: "0.62847", ts: sampleTimestamp, seq: 98238 },
    { symbol: "NZDCAD", bid: "0.82762", ask: "0.82770", ts: sampleTimestamp, seq: 98239 },
    { symbol: "NZDCHF", bid: "0.52018", ask: "0.52025", ts: sampleTimestamp, seq: 98240 },
    { symbol: "USDSGD", bid: "1.30214", ask: "1.30222", ts: sampleTimestamp, seq: 98241 },
    { symbol: "EURSGD", bid: "1.41246", ask: "1.41258", ts: sampleTimestamp, seq: 98242 },
];

const initialState: MarketState = {
  items: initialQuotes,
};

export const MarketActions = {
  init: createAction<AssetPairRecord[]>("market/init"),
  update: createAction<AssetPairRecord>("market/update")
}

const baseSelector = (state: ReduxStoreState) => state.market;

export const MarketSelectors = {
  selectItems: (state: ReduxStoreState) => baseSelector(state).items,
};

export const MarketReducer = createReducer(initialState, (builder) => {
  builder
    .addCase(MarketActions.init, (state, action) => {
      state.items = action.payload;
    })
    .addCase(MarketActions.update, (state, action) => {
      const index = state.items.findIndex(
        (quote) => quote.symbol === action.payload.symbol,
      );

      if (index === -1) {
        state.items.push(action.payload);
      } else {
        state.items[index] = action.payload;
      }
    });
});
