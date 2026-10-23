import { createAction } from "@reduxjs/toolkit";
import type { DialogName, ShowDialogPayload } from "@/interfaces/dialog";

export const DialogActions = {
  show: createAction<ShowDialogPayload>("dialog/show"),
  hide: createAction<DialogName>("dialog/hide"),
};
