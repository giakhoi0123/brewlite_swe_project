"use client";

import { useEffect, useState } from "react";
import { fetchProducts } from "@/lib/products";
import { filterProducts, type ProductSort } from "@/lib/product-filters";
import type { Product } from "@/types/product";
import { pendingProductDetailsAdapter, type ProductDetailsAdapter } from "@/types/product-details-adapter";
import { ProductGrid } from "./product-grid";
import { ProductGridSkeleton } from "./product-grid-skeleton";
import { ProductCatalogControls } from "./product-catalog-controls";
import styles from "./menu.module.css";

type CatalogState =
  | { status: "loading" }
  | { status: "success"; products: Product[] }
  | { status: "empty" }
  | { status: "error" };

export type ProductCatalogProps = {
  detailsAdapter?: ProductDetailsAdapter;
};

export function ProductCatalog({ detailsAdapter = pendingProductDetailsAdapter }: ProductCatalogProps) {
  const [state, setState] = useState<CatalogState>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<ProductSort>("default");
  const visibleProducts = state.status === "success" ? filterProducts(state.products, query, sort) : [];

  function resetFilters() {
    setQuery("");
    setSort("default");
  }

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    fetchProducts(controller.signal)
      .then((products) => {
        if (!active || controller.signal.aborted) return;
        setState(products.length ? { status: "success", products } : { status: "empty" });
      })
      .catch(() => {
        if (active && !controller.signal.aborted) setState({ status: "error" });
      });
    return () => {
      active = false;
      controller.abort();
    };
  }, [attempt]);

  function retry() {
    setState({ status: "loading" });
    setAttempt((previous) => previous + 1);
  }

  return (
    <div aria-busy={state.status === "loading"}>
      {state.status === "loading" && <ProductGridSkeleton />}
      {state.status === "success" && (
        <>
          <ProductCatalogControls query={query} sort={sort} onQueryChange={setQuery} onSortChange={setSort} onReset={resetFilters} />
          <p role="status" className="mb-4 text-sm leading-[22px] text-[var(--menu-muted)]">{visibleProducts.length} / {state.products.length} món</p>
          {visibleProducts.length ? (
            <ProductGrid
              products={visibleProducts}
              onSelectProduct={detailsAdapter.status === "ready" ? (productId) => detailsAdapter.openProductDetails(productId) : undefined}
            />
          ) : (
            <div className="rounded-[var(--menu-radius-panel)] bg-[var(--menu-card)] px-6 py-12 text-center">
              <h3 className={`${styles.headline} text-lg font-semibold`}>Không tìm thấy đồ uống phù hợp</h3>
              <p className="mt-3 text-sm text-[var(--menu-muted)]">Thử tên khác hoặc xóa bộ lọc để xem lại thực đơn.</p>
              <button type="button" className={`${styles.action} mt-4`} onClick={resetFilters}>Xem lại tất cả món</button>
            </div>
          )}
        </>
      )}
      {state.status === "empty" && (
        <div role="status" className="flex min-h-60 flex-col items-center justify-center gap-3 rounded-[var(--menu-radius-panel)] border border-[var(--menu-outline-variant)]/40 bg-[var(--menu-card)] px-6 py-12 text-center">
          <h3 className={`${styles.headline} text-lg font-semibold leading-[26px]`}>Thực đơn chưa có đồ uống</h3>
          <p className="max-w-md text-sm leading-[22px] text-[var(--menu-muted)]">Bạn hãy quay lại sau để khám phá những món mới của BrewLite nhé.</p>
        </div>
      )}
      {state.status === "error" && (
        <div role="alert" className="flex min-h-60 flex-col items-center justify-center gap-4 rounded-[var(--menu-radius-panel)] bg-[var(--menu-error-container)] px-6 py-12 text-center text-[var(--menu-on-error-container)]">
          <h3 className={`${styles.headline} text-lg font-semibold leading-[26px]`}>Chưa tải được thực đơn</h3>
          <p className="text-sm leading-[22px]">Vui lòng kiểm tra kết nối và thử lại.</p>
          <button type="button" onClick={retry} className={styles.action}>Thử lại</button>
        </div>
      )}
    </div>
  );
}
