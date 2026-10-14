"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { RequireRole } from "@/components/auth/require-role";
import { logout, useAuthStore } from "@/store/auth-store";

const links = [
  ["/barista/dashboard", "Tổng quan"], ["/barista/orders", "Đơn chờ pha chế"],
  ["/barista/preparing", "Đang pha chế"], ["/barista/ready", "Sẵn sàng"],
  ["/barista/history", "Lịch sử"],
];

export default function BaristaLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  return <RequireRole role="BARISTA"><div className="min-h-screen bg-[#fcf9f3] text-[#2b1810]">
    <header className="border-b border-[#e8dfd5] bg-[#fffdf9] px-6 py-5">
      <div className="max-w-6xl mx-auto flex flex-wrap justify-between items-center gap-4">
        <div><strong className="text-xl">BrewLite</strong><p className="text-sm text-[#7b5d4f]">Nhân viên pha chế · {user?.name} · {user?.email}</p></div>
        <button className="rounded-full bg-[#2b1810] px-4 py-2 text-white cursor-pointer" onClick={async () => { await logout(); router.replace("/"); }}>Đăng xuất</button>
      </div>
    </header>
    <nav className="max-w-6xl mx-auto flex flex-wrap gap-3 px-6 py-5">{links.map(([href, label]) => <Link className="rounded-full border border-[#e8dfd5] bg-white px-4 py-2 text-sm hover:bg-[#f6f3ed]" key={href} href={href}>{label}</Link>)}</nav>
    <div className="max-w-6xl mx-auto px-6 pb-12">{children}</div>
  </div></RequireRole>;
}
