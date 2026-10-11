import styles from "./menu.module.css";

export function MenuBrand() {
  return (
    <span className="inline-flex items-center gap-2">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[var(--menu-primary)] text-[var(--menu-on-primary)]">
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="size-6">
          <path d="M5 8h11v5a5 5 0 0 1-5 5h-1a5 5 0 0 1-5-5V8ZM16 10h1.5a2.5 2.5 0 0 1 0 5H16M8 4v2M12 3v3M16 4v2M3 21h16" />
        </svg>
      </span>
      <span className={`${styles.headline} text-lg font-semibold tracking-tight`}>BrewLite</span>
    </span>
  );
}
