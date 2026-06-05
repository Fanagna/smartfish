import axios from "axios";
import { useAuthStore } from "@/lib/store/auth";

export const API_BASE_URL =
  (typeof import.meta !== "undefined" && (import.meta as any).env?.VITE_API_BASE_URL) ||
  "http://localhost:5000/api";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers = config.headers ?? {};
      (config.headers as any).Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

let isRefreshing = false;
let queue: Array<(token: string | null) => void> = [];

api.interceptors.response.use(
  (r) => r,
  async (error) => {
    const original = error.config;
    if (!original) throw error;

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      const refreshToken = useAuthStore.getState().refreshToken;
      if (!refreshToken) {
        useAuthStore.getState().clear();
        throw error;
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          queue.push((token) => {
            if (!token) return reject(error);
            original.headers.Authorization = `Bearer ${token}`;
            resolve(api(original));
          });
        });
      }

      isRefreshing = true;
      try {
        const { data } = await axios.post(`${API_BASE_URL}/auth/refresh-token`, { refreshToken });
        const newToken: string = data.token ?? data.accessToken;
        useAuthStore.getState().setToken(newToken, data.refreshToken ?? refreshToken);
        queue.forEach((cb) => cb(newToken));
        queue = [];
        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      } catch (e) {
        queue.forEach((cb) => cb(null));
        queue = [];
        useAuthStore.getState().clear();
        if (typeof window !== "undefined") window.location.href = "/login";
        throw e;
      } finally {
        isRefreshing = false;
      }
    }
    throw error;
  },
);
