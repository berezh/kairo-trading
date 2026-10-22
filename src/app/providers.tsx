"use client";

import dynamic from "next/dynamic";
import { useState, type ReactNode } from "react";
import { Provider } from "react-redux";
import { makeStore, type AppStore } from "@/lib/store";

const QuotesFeed = dynamic(() => import("./quotes-feed"), { ssr: false });

export default function Providers({ children }: { children: ReactNode }) {
  const [store] = useState<AppStore>(makeStore);

  return (
    <Provider store={store}>
      {children}
      <QuotesFeed />
    </Provider>
  );
}
