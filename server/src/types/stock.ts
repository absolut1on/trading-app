export interface StockListItem {
  symbol: string;
  name: string;
  price: number | null;
  changePercent: number | null;
  lastUpdated: string | null;
}

export interface StockQuote {
  symbol: string;
  name: string;
  price: number;
  open: number;
  high: number;
  low: number;
  volume: number;
  changePercent: number;
  lastUpdated: string;
}

export interface TimeSeriesPoint {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface MarketStatusResponse {
  isOpen: boolean;
  currentTimeET: string;
  nextEvent: string;
}

export interface CacheEntry {
  quote: StockQuote;
  timeSeries: TimeSeriesPoint[];
  expiresAt: number;
}
