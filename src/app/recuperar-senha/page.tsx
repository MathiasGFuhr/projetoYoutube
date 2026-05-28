"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail, ArrowLeft, Loader2, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

const schema = z.object({
  email: z.string().min(1, "E-mail é obrigatório").email("E-mail inválido"),
});

type FormValues = z.infer<typeof schema>;

export default function RecuperarSenhaPage() {
  const [isPending, startTransition] = useTransition();
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = handleSubmit((data) => {
    startTransition(async () => {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${window.location.origin}/atualizar-senha`,
      });

      if (error) {
        toast.error(error.message);
      } else {
        setSent(true);
        toast.success("E-mail de recuperação enviado!");
      }
    });
  });

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050505] px-4 py-8 text-zinc-100 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,31,31,0.14),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(255,31,31,0.08),transparent_30%)]" />
      
      <div className="relative z-10 w-full max-w-md">
        <div className="overflow-hidden rounded-[28px] border border-zinc-800/80 bg-zinc-950/80 shadow-[0_40px_120px_rgba(0,0,0,0.7)] backdrop-blur-2xl p-8">
          <Link
            href="/auth"
            className="inline-flex items-center gap-2 text-xs text-zinc-500 hover:text-zinc-300 transition-colors mb-6"
          >
            <ArrowLeft className="size-4" />
            Voltar para login
          </Link>

          <h1 className="text-2xl font-bold text-zinc-100 mb-2">Recuperar senha</h1>
          <p className="text-sm text-zinc-500 mb-6">
            Digite seu e-mail e enviaremos um link para redefinir sua senha.
          </p>

          {sent ? (
            <div className="text-center py-8">
              <CheckCircle className="size-12 text-emerald-500 mx-auto mb-4" />
              <h2 className="text-lg font-semibold text-zinc-100 mb-2">E-mail enviado!</h2>
              <p className="text-sm text-zinc-500">
                Verifique sua caixa de entrada e siga as instruções.
              </p>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-5" noValidate>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-zinc-300">
                  E-mail
                </Label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-zinc-500" />
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="voce@canal.com"
                    disabled={isPending}
                    className="h-12 rounded-xl border-zinc-800/80 bg-zinc-950/70 pl-11 pr-4 text-sm text-zinc-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] placeholder:text-zinc-600 focus:border-red-500/60 focus:ring-2 focus:ring-red-500/10"
                    {...register("email")}
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-red-400">{errors.email.message}</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isPending}
                className="h-12 w-full rounded-xl border-0 bg-red-600 font-semibold tracking-wide text-white shadow-[0_14px_35px_rgba(255,31,31,0.25)] transition-all duration-300 hover:bg-red-500 hover:shadow-[0_18px_45px_rgba(255,31,31,0.35)] active:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none"
              >
                {isPending ? (
                  <>
                    <Loader2 className="size-4 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  "Enviar link de recuperação"
                )}
              </Button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
