import type { ReduxStoreState } from "@/interfaces/state";

const baseSelector = (state: ReduxStoreState) => state.market;

export const MarketSelectors = {
  selectItems: (state: ReduxStoreState) => baseSelector(state).records,
  selectOpenItems: (state: ReduxStoreState) => baseSelector(state).openRecords,
  activeRecord: (state: ReduxStoreState) => baseSelector(state).activeRecord,
};