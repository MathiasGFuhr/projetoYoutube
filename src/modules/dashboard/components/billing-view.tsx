"use client";

import { useState, useEffect } from "react";
import { Check, Loader2, Crown, Zap, RefreshCw, ArrowRight, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSubscription } from "@/shared/hooks/use-subscription";
import { useAuth } from "@/shared/hooks/use-auth";
import { toast } from "sonner";

export function BillingView() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const { currentPlan, plans, isLoadingPlans, subscription, trial, refetch } = useSubscription();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isAnnual, setIsAnnual] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("success") === "1") {
      setShowSuccess(true);
      window.history.replaceState({}, "", window.location.pathname);
      const timer = setTimeout(() => setShowSuccess(false), 8000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleCancel = async () => {
    setIsCancelling(true);
    try {
      const res = await fetch("/api/stripe/cancel", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao cancelar");
      toast.success("Assinatura cancelada. Você pode usar até o fim do período pago.");
      refetch();
    } catch (err: any) {
      toast.error(err.message || "Erro ao cancelar assinatura.");
    } finally {
      setIsCancelling(false);
      setShowCancelModal(false);
    }
  };

  const handleSubscribe = async (plan: typeof plans[0]) => {
    if (isAuthLoading) {
      toast.loading("Carregando...");
      return;
    }
    if (!user?.email) {
      toast.error("Você precisa estar logado para assinar um plano.");
      return;
    }
    if (!plan.stripe_price_id) {
      toast.error("Este plano ainda não está disponível para assinatura.");
      return;
    }

    setIsRedirecting(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          priceId: plan.stripe_price_id,
          userId: user.id,
          email: user.email,
          planId: plan.id,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao criar checkout");
      window.location.href = data.url;
    } catch (err: any) {
      toast.error(err.message || "Erro ao redirecionar para o Stripe.");
      setIsRedirecting(false);
    }
  };

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(cents / 100);
  };

  const monthlyPlan = plans.find((p) => p.slug === "pro-monthly");
  const yearlyPlan = plans.find((p) => p.slug === "pro-yearly");
  const activePlan = isAnnual ? yearlyPlan : monthlyPlan;
  const otherPlan = isAnnual ? monthlyPlan : yearlyPlan;

  const FEATURES = [
    "Centralize toda sua operação YouTube",
    "Organize lançamentos sem caos",
    "Gerencie múltiplos canais em um só lugar",
    "Pipeline inteligente de produção",
    "Analytics para decisões estratégicas",
    "Controle profissional do conteúdo",
  ];

  return (
    <div className="p-4 sm:p-6 flex flex-col items-center justify-center min-h-[calc(100vh-3rem)]">
      <div className="w-full max-w-xl">
        {/* ── Header ── */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-white mb-1">Planos</h1>
          <p className="text-xs text-zinc-500">Escolha a frequência de pagamento</p>
        </div>

        {/* ── Success ── */}
        {showSuccess && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Check className="size-4 text-emerald-400" />
              <span className="text-xs text-zinc-300">Pagamento confirmado! Ative seu plano.</span>
            </div>
            <button onClick={() => { refetch(); setShowSuccess(false); }} className="text-emerald-400 hover:text-emerald-300">
              <RefreshCw className="size-3.5" />
            </button>
          </div>
        )}

        {/* ── Toggle ── */}
        <div className="flex justify-center mb-6">
          <div className="flex bg-zinc-900 rounded-lg p-0.5 border border-zinc-800">
            <button
              onClick={() => setIsAnnual(false)}
              className={cn(
                "px-4 py-1.5 rounded-md text-xs font-medium transition-all",
                !isAnnual ? "bg-zinc-700 text-white" : "text-zinc-500 hover:text-zinc-300"
              )}
            >
              Mensal
            </button>
            <button
              onClick={() => setIsAnnual(true)}
              className={cn(
                "px-4 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5",
                isAnnual ? "bg-zinc-700 text-white" : "text-zinc-500 hover:text-zinc-300"
              )}
            >
              Anual
              <span className="text-[9px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded-full">-23%</span>
            </button>
          </div>
        </div>

        {/* ── Loading ── */}
        {isLoadingPlans ? (
          <div className="flex justify-center py-12">
            <Loader2 className="size-5 animate-spin text-zinc-600" />
          </div>
        ) : activePlan ? (
          <>
            {/* ── Current Status ── */}
            {currentPlan ? (
              <div className="mb-4 flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                <div className="size-2 rounded-full bg-emerald-400" />
                <span className="text-xs text-zinc-300">
                  {currentPlan.name} <span className="text-emerald-400">Ativo</span>
                  {subscription?.current_period_end && (
                    <span className="text-zinc-600 ml-1">
                      · Renova {new Date(subscription.current_period_end).toLocaleDateString("pt-BR")}
                    </span>
                  )}
                </span>
              </div>
            ) : trial.isInTrial ? (
              <div className="mb-4 flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-500/5 border border-amber-500/10">
                <div className="size-2 rounded-full bg-amber-400 animate-pulse" />
                <span className="text-xs text-zinc-300">
                  Teste gratuito <span className="text-amber-400 font-medium">{trial.daysLeft} dia{trial.daysLeft !== 1 ? "s" : ""} restante{trial.daysLeft !== 1 ? "s" : ""}</span>
                </span>
              </div>
            ) : (
              <div className="mb-4 flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800">
                <div className="size-2 rounded-full bg-zinc-600" />
                <span className="text-xs text-zinc-500">Sem plano ativo · Teste expirado</span>
              </div>
            )}

            {/* ── Main Card ── */}
            <div className={cn(
              "rounded-2xl border p-5 mb-4",
              currentPlan?.id === activePlan.id
                ? "bg-emerald-500/[0.03] border-emerald-500/20"
                : "bg-zinc-900/50 border-zinc-800/60"
            )}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center",
                    isAnnual ? "bg-violet-500/15" : "bg-blue-500/15"
                  )}>
                    {isAnnual ? (
                      <Crown className="size-5 text-violet-400" />
                    ) : (
                      <Zap className="size-5 text-blue-400" />
                    )}
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-white">Pro {isAnnual ? "Anual" : "Mensal"}</h2>
                    <p className="text-[11px] text-zinc-500">
                      {isAnnual ? "Economize R$ 35,88/ano" : "Cancele quando quiser"}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-white">
                    {formatPrice(activePlan.price_cents)}
                  </div>
                  <div className="text-[11px] text-zinc-500">/{isAnnual ? "ano" : "mês"}</div>
                </div>
              </div>

              {/* ── Features ── */}
              <div className="grid grid-cols-2 gap-x-6 gap-y-2 mb-5">
                {FEATURES.map((f) => (
                  <div key={f} className="flex items-center gap-2">
                    <Check className={cn("size-3.5 flex-shrink-0", isAnnual ? "text-violet-400" : "text-blue-400")} />
                    <span className="text-xs text-zinc-400">{f}</span>
                  </div>
                ))}
              </div>

              {/* ── CTA ── */}
              {currentPlan?.id === activePlan.id ? (
                <div className="space-y-2">
                  <button disabled className="w-full py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-default">
                    <Check className="size-3.5" />
                    Plano Atual
                  </button>
                  <button
                    onClick={() => setShowCancelModal(true)}
                    className="w-full py-2 rounded-xl text-[11px] text-zinc-500 hover:text-red-400 transition-colors"
                  >
                    Cancelar assinatura
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => handleSubscribe(activePlan)}
                  disabled={isRedirecting}
                  className={cn(
                    "w-full py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5",
                    isAnnual
                      ? "bg-white text-black hover:bg-zinc-200"
                      : "bg-zinc-800 text-white hover:bg-zinc-700 border border-zinc-700"
                  )}
                >
                  {isRedirecting ? <Loader2 className="size-3.5 animate-spin" /> : null}
                  Assinar {isAnnual ? "Anual" : "Mensal"}
                  {!isRedirecting && <ArrowRight className="size-3" />}
                </button>
              )}
            </div>

            {/* ── Other Option ── */}
            {otherPlan && currentPlan?.id !== otherPlan.id && (
              <button
                onClick={() => setIsAnnual(!isAnnual)}
                className="w-full py-2.5 rounded-xl border border-zinc-800 text-zinc-500 text-xs hover:text-zinc-300 hover:border-zinc-700 transition-all"
              >
                Ver plano {isAnnual ? "mensal" : "anual"} · {formatPrice(otherPlan.price_cents)}/{isAnnual ? "mês" : "ano"}
              </button>
            )}
          </>
        ) : null}

        <p className="mt-4 text-center text-[10px] text-zinc-700">
          Pagamento seguro via Stripe · Cancele quando quiser
        </p>
      </div>

      {/* ── Cancel Modal ── */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-[#111] border border-zinc-800 p-6 shadow-2xl">
            <div className="flex items-center justify-center mb-4">
              <div className="size-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                <AlertTriangle className="size-6 text-red-400" />
              </div>
            </div>
            <h3 className="text-lg font-bold text-white text-center mb-2">Cancelar assinatura?</h3>
            <p className="text-sm text-zinc-400 text-center mb-6">
              Você continuará com acesso até o fim do período pago ({subscription?.current_period_end ? new Date(subscription.current_period_end).toLocaleDateString("pt-BR") : ""}).
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 text-xs font-semibold hover:bg-zinc-800 transition-colors"
              >
                Manter plano
              </button>
              <button
                onClick={handleCancel}
                disabled={isCancelling}
                className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-xs font-semibold hover:bg-red-500 transition-colors flex items-center justify-center gap-1.5"
              >
                {isCancelling ? <Loader2 className="size-3.5 animate-spin" /> : null}
                Confirmar cancelamento
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
