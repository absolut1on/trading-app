import { useEffect, useState } from "react";
import { fetchStockDetail } from "../services/stockApi";
import type { StockQuote, TimeSeriesPoint } from "../types/stock";

export function useStockDetail(symbol: string) {
  const [quote, setQuote] = useState<StockQuote | null>(null);
  const [timeSeries, setTimeSeries] = useState<TimeSeriesPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<{ message: string; status?: number } | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);

    fetchStockDetail(symbol)
      .then((res) => {
        if (active) {
          setQuote(res.quote);
          setTimeSeries(res.timeSeries);
        }
      })
      .catch((err) => {
        if (active) setError({ message: err.message });
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [symbol]);

  return { quote, timeSeries, loading, error };
}
