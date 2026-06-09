import { createFileRoute, useNavigate } from "@tanstack/react-router";
import toast from "react-hot-toast";
import { PageHeader } from "@/components/common/PageHeader";
import { ResourceForm } from "@/components/forms/ResourceForm";
import { useResourceMutations } from "@/hooks/useResource";

export const Route = createFileRoute("/_app/catches/new")({ component: NewCatch });

function NewCatch() {
  const navigate = useNavigate();
  const { create } = useResourceMutations("catches");
  return (
    <>
      <PageHeader title="Nouvelle capture" />
      <ResourceForm
        title="Détails de la capture"
        fields={[
          { name: "fishType", label: "Espèce", required: true },
          { name: "weightKg", label: "Poids (kg)", type: "number", required: true },
          { name: "quantity", label: "Quantité", type: "number" },
          { name: "zone", label: "Zone" },
          { name: "boatId", label: "ID Bateau" },
          { name: "fishermanId", label: "ID Pêcheur" },
          { name: "date", label: "Date", type: "datetime-local" },
        ]}
        submitting={create.isPending}
        onSubmit={(values) => create.mutate(values, {
          onSuccess: () => { toast.success("Capture enregistrée"); navigate({ to: "/catches" }); },
        })}
      />
    </>
  );
}
