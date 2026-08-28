import { Router, Response } from "express";
import { supabase } from "../config/supabase";
import { requireAuth, AuthRequest } from "../middleware/auth";

const router = Router();
router.use(requireAuth);

router.get("/", async (req: AuthRequest, res: Response) => {
  const { data, error } = await supabase
    .from("price_triggers")
    .select("*")
    .eq("user_id", req.userId!)
    .eq("active", true)
    .order("created_at", { ascending: false });

  if (error) { res.status(500).json({ error: error.message }); return; }
  res.json({ triggers: data });
});

router.post("/", async (req: AuthRequest, res: Response) => {
  const { symbol, targetPrice, quantity } = req.body;
  if (!symbol || !targetPrice || !quantity || quantity <= 0 || targetPrice <= 0) {
    res.status(400).json({ error: "Symbol, positive targetPrice, and positive quantity required" });
    return;
  }

  const { data: holding } = await supabase
    .from("holdings")
    .select("quantity")
    .eq("user_id", req.userId!)
    .eq("symbol", symbol.toUpperCase())
    .single();

  if (!holding || holding.quantity < quantity) {
    res.status(400).json({ error: `Insufficient shares. Own ${holding?.quantity ?? 0}` });
    return;
  }

  const { data, error } = await supabase
    .from("price_triggers")
    .insert({ user_id: req.userId!, symbol: symbol.toUpperCase(), target_price: targetPrice, quantity })
    .select()
    .single();

  if (error) { res.status(500).json({ error: error.message }); return; }
  res.json({ trigger: data });
});

router.delete("/:id", async (req: AuthRequest, res: Response) => {
  const { error } = await supabase
    .from("price_triggers")
    .update({ active: false })
    .eq("id", req.params.id)
    .eq("user_id", req.userId!);

  if (error) { res.status(500).json({ error: error.message }); return; }
  res.json({ message: "Trigger cancelled" });
});

export default router;
