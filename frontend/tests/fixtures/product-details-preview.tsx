"use client";

// Test-only details receiver. Never mount in /products or treat as Đông's module.
import { useState } from "react";
import { ProductCatalog } from "@/components/menu/product-catalog";
import type { ProductDetailsAdapter } from "@/types/product-details-adapter";
import styles from "@/components/menu/menu.module.css";

export default function ProductDetailsPreview() {
  const [ready, setReady] = useState(true);
  const [selections, setSelections] = useState<string[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const adapter: ProductDetailsAdapter = ready ? {
    status: "ready",
    openProductDetails(productId) {
      setSelectedId(productId);
      setSelections((previous) => [...previous, productId]);
    },
  } : { status: "unavailable" };

  return (
    <main lang="vi" className={`${styles.shell} min-h-screen py-8`}>
      <div className={styles.container}>
        <h1 className="text-2xl font-bold">KIỂM THỬ TRI-07 — bộ nhận ID giả lập</h1>
        <p className="my-4">Danh sách từ HTTP fixture. Không có size/topping hoặc thêm vào giỏ.</p>
        <label className="mb-4 block">
          <input type="checkbox" checked={ready} onChange={(event) => { setReady(event.target.checked); setSelectedId(null); }} /> Module sẵn sàng
        </label>
        <output aria-label="Số lượt mở" className="mb-4 block" aria-live="polite">{selections.length}</output>
        {selectedId && (
          <section aria-label="Bộ nhận chi tiết giả lập" className="mb-6 rounded-xl border p-4">
            <h2 className="font-semibold">ID nhận được</h2>
            <output aria-label="ProductId nhận được" className="block break-all">{selectedId}</output>
            <button type="button" className={`${styles.action} mt-4`} onClick={() => setSelectedId(null)}>Đóng bộ nhận</button>
          </section>
        )}
        <ProductCatalog detailsAdapter={adapter} />
      </div>
    </main>
  );
}
