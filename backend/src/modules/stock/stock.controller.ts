import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../lib/prisma";
import { asyncHandler } from "../../utils/asyncHandler";
import { validate } from "../../middleware/validate";
import { requireAuth } from "../../middleware/auth";
import { getPagination, paginated } from "../../utils/paginate";

const upsertSchema = z.object({
  sku: z.string().min(1),
  name: z.string().min(1),
  species: z.string().optional().nullable(),
  warehouse: z.string().optional().nullable(),
  quantityKg: z.coerce.number().nonnegative(),
  thresholdKg: z.coerce.number().nonnegative(),
  unitPrice: z.coerce.number().nonnegative(),
});

export const stockRouter = Router();
stockRouter.use(requireAuth);

stockRouter.get("/alerts", asyncHandler(async (_req, res) => {
  const items = await prisma.stockItem.findMany({ orderBy: { quantityKg: "asc" } });
  const alerts = items.filter((i) => i.quantityKg <= i.thresholdKg);
  res.json({ count: alerts.length, data: alerts });
}));

stockRouter.get("/", asyncHandler(async (req, res) => {
  const { skip, take, page, pageSize, search } = getPagination(req);
  const where = search
    ? { OR: [
        { name: { contains: search, mode: "insensitive" as const } },
        { sku: { contains: search, mode: "insensitive" as const } },
        { species: { contains: search, mode: "insensitive" as const } },
      ]}
    : {};
  const [data, total] = await Promise.all([
    prisma.stockItem.findMany({ where, skip, take, orderBy: { updatedAt: "desc" } }),
    prisma.stockItem.count({ where }),
  ]);
  res.json(paginated(data, total, page, pageSize));
}));

stockRouter.get("/:id", asyncHandler(async (req, res) => {
  res.json(await prisma.stockItem.findUniqueOrThrow({ where: { id: req.params.id } }));
}));

stockRouter.post("/", validate(upsertSchema), asyncHandler(async (req, res) => {
  res.status(201).json(await prisma.stockItem.create({ data: req.body }));
}));

stockRouter.put("/:id", validate(upsertSchema.partial()), asyncHandler(async (req, res) => {
  res.json(await prisma.stockItem.update({ where: { id: req.params.id }, data: req.body }));
}));

stockRouter.delete("/:id", asyncHandler(async (req, res) => {
  await prisma.stockItem.delete({ where: { id: req.params.id } });
  res.json({ success: true });
}));
