"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  CalendarDays,
  Tv2,
  Upload,
  Lightbulb,
  Code2,
  Settings,
  LogOut,
  Loader2,
  Database,
  CreditCard,
  Headphones,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/shared/hooks/use-auth";
import { useSignOut } from "@/modules/auth/hooks/use-sign-out";
import { useChannels } from "@/shared/hooks/use-channels";

interface NavItem {
  label: string;
  icon: React.ElementType;
  href: string;
  badge?: string;
  badgeDot?: string;
}

function useNavItems() {
  const { channels } = useChannels();
  const channelCount = channels.length.toString();

  const items: NavItem[] = [
    { label: "Dashboard",        icon: LayoutDashboard, href: "/dashboard"             },
    { label: "Calendário",       icon: CalendarDays,    href: "/dashboard/calendar"    },
    { label: "Canais",           icon: Tv2,             href: "/dashboard/channels",   badge: channelCount, badgeDot: "bg-emerald-500" },
    { label: "Publicados",       icon: Upload,          href: "/dashboard/published"   },
    { label: "Ideias",           icon: Lightbulb,       href: "/dashboard/ideas"       },
    { label: "Em Desenvolvimento", icon: Code2,         href: "/dashboard/development" },
  ];
  return items;
}

const BOTTOM_ITEMS: NavItem[] = [
  { label: "Planos", icon: CreditCard, href: "/dashboard/billing" },
  { label: "Configurações", icon: Settings, href: "/dashboard/settings" },
  { label: "Suporte", icon: Headphones, href: "/dashboard/support" },
];

export function DashboardSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { user } = useAuth();
  const { signOut, isPending } = useSignOut();
  const NAV_ITEMS = useNavItems();

  const displayName =
    (user?.user_metadata?.full_name as string | undefined) ??
    user?.email?.split("@")[0] ??
    "Usuário";

  const avatarInitial = displayName.charAt(0).toUpperCase();
  const avatarUrl = user?.user_metadata?.avatar_url as string | undefined;

  return (
    <aside className="flex h-full w-[236px] flex-shrink-0 select-none flex-col border-r border-zinc-800/70 bg-[#080808]/95 shadow-[22px_0_80px_rgba(0,0,0,0.32)] backdrop-blur-2xl">

      {/* Logo */}
      <div className="border-b border-zinc-800/60 px-4 pb-4 pt-5">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="StudioHub" className="size-8 object-contain" />
          <div>
            <p className="text-base font-black tracking-[-0.04em] text-zinc-100 leading-none">
              Studio<span className="text-red-400">Hub</span>
            </p>
            <p className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.16em] text-zinc-600 leading-none">Pro Pipeline</p>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-2">
          <Database className="size-3 text-emerald-400" />
          <span className="text-[10px] font-semibold text-emerald-400">Supabase</span>
          <div className="ml-auto flex items-center gap-1">
            <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] text-emerald-500">Ativo</span>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="custom-scrollbar flex-1 overflow-y-auto px-2.5 py-4">
        <p className="mb-2 px-2 text-[10px] font-black uppercase tracking-[0.18em] text-zinc-600">
          Menu
        </p>
        <div className="space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group relative flex h-10 items-center gap-2.5 rounded-xl px-3 text-[13px] font-semibold transition-all duration-200",
                  isActive
                    ? "border border-red-500/25 bg-red-500/12 text-zinc-50 shadow-[0_10px_32px_rgba(255,31,31,0.08)]"
                    : "text-zinc-500 hover:bg-zinc-900/80 hover:text-zinc-200"
                )}
                onClick={onNavigate}
              >
                {isActive && (
                  <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r bg-red-500" />
                )}
                <Icon
                  className={cn(
                    "size-4 flex-shrink-0 transition-colors",
                    isActive ? "text-red-400" : "group-hover:text-zinc-300"
                  )}
                />
                <span className="flex-1 truncate">{item.label}</span>
                {item.badge && (
                  <span className="flex items-center gap-1 rounded-lg border border-zinc-700/60 bg-zinc-900 px-1.5 py-0.5 text-[10px] font-black text-zinc-400">
                    {item.badgeDot && <span className={cn("size-1.5 rounded-full", item.badgeDot)} />}
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Bottom nav — Configurações */}
      <div className="space-y-0.5 px-2.5 pt-3 pb-1">
        <p className="mb-1 px-2 text-[10px] font-black uppercase tracking-[0.18em] text-zinc-600">
          Preferências
        </p>
        {BOTTOM_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group relative flex h-10 items-center gap-2.5 rounded-xl px-3 text-[13px] font-semibold transition-all duration-200",
                isActive
                  ? "border border-red-500/25 bg-red-500/12 text-zinc-50 shadow-[0_10px_32px_rgba(255,31,31,0.08)]"
                  : "text-zinc-500 hover:bg-zinc-900/80 hover:text-zinc-200"
              )}
              onClick={onNavigate}
            >
              {isActive && (
                <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r bg-red-500" />
              )}
              <Icon
                className={cn(
                  "size-4 flex-shrink-0 transition-colors",
                  isActive ? "text-red-400" : "group-hover:text-zinc-300"
                )}
              />
              <span className="flex-1 truncate">{item.label}</span>
            </Link>
          );
        })}
      </div>

      {/* User profile */}
      <div className="space-y-2 border-t border-zinc-800/60 p-3">
        <Link href="/dashboard/settings" onClick={onNavigate} className="flex items-center gap-2.5 rounded-xl px-2 py-2 transition-colors hover:bg-zinc-900/80">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={displayName}
              className="size-9 flex-shrink-0 rounded-xl object-cover border border-red-500/25"
            />
          ) : (
            <div className="flex size-9 flex-shrink-0 items-center justify-center rounded-xl border border-red-500/25 bg-red-500/15">
              <span className="text-xs font-bold text-red-400">{avatarInitial}</span>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-zinc-300 truncate">{displayName}</p>
            <p className="text-[10px] text-zinc-600 truncate">{user?.email}</p>
          </div>
        </Link>
        <button
          onClick={() => signOut()}
          disabled={isPending}
          className="w-full flex items-center justify-center gap-2 py-1.5 rounded-lg text-xs text-zinc-500 hover:text-red-400 hover:bg-red-500/8 border border-transparent hover:border-red-500/15 transition-all disabled:opacity-50"
        >
          {isPending ? (
            <Loader2 className="size-3 animate-spin" />
          ) : (
            <LogOut className="size-3" />
          )}
          {isPending ? "Saindo..." : "Desconectar"}
        </button>
      </div>
    </aside>
  );
}
