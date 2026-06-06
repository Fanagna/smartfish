import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../lib/prisma";
import { asyncHandler } from "../../utils/asyncHandler";
import { validate } from "../../middleware/validate";
import { requireAuth } from "../../middleware/auth";
import { getPagination, paginated } from "../../utils/paginate";

const upsertSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email().optional().nullable(),
  phone: z.string().optional().nullable(),
  licenseNumber: z.string().optional().nullable(),
  boatId: z.string().optional().nullable(),
  status: z.enum(["active", "inactive"]).optional(),
});

export const fishermenRouter = Router();
fishermenRouter.use(requireAuth);

fishermenRouter.get("/", asyncHandler(async (req, res) => {
  const { skip, take, page, pageSize, search } = getPagination(req);
  const where = search
    ? { OR: [
        { fullName: { contains: search, mode: "insensitive" as const } },
        { email: { contains: search, mode: "insensitive" as const } },
        { licenseNumber: { contains: search, mode: "insensitive" as const } },
      ]}
    : {};
  const [data, total] = await Promise.all([
    prisma.fisherman.findMany({ where, skip, take, orderBy: { createdAt: "desc" }, include: { boat: true } }),
    prisma.fisherman.count({ where }),
  ]);
  res.json(paginated(data, total, page, pageSize));
}));

fishermenRouter.get("/:id", asyncHandler(async (req, res) => {
  const item = await prisma.fisherman.findUniqueOrThrow({ where: { id: req.params.id }, include: { boat: true, catches: true } });
  res.json(item);
}));

fishermenRouter.post("/", validate(upsertSchema), asyncHandler(async (req, res) => {
  res.status(201).json(await prisma.fisherman.create({ data: req.body }));
}));

fishermenRouter.put("/:id", validate(upsertSchema.partial()), asyncHandler(async (req, res) => {
  res.json(await prisma.fisherman.update({ where: { id: req.params.id }, data: req.body }));
}));

fishermenRouter.delete("/:id", asyncHandler(async (req, res) => {
  await prisma.fisherman.delete({ where: { id: req.params.id } });
  res.json({ success: true });
}));
