import type { AssetPairRecord } from "@/interfaces/data";
import { MarketActions } from "./action";
import { MarketReducer } from "./reducer";

const quote: AssetPairRecord = {
  symbol: "EURUSD", bid: "1.1", ask: "1.2", ts: 1, seq: 10,
};

describe("MarketReducer batch updates", () => {
  it("adds multiple symbols and stores their first opening records", () => {
    const other = { ...quote, symbol: "USDJPY" };
    const state = MarketReducer(undefined, MarketActions.update([quote, other]));
    expect(state.records).toEqual([quote, other]);
    expect(state.openRecords).toEqual([quote, other]);
  });

  it("keeps the highest sequence for repeated symbols and preserves the opening record", () => {
    const newer = { ...quote, seq: 12, bid: "1.3" };
    const state = MarketReducer(undefined, MarketActions.update([
      quote, newer, { ...quote, seq: 11 }, { ...newer, ask: "9" },
    ]));
    expect(state.records).toEqual([newer]);
    expect(state.openRecords).toEqual([quote]);
  });

  it("ignores empty batches and older or equal sequences for existing records", () => {
    const state = MarketReducer(undefined, MarketActions.update([quote]));
    expect(MarketReducer(state, MarketActions.update([]))).toBe(state);
    expect(MarketReducer(state, MarketActions.update([
      { ...quote, seq: 9 }, { ...quote, ask: "9" },
    ]))).toBe(state);
  });
});
