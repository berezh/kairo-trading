import { expect, test, type WebSocketRoute } from "@playwright/test";
import type { AssetPairRecord } from "../src/interfaces/data";

test("confirms an increased Buy Limit price before submitting the order", async ({ page }) => {
  let socket: WebSocketRoute | undefined;
  const quote: AssetPairRecord = {
    symbol: "EURUSD",
    bid: "1.10000",
    ask: "1.20000",
    ts: 1,
    seq: 1,
  };

  await page.routeWebSocket("**/mock/quotes", (route) => {
    socket = route;
    route.send(JSON.stringify([quote]));
  });
  await page.goto("/");
  await expect(page.getByRole("status")).toHaveText("Live");

  const orderType = page.getByRole("combobox", { name: "Order type", exact: true });
  await orderType.click();
  await orderType.press("ArrowDown");
  await orderType.press("Enter");
  await page.getByRole("spinbutton", { name: "Limit price", exact: true }).fill("1.20000");
  await page.getByRole("spinbutton", { name: "Quantity", exact: true }).fill("10");
  await page.getByRole("button", { name: "Buy EUR", exact: true }).click();

  const preview = page.getByRole("dialog", { name: "Order preview", exact: true });
  await expect(preview).toBeVisible();
  await expect(preview.getByText("Limit", { exact: true })).toBeVisible();
  await expect(preview.getByText("1.20000 USD", { exact: true })).toBeVisible();
  await expect(preview.getByText("12.00000 USD", { exact: true })).toBeVisible();

  if (!socket) throw new Error("The quote WebSocket did not connect.");
  socket.send(JSON.stringify([{ ...quote, ask: "1.30000", ts: 2, seq: 2 }]));

  const confirmation = page.getByRole("dialog", { name: "Price confirmation", exact: true });
  await expect(confirmation).toBeVisible();
  await expect(preview).toBeHidden();
  await expect(confirmation.getByText("1.20000 USD", { exact: true })).toBeVisible();
  await expect(confirmation.getByText("1.30000 USD", { exact: true })).toBeVisible();
  await expect(confirmation.getByText("13.00000 USD", { exact: true })).toBeVisible();
  await confirmation.getByRole("button", { name: "Confirm price change", exact: true }).click();

  await expect(confirmation).toBeHidden();
  await expect(preview).toBeVisible();
  await expect(preview.getByText("1.30000 USD", { exact: true })).toBeVisible();
  await expect(preview.getByText("13.00000 USD", { exact: true })).toBeVisible();
  await preview.getByRole("button", { name: "Submit Buy", exact: true }).click();

  await expect(page.getByText("Order is submited. Total: 13.00000 USD", { exact: true })).toBeVisible();
  await expect(preview).toBeHidden();
  await expect(confirmation).toBeHidden();
});
