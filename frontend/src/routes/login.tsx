import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { FiEye, FiEyeOff, FiLock, FiMail, FiZap } from "react-icons/fi";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { authService } from "@/lib/services/auth.service";
import { useAuthStore } from "@/lib/store/auth";

export const Route = createFileRoute("/login")({
  ssr: false,
  component: LoginPage,
});

interface FormValues { email: string; password: string; remember: boolean; }

function LoginPage() {
  const navigate = useNavigate();
  const setSession = useAuthStore((s) => s.setSession);
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    defaultValues: { email: "", password: "", remember: true },
  });

  const onSubmit = async (values: FormValues) => {
    setLoading(true);
    try {
      const res = await authService.login({ email: values.email, password: values.password });
      setSession({ user: res.user, token: res.token, refreshToken: res.refreshToken, remember: values.remember });
      toast.success(`Bienvenue ${res.user.name}`);
      navigate({ to: "/dashboard" });
    } catch (e: any) {
      // Demo fallback if API not reachable
      if (e?.code === "ERR_NETWORK" || e?.response?.status === 404) {
        const fakeUser = { id: "demo", name: "Démo Admin", email: values.email, role: "ADMIN" as const };
        setSession({ user: fakeUser, token: "demo-token", refreshToken: "demo-refresh", remember: values.remember });
        toast.success("Connexion en mode démo (API indisponible)");
        navigate({ to: "/dashboard" });
      } else {
        toast.error(e?.response?.data?.message ?? "Identifiants invalides");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative grid min-h-screen w-full lg:grid-cols-2">
      {/* Brand side */}
      <div className="relative hidden overflow-hidden gradient-ocean text-white lg:block">
        <div className="absolute inset-0 opacity-30 [background-image:radial-gradient(circle_at_30%_20%,white,transparent_40%),radial-gradient(circle_at_70%_80%,white,transparent_40%)]" />
        <div className="relative z-10 flex h-full flex-col justify-between p-12">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-white/15 backdrop-blur">
              <FiZap className="h-6 w-6" />
            </div>
            <div>
              <p className="font-display text-lg font-bold">SmartFish</p>
              <p className="text-xs uppercase tracking-[0.25em] text-white/70">Decision AI</p>
            </div>
          </div>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h2 className="font-display text-4xl font-bold leading-tight">
              L'intelligence au service de votre flotte.
            </h2>
            <p className="mt-4 max-w-md text-white/80">
              Pilotez vos pêcheurs, bateaux, captures et ventes. Anticipez la demande, optimisez vos stocks et prenez les meilleures décisions.
            </p>
            <div className="mt-8 grid grid-cols-3 gap-3 text-center">
              {[
                { v: "+38%", l: "Revenus" },
                { v: "12k", l: "Captures/mois" },
                { v: "87", l: "SmartFish Index" },
              ].map((s) => (
                <div key={s.l} className="rounded-xl bg-white/10 p-4 backdrop-blur">
                  <p className="font-display text-2xl font-bold">{s.v}</p>
                  <p className="text-xs text-white/70">{s.l}</p>
                </div>
              ))}
            </div>
          </motion.div>
          <p className="text-xs text-white/60">© {new Date().getFullYear()} SmartFish Decision AI</p>
        </div>
      </div>

      {/* Form side */}
      <div className="flex items-center justify-center bg-background px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="grid h-10 w-10 place-items-center rounded-xl gradient-accent">
              <FiZap className="h-5 w-5 text-white" />
            </div>
            <p className="font-display text-lg font-bold">SmartFish Decision AI</p>
          </div>

          <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">Connexion</h1>
          <p className="mt-2 text-sm text-muted-foreground">Accédez à votre cockpit opérationnel.</p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
            <Input
              label="Email"
              type="email"
              placeholder="vous@entreprise.com"
              leftIcon={<FiMail />}
              autoComplete="email"
              error={errors.email?.message}
              {...register("email", { required: "Email requis", pattern: { value: /^\S+@\S+\.\S+$/, message: "Email invalide" } })}
            />
            <Input
              label="Mot de passe"
              type={showPwd ? "text" : "password"}
              placeholder="••••••••"
              leftIcon={<FiLock />}
              rightIcon={
                <button type="button" onClick={() => setShowPwd((v) => !v)} className="hover:text-foreground">
                  {showPwd ? <FiEyeOff /> : <FiEye />}
                </button>
              }
              autoComplete="current-password"
              error={errors.password?.message}
              {...register("password", { required: "Mot de passe requis", minLength: { value: 6, message: "6 caractères minimum" } })}
            />

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-muted-foreground">
                <input type="checkbox" className="h-4 w-4 rounded border-border accent-[--accent]" {...register("remember")} />
                Se souvenir de moi
              </label>
              <button type="button" className="font-medium text-accent hover:underline">
                Mot de passe oublié ?
              </button>
            </div>

            <Button type="submit" variant="accent" size="lg" loading={loading} className="w-full">
              Se connecter
            </Button>

            <p className="pt-4 text-center text-xs text-muted-foreground">
              Démo : utilisez n'importe quels identifiants pour explorer la plateforme.
            </p>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
