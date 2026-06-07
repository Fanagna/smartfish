import { Router } from "express";
import { prisma } from "../../lib/prisma";
import { asyncHandler } from "../../utils/asyncHandler";
import { requireAuth } from "../../middleware/auth";
import { geminiJson, geminiGenerate } from "../../lib/gemini";

export const stockIntelligenceRouter = Router();
stockIntelligenceRouter.use(requireAuth);

const SYSTEM = `Tu es l'IA de pilotage de stock halieutique de SOGEDIPROMA.
Objectif: détecter ruptures/surstocks, recommander achats/arrêts d'achat, et arbitrer entre vente locale et export.
Réponds toujours en JSON strict conforme au schéma demandé. Pas de texte hors JSON.`;

stockIntelligenceRouter.get("/overview", asyncHandler(async (_req, res) => {
  const items = await prisma.stockItem.findMany();
  const ruptures = items.filter((i) => i.quantityKg <= i.thresholdKg);
  const surstock = items.filter((i) => i.quantityKg > i.thresholdKg * 4);
  const valuation = items.reduce((s, i) => s + i.quantityKg * i.unitPrice, 0);

  const payload = items.map((i) => ({
    sku: i.sku,
    name: i.name,
    species: i.species,
    quantityKg: i.quantityKg,
    thresholdKg: i.thresholdKg,
    unitPrice: i.unitPrice,
    warehouse: i.warehouse,
  }));

  const ai = await geminiJson<{
    decisions: Array<{ sku: string; action: "BUY_NOW" | "STOP_BUYING" | "EXPORT_PRIORITY" | "SELL_LOCAL" | "HOLD"; reason: string; priority: 1 | 2 | 3; confidence: number }>;
    summary: string;
  }>(
    `Stock actuel (JSON) :\n${JSON.stringify(payload)}\n\nRetourne :
{
  "summary": "résumé exécutif 2 phrases",
  "decisions": [{"sku":"...","action":"BUY_NOW|STOP_BUYING|EXPORT_PRIORITY|SELL_LOCAL|HOLD","reason":"...","priority":1,"confidence":0.0-1.0}]
}`,
    { system: SYSTEM, temperature: 0.3 },
  );

  res.json({
    metrics: {
      itemCount: items.length,
      ruptures: ruptures.length,
      surstock: surstock.length,
      valuation: Math.round(valuation),
    },
    alerts: {
      ruptures: ruptures.map((i) => ({ sku: i.sku, name: i.name, qty: i.quantityKg, threshold: i.thresholdKg })),
      surstock: surstock.map((i) => ({ sku: i.sku, name: i.name, qty: i.quantityKg, threshold: i.thresholdKg })),
    },
    ai,
  });
}));

stockIntelligenceRouter.get("/profitability", asyncHandler(async (_req, res) => {
  const items = await prisma.stockItem.findMany();
  const ranked = items
    .map((i) => ({
      sku: i.sku,
      name: i.name,
      species: i.species,
      stockValue: i.quantityKg * i.unitPrice,
      margin: i.unitPrice * 0.35, // placeholder marge unitaire
    }))
    .sort((a, b) => b.margin - a.margin);

  const insight = await geminiGenerate(
    `Voici la rentabilité estimée par produit (JSON) :\n${JSON.stringify(ranked.slice(0, 10))}\n\nDonne en français un commentaire stratégique court (4-6 lignes) sur quels produits prioriser, lesquels réduire, et pourquoi.`,
    { system: "Tu es un analyste financier halieutique. Réponse courte et actionnable.", temperature: 0.4 },
  );

  res.json({ ranked, insight });
}));
