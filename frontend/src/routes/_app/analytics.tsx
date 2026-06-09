import { createFileRoute } from "@tanstack/react-router";
import { FiDownload, FiFileText, FiTrendingUp } from "react-icons/fi";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { Badge } from "@/components/common/Badge";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { AreaTrend } from "@/components/charts/AreaTrend";
import { BarSeries } from "@/components/charts/BarSeries";
import { PieDonut } from "@/components/charts/PieDonut";
import { monthlyRevenue, speciesDistribution, channelMix, forecastDemand } from "@/lib/mock/operations";

export const Route = createFileRoute("/_app/analytics")({
  ssr: false,
  component: AnalyticsPage,
});

function AnalyticsPage() {
  return (
    <>
      <PageHeader
        title="Analytics exécutif"
        description="Tableau de bord stratégique multi-dimensions."
        actions={
          <>
            <Button variant="outline"><FiFileText /> Rapport PDF</Button>
            <Button variant="accent"><FiDownload /> Export Excel</Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Croissance YoY" value="+38%" delta={38} icon={<FiTrendingUp />} accent="success" />
        <KpiCard label="Volume annuel" value="148 t" delta={12.2} icon={<FiTrendingUp />} accent="primary" />
        <KpiCard label="Prix moyen / kg" value="2 850 XOF" delta={4.1} icon={<FiTrendingUp />} accent="accent" />
        <KpiCard label="NPS clients" value="64" delta={9} icon={<FiTrendingUp />} accent="success" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Évolution du revenu</CardTitle>
            <CardDescription>Tendance 12 mois</CardDescription>
          </CardHeader>
          <CardContent><AreaTrend data={monthlyRevenue} /></CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Prévision de la demande</CardTitle>
            <CardDescription>14 prochains jours (IA)</CardDescription>
          </CardHeader>
          <CardContent><AreaTrend data={forecastDemand} color="var(--success)" /></CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Top espèces</CardTitle>
            <CardDescription>Quantités vendues</CardDescription>
          </CardHeader>
          <CardContent><BarSeries data={speciesDistribution} /></CardContent>
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
          <CardTitle>Synthèse stratégique</CardTitle>
          <CardDescription>Lecture exécutive automatisée</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {[
            { tone: "success" as const, text: "Le segment Export progresse de +28% — opportunité de renforcer la logistique froide." },
            { tone: "warning" as const, text: "Le stock Sardine est en baisse de 14% — réapprovisionner sous 5 jours pour éviter rupture." },
            { tone: "info" as const, text: "La marge brute s'améliore (+3,4 pts) grâce à un meilleur mix produit." },
            { tone: "danger" as const, text: "2 bateaux ont une rotation < à la moyenne flotte — diagnostic recommandé." },
          ].map((row, i) => (
            <div key={i} className="flex items-start gap-3 rounded-xl border border-border bg-muted/30 p-3">
              <Badge tone={row.tone}>Insight</Badge>
              <p className="text-foreground/90">{row.text}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </>
  );
}
