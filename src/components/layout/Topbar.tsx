import { useNavigate } from "@tanstack/react-router";
import { FiBell, FiLogOut, FiMenu, FiSearch } from "react-icons/fi";
import Swal from "sweetalert2";
import { useAuthStore } from "@/lib/store/auth";
import { authService } from "@/lib/services/auth.service";

export function Topbar({ onToggle }: { onToggle: () => void }) {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const clear = useAuthStore((s) => s.clear);

  const handleLogout = async () => {
    const res = await Swal.fire({
      title: "Déconnexion",
      text: "Voulez-vous vous déconnecter ?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Oui",
      cancelButtonText: "Annuler",
      confirmButtonColor: "#0EA5E9",
    });
    if (!res.isConfirmed) return;
    await authService.logout();
    clear();
    navigate({ to: "/login" });
  };

  const initials = (user?.name ?? "U")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur md:px-6">
      <button
        onClick={onToggle}
        className="grid h-9 w-9 place-items-center rounded-lg border border-border text-muted-foreground hover:bg-muted"
        aria-label="Basculer la barre latérale"
      >
        <FiMenu />
      </button>

      <div className="relative ml-1 hidden max-w-md flex-1 md:block">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          placeholder="Rechercher pêcheurs, bateaux, captures…"
          className="h-10 w-full rounded-lg border border-border bg-muted/40 pl-10 pr-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>

      <div className="ml-auto flex items-center gap-2">
        <button className="relative grid h-10 w-10 place-items-center rounded-lg border border-border text-muted-foreground hover:bg-muted">
          <FiBell />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-destructive" />
        </button>

        <div className="hidden items-center gap-3 rounded-lg border border-border px-2 py-1.5 sm:flex">
          <div className="grid h-8 w-8 place-items-center rounded-full gradient-accent text-xs font-bold text-white">
            {initials}
          </div>
          <div className="leading-tight">
            <p className="text-sm font-semibold text-foreground">{user?.name ?? "Utilisateur"}</p>
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{user?.role ?? "—"}</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="grid h-10 w-10 place-items-center rounded-lg border border-border text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
          aria-label="Se déconnecter"
        >
          <FiLogOut />
        </button>
      </div>
    </header>
  );
}
