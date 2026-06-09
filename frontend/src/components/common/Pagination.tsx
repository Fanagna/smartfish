import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { Button } from "./Button";

export function Pagination({ page, pageSize, total, onChange }: { page: number; pageSize: number; total: number; onChange: (p: number) => void }) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3 text-sm text-muted-foreground">
      <span>
        {start}-{end} sur {total}
      </span>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" disabled={page <= 1} onClick={() => onChange(page - 1)}>
          <FiChevronLeft />
        </Button>
        <span className="min-w-[80px] text-center">
          Page {page} / {totalPages}
        </span>
        <Button variant="outline" size="icon" disabled={page >= totalPages} onClick={() => onChange(page + 1)}>
          <FiChevronRight />
        </Button>
      </div>
    </div>
  );
}
