import { api } from "@/lib/api/client";

export interface Paginated<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  [k: string]: any;
}

export function createResourceService<T extends { id: string | number }>(resource: string) {
  return {
    list: async (params: ListParams = {}) => {
      const { data } = await api.get<Paginated<T> | T[]>(`/${resource}`, { params });
      if (Array.isArray(data)) {
        const all = data;
        const page = params.page ?? 1;
        const pageSize = params.pageSize ?? 10;
        return { data: all.slice((page - 1) * pageSize, page * pageSize), total: all.length, page, pageSize } as Paginated<T>;
      }
      return data;
    },
    get: async (id: string) => {
      const { data } = await api.get<T>(`/${resource}/${id}`);
      return data;
    },
    create: async (payload: Partial<T>) => {
      const { data } = await api.post<T>(`/${resource}`, payload);
      return data;
    },
    update: async (id: string, payload: Partial<T>) => {
      const { data } = await api.put<T>(`/${resource}/${id}`, payload);
      return data;
    },
    remove: async (id: string) => {
      const { data } = await api.delete<{ success: boolean }>(`/${resource}/${id}`);
      return data;
    },
  };
}

export interface Fisherman {
  id: string;
  fullName: string;
  email?: string;
  phone?: string;
  licenseNumber?: string;
  boatId?: string;
  status?: "active" | "inactive";
  createdAt?: string;
}

export interface Boat {
  id: string;
  name: string;
  registrationNumber: string;
  capacityKg?: number;
  status?: "available" | "at-sea" | "maintenance";
  captain?: string;
  createdAt?: string;
}

export interface Catch {
  id: string;
  boatId: string;
  fishermanId: string;
  fishType: string;
  weightKg: number;
  quantity: number;
  date: string;
  zone?: string;
}

export const fishermenService = createResourceService<Fisherman>("fishermen");
export const boatsService = createResourceService<Boat>("boats");
export const catchesService = createResourceService<Catch>("catches");
