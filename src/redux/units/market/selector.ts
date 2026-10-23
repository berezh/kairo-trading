import type { ReduxStoreState } from "@/interfaces/state";

const baseSelector = (state: ReduxStoreState) => state.market;

export const MarketSelectors = {
  records: (state: ReduxStoreState) => baseSelector(state).records,
  openRecords: (state: ReduxStoreState) => baseSelector(state).openRecords,
  activeRecord: (state: ReduxStoreState) => baseSelector(state).activeRecord,
  liveRecord: (marketSymbol: string) => (state: ReduxStoreState) =>
    baseSelector(state).records.find(record => record.symbol === marketSymbol)
};