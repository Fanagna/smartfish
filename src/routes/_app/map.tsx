import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { FiMap, FiTarget } from "react-icons/fi";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/common/Card";
import { Badge } from "@/components/common/Badge";
import { catchesService, type Catch } from "@/lib/services/resource.service";

export const Route = createFileRoute("/_app/map")({
  ssr: false,
  component: MapPage,
});

// Madagascar fishing zones (illustrative)
const ZONES = [
  { name: "Côte Nord-Ouest (Mahajanga)", lat: -15.7, lng: 46.3, priority: "high", reason: "Eaux riches, saison favorable" },
  { name: "Canal du Mozambique", lat: -19.0, lng: 43.5, priority: "high", reason: "Thon, dorade — forte demande export" },
  { name: "Côte Est (Toamasina)", lat: -18.1, lng: 49.4, priority: "medium", reason: "Crevettes, langoustes" },
  { name: "Sud (Tuléar)", lat: -23.3, lng: 43.7, priority: "medium", reason: "Pêche artisanale" },
  { name: "Banc de Pracel", lat: -12.5, lng: 47.5, priority: "avoid", reason: "Risque surpêche détecté" },
];

const tones: Record<string, "success" | "warning" | "danger"> = {
  high: "success", medium: "warning", avoid: "danger",
};
const labels: Record<string, string> = { high: "Prioritaire", medium: "Stable", avoid: "À éviter" };

function MapPage() {
  const [ready, setReady] = useState(false);
  const [MapMods, setMapMods] = useState<any>(null);

  const { data: catches } = useQuery({
    queryKey: ["catches", "all-for-map"],
    queryFn: () => catchesService.list({ pageSize: 100 }).catch(() => ({ data: [] as Catch[], total: 0, page: 1, pageSize: 100 })),
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      // @ts-ignore - vite dynamic import css
      await import("leaflet/dist/leaflet.css");
      const L = await import("leaflet");
      const rl = await import("react-leaflet");

      // Fix default icon paths
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      if (!cancelled) {
        setMapMods({ L, ...rl });
        setReady(true);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return (
    <>
      <PageHeader
        title="Carte des zones de pêche"
        description="Recommandations IA, heatmap des captures et zones prioritaires."
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2 overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><FiMap className="text-accent" /> Madagascar — zones halieutiques</CardTitle>
            <CardDescription>Marqueurs : zones recommandées par l'IA · cercles : captures récentes</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="h-[520px] w-full">
              {ready && MapMods ? (
                <MapMods.MapContainer center={[-18.8, 46.5]} zoom={6} style={{ height: "100%", width: "100%" }}>
                  <MapMods.TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; OpenStreetMap'
                  />
                  {ZONES.map((z) => (
                    <MapMods.Marker key={z.name} position={[z.lat, z.lng]}>
                      <MapMods.Popup>
                        <strong>{z.name}</strong><br />
                        <em>{labels[z.priority]}</em><br />
                        {z.reason}
                      </MapMods.Popup>
                    </MapMods.Marker>
                  ))}
                  {(catches?.data ?? []).filter((c: any) => c.lat && c.lng).map((c: any) => (
                    <MapMods.CircleMarker
                      key={c.id}
                      center={[c.lat, c.lng]}
                      radius={Math.min(20, Math.max(4, Math.sqrt(c.weightKg)))}
                      pathOptions={{ color: "#06b6d4", fillOpacity: 0.4 }}
                    >
                      <MapMods.Popup>{c.fishType} — {c.weightKg} kg</MapMods.Popup>
                    </MapMods.CircleMarker>
                  ))}
                </MapMods.MapContainer>
              ) : (
                <div className="grid h-full w-full place-items-center text-muted-foreground">Chargement de la carte…</div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><FiTarget className="text-accent" /> Recommandations IA zones</CardTitle>
            <CardDescription>Basées sur historique, saison et météo</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {ZONES.map((z) => (
              <div key={z.name} className="rounded-xl border border-border p-3">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-semibold text-sm">{z.name}</p>
                  <Badge tone={tones[z.priority]}>{labels[z.priority]}</Badge>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{z.reason}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
