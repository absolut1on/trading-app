import { Router, Response } from "express";
import { supabase } from "../config/supabase";
import { requireAuth, AuthRequest } from "../middleware/auth";

const router = Router();
router.use(requireAuth);

router.get("/", async (req: AuthRequest, res: Response) => {
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", req.userId!)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) { res.status(500).json({ error: error.message }); return; }
  res.json({ notifications: data });
});

router.patch("/read-all", async (req: AuthRequest, res: Response) => {
  const { error } = await supabase
    .from("notifications")
    .update({ read: true })
    .eq("user_id", req.userId!)
    .eq("read", false);

  if (error) { res.status(500).json({ error: error.message }); return; }
  res.json({ message: "All marked as read" });
});

export default router;
