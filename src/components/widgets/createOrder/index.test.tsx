import { App } from "antd";
import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import type { ActiveAssetPairRecord, AssetPairRecord } from "@/interfaces/data";
import { makeStore } from "@/redux/store";
import { CommonActions } from "@/redux/units/common/action";
import { MarketActions } from "@/redux/units/market/action";
import CreateOrderWidget from "./index";

const quote: AssetPairRecord = {
  symbol: "EURUSD",
  bid: "1.10000",
  ask: "1.20000",
  ts: 1,
  seq: 1,
};

function renderWidget({
  connected = true,
  records = [quote],
  activeRecord,
}: {
  connected?: boolean;
  records?: AssetPairRecord[];
  activeRecord?: ActiveAssetPairRecord;
} = {}) {
  const store = makeStore();
  store.dispatch(MarketActions.init(records));
  store.dispatch(CommonActions.setConnected(connected));
  if (activeRecord) store.dispatch(MarketActions.setActive(activeRecord));

  render(
    <App>
      <Provider store={store}>
        <CreateOrderWidget />
      </Provider>
    </App>,
  );

  return { store, user: userEvent.setup() };
}

describe("CreateOrderWidget", () => {
  it("previews a market Buy at the ask with the default quantity", async () => {
    const { store, user } = renderWidget();

    expect(await screen.findByText("12.00000 USD")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Buy EUR" }));

    await waitFor(() => expect(store.getState().dialog.orderPreview).toEqual({
      symbol: "EURUSD",
      side: "buy",
      orderType: "market",
      quantity: 10,
      price: 1.2,
      precision: 5,
    }));
  });

  it("uses the live bid for a market Sell and recalculates the total", async () => {
    const { store, user } = renderWidget();
    await user.click(screen.getByText("Sell", { exact: true }));

    act(() => {
      store.dispatch(MarketActions.update({ ...quote, bid: "1.15000", seq: 2, ts: 2 }));
    });
    expect(await screen.findByText("11.50000 USD")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Sell EUR" }));

    await waitFor(() => expect(store.getState().dialog.orderPreview).toMatchObject({
      side: "sell",
      orderType: "market",
      price: 1.15,
    }));
  });

  it("disables submission while disconnected and enables it on reconnect", async () => {
    const { store, user } = renderWidget({ connected: false });
    const submit = await screen.findByRole("button", { name: "Buy EUR" });

    expect(submit).toBeDisabled();
    await user.click(submit);
    expect(store.getState().dialog.orderPreview).toBeUndefined();

    act(() => { store.dispatch(CommonActions.setConnected(true)); });
    await waitFor(() => expect(submit).toBeEnabled());
  });

  it("selects the first pair when quotes arrive after mounting", async () => {
    const { store } = renderWidget({ records: [] });
    expect(screen.getByRole("button", { name: "Buy" })).toBeDisabled();

    act(() => { store.dispatch(MarketActions.update(quote)); });

    expect(await screen.findByText("12.00000 USD")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Buy EUR" })).toBeEnabled();
  });

  it("prefills a Sell Limit order from the active record with JPY precision", async () => {
    const jpyQuote = { ...quote, symbol: "USDJPY", bid: "150.123", ask: "150.456" };
    const { store, user } = renderWidget({
      records: [jpyQuote],
      activeRecord: { ...jpyQuote, side: "sell" },
    });

    expect(await screen.findByRole("spinbutton", { name: "Limit price" })).toHaveValue("150.123");
    expect(screen.getByRole("radio", { name: "Sell" })).toBeChecked();
    expect(screen.getByRole("spinbutton", { name: "Limit price" })).toHaveAttribute("step", "0.001");
    await user.click(screen.getByRole("button", { name: "Sell USD" }));

    await waitFor(() => expect(store.getState().dialog.orderPreview).toMatchObject({
      symbol: "USDJPY",
      orderType: "limit",
      side: "sell",
      price: 150.123,
      precision: 3,
    }));
  });

  it("copies the current ask into the limit field without submitting", async () => {
    const { store, user } = renderWidget({
      activeRecord: { ...quote, ask: "1.05000", side: "buy" },
    });
    const limitPrice = await screen.findByRole("spinbutton", { name: "Limit price" });
    expect(limitPrice).toHaveValue("1.05000");

    await user.click(screen.getByRole("button", { name: "Set limit price to current price" }));

    await waitFor(() => expect(limitPrice).toHaveValue("1.20000"));
    expect(screen.getByText("12.00000 USD")).toBeInTheDocument();
    expect(store.getState().dialog.orderPreview).toBeUndefined();
  });

  it("disables submission for a missing limit price or quantity", async () => {
    const { store, user } = renderWidget({ activeRecord: { ...quote, side: "buy" } });
    const submit = await screen.findByRole("button", { name: "Buy EUR" });
    const limitPrice = screen.getByRole("spinbutton", { name: "Limit price" });
    await user.clear(limitPrice);
    await user.tab();

    await waitFor(() => expect(submit).toBeDisabled());
    expect(store.getState().dialog.orderPreview).toBeUndefined();

    await user.click(screen.getByRole("button", { name: "Set limit price to current price" }));
    await waitFor(() => expect(submit).toBeEnabled());
    await user.clear(screen.getByRole("spinbutton", { name: "Quantity" }));
    await user.tab();

    await waitFor(() => expect(submit).toBeDisabled());
    expect(store.getState().dialog.orderPreview).toBeUndefined();
  });
});
