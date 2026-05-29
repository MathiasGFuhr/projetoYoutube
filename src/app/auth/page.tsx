"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { CalendarCheck, Clapperboard, Film, PlaySquare, Sparkles } from "lucide-react";
import { LoginForm } from "@/modules/auth/components/login-form";
import { SignupForm } from "@/modules/auth/components/signup-form";

export default function AuthPage() {
  const [mode, setMode] = useState<"login" | "signup">("login");

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050505] px-4 py-8 text-zinc-100 sm:px-6 lg:px-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,31,31,0.14),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(255,31,31,0.08),transparent_30%)]" />
      <div className="absolute inset-0 opacity-[0.035] [background-image:linear-gradient(rgba(255,255,255,0.7)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.7)_1px,transparent_1px)] [background-size:48px_48px]" />

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-5xl items-center justify-center">
        <section className="grid w-full overflow-hidden rounded-[28px] border border-zinc-800/80 bg-zinc-950/80 shadow-[0_40px_120px_rgba(0,0,0,0.7)] backdrop-blur-2xl lg:grid-cols-[0.95fr_1.05fr]">
          <aside className="relative hidden min-h-[620px] flex-col justify-between overflow-hidden border-r border-zinc-800/80 bg-[linear-gradient(145deg,rgba(255,31,31,0.16),rgba(9,9,11,0.88)_42%,rgba(9,9,11,0.96))] p-10 lg:flex">
            <div className="absolute inset-0 opacity-[0.08] [background-image:linear-gradient(rgba(255,255,255,0.8)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.8)_1px,transparent_1px)] [background-size:36px_36px]" />
            <div className="absolute -left-24 top-20 size-72 rounded-full bg-red-500/20 blur-3xl" />
            <div className="absolute -bottom-24 right-0 size-80 rounded-full bg-red-600/10 blur-3xl" />

            <div className="relative flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-2xl border border-red-500/30 bg-red-500/15 shadow-[0_0_30px_rgba(255,31,31,0.18)]">
                <Clapperboard className="size-5 text-red-300" />
              </div>
              <div>
                <p className="text-sm font-semibold tracking-wide text-zinc-100">StudioHub</p>
                <p className="text-xs text-zinc-500">Operação para YouTube</p>
              </div>
            </div>

            <div className="relative max-w-sm">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1 text-xs font-medium text-red-200">
                <Sparkles className="size-3.5" />
                Operação premium para YouTube
              </div>
              <h1 className="text-4xl font-semibold tracking-tight text-zinc-50">
                Transforme produção de vídeos em uma operação de elite.
              </h1>
              <p className="mt-4 text-sm leading-6 text-zinc-400">
                Centralize canais, calendário editorial, pipeline, roteiros,
                thumbnails, status e histórico em uma base profissional.
              </p>
            </div>

            <div className="relative grid grid-cols-3 gap-3">
              <Metric icon={<PlaySquare className="size-4" />} value="Multi" label="Canais" />
              <Metric icon={<CalendarCheck className="size-4" />} value="Zero" label="Colisões" />
              <Metric icon={<Film className="size-4" />} value="100+" label="Ideias" />
            </div>
          </aside>

          <div className="flex min-h-[620px] flex-col bg-zinc-950/70">
            <div className="flex items-center justify-between border-b border-zinc-800/80 px-6 py-5 lg:hidden">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl border border-red-500/30 bg-red-500/15">
                  <Clapperboard className="size-5 text-red-300" />
                </div>
                <div>
                  <p className="text-sm font-semibold">StudioHub</p>
                  <p className="text-xs text-zinc-500">Operação para YouTube</p>
                </div>
              </div>
            </div>

            <div className="border-b border-zinc-800/80 p-2">
              <div className="grid grid-cols-2 rounded-2xl bg-zinc-900/50 p-1">
                <button
                  type="button"
                  onClick={() => setMode("login")}
                  className={`rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                    mode === "login"
                      ? "bg-zinc-800 text-zinc-50 shadow-sm"
                      : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  Entrar
                </button>
                <button
                  type="button"
                  onClick={() => setMode("signup")}
                  className={`rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                    mode === "signup"
                      ? "bg-zinc-800 text-zinc-50 shadow-sm"
                      : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  Criar conta
                </button>
              </div>
            </div>

            <div className="flex flex-1 items-center justify-center px-6 py-8 sm:px-10">
              <div className="w-full max-w-[390px]">
                <div className="mb-8">
                  <p className="text-xs font-medium uppercase tracking-[0.22em] text-red-400">
                    {mode === "login" ? "Acesso seguro" : "Nova operação"}
                  </p>
                  <h2 className="mt-3 text-2xl font-semibold tracking-tight text-zinc-50">
                    {mode === "login" ? "Bem-vindo de volta" : "Crie sua operação"}
                  </h2>
                  <p className="mt-2 text-sm text-zinc-500">
                    {mode === "login"
                      ? "Entre para continuar controlando sua produção de vídeos."
                      : "Configure sua base e comece a organizar canais, vídeos e publicações."}
                  </p>
                </div>

                <div className="relative">
                  <div
                    className={`transition-all duration-300 ${
                      mode === "login"
                        ? "relative opacity-100 translate-y-0"
                        : "pointer-events-none absolute inset-0 opacity-0 translate-y-3"
                    }`}
                  >
                    <LoginForm onToggle={() => setMode("signup")} />
                  </div>
                  <div
                    className={`transition-all duration-300 ${
                      mode === "signup"
                        ? "relative opacity-100 translate-y-0"
                        : "pointer-events-none absolute inset-0 opacity-0 translate-y-3"
                    }`}
                  >
                    <SignupForm onToggle={() => setMode("login")} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function Metric({
  icon,
  value,
  label,
}: {
  icon: ReactNode;
  value: string;
  label: string;
}) {
  return (
    <div className="rounded-2xl border border-zinc-800/80 bg-zinc-950/45 p-4 backdrop-blur">
      <div className="mb-3 text-red-300">{icon}</div>
      <p className="text-lg font-semibold text-zinc-50">{value}</p>
      <p className="mt-1 text-xs text-zinc-500">{label}</p>
    </div>
  );
}
