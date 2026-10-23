import type { ReduxStoreState } from "@/interfaces/state";

const baseSelector = (state: ReduxStoreState) => state.market;

export const MarketSelectors = {
  selectItems: (state: ReduxStoreState) => baseSelector(state).items,
  selectOpenItems: (state: ReduxStoreState) => baseSelector(state).openItems,
};