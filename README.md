# Kairo Trading

A Next.js app built with TypeScript and SCSS modules.

## Getting started

Install dependencies and start the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Project structure

- `src/app/page.tsx` — home page
- `src/app/market-quotes.tsx` — client-side quote table
- `src/app/providers.tsx` — Redux provider
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
