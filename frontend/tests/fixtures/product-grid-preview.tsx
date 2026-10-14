"use client";

// UI fixture only. Mount temporarily at /tri05-preview; never import into /products.
import { useState } from "react";
import { ProductGrid } from "@/components/menu/product-grid";
import styles from "@/components/menu/menu.module.css";
import type { Product } from "@/types/product";

const names = [
  "Bạc xỉu", "Cà phê muối", "Trà đào cam sả", "Trà mãng cầu", "Trà sữa Oolong",
  "Matcha latte", "Cold brew cam", "Trà vải hoa hồng", "Cacao sữa đá", "Trà chanh giã tay",
];
const images = ["milk-coffee", "latte", "iced-tea", "matcha", "cacao"];
const sampleProducts: Product[] = names.map((name, index) => ({
  id: `31a650c7-8597-4a01-a8e2-${String(index + 1).padStart(12, "0")}`,
  name,
  price: 25000 + index * 1000,
  imageUrl: `/images/products/sample-${images[index % images.length]}.svg`,
}));

export default function ProductGridPreview() {
  const [count, setCount] = useState(10);
  const [edgeCases, setEdgeCases] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [selections, setSelections] = useState<string[]>([]);
  const products = sampleProducts.slice(0, count).map((product, index) => {
    if (!edgeCases) return product;
    if (index === 0) return { ...product, imageUrl: "/images/products/tri05-missing.svg" };
    if (index === 1) return { ...product, imageUrl: " " };
    if (index === 2) return { ...product, name: "Cà phê với tên rất dài dành cho kiểm thử, gồm cả chuỗi không có khoảng trắng " + "BrewLite".repeat(12) };
    if (index === 3) return { ...product, price: 0 };
    if (index === 4) return { ...product, price: 2147483647 };
    if (index === 5) return { ...product, price: 29999 };
    return product;
  });

  return (
    <main lang="vi" className={`${styles.shell} min-h-screen py-8`}>
      <div className={styles.container}>
        <h1 className="text-2xl font-bold">KIỂM THỬ TRI-05 — dữ liệu mẫu</h1>
        <p className="mt-2 text-sm">Trang này chỉ kiểm tra component; thao tác chọn không thêm vào giỏ.</p>
        <div className="my-6 flex flex-wrap items-center gap-4">
          <label>Số sản phẩm <select value={count} onChange={(event) => setCount(Number(event.target.value))} className="border p-2">
            {[1, 8, 10].map((size) => <option key={size} value={size}>{size}</option>)}
          </select></label>
          <label><input type="checkbox" checked={edgeCases} onChange={(event) => setEdgeCases(event.target.checked)} /> Trường hợp biên</label>
          <label><input type="checkbox" checked={disabled} onChange={(event) => setDisabled(event.target.checked)} /> Chưa có callback</label>
        </div>
        <output aria-label="Kết quả chọn món" className="mb-6 block break-all" aria-live="polite">
          Số lượt chọn: {selections.length} · productId: {selections.at(-1) ?? "chưa chọn"}
        </output>
        <ProductGrid products={products} onSelectProduct={disabled ? undefined : (id) => setSelections((previous) => [...previous, id])} />
      </div>
    </main>
  );
}
