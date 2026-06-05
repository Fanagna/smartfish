import { Link, useRouterState } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  FiActivity, FiAnchor, FiBarChart2, FiBox, FiCpu, FiGrid,
  FiSettings, FiShoppingCart, FiUsers, FiZap,
} from "react-icons/fi";
import { cn } from "@/lib/utils";

const items = [
  { to: "/dashboard", label: "Dashboard", icon: FiGrid },
  { to: "/fishermen", label: "Pêcheurs", icon: FiUsers },
  { to: "/boats", label: "Bateaux", icon: FiAnchor },
  { to: "/catches", label: "Captures", icon: FiActivity },
  { to: "/stock", label: "Stocks", icon: FiBox, soon: true },
  { to: "/sales", label: "Ventes", icon: FiShoppingCart, soon: true },
  { to: "/analytics", label: "Analytics", icon: FiBarChart2, soon: true },
  { to: "/ai", label: "SmartFish AI", icon: FiCpu, soon: true },
  { to: "/settings", label: "Paramètres", icon: FiSettings, soon: true },
];

export function Sidebar({ open }: { open: boolean }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <aside
      className={cn(
        "sticky top-0 z-30 flex h-screen shrink-0 flex-col gap-2 border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-all duration-300",
        open ? "w-64" : "w-[78px]",
      )}
    >
      <div className="flex h-16 items-center gap-2 px-4">
        <div className="grid h-9 w-9 place-items-center rounded-xl gradient-accent shadow-glow">
          <FiZap className="h-5 w-5 text-white" />
        </div>
        {open && (
          <div className="leading-tight">
            <p className="font-display text-base font-bold tracking-tight">SmartFish</p>
            <p className="text-[10px] uppercase tracking-widest text-sidebar-foreground/60">Decision AI</p>
          </div>
        )}
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-2">
        {items.map((item) => {
          const active = pathname === item.to || pathname.startsWith(item.to + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to as any}
              disabled={item.soon}
              className={cn(
                "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
                item.soon && "opacity-50 pointer-events-none",
              )}
            >
              {active && (
                <motion.span
                  layoutId="sidebar-active"
                  className="absolute left-0 h-6 w-1 rounded-r-full gradient-accent"
                />
              )}
              <Icon className="h-5 w-5 shrink-0" />
              {open && <span className="truncate">{item.label}</span>}
              {open && item.soon && (
                <span className="ml-auto rounded-full bg-sidebar-accent px-2 py-0.5 text-[10px] uppercase tracking-wider text-sidebar-foreground/70">
                  Soon
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {open && (
        <div className="m-3 rounded-xl bg-sidebar-accent/60 p-4">
          <p className="text-xs font-semibold text-sidebar-foreground">SmartFish Index</p>
          <p className="mt-1 font-display text-2xl font-bold text-sidebar-foreground">87/100</p>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-sidebar-border">
            <div className="h-full w-[87%] gradient-accent" />
          </div>
          <p className="mt-2 text-[11px] text-sidebar-foreground/60">Performance opérationnelle</p>
        </div>
      )}
    </aside>
  );
}
