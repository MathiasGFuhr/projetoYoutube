"use client";

import { Lock, ArrowRight, Rocket, Crown, Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useSubscription } from "@/shared/hooks/use-subscription";
import { cn } from "@/lib/utils";

function TrialBanner({ daysLeft, onSubscribe }: { daysLeft: number; onSubscribe: () => void }) {
  // Dynamic visual intensity based on remaining days
  const intensity = daysLeft <= 1 ? "high" : daysLeft <= 3 ? "medium" : "low";

  // Copy that changes dynamically based on urgency
  const headline =
    intensity === "high"
      ? daysLeft === 1
        ? "Último dia de acesso ao StudioHub Pro"
        : "Seu acesso Pro expira em breve"
      : intensity === "medium"
        ? `Seu acesso Pro expira em ${daysLeft} dias`
        : `Seu teste do StudioHub Pro termina em ${daysLeft} dias`;

  const subheadline =
    intensity === "high"
      ? "Assine agora para não perder seu progresso e continuar sua operação."
      : "Continue sua operação sem perder acesso aos recursos premium.";

  const ctaText = intensity === "high" ? "Assinar agora" : "Continuar com Pro";

  // Visual settings per intensity
  const glowOpacity = intensity === "high" ? 0.3 : intensity === "medium" ? 0.18 : 0.1;
  const borderOpacity = intensity === "high" ? 0.5 : intensity === "medium" ? 0.38 : 0.28;
  const bgFrom = intensity === "high" ? "rgba(255,30,45,0.1)" : "rgba(255,30,45,0.06)";
  const bgTo = intensity === "high" ? "rgba(255,80,0,0.08)" : "rgba(255,140,0,0.04)";
  const iconBg =
    intensity === "high"
      ? "bg-red-500/15 border-red-500/35"
      : intensity === "medium"
        ? "bg-orange-500/12 border-orange-500/30"
        : "bg-amber-500/10 border-amber-500/22";
  const iconColor =
    intensity === "high" ? "text-red-400" : intensity === "medium" ? "text-orange-400" : "text-amber-400";

  return (
    <div className="relative mb-6 group">
      {/* Ambient glow behind banner */}
      <div
        className={cn(
          "absolute -inset-[2px] rounded-[22px] blur-2xl transition-opacity duration-700",
          intensity === "high" && "animate-pulse"
        )}
        style={{ backgroundColor: `rgba(255, 30, 45, ${glowOpacity})` }}
      />

      {/* Inner glow */}
      <div
        className="absolute -inset-[1px] rounded-[20px] blur-md transition-opacity duration-700"
        style={{
          background: `linear-gradient(135deg, rgba(255,60,30,${glowOpacity * 0.6}) 0%, rgba(255,120,0,${glowOpacity * 0.4}) 100%)`,
        }}
      />

      {/* Main banner */}
      <div
        className="relative flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 p-5 sm:p-6 rounded-[20px] backdrop-blur-xl transition-all duration-500 border"
        style={{
          background: `linear-gradient(135deg, ${bgFrom} 0%, ${bgTo} 100%)`,
          borderColor: `rgba(255, 100, 0, ${borderOpacity})`,
        }}
      >
        {/* Left: Premium icon with glow */}
        <div className="relative flex-shrink-0">
          <div
            className="absolute inset-0 rounded-xl blur-lg transition-opacity duration-500"
            style={{ backgroundColor: `rgba(255, 30, 45, ${glowOpacity * 1.8})` }}
          />
          <div
            className={cn(
              "relative w-12 h-12 rounded-xl flex items-center justify-center border transition-all duration-500",
              iconBg
            )}
          >
            {intensity === "high" ? (
              <Rocket className={cn("size-5", iconColor)} />
            ) : intensity === "medium" ? (
              <Zap className={cn("size-5", iconColor)} />
            ) : (
              <Crown className={cn("size-5", iconColor)} />
            )}
          </div>
        </div>

        {/* Center: Headline + Subheadline */}
        <div className="flex-1 min-w-0">
          <h3
            className={cn(
              "text-base sm:text-lg font-bold tracking-tight mb-1.5 transition-colors duration-500",
              intensity === "high" ? "text-white" : "text-zinc-100"
            )}
          >
            {headline}
          </h3>
          <p className="text-sm text-zinc-400 leading-relaxed">{subheadline}</p>
        </div>

        {/* Right: CTA */}
        <div className="flex-shrink-0 w-full sm:w-auto">
          <button
            onClick={onSubscribe}
            className={cn(
              "relative w-full sm:w-auto px-6 py-2.5 rounded-xl text-sm font-bold tracking-wide transition-all duration-300 overflow-hidden group/btn",
              intensity === "high"
                ? "bg-red-600 text-white shadow-[0_0_35px_rgba(220,38,38,0.4)] hover:shadow-[0_0_50px_rgba(220,38,38,0.6)] hover:bg-red-500 hover:scale-[1.02]"
                : "bg-white/10 text-white border border-white/20 hover:bg-white/20 hover:border-white/35 hover:scale-[1.02] backdrop-blur-sm shadow-[0_0_20px_rgba(255,255,255,0.05)]"
            )}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700" />
            <span className="relative flex items-center justify-center gap-2">
              {ctaText}
              <ArrowRight
                className={cn(
                  "size-3.5 transition-transform duration-300",
                  intensity === "high"
                    ? "group-hover/btn:translate-x-1"
                    : "group-hover/btn:translate-x-0.5"
                )}
              />
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

export function SubscriptionGuard({ children }: { children: React.ReactNode }) {
  const { hasAccess, trial, subscription, isLoading } = useSubscription();
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

  // Don't show trial banner if user has an active paid subscription
  const hasActivePaidSubscription = subscription?.status === "active" && !trial.isInTrial;
  const showTrialBanner = trial.isInTrial && !hasActivePaidSubscription;

  return (
    <>
      {/* Premium trial banner - only show if user is in trial and doesn't have paid subscription */}
      {showTrialBanner && (
        <TrialBanner
          daysLeft={trial.daysLeft}
          onSubscribe={() => router.push("/dashboard/billing")}
        />
      )}
      {children}
    </>
  );
}
