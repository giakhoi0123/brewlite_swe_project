import type { Product } from "@/types/product";

export type ProductSort = "default" | "price-asc" | "price-desc";

export function normalizeProductSearch(value: string): string {
  return value.toLocaleLowerCase("vi-VN").normalize("NFD")
    .replace(/\p{M}/gu, "").replace(/đ/g, "d").trim().replace(/\s+/g, " ");
}

/** Preserve the API order for default sorting and equal prices. Never mutate the source. */
export function filterProducts(products: readonly Product[], query: string, sort: ProductSort): Product[] {
  const search = normalizeProductSearch(query);
  const results = products.filter((product) => normalizeProductSearch(product.name).includes(search));
  if (sort === "price-asc") results.sort((a, b) => a.price - b.price);
  if (sort === "price-desc") results.sort((a, b) => b.price - a.price);
  return results;
}
