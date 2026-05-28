"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, Lock, User, Eye, EyeOff, Loader2, UserPlus, Check, X, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { LegalModal } from "@/shared/components/legal-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signupSchema, type SignupFormValues } from "@/modules/auth/schemas/signup.schema";
import { signUpAction } from "@/modules/auth/actions/sign-up.action";

interface SignupFormProps {
  onToggle: () => void;
}

const STRENGTH_RULES = [
  { label: "Mínimo 8 caracteres", test: (v: string) => v.length >= 8 },
  { label: "Uma letra maiúscula", test: (v: string) => /[A-Z]/.test(v) },
  { label: "Um número", test: (v: string) => /[0-9]/.test(v) },
  { label: "Um caractere especial", test: (v: string) => /[^A-Za-z0-9]/.test(v) },
];

export function SignupForm({ onToggle }: SignupFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showTermos, setShowTermos] = useState(false);
  const [showPrivacidade, setShowPrivacidade] = useState(false);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      acceptTerms: false,
    },
  });

  const password = watch("password") ?? "";
  const strengthScore = STRENGTH_RULES.filter((r) => r.test(password)).length;

  const onSubmit = handleSubmit((data) => {
    startTransition(async () => {
      const result = await signUpAction(data);
      if (!result.success && result.error) {
        toast.error(result.error);
      } else if (result.success) {
        // Force hard reload to ensure layout re-renders with new user data
        window.location.href = "/dashboard";
      }
    });
  });

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      <div className="space-y-2">
        <Label htmlFor="fullName" className="text-sm font-medium text-zinc-300">
          Nome completo
        </Label>
        <div className="relative">
          <User className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-zinc-500" />
          <Input
            id="fullName"
            autoComplete="name"
            placeholder="Seu nome ou canal"
            disabled={isPending}
            className="h-12 rounded-xl border-zinc-800/80 bg-zinc-950/70 pl-11 pr-4 text-sm text-zinc-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] placeholder:text-zinc-600 focus:border-red-500/60 focus:ring-2 focus:ring-red-500/10"
            {...register("fullName")}
          />
        </div>
        {errors.fullName && (
          <p className="text-xs text-red-400">{errors.fullName.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="signup-email" className="text-sm font-medium text-zinc-300">
          E-mail
        </Label>
        <div className="relative">
          <Mail className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-zinc-500" />
          <Input
            id="signup-email"
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
        <Label htmlFor="signup-password" className="text-sm font-medium text-zinc-300">
          Senha
        </Label>
        <div className="relative">
          <Lock className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-zinc-500" />
          <Input
            id="signup-password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            placeholder="Crie uma senha forte"
            disabled={isPending}
            className="h-12 rounded-xl border-zinc-800/80 bg-zinc-950/70 pl-11 pr-12 text-sm text-zinc-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] placeholder:text-zinc-600 focus:border-red-500/60 focus:ring-2 focus:ring-red-500/10"
            {...register("password")}
          />
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 transition-colors hover:text-zinc-300"
            aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
          >
            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
        {errors.password && (
          <p className="text-xs text-red-400">{errors.password.message}</p>
        )}
      </div>

      {/* Strength indicator */}
      <div className="flex gap-1 -mt-1">
        {STRENGTH_RULES.map((_, i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
              i < strengthScore
                ? strengthScore >= 4
                  ? "bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.4)]"
                  : strengthScore >= 2
                    ? "bg-yellow-500"
                    : "bg-red-500"
                : "bg-zinc-800"
            }`}
          />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5">
        {STRENGTH_RULES.map((rule) => {
          const passed = rule.test(password);
          return (
            <div key={rule.label} className="flex items-center gap-1.5 text-[11px]">
              {passed ? (
                <Check className="size-3 text-emerald-500" />
              ) : (
                <X className="size-3 text-zinc-600" />
              )}
              <span className={passed ? "text-emerald-400" : "text-zinc-500"}>
                {rule.label}
              </span>
            </div>
          );
        })}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword" className="text-sm font-medium text-zinc-300">
          Confirmar senha
        </Label>
        <div className="relative">
          <Lock className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-zinc-500" />
          <Input
            id="confirmPassword"
            type={showConfirm ? "text" : "password"}
            autoComplete="new-password"
            placeholder="Repita sua senha"
            disabled={isPending}
            className="h-12 rounded-xl border-zinc-800/80 bg-zinc-950/70 pl-11 pr-12 text-sm text-zinc-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] placeholder:text-zinc-600 focus:border-red-500/60 focus:ring-2 focus:ring-red-500/10"
            {...register("confirmPassword")}
          />
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShowConfirm((v) => !v)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 transition-colors hover:text-zinc-300"
            aria-label={showConfirm ? "Ocultar" : "Mostrar"}
          >
            {showConfirm ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
        {errors.confirmPassword && (
          <p className="text-xs text-red-400">{errors.confirmPassword.message}</p>
        )}
      </div>

      <label className="flex items-start gap-2 cursor-pointer group mt-1">
        <input
          type="checkbox"
          {...register("acceptTerms")}
          className="mt-0.5 size-4 rounded border-zinc-700/50 bg-zinc-950 text-red-600 accent-red-600 cursor-pointer"
        />
        <span className="text-xs text-zinc-400 group-hover:text-zinc-300 transition-colors leading-relaxed">
          Aceito os{" "}
          <button
            type="button"
            onClick={() => setShowTermos(true)}
            className="text-red-400 hover:text-red-300 underline underline-offset-2"
          >
            Termos de Uso
          </button>{" "}
          e{" "}
          <button
            type="button"
            onClick={() => setShowPrivacidade(true)}
            className="text-red-400 hover:text-red-300 underline underline-offset-2"
          >
            Política de Privacidade
          </button>
        </span>
      </label>
      {errors.acceptTerms && (
        <p className="text-xs text-red-400 -mt-2">{errors.acceptTerms.message}</p>
      )}

      <Button
        type="submit"
        disabled={isPending}
        className="mt-2 h-12 w-full rounded-xl border-0 bg-red-600 font-semibold tracking-wide text-white shadow-[0_14px_35px_rgba(255,31,31,0.25)] transition-all duration-300 hover:bg-red-500 hover:shadow-[0_18px_45px_rgba(255,31,31,0.35)] active:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none group"
      >
        {isPending ? (
          <>
            <Loader2 className="size-4 mr-2 animate-spin" />
            Criando operação...
          </>
        ) : (
          <>
            <UserPlus className="size-4 mr-2" />
            Criar operação
            <ArrowRight className="size-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </>
        )}
      </Button>

      <p className="text-center text-xs text-zinc-500">
        Já gerencia sua operação?{" "}
        <button
          type="button"
          onClick={onToggle}
          className="text-red-400 hover:text-red-300 font-medium transition-colors relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-px after:bg-red-400 after:transition-all after:duration-300 hover:after:w-full"
        >
          Entrar
        </button>
      </p>

      {/* Modais legais */}
      <LegalModal open={showTermos} onClose={() => setShowTermos(false)} title="Termos de Uso">
        <section>
          <h3 className="text-sm font-semibold text-zinc-200 mb-2">1. Aceitação dos Termos</h3>
          <p>Ao acessar e utilizar a plataforma StudioHub, você concorda em cumprir estes Termos de Uso.</p>
        </section>
        <section>
          <h3 className="text-sm font-semibold text-zinc-200 mb-2">2. Descrição do Serviço</h3>
          <p>O StudioHub é uma plataforma de gestão de produção de vídeos para YouTube.</p>
        </section>
        <section>
          <h3 className="text-sm font-semibold text-zinc-200 mb-2">3. Cadastro e Conta</h3>
          <p>Para utilizar o StudioHub, é necessário criar uma conta fornecendo informações verdadeiras e atualizadas.</p>
        </section>
        <section>
          <h3 className="text-sm font-semibold text-zinc-200 mb-2">4. Uso Adequado</h3>
          <p>Você concorda em usar o StudioHub apenas para fins legais e de acordo com estes termos.</p>
        </section>
        <section>
          <h3 className="text-sm font-semibold text-zinc-200 mb-2">5. Propriedade Intelectual</h3>
          <p>Todo o conteúdo disponibilizado na plataforma é propriedade do StudioHub. O usuário mantém a propriedade de todo o conteúdo que cadastrar.</p>
        </section>
        <section>
          <h3 className="text-sm font-semibold text-zinc-200 mb-2">6. Limitação de Responsabilidade</h3>
          <p>O StudioHub é fornecido &quot;como está&quot;. Não garantimos que o serviço será ininterrupto ou livre de erros.</p>
        </section>
        <section>
          <h3 className="text-sm font-semibold text-zinc-200 mb-2">7. Alterações nos Termos</h3>
          <p>Podemos modificar estes termos a qualquer momento. Alterações significativas serão comunicadas.</p>
        </section>
        <section>
          <h3 className="text-sm font-semibold text-zinc-200 mb-2">8. Contato</h3>
          <p>Em caso de dúvidas, entre em contato pelo e-mail: suporte@studiohub.com</p>
        </section>
      </LegalModal>

      <LegalModal open={showPrivacidade} onClose={() => setShowPrivacidade(false)} title="Política de Privacidade">
        <section>
          <h3 className="text-sm font-semibold text-zinc-200 mb-2">1. Dados Coletados</h3>
          <p>Coletamos nome, e-mail, dados de canais do YouTube, vídeos e preferências de configuração.</p>
        </section>
        <section>
          <h3 className="text-sm font-semibold text-zinc-200 mb-2">2. Uso dos Dados</h3>
          <p>Utilizamos seus dados para fornecer e melhorar nossos serviços, personalizar sua experiência e garantir segurança.</p>
        </section>
        <section>
          <h3 className="text-sm font-semibold text-zinc-200 mb-2">3. Armazenamento e Segurança</h3>
          <p>Seus dados são armazenados em servidores seguros do Supabase com criptografia.</p>
        </section>
        <section>
          <h3 className="text-sm font-semibold text-zinc-200 mb-2">4. Compartilhamento</h3>
          <p>Não vendemos, alugamos ou compartilhamos seus dados pessoais com terceiros, exceto quando necessário para operação da plataforma.</p>
        </section>
        <section>
          <h3 className="text-sm font-semibold text-zinc-200 mb-2">5. Seus Direitos</h3>
          <p>Você tem o direito de acessar, corrigir, excluir ou exportar seus dados pessoais a qualquer momento.</p>
        </section>
        <section>
          <h3 className="text-sm font-semibold text-zinc-200 mb-2">6. Cookies</h3>
          <p>Utilizamos cookies essenciais para manutenção da sessão e cookies de análise para entender como os usuários interagem com a plataforma.</p>
        </section>
        <section>
          <h3 className="text-sm font-semibold text-zinc-200 mb-2">7. Alterações</h3>
          <p>Podemos atualizar esta política periodicamente. Alterações significativas serão comunicadas.</p>
        </section>
        <section>
          <h3 className="text-sm font-semibold text-zinc-200 mb-2">8. Contato</h3>
          <p>Para questões sobre privacidade: privacidade@studiohub.com</p>
        </section>
      </LegalModal>
    </form>
  );
}
