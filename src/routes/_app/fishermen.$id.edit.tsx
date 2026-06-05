import { createFileRoute, useNavigate } from "@tanstack/react-router";
import toast from "react-hot-toast";
import { PageHeader } from "@/components/common/PageHeader";
import { ResourceForm } from "@/components/forms/ResourceForm";
import { useResourceItem, useResourceMutations } from "@/hooks/useResource";
import type { Fisherman } from "@/lib/services/resource.service";

export const Route = createFileRoute("/_app/fishermen/$id/edit")({
  component: EditFisherman,
});

function EditFisherman() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { data, isLoading } = useResourceItem<Fisherman>("fishermen", id);
  const { update } = useResourceMutations("fishermen");

  if (isLoading) return <p className="p-6 text-muted-foreground">Chargement…</p>;

  return (
    <>
      <PageHeader title="Modifier le pêcheur" />
      <ResourceForm<Partial<Fisherman>>
        title={data?.fullName ?? "Pêcheur"}
        defaultValues={data}
        fields={[
          { name: "fullName", label: "Nom complet", required: true },
          { name: "email", label: "Email", type: "email" },
          { name: "phone", label: "Téléphone" },
          { name: "licenseNumber", label: "N° de licence" },
        ]}
        submitting={update.isPending}
        onSubmit={(values) => update.mutate({ id, payload: values }, {
          onSuccess: () => { toast.success("Modifications enregistrées"); navigate({ to: "/fishermen/$id", params: { id } }); },
        })}
      />
    </>
  );
}
