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
- `src/components/Dashboard.tsx` — quotes and order dashboard layout
- `src/components/widget/orderBook/index.tsx` — client-side quote table
- `src/components/widget/orderBook/OrderBook.module.scss` — quote table styles
- `src/components/widgets/createOrder/index.tsx` — client-only order panel
- `src/components/widgets/createOrder/create-order.tsx` — Ant Design mock order form
- `src/components/widgets/createOrder/CreateOrder.module.scss` — order form styles
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

## Scripts

- `npm run dev` — start the development server
- `npm run build` — create a production build
- `npm run start` — start the production server
- `npm run lint` — run ESLint
