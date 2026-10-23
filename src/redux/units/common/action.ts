import { createAction } from "@reduxjs/toolkit";

export const CommonActions = {
  setConnected: createAction<boolean>("common/setConnected"),
};
