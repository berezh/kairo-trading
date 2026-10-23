import type { MarketState } from "@/interfaces/state";
import { createReducer } from "@reduxjs/toolkit";
import { MarketActions } from "./action";

const initialState: MarketState = {
  items: [],
  openItems: [],
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
