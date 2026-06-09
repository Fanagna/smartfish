import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { FiAlertTriangle, FiBox, FiCpu, FiDownload, FiPlus, FiSearch, FiTrendingDown, FiTrendingUp } from "react-icons/fi";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { Badge } from "@/components/common/Badge";
import { DataTable, type Column } from "@/components/common/DataTable";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { BarSeries } from "@/components/charts/BarSeries";
import { PieDonut } from "@/components/charts/PieDonut";
import { mockStock, speciesDistribution, type StockItem } from "@/lib/mock/operations";
import { stockIntelligenceService, type StockDecision } from "@/lib/services/ai.service";

export const Route = createFileRoute("/_app/stock")({
  ssr: false,
  component: StockPage,
});

const actionTones: Record<StockDecision["action"], "success" | "warning" | "info" | "danger" | "muted"> = {
  BUY_NOW: "success",
  STOP_BUYING: "danger",
  EXPORT_PRIORITY: "info",
  SELL_LOCAL: "warning",
  HOLD: "muted",
};

const actionLabels: Record<StockDecision["action"], string> = {
  BUY_NOW: "ACHETER",
  STOP_BUYING: "STOP ACHAT",
  EXPORT_PRIORITY: "EXPORT PRIO.",
  SELL_LOCAL: "VENTE LOCALE",
  HOLD: "MAINTENIR",
};

function StockPage() {
  const [search, setSearch] = useState("");
  const filtered = useMemo(
    () => mockStock.filter((s) => s.species.toLowerCase().includes(search.toLowerCase()) || s.warehouse.toLowerCase().includes(search.toLowerCase())),
    [search],
  );
  const alerts = mockStock.filter((s) => s.quantityKg < s.threshold);
  const totalKg = mockStock.reduce((a, b) => a + b.quantityKg, 0);
  const totalValue = mockStock.reduce((a, b) => a + b.quantityKg * b.unitPrice, 0);

  const byWarehouse = Object.entries(
    mockStock.reduce<Record<string, number>>((acc, s) => {
      acc[s.warehouse] = (acc[s.warehouse] || 0) + s.quantityKg;
      return acc;
    }, {}),
  ).map(([name, value]) => ({ name, value }));

  const { data: ai, isLoading: aiLoading } = useQuery({
    queryKey: ["stock-intelligence"],
    queryFn: () => stockIntelligenceService.overview(),
    retry: false,
    staleTime: 5 * 60_000,
  });

  const columns: Column<StockItem>[] = [
    { key: "species", header: "Espèce", render: (r) => <span className="font-medium">{r.species}</span> },
    { key: "category", header: "Catégorie", render: (r) => <Badge tone="info">{r.category}</Badge> },
    { key: "warehouse", header: "Entrepôt" },
    {
      key: "quantityKg", header: "Quantité",
      render: (r) => (
        <div className="flex items-center gap-2">
          <span className="font-mono">{r.quantityKg.toLocaleString()} kg</span>
          {r.quantityKg < r.threshold && <Badge tone="danger"><FiAlertTriangle className="h-3 w-3" /> Bas</Badge>}
        </div>
      ),
    },
    { key: "threshold", header: "Seuil", render: (r) => <span className="text-muted-foreground">{r.threshold} kg</span> },
    { key: "unitPrice", header: "Prix unité", render: (r) => `${r.unitPrice.toLocaleString()} XOF` },
    { key: "valuation", header: "Valorisation", render: (r) => <span className="font-semibold">{(r.quantityKg * r.unitPrice).toLocaleString()} XOF</span> },
  ];

  return (
    <>
      <PageHeader
        title="Gestion intelligente des stocks"
        description="Inventaires, valorisation, alertes IA et décisions automatiques."
        actions={
          <>
            <Button variant="outline"><FiDownload /> Exporter</Button>
            <Button variant="accent"><FiPlus /> Entrée stock</Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Stock total" value={`${totalKg.toLocaleString()} kg`} delta={2.4} icon={<FiBox />} accent="primary" />
        <KpiCard label="Valorisation" value={`${(totalValue / 1_000_000).toFixed(1)} M XOF`} delta={5.1} icon={<FiBox />} accent="success" />
        <KpiCard label="Alertes seuil" value={String(alerts.length)} delta={-12} icon={<FiAlertTriangle />} accent="danger" />
        <KpiCard label="Rotation" value="6.2j" delta={-3.2} icon={<FiTrendingDown />} accent="accent" />
      </div>

      {/* SmartFish AI — Pilotage stock */}
      <Card className="mt-6 border-accent/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FiCpu className="text-accent" /> Pilotage IA du stock
          </CardTitle>
          <CardDescription>
            {ai?.ai?.summary ?? (aiLoading ? "Analyse en cours…" : "Connectez le backend (GEMINI_API_KEY) pour activer les décisions IA en temps réel.")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {ai?.ai?.decisions?.length ? (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
              {ai.ai.decisions.slice(0, 6).map((d, i) => (
                <motion.div
                  key={d.sku + i}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="rounded-xl border border-border bg-card p-4"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs text-muted-foreground">{d.sku}</span>
                    <Badge tone={actionTones[d.action]}>{actionLabels[d.action]}</Badge>
                  </div>
                  <p className="mt-2 text-sm">{d.reason}</p>
                  <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                    <span>Priorité {d.priority}</span>
                    <span className="flex items-center gap-1"><FiTrendingUp className="h-3 w-3" /> {(d.confidence * 100).toFixed(0)}%</span>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
              Aucune décision IA disponible pour le moment.
            </div>
          )}
        </CardContent>
      </Card>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Stock par entrepôt</CardTitle>
            <CardDescription>Quantités cumulées (kg)</CardDescription>
          </CardHeader>
          <CardContent><BarSeries data={byWarehouse} /></CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Répartition par espèce</CardTitle>
            <CardDescription>Top 6 (kg)</CardDescription>
          </CardHeader>
          <CardContent><PieDonut data={speciesDistribution} /></CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle>Inventaire</CardTitle>
              <CardDescription>{filtered.length} référence(s)</CardDescription>
            </div>
            <div className="w-full max-w-xs">
              <Input placeholder="Rechercher espèce, entrepôt…" leftIcon={<FiSearch />} value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-0">
          <DataTable columns={columns} data={filtered} rowKey={(r) => r.id} />
        </CardContent>
      </Card>
    </>
  );
}
