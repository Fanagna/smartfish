import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fishermenService, boatsService, catchesService, type ListParams } from "@/lib/services/resource.service";
import { mockBoats, mockCatches, mockFishermen } from "@/lib/mock/data";

type ResourceKey = "fishermen" | "boats" | "catches";

const services = { fishermen: fishermenService, boats: boatsService, catches: catchesService };
const mocks = { fishermen: mockFishermen, boats: mockBoats, catches: mockCatches };

function fallback<T extends { id: string }>(key: ResourceKey, params: ListParams) {
  const all = (mocks[key] as any[]) as T[];
  const search = (params.search ?? "").toLowerCase();
  const filtered = search
    ? all.filter((r) => JSON.stringify(r).toLowerCase().includes(search))
    : all;
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 10;
  return { data: filtered.slice((page - 1) * pageSize, page * pageSize), total: filtered.length, page, pageSize };
}

export function useResourceList<T extends { id: string }>(key: ResourceKey, params: ListParams = {}) {
  return useQuery({
    queryKey: [key, "list", params],
    queryFn: async () => {
      try { return await (services[key] as any).list(params); }
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
      try { return await (services[key] as any).get(id!); }
      catch {
        const all = mocks[key] as any[];
        return all.find((r) => r.id === id) as T | undefined;
      }
    },
  });
}

export function useResourceMutations(key: ResourceKey) {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: [key] });
  const svc: any = services[key];

  return {
    create: useMutation({ mutationFn: (payload: any) => svc.create(payload).catch(() => ({ ...payload, id: `${key}-new-${Date.now()}` })), onSuccess: invalidate }),
    update: useMutation({ mutationFn: ({ id, payload }: { id: string; payload: any }) => svc.update(id, payload).catch(() => ({ ...payload, id })), onSuccess: invalidate }),
    remove: useMutation({ mutationFn: (id: string) => svc.remove(id).catch(() => ({ success: true })), onSuccess: invalidate }),
  };
}
