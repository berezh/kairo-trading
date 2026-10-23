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
      const indexBySymbol = new Map(
        state.records.map((record, index) => [record.symbol, index]),
      );
      for (const record of action.payload) {
        const index = indexBySymbol.get(record.symbol);
        if (index === undefined) {
          indexBySymbol.set(record.symbol, state.records.length);
          state.records.push(record);
          state.openRecords.push({ ...record });
        } else if (record.seq > state.records[index].seq) {
          state.records[index] = record;
        }
      }
    })
    .addCase(MarketActions.setActive, (state, action) => {
      state.activeRecord = action.payload;
    });
});
