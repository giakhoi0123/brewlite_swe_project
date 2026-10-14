"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/auth-store";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const initialize = useAuthStore((state) => state.initialize);
  useEffect(() => {
    void initialize();
    const timer = window.setInterval(() => { if (useAuthStore.getState().user) void initialize(); }, 60_000);
    const onFocus = () => { if (useAuthStore.getState().user) void initialize(); };
    window.addEventListener("focus", onFocus);
    return () => { window.clearInterval(timer); window.removeEventListener("focus", onFocus); };
  }, [initialize]);
  return <>{children}</>;
}
