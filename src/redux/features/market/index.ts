import { ReduxStoreState } from "@/interfaces/state";
import type { AssetPairRecord } from "@/interfaces/data";
import { createAction, createReducer } from "@reduxjs/toolkit";

export interface MarketState {
  items: AssetPairRecord[];
  openItems: AssetPairRecord[];
};

const initialState: MarketState = {
  items: [],
  openItems: [],
};

export const MarketActions = {
  init: createAction<AssetPairRecord[]>("market/init"),
  update: createAction<AssetPairRecord>("market/update")
}

const baseSelector = (state: ReduxStoreState) => state.market;

export const MarketSelectors = {
  selectItems: (state: ReduxStoreState) => baseSelector(state).items,
  selectOpenItems: (state: ReduxStoreState) => baseSelector(state).openItems,
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
        state.openItems.push({ ...action.payload });
      } else {
        state.items[index] = action.payload;
      }
    });
});
