import { createFileRoute } from "@tanstack/react-router";
import { FiActivity, FiAnchor, FiBox, FiDollarSign, FiTrendingUp, FiUsers, FiZap } from "react-icons/fi";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/common/Card";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/common/Button";
import { AreaTrend } from "@/components/charts/AreaTrend";
import { BarSeries } from "@/components/charts/BarSeries";
import { Badge } from "@/components/common/Badge";

export const Route = createFileRoute("/_app/dashboard")({
  component: DashboardPage,
});

const catchData = [
  { name: "Lun", value: 1240 }, { name: "Mar", value: 1480 }, { name: "Mer", value: 980 },
  { name: "Jeu", value: 1620 }, { name: "Ven", value: 1850 }, { name: "Sam", value: 2100 }, { name: "Dim", value: 1740 },
];
const revenueData = [
  { name: "Jan", value: 24000 }, { name: "Fév", value: 27500 }, { name: "Mar", value: 31200 },
  { name: "Avr", value: 28800 }, { name: "Mai", value: 35600 }, { name: "Juin", value: 41800 },
];

function DashboardPage() {
  return (
    <>
      <PageHeader
        title="Cockpit opérationnel"
        description="Vue d'ensemble de vos performances halieutiques et indicateurs clés."
        actions={
          <>
            <Button variant="outline">Exporter</Button>
            <Button variant="accent"><FiZap /> SmartFish AI</Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Pêcheurs actifs" value="248" delta={4.2} icon={<FiUsers />} accent="primary" />
        <KpiCard label="Bateaux en mer" value="36" delta={-1.5} icon={<FiAnchor />} accent="accent" />
        <KpiCard label="Captures (kg)" value="12 480" delta={8.6} icon={<FiActivity />} accent="success" />
        <KpiCard label="Stock disponible" value="48 720" delta={2.1} icon={<FiBox />} accent="warning" />
        <KpiCard label="CA du mois" value="€ 41 800" delta={17.2} icon={<FiDollarSign />} accent="success" />
        <KpiCard label="Marge brute" value="32%" delta={3.4} icon={<FiTrendingUp />} accent="accent" />
        <KpiCard label="Alertes" value="4" delta={-50} icon={<FiZap />} accent="danger" />
        <KpiCard label="SmartFish Index" value="87/100" delta={5.3} icon={<FiZap />} accent="primary" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle>Évolution des captures</CardTitle>
                <CardDescription>7 derniers jours · en kg</CardDescription>
              </div>
              <Badge tone="success">+12.4%</Badge>
            </div>
          </CardHeader>
          <CardContent><AreaTrend data={catchData} color="var(--accent)" /></CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>AI Insights</CardTitle>
            <CardDescription>Recommandations générées</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { tone: "success" as const, t: "Zone Sud à forte densité", d: "+22% de captures probables" },
              { tone: "warning" as const, t: "Stock thon en alerte", d: "Réapprovisionner sous 48h" },
              { tone: "info" as const, t: "Demande Dorade en hausse", d: "Prix moyen attendu : €8.40/kg" },
            ].map((i) => (
              <div key={i.t} className="rounded-xl border border-border p-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-foreground">{i.t}</p>
                  <Badge tone={i.tone}>AI</Badge>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{i.d}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Revenus mensuels</CardTitle>
            <CardDescription>6 derniers mois · en €</CardDescription>
          </CardHeader>
          <CardContent><BarSeries data={revenueData} color="var(--primary)" /></CardContent>
        </Card>
      </div>
    </>
  );
}
