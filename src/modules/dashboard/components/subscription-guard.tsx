"use client";

import { Lock, ArrowRight, Rocket, Crown, Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useSubscription } from "@/shared/hooks/use-subscription";
import { cn } from "@/lib/utils";

function TrialBanner({ daysLeft, onSubscribe }: { daysLeft: number; onSubscribe: () => void }) {
  // Dynamic visual intensity based on remaining days
  const intensity = daysLeft <= 1 ? "high" : daysLeft <= 3 ? "medium" : "low";

  const glowOpacity = intensity === "high" ? 0.25 : intensity === "medium" ? 0.15 : 0.08;
  const borderOpacity = intensity === "high" ? 0.45 : intensity === "medium" ? 0.35 : 0.25;
  const pulseAnimation = intensity === "high" ? "animate-pulse" : "";

  return (
    <div className="relative mb-6 group">
      {/* Ambient glow behind banner */}
      <div
        className={cn(
          "absolute -inset-1 rounded-2xl blur-xl transition-opacity duration-500",
          pulseAnimation
        )}
        style={{ backgroundColor: `rgba(255, 30, 45, ${glowOpacity})` }}
      />

      {/* Main banner */}
      <div
        className={cn(
          "relative flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-5 p-5 sm:p-6 rounded-2xl backdrop-blur-xl transition-all duration-500",
          "border"
        )}
        style={{
          background: `linear-gradient(135deg, rgba(255,30,45,0.08) 0%, rgba(255,140,0,0.06) 100%)`,
          borderColor: `rgba(255, 120, 0, ${borderOpacity})`,
        }}
      >
        {/* Left: Premium icon with glow */}
        <div className="relative flex-shrink-0">
          <div
            className="absolute inset-0 rounded-xl blur-lg transition-opacity duration-500"
            style={{ backgroundColor: `rgba(255, 30, 45, ${glowOpacity * 1.5})` }}
          />
          <div
            className={cn(
              "relative w-12 h-12 rounded-xl flex items-center justify-center border",
              intensity === "high" && "bg-red-500/15 border-red-500/30",
              intensity === "medium" && "bg-orange-500/12 border-orange-500/25",
              intensity === "low" && "bg-amber-500/10 border-amber-500/20"
            )}
          >
            {intensity === "high" ? (
              <Rocket className="size-5.5 text-red-400" />
            ) : intensity === "medium" ? (
              <Zap className="size-5.5 text-orange-400" />
            ) : (
              <Crown className="size-5.5 text-amber-400" />
            )}
          </div>
        </div>

        {/* Center: Headline + Subheadline */}
        <div className="flex-1 min-w-0">
          <h3 className="text-base sm:text-lg font-bold text-white tracking-tight mb-1">
            {intensity === "high"
              ? "Últimas horas do seu acesso Pro"
              : intensity === "medium"
                ? "Seu acesso Pro está ativo"
                : "Você está usando o StudioHub Pro"}
          </h3>
          <p className="text-sm text-zinc-400 leading-relaxed">
            {daysLeft === 1
              ? "Aproveite todos os recursos premium por mais 1 dia. Não perca seu progresso."
              : `Aproveite todos os recursos premium por mais ${daysLeft} dias.`}
          </p>
        </div>

        {/* Right: CTA */}
        <div className="flex-shrink-0 w-full sm:w-auto">
          <button
            onClick={onSubscribe}
            className={cn(
              "relative w-full sm:w-auto px-5 py-2.5 rounded-xl text-sm font-bold tracking-wide transition-all duration-300 overflow-hidden group/btn",
              intensity === "high"
                ? "bg-red-600 text-white shadow-[0_0_30px_rgba(220,38,38,0.35)] hover:shadow-[0_0_45px_rgba(220,38,38,0.55)] hover:bg-red-500"
                : "bg-white/10 text-white border border-white/20 hover:bg-white/20 hover:border-white/30 backdrop-blur-sm"
            )}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700" />
            <span className="relative flex items-center justify-center gap-2">
              {intensity === "high" ? "Assinar agora" : "Continuar com Pro"}
              <ArrowRight className="size-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

export function SubscriptionGuard({ children }: { children: React.ReactNode }) {
  const { hasAccess, trial, isLoading } = useSubscription();
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-500" />
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="relative min-h-[60vh] flex items-center justify-center">
        {/* Background blur overlay */}
        <div className="absolute inset-0 bg-[#050505]/80 backdrop-blur-sm z-10" />

        {/* Lock card */}
        <div className="relative z-20 mx-4 w-full max-w-md">
          <div className="overflow-hidden rounded-[28px] border border-zinc-800/80 bg-zinc-950/90 shadow-[0_40px_120px_rgba(0,0,0,0.8)] backdrop-blur-2xl p-8 text-center">
            <div className="flex items-center justify-center mb-6">
              <div className="size-16 rounded-2xl bg-red-500/15 border border-red-500/25 flex items-center justify-center">
                <Lock className="size-7 text-red-400" />
              </div>
            </div>

            <h2 className="text-xl font-bold text-zinc-100 mb-2">
              Área restrita
            </h2>
            <p className="text-sm text-zinc-500 mb-6 leading-relaxed">
              Acesso liberado apenas para assinantes.
              Assine um plano para continuar usando o StudioHub.
            </p>

            <div className="space-y-3">
              <Button
                onClick={() => router.push("/dashboard/billing")}
                className="h-12 w-full rounded-xl border-0 bg-red-600 font-semibold tracking-wide text-white shadow-[0_14px_35px_rgba(255,31,31,0.25)] transition-all duration-300 hover:bg-red-500 hover:shadow-[0_18px_45px_rgba(255,31,31,0.35)] active:bg-red-700 group"
              >
                Assinar plano
                <ArrowRight className="size-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>

              <p className="text-xs text-zinc-600">
                A partir de R$ 12,99/mês
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Premium trial banner */}
      {trial.isInTrial && (
        <TrialBanner
          daysLeft={trial.daysLeft}
          onSubscribe={() => router.push("/dashboard/billing")}
        />
      )}
      {children}
    </>
  );
}
