"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail, Lock, Eye, EyeOff, Loader2, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const schema = z
  .object({
    email: z.string().min(1, "E-mail é obrigatório").email("E-mail inválido"),
    password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),
    confirmPassword: z.string().min(1, "Confirme a senha"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

type FormValues = z.infer<typeof schema>;

export default function RedefinirSenhaPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = handleSubmit((data) => {
    startTransition(async () => {
      try {
        const res = await fetch("/api/reset-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: data.email, password: data.password }),
        });

        const result = await res.json();

        if (!res.ok) {
          toast.error(result.error || "Erro ao redefinir senha");
        } else {
          toast.success("Senha redefinida com sucesso!");
          router.push("/auth");
        }
      } catch {
        toast.error("Erro de conexão. Tente novamente.");
      }
    });
  });

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050505] px-4 py-8 text-zinc-100 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,31,31,0.14),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(255,31,31,0.08),transparent_30%)]" />
      
      <div className="relative z-10 w-full max-w-md">
        <div className="overflow-hidden rounded-[28px] border border-zinc-800/80 bg-zinc-950/80 shadow-[0_40px_120px_rgba(0,0,0,0.7)] backdrop-blur-2xl p-8">
          <h1 className="text-2xl font-bold text-zinc-100 mb-2">Redefinir senha</h1>
          <p className="text-sm text-zinc-500 mb-6">
            Defina uma nova senha para sua conta.
          </p>

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
                  placeholder="mathiasgilvanf@gmail.com"
                  disabled={isPending}
                  className="h-12 rounded-xl border-zinc-800/80 bg-zinc-950/70 pl-11 pr-4 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-red-500/60 focus:ring-2 focus:ring-red-500/10"
                  {...register("email")}
                />
              </div>
              {errors.email && <p className="text-xs text-red-400">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-zinc-300">
                Nova senha
              </Label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-zinc-500" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Digite a nova senha"
                  disabled={isPending}
                  className="h-12 rounded-xl border-zinc-800/80 bg-zinc-950/70 pl-11 pr-12 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-red-500/60 focus:ring-2 focus:ring-red-500/10"
                  {...register("password")}
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-400">{errors.password.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium text-zinc-300">
                Confirmar senha
              </Label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-zinc-500" />
                <Input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="Confirme a nova senha"
                  disabled={isPending}
                  className="h-12 rounded-xl border-zinc-800/80 bg-zinc-950/70 pl-11 pr-4 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-red-500/60 focus:ring-2 focus:ring-red-500/10"
                  {...register("confirmPassword")}
                />
              </div>
              {errors.confirmPassword && (
                <p className="text-xs text-red-400">{errors.confirmPassword.message}</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isPending}
              className="h-12 w-full rounded-xl border-0 bg-red-600 font-semibold tracking-wide text-white shadow-[0_14px_35px_rgba(255,31,31,0.25)] transition-all duration-300 hover:bg-red-500 hover:shadow-[0_18px_45px_rgba(255,31,31,0.35)] active:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none group"
            >
              {isPending ? (
                <>
                  <Loader2 className="size-4 mr-2 animate-spin" />
                  Redefinindo...
                </>
              ) : (
                <>
                  Redefinir senha
                  <ArrowRight className="size-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>
          </form>
        </div>
      </div>
    </main>
  );
}
