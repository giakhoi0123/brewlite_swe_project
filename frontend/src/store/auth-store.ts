import { create } from "zustand";

export type Role = "CUSTOMER" | "BARISTA";
export type AuthUser = { id: string; email: string; name: string; loyaltyPoints: number; role: Role };

type AuthState = {
  user: AuthUser | null;
  initialized: boolean;
  setSession: (user: AuthUser) => void;
  clearSession: () => void;
  initialize: () => Promise<void>;
};

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3002/api";

export const useAuthStore = create<AuthState>()((set, get) => ({
  user: null,
  initialized: false,
  setSession: (user) => set({ user, initialized: true }),
  clearSession: () => set({ user: null, initialized: true }),
  initialize: async () => {
    const startedWithUser = get().user;
    try {
      const response = await fetch(`${apiUrl}/auth/me`, { credentials: "include", cache: "no-store" });
      if (get().user !== startedWithUser) return;
      if (!response.ok) { set({ user: null, initialized: true }); return; }
      const data = await response.json() as { user: AuthUser };
      if (get().user !== startedWithUser) return;
      set({ user: data.user, initialized: true });
    } catch { if (get().user === startedWithUser) set({ user: null, initialized: true }); }
  },
}));

export async function logout() {
  try { await fetch(`${apiUrl}/auth/logout`, { method: "POST", credentials: "include" }); }
  finally { useAuthStore.getState().clearSession(); }
}
