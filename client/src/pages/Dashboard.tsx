import Layout from "../components/Layout";
import StockGrid from "../components/StockGrid";
import Pagination from "../components/Pagination";
import LoadingSpinner from "../components/LoadingSpinner";
import { useStocks } from "../hooks/useStocks";
import { usePagination } from "../hooks/usePagination";
import "../styles/dashboard.css";
import "../styles/components.css";

export default function Dashboard() {
  const { stocks, loading, error } = useStocks();
  const { currentPage, totalPages, startIndex, endIndex, goNext, goPrev } =
    usePagination(stocks.length, 9);

  const pageStocks = stocks.slice(startIndex, endIndex);

  return (
    <Layout>
      <div className="dashboard__header">
        <h1 className="dashboard__title">Active Stocks</h1>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : error ? (
        <p style={{ color: "var(--negative)" }}>{error}</p>
      ) : (
        <>
          <StockGrid stocks={pageStocks} />
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onNext={goNext}
            onPrev={goPrev}
          />
        </>
      )}
    </Layout>
  );
}
