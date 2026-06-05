import { createFileRoute, Link } from "@tanstack/react-router";
import { FiArrowLeft, FiEdit2 } from "react-icons/fi";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/common/Card";
import { Badge } from "@/components/common/Badge";
import { Button } from "@/components/common/Button";
import { useResourceItem } from "@/hooks/useResource";
import type { Fisherman } from "@/lib/services/resource.service";

export const Route = createFileRoute("/_app/fishermen/$id/")({
  component: FishermanDetails,
});

function FishermanDetails() {
  const { id } = Route.useParams();
  const { data, isLoading } = useResourceItem<Fisherman>("fishermen", id);

  return (
    <>
      <PageHeader
        title={data?.fullName ?? "Détails"}
        description="Profil détaillé du pêcheur."
        actions={
          <>
            <Link to="/fishermen"><Button variant="outline"><FiArrowLeft /> Retour</Button></Link>
            <Link to="/fishermen/$id/edit" params={{ id }}><Button variant="accent"><FiEdit2 /> Modifier</Button></Link>
          </>
        }
      />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardContent className="flex flex-col items-center gap-3 p-6">
            <div className="grid h-24 w-24 place-items-center rounded-full gradient-ocean text-2xl font-bold text-white shadow-glow">
              {data?.fullName?.split(" ").map((p) => p[0]).slice(0, 2).join("") ?? "—"}
            </div>
            <p className="text-lg font-semibold">{isLoading ? "…" : data?.fullName}</p>
            <Badge tone={data?.status === "active" ? "success" : "muted"}>{data?.status ?? "—"}</Badge>
          </CardContent>
        </Card>
        <Card className="md:col-span-2">
          <CardHeader><CardTitle>Informations</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2 text-sm">
            <Info label="Email" value={data?.email} />
            <Info label="Téléphone" value={data?.phone} />
            <Info label="Licence" value={data?.licenseNumber} />
            <Info label="Bateau" value={data?.boatId} />
            <Info label="Créé le" value={data?.createdAt && new Date(data.createdAt).toLocaleDateString()} />
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function Info({ label, value }: { label: string; value?: string }) {
  return (
    <div className="rounded-xl border border-border bg-muted/30 p-3">
      <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-1 font-medium text-foreground">{value ?? "—"}</p>
    </div>
  );
}
