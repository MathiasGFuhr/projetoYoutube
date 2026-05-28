"use client";

import { useState } from "react";
import { Check, Loader2, Crown, Zap, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSubscription } from "@/shared/hooks/use-subscription";
import { useAuth } from "@/shared/hooks/use-auth";
import { toast } from "sonner";

const PLAN_META: Record<string, { icon: typeof Zap; gradient: string; accent: string }> = {
  "pro-monthly": { icon: Zap, gradient: "from-blue-500/20 to-cyan-500/20", accent: "#3b82f6" },
  "pro-yearly": { icon: Crown, gradient: "from-violet-500/20 to-fuchsia-500/20", accent: "#a855f7" },
};

export function BillingView() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const { currentPlan, plans, isLoadingPlans, subscription, isActive } = useSubscription();
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

  const monthlyPlan = plans.find((p) => p.slug === "pro-monthly");
  const yearlyPlan = plans.find((p) => p.slug === "pro-yearly");

  return (
    <div className="p-4 sm:p-6 lg:p-8 min-h-screen max-w-6xl mx-auto">
      {/* ── Header ── */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-[11px] font-medium text-zinc-400 mb-4">
          <Shield className="size-3 text-red-400" />
          Escolha seu plano
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-2">
          Planos e Assinatura
        </h1>
        <p className="text-sm text-zinc-500 max-w-md mx-auto">
          Desbloqueie todo o potencial do StudioHub. Escolha o plano que melhor se encaixa no seu crescimento.
        </p>
      </div>

      {/* ── Current Plan Status ── */}
      {currentPlan ? (
        <div className="mb-8 p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <Check className="size-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">
                {currentPlan.name} <span className="text-emerald-400 text-xs font-bold uppercase ml-1">Ativo</span>
              </p>
              {subscription?.current_period_end && (
                <p className="text-xs text-zinc-500">
                  Renova em {new Date(subscription.current_period_end).toLocaleDateString("pt-BR")}
                </p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="mb-8 p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-zinc-800 flex items-center justify-center">
              <Zap className="size-5 text-zinc-500" />
            </div>
            <div>
              <p className="text-sm font-semibold text-zinc-300">Sem plano ativo</p>
              <p className="text-xs text-zinc-500">Você está no modo limitado. Assine para liberar tudo.</p>
            </div>
          </div>
        </div>
      )}

      {/* ── Plan Cards ── */}
      {isLoadingPlans ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="size-7 animate-spin text-zinc-600" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {monthlyPlan && (
            <PlanCard
              plan={monthlyPlan}
              meta={PLAN_META["pro-monthly"]}
              isCurrent={currentPlan?.id === monthlyPlan.id}
              isRedirecting={isRedirecting}
              onSubscribe={() => handleSubscribe(monthlyPlan)}
              formatPrice={formatPrice}
            />
          )}
          {yearlyPlan && (
            <PlanCard
              plan={yearlyPlan}
              meta={PLAN_META["pro-yearly"]}
              isCurrent={currentPlan?.id === yearlyPlan.id}
              isRedirecting={isRedirecting}
              onSubscribe={() => handleSubscribe(yearlyPlan)}
              formatPrice={formatPrice}
              popular
            />
          )}
        </div>
      )}

      {/* ── Trust ── */}
      <div className="mt-10 text-center">
        <p className="text-xs text-zinc-600">
          Pagamento seguro via Stripe. Cancele a qualquer momento. Sem taxas ocultas.
        </p>
      </div>
    </div>
  );
}

/* ── Plan Card Component ── */
function PlanCard({
  plan,
  meta,
  isCurrent,
  isRedirecting,
  onSubscribe,
  formatPrice,
  popular,
}: {
  plan: any;
  meta: { icon: typeof Zap; gradient: string; accent: string };
  isCurrent: boolean;
  isRedirecting: boolean;
  onSubscribe: () => void;
  formatPrice: (cents: number) => string;
  popular?: boolean;
}) {
  const Icon = meta.icon;
  const features = Array.isArray(plan.features) ? plan.features : [];

  return (
    <div
      className={cn(
        "relative flex flex-col rounded-3xl border transition-all duration-500 overflow-hidden",
        isCurrent
          ? "bg-zinc-900/80 border-emerald-500/30 shadow-[0_0_40px_-12px_rgba(16,185,129,0.15)]"
          : "bg-[#0f0f10] border-zinc-800/60 hover:border-zinc-700/80 hover:shadow-[0_0_60px_-15px_rgba(255,255,255,0.05)]"
      )}
    >
      {/* Popular badge */}
      {popular && !isCurrent && (
        <div className="absolute top-0 right-6 -translate-y-1/2">
          <div className="px-4 py-1.5 rounded-full bg-gradient-to-r from-red-600 to-red-500 text-white text-[11px] font-bold shadow-lg shadow-red-500/25">
            Melhor custo-benefício
          </div>
        </div>
      )}

      {/* Current badge */}
      {isCurrent && (
        <div className="absolute top-4 right-4">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            <Check className="size-3 text-emerald-400" />
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Ativo</span>
          </div>
        </div>
      )}

      {/* Card content */}
      <div className="p-6 sm:p-8 flex-1">
        {/* Icon */}
        <div
          className={cn(
            "w-12 h-12 rounded-2xl flex items-center justify-center mb-5 bg-gradient-to-br",
            meta.gradient
          )}
          style={{ boxShadow: `0 8px 32px ${meta.accent}20` }}
        >
          <Icon className="size-6 text-white" />
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-white mb-1">{plan.name}</h3>
        <p className="text-sm text-zinc-500 mb-6">
          {plan.interval === "month" ? "Pague mensalmente" : "Economize com pagamento anual"}
        </p>

        {/* Price */}
        <div className="flex items-baseline gap-1 mb-8">
          <span className="text-4xl font-black text-white tracking-tight">
            {formatPrice(plan.price_cents)}
          </span>
          <span className="text-sm text-zinc-500">
            /{plan.interval === "month" ? "mês" : "ano"}
          </span>
        </div>

        {/* Divider */}
        <div className="h-px bg-zinc-800/80 mb-6" />

        {/* Features */}
        <ul className="space-y-3.5">
          <FeatureRow iconColor={meta.accent} text={`${plan.channel_limit} canal${plan.channel_limit > 1 ? "es" : ""}`} />
          <FeatureRow iconColor={meta.accent} text={`${plan.video_limit} vídeo${plan.video_limit > 1 ? "s" : ""}/mês`} />
          <FeatureRow iconColor={meta.accent} text={`${plan.team_limit} membro${plan.team_limit > 1 ? "s" : ""}`} />
          <FeatureRow iconColor={meta.accent} text={`Analytics ${plan.analytics_level}`} />
          {features.map((f: any, i: number) => (
            <FeatureRow key={i} iconColor={meta.accent} text={typeof f === "string" ? f : ""} />
          ))}
        </ul>
      </div>

      {/* CTA */}
      <div className="px-6 sm:px-8 pb-6 sm:pb-8">
        {isCurrent ? (
          <button
            disabled
            className="w-full py-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-semibold text-sm cursor-default flex items-center justify-center gap-2"
          >
            <Check className="size-4" />
            Plano Atual
          </button>
        ) : (
          <button
            onClick={onSubscribe}
            disabled={isRedirecting || !plan.stripe_price_id}
            className={cn(
              "w-full py-3.5 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center justify-center gap-2",
              popular
                ? "bg-white text-black hover:bg-zinc-200 shadow-[0_8px_30px_rgba(255,255,255,0.12)]"
                : "bg-zinc-800 text-white hover:bg-zinc-700 border border-zinc-700/50"
            )}
          >
            {isRedirecting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : null}
            {plan.price_cents === 0 ? "Começar Grátis" : "Assinar Agora"}
          </button>
        )}
      </div>
    </div>
  );
}

function FeatureRow({ text, iconColor }: { text: string; iconColor: string }) {
  if (!text) return null;
  return (
    <li className="flex items-center gap-3">
      <div
        className="size-5 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: `${iconColor}15` }}
      >
        <Check className="size-3" style={{ color: iconColor }} />
      </div>
      <span className="text-sm text-zinc-400">{text}</span>
    </li>
  );
}
