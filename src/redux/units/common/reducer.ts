import type { CommonState } from "@/interfaces/state";
import { createReducer } from "@reduxjs/toolkit";
import { CommonActions } from "./action";

const initialState: CommonState = {
  connected: false,
};

export const CommonReducer = createReducer(initialState, (builder) => {
  builder.addCase(CommonActions.setConnected, (state, action) => {
    state.connected = action.payload;
  });
});
