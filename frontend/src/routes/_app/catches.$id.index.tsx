import { createFileRoute, Link } from "@tanstack/react-router";
import { FiActivity, FiArrowLeft, FiEdit2 } from "react-icons/fi";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/common/Card";
import { Badge } from "@/components/common/Badge";
import { Button } from "@/components/common/Button";
import { useResourceItem } from "@/hooks/useResource";
import type { Catch } from "@/lib/services/resource.service";

export const Route = createFileRoute("/_app/catches/$id/")({ component: CatchDetails });

function CatchDetails() {
  const { id } = Route.useParams();
  const { data } = useResourceItem<Catch>("catches", id);
  return (
    <>
      <PageHeader
        title={data?.fishType ?? "Capture"}
        actions={
          <>
            <Link to="/catches"><Button variant="outline"><FiArrowLeft /> Retour</Button></Link>
            <Link to="/catches/$id/edit" params={{ id }}><Button variant="accent"><FiEdit2 /> Modifier</Button></Link>
          </>
        }
      />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardContent className="flex flex-col items-center gap-3 p-6">
            <div className="grid h-24 w-24 place-items-center rounded-2xl gradient-accent text-white shadow-glow">
              <FiActivity className="h-10 w-10" />
            </div>
            <p className="text-lg font-semibold">{data?.fishType}</p>
            <Badge tone="info">{data?.zone}</Badge>
          </CardContent>
        </Card>
        <Card className="md:col-span-2">
          <CardHeader><CardTitle>Données</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2 text-sm">
            <Info label="Poids" value={data ? `${data.weightKg.toLocaleString()} kg` : "—"} />
            <Info label="Quantité" value={data?.quantity?.toString()} />
            <Info label="Bateau" value={data?.boatId} />
            <Info label="Pêcheur" value={data?.fishermanId} />
            <Info label="Date" value={data?.date && new Date(data.date).toLocaleString()} />
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
