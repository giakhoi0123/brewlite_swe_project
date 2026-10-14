import test from "node:test";
import assert from "node:assert/strict";
import { parseProducts } from "../src/lib/product-contract.ts";

const product = {
  id: "31a650c7-8597-4a01-a8e2-000000000001",
  name: "Cà phê từ API",
  price: 29000,
  imageUrl: "/images/products/sample-latte.svg",
};

test("accepts direct lists, zero/max integer VND and HTTP images", () => {
  assert.deepEqual(parseProducts([product]), [product]);
  assert.equal(parseProducts([{ ...product, price: 0 }])[0].price, 0);
  assert.equal(parseProducts([{ ...product, price: 2147483647, imageUrl: "https://example.com/drink.jpg" }])[0].price, 2147483647);
});
test("accepts [] as the only empty list shape", () => {
  assert.deepEqual(parseProducts([]), []);
  for (const value of [null, undefined, {}, { data: [] }, "[]"]) assert.throws(() => parseProducts(value));
});
test("does not silently discard a bad row alongside valid products", () => {
  assert.throws(() => parseProducts([product, null]));
  assert.throws(() => parseProducts([product, { ...product, id: "bad-id" }]));
});
test("rejects formatted, fractional, negative and out-of-range prices", () => {
  for (const price of ["29.000₫", 1.5, -1, NaN, Infinity, 2147483648]) {
    assert.throws(() => parseProducts([{ ...product, price }]));
  }
});
test("rejects missing required fields, blank names and unsupported image URLs", () => {
  for (const key of Object.keys(product)) {
    const invalid = { ...product };
    delete invalid[key];
    assert.throws(() => parseProducts([invalid]));
  }
  for (const name of [null, "", "  "]) assert.throws(() => parseProducts([{ ...product, name }]));
  for (const imageUrl of ["", "  ", "//example.com/image.jpg", "javascript:alert(1)", "relative.jpg"]) {
    assert.throws(() => parseProducts([{ ...product, imageUrl }]));
  }
});
test("rejects repeated UUIDs and projects only catalog fields", () => {
  assert.throws(() => parseProducts([product, { ...product, id: product.id.toUpperCase() }]));
  assert.deepEqual(parseProducts([{ ...product, stock: 10 }]), [product]);
});
