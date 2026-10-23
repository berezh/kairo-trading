import { createServer } from "node:http";
import { WebSocket, WebSocketServer } from "ws";
import { INIT_ASSETS, INIT_PAIRS } from "../src/mocks/data";
import { parsePairSymbol } from "../src/utils/parsePairSymbol";
import type { AssetPairRecord } from "../src/interfaces/data";
import Randex from "randex";

const MIN_DISCONNECT_DELAY_MS = 1_000;
const MAX_DISCONNECT_DELAY_MS = 30_000;
const WRONG_SEQ_FREAQENCY = 0.03; // 3% of the updates will have wrong sequence number

const port = Number(process.env.MOCK_WS_PORT ?? 3002);
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error("MOCK_WS_PORT must be an integer between 1 and 65535.");
}

const pairs = INIT_PAIRS.map((pair) => ({ ...pair }));
let sequence = Math.max(...pairs.map((pair) => pair.seq)) + 1;
const server = createServer((request, response) => {
  if (request.url === "/health") {
    response.writeHead(200, { "Content-Type": "application/json" });
    response.end(JSON.stringify({ pairs: pairs.length, sequence }));
    return;
  }
  response.writeHead(404);
  response.end();
});
const sockets = new WebSocketServer({ server, path: "/mock/quotes" });

sockets.on("connection", (socket) => {
  console.log("\x1b[32mServer connected.\x1b[0m");
  socket.on("error", (error) => console.error("Mock quotes client error:", error));
  const disconnectDelay = Randex.number(MIN_DISCONNECT_DELAY_MS, MAX_DISCONNECT_DELAY_MS);
  const disconnectTimeout = setTimeout(() => {
    if (socket.readyState === WebSocket.OPEN) {
      console.log("\x1b[31mServer disconnected.\x1b[0m");
      socket.close(1012, "Simulated reconnect");
    }
  }, disconnectDelay);
  socket.once("close", () => clearTimeout(disconnectTimeout));
  for (const pair of pairs) {
    socket.send(JSON.stringify(pair));
  }
});
sockets.on("error", (error) => {
  console.error("Mock quotes WebSocket server error:", error);
  shutdown(1);
});
server.on("error", (error) => {
  console.error("Mock quotes HTTP server error:", error);
  shutdown(1);
});

let timeout: ReturnType<typeof setTimeout> | undefined;
let stopped = false;

function sendPair() {
  if (stopped) return;

  const pairIndex = Randex.number(0, INIT_PAIRS.length - 1);
  const initialPair = INIT_PAIRS[pairIndex];
  const { exchangeSymbol } = parsePairSymbol(initialPair.symbol);
  const asset = INIT_ASSETS.find((item) => item.symbol === exchangeSymbol);
  if (!asset) {
    throw new Error(`Missing asset precision for ${exchangeSymbol}.`);
  }
  const scale = 10 ** asset.precision;
  const initialBid = Math.round(Number(initialPair.bid) * scale);
  const maxChange = Math.floor(initialBid * 0.001);
  const bid = Math.max(1, initialBid + Randex.number(-maxChange, maxChange));
  const spreadPercent = Randex.number(0.05, 0.2, { decimals: 4 });
  const spread = Math.max(1, Math.round(bid * spreadPercent / 100));
  const update: AssetPairRecord = {
    ...initialPair,
    bid: (bid / scale).toFixed(asset.precision),
    ask: ((bid + spread) / scale).toFixed(asset.precision),
    ts: Date.now(),
    seq: sequence++,
  };
  if (Math.random() < WRONG_SEQ_FREAQENCY) {
    update.seq = Math.max(0, pairs[pairIndex].seq - 1);
  } else {
    pairs[pairIndex] = update;
  }

  const message = JSON.stringify(update);
  for (const socket of sockets.clients) {
    if (socket.readyState === WebSocket.OPEN) {
      socket.send(message);
    }
  }
  timeout = setTimeout(sendPair, Randex.number(50, 100, { decimals: 1 }));
}

function shutdown(exitCode = 0) {
  if (stopped) return;
  stopped = true;
  process.exitCode = exitCode;
  clearTimeout(timeout);
  for (const socket of sockets.clients) socket.terminate();
  sockets.close();
  server.close();
}

process.once("SIGINT", () => shutdown());
process.once("SIGTERM", () => shutdown());
server.listen(port, "127.0.0.1", () => {
  console.log(`Mock quotes server: ws://127.0.0.1:${port}/mock/quotes`);
  timeout = setTimeout(sendPair, Randex.number(10, 30, { decimals: 1 }));
});
