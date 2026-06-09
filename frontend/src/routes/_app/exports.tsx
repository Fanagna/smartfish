import { createFileRoute } from "@tanstack/react-router";
import { Badge } from "@/components/common/Badge";
import { SimpleResourcePage } from "@/components/common/SimpleResourcePage";

export const Route = createFileRoute("/_app/exports")({ component: ExportsPage });

interface ExportRow {
  id: string; reference: string; country: string; customer: string; product: string;
  quantityKg: number; amount: number; currency: string;
  status: "preparing" | "shipped" | "delivered" | "cancelled";
}

const tones = { preparing: "info", shipped: "warning", delivered: "success", cancelled: "danger" } as const;

function ExportsPage() {
  return (
    <SimpleResourcePage<ExportRow>
      title="Exportations"
      description="Suivi des expéditions internationales et revenus export."
      resource="exports"
      searchPlaceholder="Référence, pays, client…"
      columns={[
        { key: "reference", header: "Réf.", render: (r) => <span className="font-mono text-sm">{r.reference}</span> },
        { key: "country", header: "Pays" },
        { key: "customer", header: "Client" },
        { key: "product", header: "Produit" },
        { key: "quantityKg", header: "Qté (kg)", render: (r) => r.quantityKg.toLocaleString() },
        { key: "amount", header: "Montant", render: (r) => `${r.amount.toLocaleString()} ${r.currency}` },
        { key: "status", header: "Statut", render: (r) => <Badge tone={tones[r.status]}>{r.status}</Badge> },
      ]}
      fields={[
        { name: "reference", label: "Référence", required: true, placeholder: "EXP-2026-001" },
        { name: "country", label: "Pays destinataire", required: true },
        { name: "customer", label: "Client", required: true },
        { name: "product", label: "Produit", required: true },
        { name: "quantityKg", label: "Quantité (kg)", type: "number", required: true },
        { name: "amount", label: "Montant", type: "number", required: true },
        { name: "currency", label: "Devise", placeholder: "EUR" },
        { name: "status", label: "Statut", type: "select", options: [
          { value: "preparing", label: "En préparation" },
          { value: "shipped", label: "Expédié" },
          { value: "delivered", label: "Livré" },
          { value: "cancelled", label: "Annulé" },
        ] },
      ]}
    />
  );
}
