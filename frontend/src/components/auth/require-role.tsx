"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Role, useAuthStore } from "@/store/auth-store";

export function RequireRole({ role, children }: { role: Role; children: React.ReactNode }) {
  const router = useRouter();
  const { user, initialized } = useAuthStore();
  useEffect(() => {
    if (initialized && !user) router.replace("/?reason=login");
    else if (initialized && user?.role !== role) router.replace("/forbidden");
  }, [initialized, user, role, router]);
  if (!initialized || !user || user.role !== role) return <main className="min-h-screen bg-[#fcf9f3] flex items-center justify-center text-[#4f4440]">Đang kiểm tra quyền truy cập...</main>;
  return <>{children}</>;
}
