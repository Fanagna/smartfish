import { createFileRoute, Link } from "@tanstack/react-router";
import { FiAnchor, FiArrowLeft, FiEdit2 } from "react-icons/fi";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/common/Card";
import { Badge } from "@/components/common/Badge";
import { Button } from "@/components/common/Button";
import { useResourceItem } from "@/hooks/useResource";
import type { Boat } from "@/lib/services/resource.service";

export const Route = createFileRoute("/_app/boats/$id/")({ component: BoatDetails });

function BoatDetails() {
  const { id } = Route.useParams();
  const { data } = useResourceItem<Boat>("boats", id);

  return (
    <>
      <PageHeader
        title={data?.name ?? "Détails"}
        actions={
          <>
            <Link to="/boats"><Button variant="outline"><FiArrowLeft /> Retour</Button></Link>
            <Link to="/boats/$id/edit" params={{ id }}><Button variant="accent"><FiEdit2 /> Modifier</Button></Link>
          </>
        }
      />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardContent className="flex flex-col items-center gap-3 p-6">
            <div className="grid h-24 w-24 place-items-center rounded-2xl gradient-ocean text-white shadow-glow">
              <FiAnchor className="h-10 w-10" />
            </div>
            <p className="text-lg font-semibold">{data?.name}</p>
            <Badge tone="info">{data?.status}</Badge>
          </CardContent>
        </Card>
        <Card className="md:col-span-2">
          <CardHeader><CardTitle>Caractéristiques</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2 text-sm">
            <Info label="Immatriculation" value={data?.registrationNumber} />
            <Info label="Capitaine" value={data?.captain} />
            <Info label="Capacité" value={data?.capacityKg ? `${data.capacityKg.toLocaleString()} kg` : "—"} />
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
      <p className="mt-1 font-medium">{value ?? "—"}</p>
    </div>
  );
}
