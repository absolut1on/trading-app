import { Router, Request, Response } from "express";
import { STOCK_LIST, STOCK_MAP } from "../data/stockList";
import { getAllCached } from "../services/stockCache";
import { fetchStockData } from "../services/alphaVantage";
import { StockListItem } from "../types/stock";

const router = Router();

router.get("/", (_req: Request, res: Response) => {
  const cached = getAllCached();

  const stocks: StockListItem[] = STOCK_LIST.map((s) => {
    const entry = cached.get(s.symbol);
    return {
      symbol: s.symbol,
      name: s.name,
      price: entry?.quote.price ?? null,
      changePercent: entry?.quote.changePercent ?? null,
      lastUpdated: entry?.quote.lastUpdated ?? null,
    };
  });

  res.json({ stocks });
});

router.get("/:symbol", async (req: Request, res: Response) => {
  const symbol = req.params.symbol.toUpperCase();

  if (!STOCK_MAP.has(symbol)) {
    res.status(404).json({ error: `Symbol ${symbol} not found` });
    return;
  }

  try {
    const data = await fetchStockData(symbol);
    res.json(data);
  } catch (err: any) {
    const statusCode = err.statusCode || 500;
    const response: any = { error: err.message };
    if (err.retryAfter) response.retryAfter = err.retryAfter;
    res.status(statusCode).json(response);
  }
});

export default router;
