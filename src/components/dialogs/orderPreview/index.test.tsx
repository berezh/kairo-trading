import { App } from "antd";
import { act, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import type { OrderPreviewData } from "@/interfaces/dialog";
import { makeStore } from "@/redux/store";
import { CommonActions } from "@/redux/units/common/action";
import { DialogActions } from "@/redux/units/dialog/action";
import { MarketActions } from "@/redux/units/market/action";
import OrderPreviewDialog from "./index";

const order: OrderPreviewData = {
  symbol: "EURUSD",
  side: "buy",
  orderType: "market",
  quantity: 10,
  price: 1.2,
  precision: 5,
};

function renderDialog({
  opened = true,
  connected = true,
  preview = order,
}: {
  opened?: boolean;
  connected?: boolean;
  preview?: OrderPreviewData;
} = {}) {
  const store = makeStore();
  store.dispatch(CommonActions.setConnected(connected));
  store.dispatch(MarketActions.update([{
    symbol: "EURUSD",
    bid: "1.10000",
    ask: "1.20000",
    ts: 1,
    seq: 1,
  }]));
  if (opened) store.dispatch(DialogActions.show({ name: "orderPreview", data: preview }));

  render(
    <App>
      <Provider store={store}>
        <OrderPreviewDialog />
      </Provider>
    </App>,
  );

  return { store, user: userEvent.setup() };
}

describe("OrderPreviewDialog", () => {
  beforeAll(() => {
    const getComputedStyle = window.getComputedStyle;
    // Modal scroll locking requests pseudo-element styles unsupported by jsdom.
    jest.spyOn(window, "getComputedStyle").mockImplementation(
      (element) => getComputedStyle(element),
    );
  });

  afterAll(() => { jest.restoreAllMocks(); });

  it("stays hidden until its named dialog is opened", async () => {
    const { store } = renderDialog({ opened: false });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    act(() => {
      store.dispatch(DialogActions.show({ name: "orderPreview", data: order }));
    });

    await waitFor(() => expect(
      screen.getByRole("dialog", { name: "Order preview" }),
    ).toBeVisible());
  });

  it("renders the supplied Buy order and estimated cost", async () => {
    renderDialog();
    const dialog = within(await screen.findByRole("dialog", { name: "Order preview" }));

    expect(dialog.getByText("EURUSD")).toBeInTheDocument();
    expect(dialog.getByText("Market")).toBeInTheDocument();
    expect(dialog.getByText("10 EUR")).toBeInTheDocument();
    expect(dialog.getByText("1.20000 USD")).toBeInTheDocument();
    expect(dialog.getByText("12.00000 USD")).toBeInTheDocument();
    expect(dialog.getByRole("button", { name: "Submit Buy" })).toBeEnabled();
  });

  it("closes on Cancel without showing a submission message", async () => {
    const { store, user } = renderDialog();
    await user.click(screen.getByRole("button", { name: "Cancel" }));

    await waitFor(() => expect(store.getState().dialog.orderPreview).toBeUndefined());
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(screen.queryByText(/Order is submited/)).not.toBeInTheDocument();
  });

  it("closes when the modal Close button is clicked", async () => {
    const { store, user } = renderDialog();
    await user.click(screen.getByRole("button", { name: "Close" }));

    await waitFor(() => expect(store.getState().dialog.orderPreview).toBeUndefined());
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });

  it("submits a Sell order using its preview total and closes", async () => {
    const { store, user } = renderDialog({
      preview: { ...order, side: "sell", price: 1.1 },
    });
    await user.click(screen.getByRole("button", { name: "Submit Sell" }));

    expect(await screen.findByText("Order is submited. Total: 11.00000 USD")).toBeInTheDocument();
    expect(store.getState().dialog.orderPreview).toBeUndefined();
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });

  it("disables Submit while disconnected but allows cancellation", async () => {
    const { store, user } = renderDialog({ connected: false });
    const submit = screen.getByRole("button", { name: "Submit Buy" });

    expect(submit).toBeDisabled();
    expect(screen.getByRole("button", { name: "Cancel" })).toBeEnabled();
    await user.click(submit);
    expect(store.getState().dialog.orderPreview).toEqual(order);
    expect(screen.queryByText(/Order is submited/)).not.toBeInTheDocument();

    act(() => { store.dispatch(CommonActions.setConnected(true)); });
    await waitFor(() => expect(submit).toBeEnabled());
  });
});
