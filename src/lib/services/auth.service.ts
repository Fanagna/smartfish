import { api } from "@/lib/api/client";
import type { User } from "@/lib/store/auth";

export interface LoginPayload { email: string; password: string; }
export interface LoginResponse { user: User; token: string; refreshToken: string; }

export const authService = {
  login: async (payload: LoginPayload) => {
    const { data } = await api.post<LoginResponse>("/auth/login", payload);
    return data;
  },
  logout: async () => {
    try { await api.post("/auth/logout"); } catch { /* ignore */ }
  },
  forgotPassword: async (email: string) => {
    const { data } = await api.post("/auth/forgot-password", { email });
    return data;
  },
  resetPassword: async (payload: { token: string; password: string }) => {
    const { data } = await api.post("/auth/reset-password", payload);
    return data;
  },
  me: async () => {
    const { data } = await api.get<User>("/auth/me");
    return data;
  },
};
