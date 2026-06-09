import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { FiTrendingDown, FiTrendingUp } from "react-icons/fi";
import { cn } from "@/lib/utils";

export interface KpiCardProps {
  label: string;
  value: ReactNode;
  delta?: number;
  icon?: ReactNode;
  accent?: "primary" | "accent" | "success" | "warning" | "danger";
}

const accentRing: Record<NonNullable<KpiCardProps["accent"]>, string> = {
  primary: "from-primary/20 to-primary/5 text-primary",
  accent: "from-accent/25 to-accent/5 text-accent",
  success: "from-success/25 to-success/5 text-success",
  warning: "from-warning/25 to-warning/5 text-warning",
  danger: "from-destructive/25 to-destructive/5 text-destructive",
};

export function KpiCard({ label, value, delta, icon, accent = "accent" }: KpiCardProps) {
  const positive = (delta ?? 0) >= 0;
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.25 }}
      className="group relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-soft"
    >
      <div className={cn("pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br blur-2xl opacity-60", accentRing[accent])} />
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <div className={cn("grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br shadow-sm", accentRing[accent])}>
          {icon}
        </div>
      </div>
      <div className="mt-3 flex items-end justify-between gap-2">
        <div className="font-display text-3xl font-bold tracking-tight text-foreground">{value}</div>
        {typeof delta === "number" && (
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold",
              positive ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive",
            )}
          >
            {positive ? <FiTrendingUp /> : <FiTrendingDown />}
            {Math.abs(delta).toFixed(1)}%
          </span>
        )}
      </div>
    </motion.div>
  );
}
