import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import LoadingSpinner from "../components/LoadingSpinner";
import { fetchTransactions } from "../services/tradingApi";
import type { Transaction } from "../types/trading";
import "../styles/trading.css";

export default function Transactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTransactions().then(setTransactions).finally(() => setLoading(false));
  }, []);

  if (loading) return <Layout><LoadingSpinner /></Layout>;

  return (
    <Layout>
      <div className="section-title">Transaction History</div>
      {transactions.length === 0 ? (
        <div className="card">
          <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>No transactions yet.</p>
        </div>
      ) : (
        <div className="card">
          <table className="holdings-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Symbol</th>
                <th>Qty</th>
                <th>Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={tx.id}>
                  <td>{new Date(tx.created_at).toLocaleDateString()}</td>
                  <td><span className={`tx-badge tx-badge--${tx.type}`}>{tx.type}</span></td>
                  <td><strong>{tx.symbol}</strong></td>
                  <td>{tx.quantity}</td>
                  <td>${tx.price.toFixed(2)}</td>
                  <td>${tx.total.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Layout>
  );
}
