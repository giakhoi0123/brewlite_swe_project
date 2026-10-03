"use client";

import { useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";

const emptySubscribe = () => () => {};

export default function ProductsPage() {
  const router = useRouter();
  const { user, clearSession } = useAuthStore();
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );

  function handleSignOut() {
    clearSession();
    router.push("/");
  }

  // Prevent hydration mismatch when reading localStorage
  if (!mounted) {
    return (
      <main className="min-h-screen bg-[#fcf9f3] flex items-center justify-center">
        <p className="text-[#4f4440] text-sm animate-pulse">Loading espresso lab...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#fcf9f3] text-[#1c1c18] flex flex-col">
      {/* Top Navigation */}
      <header className="border-b border-[#e8dfd5] bg-[#fffdf9]/80 backdrop-blur-md sticky top-0 z-30 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-full bg-[#2b1810] text-[#fffdf9] flex items-center justify-center font-bold text-lg shadow-sm">
              ☕
            </span>
            <div>
              <h1 className="text-base font-bold tracking-tight text-[#2b1810] leading-none">
                BrewLite
              </h1>
              <span className="text-[10px] tracking-widest text-[#c87d55] font-semibold uppercase">
                Espresso Lab & Roastery
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-semibold text-[#2b1810]">{user.name}</p>
                  <p className="text-[11px] text-[#4f4440]">{user.email}</p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#f6f3ed] border border-[#e8dfd5] text-[#c87d55]">
                  ✦ {user.loyaltyPoints} Points
                </span>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="px-3 py-1.5 rounded-full text-xs font-medium bg-[#2b1810] text-white hover:bg-[#c87d55] transition-colors cursor-pointer"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => router.push("/")}
                className="px-3 py-1.5 rounded-full text-xs font-medium bg-[#2b1810] text-white hover:bg-[#c87d55] transition-colors cursor-pointer"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="max-w-6xl mx-auto px-6 py-10 flex-1 w-full flex flex-col gap-8">
        {/* Welcome Banner */}
        <section className="bg-gradient-to-br from-[#2b1810] to-[#3f2418] text-[#fffdf9] rounded-2xl p-8 shadow-xl relative overflow-hidden">
          <div className="absolute right-0 top-0 w-80 h-80 bg-[#c87d55]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-xl">
            <span className="inline-block px-3 py-1 rounded-full text-[11px] font-semibold tracking-wider uppercase bg-[#c87d55]/20 text-[#d49b74] border border-[#c87d55]/30 mb-4">
              Session Authenticated · Tap-To-Brew Ready
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">
              Welcome back, {user?.name || "Coffee Lover"}!
            </h2>
            <p className="text-sm text-[#fffdf9]/80 leading-relaxed mb-6">
              Your session passkey and verified token are active. You are now connected to our
              artisan Soho extraction counter.
            </p>
            <div className="flex flex-wrap gap-4 text-xs">
              <div className="bg-[#fffdf9]/10 backdrop-blur-sm rounded-lg px-4 py-2 border border-[#fffdf9]/10">
                <span className="text-[#d49b74] block font-medium">Account ID</span>
                <span className="font-mono text-[11px] text-[#fffdf9]/90">{user?.id || "Guest"}</span>
              </div>
              <div className="bg-[#fffdf9]/10 backdrop-blur-sm rounded-lg px-4 py-2 border border-[#fffdf9]/10">
                <span className="text-[#d49b74] block font-medium">Verified Email</span>
                <span>{user?.email || "N/A"}</span>
              </div>
              <div className="bg-[#fffdf9]/10 backdrop-blur-sm rounded-lg px-4 py-2 border border-[#fffdf9]/10">
                <span className="text-[#d49b74] block font-medium">Loyalty Tier</span>
                <span>{user?.loyaltyPoints ?? 0} Beans earned</span>
              </div>
            </div>
          </div>
        </section>

        {/* Work in Progress Placeholder */}
        <section className="bg-[#fffdf9] border border-[#e8dfd5] rounded-2xl p-10 text-center flex flex-col items-center justify-center gap-4 shadow-sm">
          <div className="w-16 h-16 rounded-full bg-[#f6f3ed] border border-[#e8dfd5] flex items-center justify-center text-2xl">
            📦
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#2b1810]">
              BrewLite Coffee Catalog (Work in Progress by Module 2)
            </h3>
            <p className="text-xs text-[#4f4440] max-w-md mx-auto mt-1 leading-relaxed">
              The product browsing, custom espresso extraction profile selector, and tap-to-brew cart
              modules are currently being finalized in Module 2.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#f6f3ed] border border-[#e8dfd5] text-xs text-[#4f4440]">
            <span className="w-2 h-2 rounded-full bg-[#10b981] animate-ping" />
            Module 1 Authentication & Session Handling Verified
          </div>
        </section>
      </div>
    </main>
  );
}
