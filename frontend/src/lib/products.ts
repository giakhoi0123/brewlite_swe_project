import { API_BASE_URL } from "./api";
import { parseProducts } from "./product-contract";
import type { Product } from "@/types/product";

export async function fetchProducts(signal: AbortSignal): Promise<Product[]> {
  const response = await fetch(`${API_BASE_URL}/products`, {
    signal,
    cache: "no-store",
    credentials: "omit",
  });
  if (!response.ok) throw new Error("Unable to load products");
  const data: unknown = await response.json();
  return parseProducts(data);
}
