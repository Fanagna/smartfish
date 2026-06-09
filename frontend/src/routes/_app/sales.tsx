import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { FiDollarSign, FiDownload, FiPlus, FiSearch, FiShoppingCart, FiTrendingUp, FiUsers } from "react-icons/fi";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { Badge } from "@/components/common/Badge";
import { DataTable, type Column } from "@/components/common/DataTable";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { AreaTrend } from "@/components/charts/AreaTrend";
import { PieDonut } from "@/components/charts/PieDonut";
import { mockSales, monthlyRevenue, channelMix, type Sale } from "@/lib/mock/operations";

export const Route = createFileRoute("/_app/sales")({
  ssr: false,
  component: SalesPage,
});

function statusTone(s: Sale["status"]) {
  return s === "Payée" ? "success" : s === "En attente" ? "warning" : "danger";
}

function SalesPage() {
  const [search, setSearch] = useState("");
  const filtered = useMemo(
    () => mockSales.filter((s) => `${s.reference} ${s.client}`.toLowerCase().includes(search.toLowerCase())),
    [search],
  );
  const total = mockSales.reduce((a, b) => a + (b.status !== "Annulée" ? b.amount : 0), 0);
  const paid = mockSales.filter((s) => s.status === "Payée").reduce((a, b) => a + b.amount, 0);
  const pending = mockSales.filter((s) => s.status === "En attente").reduce((a, b) => a + b.amount, 0);

  const columns: Column<Sale>[] = [
    { key: "reference", header: "Référence", render: (r) => <span className="font-mono text-xs">{r.reference}</span> },
    { key: "client", header: "Client", render: (r) => <span className="font-medium">{r.client}</span> },
    { key: "channel", header: "Canal", render: (r) => <Badge tone="info">{r.channel}</Badge> },
    { key: "items", header: "Articles" },
    { key: "amount", header: "Montant", render: (r) => <span className="font-semibold">{r.amount.toLocaleString()} XOF</span> },
    { key: "status", header: "Statut", render: (r) => <Badge tone={statusTone(r.status)}>{r.status}</Badge> },
    { key: "date", header: "Date", render: (r) => new Date(r.date).toLocaleDateString("fr-FR") },
  ];

  return (
    <>
      <PageHeader
        title="Ventes & Facturation"
        description="Pilotez votre cycle de vente et votre encaissement."
        actions={
          <>
            <Button variant="outline"><FiDownload /> Exporter</Button>
            <Button variant="accent"><FiPlus /> Nouvelle vente</Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="CA total" value={`${(total / 1_000_000).toFixed(1)} M`} delta={12.4} icon={<FiDollarSign />} accent="success" />
        <KpiCard label="Encaissé" value={`${(paid / 1_000_000).toFixed(1)} M`} delta={9.1} icon={<FiTrendingUp />} accent="primary" />
        <KpiCard label="En attente" value={`${(pending / 1_000).toFixed(0)} k`} delta={-4.2} icon={<FiShoppingCart />} accent="warning" />
        <KpiCard label="Clients actifs" value="42" delta={6.8} icon={<FiUsers />} accent="accent" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Revenu mensuel</CardTitle>
            <CardDescription>12 derniers mois</CardDescription>
          </CardHeader>
          <CardContent><AreaTrend data={monthlyRevenue} /></CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Mix canaux</CardTitle>
            <CardDescription>Part du CA</CardDescription>
          </CardHeader>
          <CardContent><PieDonut data={channelMix} /></CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle>Transactions</CardTitle>
              <CardDescription>{filtered.length} ventes</CardDescription>
            </div>
            <div className="w-full max-w-xs">
              <Input placeholder="Rechercher référence, client…" leftIcon={<FiSearch />} value={search} onChange={(e) => setSearch(e.target.value)} />
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
