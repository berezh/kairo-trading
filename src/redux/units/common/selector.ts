import type { ReduxStoreState } from "@/interfaces/state";

const baseSelector = (state: ReduxStoreState) => state.common;

export const CommonSelectors = {
  connected: (state: ReduxStoreState) => baseSelector(state).connected,
};
