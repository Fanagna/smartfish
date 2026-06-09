import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { FiEdit2, FiEye, FiPlus, FiSearch, FiTrash2 } from "react-icons/fi";
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
import type { Fisherman } from "@/lib/services/resource.service";

export const Route = createFileRoute("/_app/fishermen/")({
  component: FishermenList,
});

function FishermenList() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const pageSize = 10;
  const { data, isLoading } = useResourceList<Fisherman>("fishermen", { page, pageSize, search });
  const { remove } = useResourceMutations("fishermen");

  const handleDelete = async (row: Fisherman) => {
    const r = await Swal.fire({ title: "Supprimer ?", text: row.fullName, icon: "warning", showCancelButton: true, confirmButtonColor: "#EF4444" });
    if (!r.isConfirmed) return;
    remove.mutate(row.id, { onSuccess: () => toast.success("Pêcheur supprimé") });
  };

  const columns: Column<Fisherman>[] = [
    {
      key: "fullName", header: "Pêcheur",
      render: (r) => (
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-full gradient-accent text-xs font-bold text-white">
            {r.fullName.split(" ").map((p) => p[0]).slice(0, 2).join("")}
          </div>
          <div>
            <p className="font-medium text-foreground">{r.fullName}</p>
            <p className="text-xs text-muted-foreground">{r.email}</p>
          </div>
        </div>
      ),
    },
    { key: "phone", header: "Téléphone" },
    { key: "licenseNumber", header: "Licence" },
    { key: "status", header: "Statut", render: (r) => <Badge tone={r.status === "active" ? "success" : "muted"}>{r.status}</Badge> },
    {
      key: "actions", header: "", className: "text-right", width: "140px",
      render: (r) => (
        <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <Button size="icon" variant="ghost" onClick={() => navigate({ to: "/fishermen/$id", params: { id: r.id } })}><FiEye /></Button>
          <Button size="icon" variant="ghost" onClick={() => navigate({ to: "/fishermen/$id/edit", params: { id: r.id } })}><FiEdit2 /></Button>
          <Button size="icon" variant="ghost" onClick={() => handleDelete(r)}><FiTrash2 /></Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Pêcheurs"
        description="Gérez votre équipage et leurs licences."
        actions={
          <Link to="/fishermen/new"><Button variant="accent"><FiPlus /> Ajouter</Button></Link>
        }
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
