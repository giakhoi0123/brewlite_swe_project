import type { Metadata } from "next";
import { MenuHeader } from "@/components/menu/menu-header";
import { MenuHero } from "@/components/menu/menu-hero";
import { MenuFooter } from "@/components/menu/menu-footer";
import styles from "@/components/menu/menu.module.css";

export const metadata: Metadata = {
  title: "Thực đơn | BrewLite",
  description: "Khám phá thực đơn đồ uống BrewLite, từ cà phê đến những hương vị mới cho ngày của bạn.",
};

export default function ProductsPage() {
  return (
    <div lang="vi" className={`${styles.shell} flex min-h-screen flex-col`}>
      <a href="#menu-content" className={styles.skipLink}>Đến nội dung thực đơn</a>
      <MenuHeader />
      <main id="menu-content" tabIndex={-1} className="flex-1 outline-none">
        <div className={`${styles.container} pb-8 pt-6 sm:pt-8`}>
          <nav aria-label="Vị trí hiện tại" className="mb-6 text-xs text-[var(--menu-muted)]">
            <span>BrewLite</span>
            <span aria-hidden="true" className="mx-2">/</span>
            <span aria-current="page" className="font-semibold text-[var(--menu-ink)]">Thực đơn</span>
          </nav>
          <MenuHero />
        </div>
        <section id="menu-catalog" aria-labelledby="menu-catalog-title" className={`${styles.container} scroll-mt-44 pb-12 pt-4 sm:pb-16`}>
          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between">
            <h2 id="menu-catalog-title" className={`${styles.headline} text-[22px] font-semibold leading-[30px]`}>Tất cả món nước</h2>
            <p className="text-sm leading-[22px] text-[var(--menu-muted)]">Một thức uống, một khoảnh khắc riêng.</p>
          </div>
          {/* TRI-05/06 will supply the product grid and API states here. */}
          <div className="flex min-h-60 flex-col items-center justify-center gap-3 rounded-[var(--menu-radius-panel)] border border-[var(--menu-outline-variant)]/40 bg-[var(--menu-card)] px-6 py-12 text-center shadow-[var(--menu-shadow-low)]">
            <span aria-hidden="true" className="h-1 w-10 rounded-full bg-[var(--menu-secondary)]" />
            <h3 className={`${styles.headline} text-lg font-semibold leading-[26px]`}>Thực đơn đang được chuẩn bị</h3>
            <p className="max-w-md text-sm leading-[22px] text-[var(--menu-muted)]">Danh sách đồ uống sẽ sớm có mặt tại đây. Hẹn bạn một tách cà phê và những hương vị yêu thích.</p>
          </div>
        </section>
      </main>
      <MenuFooter />
    </div>
  );
}
