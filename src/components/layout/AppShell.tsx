import { useEffect, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { useLocation } from "@tanstack/react-router";

export function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(true);
  const location = useLocation();

  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth < 768) setOpen(false);
  }, []);

  return (
    <div className="flex min-h-screen w-full bg-background">
      <Sidebar open={open} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar onToggle={() => setOpen((v) => !v)} />
        <main className="flex-1 px-4 py-6 md:px-8 md:py-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.25 }}
              className="mx-auto w-full max-w-7xl"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
