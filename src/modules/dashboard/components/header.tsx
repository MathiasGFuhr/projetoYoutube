"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Bell, ChevronDown, Loader2, User, LogOut, Search, Calendar } from "lucide-react";
import { useAuth } from "@/shared/hooks/use-auth";
import { useSignOut } from "@/modules/auth/hooks/use-sign-out";

function Clock() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const timeStr = now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  const dateStr = now.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });

  return (
    <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-lg bg-zinc-900/50 border border-zinc-800/40">
      <Calendar className="size-3 text-zinc-600" />
      <span className="text-[11px] text-zinc-500 font-medium">{dateStr}</span>
      <span className="text-[11px] text-zinc-600">·</span>
      <span className="text-[11px] text-zinc-400 font-mono tabular-nums">{timeStr}</span>
    </div>
  );
}

const ROUTE_LABELS: Record<string, string> = {
  "/dashboard": "Painel Principal",
  "/dashboard/calendar": "Calendário Editorial",
  "/dashboard/pipeline": "Pipeline de Vídeos",
  "/dashboard/channels": "Canais",
  "/dashboard/team": "Equipe",
  "/dashboard/analytics": "Analytics",
  "/dashboard/settings": "Configurações",
  "/dashboard/billing": "Planos e Assinatura",
};

export function DashboardHeader() {
  const { user } = useAuth();
  const { signOut, isPending } = useSignOut();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const pathname = usePathname();

  const displayName =
    (user?.user_metadata?.full_name as string | undefined) ??
    user?.email?.split("@")[0] ??
    "Usuário";

  const avatarInitial = displayName.charAt(0).toUpperCase();
  const pageLabel = ROUTE_LABELS[pathname] ?? "Dashboard";

  return (
    <header className="flex items-center justify-between h-16 px-6 border-b border-zinc-800/50 bg-[#080808]/90 backdrop-blur-sm flex-shrink-0 gap-4">
      {/* Page title */}
      <div className="flex items-center gap-3 min-w-0">
        <h1 className="text-sm font-semibold text-zinc-200 truncate">{pageLabel}</h1>
      </div>

      <Clock />

      {/* Search */}
      <div className="hidden md:flex items-center gap-2 h-8 px-3 rounded-lg bg-zinc-900/70 border border-zinc-800/60 text-zinc-500 hover:border-zinc-700 transition-colors flex-1 max-w-xs">
        <Search className="size-3.5 flex-shrink-0" />
        <input
          type="text"
          placeholder="Buscar vídeos, canais..."
          className="bg-transparent text-xs outline-none w-full placeholder:text-zinc-600 text-zinc-300"
        />
        <kbd className="hidden sm:flex items-center gap-0.5 text-[10px] text-zinc-700 font-mono border border-zinc-800 rounded px-1">⌘K</kbd>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2.5 flex-shrink-0">
        <button
          className="relative flex items-center justify-center size-8 rounded-lg text-zinc-500 hover:text-zinc-300 bg-zinc-900/60 hover:bg-zinc-800/80 border border-zinc-800/60 transition-all duration-150"
          aria-label="Notificações"
        >
          <Bell className="size-3.5" />
          <span className="absolute top-1 right-1 size-1.5 rounded-full bg-red-500 ring-1 ring-[#080808]" />
        </button>

        <div className="relative">
          <button
            onClick={() => setDropdownOpen((v) => !v)}
            className="flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-lg bg-zinc-900/60 hover:bg-zinc-800/80 border border-zinc-800/60 transition-all duration-150 focus:outline-none"
          >
            <div className="flex items-center justify-center size-7 rounded-lg bg-red-500/10 border border-red-500/25 flex-shrink-0">
              <span className="text-xs font-bold text-red-400">{avatarInitial}</span>
            </div>
            <div className="hidden sm:flex flex-col items-start">
              <span className="text-xs font-semibold text-zinc-200 leading-none">{displayName}</span>
              <span className="text-[10px] text-zinc-600 leading-none mt-0.5 max-w-[120px] truncate">{user?.email}</span>
            </div>
            <ChevronDown className={`size-3 text-zinc-600 transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`} />
          </button>

          {dropdownOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
              <div className="absolute right-0 mt-2 w-52 z-20 bg-zinc-950 border border-zinc-800/80 rounded-xl shadow-2xl shadow-black/60 py-1.5 overflow-hidden">
                <div className="px-3 py-2.5 border-b border-zinc-800/60">
                  <p className="text-xs font-semibold text-zinc-300 truncate">{displayName}</p>
                  <p className="text-[10px] text-zinc-600 truncate mt-0.5">{user?.email}</p>
                </div>
                <a
                  href="/dashboard/settings"
                  className="flex items-center gap-2.5 px-3 py-2 text-sm text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60 transition-colors"
                >
                  <User className="size-3.5" />
                  Meu perfil
                </a>
                <button
                  onClick={() => { setDropdownOpen(false); signOut(); }}
                  disabled={isPending}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-zinc-800/60 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isPending ? <Loader2 className="size-3.5 animate-spin" /> : <LogOut className="size-3.5" />}
                  {isPending ? "Saindo..." : "Sair da conta"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
