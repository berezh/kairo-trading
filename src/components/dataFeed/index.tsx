"use client";

import { useEffect } from "react";
import { useAppDispatch } from "@/redux/hooks";
import { MarketActions } from "@/redux/features/market";
import type { AssetPairRecord } from "@/interfaces/data";

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

    const socket = new WebSocket(
      process.env.NEXT_PUBLIC_MOCK_WS_URL ?? "ws://127.0.0.1:3002/mock/quotes",
    );

    socket.addEventListener("message", (event: MessageEvent<unknown>) => {
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

      if (!isQuote(message)) {
        console.error("Ignoring an invalid quote message from the mock quotes socket.");
        return;
      }

      dispatch(MarketActions.update(message));
    });

    socket.addEventListener("error", (event) => {
      console.error("The mock quotes WebSocket encountered an error.", event);
    });
    socket.addEventListener("close", (event) => {
      if (!event.wasClean) {
        console.error("The mock quotes WebSocket closed unexpectedly. Run npm run mock:ws.", event);
      }
    });

    return () => {
      socket.close();
    };
  }, [dispatch]);

  return null;
}
