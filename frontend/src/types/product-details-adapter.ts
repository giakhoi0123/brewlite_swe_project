import type { Product } from "./product";

export type ProductSelectionHandler = (productId: Product["id"]) => void;

/** Supplied by Đông in a Client Component once real product details are available. */
export type ProductDetailsAdapter =
  | { status: "unavailable" }
  | {
      status: "ready";
      /** Open size/topping selection. This action must not add directly to cart. */
      openProductDetails: ProductSelectionHandler;
    };

export const pendingProductDetailsAdapter: ProductDetailsAdapter = {
  status: "unavailable",
};
