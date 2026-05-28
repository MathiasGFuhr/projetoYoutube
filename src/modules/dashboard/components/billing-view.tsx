"use client";

import { useState, useEffect } from "react";
import { Check, Loader2, Crown, Zap, RefreshCw, ArrowRight, AlertTriangle, Sparkles, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSubscription } from "@/shared/hooks/use-subscription";
import { useAuth } from "@/shared/hooks/use-auth";
import { toast } from "sonner";

export function BillingView() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const { currentPlan, plans, isLoadingPlans, subscription, trial, refetch } = useSubscription();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  // isAnnual state will be initialized after we know the active plan

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

    console.log("[billing] Subscribing to plan:", plan.slug, "priceId:", plan.stripe_price_id);
    setIsRedirecting(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          priceId: plan.stripe_price_id,
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
  const lifetimePlan = plans.find((p) => p.slug === "lifetime");

  // Determine user's active plan interval
  const activeInterval = subscription?.plan?.interval ?? subscription?.plan?.slug ?? null;
  const hasMonthlyActive = subscription?.plan?.slug === "pro-monthly";
  const hasYearlyActive = subscription?.plan?.slug === "pro-yearly";
  const hasLifetimeActive = subscription?.plan?.slug === "lifetime";
  const hasAnyActivePlan = subscription?.status === "active" && subscription.plan;

  // UI state: default to annual, but if user has monthly active, start with monthly
  const [isAnnual, setIsAnnual] = useState(() => {
    if (hasMonthlyActive) return false;
    return true;
  });

  const activePlan = isAnnual ? yearlyPlan : monthlyPlan;
  const otherPlan = isAnnual ? monthlyPlan : yearlyPlan;

  // Only allow switching: monthly → annual (upgrade)
  // Block: annual → monthly (downgrade) and lifetime → anything
  const canSwitchToMonthly = !hasAnyActivePlan || (!hasYearlyActive && !hasLifetimeActive);
  const canSwitchToAnnual = !hasAnyActivePlan || hasMonthlyActive;
  const canSwitchPlan = !hasYearlyActive && !hasLifetimeActive;

  const MONTHLY_FEATURES = [
    "Controle múltiplos canais em um só lugar",
    "Organize lançamentos sem caos",
    "Pipeline inteligente de produção",
    "Analytics avançado para creators",
    "Escale sua operação com clareza",
    "Calendário editorial profissional",
  ];

  const YEARLY_FEATURES = [
    "Tudo do plano mensal",
    "2 meses grátis por ano",
    "Prioridade em novos recursos",
    "Suporte prioritário dedicado",
    "Backup automático avançado",
    "Relatórios customizados",
  ];

  const FEATURES = isAnnual ? YEARLY_FEATURES : MONTHLY_FEATURES;

  return (
    <div className="relative min-h-[calc(100vh-3rem)] flex flex-col items-center justify-start pt-8 sm:pt-12 pb-12 px-4 overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-red-600/[0.07] blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-[20%] right-[10%] w-[300px] h-[300px] bg-red-500/[0.04] blur-[100px] rounded-full pointer-events-none" />

      <div className="relative w-full max-w-lg mx-auto">
        {/* ── Success Banner ── */}
        {showSuccess && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-500/[0.08] border border-emerald-500/20 flex items-center justify-between animate-in fade-in slide-in-from-top-2 duration-500">
            <div className="flex items-center gap-3">
              <div className="size-8 rounded-lg bg-emerald-500/15 flex items-center justify-center">
                <Check className="size-4 text-emerald-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Pagamento confirmado!</p>
                <p className="text-xs text-zinc-500">Seu plano Pro está ativo.</p>
              </div>
            </div>
            <button
              onClick={() => { refetch(); setShowSuccess(false); }}
              className="p-2 rounded-lg hover:bg-emerald-500/10 text-emerald-400 transition-colors"
            >
              <RefreshCw className="size-4" />
            </button>
          </div>
        )}

        {/* ── Hero Section ── */}
        <div className="text-center mb-8">
          {/* Trial badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/[0.08] border border-red-500/20 mb-5 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-red-500/0 via-red-500/10 to-red-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
            <Sparkles className="size-3.5 text-red-400" />
            <span className="text-[11px] font-semibold text-red-300 tracking-wide">7 DIAS GRÁTIS</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-[-0.04em] mb-3 leading-tight">
            Escolha sua{" "}
            <span className="bg-gradient-to-r from-red-400 via-red-300 to-red-500 bg-clip-text text-transparent">
              operação
            </span>
          </h1>
          <p className="text-sm sm:text-base text-zinc-500 max-w-md mx-auto leading-relaxed">
            Organize canais, lançamentos e produção em uma estrutura profissional.
          </p>
        </div>

        {/* ── Toggle ── */}
        <div className="flex justify-center mb-7">
          <div className="relative flex bg-zinc-950/80 rounded-2xl p-1 border border-zinc-800/80 backdrop-blur-sm">
            <button
              onClick={() => canSwitchToMonthly && setIsAnnual(false)}
              disabled={!canSwitchToMonthly}
              className={cn(
                "relative px-5 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-300 z-10",
                !isAnnual ? "text-white" : "text-zinc-500 hover:text-zinc-300",
                !canSwitchToMonthly && "opacity-50 cursor-not-allowed"
              )}
            >
              Mensal
            </button>
            <button
              onClick={() => canSwitchToAnnual && setIsAnnual(true)}
              disabled={!canSwitchToAnnual}
              className={cn(
                "relative px-5 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-300 z-10 flex items-center gap-2",
                isAnnual ? "text-white" : "text-zinc-500 hover:text-zinc-300",
                !canSwitchToAnnual && "opacity-50 cursor-not-allowed"
              )}
            >
              Anual
              <span className="text-[10px] bg-red-500/15 text-red-400 px-2 py-0.5 rounded-full border border-red-500/20 font-semibold">
                2 meses grátis
              </span>
            </button>
            {/* Sliding background */}
            <div
              className={cn(
                "absolute top-1 bottom-1 rounded-xl bg-zinc-800/80 border border-zinc-700/50 transition-all duration-300",
                isAnnual ? "left-[50%] right-1" : "left-1 right-[50%]"
              )}
              style={{ width: isAnnual ? "calc(50% - 4px)" : "calc(50% - 4px)" }}
            />
          </div>
        </div>

        {/* ── Loading ── */}
        {isLoadingPlans ? (
          <div className="flex justify-center py-16">
            <Loader2 className="size-6 animate-spin text-zinc-600" />
          </div>
        ) : activePlan ? (
          <>
            {/* ── Status Indicator ── */}
            {currentPlan ? (
              <div className="mb-5 flex flex-col items-center gap-2">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/[0.06] border border-emerald-500/15">
                  <div className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs text-zinc-400">
                    {hasLifetimeActive ? "Vitalício" : hasYearlyActive ? "Anual" : "Mensal"} <span className="text-emerald-400 font-medium">Ativo</span>
                  </span>
                </div>
                {hasYearlyActive && (
                  <p className="text-[11px] text-zinc-600">
                    Downgrade para mensal disponível após o término do período anual
                  </p>
                )}
                {hasLifetimeActive && (
                  <p className="text-[11px] text-zinc-600">
                    Plano vitalício — sem renovações
                  </p>
                )}
              </div>
            ) : trial.isInTrial ? (
              <div className="mb-5 flex items-center justify-center gap-2">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/[0.06] border border-amber-500/15">
                  <div className="size-1.5 rounded-full bg-amber-400 animate-pulse" />
                  <span className="text-xs text-zinc-400">
                    Teste: <span className="text-amber-400 font-medium">{trial.daysLeft}d restantes</span>
                  </span>
                </div>
              </div>
            ) : null}

            {/* ── Main Pricing Card ── */}
            <div className="relative mb-4 group">
              {/* Card glow effect */}
              <div className="absolute -inset-[1px] rounded-[22px] bg-gradient-to-b from-red-500/20 via-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

              <div className={cn(
                "relative rounded-[20px] border p-6 sm:p-8 transition-all duration-500",
                currentPlan?.id === activePlan.id
                  ? "bg-emerald-500/[0.02] border-emerald-500/20"
                  : "bg-zinc-950/60 border-zinc-800/60 backdrop-blur-xl"
              )}>
                {/* Popular badge */}
                {isAnnual && currentPlan?.id !== activePlan.id && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-600 text-white text-[10px] font-bold tracking-wide shadow-[0_0_20px_rgba(220,38,38,0.4)]">
                      <Crown className="size-3" />
                      MAIS ESCOLHIDO
                    </div>
                  </div>
                )}

                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-11 h-11 rounded-xl flex items-center justify-center transition-colors duration-300",
                      isAnnual
                        ? "bg-red-500/10 border border-red-500/20"
                        : "bg-zinc-800/80 border border-zinc-700/50"
                    )}>
                      {isAnnual ? (
                        <Crown className="size-5 text-red-400" />
                      ) : (
                        <Zap className="size-5 text-zinc-400" />
                      )}
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-white tracking-tight">StudioHub Pro</h2>
                      <p className="text-xs text-zinc-500 mt-0.5">
                        {isAnnual ? "Anual · Economize 23%" : "Mensal · Cancele quando quiser"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Price */}
                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-[15px] text-zinc-500 font-medium">R$</span>
                    <span className="text-5xl font-black text-white tracking-tight">
                      {Math.floor(activePlan.price_cents / 100)}
                    </span>
                    <span className="text-xl text-zinc-500 font-medium">
                      ,{(activePlan.price_cents % 100).toString().padStart(2, "0")}
                    </span>
                    <span className="text-sm text-zinc-600 ml-1 font-medium">/{isAnnual ? "ano" : "mês"}</span>
                  </div>
                  {isAnnual && monthlyPlan && (
                    <p className="text-xs text-zinc-600 mt-1">
                      Equivalente a {formatPrice(Math.round(monthlyPlan.price_cents * 0.77))}/mês
                    </p>
                  )}
                </div>

                {/* Subtitle */}
                <p className="text-sm text-zinc-400 mb-6 leading-relaxed">
                  Transforme sua produção em uma operação profissional.
                </p>

                {/* Divider */}
                <div className="h-px bg-gradient-to-r from-transparent via-zinc-800/80 to-transparent mb-6" />

                {/* Features */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 mb-7">
                  {FEATURES.map((f, i) => (
                    <div key={f} className="flex items-center gap-3 group/item">
                      <div className={cn(
                        "size-5 rounded-md flex items-center justify-center flex-shrink-0 transition-colors duration-300",
                        isAnnual ? "bg-red-500/10" : "bg-zinc-800/80"
                      )}>
                        <Check className={cn(
                          "size-3 transition-colors duration-300",
                          isAnnual ? "text-red-400" : "text-zinc-400"
                        )} />
                      </div>
                      <span className="text-[13px] text-zinc-400 group-hover/item:text-zinc-300 transition-colors duration-300">
                        {f}
                      </span>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                {hasAnyActivePlan ? (
                  <div className="space-y-3">
                    <div className="w-full py-3.5 rounded-xl bg-emerald-500/[0.06] border border-emerald-500/15 text-emerald-400 text-sm font-semibold flex items-center justify-center gap-2 cursor-default">
                      <Check className="size-4" />
                      Plano Ativo
                    </div>
                    {!hasLifetimeActive && (
                      <button
                        onClick={() => setShowCancelModal(true)}
                        className="w-full py-2.5 rounded-xl text-[13px] text-zinc-600 hover:text-red-400 transition-colors"
                      >
                        Cancelar assinatura
                      </button>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={() => handleSubscribe(activePlan)}
                    disabled={isRedirecting}
                    className={cn(
                      "relative w-full py-3.5 rounded-xl text-sm font-bold tracking-wide transition-all duration-300 flex items-center justify-center gap-2 overflow-hidden group/btn",
                      isAnnual
                        ? "bg-red-600 text-white shadow-[0_0_40px_rgba(220,38,38,0.3)] hover:shadow-[0_0_60px_rgba(220,38,38,0.5)] hover:bg-red-500"
                        : "bg-white text-black hover:bg-zinc-100 shadow-[0_0_30px_rgba(255,255,255,0.1)]"
                    )}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700" />
                    {isRedirecting ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <>
                        <Play className="size-4" />
                        Começar operação Pro
                      </>
                    )}
                  </button>
                )}

                {/* Microcopy */}
                <div className="mt-4 flex items-center justify-center gap-1.5">
                  <div className="size-1 rounded-full bg-zinc-700" />
                  <p className="text-[11px] text-zinc-600">
                    Pagamento seguro via Stripe · Cancele quando quiser
                  </p>
                </div>
              </div>
            </div>

            {/* ── Other Plan Teaser ── */}
            {otherPlan && currentPlan?.id !== otherPlan.id && canSwitchPlan && (
              <button
                onClick={() => setIsAnnual(!isAnnual)}
                className="w-full group relative rounded-2xl border border-zinc-800/60 bg-zinc-950/40 p-5 backdrop-blur-sm hover:border-zinc-700/60 transition-all duration-300"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center group-hover:border-zinc-700 transition-colors">
                      {isAnnual ? (
                        <Zap className="size-4 text-zinc-500 group-hover:text-zinc-400 transition-colors" />
                      ) : (
                        <Crown className="size-4 text-zinc-500 group-hover:text-zinc-400 transition-colors" />
                      )}
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium text-zinc-300 group-hover:text-white transition-colors">
                        Plano {isAnnual ? "mensal" : "anual"}
                      </p>
                      <p className="text-xs text-zinc-600">
                        {isAnnual ? "Mais flexível" : "Melhor custo-benefício"}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-zinc-400 group-hover:text-white transition-colors">
                      {formatPrice(otherPlan.price_cents)}
                    </p>
                    <p className="text-[11px] text-zinc-600">/{isAnnual ? "mês" : "ano"}</p>
                  </div>
                </div>
              </button>
            )}
          </>
        ) : null}
      </div>

      {/* ── Cancel Modal ── */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-3xl bg-zinc-950 border border-zinc-800 p-7 shadow-2xl shadow-black/80 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-center mb-5">
              <div className="size-14 rounded-2xl bg-red-500/[0.08] border border-red-500/20 flex items-center justify-center">
                <AlertTriangle className="size-7 text-red-400" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-white text-center mb-2">Cancelar assinatura?</h3>
            <p className="text-sm text-zinc-500 text-center mb-7 leading-relaxed">
              Você continuará com acesso Pro até o fim do período pago.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 text-sm font-medium hover:bg-zinc-800 transition-colors"
              >
                Manter plano
              </button>
              <button
                onClick={handleCancel}
                disabled={isCancelling}
                className="flex-1 py-3 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-500 transition-colors flex items-center justify-center gap-2"
              >
                {isCancelling ? <Loader2 className="size-4 animate-spin" /> : null}
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
