import { useEffect, useState } from "react";
import { fetchStocks } from "../services/stockApi";
import type { StockListItem } from "../types/stock";

export function useStocks() {
  const [stocks, setStocks] = useState<StockListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    fetchStocks()
      .then((res) => {
        if (active) setStocks(res.stocks);
      })
      .catch((err) => {
        if (active) setError(err.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  return { stocks, loading, error };
}
