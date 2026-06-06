import { Request } from "express";

export function getPagination(req: Request) {
  const page = Math.max(1, Number(req.query.page ?? 1));
  const pageSize = Math.min(100, Math.max(1, Number(req.query.pageSize ?? 10)));
  const search = (req.query.search as string | undefined)?.trim() || undefined;
  return { page, pageSize, skip: (page - 1) * pageSize, take: pageSize, search };
}

export function paginated<T>(data: T[], total: number, page: number, pageSize: number) {
  return { data, total, page, pageSize };
}
