import { act, fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import type { AssetPairRecord } from "@/interfaces/data";
import { makeStore } from "@/redux/store";
import { MarketActions } from "@/redux/units/market/action";
import OrderBookWidget from "./index";

jest.mock("@tanstack/react-virtual", () => ({
  useVirtualizer: ({ count, getItemKey }: {
    count: number;
    getItemKey: (index: number) => string;
  }) => ({
    getVirtualItems: () => Array.from({ length: count }, (_, index) => ({
      index,
      key: getItemKey(index),
      start: index * 53,
      end: (index + 1) * 53,
    })),
    getTotalSize: () => count * 53,
    measureElement: jest.fn(),
  }),
}));

jest.mock("./chart", () => ({
  __esModule: true,
  default: () => null,
}));

const quote: AssetPairRecord = {
  symbol: "EURUSD",
  bid: "1.10000",
  ask: "1.20000",
  ts: 1,
  seq: 1,
};

function renderWidget(records: AssetPairRecord[] = [quote]) {
  const store = makeStore();
  store.dispatch(MarketActions.update(records));
  const result = render(
    <Provider store={store}>
      <OrderBookWidget />
    </Provider>,
  );
  return { ...result, store };
}

describe("OrderBookWidget", () => {
  beforeEach(() => { jest.useFakeTimers(); });
  afterEach(() => { jest.useRealTimers(); });

  it("renders the heading, six columns, and initial quote values", () => {
    renderWidget();

    expect(screen.getByRole("heading", { name: "Watchlist" })).toBeInTheDocument();
    expect(screen.getAllByRole("columnheader")).toHaveLength(6);
    const row = screen.getByRole("rowheader", { name: /EURUSD/ }).closest("tr")!;
    expect(within(row).getByText("1.10000")).toBeInTheDocument();
    expect(within(row).getByText("1.20000")).toBeInTheDocument();
    expect(within(row).getByText("0.1")).toBeInTheDocument();
    expect(within(row).getByText("0%")).toBeInTheDocument();
    expect(screen.getByRole("table")).toHaveAttribute("aria-rowcount", "2");
  });

  it("renders an empty table when no quotes are available", () => {
    renderWidget([]);

    expect(screen.getAllByRole("columnheader")).toHaveLength(6);
    expect(screen.queryByRole("rowheader")).not.toBeInTheDocument();
    expect(screen.getByRole("table")).toHaveAttribute("aria-rowcount", "1");
  });

  it("selects a record without a Sell override when its row is clicked", () => {
    const { store } = renderWidget();

    fireEvent.click(screen.getByRole("rowheader", { name: "EURUSD" }));

    expect(store.getState().market.activeRecord).toMatchObject(quote);
    expect(store.getState().market.activeRecord?.side).toBeUndefined();
  });

  it("selects Sell when the bid is clicked without invoking row selection", () => {
    const { store } = renderWidget();

    fireEvent.click(screen.getByRole("button", { name: "Sell EURUSD at 1.10000" }));

    expect(store.getState().market.activeRecord).toMatchObject({ ...quote, side: "sell" });
  });

  it("samples quotes every second and highlights upward and downward changes", () => {
    const { store } = renderWidget();
    act(() => {
      store.dispatch(MarketActions.update([{
        ...quote, bid: "1.20000", ask: "1.30000", ts: 2, seq: 2,
      }]));
      jest.advanceTimersByTime(999);
    });
    expect(screen.getByText("1.10000")).toBeInTheDocument();
    expect(screen.queryByText("1.30000")).not.toBeInTheDocument();

    act(() => { jest.advanceTimersByTime(1); });

    expect(screen.getByText("1.30000")).toBeInTheDocument();
    expect(screen.getByText("(1 updated / sec)")).toBeInTheDocument();
    const row = screen.getByRole("rowheader", { name: /EURUSD/ }).closest("tr")!;
    expect(row).toHaveClass("updatedPlus");
    expect(within(row).getByText("10%")).toHaveClass("buyPrice");

    act(() => {
      store.dispatch(MarketActions.update([{
        ...quote, bid: "1.00000", ask: "1.10000", ts: 3, seq: 3,
      }]));
    });
    act(() => { jest.advanceTimersByTime(1000); });

    expect(screen.getByText("1.00000")).toBeInTheDocument();
    expect(row).toHaveClass("updatedMinus");
    expect(within(row).getByText("-10%")).toHaveClass("sellPrice");
  });

  it("supports keyboard activation of Sell and Buy actions", async () => {
    const { store } = renderWidget();
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

    await user.tab();
    expect(screen.getByRole("textbox", { name: "Search symbols" })).toHaveFocus();
    await user.tab();
    expect(screen.getByLabelText("Scrollable table rows")).toHaveFocus();
    await user.tab();
    expect(screen.getByRole("button", { name: "Sell EURUSD at 1.10000" })).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(store.getState().market.activeRecord?.side).toBe("sell");
    await user.tab();
    expect(screen.getByRole("button", { name: "Buy EURUSD at 1.20000" })).toHaveFocus();
    await user.keyboard(" ");
    expect(store.getState().market.activeRecord?.side).toBe("buy");
  });

  it("filters symbols case-insensitively and restores rows when cleared", () => {
    renderWidget([quote, { ...quote, symbol: "USDJPY" }]);
    const search = screen.getByRole("textbox", { name: "Search symbols" });
    fireEvent.change(search, { target: { value: " eur " } });
    expect(screen.getByRole("rowheader", { name: "EURUSD" })).toBeInTheDocument();
    expect(screen.queryByRole("rowheader", { name: "USDJPY" })).not.toBeInTheDocument();
    fireEvent.change(search, { target: { value: "missing" } });
    expect(screen.queryByRole("rowheader")).not.toBeInTheDocument();
    fireEvent.change(search, { target: { value: "" } });
    expect(screen.getAllByRole("rowheader")).toHaveLength(2);
  });

  it("keeps the filter while quotes update", () => {
    const { store } = renderWidget([quote, { ...quote, symbol: "USDJPY" }]);
    fireEvent.change(screen.getByRole("textbox", { name: "Search symbols" }), {
      target: { value: "eur" },
    });
    act(() => {
      store.dispatch(MarketActions.update([{ ...quote, ask: "1.30000", seq: 2, ts: 2 }]));
    });
    act(() => { jest.advanceTimersByTime(1000); });
    expect(screen.getByText("1.30000")).toBeInTheDocument();
    expect(screen.getAllByRole("rowheader")).toHaveLength(1);
  });

  it("clears the sampling interval on unmount", () => {
    const setIntervalSpy = jest.spyOn(globalThis, "setInterval");
    const clearIntervalSpy = jest.spyOn(globalThis, "clearInterval");
    const { unmount } = renderWidget();
    const samplingCall = setIntervalSpy.mock.calls.findIndex(([, delay]) => delay === 1000);
    expect(samplingCall).toBeGreaterThanOrEqual(0);
    const interval = setIntervalSpy.mock.results[samplingCall].value;

    unmount();

    expect(clearIntervalSpy).toHaveBeenCalledWith(interval);
    setIntervalSpy.mockRestore();
    clearIntervalSpy.mockRestore();
  });
});
