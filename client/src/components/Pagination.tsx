import "../styles/dashboard.css";

interface Props {
  currentPage: number;
  totalPages: number;
  onNext: () => void;
  onPrev: () => void;
}

export default function Pagination({ currentPage, totalPages, onNext, onPrev }: Props) {
  return (
    <div className="pagination">
      <button
        className="pagination__btn"
        onClick={onPrev}
        disabled={currentPage <= 1}
      >
        Previous
      </button>
      <span className="pagination__info">
        Page {currentPage} of {totalPages}
      </span>
      <button
        className="pagination__btn"
        onClick={onNext}
        disabled={currentPage >= totalPages}
      >
        Next
      </button>
    </div>
  );
}
