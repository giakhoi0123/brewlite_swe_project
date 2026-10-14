import Link from "next/link";
import { MenuBrand } from "./menu-brand";
import styles from "./menu.module.css";

export function MenuFooter() {
  return (
    <footer className="bg-[var(--menu-surface-low)] text-[var(--menu-muted)]">
      <div className={`${styles.container} py-8 sm:py-10`}>
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-sm">
            <div className="text-[var(--menu-primary)]"><MenuBrand /></div>
            <p className="mt-3 text-sm leading-[22px]">Một góc nhỏ cho người yêu cà phê, những cuộc trò chuyện và hương vị mỗi ngày.</p>
          </div>
          <nav aria-label="Điều hướng cuối trang" className="flex flex-wrap gap-x-6 gap-y-2">
            <Link href="/products" className="inline-flex min-h-11 items-center rounded-sm text-sm font-semibold">Thực đơn</Link>
            <Link href="/" className="inline-flex min-h-11 items-center rounded-sm text-sm font-semibold">Tài khoản</Link>
          </nav>
        </div>
        <p className="mt-8 border-t border-[var(--menu-outline-variant)]/40 pt-6 text-xs leading-[18px]">BrewLite · Hương vị cho ngày của bạn.</p>
      </div>
    </footer>
  );
}
