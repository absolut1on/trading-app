import { Router, Response } from "express";
import { supabase } from "../config/supabase";
import { requireAuth, AuthRequest } from "../middleware/auth";
import { fetchStockData } from "../services/alphaVantage";

const router = Router();
router.use(requireAuth);

router.post("/buy", async (req: AuthRequest, res: Response) => {
  const { symbol, quantity } = req.body;
  const userId = req.userId!;

  if (!symbol || !quantity || quantity <= 0) {
    res.status(400).json({ error: "Symbol and positive quantity required" });
    return;
  }

  try {
    const { quote } = await fetchStockData(symbol);
    const total = quote.price * quantity;

    const { data: profile } = await supabase
      .from("profiles")
      .select("balance, kyc_completed")
      .eq("id", userId)
      .single();

    if (!profile) { res.status(404).json({ error: "Profile not found" }); return; }
    if (!profile.kyc_completed) { res.status(403).json({ error: "KYC required before trading" }); return; }
    if (profile.balance < total) { res.status(400).json({ error: `Insufficient balance. Need $${total.toFixed(2)}, have $${profile.balance}` }); return; }

    const { error: balErr } = await supabase
      .from("profiles")
      .update({ balance: profile.balance - total })
      .eq("id", userId);
    if (balErr) throw balErr;

    const { data: existing } = await supabase
      .from("holdings")
      .select("*")
      .eq("user_id", userId)
      .eq("symbol", symbol.toUpperCase())
      .single();

    if (existing) {
      const newQty = existing.quantity + quantity;
      const newAvg = ((existing.avg_buy_price * existing.quantity) + (quote.price * quantity)) / newQty;
      await supabase.from("holdings").update({ quantity: newQty, avg_buy_price: Math.round(newAvg * 100) / 100, updated_at: new Date().toISOString() }).eq("id", existing.id);
    } else {
      await supabase.from("holdings").insert({ user_id: userId, symbol: symbol.toUpperCase(), quantity, avg_buy_price: quote.price });
    }

    await supabase.from("transactions").insert({ user_id: userId, symbol: symbol.toUpperCase(), type: "buy", quantity, price: quote.price, total });

    res.json({ message: "Stock bought", price: quote.price, total });
  } catch (err: any) {
    res.status(err.statusCode || 500).json({ error: err.message });
  }
});

router.post("/sell", async (req: AuthRequest, res: Response) => {
  const { symbol, quantity } = req.body;
  const userId = req.userId!;

  if (!symbol || !quantity || quantity <= 0) {
    res.status(400).json({ error: "Symbol and positive quantity required" });
    return;
  }

  try {
    const { quote } = await fetchStockData(symbol);
    const total = quote.price * quantity;

    const { data: profile } = await supabase.from("profiles").select("balance, kyc_completed").eq("id", userId).single();
    if (!profile) { res.status(404).json({ error: "Profile not found" }); return; }
    if (!profile.kyc_completed) { res.status(403).json({ error: "KYC required before trading" }); return; }

    const { data: holding } = await supabase.from("holdings").select("*").eq("user_id", userId).eq("symbol", symbol.toUpperCase()).single();
    if (!holding || holding.quantity < quantity) {
      res.status(400).json({ error: `Insufficient shares. Own ${holding?.quantity ?? 0}, trying to sell ${quantity}` });
      return;
    }

    await supabase.from("profiles").update({ balance: profile.balance + total }).eq("id", userId);

    if (holding.quantity === quantity) {
      await supabase.from("holdings").delete().eq("id", holding.id);
    } else {
      await supabase.from("holdings").update({ quantity: holding.quantity - quantity, updated_at: new Date().toISOString() }).eq("id", holding.id);
    }

    await supabase.from("transactions").insert({ user_id: userId, symbol: symbol.toUpperCase(), type: "sell", quantity, price: quote.price, total });

    res.json({ message: "Stock sold", price: quote.price, total });
  } catch (err: any) {
    res.status(err.statusCode || 500).json({ error: err.message });
  }
});

export default router;
