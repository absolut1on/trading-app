import { useState } from "react";
import { Link } from "react-router-dom";
import { buyStock, sellStock } from "../services/tradingApi";
import "../styles/trading.css";

interface Props {
  symbol: string;
  price: number;
  kycCompleted: boolean;
  balance: number;
  ownedQuantity: number;
  onTrade: () => void;
}

export default function TradePanel({ symbol, price, kycCompleted, balance, ownedQuantity, onTrade }: Props) {
  const [tab, setTab] = useState<"buy" | "sell">("buy");
  const [quantity, setQuantity] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  if (!kycCompleted) {
    return (
      <div className="kyc-gate">
        <p>Complete KYC verification to start trading.</p>
        <Link to="/kyc" className="kyc-gate__link">Complete KYC</Link>
      </div>
    );
  }

  const qty = parseInt(quantity) || 0;
  const total = qty * price;

  const handleSubmit = async () => {
    if (qty <= 0) return;
    setLoading(true);
    setMsg(null);
    try {
      const result = tab === "buy" ? await buyStock(symbol, qty) : await sellStock(symbol, qty);
      setMsg({ type: "success", text: `${result.message} — $${result.total.toFixed(2)} at $${result.price.toFixed(2)}/share` });
      setQuantity("");
      onTrade();
    } catch (err: any) {
      setMsg({ type: "error", text: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="trade-panel">
      <div className="trade-panel__title">Trade {symbol}</div>
      <div className="trade-tabs">
        <button className={`trade-tabs__btn ${tab === "buy" ? "trade-tabs__btn--active-buy" : ""}`} onClick={() => { setTab("buy"); setMsg(null); }}>Buy</button>
        <button className={`trade-tabs__btn ${tab === "sell" ? "trade-tabs__btn--active-sell" : ""}`} onClick={() => { setTab("sell"); setMsg(null); }}>Sell</button>
      </div>

      <div className="trade-form__group">
        <label className="trade-form__label">Quantity</label>
        <input className="trade-form__input" type="number" min="1" value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="0" />
      </div>

      <div className="trade-form__summary">
        <span>Price per share</span>
        <strong>${price.toFixed(2)}</strong>
      </div>
      <div className="trade-form__summary" style={{ borderTop: "none", paddingTop: 0 }}>
        <span>Estimated total</span>
        <strong>${total.toFixed(2)}</strong>
      </div>

      {tab === "buy" && (
        <div className="trade-form__summary" style={{ borderTop: "none", paddingTop: 0 }}>
          <span>Available balance</span>
          <strong>${balance.toFixed(2)}</strong>
        </div>
      )}
      {tab === "sell" && (
        <div className="trade-form__summary" style={{ borderTop: "none", paddingTop: 0 }}>
          <span>Shares owned</span>
          <strong>{ownedQuantity}</strong>
        </div>
      )}

      <button
        className={`trade-form__btn ${tab === "buy" ? "trade-form__btn--buy" : "trade-form__btn--sell"}`}
        disabled={qty <= 0 || loading}
        onClick={handleSubmit}
      >
        {loading ? "Processing..." : tab === "buy" ? `Buy ${qty > 0 ? qty : ""} ${symbol}` : `Sell ${qty > 0 ? qty : ""} ${symbol}`}
      </button>

      {msg && (
        <div className={`trade-form__msg trade-form__msg--${msg.type}`}>{msg.text}</div>
      )}
    </div>
  );
}
