import { useEffect, useState } from "react";
import { fetchTriggers, createTrigger, cancelTrigger } from "../services/tradingApi";
import type { PriceTrigger } from "../types/trading";
import "../styles/notifications.css";

interface Props {
  symbol: string;
  currentPrice: number;
  ownedQuantity: number;
}

export default function TriggerPanel({ symbol, currentPrice, ownedQuantity }: Props) {
  const [triggers, setTriggers] = useState<PriceTrigger[]>([]);
  const [targetPrice, setTargetPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const load = () => {
    fetchTriggers().then((all) => setTriggers(all.filter((t) => t.symbol === symbol))).catch(() => {});
  };

  useEffect(() => { load(); }, [symbol]);

  const handleCreate = async () => {
    const tp = parseFloat(targetPrice);
    const qty = parseInt(quantity);
    if (!tp || !qty || tp <= 0 || qty <= 0) return;
    setLoading(true);
    setMsg(null);
    try {
      await createTrigger(symbol, tp, qty);
      setTargetPrice("");
      setQuantity("");
      setMsg({ type: "success", text: `Trigger set: sell ${qty} shares when price hits $${tp.toFixed(2)}` });
      load();
    } catch (err: any) {
      setMsg({ type: "error", text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id: string) => {
    await cancelTrigger(id).catch(() => {});
    load();
  };

  if (ownedQuantity <= 0) return null;

  return (
    <div className="trigger-section">
      <div className="trigger-section__title">Auto-Sell Triggers</div>
      <div className="trigger-form">
        <div className="trigger-form__group">
          <label className="trigger-form__label">Target Price ($)</label>
          <input className="trigger-form__input" type="number" min="0" step="0.01" value={targetPrice} onChange={(e) => setTargetPrice(e.target.value)} placeholder={currentPrice.toFixed(2)} />
        </div>
        <div className="trigger-form__group">
          <label className="trigger-form__label">Quantity</label>
          <input className="trigger-form__input" type="number" min="1" max={ownedQuantity} value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder={String(ownedQuantity)} />
        </div>
        <button className="trigger-form__btn" onClick={handleCreate} disabled={loading}>
          {loading ? "..." : "Set Trigger"}
        </button>
      </div>

      {msg && (
        <div className={`trade-form__msg trade-form__msg--${msg.type}`} style={{ marginTop: "0.75rem" }}>{msg.text}</div>
      )}

      {triggers.length > 0 && (
        <div className="trigger-list">
          {triggers.map((t) => (
            <div key={t.id} className="trigger-item">
              <span className="trigger-item__info">
                Sell {t.quantity} @ ${t.target_price.toFixed(2)}
              </span>
              <button className="trigger-item__cancel" onClick={() => handleCancel(t.id)}>Cancel</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
