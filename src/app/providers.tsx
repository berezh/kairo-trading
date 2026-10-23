"use client";

import dynamic from "next/dynamic";
import { App, ConfigProvider, theme } from "antd";
import { useState, type ReactNode } from "react";
import { Provider } from "react-redux";
import { makeStore, type AppStore } from "@/redux/store";

const QuotesFeed = dynamic(() => import("../components/dataFeed"), { ssr: false });

export default function Providers({ children }: { children: ReactNode }) {
  const [store] = useState<AppStore>(makeStore);

  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        components: {
          Button: {
            primaryColor: "#000",
          },
        },
        token: {
          colorPrimary: "#7ee7bf",
          colorBgBase: "#0b100f",
          colorBgContainer: "#101715",
          colorBorder: "#26312d",
          colorText: "#f1f5f3",
          colorTextSecondary: "#899590",
          borderRadius: 8,
          fontFamily: "Arial, Helvetica, sans-serif",
        },
      }}
    >
      <App>
        <Provider store={store}>
          {children}
          <QuotesFeed />
        </Provider>
      </App>
    </ConfigProvider>
  );
}
