import { useEffect, useState } from "react";
import { fetchMarketStatus } from "../services/stockApi";
import type { MarketStatusResponse } from "../types/stock";

export function useMarketStatus() {
  const [data, setData] = useState<MarketStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const load = () => {
      fetchMarketStatus()
        .then((res) => {
          if (active) setData(res);
        })
        .catch(() => {})
        .finally(() => {
          if (active) setLoading(false);
        });
    };

    load();
    const interval = setInterval(load, 60_000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  return { ...data, loading };
}
