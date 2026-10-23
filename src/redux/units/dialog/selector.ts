import type { DialogName } from "@/interfaces/dialog";
import type { ReduxStoreState } from "@/interfaces/state";

export const DialogSelectors = {
  data: <TName extends DialogName>(state: ReduxStoreState, name: TName) =>
    state.dialog[name],
};
