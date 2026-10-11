import styles from "./menu.module.css";

export function MenuHero() {
  return (
    <section aria-labelledby="menu-title" className="relative overflow-hidden rounded-[var(--menu-radius-panel)] bg-[var(--menu-primary-container)] px-6 py-8 text-[var(--menu-on-primary)] shadow-[var(--menu-shadow-medium)] sm:p-8 lg:p-10">
      <div aria-hidden="true" className="pointer-events-none absolute -right-20 -bottom-24 size-80 rounded-full bg-[var(--menu-secondary)]/20 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -left-16 -top-24 size-64 rounded-full bg-[var(--menu-secondary-fixed)]/10 blur-2xl" />
      <div className="relative flex flex-col items-start gap-8 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <p className={`${styles.headline} mb-4 inline-flex rounded-full bg-[var(--menu-secondary)]/30 px-3 py-2 text-xs font-semibold tracking-wide text-[var(--menu-secondary-fixed)]`}>Một ngày mới, một hương vị mới</p>
          <h1 id="menu-title" className={`${styles.headline} text-[32px] font-bold leading-[40px] tracking-[-0.02em] sm:text-[40px] sm:leading-[48px]`}>Thực đơn đồ uống BrewLite</h1>
          <p className="mt-3 max-w-xl text-base leading-6 text-[var(--menu-primary-fixed-dim)]">Từ một tách cà phê đậm vị đến thức uống tươi mát. Tìm hương vị yêu thích và dành một chút thời gian cho chính mình.</p>
        </div>
        <a href="#menu-catalog" className={`${styles.action} ${styles.heroAction} shrink-0 gap-2`}>Xem thực đơn <span aria-hidden="true">↓</span></a>
      </div>
    </section>
  );
}
