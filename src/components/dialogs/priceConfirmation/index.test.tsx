import { act, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import type { DialogData } from "@/interfaces/dialog";
import { makeStore } from "@/redux/store";
import { DialogActions } from "@/redux/units/dialog/action";
import PriceConfirmationDialog from "./index";

const confirmation: DialogData["priceConfirmation"] = {
  order: {
    symbol: "EURUSD",
    side: "buy",
    orderType: "limit",
    quantity: 10,
    price: 1.2,
    precision: 5,
  },
  price: 1.3,
};

function renderDialog({
  opened = true,
  data = confirmation,
}: {
  opened?: boolean;
  data?: DialogData["priceConfirmation"];
} = {}) {
  const store = makeStore();
  if (opened) store.dispatch(DialogActions.show({ name: "priceConfirmation", data }));

  render(
    <Provider store={store}>
      <PriceConfirmationDialog />
    </Provider>,
  );

  return { store, user: userEvent.setup() };
}

describe("PriceConfirmationDialog", () => {
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
      store.dispatch(DialogActions.show({ name: "priceConfirmation", data: confirmation }));
    });

    await waitFor(() => expect(
      screen.getByRole("dialog", { name: "Price confirmation" }),
    ).toBeVisible());
  });

  it("shows a Buy price increase, previous price, new price, and recalculated cost", () => {
    renderDialog();
    const dialog = within(screen.getByRole("dialog", { name: "Price confirmation" }));

    expect(dialog.getByText(/ask has increased/)).toBeInTheDocument();
    expect(dialog.getByText("EURUSD")).toBeInTheDocument();
    expect(dialog.getByText("1.20000 USD")).toBeInTheDocument();
    expect(dialog.getByText("1.30000 USD")).toBeInTheDocument();
    expect(dialog.getByText("13.00000 USD")).toBeInTheDocument();
  });

  it("shows a Sell price decrease with the pair's precision and exchange currency", () => {
    renderDialog({
      data: {
        order: { ...confirmation.order, symbol: "USDJPY", side: "sell", price: 150.123, precision: 3 },
        price: 149.987,
      },
    });
    const dialog = within(screen.getByRole("dialog", { name: "Price confirmation" }));

    expect(dialog.getByText(/bid has decreased/)).toBeInTheDocument();
    expect(dialog.getByText("150.123 JPY")).toBeInTheDocument();
    expect(dialog.getByText("149.987 JPY")).toBeInTheDocument();
    expect(dialog.getByText("1499.870 JPY")).toBeInTheDocument();
  });

  it("opens the order preview with the confirmed price and preserves other order fields", async () => {
    const { store, user } = renderDialog();
    await user.click(screen.getByRole("button", { name: "Confirm price change" }));

    await waitFor(() => expect(store.getState().dialog.orderPreview).toEqual({
      ...confirmation.order,
      price: confirmation.price,
    }));
    expect(store.getState().dialog.priceConfirmation).toBeUndefined();
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });

  it("cancels without reopening the order preview", async () => {
    const { store, user } = renderDialog();
    await user.click(screen.getByRole("button", { name: "Cancel" }));

    await waitFor(() => expect(store.getState().dialog.priceConfirmation).toBeUndefined());
    expect(store.getState().dialog.orderPreview).toBeUndefined();
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });

  it("dismisses through the modal Close button without accepting the new price", async () => {
    const { store, user } = renderDialog();
    await user.click(screen.getByRole("button", { name: "Close" }));

    await waitFor(() => expect(store.getState().dialog.priceConfirmation).toBeUndefined());
    expect(store.getState().dialog.orderPreview).toBeUndefined();
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });
});
