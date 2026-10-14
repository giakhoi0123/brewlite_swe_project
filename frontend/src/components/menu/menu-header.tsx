"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { logout, useAuthStore } from "@/store/auth-store";
import { MenuBrand } from "./menu-brand";
import styles from "./menu.module.css";

export function MenuHeader() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const initialized = useAuthStore((state) => state.initialized);

  async function handleSignOut() {
    await logout();
    router.push("/");
  }

  return (
    <header className={`${styles.header} sticky top-0 z-30`}>
      <div className={`${styles.container} flex min-h-20 flex-wrap items-center justify-between gap-x-4 gap-y-3 py-4`}>
        <Link href="/products" aria-label="BrewLite — Thực đơn" className="inline-flex min-h-11 items-center rounded-full"><MenuBrand /></Link>
        <nav aria-label="Điều hướng chính" className="hidden rounded-full bg-[var(--menu-surface-container)] p-1 lg:block">
          <Link href="/products" aria-current="page" className={styles.action}>Thực đơn</Link>
        </nav>
        {!initialized ? (
          <span role="status" className="text-xs text-[var(--menu-muted)]">Đang tải tài khoản…</span>
        ) : user ? (
          <div className="flex w-full min-w-0 items-center justify-between gap-4 sm:w-auto sm:max-w-[60%]">
            <div className="min-w-0 text-xs leading-[18px] sm:text-right">
              <p className="font-semibold break-words [overflow-wrap:anywhere]">{user.name}</p>
              <p className="break-words text-[var(--menu-muted)] [overflow-wrap:anywhere]">{user.email}</p>
              {user.role === "BARISTA" ? (
                <Link href="/barista/dashboard" className="text-[var(--menu-secondary)]">Nhân viên pha chế · Bảng điều khiển</Link>
              ) : Number.isSafeInteger(user.loyaltyPoints) && user.loyaltyPoints >= 0 && (
                <p className="text-[var(--menu-secondary)]">{user.loyaltyPoints.toLocaleString("vi-VN")} điểm tích lũy</p>
              )}
            </div>
            <button type="button" onClick={handleSignOut} className={`${styles.action} shrink-0`}>Đăng xuất</button>
          </div>
        ) : (
          <Link href="/" className={styles.action}>Đăng nhập</Link>
        )}
      </div>
    </header>
  );
}
