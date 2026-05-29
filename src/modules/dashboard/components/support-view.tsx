"use client";

import { MessageCircle, Mail, ArrowUpRight, Clock, Headphones } from "lucide-react";
import Link from "next/link";

export function SupportView() {
  return (
    <div className="relative mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-10 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-red-500/25 bg-red-500/10">
          <Headphones className="size-7 text-red-400" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-100 sm:text-3xl">
          Suporte e Contato
        </h1>
        <p className="mt-2 text-sm text-zinc-500">
          Fale conosco, estamos aqui para ajudar
        </p>
      </div>

      {/* Contact Cards */}
      <div className="grid gap-5 sm:grid-cols-2">
        {/* WhatsApp */}
        <Link
          href="https://wa.me/5555997282539"
          target="_blank"
          rel="noopener noreferrer"
          className="group relative overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-900/50 p-6 transition-all duration-300 hover:border-emerald-500/30 hover:bg-zinc-900/80 hover:shadow-[0_0_40px_rgba(16,185,129,0.08)]"
        >
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10 transition-colors group-hover:bg-emerald-500/15">
              <MessageCircle className="size-6 text-emerald-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-zinc-100">WhatsApp</h3>
                <ArrowUpRight className="size-4 text-zinc-600 transition-colors group-hover:text-emerald-400" />
              </div>
              <p className="mt-1 text-sm text-zinc-500">
                Atendimento rápido via WhatsApp
              </p>
              <p className="mt-3 text-sm font-medium text-emerald-400">
                (55) 99728-2539
              </p>
            </div>
          </div>
          <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
        </Link>

        {/* Email */}
        <Link
          href="mailto:mathiasgilvanf@gmail.com"
          className="group relative overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-900/50 p-6 transition-all duration-300 hover:border-red-500/30 hover:bg-zinc-900/80 hover:shadow-[0_0_40px_rgba(255,31,31,0.08)]"
        >
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl border border-red-500/20 bg-red-500/10 transition-colors group-hover:bg-red-500/15">
              <Mail className="size-6 text-red-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-zinc-100">E-mail</h3>
                <ArrowUpRight className="size-4 text-zinc-600 transition-colors group-hover:text-red-400" />
              </div>
              <p className="mt-1 text-sm text-zinc-500">
                Envie sua dúvida por e-mail
              </p>
              <p className="mt-3 truncate text-sm font-medium text-red-400">
                mathiasgilvanf@gmail.com
              </p>
            </div>
          </div>
          <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-red-500/30 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
        </Link>
      </div>

      {/* Info */}
      <div className="mt-8 rounded-2xl border border-zinc-800/60 bg-zinc-900/30 p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-700/50 bg-zinc-800/50">
            <Clock className="size-5 text-zinc-400" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-zinc-300">Horário de atendimento</h4>
            <p className="text-sm text-zinc-500">
              Segunda a sexta, das 09h às 18h (horário de Brasília)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
