import { CacheEntry, StockQuote, TimeSeriesPoint } from "../types/stock";

const cache = new Map<string, CacheEntry>();
const TTL = 5 * 60 * 1000;

export function getCached(symbol: string): CacheEntry | null {
  const entry = cache.get(symbol.toUpperCase());
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    cache.delete(symbol.toUpperCase());
    return null;
  }
  return entry;
}

export function setCache(
  symbol: string,
  quote: StockQuote,
  timeSeries: TimeSeriesPoint[]
): void {
  cache.set(symbol.toUpperCase(), {
    quote,
    timeSeries,
    expiresAt: Date.now() + TTL,
  });
}

export function getAllCached(): Map<string, CacheEntry> {
  const now = Date.now();
  for (const [key, entry] of cache) {
    if (now > entry.expiresAt) cache.delete(key);
  }
  return cache;
}
