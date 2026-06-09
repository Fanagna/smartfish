import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import toast from "react-hot-toast";
import { FiBell, FiLock, FiLogOut, FiPlus, FiShield, FiTrash2, FiUser, FiUsers } from "react-icons/fi";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { Badge } from "@/components/common/Badge";
import { useAuthStore } from "@/lib/store/auth";

export const Route = createFileRoute("/_app/settings")({
  ssr: false,
  component: SettingsPage,
});

const TABS = [
  { id: "profile", label: "Profil", icon: FiUser },
  { id: "security", label: "Sécurité", icon: FiLock },
  { id: "notifications", label: "Notifications", icon: FiBell },
  { id: "team", label: "Équipe & RBAC", icon: FiUsers },
] as const;
type TabId = (typeof TABS)[number]["id"];

const TEAM = [
  { name: "Démo Admin", email: "admin@smartfish.io", role: "ADMIN", active: true },
  { name: "Aïssatou Ba", email: "aissatou@smartfish.io", role: "MANAGER", active: true },
  { name: "Modou Gueye", email: "modou@smartfish.io", role: "FISHERMAN", active: true },
  { name: "Khady Sy", email: "khady@smartfish.io", role: "MANAGER", active: false },
];

function SettingsPage() {
  const navigate = useNavigate();
  const { user, clear } = useAuthStore();
  const [tab, setTab] = useState<TabId>("profile");

  const logout = () => {
    clear();
    toast.success("Déconnecté");
    navigate({ to: "/login" });
  };

  return (
    <>
      <PageHeader title="Paramètres" description="Profil, sécurité, équipe et préférences." />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[220px_1fr]">
        <Card className="h-fit">
          <CardContent className="space-y-1 p-2">
            {TABS.map((t) => {
              const Icon = t.icon;
              const active = tab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    active ? "bg-accent/10 text-accent" : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {t.label}
                </button>
              );
            })}
            <button
              onClick={logout}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
            >
              <FiLogOut className="h-4 w-4" />
              Déconnexion
            </button>
          </CardContent>
        </Card>

        <div className="space-y-6">
          {tab === "profile" && (
            <Card>
              <CardHeader>
                <CardTitle>Profil utilisateur</CardTitle>
                <CardDescription>Vos informations personnelles.</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2 flex items-center gap-4">
                  <div className="grid h-16 w-16 place-items-center rounded-full gradient-ocean text-xl font-bold text-white shadow-glow">
                    {user?.name?.split(" ").map((p) => p[0]).slice(0, 2).join("") ?? "U"}
                  </div>
                  <div>
                    <p className="font-semibold">{user?.name ?? "—"}</p>
                    <Badge tone="info">{user?.role ?? "ADMIN"}</Badge>
                  </div>
                </div>
                <Input label="Nom complet" defaultValue={user?.name ?? ""} />
                <Input label="Email" type="email" defaultValue={user?.email ?? ""} />
                <Input label="Téléphone" placeholder="+221 77 …" />
                <Input label="Société" defaultValue="SmartFish SA" />
                <div className="sm:col-span-2 flex justify-end">
                  <Button variant="accent" onClick={() => toast.success("Profil mis à jour")}>Enregistrer</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {tab === "security" && (
            <Card>
              <CardHeader>
                <CardTitle>Sécurité</CardTitle>
                <CardDescription>Mot de passe et authentification.</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input label="Mot de passe actuel" type="password" leftIcon={<FiLock />} />
                <div className="sm:col-span-2 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Input label="Nouveau mot de passe" type="password" leftIcon={<FiLock />} />
                  <Input label="Confirmation" type="password" leftIcon={<FiLock />} />
                </div>
                <div className="sm:col-span-2 flex items-center justify-between rounded-xl border border-border bg-muted/30 p-4">
                  <div>
                    <p className="flex items-center gap-2 font-medium"><FiShield className="text-accent" /> Authentification 2FA</p>
                    <p className="text-sm text-muted-foreground">Ajoutez une couche de sécurité supplémentaire.</p>
                  </div>
                  <Button variant="outline">Activer</Button>
                </div>
                <div className="sm:col-span-2 flex justify-end">
                  <Button variant="accent" onClick={() => toast.success("Sécurité mise à jour")}>Enregistrer</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {tab === "notifications" && (
            <Card>
              <CardHeader>
                <CardTitle>Notifications</CardTitle>
                <CardDescription>Canal et fréquence des alertes.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { label: "Alertes stock bas", desc: "Notification dès qu'un seuil est franchi" },
                  { label: "Rapports hebdomadaires", desc: "Synthèse exécutive chaque lundi 8h" },
                  { label: "Recommandations IA", desc: "Notifications push quand une opportunité est détectée" },
                  { label: "Activité équipe", desc: "Connexions et actions sensibles" },
                ].map((row, i) => (
                  <label key={i} className="flex cursor-pointer items-center justify-between rounded-xl border border-border bg-muted/20 p-4">
                    <div>
                      <p className="font-medium">{row.label}</p>
                      <p className="text-sm text-muted-foreground">{row.desc}</p>
                    </div>
                    <input type="checkbox" defaultChecked={i < 3} className="h-5 w-5 accent-[--accent]" />
                  </label>
                ))}
              </CardContent>
            </Card>
          )}

          {tab === "team" && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Équipe & rôles</CardTitle>
                    <CardDescription>Gérez les accès et permissions (RBAC).</CardDescription>
                  </div>
                  <Button variant="accent"><FiPlus /> Inviter</Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {TEAM.map((m, i) => (
                  <div key={i} className="flex items-center gap-3 rounded-xl border border-border p-3">
                    <div className="grid h-10 w-10 place-items-center rounded-full bg-muted font-semibold">
                      {m.name.split(" ").map((p) => p[0]).slice(0, 2).join("")}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{m.name}</p>
                      <p className="text-xs text-muted-foreground">{m.email}</p>
                    </div>
                    <Badge tone={m.role === "ADMIN" ? "danger" : m.role === "MANAGER" ? "info" : "muted"}>{m.role}</Badge>
                    <Badge tone={m.active ? "success" : "muted"}>{m.active ? "Actif" : "Inactif"}</Badge>
                    <Button variant="ghost" size="icon" aria-label="Supprimer"><FiTrash2 /></Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
