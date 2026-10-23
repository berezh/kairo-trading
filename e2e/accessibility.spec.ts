import { expect, test, type Locator, type Page, type WebSocketRoute } from "@playwright/test";

async function tabTo(page: Page, target: Locator) {
  for (let i = 0; i < 30; i++) {
    await page.keyboard.press("Tab");
    if (await target.evaluate((element) => element === document.activeElement)) return;
  }
  throw new Error("Control could not be reached with Tab.");
}

for (const reducedMotion of ["no-preference", "reduce"] as const) {
  test(`keyboard ordering and non-color price movement (${reducedMotion})`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion });
    let socket: WebSocketRoute | undefined;
    const quote = { symbol: "EURUSD", bid: "1.10000", ask: "1.20000", ts: 1, seq: 1 };
    await page.routeWebSocket("**/mock/quotes", (route) => {
      socket = route;
      route.send(JSON.stringify(quote));
    });
    await page.goto("/");
    const sell = page.getByRole("button", { name: "Sell EURUSD at 1.10000" });
    await expect(sell).toBeVisible();
    await tabTo(page, sell);
    await expect(sell).toBeFocused();
    await expect(sell).toHaveCSS("outline-style", "solid");
    await page.keyboard.press("Enter");
    await expect(page.getByRole("radio", { name: "Sell", exact: true })).toBeChecked();

    const buy = page.getByRole("button", { name: "Buy EURUSD at 1.20000" });
    await page.keyboard.press("Tab");
    await expect(buy).toBeFocused();
    await page.keyboard.press("Space");
    await expect(page.getByRole("radio", { name: "Buy", exact: true })).toBeChecked();

    const submit = page.getByRole("button", { name: "Buy EUR", exact: true });
    await tabTo(page, submit);
    await page.keyboard.press("Enter");
    const preview = page.getByRole("dialog", { name: "Order preview", exact: true });
    await expect(preview).toBeVisible();
    await tabTo(page, preview.getByRole("button", { name: "Cancel", exact: true }));
    await page.keyboard.press("Enter");
    await expect(preview).toBeHidden();

    if (!socket) throw new Error("The quote WebSocket did not connect.");
    socket.send(JSON.stringify({ ...quote, bid: "1.20000", ask: "1.30000", ts: 2, seq: 2 }));
    const row = page.getByRole("row").filter({ has: page.getByRole("rowheader", { name: /EURUSD/ }) });
    await expect(row.getByText("Up", { exact: true })).toBeVisible();
    if (reducedMotion === "reduce") {
      await expect(row).toHaveCSS("animation-name", "none");
      const statusAnimations = await page.getByRole("status").evaluate((element) =>
        [element, ...element.querySelectorAll("*")].flatMap((node) =>
          node.getAnimations().filter((animation) => animation.playState === "running").map(() => true),
        ),
      );
      expect(statusAnimations).toEqual([]);
    }
    socket.send(JSON.stringify({ ...quote, ts: 3, seq: 3 }));
    await expect(row.getByText("Down", { exact: true })).toBeVisible();
  });
}
