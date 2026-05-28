import Link from "next/link";
import type { ReactNode } from "react";
import {
  ArrowRight,
  BarChart3,
  CalendarCheck,
  Check,
  Clapperboard,
  Clock3,
  Crown,
  MessageSquareQuote,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
  Workflow,
  Zap,
} from "lucide-react";
import { SmoothAnchor } from "@/components/ui/smooth-anchor";
import ShaderBackground from "@/components/ui/shader-background";

const features = [
  {
    icon: CalendarCheck,
    title: "Calendário editorial",
    description:
      "Visualize datas, colisões de agenda e publicações planejadas em todos os canais.",
  },
  {
    icon: Workflow,
    title: "Pipeline de produção",
    description:
      "Controle roteiro, thumbnail, edição, render e publicação em uma visão profissional.",
  },
  {
    icon: BarChart3,
    title: "Gestão multi-canais",
    description:
      "Organize marcas, nichos, canais e projetos sem perder contexto operacional.",
  },
  {
    icon: Sparkles,
    title: "Notificações e prazos",
    description:
      "Acompanhe entregas com alertas de prazo para nunca atrasar uma publicação.",
  },
];

const plans = [
  {
    name: "Mensal",
    price: "R$ 12,99",
    period: "/mês",
    description: "Ideal para criadores que querem organizar a produção sem complicação.",
    highlight: false,
    features: [
      "Calendário editorial",
      "Pipeline de produção de vídeos",
      "Gestão de canais e projetos",
      "Histórico de status e entregas",
    ],
  },
  {
    name: "Anual",
    price: "R$ 120,00",
    period: "/ano",
    description: "Melhor custo-benefício para canais e equipes que produzem todo mês.",
    highlight: true,
    features: [
      "Tudo do plano mensal",
      "Economia de quase 23%",
      "Suporte prioritário",
      "Organização para múltiplos canais",
    ],
  },
];

const testimonials = [
  {
    name: "Marina Costa",
    role: "Gestora de Canal",
    text: "O StudioHub mudou nossa rotina. Agora sabemos exatamente o que está em roteiro, edição, thumbnail e publicação.",
  },
  {
    name: "Rafael Mendes",
    role: "Editor e Produtor",
    text: "Antes o conteúdo ficava espalhado em planilhas e mensagens. Hoje cada vídeo tem status, histórico e responsável claro.",
  },
  {
    name: "Bianca Rocha",
    role: "Criadora de Conteúdo",
    text: "Finalmente uma ferramenta pensada para produção de YouTube: calendário, pipeline e ideias em uma única base.",
  },
];

