import { createFileRoute } from "@tanstack/react-router";
import { SimpleResourcePage } from "@/components/common/SimpleResourcePage";

export const Route = createFileRoute("/_app/purchases")({ component: PurchasesPage });

interface Purchase { id: string; supplierId: string; species: string; quantityKg: number; unitPrice: number; total: number; date: string; }

function PurchasesPage() {
  return (
    <SimpleResourcePage<Purchase>
      title="Achats locaux"
      description="Achats halieutiques auprès des fournisseurs et pêcheurs partenaires."
      resource="purchases"
      searchPlaceholder="Espèce…"
      computeOnSubmit={(v) => ({ ...v, total: Number(v.quantityKg) * Number(v.unitPrice) })}
      columns={[
        { key: "species", header: "Espèce", render: (r) => <span className="font-medium">{r.species}</span> },
        { key: "quantityKg", header: "Qté (kg)", render: (r) => r.quantityKg.toLocaleString() },
        { key: "unitPrice", header: "PU", render: (r) => r.unitPrice.toLocaleString() },
        { key: "total", header: "Total", render: (r) => <span className="font-semibold">{r.total.toLocaleString()}</span> },
        { key: "date", header: "Date", render: (r) => new Date(r.date).toLocaleDateString() },
      ]}
      fields={[
        { name: "supplierId", label: "ID Fournisseur", required: true, placeholder: "cuid du fournisseur" },
        { name: "species", label: "Espèce", required: true },
        { name: "quantityKg", label: "Quantité (kg)", type: "number", required: true },
        { name: "unitPrice", label: "Prix unitaire", type: "number", required: true },
      ]}
    />
  );
}
