import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fishermenService, boatsService, catchesService, createResourceService,
  type ListParams,
} from "@/lib/services/resource.service";
import { mockBoats, mockCatches, mockFishermen } from "@/lib/mock/data";

type KnownKey = "fishermen" | "boats" | "catches";
export type ResourceKey = string;

const knownServices: Record<KnownKey, any> = {
  fishermen: fishermenService,
  boats: boatsService,
  catches: catchesService,
};
const mocks: Record<KnownKey, any[]> = {
  fishermen: mockFishermen,
  boats: mockBoats,
  catches: mockCatches,
};

const cache: Record<string, any> = {};
function svc(key: string) {
  if (knownServices[key as KnownKey]) return knownServices[key as KnownKey];
  if (!cache[key]) cache[key] = createResourceService<any>(key);
  return cache[key];
}

function fallback<T extends { id: string }>(key: string, params: ListParams) {
  const all = (mocks[key as KnownKey] as any[] | undefined) ?? [];
  const search = (params.search ?? "").toLowerCase();
  const filtered = search
    ? all.filter((r) => JSON.stringify(r).toLowerCase().includes(search))
    : all;
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 10;
  return { data: filtered.slice((page - 1) * pageSize, page * pageSize) as T[], total: filtered.length, page, pageSize };
}

export function useResourceList<T extends { id: string }>(key: ResourceKey, params: ListParams = {}) {
  return useQuery({
    queryKey: [key, "list", params],
    queryFn: async () => {
      try { return await svc(key).list(params); }
      catch { return fallback<T>(key, params); }
    },
    placeholderData: (prev) => prev,
  });
}

export function useResourceItem<T extends { id: string }>(key: ResourceKey, id?: string) {
  return useQuery({
    queryKey: [key, "item", id],
    enabled: !!id,
    queryFn: async () => {
      try { return await svc(key).get(id!); }
      catch {
        const all = (mocks[key as KnownKey] as any[] | undefined) ?? [];
        return all.find((r) => r.id === id) as T | undefined;
      }
    },
  });
}

export function useResourceMutations(key: ResourceKey) {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: [key] });
  const s: any = svc(key);
  return {
    create: useMutation({ mutationFn: (payload: any) => s.create(payload).catch(() => ({ ...payload, id: `${key}-new-${Date.now()}` })), onSuccess: invalidate }),
    update: useMutation({ mutationFn: ({ id, payload }: { id: string; payload: any }) => s.update(id, payload).catch(() => ({ ...payload, id })), onSuccess: invalidate }),
    remove: useMutation({ mutationFn: (id: string) => s.remove(id).catch(() => ({ success: true })), onSuccess: invalidate }),
  };
}
