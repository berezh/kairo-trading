import type { MarketState } from "@/interfaces/state";
import { createReducer } from "@reduxjs/toolkit";
import { MarketActions } from "./action";

const initialState: MarketState = {
  records: [],
  openRecords: [],
  activeRecord: undefined,
};

export const MarketReducer = createReducer(initialState, (builder) => {
  builder
    .addCase(MarketActions.init, (state, action) => {
      state.records = action.payload;
    })
    .addCase(MarketActions.update, (state, action) => {
      const index = state.records.findIndex(
        (quote) => quote.symbol === action.payload.symbol,
      );

      if (index === -1) {
        state.records.push(action.payload);
        state.openRecords.push({ ...action.payload });
      } else if (action.payload.seq > state.records[index].seq) {
        state.records[index] = action.payload;
      }
    })
    .addCase(MarketActions.setActive, (state, action) => {
      state.activeRecord = action.payload;
    });
});
