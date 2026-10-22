import { ws } from "msw";
import { INIT_ASSETS, INIT_PAIRS } from "@/mocks/data";
import { parsePairSymbol } from "@/utils/parsePairSymbol";
import type { AssetPairRecord } from "@/interfaces/data";
import Randex from "randex";

const quotesSocket = ws.link(/\/mock\/quotes$/);

const minDelay = 10;
const maxDelay = 30;

const quotesHandler = quotesSocket.addEventListener("connection", ({ client }) => {
  let sequence = INIT_PAIRS.length + 1;

  INIT_PAIRS.forEach((quote) => {
    client.send(JSON.stringify({ ...quote, ts: Date.now(), seq: sequence++ }));
  });

  let timeout: ReturnType<typeof setTimeout>;
  let closed = false;

  const sendPair = () => {
    if (closed) return;

    const pairIndex = Randex.number(0, INIT_PAIRS.length - 1);
    const pair = INIT_PAIRS[pairIndex];
    const { exchangeSymbol } = parsePairSymbol(pair.symbol);
    const precision = INIT_ASSETS.find((asset) => asset.symbol === exchangeSymbol)?.precision || 5;
    const scale = 10 ** precision;
    const initialBid = Math.round(Number(pair.bid) * scale);
    const maxChange = Math.floor(initialBid * 0.001);
    const tick = Randex.number(-maxChange, maxChange);
    const bid = Math.max(1, initialBid + tick);
    const spreadPercent = Randex.number(0.05, 0.2, { decimals: 4 });
    const spread = Math.max(1, Math.round(bid * spreadPercent / 100));
    const update: AssetPairRecord = {
      ...pair,
      bid: (bid / scale).toFixed(precision),
      ask: ((bid + spread) / scale).toFixed(precision),
      ts: Date.now(),
      seq: sequence++,
    };

    client.send(JSON.stringify(update));
    if (!closed) {
      const newDelay = Randex.number(minDelay, maxDelay, {decimals: 1});
      // console.log(`Next update in ${newDelay} seconds`);
      timeout = setTimeout(sendPair, newDelay);
    }
  };

  timeout = setTimeout(sendPair, Randex.number(minDelay, maxDelay, {decimals: 1}));

  client.addEventListener("close", () => {
    closed = true;
    clearTimeout(timeout);
  });
});

export const handlers = [quotesHandler];
