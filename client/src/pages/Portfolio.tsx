import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Layout from "../components/Layout";
import LoadingSpinner from "../components/LoadingSpinner";
import { fetchProfile, fetchHoldings, deposit } from "../services/tradingApi";
import type { Profile, Holding } from "../types/trading";
import "../styles/trading.css";

export default function Portfolio() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [loading, setLoading] = useState(true);
  const [depositAmt, setDepositAmt] = useState("");
  const [depositing, setDepositing] = useState(false);

  const load = async () => {
    try {
      const [p, h] = await Promise.all([fetchProfile(), fetchHoldings()]);
      setProfile(p);
      setHoldings(h);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleDeposit = async () => {
    const amt = parseFloat(depositAmt);
    if (!amt || amt <= 0) return;
    setDepositing(true);
    try {
      const result = await deposit(amt);
      setProfile((p) => p ? { ...p, balance: result.balance } : p);
      setDepositAmt("");
    } catch {
    } finally {
      setDepositing(false);
    }
  };

  if (loading) return <Layout><LoadingSpinner /></Layout>;

  return (
    <Layout>
      <div className="portfolio">
        <div className="balance-card">
          <div>
            <div className="balance-card__label">Available Balance</div>
            <div className="balance-card__amount">${profile?.balance.toFixed(2)}</div>
          </div>
          <div className="deposit-form">
            <input type="number" min="0" step="0.01" placeholder="Amount" value={depositAmt} onChange={(e) => setDepositAmt(e.target.value)} />
            <button onClick={handleDeposit} disabled={depositing}>{depositing ? "..." : "Deposit"}</button>
          </div>
        </div>

        <div>
          <div className="section-title">Holdings</div>
          {holdings.length === 0 ? (
            <div className="card">
              <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
                No holdings yet. <Link to="/">Browse stocks</Link> to start trading.
              </p>
            </div>
          ) : (
            <div className="card">
              <table className="holdings-table">
                <thead>
                  <tr>
                    <th>Symbol</th>
                    <th>Quantity</th>
                    <th>Avg Price</th>
                    <th>Total Invested</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {holdings.map((h) => (
                    <tr key={h.id}>
                      <td><strong>{h.symbol}</strong></td>
                      <td>{h.quantity}</td>
                      <td>${h.avg_buy_price.toFixed(2)}</td>
                      <td>${(h.quantity * h.avg_buy_price).toFixed(2)}</td>
                      <td><Link to={`/stocks/${h.symbol}`}>Trade</Link></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
