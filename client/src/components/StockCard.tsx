import { Link } from "react-router-dom";
import type { StockListItem } from "../types/stock";
import "../styles/dashboard.css";

export default function StockCard({ stock }: { stock: StockListItem }) {
  const hasPrice = stock.price !== null;
  const isPositive = (stock.changePercent ?? 0) >= 0;

  return (
    <Link to={`/stocks/${stock.symbol}`} className="stock-card">
      <div className="stock-card__info">
        <span className="stock-card__symbol">{stock.symbol}</span>
        <span className="stock-card__name">{stock.name}</span>
      </div>
      <div className="stock-card__price-section">
        <span
          className={`stock-card__price ${
            !hasPrice ? "stock-card__price--empty" : ""
          }`}
        >
          {hasPrice ? `$${stock.price!.toFixed(2)}` : "--"}
        </span>
        {hasPrice && stock.changePercent !== null && (
          <span
            className={`stock-card__change ${
              isPositive
                ? "stock-card__change--positive"
                : "stock-card__change--negative"
            }`}
          >
            {isPositive ? "+" : ""}
            {stock.changePercent.toFixed(2)}%
          </span>
        )}
      </div>
    </Link>
  );
}
