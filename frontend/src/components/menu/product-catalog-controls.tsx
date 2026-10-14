"use client";

import { useId } from "react";
import type { ProductSort } from "@/lib/product-filters";
import styles from "./menu.module.css";
import catalogStyles from "./product-catalog.module.css";

type ProductCatalogControlsProps = {
  query: string;
  sort: ProductSort;
  onQueryChange: (query: string) => void;
  onSortChange: (sort: ProductSort) => void;
  onReset: () => void;
};

export function ProductCatalogControls({ query, sort, onQueryChange, onSortChange, onReset }: ProductCatalogControlsProps) {
  const id = useId();
  const hasFilters = query.length > 0 || sort !== "default";

  return (
    <div className={`${catalogStyles.controls} mb-6 flex flex-col gap-4 sm:flex-row sm:items-end`}>
      <div role="search" aria-label="Tìm đồ uống" className="min-w-0 flex-1">
        <label htmlFor={`${id}-search`} className="mb-2 block text-sm font-semibold">Tìm đồ uống</label>
        <input id={`${id}-search`} type="search" value={query} onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Tên đồ uống, ví dụ: ca phe" className={catalogStyles.control} />
      </div>
      <div className="min-w-0 sm:w-52">
        <label htmlFor={`${id}-sort`} className="mb-2 block text-sm font-semibold">Sắp xếp</label>
        <select id={`${id}-sort`} value={sort} onChange={(event) => onSortChange(event.target.value as ProductSort)} className={catalogStyles.control}>
          <option value="default">Thứ tự mặc định</option>
          <option value="price-asc">Giá tăng dần</option>
          <option value="price-desc">Giá giảm dần</option>
        </select>
      </div>
      <button type="button" onClick={onReset} disabled={!hasFilters} className={`${styles.action} ${catalogStyles.reset}`}>Xóa bộ lọc</button>
    </div>
  );
}
