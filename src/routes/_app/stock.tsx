import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { FiAlertTriangle, FiBox, FiDownload, FiPlus, FiSearch, FiTrendingDown } from "react-icons/fi";
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

export const Route = createFileRoute("/_app/stock")({
  ssr: false,
  component: StockPage,
});

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

  const columns: Column<StockItem>[] = [
    { key: "species", header: "Espèce", render: (r) => <span className="font-medium">{r.species}</span> },
    { key: "category", header: "Catégorie", render: (r) => <Badge tone="info">{r.category}</Badge> },
    { key: "warehouse", header: "Entrepôt" },
    {
      key: "quantityKg",
      header: "Quantité",
      render: (r) => (
        <div className="flex items-center gap-2">
          <span className="font-mono">{r.quantityKg.toLocaleString()} kg</span>
          {r.quantityKg < r.threshold && <Badge tone="danger"><FiAlertTriangle className="h-3 w-3" /> Bas</Badge>}
        </div>
      ),
    },
    { key: "threshold", header: "Seuil", render: (r) => <span className="text-muted-foreground">{r.threshold} kg</span> },
    { key: "unitPrice", header: "Prix unité", render: (r) => `${r.unitPrice.toLocaleString()} XOF` },
    {
      key: "valuation",
      header: "Valorisation",
      render: (r) => <span className="font-semibold">{(r.quantityKg * r.unitPrice).toLocaleString()} XOF</span>,
    },
  ];

  return (
    <>
      <PageHeader
        title="Gestion des stocks"
        description="Suivi temps réel des inventaires, seuils d'alerte et valorisation."
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
