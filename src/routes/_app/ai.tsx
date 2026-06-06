import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { FiCpu, FiSend, FiTarget, FiTrendingUp, FiZap } from "react-icons/fi";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { Badge } from "@/components/common/Badge";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { AreaTrend } from "@/components/charts/AreaTrend";
import { forecastDemand } from "@/lib/mock/operations";

export const Route = createFileRoute("/_app/ai")({
  ssr: false,
  component: AiPage,
});

interface Message { role: "user" | "ai"; content: string; }

const RECOMMENDATIONS = [
  { title: "Augmenter la pêche de Thon rouge", impact: "+18% revenu projeté", confidence: 92, tone: "success" as const },
  { title: "Réduire les sorties Zone Nord (météo)", impact: "Économie 320k XOF", confidence: 85, tone: "warning" as const },
  { title: "Réapprovisionner stock Sardine sous 5j", impact: "Évite rupture client Export", confidence: 96, tone: "info" as const },
  { title: "Renégocier le tarif Restaurant 'Le Lagon'", impact: "+4 pts marge", confidence: 71, tone: "info" as const },
];

const AI_RESPONSES: Record<string, string> = {
  default: "D'après vos données, je recommande de prioriser la pêche au Thon rouge cette semaine (demande +22%, prix +8%). Les zones Sud sont les plus favorables d'après le modèle météo et historique.",
  stock: "Votre stock de Sardine est sous le seuil (180kg < 300kg). Je recommande un réapprovisionnement immédiat. Demande projetée : 950kg sur 7j.",
  ventes: "Vos ventes Export progressent de +28% YoY. Je suggère d'allouer 2 bateaux supplémentaires à cette filière pour saisir l'opportunité.",
};

function AiPage() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "ai", content: "Bonjour ! Je suis SmartFish AI, votre copilote décisionnel. Posez-moi une question sur vos stocks, ventes, captures ou prévisions." },
  ]);
  const [input, setInput] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const send = () => {
    const text = input.trim();
    if (!text) return;
    setMessages((m) => [...m, { role: "user", content: text }]);
    setInput("");
    setTimeout(() => {
      const key = text.toLowerCase().includes("stock") ? "stock" : text.toLowerCase().includes("vente") ? "ventes" : "default";
      setMessages((m) => [...m, { role: "ai", content: AI_RESPONSES[key] }]);
    }, 700);
  };

  return (
    <>
      <PageHeader
        title="SmartFish AI"
        description="Prévisions, recommandations et copilote conversationnel."
        actions={<Button variant="accent"><FiZap /> Entraîner le modèle</Button>}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Précision modèle" value="94.2%" delta={2.1} icon={<FiTarget />} accent="success" />
        <KpiCard label="Prévisions / mois" value="1 280" delta={18} icon={<FiCpu />} accent="primary" />
        <KpiCard label="Recommandations" value="42" delta={9.4} icon={<FiZap />} accent="accent" />
        <KpiCard label="ROI moyen" value="+22%" delta={5.1} icon={<FiTrendingUp />} accent="success" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Prévision de la demande</CardTitle>
            <CardDescription>Modèle ARIMA + facteurs météo & saisonnalité — 14 prochains jours</CardDescription>
          </CardHeader>
          <CardContent><AreaTrend data={forecastDemand} color="var(--accent)" /></CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><FiCpu className="text-accent" /> Assistant IA</CardTitle>
            <CardDescription>Conversationnel — démo</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col gap-2 px-4 pb-4">
            <div className="flex-1 space-y-2 overflow-y-auto rounded-xl border border-border bg-muted/30 p-3" style={{ maxHeight: 320 }}>
              {messages.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${m.role === "user" ? "bg-accent text-accent-foreground" : "bg-card border border-border"}`}>
                    {m.content}
                  </div>
                </motion.div>
              ))}
              <div ref={endRef} />
            </div>
            <div className="flex items-center gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
                placeholder="Posez une question…"
                className="h-10 flex-1 rounded-lg border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
              <Button variant="accent" size="icon" onClick={send}><FiSend /></Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Recommandations stratégiques</CardTitle>
          <CardDescription>Générées par SmartFish AI à partir de vos données opérationnelles</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {RECOMMENDATIONS.map((r, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-xl border border-border bg-card p-4"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="font-semibold">{r.title}</p>
                <Badge tone={r.tone}>{r.confidence}% conf.</Badge>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{r.impact}</p>
              <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div className="h-full gradient-accent" style={{ width: `${r.confidence}%` }} />
              </div>
              <div className="mt-3 flex justify-end gap-2">
                <Button variant="ghost" size="sm">Ignorer</Button>
                <Button variant="accent" size="sm">Appliquer</Button>
              </div>
            </motion.div>
          ))}
        </CardContent>
      </Card>
    </>
  );
}
