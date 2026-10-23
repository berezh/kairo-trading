import { createReducer } from "@reduxjs/toolkit";
import type { DialogState } from "@/interfaces/state";
import { DialogActions } from "./action";

const initialState: DialogState = {};

export const DialogReducer = createReducer(initialState, (builder) => {
  builder
    .addCase(DialogActions.show, (state, { payload }) => {
      switch (payload.name) {
        case "orderPreview":
          delete state.priceConfirmation;
          state.orderPreview = payload.data;
          break;
        case "priceConfirmation":
          delete state.orderPreview;
          state.priceConfirmation = payload.data;
          break;
      }
    })
    .addCase(DialogActions.hide, (state, { payload }) => {
      delete state[payload];
    });
});
