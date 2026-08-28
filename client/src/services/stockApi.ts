import { apiFetch } from "./api";
import type {
  StockListResponse,
  StockDetailResponse,
  MarketStatusResponse,
} from "../types/stock";

export function fetchStocks(): Promise<StockListResponse> {
  return apiFetch<StockListResponse>("/api/stocks");
}

export function fetchStockDetail(symbol: string): Promise<StockDetailResponse> {
  return apiFetch<StockDetailResponse>(`/api/stocks/${symbol}`);
}

export function fetchMarketStatus(): Promise<MarketStatusResponse> {
  return apiFetch<MarketStatusResponse>("/api/market/status");
}
