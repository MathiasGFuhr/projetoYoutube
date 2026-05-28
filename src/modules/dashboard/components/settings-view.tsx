"use client";

import { useRef, useState } from "react";
import {
  Camera,
  Save,
  User,
  Upload,
  X,
  Shield,
  CreditCard,
  Bell,
  Monitor,
  Crown,
  Zap,
  Rocket,
  ArrowRight,
  Check,
  Clock,
  Globe,
  Moon,
  Smartphone,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { SubscriptionGuard } from "@/modules/dashboard/components/subscription-guard";
import { useAuth } from "@/shared/hooks/use-auth";
import { useSubscription } from "@/shared/hooks/use-subscription";
import { useUpdateProfile } from "@/shared/hooks/use-update-profile";
import { useUploadAvatar } from "@/shared/hooks/use-upload-avatar";
import { useRouter } from "next/navigation";

function Card({ children, className, glow = false }: { children: React.ReactNode; className?: string; glow?: boolean }) {
  return (
    <div className={cn("relative group", className)}>
      {glow && (
        <div className="absolute -inset-[1px] rounded-[22px] bg-gradient-to-b from-red-500/10 via-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
      )}
      <div className="relative rounded-[20px] border border-zinc-800/60 bg-zinc-950/50 backdrop-blur-xl overflow-hidden transition-all duration-300 hover:border-zinc-700/60">
        {children}
      </div>
    </div>
  );
}

function CardHeader({ icon: Icon, title, subtitle }: { icon: React.ElementType; title: string; subtitle?: string }) {
  return (
    <div className="px-6 py-5 border-b border-zinc-800/40 flex items-center gap-4">
      <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center flex-shrink-0">
        <Icon className="size-4.5 text-zinc-500" />
      </div>
      <div>
        <h2 className="text-sm font-bold text-white tracking-tight">{title}</h2>
        {subtitle && <p className="text-xs text-zinc-500 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}

function Input({ icon: Icon, label, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { icon?: React.ElementType; label: string }) {
  return (
    <div>
      <label className="text-[11px] font-semibold text-zinc-500 block mb-2">{label}</label>
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-zinc-600 pointer-events-none" />
        )}
        <input
          className={cn(
            "w-full bg-zinc-950/60 border border-zinc-800/60 rounded-xl px-4 py-2.5 text-sm text-zinc-200 placeholder:text-zinc-600",
            "focus:outline-none focus:border-red-500/40 focus:ring-2 focus:ring-red-500/10 transition-all duration-300",
            Icon && "pl-10"
          )}
          {...props}
        />
      </div>
    </div>
  );
}

export function SettingsView() {
  const { user } = useAuth();
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const { updateProfile, isPending: savingProfile } = useUpdateProfile();
  const { uploadAvatar, isPending: uploadingAvatar } = useUploadAvatar();
  const { subscription, trial, isActive } = useSubscription();

  const initialName =
    (user?.user_metadata?.full_name as string | undefined) ??
    user?.email?.split("@")[0] ??
    "Usuário";

  const [name, setName] = useState(initialName);
  const [photo, setPhoto] = useState<string>((user?.user_metadata?.avatar_url as string | undefined) ?? "");
  const [saved, setSaved] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [notifications, setNotifications] = useState(true);

  const initials = name
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "U";

  const handlePhoto = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setPhoto(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setSaved(false);
    try {
      let avatarUrl: string | undefined = undefined;
      if (photoFile) {
        try {
          avatarUrl = await uploadAvatar(photoFile);
          setPhotoFile(null);
        } catch {
          toast.warning("Foto não pôde ser enviada. Salvando apenas o nome...");
        }
      } else if (photo && !photo.startsWith("data:")) {
        avatarUrl = photo;
      }
      await updateProfile({ fullName: name, avatarUrl });
      setSaved(true);
      toast.success("Perfil atualizado com sucesso!");
    } catch {
      toast.error("Erro ao salvar perfil. Tente novamente.");
    }
  };

  // Subscription card status
  const subStatus = isActive
    ? { label: "Pro Ativo", color: "emerald", icon: Crown }
    : trial.isInTrial
      ? { label: `Pro Trial · ${trial.daysLeft}d`, color: "amber", icon: Rocket }
      : { label: "Free", color: "zinc", icon: Zap };

  return (
    <SubscriptionGuard>
      <div className="relative min-h-screen">
        {/* Ambient glow */}
        <div className="absolute top-0 right-[10%] w-[400px] h-[300px] bg-red-600/[0.04] blur-[100px] rounded-full pointer-events-none" />

        <div className="relative p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
          {/* ── Header ── */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                <Shield className="size-5 text-red-400" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-none">
                  Conta StudioHub
                </h1>
              </div>
            </div>
            <p className="text-sm text-zinc-500 max-w-lg leading-relaxed">
              Gerencie sua identidade, segurança e experiência da plataforma.
            </p>
          </div>

          {/* ── Grid ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* ── Left Column ── */}
            <div className="lg:col-span-1 space-y-5">
              {/* Profile Card */}
              <Card glow>
                <div className="p-6 text-center">
                  {/* Avatar */}
                  <div className="relative inline-block mb-4 group/avatar">
                    <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-red-500/20 via-orange-500/20 to-red-500/20 blur-md opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-500" />
                    <div className="relative">
                      {photo ? (
                        <img
                          src={photo}
                          alt={name}
                          className="size-24 rounded-2xl object-cover border-2 border-zinc-800 group-hover/avatar:border-red-500/30 transition-colors duration-300"
                        />
                      ) : (
                        <div className="size-24 rounded-2xl bg-red-500/10 border-2 border-red-500/20 flex items-center justify-center">
                          <span className="text-3xl font-black text-red-400">{initials}</span>
                        </div>
                      )}
                      <button
                        onClick={() => fileRef.current?.click()}
                        className="absolute -bottom-2 -right-2 size-9 rounded-xl bg-red-600 hover:bg-red-500 text-white flex items-center justify-center border-4 border-[#0a0a0a] transition-all duration-300 hover:scale-105 shadow-lg"
                      >
                        <Camera className="size-4" />
                      </button>
                    </div>
                  </div>

                  <h2 className="text-lg font-bold text-white mb-0.5">{name || "Usuário"}</h2>
                  <p className="text-sm text-zinc-500 truncate">{user?.email ?? "email@studiohub.com"}</p>

                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
                </div>
              </Card>

              {/* Subscription Status */}
              <Card>
                <CardHeader icon={CreditCard} title="Assinatura" subtitle="Seu plano atual" />
                <div className="p-6">
                  <div className={cn(
                    "flex items-center gap-3 p-4 rounded-xl border mb-4",
                    subStatus.color === "emerald" && "bg-emerald-500/[0.04] border-emerald-500/15",
                    subStatus.color === "amber" && "bg-amber-500/[0.04] border-amber-500/15",
                    subStatus.color === "zinc" && "bg-zinc-500/[0.04] border-zinc-500/15"
                  )}>
                    <div className={cn(
                      "size-10 rounded-xl flex items-center justify-center",
                      subStatus.color === "emerald" && "bg-emerald-500/10",
                      subStatus.color === "amber" && "bg-amber-500/10",
                      subStatus.color === "zinc" && "bg-zinc-500/10"
                    )}>
                      <subStatus.icon className={cn(
                        "size-5",
                        subStatus.color === "emerald" && "text-emerald-400",
                        subStatus.color === "amber" && "text-amber-400",
                        subStatus.color === "zinc" && "text-zinc-400"
                      )} />
                    </div>
                    <div>
                      <p className={cn(
                        "text-sm font-bold",
                        subStatus.color === "emerald" && "text-emerald-400",
                        subStatus.color === "amber" && "text-amber-400",
                        subStatus.color === "zinc" && "text-zinc-400"
                      )}>
                        {subStatus.label}
                      </p>
                      <p className="text-xs text-zinc-500">
                        {isActive
                          ? `Renova ${subscription?.current_period_end ? new Date(subscription.current_period_end).toLocaleDateString("pt-BR") : "em breve"}`
                          : trial.isInTrial
                            ? "Assine para manter acesso"
                            : "Upgrade para desbloquear tudo"}
                      </p>
                    </div>
                  </div>

                  {!isActive && (
                    <button
                      onClick={() => router.push("/dashboard/billing")}
                      className="relative w-full py-2.5 rounded-xl bg-red-600 text-white text-sm font-bold transition-all duration-300 hover:bg-red-500 shadow-[0_0_25px_rgba(220,38,38,0.3)] hover:shadow-[0_0_35px_rgba(220,38,38,0.5)] overflow-hidden group/btn"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700" />
                      <span className="relative flex items-center justify-center gap-2">
                        {trial.isInTrial ? "Manter acesso Pro" : "Upgrade para Pro"}
                        <ArrowRight className="size-3.5" />
                      </span>
                    </button>
                  )}
                </div>
              </Card>
            </div>

            {/* ── Right Column ── */}
            <div className="lg:col-span-2 space-y-5">
              {/* Profile Info */}
              <Card glow>
                <CardHeader icon={User} title="Perfil" subtitle="Sua identidade na plataforma" />
                <div className="p-6 space-y-5">
                  <Input
                    icon={User}
                    label="Nome de Exibição"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Seu nome"
                  />

                  <div>
                    <label className="text-[11px] font-semibold text-zinc-500 block mb-2">Foto de Perfil</label>
                    <div className="flex items-center gap-3 flex-wrap">
                      <button
                        onClick={() => fileRef.current?.click()}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-zinc-800/60 bg-zinc-950/40 text-sm text-zinc-400 hover:text-zinc-200 hover:border-zinc-600 transition-all duration-300"
                      >
                        <Upload className="size-4" />
                        Escolher Imagem
                      </button>
                      {photo && (
                        <button
                          onClick={() => setPhoto("")}
                          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-red-500/20 bg-red-500/5 text-sm text-red-400 hover:bg-red-500/10 transition-all"
                        >
                          <X className="size-4" />
                          Remover
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-zinc-600 mt-2">Use uma imagem quadrada para melhor resultado.</p>
                  </div>

                  <div className="h-px bg-gradient-to-r from-transparent via-zinc-800/60 to-transparent" />

                  <div className="flex items-center justify-between">
                    <p className={cn("text-xs transition-colors", saved ? "text-emerald-400" : "text-zinc-600")}>
                      {saved ? "Alterações salvas." : "Revise antes de salvar."}
                    </p>
                    <button
                      onClick={handleSave}
                      disabled={savingProfile || uploadingAvatar || !name.trim()}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-sm font-bold text-white transition-all duration-300 shadow-[0_0_25px_rgba(220,38,38,0.25)] hover:shadow-[0_0_35px_rgba(220,38,38,0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Save className="size-4" />
                      {savingProfile || uploadingAvatar ? "Salvando..." : "Salvar Alterações"}
                    </button>
                  </div>
                </div>
              </Card>

              {/* Security */}
              <Card>
                <CardHeader icon={Shield} title="Segurança" subtitle="Proteja sua conta" />
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-zinc-950/40 border border-zinc-800/40">
                    <div className="flex items-center gap-3">
                      <div className="size-9 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                        <Clock className="size-4 text-zinc-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-zinc-300">Sessão Ativa</p>
                        <p className="text-xs text-zinc-600">Este dispositivo · Agora</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                      <div className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-[10px] font-medium text-emerald-400">Online</span>
                    </div>
                  </div>

                  <button
                    onClick={() => toast.info("Em breve: alteração de senha")}
                    className="w-full flex items-center justify-between p-4 rounded-xl border border-zinc-800/40 bg-zinc-950/40 hover:border-zinc-700/60 transition-all duration-300 group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="size-9 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center group-hover:border-zinc-700 transition-colors">
                        <Shield className="size-4 text-zinc-500 group-hover:text-zinc-400 transition-colors" />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-medium text-zinc-300">Alterar Senha</p>
                        <p className="text-xs text-zinc-600">Atualize sua senha de acesso</p>
                      </div>
                    </div>
                    <ArrowRight className="size-4 text-zinc-600 group-hover:text-zinc-400 group-hover:translate-x-0.5 transition-all" />
                  </button>
                </div>
              </Card>

              {/* Preferences */}
              <Card>
                <CardHeader icon={Monitor} title="Preferências" subtitle="Personalize sua experiência" />
                <div className="p-6 space-y-3">
                  {/* Notifications */}
                  <div className="flex items-center justify-between p-4 rounded-xl bg-zinc-950/40 border border-zinc-800/40">
                    <div className="flex items-center gap-3">
                      <div className="size-9 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                        <Bell className="size-4 text-zinc-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-zinc-300">Notificações</p>
                        <p className="text-xs text-zinc-600">Alertas de atividade e lançamentos</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setNotifications(!notifications)}
                      className={cn(
                        "relative w-11 h-6 rounded-full transition-colors duration-300",
                        notifications ? "bg-red-600" : "bg-zinc-800"
                      )}
                    >
                      <div
                        className={cn(
                          "absolute top-1 size-4 rounded-full bg-white transition-transform duration-300 shadow-sm",
                          notifications ? "left-6" : "left-1"
                        )}
                      />
                    </button>
                  </div>

                  {/* Theme (placeholder) */}
                  <div className="flex items-center justify-between p-4 rounded-xl bg-zinc-950/40 border border-zinc-800/40">
                    <div className="flex items-center gap-3">
                      <div className="size-9 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                        <Moon className="size-4 text-zinc-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-zinc-300">Tema</p>
                        <p className="text-xs text-zinc-600">Dark mode permanente</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-zinc-800/60 border border-zinc-700/40">
                      <Check className="size-3 text-zinc-500" />
                      <span className="text-[10px] font-medium text-zinc-500">Ativo</span>
                    </div>
                  </div>

                  {/* Language */}
                  <div className="flex items-center justify-between p-4 rounded-xl bg-zinc-950/40 border border-zinc-800/40">
                    <div className="flex items-center gap-3">
                      <div className="size-9 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                        <Globe className="size-4 text-zinc-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-zinc-300">Idioma</p>
                        <p className="text-xs text-zinc-600">Português (Brasil)</p>
                      </div>
                    </div>
                    <Smartphone className="size-4 text-zinc-600" />
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </SubscriptionGuard>
  );
}

