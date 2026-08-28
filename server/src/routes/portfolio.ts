import { Router, Response } from "express";
import { supabase } from "../config/supabase";
import { requireAuth, AuthRequest } from "../middleware/auth";

const router = Router();
router.use(requireAuth);

router.get("/holdings", async (req: AuthRequest, res: Response) => {
  const { data, error } = await supabase
    .from("holdings")
    .select("*")
    .eq("user_id", req.userId!)
    .order("created_at", { ascending: false });

  if (error) { res.status(500).json({ error: error.message }); return; }
  res.json({ holdings: data });
});

router.get("/transactions", async (req: AuthRequest, res: Response) => {
  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .eq("user_id", req.userId!)
    .order("created_at", { ascending: false });

  if (error) { res.status(500).json({ error: error.message }); return; }
  res.json({ transactions: data });
});

router.get("/profile", async (req: AuthRequest, res: Response) => {
  const { data, error } = await supabase
    .from("profiles")
    .select("balance, kyc_completed, email, username")
    .eq("id", req.userId!)
    .maybeSingle();

  if (error) { res.status(500).json({ error: error.message }); return; }

  if (!data) {
    const { error: insertErr } = await supabase
      .from("profiles")
      .insert({ id: req.userId!, email: req.userEmail!, balance: 0 });
    if (insertErr) { res.status(500).json({ error: insertErr.message }); return; }
    res.json({ balance: 0, kyc_completed: false, email: req.userEmail!, username: null });
    return;
  }

  res.json(data);
});

router.post("/deposit", async (req: AuthRequest, res: Response) => {
  const { amount } = req.body;
  if (!amount || amount <= 0) { res.status(400).json({ error: "Positive amount required" }); return; }

  const { data: profile } = await supabase.from("profiles").select("balance").eq("id", req.userId!).single();
  if (!profile) { res.status(404).json({ error: "Profile not found" }); return; }

  const { error } = await supabase.from("profiles").update({ balance: profile.balance + amount }).eq("id", req.userId!);
  if (error) { res.status(500).json({ error: error.message }); return; }

  res.json({ balance: profile.balance + amount });
});

router.post("/kyc", async (req: AuthRequest, res: Response) => {
  const { fullName, phone, address } = req.body;
  if (!fullName || !phone || !address) { res.status(400).json({ error: "All fields required" }); return; }

  const { error: kycErr } = await supabase.from("kyc").upsert({ user_id: req.userId!, full_name: fullName, phone, address });
  if (kycErr) { res.status(500).json({ error: kycErr.message }); return; }

  const { error: profErr } = await supabase.from("profiles").update({ kyc_completed: true }).eq("id", req.userId!);
  if (profErr) { res.status(500).json({ error: profErr.message }); return; }

  res.json({ message: "KYC completed" });
});

export default router;
