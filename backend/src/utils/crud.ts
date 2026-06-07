import { Router } from "express";
import { z, ZodSchema } from "zod";
import { prisma } from "../lib/prisma";
import { asyncHandler } from "./asyncHandler";
import { validate } from "../middleware/validate";
import { requireAuth } from "../middleware/auth";
import { getPagination, paginated } from "./paginate";

interface CrudOptions {
  model: string; // prisma model key (lowercase)
  createSchema: ZodSchema;
  updateSchema: ZodSchema;
  searchFields?: string[];
  orderBy?: any;
}

export function buildCrudRouter(opts: CrudOptions): Router {
  const router = Router();
  router.use(requireAuth);
  const client = (prisma as any)[opts.model];
  if (!client) throw new Error(`Unknown prisma model: ${opts.model}`);

  router.get("/", asyncHandler(async (req, res) => {
    const { skip, take, page, pageSize, search } = getPagination(req);
    const where = search && opts.searchFields?.length
      ? { OR: opts.searchFields.map((f) => ({ [f]: { contains: search, mode: "insensitive" as const } })) }
      : {};
    const [data, total] = await Promise.all([
      client.findMany({ where, skip, take, orderBy: opts.orderBy ?? { createdAt: "desc" } }),
      client.count({ where }),
    ]);
    res.json(paginated(data, total, page, pageSize));
  }));

  router.get("/:id", asyncHandler(async (req, res) => {
    res.json(await client.findUniqueOrThrow({ where: { id: req.params.id } }));
  }));

  router.post("/", validate(opts.createSchema), asyncHandler(async (req, res) => {
    res.status(201).json(await client.create({ data: req.body }));
  }));

  router.put("/:id", validate(opts.updateSchema), asyncHandler(async (req, res) => {
    res.json(await client.update({ where: { id: req.params.id }, data: req.body }));
  }));

  router.delete("/:id", asyncHandler(async (req, res) => {
    await client.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  }));

  return router;
}

// --- Schemas ---
const SupplierCreate = z.object({
  name: z.string().min(1),
  contact: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  email: z.string().email().optional().nullable(),
  region: z.string().optional().nullable(),
  rating: z.coerce.number().min(0).max(5).optional(),
});

const PurchaseCreate = z.object({
  supplierId: z.string().min(1),
  species: z.string().min(1),
  quantityKg: z.coerce.number().positive(),
  unitPrice: z.coerce.number().nonnegative(),
  total: z.coerce.number().nonnegative(),
  date: z.coerce.date().optional(),
  notes: z.string().optional().nullable(),
});

const ExportCreate = z.object({
  reference: z.string().min(1),
  country: z.string().min(1),
  customer: z.string().min(1),
  product: z.string().min(1),
  quantityKg: z.coerce.number().positive(),
  amount: z.coerce.number().nonnegative(),
  currency: z.string().default("EUR"),
  status: z.enum(["preparing", "shipped", "delivered", "cancelled"]).optional(),
});

const MaintenanceCreate = z.object({
  boatId: z.string().min(1),
  type: z.enum(["routine", "repair", "inspection", "emergency"]).optional(),
  description: z.string().min(1),
  cost: z.coerce.number().nonnegative().optional(),
  performedAt: z.coerce.date().optional(),
  nextDueAt: z.coerce.date().optional().nullable(),
});

export const suppliersRouter = buildCrudRouter({
  model: "supplier", createSchema: SupplierCreate, updateSchema: SupplierCreate.partial(),
  searchFields: ["name", "contact", "region", "email"],
});

export const purchasesRouter = buildCrudRouter({
  model: "purchase", createSchema: PurchaseCreate, updateSchema: PurchaseCreate.partial(),
  searchFields: ["species"], orderBy: { date: "desc" },
});

export const exportsRouter = buildCrudRouter({
  model: "export", createSchema: ExportCreate, updateSchema: ExportCreate.partial(),
  searchFields: ["reference", "country", "customer", "product"],
});

export const maintenanceRouter = buildCrudRouter({
  model: "maintenance", createSchema: MaintenanceCreate, updateSchema: MaintenanceCreate.partial(),
  searchFields: ["description"], orderBy: { performedAt: "desc" },
});
