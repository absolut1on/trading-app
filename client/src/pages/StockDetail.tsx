import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Layout from "../components/Layout";
import PriceChart from "../components/PriceChart";
import TradePanel from "../components/TradePanel";
import TriggerPanel from "../components/TriggerPanel";
import LoadingSpinner from "../components/LoadingSpinner";
import { useStockDetail } from "../hooks/useStockDetail";
import { fetchProfile, fetchHoldings } from "../services/tradingApi";
import type { Profile, Holding } from "../types/trading";
import "../styles/stock-detail.css";
import "../styles/components.css";

function formatVolume(vol: number): string {
  if (vol >= 1_000_000) return `${(vol / 1_000_000).toFixed(2)}M`;
  if (vol >= 1_000) return `${(vol / 1_000).toFixed(1)}K`;
  return vol.toString();
}

export default function StockDetail() {
  const { symbol } = useParams<{ symbol: string }>();
  const { quote, timeSeries, loading, error } = useStockDetail(symbol || "");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [holdings, setHoldings] = useState<Holding[]>([]);

  const loadUserData = () => {
    fetchProfile().then(setProfile).catch(() => {});
    fetchHoldings().then(setHoldings).catch(() => {});
  };

  useEffect(() => { loadUserData(); }, []);

  if (!symbol) return null;

  const ownedQty = holdings.find((h) => h.symbol === symbol.toUpperCase())?.quantity ?? 0;

  return (
    <Layout>
      <div className="detail">
        <Link to="/" className="detail__back">
          &larr; Back to dashboard
        </Link>

        {loading ? (
          <LoadingSpinner />
        ) : error ? (
          <div className="detail__error">
            <div className="detail__error-code">
              {error.message.includes("Rate limited") ? "429" : "404"}
            </div>
            <p>{error.message}</p>
            {error.message.includes("Rate limited") && (
              <p style={{ marginTop: "0.5rem", color: "var(--text-muted)" }}>
                Alpha Vantage rate limit reached. Wait a moment and try again.
              </p>
            )}
          </div>
        ) : quote ? (
          <>
            <div className="detail__header">
              <span className="detail__symbol">{quote.symbol}</span>
              <span className="detail__name">{quote.name}</span>
            </div>

            <div className="detail__price-row">
              <span className="detail__price">${quote.price.toFixed(2)}</span>
              <span
                className={`detail__change ${
                  quote.changePercent >= 0
                    ? "detail__change--positive"
                    : "detail__change--negative"
                }`}
              >
                {quote.changePercent >= 0 ? "+" : ""}
                {quote.changePercent.toFixed(2)}%
              </span>
            </div>

            <div className="detail__chart-container">
              <PriceChart
                data={timeSeries}
                positive={quote.changePercent >= 0}
              />
            </div>

            <div className="detail__stats">
              <div className="stat">
                <div className="stat__label">Open</div>
                <div className="stat__value">${quote.open.toFixed(2)}</div>
              </div>
              <div className="stat">
                <div className="stat__label">High</div>
                <div className="stat__value">${quote.high.toFixed(2)}</div>
              </div>
              <div className="stat">
                <div className="stat__label">Low</div>
                <div className="stat__value">${quote.low.toFixed(2)}</div>
              </div>
              <div className="stat">
                <div className="stat__label">Volume</div>
                <div className="stat__value">{formatVolume(quote.volume)}</div>
              </div>
            </div>

            {profile && (
              <TradePanel
                symbol={quote.symbol}
                price={quote.price}
                kycCompleted={profile.kyc_completed}
                balance={profile.balance}
                ownedQuantity={ownedQty}
                onTrade={loadUserData}
              />
            )}

            {profile?.kyc_completed && ownedQty > 0 && (
              <TriggerPanel
                symbol={quote.symbol}
                currentPrice={quote.price}
                ownedQuantity={ownedQty}
              />
            )}
          </>
        ) : null}
      </div>
    </Layout>
  );
}
