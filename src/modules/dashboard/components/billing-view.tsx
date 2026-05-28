"use client";

import { useState } from "react";
import { CreditCard, Check, Loader2, Crown, Zap, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSubscription } from "@/shared/hooks/use-subscription";
import { useAuth } from "@/shared/hooks/use-auth";
import { toast } from "sonner";

const PLAN_ICONS: Record<string, React.ReactNode> = {
  "pro-monthly": <Zap className="size-5" />,
  "pro-yearly": <Crown className="size-5" />,
};

const PLAN_COLORS: Record<string, string> = {
  "pro-monthly": "#3b82f6",
  "pro-yearly": "#a855f7",
};

export function BillingView() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const { currentPlan, plans, isLoading, isLoadingPlans, subscription, isActive } = useSubscription();
  const [isRedirecting, setIsRedirecting] = useState(false);

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

  return (
    <div className="p-4 sm:p-6 min-h-screen">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="size-9 rounded-xl bg-amber-500/15 border border-amber-500/25 flex items-center justify-center flex-shrink-0">
          <CreditCard className="size-4.5 text-amber-400" />
        </div>
        <div>
          <h1 className="text-xl font-black text-zinc-100 leading-none">Planos e Assinatura</h1>
          <p className="text-[11px] text-zinc-500 mt-0.5">Gerencie seu plano e visualize os benefícios</p>
        </div>
      </div>

      {/* Current plan badge */}
      <div className="rounded-2xl bg-zinc-900/50 border border-zinc-800/50 p-5 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1">Plano Atual</p>
            <div className="flex items-center gap-2">
              {currentPlan ? (
                <>
                  <span
                    className="size-2.5 rounded-full"
                    style={{ backgroundColor: PLAN_COLORS[currentPlan.slug], boxShadow: `0 0 8px ${PLAN_COLORS[currentPlan.slug]}60` }}
                  />
                  <span className="text-lg font-bold text-zinc-100">{currentPlan.name}</span>
                  <span className={cn(
                    "text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full",
                    isActive ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25" : "bg-zinc-800 text-zinc-500 border border-zinc-700"
                  )}>
                    {subscription?.status === "canceled" ? "Cancelado" : "Ativo"}
                  </span>
                </>
              ) : (
                <>
                  <span className="size-2.5 rounded-full bg-zinc-600" />
                  <span className="text-lg font-bold text-zinc-400">Sem plano ativo</span>
                  <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-500 border border-zinc-700">
                    Inativo
                  </span>
                </>
              )}
            </div>
            {subscription?.current_period_end && (
              <p className="text-[11px] text-zinc-600 mt-1">
                Renova em {new Date(subscription.current_period_end).toLocaleDateString("pt-BR")}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Plan cards */}
      {isLoadingPlans ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="size-6 animate-spin text-zinc-600" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {plans.map((plan) => {
            const isCurrent = currentPlan?.id === plan.id;
            const color = PLAN_COLORS[plan.slug] ?? "#ef4444";
            const features = Array.isArray(plan.features) ? plan.features : [];

            return (
              <div
                key={plan.id}
                className={cn(
                  "relative flex flex-col rounded-2xl border overflow-hidden transition-all duration-300",
                  isCurrent
                    ? "bg-zinc-900/80 border-zinc-600/60"
                    : "bg-zinc-950/60 border-zinc-800/50 hover:border-zinc-700/60"
                )}
                style={isCurrent ? { boxShadow: `0 0 0 1px ${color}30, 0 20px 60px rgba(0,0,0,0.3)` } : {}}
              >
                {isCurrent && (
                  <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: `linear-gradient(90deg, ${color}cc, ${color}66)` }} />
                )}

                <div className="p-5 flex-1">
                  <div className="flex items-center gap-2.5 mb-3">
                    <div
                      className="flex items-center justify-center size-9 rounded-xl border"
                      style={{ borderColor: `${color}40`, background: `${color}15`, color }}
                    >
                      {PLAN_ICONS[plan.slug] ?? <Zap className="size-4" />}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-zinc-100">{plan.name}</p>
                      <p className="text-[10px] text-zinc-500">{plan.interval === "month" ? "Mensal" : "Anual"}</p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <span className="text-3xl font-black text-zinc-100">{formatPrice(plan.price_cents)}</span>
                    <span className="text-xs text-zinc-500">/{plan.interval === "month" ? "mês" : "ano"}</span>
                  </div>

                  <div className="space-y-2 mb-5">
                    <FeatureItem text={`${plan.channel_limit} canal${plan.channel_limit > 1 ? "es" : ""}`} />
                    <FeatureItem text={`${plan.video_limit} vídeo${plan.video_limit > 1 ? "s" : ""}/mês`} />
                    <FeatureItem text={`${plan.team_limit} membro${plan.team_limit > 1 ? "s" : ""}`} />
                    <FeatureItem text={`Analytics ${plan.analytics_level}`} />
                    {features.map((f, i) => (
                      <FeatureItem key={i} text={typeof f === "string" ? f : ""} />
                    ))}
                  </div>
                </div>

                <div className="p-5 pt-0">
                  {isCurrent ? (
                    <button
                      disabled
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-zinc-800 text-[11px] font-bold uppercase tracking-widest text-zinc-400 cursor-default"
                    >
                      <Check className="size-3.5" />
                      Plano Atual
                    </button>
                  ) : (
                    <button
                      onClick={() => handleSubscribe(plan)}
                      disabled={isRedirecting || !plan.stripe_price_id}
                      className={cn(
                        "w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all",
                        plan.price_cents === 0
                          ? "bg-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700"
                          : "bg-red-600 hover:bg-red-500 text-white shadow-[0_4px_20px_rgba(255,31,31,0.25)]"
                      )}
                    >
                      {isRedirecting && plan.stripe_price_id ? (
                        <Loader2 className="size-3.5 animate-spin" />
                      ) : null}
                      {plan.price_cents === 0 ? "Começar Grátis" : "Assinar Agora"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function FeatureItem({ text }: { text: string }) {
  if (!text) return null;
  return (
    <div className="flex items-center gap-2">
      <Check className="size-3 text-emerald-500 flex-shrink-0" />
      <span className="text-[11px] text-zinc-400">{text}</span>
    </div>
  );
}
