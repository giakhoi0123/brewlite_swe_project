import test from "node:test";
import assert from "node:assert/strict";
import { filterProducts, normalizeProductSearch } from "../src/lib/product-filters.ts";

const products = Object.freeze([
  Object.freeze({ id: "a", name: "Trà đào", price: 35000, imageUrl: "/a.svg" }),
  Object.freeze({ id: "b", name: "CÀ PHÊ ĐEN", price: 29000, imageUrl: "/b.svg" }),
  Object.freeze({ id: "c", name: "Cà phê sữa", price: 35000, imageUrl: "/c.svg" }),
  Object.freeze({ id: "d", name: "Cà phê miễn phí", price: 0, imageUrl: "/d.svg" }),
]);

test("search matches Vietnamese accents, case, decomposed text and đ/Đ", () => {
  assert.equal(normalizeProductSearch("  ĐÀO  CÀ  PHÊ  "), "dao ca phe");
  assert.deepEqual(filterProducts(products, "CA PHE", "default").map((p) => p.id), ["b", "c", "d"]);
  assert.deepEqual(filterProducts(products, "cà phê đen".normalize("NFD"), "default").map((p) => p.id), ["b"]);
  assert.deepEqual(filterProducts(products, "TRA DAO", "default").map((p) => p.id), ["a"]);
});

test("combines search and integer price sorting without changing source order", () => {
  assert.deepEqual(filterProducts(products, "ca phe", "price-asc").map((p) => p.id), ["d", "b", "c"]);
  assert.deepEqual(filterProducts(products, "ca phe", "price-desc").map((p) => p.id), ["c", "b", "d"]);
  assert.deepEqual(filterProducts(products, "", "default"), products);
  assert.deepEqual(products.map((p) => p.id), ["a", "b", "c", "d"]);
});

test("equal prices keep API order; resetting query and sort restores all products", () => {
  assert.deepEqual(filterProducts(products, "", "price-desc").map((p) => p.id), ["a", "c", "b", "d"]);
  assert.deepEqual(filterProducts(products, "absent", "price-asc"), []);
  assert.deepEqual(filterProducts(products, "  ", "default"), products);
  assert.deepEqual(filterProducts([], "ca phe", "price-asc"), []);
});
