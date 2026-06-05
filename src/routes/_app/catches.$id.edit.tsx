import { createFileRoute, useNavigate } from "@tanstack/react-router";
import toast from "react-hot-toast";
import { PageHeader } from "@/components/common/PageHeader";
import { ResourceForm } from "@/components/forms/ResourceForm";
import { useResourceItem, useResourceMutations } from "@/hooks/useResource";
import type { Catch } from "@/lib/services/resource.service";

export const Route = createFileRoute("/_app/catches/$id/edit")({ component: EditCatch });

function EditCatch() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { data, isLoading } = useResourceItem<Catch>("catches", id);
  const { update } = useResourceMutations("catches");
  if (isLoading) return <p className="p-6 text-muted-foreground">Chargement…</p>;
  return (
    <>
      <PageHeader title="Modifier la capture" />
      <ResourceForm<Partial<Catch>>
        title="Capture"
        defaultValues={data}
        fields={[
          { name: "fishType", label: "Espèce", required: true },
          { name: "weightKg", label: "Poids (kg)", type: "number", required: true },
          { name: "quantity", label: "Quantité", type: "number" },
          { name: "zone", label: "Zone" },
          { name: "boatId", label: "ID Bateau" },
          { name: "fishermanId", label: "ID Pêcheur" },
        ]}
        submitting={update.isPending}
        onSubmit={(values) => update.mutate({ id, payload: values }, {
          onSuccess: () => { toast.success("Modifications enregistrées"); navigate({ to: "/catches/$id", params: { id } }); },
        })}
      />
    </>
  );
}
