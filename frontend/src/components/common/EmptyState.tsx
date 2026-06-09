import type { ReactNode } from "react";
import { FiInbox } from "react-icons/fi";

export function EmptyState({ title = "Aucune donnée", description, icon, action }: { title?: string; description?: string; icon?: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border bg-muted/30 px-6 py-16 text-center">
      <div className="grid h-14 w-14 place-items-center rounded-full bg-background text-muted-foreground shadow-soft">
        {icon ?? <FiInbox className="h-6 w-6" />}
      </div>
      <div>
        <p className="text-base font-semibold text-foreground">{title}</p>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
  );
}
