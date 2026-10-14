"use client";

import Image from "next/image";
import { useState } from "react";
import type { Product } from "@/types/product";
import type { ProductSelectionHandler } from "@/types/product-details-adapter";
import menuStyles from "./menu.module.css";
import styles from "./product-card.module.css";

const vnd = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
});

export type ProductCardProps = {
  product: Product;
  onSelectProduct?: ProductSelectionHandler;
};

function ProductImage({ src, name }: { src: string; name: string }) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <span role="img" aria-label={`Chưa có ảnh cho ${name}`} className={styles.fallback}>
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="size-10">
          <path d="M5 8h11v5a5 5 0 0 1-5 5h-1a5 5 0 0 1-5-5V8ZM16 10h1.5a2.5 2.5 0 0 1 0 5H16M8 4v2M12 3v3M16 4v2M3 21h16" />
        </svg>
        <span className="text-xs leading-[18px]">Ảnh chưa có</span>
      </span>
    );
  }

  return (
    <Image
      src={src}
      alt={name}
      fill
      unoptimized
      className="object-cover"
      onError={() => setFailed(true)}
    />
  );
}

export function ProductCard({ product, onSelectProduct }: ProductCardProps) {
  const imageUrl = product.imageUrl.trim();
  const unavailable = !onSelectProduct;

  function selectProduct() {
    onSelectProduct?.(product.id);
  }

  return (
    <article className={`${styles.card} flex h-full min-w-0 flex-col gap-4 rounded-[var(--menu-radius-panel)] bg-[var(--menu-card)] p-4 shadow-[var(--menu-shadow-low)]`}>
      <button
        type="button"
        className={styles.imageButton}
        aria-label={`Chọn ${product.name}`}
        onClick={selectProduct}
        disabled={unavailable}
      >
        {/* Reset image error state when its source changes, including the same product id. */}
        <ProductImage key={imageUrl} src={imageUrl} name={product.name} />
      </button>
      <h3>
        <button type="button" className={styles.nameButton} onClick={selectProduct} disabled={unavailable}>
          {product.name}
        </button>
      </h3>
      <div className="mt-auto flex min-w-0 flex-col gap-4">
        <div>
          <p className="text-xs leading-[18px] text-[var(--menu-muted)]">Giá cơ bản</p>
          <p className={`${menuStyles.headline} text-[22px] font-semibold leading-[30px] break-words text-[var(--menu-primary)] tabular-nums`}>
            {vnd.format(product.price)}
          </p>
        </div>
        <button
          type="button"
          className={`${menuStyles.action} ${styles.selectButton} w-full gap-2`}
          aria-label={`Chọn món ${product.name}`}
          onClick={selectProduct}
          disabled={unavailable}
        >
          <span aria-hidden="true">+</span> Chọn món
        </button>
        {unavailable && (
          <p className="text-xs leading-[18px] text-[var(--menu-muted)]">Chọn món đang chờ tích hợp.</p>
        )}
      </div>
    </article>
  );
}
