import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../lib/prisma";
import { asyncHandler } from "../../utils/asyncHandler";
import { validate } from "../../middleware/validate";
import { requireAuth } from "../../middleware/auth";
import { getPagination, paginated } from "../../utils/paginate";

const upsertSchema = z.object({
  boatId: z.string().min(1),
  fishermanId: z.string().min(1),
  fishType: z.string().min(1),
  weightKg: z.coerce.number().nonnegative(),
  quantity: z.coerce.number().int().nonnegative().optional(),
  zone: z.string().optional().nullable(),
  date: z.coerce.date().optional(),
});

export const catchesRouter = Router();
catchesRouter.use(requireAuth);

catchesRouter.get("/", asyncHandler(async (req, res) => {
  const { skip, take, page, pageSize, search } = getPagination(req);
  const where = search
    ? { OR: [
        { fishType: { contains: search, mode: "insensitive" as const } },
        { zone: { contains: search, mode: "insensitive" as const } },
      ]}
    : {};
  const [data, total] = await Promise.all([
    prisma.catch.findMany({ where, skip, take, orderBy: { date: "desc" }, include: { boat: true, fisherman: true } }),
    prisma.catch.count({ where }),
  ]);
  res.json(paginated(data, total, page, pageSize));
}));

catchesRouter.get("/:id", asyncHandler(async (req, res) => {
  res.json(await prisma.catch.findUniqueOrThrow({ where: { id: req.params.id }, include: { boat: true, fisherman: true } }));
}));

catchesRouter.post("/", validate(upsertSchema), asyncHandler(async (req, res) => {
  res.status(201).json(await prisma.catch.create({ data: req.body }));
}));

catchesRouter.put("/:id", validate(upsertSchema.partial()), asyncHandler(async (req, res) => {
  res.json(await prisma.catch.update({ where: { id: req.params.id }, data: req.body }));
}));

catchesRouter.delete("/:id", asyncHandler(async (req, res) => {
  await prisma.catch.delete({ where: { id: req.params.id } });
  res.json({ success: true });
}));
