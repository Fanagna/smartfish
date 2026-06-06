import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../lib/prisma";
import { asyncHandler } from "../../utils/asyncHandler";
import { validate } from "../../middleware/validate";
import { requireAuth } from "../../middleware/auth";
import { getPagination, paginated } from "../../utils/paginate";

const upsertSchema = z.object({
  invoiceNo: z.string().min(1),
  customer: z.string().min(1),
  channel: z.enum(["export", "local", "wholesale"]).optional(),
  status: z.enum(["pending", "paid", "cancelled"]).optional(),
  amount: z.coerce.number().nonnegative(),
  currency: z.string().min(3).max(4).optional(),
  notes: z.string().optional().nullable(),
  paidAt: z.coerce.date().optional().nullable(),
});

export const salesRouter = Router();
salesRouter.use(requireAuth);

salesRouter.get("/summary", asyncHandler(async (_req, res) => {
  const [paid, pending, byChannel] = await Promise.all([
    prisma.sale.aggregate({ where: { status: "paid" }, _sum: { amount: true }, _count: true }),
    prisma.sale.aggregate({ where: { status: "pending" }, _sum: { amount: true }, _count: true }),
    prisma.sale.groupBy({ by: ["channel"], _sum: { amount: true }, _count: true }),
  ]);
  res.json({
    paid: { total: paid._sum.amount ?? 0, count: paid._count },
    pending: { total: pending._sum.amount ?? 0, count: pending._count },
    byChannel: byChannel.map((r) => ({ channel: r.channel, total: r._sum.amount ?? 0, count: r._count })),
  });
}));

salesRouter.get("/", asyncHandler(async (req, res) => {
  const { skip, take, page, pageSize, search } = getPagination(req);
  const where = search
    ? { OR: [
        { customer: { contains: search, mode: "insensitive" as const } },
        { invoiceNo: { contains: search, mode: "insensitive" as const } },
      ]}
    : {};
  const [data, total] = await Promise.all([
    prisma.sale.findMany({ where, skip, take, orderBy: { issuedAt: "desc" } }),
    prisma.sale.count({ where }),
  ]);
  res.json(paginated(data, total, page, pageSize));
}));

salesRouter.get("/:id", asyncHandler(async (req, res) => {
  res.json(await prisma.sale.findUniqueOrThrow({ where: { id: req.params.id } }));
}));

salesRouter.post("/", validate(upsertSchema), asyncHandler(async (req, res) => {
  res.status(201).json(await prisma.sale.create({ data: req.body }));
}));

salesRouter.put("/:id", validate(upsertSchema.partial()), asyncHandler(async (req, res) => {
  res.json(await prisma.sale.update({ where: { id: req.params.id }, data: req.body }));
}));

salesRouter.delete("/:id", asyncHandler(async (req, res) => {
  await prisma.sale.delete({ where: { id: req.params.id } });
  res.json({ success: true });
}));
