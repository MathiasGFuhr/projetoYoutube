"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { DashboardSidebar } from "@/modules/dashboard/components/sidebar";

export function MobileSidebarShell() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed left-4 top-4 z-40 flex size-10 items-center justify-center rounded-xl border border-zinc-800/80 bg-zinc-950/80 text-zinc-300 shadow-2xl shadow-black/40 backdrop-blur-xl transition-colors hover:text-white lg:hidden"
        aria-label="Abrir menu"
      >
        <Menu className="size-4" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setOpen(false)}
            aria-label="Fechar menu"
          />
          <div className="absolute inset-y-0 left-0 w-[268px] max-w-[85vw] shadow-2xl shadow-black/60">
            <DashboardSidebar onNavigate={() => setOpen(false)} />
          </div>
          <button
            onClick={() => setOpen(false)}
            className="absolute left-[calc(min(85vw,268px)+12px)] top-4 flex size-9 items-center justify-center rounded-xl border border-zinc-800/80 bg-zinc-950/90 text-zinc-400 backdrop-blur-xl transition-colors hover:text-white"
            aria-label="Fechar menu"
          >
            <X className="size-4" />
          </button>
        </div>
      )}
    </>
  );
}
