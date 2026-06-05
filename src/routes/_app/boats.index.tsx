import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { FiAnchor, FiEdit2, FiEye, FiPlus, FiSearch, FiTrash2 } from "react-icons/fi";
import Swal from "sweetalert2";
import toast from "react-hot-toast";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { Card } from "@/components/common/Card";
import { Badge } from "@/components/common/Badge";
import { DataTable, type Column } from "@/components/common/DataTable";
import { Pagination } from "@/components/common/Pagination";
import { PageHeader } from "@/components/common/PageHeader";
import { useResourceList, useResourceMutations } from "@/hooks/useResource";
import type { Boat } from "@/lib/services/resource.service";

export const Route = createFileRoute("/_app/boats/")({ component: BoatsList });

const statusTone: Record<string, "success" | "info" | "warning"> = { available: "success", "at-sea": "info", maintenance: "warning" };

function BoatsList() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const pageSize = 10;
  const { data, isLoading } = useResourceList<Boat>("boats", { page, pageSize, search });
  const { remove } = useResourceMutations("boats");

  const handleDelete = async (row: Boat) => {
    const r = await Swal.fire({ title: "Supprimer ?", text: row.name, icon: "warning", showCancelButton: true, confirmButtonColor: "#EF4444" });
    if (!r.isConfirmed) return;
    remove.mutate(row.id, { onSuccess: () => toast.success("Bateau supprimé") });
  };

  const columns: Column<Boat>[] = [
    {
      key: "name", header: "Bateau",
      render: (r) => (
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary/10 text-primary"><FiAnchor /></div>
          <div>
            <p className="font-medium">{r.name}</p>
            <p className="text-xs text-muted-foreground">{r.registrationNumber}</p>
          </div>
        </div>
      ),
    },
    { key: "captain", header: "Capitaine" },
    { key: "capacityKg", header: "Capacité (kg)", render: (r) => r.capacityKg?.toLocaleString() },
    { key: "status", header: "Statut", render: (r) => <Badge tone={statusTone[r.status ?? ""] ?? "muted"}>{r.status}</Badge> },
    {
      key: "actions", header: "", className: "text-right", width: "140px",
      render: (r) => (
        <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <Button size="icon" variant="ghost" onClick={() => navigate({ to: "/boats/$id", params: { id: r.id } })}><FiEye /></Button>
          <Button size="icon" variant="ghost" onClick={() => navigate({ to: "/boats/$id/edit", params: { id: r.id } })}><FiEdit2 /></Button>
          <Button size="icon" variant="ghost" onClick={() => handleDelete(r)}><FiTrash2 /></Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Bateaux"
        description="Suivez votre flotte et l'état opérationnel."
        actions={<Link to="/boats/new"><Button variant="accent"><FiPlus /> Ajouter</Button></Link>}
      />
      <Card>
        <div className="flex items-center gap-3 border-b border-border p-4">
          <div className="max-w-sm flex-1">
            <Input placeholder="Rechercher…" leftIcon={<FiSearch />} value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
          </div>
        </div>
        <DataTable columns={columns} data={data?.data ?? []} rowKey={(r) => r.id} loading={isLoading} />
        <Pagination page={page} pageSize={pageSize} total={data?.total ?? 0} onChange={setPage} />
      </Card>
    </>
  );
}
