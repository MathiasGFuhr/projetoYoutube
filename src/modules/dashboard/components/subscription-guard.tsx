"use client";

import { Lock, ArrowRight, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useSubscription } from "@/shared/hooks/use-subscription";

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
      {/* Trial banner */}
      {trial.isInTrial && (
        <div className="mb-4 flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
          <Sparkles className="size-3.5 text-amber-400" />
          <span className="text-xs text-amber-300">
            Teste gratuito: <span className="font-bold">{trial.daysLeft} dia{trial.daysLeft !== 1 ? "s" : ""}</span> restante{trial.daysLeft !== 1 ? "s" : ""}
          </span>
          <button
            onClick={() => router.push("/dashboard/billing")}
            className="ml-auto text-[10px] text-amber-400 hover:text-amber-300 font-medium underline"
          >
            Assinar agora
          </button>
        </div>
      )}
      {children}
    </>
  );
}
