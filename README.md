# Kairo Trading

A Next.js app built with TypeScript, SCSS modules, Ant Design, and Redux Toolkit.

## Getting started

Install dependencies and start the development server:

```bash
npm install
npm run dev:ws
```

This launches the WebSocket mock first, then Next.js via `npm run dev`, without
waiting for mock readiness. Press Ctrl+C to stop both;
if either process exits, the other is stopped as well.

## Scripts

- `npm run dev` — start Next.js only
- `npm run dev:ws` — launch the WebSocket mock first and Next.js together
- `npm run mock:ws` — run the persistent-in-memory WebSocket mock
- `npm run build` — create a production build
- `npm run start` — start the production server
- `npm run lint` — run ESLint
- `npm run lint:fix` — run ESLint with automatic fixes

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Project structure

- `src/app/page.tsx` — home page
- `src/components/dashboard/index.tsx` — quotes and order dashboard layout
- `src/components/widgets/frame/` — shared widget container, heading, and styles
- `src/components/widgets/orderBook/index.tsx` — client-side quote table
- `src/components/widgets/orderBook/index.module.scss` — quote table styles
- `src/components/virtualTable/index.tsx` — generic virtualized table
- `src/components/virtualTable/index.module.scss` — shared table layout and styles
- `src/components/widgets/createOrder/index.tsx` — Ant Design mock order form
- `src/components/widgets/createOrder/index.module.scss` — order form styles
- `src/components/header/` — application header
- `src/components/live-indicator/` — Redux-driven connection status and pulsing Live dot
- `src/components/dataFeed/index.tsx` — development WebSocket feed and reconnect lifecycle
- `src/components/dialog/index.tsx` — reusable named Redux-controlled Ant Design Modal
- `src/components/dialogs/orderPreview/` — order preview content, actions, and styles
- `src/components/dialogs/priceConfirmation/` — adverse price-change confirmation
- `src/app/providers.tsx` — application-wide Ant Design theme, message context, and Redux providers
- `src/redux/store.ts` — Redux store configuration
- `src/redux/hooks.ts` — typed Redux hooks
- `src/redux/units/common/` — connection actions, reducer, and selectors
- `src/redux/units/market/` — quotes, opening records, and active pair selection
- `src/redux/units/dialog/` — named dialog actions, reducer, and selectors
- `src/interfaces/` — shared quote, asset, order, dialog, and Redux state types
- `src/utils/parsePairSymbol.ts` — base and exchange currency extraction
- `scripts/mock-quotes.ts` — standalone Node WebSocket mock server
- `src/mocks/data.ts` — initial mock pairs and assets
- `src/app/page.module.scss` — page-scoped styles
- `src/app/globals.scss` — global styles and design tokens

## Mock quote feed

The development quote feed connects to `ws://127.0.0.1:3002/mock/quotes`.
The Node mock server maintains one shared in-memory snapshot and continues updating
it even without connected browsers. Reloads and additional tabs receive the latest
200 pairs before live updates. Restarting the mock server resets the data.
The feed is not used in production.
Each mock connection is closed after a random 1–30 seconds to simulate a disconnect.
The browser retries after a random 1–5 seconds following closure (including failed attempts)
and receives the latest snapshot on reconnect. Quote generation continues throughout;
the connection indicator shows Disconnected until the new socket opens.

Set `MOCK_WS_PORT` to change the server port and `NEXT_PUBLIC_MOCK_WS_URL` to change
the browser's endpoint (restart Next.js after changing it). HTTPS pages need a
secure `wss://` endpoint, for example through a local TLS proxy. The server binds
only to `127.0.0.1`; `http://127.0.0.1:3002/health` reports readiness.
No MSW service worker is started or required.

## Virtualized watchlist

The currency-pair table uses TanStack Virtual to render only visible rows plus
five overscan rows on either side. Vertical scrolling stays inside the table body
so column headers remain visible, with spacer rows preserving the full scroll height.
The order book samples the latest Redux quote snapshot every 1,000 ms,
retaining each displayed record's timestamp for change detection. Clicking a row
prefills a Buy Limit order; clicking its Sell (Bid) cell prefills a Sell Limit order.
Updated rows briefly flash and fade over 450 ms; the animation is disabled when
reduced motion is requested.

`VirtualTable<TItem>` takes `items`, `columnCount`, and `getItemKey(item)` for stable
row identity. `renderHeader(rowProps)` and `renderRow(rowProps, item)` each return
a complete `<tr>` element. Spread the supplied props onto the header row to retain
its accessibility attributes. For body rows, destructure `key` from `rowProps` and apply it
explicitly (`<tr key={key} {...rowProps}>`), spreading the remaining props onto the
row to preserve measurement and accessibility attributes.
Keep these render callbacks inside a Client Component.

## Mock orders and dialogs

The mock order form supports Market and Limit orders. Limit orders require a
positive limit price at the selected pair's price precision; market orders hide
that field. Previews include the order type and limit price when applicable.
The Buy/Sell button opens an order preview with a fixed snapshot of the quantity,
price, and estimated cost. It is disabled while disconnected or when the estimated
cost is invalid. Market previews capture the latest selected quote (ask for Buy,
bid for Sell); Limit previews use the entered limit price.

The preview shows live percentage movement relative to its price, formatted with
Numeral. Positive changes use `--buy-color`, negative changes use `--sell-color`,
and zero or unavailable changes retain the default text color. Submit Buy/Sell
uses the preview total, shows `Order is submited. Total: {Total} {Asset}`, and closes
the dialog. Cancel closes without submitting. These are simulated orders only;
no live trade is placed.

Named dialogs use the existing Redux store and Ant Design Modal. Register payload
types in `src/interfaces/dialog.ts`, render an `AppDialog` with its `name` and a
data render callback, and mount it inside the Redux provider. Open it with
`dispatch(DialogActions.show({ name: "orderPreview", data }))` and close it with
`dispatch(DialogActions.hide("orderPreview"))`. The close button, Escape, and
backdrop also dismiss the dialog.

If live ask rises above the preview price for Buy, or live bid falls below it for
Sell, the preview is replaced by a Price confirmation dialog. This applies to
both Market and Limit previews, with no tolerance threshold. Confirm price change
reopens the preview using the displayed new price and recalculates the total;
Cancel dismisses it without submitting. Further adverse changes require another
confirmation. Submission checks the latest quote again before showing success.

## Ideas

- Search by pairs
- Sort columns
- Assets widget with values 