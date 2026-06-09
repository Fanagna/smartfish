import { createFileRoute, useNavigate } from "@tanstack/react-router";
import toast from "react-hot-toast";
import { PageHeader } from "@/components/common/PageHeader";
import { ResourceForm } from "@/components/forms/ResourceForm";
import { useResourceMutations } from "@/hooks/useResource";

export const Route = createFileRoute("/_app/fishermen/new")({
  component: NewFisherman,
});

function NewFisherman() {
  const navigate = useNavigate();
  const { create } = useResourceMutations("fishermen");
  return (
    <>
      <PageHeader title="Nouveau pêcheur" description="Créer une fiche pêcheur." />
      <ResourceForm
        title="Informations du pêcheur"
        fields={[
          { name: "fullName", label: "Nom complet", required: true },
          { name: "email", label: "Email", type: "email" },
          { name: "phone", label: "Téléphone" },
          { name: "licenseNumber", label: "N° de licence" },
        ]}
        submitting={create.isPending}
        onSubmit={(values) => create.mutate(values, {
          onSuccess: () => { toast.success("Pêcheur créé"); navigate({ to: "/fishermen" }); },
        })}
      />
    </>
  );
}
