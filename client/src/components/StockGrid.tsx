import type { StockListItem } from "../types/stock";
import StockCard from "./StockCard";
import "../styles/dashboard.css";

interface Props {
  stocks: StockListItem[];
}

export default function StockGrid({ stocks }: Props) {
  return (
    <div className="stock-grid">
      {stocks.map((stock) => (
        <StockCard key={stock.symbol} stock={stock} />
      ))}
    </div>
  );
}
