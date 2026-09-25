import { useEffect, useMemo, useState } from "react";

export function usePagination<T>(rows: T[] = [], pageSize = 8) {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  useEffect(() => {
    if (page > totalPages) {
      setPage(1);
    }
  }, [page, totalPages]);
  const pageRows = useMemo(
    () => rows.slice((page - 1) * pageSize, page * pageSize),
    [rows, page, pageSize]
  );
  return { page, setPage, pageSize, pageRows, total: rows.length, totalPages };
}
