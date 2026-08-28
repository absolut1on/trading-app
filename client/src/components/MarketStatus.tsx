import { useMarketStatus } from "../hooks/useMarketStatus";

export default function MarketStatus() {
  const { isOpen, nextEvent, loading } = useMarketStatus();

  if (loading) return null;

  return (
    <div className="market-status">
      <span
        className={`market-status__dot ${
          isOpen ? "market-status__dot--open" : "market-status__dot--closed"
        }`}
      />
      <span
        className={`market-status__label ${
          isOpen ? "market-status__label--open" : "market-status__label--closed"
        }`}
      >
        {isOpen ? "Market Open" : "Market Closed"}
      </span>
      {nextEvent && <span className="market-status__next">{nextEvent}</span>}
    </div>
  );
}
