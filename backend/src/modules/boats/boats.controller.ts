import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../lib/prisma";
import { asyncHandler } from "../../utils/asyncHandler";
import { validate } from "../../middleware/validate";
import { requireAuth } from "../../middleware/auth";
import { getPagination, paginated } from "../../utils/paginate";

const upsertSchema = z.object({
  name: z.string().min(1),
  registrationNumber: z.string().min(1),
  captain: z.string().optional().nullable(),
  capacityKg: z.coerce.number().int().nonnegative().optional().nullable(),
  status: z.enum(["available", "at_sea", "maintenance"]).optional(),
});

export const boatsRouter = Router();
boatsRouter.use(requireAuth);

boatsRouter.get("/", asyncHandler(async (req, res) => {
  const { skip, take, page, pageSize, search } = getPagination(req);
  const where = search
    ? { OR: [
        { name: { contains: search, mode: "insensitive" as const } },
        { registrationNumber: { contains: search, mode: "insensitive" as const } },
        { captain: { contains: search, mode: "insensitive" as const } },
      ]}
    : {};
  const [data, total] = await Promise.all([
    prisma.boat.findMany({ where, skip, take, orderBy: { createdAt: "desc" } }),
    prisma.boat.count({ where }),
  ]);
  res.json(paginated(data, total, page, pageSize));
}));

boatsRouter.get("/:id", asyncHandler(async (req, res) => {
  res.json(await prisma.boat.findUniqueOrThrow({ where: { id: req.params.id }, include: { fishermen: true } }));
}));

boatsRouter.post("/", validate(upsertSchema), asyncHandler(async (req, res) => {
  res.status(201).json(await prisma.boat.create({ data: req.body }));
}));

boatsRouter.put("/:id", validate(upsertSchema.partial()), asyncHandler(async (req, res) => {
  res.json(await prisma.boat.update({ where: { id: req.params.id }, data: req.body }));
}));

boatsRouter.delete("/:id", asyncHandler(async (req, res) => {
  await prisma.boat.delete({ where: { id: req.params.id } });
  res.json({ success: true });
}));
