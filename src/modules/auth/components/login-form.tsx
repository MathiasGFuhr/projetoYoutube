"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, Lock, Eye, EyeOff, Loader2, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginSchema, type LoginFormValues } from "@/modules/auth/schemas/login.schema";
import { signInAction } from "@/modules/auth/actions/sign-in.action";

const REMEMBER_ME_KEY = "studiohub-remember-me";

interface LoginFormProps {
  onToggle: () => void;
}

export function LoginForm({ onToggle }: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", rememberMe: true },
  });

  const onSubmit = handleSubmit((data) => {
    console.log("[LoginForm] Submitting login for:", data.email);
    localStorage.setItem(REMEMBER_ME_KEY, String(data.rememberMe));
    startTransition(async () => {
      const result = await signInAction(data);
      console.log("[LoginForm] Result:", result);
      if (!result.success && result.error) {
        console.error("[LoginForm] Error:", result.error);
        toast.error(result.error);
      } else if (result.success) {
        console.log("[LoginForm] Login successful, redirecting...");
      }
    });
  });

  return (
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

      <div className="space-y-2">
        <Label htmlFor="password" className="text-sm font-medium text-zinc-300">
          Senha
        </Label>
        <div className="relative">
          <Lock className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-zinc-500" />
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder="Digite sua senha"
            disabled={isPending}
            className="h-12 rounded-xl border-zinc-800/80 bg-zinc-950/70 pl-11 pr-12 text-sm text-zinc-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] placeholder:text-zinc-600 focus:border-red-500/60 focus:ring-2 focus:ring-red-500/10"
            {...register("password")}
          />
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 transition-colors hover:text-zinc-300 focus:outline-none"
            aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
          >
            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
        {errors.password && (
          <p className="text-xs text-red-400">{errors.password.message}</p>
        )}
      </div>

      <div className="flex items-center justify-between pt-0.5">
        <label className="flex items-center gap-2 cursor-pointer group">
          <input
            type="checkbox"
            {...register("rememberMe")}
            className="size-4 rounded border-zinc-700/50 bg-zinc-950 text-red-600 accent-red-600 cursor-pointer"
          />
          <span className="text-xs text-zinc-400 group-hover:text-zinc-300 transition-colors select-none">
            Lembrar de mim
          </span>
        </label>
        <a
          href="/recuperar-senha"
          className="text-xs text-zinc-500 hover:text-red-400 transition-colors duration-150"
        >
          Esqueceu a senha?
        </a>
      </div>

      <Button
        type="submit"
        disabled={isPending}
        className="mt-2 h-12 w-full rounded-xl border-0 bg-red-600 font-semibold tracking-wide text-white shadow-[0_14px_35px_rgba(255,31,31,0.25)] transition-all duration-300 hover:bg-red-500 hover:shadow-[0_18px_45px_rgba(255,31,31,0.35)] active:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none group"
      >
        {isPending ? (
          <>
            <Loader2 className="size-4 mr-2 animate-spin" />
            Entrando...
          </>
        ) : (
          <>
            Acessar operação
            <ArrowRight className="size-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </>
        )}
      </Button>

      <p className="text-center text-xs text-zinc-500">
        Ainda não organizou seu canal?{" "}
        <button
          type="button"
          onClick={onToggle}
          className="text-red-400 hover:text-red-300 font-medium transition-colors relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-px after:bg-red-400 after:transition-all after:duration-300 hover:after:w-full"
        >
          Criar operação
        </button>
      </p>
    </form>
  );
}
