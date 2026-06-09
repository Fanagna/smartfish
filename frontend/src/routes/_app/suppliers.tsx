import { createFileRoute } from "@tanstack/react-router";
import { SimpleResourcePage } from "@/components/common/SimpleResourcePage";

export const Route = createFileRoute("/_app/suppliers")({ component: SuppliersPage });

interface Supplier { id: string; name: string; contact?: string; phone?: string; email?: string; region?: string; rating?: number; }

function SuppliersPage() {
  return (
    <SimpleResourcePage<Supplier>
      title="Fournisseurs / Pêcheurs partenaires"
      description="Réseau d'approvisionnement local pour l'achat halieutique."
      resource="suppliers"
      searchPlaceholder="Nom, région, contact…"
      columns={[
        { key: "name", header: "Nom", render: (r) => <span className="font-medium">{r.name}</span> },
        { key: "contact", header: "Contact" },
        { key: "phone", header: "Téléphone" },
        { key: "region", header: "Région" },
        { key: "rating", header: "Note", render: (r) => `${(r.rating ?? 0).toFixed(1)} / 5` },
      ]}
      fields={[
        { name: "name", label: "Nom", required: true },
        { name: "contact", label: "Personne de contact" },
        { name: "phone", label: "Téléphone" },
        { name: "email", label: "Email", type: "email" },
        { name: "region", label: "Région" },
        { name: "rating", label: "Note (0-5)", type: "number" },
      ]}
    />
  );
}
