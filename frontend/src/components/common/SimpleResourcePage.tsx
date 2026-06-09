import { useState, type ReactNode } from "react";
import { FiPlus, FiSearch, FiTrash2 } from "react-icons/fi";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { Card } from "@/components/common/Card";
import { DataTable, type Column } from "@/components/common/DataTable";
import { Pagination } from "@/components/common/Pagination";
import { PageHeader } from "@/components/common/PageHeader";
import { useResourceList, useResourceMutations } from "@/hooks/useResource";

export interface FieldDef {
  name: string;
  label: string;
  type?: "text" | "number" | "email" | "date" | "select";
  required?: boolean;
  options?: Array<{ value: string; label: string }>;
  placeholder?: string;
}

interface Props<T extends { id: string }> {
  title: string;
  description: string;
  resource: string;
  columns: Column<T>[];
  fields: FieldDef[];
  searchPlaceholder?: string;
  computeOnSubmit?: (values: Record<string, any>) => Record<string, any>;
  emptyHint?: ReactNode;
}

export function SimpleResourcePage<T extends { id: string }>({
  title, description, resource, columns, fields, searchPlaceholder, computeOnSubmit, emptyHint,
}: Props<T>) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState<Record<string, any>>({});
  const pageSize = 10;
  const { data, isLoading } = useResourceList<T>(resource, { page, pageSize, search });
  const { create, remove } = useResourceMutations(resource);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = computeOnSubmit ? computeOnSubmit(values) : values;
    create.mutate(payload as any, {
      onSuccess: () => {
        toast.success("Créé avec succès");
        setOpen(false);
        setValues({});
      },
      onError: (err: any) => toast.error(err?.response?.data?.message ?? "Erreur"),
    });
  };

  const handleDelete = async (row: T) => {
    const r = await Swal.fire({ title: "Supprimer ?", icon: "warning", showCancelButton: true, confirmButtonColor: "#EF4444" });
    if (!r.isConfirmed) return;
    remove.mutate(row.id, { onSuccess: () => toast.success("Supprimé") });
  };

  const cols: Column<T>[] = [
    ...columns,
    {
      key: "__actions", header: "", className: "text-right", width: "80px",
      render: (r) => (
        <Button size="icon" variant="ghost" onClick={(e) => { e.stopPropagation(); handleDelete(r); }}>
          <FiTrash2 />
        </Button>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title={title}
        description={description}
        actions={<Button variant="accent" onClick={() => setOpen(true)}><FiPlus /> Ajouter</Button>}
      />
      <Card>
        <div className="flex items-center gap-3 border-b border-border p-4">
          <div className="max-w-sm flex-1">
            <Input
              placeholder={searchPlaceholder ?? "Rechercher…"}
              leftIcon={<FiSearch />}
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
        </div>
        <DataTable columns={cols} data={data?.data ?? []} rowKey={(r) => r.id} loading={isLoading} />
        <Pagination page={page} pageSize={pageSize} total={data?.total ?? 0} onChange={setPage} />
      </Card>
      {!data?.data?.length && !isLoading && emptyHint && (
        <p className="mt-3 text-center text-sm text-muted-foreground">{emptyHint}</p>
      )}

      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4" onClick={() => setOpen(false)}>
          <Card className="w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
            <form onSubmit={submit} className="p-6">
              <h3 className="font-display text-xl font-bold">Nouvel élément</h3>
              <p className="text-sm text-muted-foreground">{title}</p>
              <div className="mt-4 grid gap-3">
                {fields.map((f) => (
                  <div key={f.name}>
                    <label className="mb-1 block text-xs font-medium text-foreground">{f.label}{f.required && " *"}</label>
                    {f.type === "select" ? (
                      <select
                        required={f.required}
                        value={values[f.name] ?? ""}
                        onChange={(e) => setValues((v) => ({ ...v, [f.name]: e.target.value }))}
                        className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm"
                      >
                        <option value="">— Sélectionner —</option>
                        {f.options?.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                    ) : (
                      <Input
                        type={f.type ?? "text"}
                        required={f.required}
                        placeholder={f.placeholder}
                        value={values[f.name] ?? ""}
                        onChange={(e) => setValues((v) => ({
                          ...v,
                          [f.name]: f.type === "number" ? Number(e.target.value) : e.target.value,
                        }))}
                      />
                    )}
                  </div>
                ))}
              </div>
              <div className="mt-6 flex justify-end gap-2">
                <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Annuler</Button>
                <Button type="submit" variant="accent" disabled={create.isPending}>
                  {create.isPending ? "..." : "Créer"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </>
  );
}
