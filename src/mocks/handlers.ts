import { ws } from "msw";
import { initialQuotes, type Quote } from "@/redux/features/market";

const quotesSocket = ws.link(/\/mock\/quotes$/);

const quotesHandler = quotesSocket.addEventListener("connection", ({ client }) => {
  let sequence = 98243;
  let quoteIndex = 0;

  initialQuotes.forEach((quote) => {
    client.send(JSON.stringify({ ...quote, ts: Date.now(), seq: sequence++ }));
  });

  const interval = setInterval(() => {
    const quote = initialQuotes[quoteIndex];
    const precision = quote.symbol.includes("JPY") ? 3 : 5;
    const scale = 10 ** precision;
    const spread = Math.max(1, Math.round((Number(quote.ask) - Number(quote.bid)) * scale));
    const tick = (sequence % 7) - 3;
    const bid = Math.max(1, Math.round(Number(quote.bid) * scale) + tick);
    const update: Quote = {
      ...quote,
      bid: (bid / scale).toFixed(precision),
      ask: ((bid + spread) / scale).toFixed(precision),
      ts: Date.now(),
      seq: sequence++,
    };

    client.send(JSON.stringify(update));
    quoteIndex = (quoteIndex + 1) % initialQuotes.length;
  }, 50);

  client.addEventListener("close", () => clearInterval(interval));
});

export const handlers = [quotesHandler];
