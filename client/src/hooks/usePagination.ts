import { useState, useMemo } from "react";

export function usePagination(totalItems: number, pageSize = 7) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  const { startIndex, endIndex } = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    const end = Math.min(start + pageSize, totalItems);
    return { startIndex: start, endIndex: end };
  }, [currentPage, pageSize, totalItems]);

  const goNext = () => setCurrentPage((p) => Math.min(p + 1, totalPages));
  const goPrev = () => setCurrentPage((p) => Math.max(p - 1, 1));

  return { currentPage, totalPages, startIndex, endIndex, goNext, goPrev };
}
