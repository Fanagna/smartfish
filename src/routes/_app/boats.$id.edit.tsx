import { createFileRoute, useNavigate } from "@tanstack/react-router";
import toast from "react-hot-toast";
import { PageHeader } from "@/components/common/PageHeader";
import { ResourceForm } from "@/components/forms/ResourceForm";
import { useResourceItem, useResourceMutations } from "@/hooks/useResource";
import type { Boat } from "@/lib/services/resource.service";

export const Route = createFileRoute("/_app/boats/$id/edit")({ component: EditBoat });

function EditBoat() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { data, isLoading } = useResourceItem<Boat>("boats", id);
  const { update } = useResourceMutations("boats");

  if (isLoading) return <p className="p-6 text-muted-foreground">Chargement…</p>;

  return (
    <>
      <PageHeader title="Modifier le bateau" />
      <ResourceForm<Partial<Boat>>
        title={data?.name ?? "Bateau"}
        defaultValues={data}
        fields={[
          { name: "name", label: "Nom", required: true },
          { name: "registrationNumber", label: "N° d'immatriculation", required: true },
          { name: "captain", label: "Capitaine" },
          { name: "capacityKg", label: "Capacité (kg)", type: "number" },
        ]}
        submitting={update.isPending}
        onSubmit={(values) => update.mutate({ id, payload: values }, {
          onSuccess: () => { toast.success("Modifications enregistrées"); navigate({ to: "/boats/$id", params: { id } }); },
        })}
      />
    </>
  );
}
