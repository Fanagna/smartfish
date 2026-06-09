import { createFileRoute } from "@tanstack/react-router";
import { Badge } from "@/components/common/Badge";
import { SimpleResourcePage } from "@/components/common/SimpleResourcePage";

export const Route = createFileRoute("/_app/fleet")({ component: FleetPage });

interface MaintenanceRow {
  id: string; boatId: string;
  type: "routine" | "repair" | "inspection" | "emergency";
  description: string; cost: number; performedAt: string; nextDueAt?: string;
}

const tones = { routine: "info", repair: "warning", inspection: "muted", emergency: "danger" } as const;

function FleetPage() {
  return (
    <SimpleResourcePage<MaintenanceRow>
      title="Maintenance de la flotte"
      description="Journal d'entretien, réparations et inspections des bateaux."
      resource="maintenance"
      searchPlaceholder="Description…"
      columns={[
        { key: "type", header: "Type", render: (r) => <Badge tone={tones[r.type]}>{r.type}</Badge> },
        { key: "description", header: "Description", render: (r) => <span className="line-clamp-1">{r.description}</span> },
        { key: "boatId", header: "Bateau", render: (r) => <span className="font-mono text-xs">{r.boatId.slice(0, 8)}</span> },
        { key: "cost", header: "Coût", render: (r) => `${r.cost.toLocaleString()} EUR` },
        { key: "performedAt", header: "Réalisée", render: (r) => new Date(r.performedAt).toLocaleDateString() },
        { key: "nextDueAt", header: "Prochaine", render: (r) => r.nextDueAt ? new Date(r.nextDueAt).toLocaleDateString() : "—" },
      ]}
      fields={[
        { name: "boatId", label: "ID Bateau", required: true, placeholder: "cuid du bateau" },
        { name: "type", label: "Type", type: "select", required: true, options: [
          { value: "routine", label: "Routine" },
          { value: "repair", label: "Réparation" },
          { value: "inspection", label: "Inspection" },
          { value: "emergency", label: "Urgence" },
        ] },
        { name: "description", label: "Description", required: true },
        { name: "cost", label: "Coût (EUR)", type: "number" },
        { name: "performedAt", label: "Date réalisée", type: "date" },
        { name: "nextDueAt", label: "Prochaine échéance", type: "date" },
      ]}
    />
  );
}
