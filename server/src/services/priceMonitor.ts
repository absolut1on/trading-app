import { supabase } from "../config/supabase";
import { getAllCached } from "./stockCache";
import { eventBus, Events } from "../events/eventBus";

const CHECK_INTERVAL = 30_000;

export function startPriceMonitor() {
  setInterval(checkTriggers, CHECK_INTERVAL);
  console.log(`Price monitor started (checking every ${CHECK_INTERVAL / 1000}s)`);
}

async function checkTriggers() {
  const cached = getAllCached();
  if (cached.size === 0) return;

  const { data: triggers, error } = await supabase
    .from("price_triggers")
    .select("*")
    .eq("active", true);

  if (error || !triggers?.length) return;

  for (const trigger of triggers) {
    const cachedPrice = cached.get(trigger.symbol);
    if (!cachedPrice) continue;

    if (cachedPrice.price >= trigger.target_price) {
      await executeTrigger(trigger, cachedPrice.price);
    }
  }
}

async function executeTrigger(
  trigger: { id: string; user_id: string; symbol: string; target_price: number; quantity: number },
  currentPrice: number
) {
  const total = currentPrice * trigger.quantity;

  const { data: holding } = await supabase
    .from("holdings")
    .select("*")
    .eq("user_id", trigger.user_id)
    .eq("symbol", trigger.symbol)
    .single();

  if (!holding || holding.quantity < trigger.quantity) {
    await supabase.from("price_triggers").update({ active: false }).eq("id", trigger.id);
    return;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("balance")
    .eq("id", trigger.user_id)
    .single();

  if (!profile) return;

  await supabase.from("profiles").update({ balance: profile.balance + total }).eq("id", trigger.user_id);

  if (holding.quantity === trigger.quantity) {
    await supabase.from("holdings").delete().eq("id", holding.id);
  } else {
    await supabase.from("holdings").update({
      quantity: holding.quantity - trigger.quantity,
      updated_at: new Date().toISOString(),
    }).eq("id", holding.id);
  }

  await supabase.from("transactions").insert({
    user_id: trigger.user_id,
    symbol: trigger.symbol,
    type: "sell",
    quantity: trigger.quantity,
    price: currentPrice,
    total,
  });

  await supabase.from("price_triggers").update({ active: false }).eq("id", trigger.id);

  const notification = {
    user_id: trigger.user_id,
    type: "trigger_executed",
    title: `Auto-sell: ${trigger.symbol}`,
    message: `Sold ${trigger.quantity} shares of ${trigger.symbol} at $${currentPrice.toFixed(2)} (target: $${trigger.target_price}). Total: $${total.toFixed(2)}`,
  };

  await supabase.from("notifications").insert(notification);

  eventBus.emit(Events.TRIGGER_EXECUTED, {
    userId: trigger.user_id,
    ...notification,
  });

  console.log(`Trigger executed: ${trigger.symbol} sold ${trigger.quantity} @ $${currentPrice.toFixed(2)}`);
}
