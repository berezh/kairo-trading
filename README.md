# Kairo Trading

A Next.js app built with TypeScript, SCSS modules, Ant Design, and Redux Toolkit.

## Getting started

Install dependencies and start the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Project structure

- `src/app/page.tsx` — home page
- `src/components/dashboard/index.tsx` — quotes and order dashboard layout
- `src/components/widgetFrame/index.tsx` — shared widget container and heading
- `src/components/widgetFrame/index.module.scss` — shared widget frame styles
- `src/components/widgets/orderBook/index.tsx` — client-side quote table
- `src/components/widgets/orderBook/index.module.scss` — quote table styles
- `src/components/virtualTable/index.tsx` — generic virtualized table
- `src/components/virtualTable/index.module.scss` — shared table layout and styles
- `src/components/widgets/createOrder/index.tsx` — Ant Design mock order form
- `src/components/widgets/createOrder/index.module.scss` — order form styles
- `src/app/providers.tsx` — application-wide Ant Design theme, message context, and Redux providers
- `src/app/quotes-feed.tsx` — development WebSocket quote feed
- `src/lib/store.ts` — Redux store configuration
- `src/lib/features/quotes/quotesSlice.ts` — quote state and reducers
- `src/lib/hooks.ts` — typed Redux hooks
- `src/mocks/handlers.ts` — MSW WebSocket mock handlers
- `src/mocks/browser.ts` — MSW browser worker
- `src/app/page.module.scss` — page-scoped styles
- `src/app/globals.scss` — global styles and design tokens

The quote stream is mocked in development with MSW. Its service worker is
generated at `public/mockServiceWorker.js` by running `npx msw init public`.
It is not used in production.

The currency-pair table uses TanStack Virtual to render only visible rows plus
five overscan rows on either side. Vertical scrolling stays inside the table body
so column headers remain visible, with spacer rows preserving the full scroll height.
The order book shows initial data immediately and applies the latest quote snapshot
at most every 500 ms, retaining each pair's previously displayed timestamp.
Updated rows briefly flash and fade over 450 ms; the animation is disabled when
reduced motion is requested.

`VirtualTable<TItem>` takes `items`, `columnCount`, and `getItemKey(item)` for stable
row identity. `renderHeader(rowProps)` and `renderRow(rowProps, item)` each return
a complete `<tr>` element. Spread the supplied props onto the header row to retain
its accessibility attributes. For body rows, destructure `key` from `rowProps` and apply it
explicitly (`<tr key={key} {...rowProps}>`), spreading the remaining props onto the
row to preserve measurement and accessibility attributes.
Keep these render callbacks inside a Client Component.

## Scripts

- `npm run dev` — start the development server
- `npm run build` — create a production build
- `npm run start` — start the production server
- `npm run lint` — run ESLint
