import cardStyles from "./product-card.module.css";
import styles from "./product-catalog.module.css";

export function ProductGridSkeleton() {
  return (
    <div role="status">
      <p className="sr-only">Đang tải thực đơn…</p>
      <div aria-hidden="true" className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end">
        <div className="min-w-0 flex-1">
          <div className={`${styles.skeleton} mb-2 h-5 w-24 rounded-[var(--menu-radius-base)]`} />
          <div className={`${styles.skeleton} h-11 rounded-[var(--menu-radius-image)]`} />
        </div>
        <div className="min-w-0 sm:w-52">
          <div className={`${styles.skeleton} mb-2 h-5 w-20 rounded-[var(--menu-radius-base)]`} />
          <div className={`${styles.skeleton} h-11 rounded-[var(--menu-radius-image)]`} />
        </div>
        <div className={`${styles.skeleton} h-11 sm:w-32 rounded-[var(--menu-radius-pill)]`} />
      </div>
      <div aria-hidden="true" className={`${styles.skeleton} mb-4 h-[22px] w-16 rounded-[var(--menu-radius-base)]`} />
      <ul aria-hidden="true" className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 lg:gap-8">
        {Array.from({ length: 6 }, (_, index) => (
          <li key={index}>
            <div className={`${cardStyles.card} flex h-full flex-col gap-4 rounded-[var(--menu-radius-panel)] bg-[var(--menu-card)] p-4 shadow-[var(--menu-shadow-low)]`}>
              <div className={`${styles.skeleton} aspect-[4/3] rounded-[var(--menu-radius-image)]`} />
              <div className="flex min-h-11 items-center">
                <div className={`${styles.skeleton} h-6 w-3/4 rounded-[var(--menu-radius-base)]`} />
              </div>
              <div className="mt-auto flex flex-col gap-4">
                <div className="flex h-12 flex-col gap-2">
                  <div className={`${styles.skeleton} h-3 w-20 rounded-[var(--menu-radius-base)]`} />
                  <div className={`${styles.skeleton} h-6 w-28 rounded-[var(--menu-radius-base)]`} />
                </div>
                <div className={`${styles.skeleton} h-11 rounded-[var(--menu-radius-pill)]`} />
                <div className={`${styles.skeleton} h-[18px] w-3/4 rounded-[var(--menu-radius-base)]`} />
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
