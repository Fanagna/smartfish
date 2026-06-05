import { createFileRoute, useNavigate } from "@tanstack/react-router";
import toast from "react-hot-toast";
import { PageHeader } from "@/components/common/PageHeader";
import { ResourceForm } from "@/components/forms/ResourceForm";
import { useResourceMutations } from "@/hooks/useResource";

export const Route = createFileRoute("/_app/boats/new")({ component: NewBoat });

function NewBoat() {
  const navigate = useNavigate();
  const { create } = useResourceMutations("boats");
  return (
    <>
      <PageHeader title="Nouveau bateau" />
      <ResourceForm
        title="Informations du bateau"
        fields={[
          { name: "name", label: "Nom", required: true },
          { name: "registrationNumber", label: "N° d'immatriculation", required: true },
          { name: "captain", label: "Capitaine" },
          { name: "capacityKg", label: "Capacité (kg)", type: "number" },
        ]}
        submitting={create.isPending}
        onSubmit={(values) => create.mutate(values, {
          onSuccess: () => { toast.success("Bateau créé"); navigate({ to: "/boats" }); },
        })}
      />
    </>
  );
}
