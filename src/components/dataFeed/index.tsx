"use client";

import { useEffect } from "react";
import { useAppDispatch } from "@/redux/hooks";
import { MarketActions } from "@/redux/units/market/action";
import { CommonActions } from "@/redux/units/common/action";
import type { AssetPairRecord } from "@/interfaces/data";
import { Randex } from "randex/lib/custom";

const RECONNECT_DELAY_PERIOD = [1_000, 5_000];

function isQuote(value: unknown): value is AssetPairRecord {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const quote = value as Record<string, unknown>;

  return (
    typeof quote.symbol === "string" &&
    typeof quote.bid === "string" &&
    typeof quote.ask === "string" &&
    typeof quote.ts === "number" &&
    Number.isFinite(quote.ts) &&
    typeof quote.seq === "number" &&
    Number.isFinite(quote.seq)
  );
}

export default function DataFeed() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (process.env.NODE_ENV !== "development") {
      return;
    }

    let active = true;
    let socket: WebSocket | undefined;
    let reconnectTimeout: ReturnType<typeof setTimeout> | undefined;

    function connect() {
      if (!active) return;
      const currentSocket = new WebSocket(
        process.env.NEXT_PUBLIC_MOCK_WS_URL ?? "ws://127.0.0.1:3002/mock/quotes",
      );
      socket = currentSocket;

      currentSocket.addEventListener("open", () => {
        if (active && socket === currentSocket) dispatch(CommonActions.setConnected(true));
      });

      currentSocket.addEventListener("message", (event: MessageEvent<unknown>) => {
        if (!active || socket !== currentSocket) return;
        if (typeof event.data !== "string") {
          console.error("Ignoring a non-text message from the mock quotes socket.");
          return;
        }

        let message: unknown;

        try {
          message = JSON.parse(event.data);
        } catch (error) {
          console.error("Failed to parse a message from the mock quotes socket.", error);
          return;
        }

        if (!Array.isArray(message) || !message.every(isQuote)) {
          console.error("Ignoring an invalid quote batch from the mock quotes socket.");
          return;
        }

          dispatch(MarketActions.update(message));
        
      });

      currentSocket.addEventListener("error", (event) => {
        if (!active || socket !== currentSocket) return;
        dispatch(CommonActions.setConnected(false));
        console.error("The mock quotes WebSocket encountered an error.", event);
      });
      currentSocket.addEventListener("close", (event) => {
        if (!active || socket !== currentSocket) return;
        dispatch(CommonActions.setConnected(false));
        if (!event.wasClean) {
          console.error("The mock quotes WebSocket closed unexpectedly. Run npm run mock:ws.", event);
        }
        reconnectTimeout = setTimeout(connect,  Randex.number(RECONNECT_DELAY_PERIOD[0], RECONNECT_DELAY_PERIOD[1]));
      });
    }

    connect();

    return () => {
      active = false;
      clearTimeout(reconnectTimeout);
      dispatch(CommonActions.setConnected(false));
      socket?.close();
    };
  }, [dispatch]);

  return null;
}
