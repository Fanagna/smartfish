import { Router } from "express";
import { prisma } from "../../lib/prisma";
import { asyncHandler } from "../../utils/asyncHandler";
import { requireAuth } from "../../middleware/auth";

export const analyticsRouter = Router();
analyticsRouter.use(requireAuth);

analyticsRouter.get("/kpis", asyncHandler(async (_req, res) => {
  const [fishermen, boats, catches, revenue, stock] = await Promise.all([
    prisma.fisherman.count(),
    prisma.boat.count(),
    prisma.catch.aggregate({ _sum: { weightKg: true }, _count: true }),
    prisma.sale.aggregate({ where: { status: "paid" }, _sum: { amount: true } }),
    prisma.stockItem.aggregate({ _sum: { quantityKg: true } }),
  ]);
  res.json({
    fishermen,
    boats,
    catchesCount: catches._count,
    totalWeightKg: catches._sum.weightKg ?? 0,
    revenue: revenue._sum.amount ?? 0,
    stockKg: stock._sum.quantityKg ?? 0,
  });
}));

analyticsRouter.get("/revenue-trend", asyncHandler(async (_req, res) => {
  const rows = await prisma.$queryRaw<Array<{ month: Date; total: number }>>`
    SELECT date_trunc('month', "issuedAt") AS month, COALESCE(SUM(amount), 0)::float AS total
    FROM "Sale"
    WHERE status = 'paid'
    GROUP BY 1
    ORDER BY 1 ASC
    LIMIT 12
  `;
  res.json(rows.map((r) => ({ month: r.month.toISOString().slice(0, 7), total: Number(r.total) })));
}));

analyticsRouter.get("/catches-by-species", asyncHandler(async (_req, res) => {
  const rows = await prisma.catch.groupBy({
    by: ["fishType"],
    _sum: { weightKg: true },
    orderBy: { _sum: { weightKg: "desc" } },
    take: 10,
  });
  res.json(rows.map((r) => ({ species: r.fishType, weightKg: r._sum.weightKg ?? 0 })));
}));
