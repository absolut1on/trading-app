import { env } from "../config/env";
import { STOCK_MAP } from "../data/stockList";
import { StockQuote, TimeSeriesPoint } from "../types/stock";
import { getCached, setCache } from "./stockCache";

const callTimestamps: number[] = [];
const MAX_CALLS_PER_MINUTE = 5;

function checkRateLimit(): void {
  const now = Date.now();
  while (callTimestamps.length > 0 && now - callTimestamps[0] > 60_000) {
    callTimestamps.shift();
  }
  if (callTimestamps.length >= MAX_CALLS_PER_MINUTE) {
    const oldestCall = callTimestamps[0];
    const retryAfter = Math.ceil((oldestCall + 60_000 - now) / 1000);
    const err = new Error("Rate limited. Please try again shortly.") as Error & {
      statusCode: number;
      retryAfter: number;
    };
    err.statusCode = 429;
    err.retryAfter = retryAfter;
    throw err;
  }
}

function parseTimeSeries(
  raw: Record<string, Record<string, string>>
): TimeSeriesPoint[] {
  return Object.entries(raw)
    .map(([dateStr, values]) => ({
      time: Math.floor(new Date(dateStr).getTime() / 1000),
      open: parseFloat(values["1. open"]),
      high: parseFloat(values["2. high"]),
      low: parseFloat(values["3. low"]),
      close: parseFloat(values["4. close"]),
      volume: parseInt(values["5. volume"], 10),
    }))
    .sort((a, b) => a.time - b.time);
}

export async function fetchStockData(
  symbol: string
): Promise<{ quote: StockQuote; timeSeries: TimeSeriesPoint[] }> {
  const upperSymbol = symbol.toUpperCase();

  const cached = getCached(upperSymbol);
  if (cached) return { quote: cached.quote, timeSeries: cached.timeSeries };

  checkRateLimit();

  const url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${upperSymbol}&outputsize=compact&apikey=${env.alphaVantageApiKey}`;

  callTimestamps.push(Date.now());
  const res = await fetch(url);
  const data = await res.json();

  if (data["Note"]) {
    const err = new Error("Alpha Vantage rate limit reached. Try again in a minute.") as Error & {
      statusCode: number;
      retryAfter: number;
    };
    err.statusCode = 429;
    err.retryAfter = 60;
    throw err;
  }

  if (data["Error Message"]) {
    const err = new Error(`Invalid symbol: ${upperSymbol}`) as Error & {
      statusCode: number;
    };
    err.statusCode = 404;
    throw err;
  }

  if (data["Information"]) {
    const err = new Error("Alpha Vantage: premium endpoint required or rate limit reached.") as Error & {
      statusCode: number;
      retryAfter: number;
    };
    err.statusCode = 429;
    err.retryAfter = 60;
    throw err;
  }

  const timeSeriesKey = "Time Series (Daily)";
  const rawSeries = data[timeSeriesKey];

  if (!rawSeries || Object.keys(rawSeries).length === 0) {
    const err = new Error(`No data available for ${upperSymbol}`) as Error & {
      statusCode: number;
    };
    err.statusCode = 404;
    throw err;
  }

  const timeSeries = parseTimeSeries(rawSeries);
  const latest = timeSeries[timeSeries.length - 1];
  const earliest = timeSeries[0];

  const stockInfo = STOCK_MAP.get(upperSymbol);
  const changePercent =
    earliest.close !== 0
      ? ((latest.close - earliest.close) / earliest.close) * 100
      : 0;

  const quote: StockQuote = {
    symbol: upperSymbol,
    name: stockInfo?.name || upperSymbol,
    price: latest.close,
    open: latest.open,
    high: latest.high,
    low: latest.low,
    volume: latest.volume,
    changePercent: Math.round(changePercent * 100) / 100,
    lastUpdated: new Date().toISOString(),
  };

  setCache(upperSymbol, quote, timeSeries);

  return { quote, timeSeries };
}
