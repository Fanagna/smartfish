import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../lib/prisma";
import { asyncHandler } from "../../utils/asyncHandler";
import { validate } from "../../middleware/validate";
import { requireAuth } from "../../middleware/auth";

export const aiRouter = Router();
aiRouter.use(requireAuth);

/**
 * Lightweight predictive endpoints. Uses naive moving-average on historical
 * catches/sales as a placeholder for a real ML pipeline.
 */
aiRouter.get("/forecast", asyncHandler(async (_req, res) => {
  const sales = await prisma.$queryRaw<Array<{ d: Date; total: number }>>`
    SELECT date_trunc('day', "issuedAt") AS d, COALESCE(SUM(amount), 0)::float AS total
    FROM "Sale" WHERE "issuedAt" > NOW() - INTERVAL '30 days'
    GROUP BY 1 ORDER BY 1 ASC
  `;
  const avg = sales.length ? sales.reduce((s, r) => s + Number(r.total), 0) / sales.length : 0;
  const forecast = Array.from({ length: 14 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i + 1);
    const seasonal = 1 + Math.sin(i / 3) * 0.1;
    return { date: d.toISOString().slice(0, 10), predicted: Math.round(avg * seasonal * 100) / 100 };
  });
  res.json({ baseline: avg, horizonDays: 14, forecast });
}));

aiRouter.get("/recommendations", asyncHandler(async (_req, res) => {
  const lowStock = await prisma.stockItem.findMany({
    where: { quantityKg: { lte: prisma.stockItem.fields.thresholdKg } },
    take: 5,
  });
  const recs: Array<{ id: string; title: string; impact: string; confidence: number }> = [];
  lowStock.forEach((s, i) =>
    recs.push({
      id: `restock-${s.id}`,
      title: `Réapprovisionner ${s.name} (entrepôt ${s.warehouse ?? "—"})`,
      impact: "Évite rupture sous 5 jours",
      confidence: 0.85 - i * 0.05,
    }),
  );
  recs.push({
    id: "channel-mix",
    title: "Augmenter de 12% les ventes export sur le segment thon",
    impact: "+8% marge brute projetée",
    confidence: 0.78,
  });
  res.json(recs);
}));

const chatSchema = z.object({ message: z.string().min(1).max(2000) });

aiRouter.post("/chat", validate(chatSchema), asyncHandler(async (req, res) => {
  const msg = (req.body.message as string).toLowerCase();
  let reply = "Je suis l'assistant SmartFish. Pose-moi une question sur tes stocks, ventes ou captures.";
  if (msg.includes("stock")) {
    const c = await prisma.stockItem.count();
    reply = `Tu as ${c} références en stock. Tape "alerte" pour voir celles sous seuil.`;
  } else if (msg.includes("alerte")) {
    const items = await prisma.stockItem.findMany({ take: 5 });
    const low = items.filter((i) => i.quantityKg <= i.thresholdKg);
    reply = low.length ? `${low.length} produits sous seuil : ${low.map((i) => i.name).join(", ")}` : "Aucune alerte de stock active.";
  } else if (msg.includes("vente") || msg.includes("ca")) {
    const agg = await prisma.sale.aggregate({ where: { status: "paid" }, _sum: { amount: true } });
    reply = `Chiffre d'affaires encaissé : ${(agg._sum.amount ?? 0).toLocaleString()} EUR.`;
  }
  res.json({ reply, timestamp: new Date().toISOString() });
}));