export default function LandingPage() {
  return (
    <div className="relative min-h-screen bg-[#050505] text-zinc-100">
      <ShaderBackground />
      <div className="pointer-events-none fixed inset-0 z-[1] bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(255,31,31,0.06),transparent),linear-gradient(180deg,rgba(5,5,5,0.15),rgba(5,5,5,0.55))]" />
      <div className="pointer-events-none fixed inset-0 z-[1] opacity-[0.02] [background-image:linear-gradient(rgba(255,255,255,0.6)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.6)_1px,transparent_1px)] [background-size:48px_48px]" />

      <header className="fixed left-0 right-0 top-0 z-50 border-b border-zinc-900/80 bg-[#050505]/80 backdrop-blur-2xl shadow-[0_18px_60px_rgba(0,0,0,0.35)]">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-2xl border border-red-500/30 bg-red-500/15 shadow-[0_0_30px_rgba(255,31,31,0.18)]">
              <Clapperboard className="size-5 text-red-300" />
            </div>
            <div>
              <p className="text-sm font-semibold tracking-wide">StudioHub</p>
              <p className="text-xs text-zinc-500">Operação para YouTube</p>
            </div>
          </Link>

          <nav className="hidden items-center gap-8 text-sm text-zinc-400 md:flex">
            <SmoothAnchor href="#recursos" className="transition-colors hover:text-zinc-100">
              Recursos
            </SmoothAnchor>
            <SmoothAnchor href="#planos" className="transition-colors hover:text-zinc-100">
              Planos
            </SmoothAnchor>
            <SmoothAnchor href="#comentarios" className="transition-colors hover:text-zinc-100">
              Comentários
            </SmoothAnchor>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/auth"
              className="hidden rounded-xl px-4 py-2 text-sm font-medium text-zinc-400 transition-colors hover:text-zinc-100 sm:inline-flex"
            >
              Entrar
            </Link>
            <Link
              href="/auth"
              className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(255,31,31,0.22)] transition-all hover:bg-red-500"
            >
              Começar agora
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </header>

      <main className="relative z-10 overflow-x-hidden">

      <section className="landing-reveal-once mx-auto flex min-h-screen max-w-7xl flex-col items-center justify-center px-6 pb-24 pt-[calc(5rem+4rem)] text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-red-500/20 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-200">
          <Sparkles className="size-4" />
          Operação premium para YouTube
        </div>

        <h1 className="max-w-5xl text-5xl font-semibold tracking-[-0.04em] text-zinc-50 sm:text-6xl lg:text-7xl">
          Transforme produção de vídeos em uma operação de elite.
        </h1>

        <p className="mt-6 max-w-2xl text-base leading-8 text-zinc-400 sm:text-lg">
          Centralize canais, calendário editorial, pipeline, roteiros, thumbnails,
          status e histórico em uma única base profissional para escalar conteúdo
          com controle total.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/auth"
            className="inline-flex h-13 items-center justify-center gap-2 rounded-2xl bg-red-600 px-7 py-4 text-sm font-semibold text-white shadow-[0_18px_50px_rgba(255,31,31,0.28)] transition-all hover:-translate-y-0.5 hover:bg-red-500"
          >
            Criar minha conta
            <ArrowRight className="size-4" />
          </Link>
          <SmoothAnchor
            href="#planos"
            className="inline-flex h-13 items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-950/70 px-7 py-4 text-sm font-semibold text-zinc-300 transition-all hover:border-zinc-700 hover:text-zinc-100"
          >
            Ver planos
          </SmoothAnchor>
        </div>

        <div className="mt-16 grid w-full max-w-5xl gap-4 rounded-[28px] border border-zinc-800/80 bg-zinc-950/70 p-4 text-left shadow-[0_40px_120px_rgba(0,0,0,0.55)] backdrop-blur-xl md:grid-cols-3">
          <HeroMetric icon={<Users className="size-5" />} value="Multi" label="canais organizados" />
          <HeroMetric icon={<Clock3 className="size-5" />} value="Zero" label="colisões de agenda" />
          <HeroMetric icon={<Zap className="size-5" />} value="100%" label="rastreável por vídeo" />
        </div>
      </section>

      <section id="recursos" className="landing-reveal relative z-10 mx-auto max-w-7xl scroll-mt-28 px-6 py-24">
        <SectionHeader
          eyebrow="Operação"
          title="Tudo para controlar produção de conteúdo em escala."
          description="Do calendário ao histórico de publicação, cada vídeo passa por um fluxo claro e rastreável."
        />
        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-[24px] border border-zinc-800/80 bg-zinc-950/60 p-6 transition-all hover:-translate-y-1 hover:border-red-500/30 hover:bg-zinc-950"
            >
              <div className="mb-5 flex size-12 items-center justify-center rounded-2xl bg-red-500/10 text-red-300">
                <feature.icon className="size-5" />
              </div>
              <h3 className="text-lg font-semibold text-zinc-100">{feature.title}</h3>
              <p className="mt-3 text-sm leading-6 text-zinc-500">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="landing-reveal relative z-10 mx-auto max-w-7xl px-6 py-24">
        <div className="grid items-center gap-12 rounded-[32px] border border-zinc-800/80 bg-zinc-950/70 p-8 shadow-[0_40px_120px_rgba(0,0,0,0.45)] md:grid-cols-2 md:p-12">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-red-400">
              Controle editorial
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-zinc-50 sm:text-4xl">
              Transforme ideias soltas em um pipeline profissional de vídeos.
            </h2>
            <p className="mt-5 text-sm leading-7 text-zinc-400">
              O StudioHub foi pensado para criadores, editores, produtores e gestores
              que precisam controlar volume, manter consistência e publicar com previsibilidade.
            </p>
          </div>

          <div className="grid gap-4">
            {[
              "Calendário editorial com visão por canal",
              "Pipeline com status de roteiro, thumbnail, edição e render",
              "Histórico centralizado para escalar sem perder contexto",
            ].map((item) => (
              <div key={item} className="flex items-center gap-3 rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-4">
                <div className="flex size-8 items-center justify-center rounded-full bg-red-500/10 text-red-300">
                  <Check className="size-4" />
                </div>
                <p className="text-sm text-zinc-300">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="planos" className="landing-reveal relative z-10 mx-auto max-w-7xl scroll-mt-28 px-6 py-24">
        <SectionHeader
          eyebrow="Planos"
          title="Planos simples para organizar seu canal como uma operação."
          description="Escolha entre pagar mensalmente ou economizar no plano anual."
        />
        <div className="mx-auto mt-12 grid max-w-5xl gap-6 md:grid-cols-2">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-[28px] border p-7 ${
                plan.highlight
                  ? "border-red-500/40 bg-red-500/[0.07] shadow-[0_30px_90px_rgba(255,31,31,0.16)]"
                  : "border-zinc-800/80 bg-zinc-950/70"
              }`}
            >
              {plan.highlight && (
                <div className="absolute right-6 top-6 inline-flex items-center gap-2 rounded-full bg-red-600 px-3 py-1 text-xs font-semibold text-white">
                  <Crown className="size-3.5" />
                  Recomendado
                </div>
              )}
              <h3 className="text-xl font-semibold text-zinc-50">{plan.name}</h3>
              <p className="mt-2 max-w-xs text-sm text-zinc-500">{plan.description}</p>
              <div className="mt-8 flex items-end gap-2">
                <span className="text-4xl font-semibold tracking-tight text-zinc-50">
                  {plan.price}
                </span>
                <span className="pb-1 text-sm text-zinc-500">{plan.period}</span>
              </div>
              <Link
                href="/auth"
                className={`mt-8 inline-flex h-12 w-full items-center justify-center rounded-2xl text-sm font-semibold transition-all ${
                  plan.highlight
                    ? "bg-red-600 text-white hover:bg-red-500"
                    : "border border-zinc-800 bg-zinc-900/60 text-zinc-200 hover:border-zinc-700 hover:bg-zinc-900"
                }`}
              >
                Começar com plano {plan.name.toLowerCase()}
              </Link>
              <div className="mt-8 space-y-4">
                {plan.features.map((feature) => (
                  <div key={feature} className="flex items-center gap-3">
                    <Check className="size-4 text-red-300" />
                    <span className="text-sm text-zinc-400">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="comentarios" className="landing-reveal relative z-10 mx-auto max-w-7xl scroll-mt-28 px-6 py-24">
        <SectionHeader
          eyebrow="Comentários"
          title="Criado para quem vive a rotina intensa de produção para YouTube."
          description="Veja como criadores e equipes ganham clareza ao centralizar o fluxo de vídeos."
        />
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.name}
              className="rounded-[24px] border border-zinc-800/80 bg-zinc-950/70 p-6"
            >
              <MessageSquareQuote className="size-6 text-red-300" />
              <p className="mt-5 text-sm leading-7 text-zinc-400">“{testimonial.text}”</p>
              <div className="mt-6 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-zinc-100">{testimonial.name}</p>
                  <p className="text-xs text-zinc-500">{testimonial.role}</p>
                </div>
                <div className="flex text-red-300">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star key={index} className="size-3.5 fill-current" />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="landing-reveal relative z-10 mx-auto max-w-5xl px-6 py-24 text-center">
        <div className="rounded-[32px] border border-red-500/20 bg-red-500/[0.07] px-6 py-14 shadow-[0_30px_100px_rgba(255,31,31,0.14)]">
          <h2 className="text-3xl font-semibold tracking-tight text-zinc-50 sm:text-4xl">
            Pronto para transformar seu canal em uma operação de elite?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-zinc-400">
            Comece hoje com uma plataforma pensada para organizar calendário,
            produção, ideias e publicações com controle total.
          </p>
          <Link
            href="/auth"
            className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-red-600 px-7 py-4 text-sm font-semibold text-white transition-all hover:bg-red-500"
          >
            Criar conta agora
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>

      <footer className="relative z-10 border-t border-zinc-900/90">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-12 md:grid-cols-[1.2fr_0.8fr_0.8fr_0.8fr]">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl border border-red-500/30 bg-red-500/15">
                <Clapperboard className="size-5 text-red-300" />
              </div>
              <p className="text-sm font-semibold">StudioHub</p>
            </div>
            <p className="mt-4 max-w-sm text-sm leading-6 text-zinc-500">
              Plataforma de operação para canais de YouTube, criadores e equipes
              que querem escalar produção com padrão profissional.
            </p>
          </div>
          <FooterColumn title="Produto" items={["Recursos", "Planos", "Dashboard"]} />
          <FooterColumn title="Empresa" items={["Sobre", "Comentários", "Contato"]} />
          <FooterColumn title="Legal" items={["Termos", "Privacidade", "Suporte"]} />
        </div>
        <div className="border-t border-zinc-900/90 py-6 text-center text-xs text-zinc-600">
          © {new Date().getFullYear()} StudioHub. Todos os direitos reservados.
        </div>
      </footer>

      </main>
    </div>
  );
}

function SectionHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      <p className="text-sm font-medium uppercase tracking-[0.24em] text-red-400">
        {eyebrow}
      </p>
      <h2 className="mt-4 text-3xl font-semibold tracking-tight text-zinc-50 sm:text-4xl">
        {title}
      </h2>
      <p className="mt-4 text-sm leading-7 text-zinc-500">{description}</p>
    </div>
  );
}

function HeroMetric({
  icon,
  value,
  label,
}: {
  icon: ReactNode;
  value: string;
  label: string;
}) {
  return (
    <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-5">
      <div className="mb-4 text-red-300">{icon}</div>
      <p className="text-2xl font-semibold text-zinc-50">{value}</p>
      <p className="mt-1 text-sm text-zinc-500">{label}</p>
    </div>
  );
}

function FooterColumn({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-zinc-200">{title}</h3>
      <div className="mt-4 space-y-3">
        {items.map((item) => (
          <a
            key={item}
            href="#"
            className="block text-sm text-zinc-500 transition-colors hover:text-zinc-200"
          >
            {item}
          </a>
        ))}
      </div>
    </div>
  );
}
