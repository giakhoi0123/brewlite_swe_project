"use client";

import type { Product } from "@/types/product";
import { ProductCard } from "./product-card";

export type ProductGridProps = {
  products: readonly Product[];
  onSelectProduct?: (productId: Product["id"]) => void;
};

export function ProductGrid({ products, onSelectProduct }: ProductGridProps) {
  return (
    <ul aria-label="Danh sách đồ uống" className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 lg:gap-8">
      {products.map((product) => (
        <li key={product.id} className="min-w-0">
          <ProductCard product={product} onSelectProduct={onSelectProduct} />
        </li>
      ))}
    </ul>
  );
}
