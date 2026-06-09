import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { FiActivity, FiEdit2, FiEye, FiPlus, FiSearch, FiTrash2 } from "react-icons/fi";
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
import type { Catch } from "@/lib/services/resource.service";

export const Route = createFileRoute("/_app/catches/")({ component: CatchesList });

function CatchesList() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const pageSize = 10;
  const { data, isLoading } = useResourceList<Catch>("catches", { page, pageSize, search });
  const { remove } = useResourceMutations("catches");

  const handleDelete = async (row: Catch) => {
    const r = await Swal.fire({ title: "Supprimer ?", text: `${row.fishType} · ${row.weightKg} kg`, icon: "warning", showCancelButton: true, confirmButtonColor: "#EF4444" });
    if (!r.isConfirmed) return;
    remove.mutate(row.id, { onSuccess: () => toast.success("Capture supprimée") });
  };

  const columns: Column<Catch>[] = [
    { key: "fishType", header: "Espèce", render: (r) => (
      <div className="flex items-center gap-3">
        <div className="grid h-9 w-9 place-items-center rounded-lg bg-accent/15 text-accent"><FiActivity /></div>
        <p className="font-medium">{r.fishType}</p>
      </div>
    ) },
    { key: "weightKg", header: "Poids (kg)", render: (r) => r.weightKg.toLocaleString() },
    { key: "quantity", header: "Quantité" },
    { key: "zone", header: "Zone", render: (r) => <Badge tone="info">{r.zone ?? "—"}</Badge> },
    { key: "boatId", header: "Bateau" },
    { key: "date", header: "Date", render: (r) => new Date(r.date).toLocaleDateString() },
    {
      key: "actions", header: "", className: "text-right", width: "140px",
      render: (r) => (
        <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <Button size="icon" variant="ghost" onClick={() => navigate({ to: "/catches/$id", params: { id: r.id } })}><FiEye /></Button>
          <Button size="icon" variant="ghost" onClick={() => navigate({ to: "/catches/$id/edit", params: { id: r.id } })}><FiEdit2 /></Button>
          <Button size="icon" variant="ghost" onClick={() => handleDelete(r)}><FiTrash2 /></Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Captures"
        description="Journal complet des captures par bateau et zone."
        actions={<Link to="/catches/new"><Button variant="accent"><FiPlus /> Ajouter</Button></Link>}
      />
      <Card>
        <div className="flex items-center gap-3 border-b border-border p-4">
          <div className="max-w-sm flex-1">
            <Input placeholder="Rechercher (espèce, zone…)" leftIcon={<FiSearch />} value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
          </div>
        </div>
        <DataTable columns={columns} data={data?.data ?? []} rowKey={(r) => r.id} loading={isLoading} />
        <Pagination page={page} pageSize={pageSize} total={data?.total ?? 0} onChange={setPage} />
      </Card>
    </>
  );
}
