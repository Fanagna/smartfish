import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../lib/prisma";
import { asyncHandler } from "../../utils/asyncHandler";
import { validate } from "../../middleware/validate";
import { requireAuth } from "../../middleware/auth";
import { geminiGenerate, geminiJson } from "../../lib/gemini";

export const aiRouter = Router();
aiRouter.use(requireAuth);

const SYSTEM = `Tu es SmartFish Decision AI, copilote décisionnel d'une société halieutique (SOGEDIPROMA, Madagascar).
Réponds en français, sois concis, factuel, orienté business halieutique (pêche, flotte, stock, ventes, export).
Lorsque tu reçois des données chiffrées, base tes recommandations dessus.`;

async function snapshot() {
  const [stockCount, lowStock, salesAgg, recentCatches] = await Promise.all([
    prisma.stockItem.count(),
    prisma.stockItem.findMany({ take: 20 }),
    prisma.sale.aggregate({ _sum: { amount: true }, _count: true, where: { status: "paid" } }),
    prisma.catch.findMany({ take: 20, orderBy: { date: "desc" } }),
  ]);
  return {
    stock: { total: stockCount, lowStock: lowStock.filter((s) => s.quantityKg <= s.thresholdKg).map((s) => ({ name: s.name, qty: s.quantityKg, threshold: s.thresholdKg })) },
    sales: { paid: salesAgg._count, revenue: salesAgg._sum.amount ?? 0 },
    captures: recentCatches.map((c) => ({ fish: c.fishType, kg: c.weightKg, zone: c.zone, date: c.date })),
  };
}

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
  const snap = await snapshot();
  const data = await geminiJson<{ recommendations: Array<{ title: string; impact: string; confidence: number; tone?: string }> }>(
    `Voici l'état actuel de l'entreprise (JSON) :\n${JSON.stringify(snap)}\n\nProduis 4 recommandations stratégiques au format JSON :
{"recommendations":[{"title":"...","impact":"...","confidence":0.0-1.0,"tone":"success|warning|info|danger"}]}`,
    { system: SYSTEM, temperature: 0.6 },
  );
  res.json(data.recommendations ?? data);
}));

const chatSchema = z.object({
  message: z.string().min(1).max(2000),
  history: z.array(z.object({ role: z.enum(["user", "model"]), content: z.string() })).max(20).optional(),
});

aiRouter.post("/chat", validate(chatSchema), asyncHandler(async (req, res) => {
  const { message, history } = req.body as z.infer<typeof chatSchema>;
  const snap = await snapshot();
  const historyText = (history ?? []).map((h) => `${h.role === "user" ? "User" : "Assistant"}: ${h.content}`).join("\n");
  const prompt = `Contexte entreprise (JSON live) :\n${JSON.stringify(snap)}\n\n${historyText ? `Historique:\n${historyText}\n\n` : ""}Question: ${message}`;
  const reply = await geminiGenerate(prompt, { system: SYSTEM, temperature: 0.5 });
  res.json({ reply, timestamp: new Date().toISOString() });
}));

aiRouter.post("/analyze", asyncHandler(async (_req, res) => {
  const snap = await snapshot();
  const analysis = await geminiGenerate(
    `Analyse holistique de l'activité halieutique. Données (JSON) :\n${JSON.stringify(snap)}\n\nProduis :\n1) Tendances clés\n2) Opportunités\n3) Risques\n4) Top 3 actions prioritaires`,
    { system: SYSTEM },
  );
  res.json({ analysis, generatedAt: new Date().toISOString() });
}));
