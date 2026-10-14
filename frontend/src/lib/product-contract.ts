import type { Product } from "@/types/product";

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function validImageUrl(value: string): boolean {
  if (/^\/(?!\/)/.test(value)) return true;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

/** Reject the whole response on malformed rows; errors must not look like empty data. */
export function parseProducts(value: unknown): Product[] {
  if (!Array.isArray(value)) throw new Error("Invalid product list");
  const ids = new Set<string>();

  return value.map((item: unknown) => {
    if (typeof item !== "object" || item === null) throw new Error("Invalid product");
    const { id, name, price, imageUrl } = item as Record<string, unknown>;
    if (
      typeof id !== "string" || !uuid.test(id) || ids.has(id.toLowerCase()) ||
      typeof name !== "string" || !name.trim() ||
      typeof price !== "number" || !Number.isInteger(price) || price < 0 || price > 2147483647 ||
      typeof imageUrl !== "string" || !imageUrl.trim() || !validImageUrl(imageUrl.trim())
    ) {
      throw new Error("Invalid product");
    }
    ids.add(id.toLowerCase());
    return { id, name, price, imageUrl };
  });
}
