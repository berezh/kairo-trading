import type { AssetPairRecord, AssetRecord } from "@/interfaces/data";
import { parsePairSymbol } from "@/utils/parsePairSymbol";


const MAX_PAIRS = 20;

const sampleTimestamp = new Date().getTime();

const seedPairs: AssetPairRecord[] = [
    { symbol: "EURUSD", bid: "1.08412", ask: "1.08415", ts: sampleTimestamp, seq: 1 },
    { symbol: "USDJPY", bid: "149.382", ask: "149.386", ts: sampleTimestamp, seq: 2 },
    { symbol: "GBPUSD", bid: "1.29740", ask: "1.29745", ts: sampleTimestamp, seq: 3 },
    { symbol: "USDCHF", bid: "0.86521", ask: "0.86525", ts: sampleTimestamp, seq: 4 },
    { symbol: "AUDUSD", bid: "0.66182", ask: "0.66186", ts: sampleTimestamp, seq: 5 },
    { symbol: "USDCAD", bid: "1.37642", ask: "1.37647", ts: sampleTimestamp, seq: 6 },
    { symbol: "NZDUSD", bid: "0.60124", ask: "0.60129", ts: sampleTimestamp, seq: 7 },
    { symbol: "EURGBP", bid: "0.83562", ask: "0.83567", ts: sampleTimestamp, seq: 8 },
    { symbol: "EURJPY", bid: "161.972", ask: "161.978", ts: sampleTimestamp, seq: 9 },
    { symbol: "GBPJPY", bid: "193.821", ask: "193.829", ts: sampleTimestamp, seq: 10 },
    { symbol: "AUDJPY", bid: "98.842", ask: "98.848", ts: sampleTimestamp, seq: 11 },
    { symbol: "EURCHF", bid: "0.93814", ask: "0.93820", ts: sampleTimestamp, seq: 12 },
    { symbol: "EURAUD", bid: "1.63820", ask: "1.63828", ts: sampleTimestamp, seq: 13 },
    { symbol: "EURCAD", bid: "1.49218", ask: "1.49226", ts: sampleTimestamp, seq: 14 },
    { symbol: "EURNZD", bid: "1.80264", ask: "1.80276", ts: sampleTimestamp, seq: 15 },
    { symbol: "GBPCHF", bid: "1.12248", ask: "1.12256", ts: sampleTimestamp, seq: 16 },
    { symbol: "GBPAUD", bid: "1.96018", ask: "1.96028", ts: sampleTimestamp, seq: 17 },
    { symbol: "GBPCAD", bid: "1.78602", ask: "1.78612", ts: sampleTimestamp, seq: 18 },
    { symbol: "GBPNZD", bid: "2.15730", ask: "2.15744", ts: sampleTimestamp, seq: 19 },
    { symbol: "AUDCAD", bid: "0.91108", ask: "0.91115", ts: sampleTimestamp, seq: 20 },
    { symbol: "AUDCHF", bid: "0.57248", ask: "0.57254", ts: sampleTimestamp, seq: 21 },
    { symbol: "AUDNZD", bid: "1.10072", ask: "1.10080", ts: sampleTimestamp, seq: 22 },
    { symbol: "CADJPY", bid: "108.544", ask: "108.551", ts: sampleTimestamp, seq: 23 },
    { symbol: "CHFJPY", bid: "172.654", ask: "172.663", ts: sampleTimestamp, seq: 24 },
    { symbol: "NZDJPY", bid: "89.842", ask: "89.850", ts: sampleTimestamp, seq: 25 },
    { symbol: "CADCHF", bid: "0.62840", ask: "0.62847", ts: sampleTimestamp, seq: 26 },
    { symbol: "NZDCAD", bid: "0.82762", ask: "0.82770", ts: sampleTimestamp, seq: 27 },
    { symbol: "NZDCHF", bid: "0.52018", ask: "0.52025", ts: sampleTimestamp, seq: 28 },
    { symbol: "USDSGD", bid: "1.30214", ask: "1.30222", ts: sampleTimestamp, seq: 29 },
    { symbol: "EURSGD", bid: "1.41246", ask: "1.41258", ts: sampleTimestamp, seq: 30 },
];

const currencies = [
    { symbol: "EUR", usdValue: 1.08412 },
    { symbol: "USD", usdValue: 1 },
    { symbol: "JPY", usdValue: 1 / 149.382 },
    { symbol: "GBP", usdValue: 1.29740 },
    { symbol: "CHF", usdValue: 1 / 0.86521 },
    { symbol: "AUD", usdValue: 0.66182 },
    { symbol: "CAD", usdValue: 1 / 1.37642 },
    { symbol: "NZD", usdValue: 0.60124 },
    { symbol: "SGD", usdValue: 1 / 1.30214 },
    { symbol: "NOK", usdValue: 1 / 10.85 },
    { symbol: "SEK", usdValue: 1 / 10.52 },
    { symbol: "DKK", usdValue: 1 / 6.88 },
    { symbol: "PLN", usdValue: 1 / 3.98 },
    { symbol: "CZK", usdValue: 1 / 23.20 },
    { symbol: "HUF", usdValue: 1 / 370.50 },
];
const pairs = [...seedPairs];
const pairSymbols = new Set(pairs.map(({ symbol }) => symbol));

for (const base of currencies) {
    for (const exchange of currencies) {
        const symbol = base.symbol + exchange.symbol;
        if (base.symbol === exchange.symbol || pairSymbols.has(symbol) || pairs.length >= MAX_PAIRS) {
            continue;
        }

        const precision = exchange.symbol === "JPY" ? 3 : 5;
        const scale = 10 ** precision;
        const bid = Math.max(1, Math.round(base.usdValue / exchange.usdValue * scale));
        const spread = Math.max(1, Math.round(bid * 0.0001));

        pairs.push({
            symbol,
            bid: (bid / scale).toFixed(precision),
            ask: ((bid + spread) / scale).toFixed(precision),
            ts: sampleTimestamp,
            seq: pairs.length + 1,
        });
        pairSymbols.add(symbol);
    }
}

export const INIT_PAIRS: AssetPairRecord[] = pairs.map((quote, index, quotes) => ({
    ...quote,
    ts: sampleTimestamp - (quotes.length - 1 - index) * 100,
}));

export const INIT_ASSETS: AssetRecord[] = Array.from(
    new Set(INIT_PAIRS.flatMap(({ symbol }) => {
        const { baseSymbol, exchangeSymbol } = parsePairSymbol(symbol);
        return [baseSymbol, exchangeSymbol];
    })),
    (symbol) => ({
        symbol,
        precision: symbol === "JPY" ? 3 : 5,
    }),
);