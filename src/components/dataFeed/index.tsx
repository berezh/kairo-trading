"use client";

import { useEffect } from "react";
import { startMocking } from "@/mocks/browser";
import { useAppDispatch } from "@/redux/hooks";
import { MarketActions, type Quote } from "@/redux/features/market";

function isQuote(value: unknown): value is Quote {
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

    let socket: WebSocket | undefined;
    let cancelled = false;

    const startFeed = async () => {
      await startMocking();

      if (cancelled) {
        return;
      }

      const socketUrl = new URL("/mock/quotes", window.location.href);
      socketUrl.protocol = socketUrl.protocol === "https:" ? "wss:" : "ws:";
      socket = new WebSocket(socketUrl);

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
    };

    void startFeed().catch((error: unknown) => {
      if (!cancelled) {
        console.error("Failed to start the mock quotes WebSocket feed.", error);
      }
    });

    return () => {
      cancelled = true;
      socket?.close();
    };
  }, [dispatch]);

  return null;
}
