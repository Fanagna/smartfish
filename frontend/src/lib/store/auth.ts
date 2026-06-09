import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type Role = "ADMIN" | "MANAGER" | "FISHERMAN";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatarUrl?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  remember: boolean;
  isAuthenticated: boolean;
  setSession: (p: { user: User; token: string; refreshToken: string; remember?: boolean }) => void;
  setToken: (token: string, refreshToken?: string) => void;
  setUser: (u: User) => void;
  clear: () => void;
  hasRole: (r: Role | Role[]) => boolean;
}

const noopStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      remember: true,
      isAuthenticated: false,
      setSession: ({ user, token, refreshToken, remember = true }) =>
        set({ user, token, refreshToken, remember, isAuthenticated: true }),
      setToken: (token, refreshToken) =>
        set({ token, refreshToken: refreshToken ?? get().refreshToken }),
      setUser: (user) => set({ user }),
      clear: () => set({ user: null, token: null, refreshToken: null, isAuthenticated: false }),
      hasRole: (r) => {
        const role = get().user?.role;
        if (!role) return false;
        return Array.isArray(r) ? r.includes(role) : r === role;
      },
    }),
    {
      name: "smartfish.auth",
      storage: createJSONStorage(() =>
        typeof window !== "undefined" ? window.localStorage : (noopStorage as any),
      ),
      partialize: (s) => ({
        user: s.user,
        token: s.token,
        refreshToken: s.refreshToken,
        remember: s.remember,
        isAuthenticated: s.isAuthenticated,
      }),
    },
  ),
);
