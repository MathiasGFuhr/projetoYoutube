import { TrendingUp, TrendingDown } from "lucide-react";
import type { StatCard } from "@/modules/dashboard/types";

export function StatsCard({ label, value, delta, positive, icon: Icon }: StatCard) {
  return (
    <div className="group relative overflow-hidden rounded-2xl bg-zinc-900/40 border border-zinc-800/60 p-5 flex flex-col gap-5 hover:border-zinc-700/70 hover:bg-zinc-900/60 transition-all duration-200 cursor-default">
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(255,31,31,0.04),transparent)]" />

      <div className="flex items-start justify-between relative">
        <div className="flex items-center justify-center size-10 rounded-xl bg-red-500/10 border border-red-500/20 shadow-[0_0_20px_rgba(255,31,31,0.08)]">
          <Icon className="size-4.5 text-red-400" />
        </div>
        <span
          className={`flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-lg border ${
            positive
              ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
              : "text-red-400 bg-red-500/10 border-red-500/20"
          }`}
        >
          {positive ? (
            <TrendingUp className="size-3" />
          ) : (
            <TrendingDown className="size-3" />
          )}
          {delta}
        </span>
      </div>

      <div className="relative">
        <p className="text-[28px] font-bold text-zinc-50 leading-none tracking-tight">{value}</p>
        <p className="text-xs text-zinc-500 mt-1.5 font-medium">{label}</p>
      </div>
    </div>
  );
}
