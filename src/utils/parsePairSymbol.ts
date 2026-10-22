export function parsePairSymbol(symbol: string): {
  baseSymbol: string;
  exchangeSymbol: string;
} {
  if (!/^[A-Z]{6}$/.test(symbol)) {
    throw new Error(`Invalid pair symbol "${symbol}": expected six uppercase letters.`);
  }

  return {
    baseSymbol: symbol.slice(0, 3),
    exchangeSymbol: symbol.slice(3),
  };
}
