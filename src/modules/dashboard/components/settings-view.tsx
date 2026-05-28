"use client";

import { useRef, useState } from "react";
import { Camera, Save, Settings, Upload, User, X } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useAuth } from "@/shared/hooks/use-auth";
import { useUpdateProfile } from "@/shared/hooks/use-update-profile";
import { useUploadAvatar } from "@/shared/hooks/use-upload-avatar";

export function SettingsView() {
  const { user } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);
  const { updateProfile, isPending: savingProfile } = useUpdateProfile();
  const { uploadAvatar, isPending: uploadingAvatar } = useUploadAvatar();

  const initialName =
    (user?.user_metadata?.full_name as string | undefined) ??
    user?.email?.split("@")[0] ??
    "Usuário";

  const [name, setName] = useState(initialName);
  const [photo, setPhoto] = useState<string>((user?.user_metadata?.avatar_url as string | undefined) ?? "");
  const [saved, setSaved] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);

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

      // Upload new avatar if changed
      if (photoFile) {
        try {
          avatarUrl = await uploadAvatar(photoFile);
          setPhotoFile(null);
        } catch (uploadErr) {
          console.error("[SettingsView] Avatar upload failed:", uploadErr);
          toast.warning("Foto não pôde ser enviada. Salvando apenas o nome...");
        }
      } else if (photo && !photo.startsWith("data:")) {
        avatarUrl = photo;
      }

      // Always update profile name (even if photo upload fails)
      await updateProfile({ fullName: name, avatarUrl });
      setSaved(true);
      toast.success("Perfil atualizado com sucesso!");
    } catch (err) {
      console.error("[SettingsView] Profile save failed:", err);
      toast.error("Erro ao salvar perfil. Tente novamente.");
    }
  };

  const inputClass = "w-full bg-zinc-900/80 border border-zinc-700/60 rounded-xl px-4 py-3 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors";

  return (
    <div className="p-4 sm:p-6 min-h-screen max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="size-9 rounded-xl bg-red-500/15 border border-red-500/25 flex items-center justify-center flex-shrink-0">
          <Settings className="size-4.5 text-red-400" />
        </div>
        <div>
          <h1 className="text-xl font-black text-zinc-100 leading-none">Configurações do Usuário</h1>
          <p className="text-[11px] text-zinc-500 mt-0.5">Altere seu nome, foto de perfil e informações da conta</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-5">
        {/* Profile preview */}
        <div className="rounded-2xl bg-zinc-900/50 border border-zinc-800/50 p-5 h-fit">
          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-4">Prévia do Perfil</p>

          <div className="flex flex-col items-center text-center">
            <div className="relative">
              {photo ? (
                <img src={photo} alt={name} className="size-24 rounded-3xl object-cover border border-zinc-700/60" />
              ) : (
                <div className="size-24 rounded-3xl bg-red-500/15 border border-red-500/25 flex items-center justify-center">
                  <span className="text-3xl font-black text-red-400">{initials}</span>
                </div>
              )}
              <button
                onClick={() => fileRef.current?.click()}
                className="absolute -right-2 -bottom-2 size-9 rounded-xl bg-red-600 hover:bg-red-500 text-white flex items-center justify-center border-4 border-[#111111] transition-colors"
              >
                <Camera className="size-4" />
              </button>
            </div>

            <h2 className="text-base font-bold text-zinc-100 mt-4">{name || "Usuário"}</h2>
            <p className="text-xs text-zinc-500 truncate max-w-full">{user?.email ?? "email@studiohub.com"}</p>
          </div>
        </div>

        {/* Form */}
        <div className="rounded-2xl bg-zinc-900/50 border border-zinc-800/50 overflow-hidden">
          <div className="px-6 py-4 border-b border-zinc-800/60">
            <h2 className="text-[12px] font-black uppercase tracking-widest text-zinc-100">Informações Pessoais</h2>
            <p className="text-[11px] text-zinc-500 mt-0.5">Essas informações aparecem na sidebar e nas ações do dashboard</p>
          </div>

          <div className="p-6 space-y-5">
            <div>
              <label className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 block mb-2">
                Nome de Exibição
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-600 pointer-events-none" />
                <input
                  className={cn(inputClass, "pl-10")}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Seu nome"
                />
              </div>
            </div>

            <div>
              <label className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 block mb-2">
                Foto de Perfil
              </label>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
              <div className="flex items-center gap-3 flex-wrap">
                <button
                  onClick={() => fileRef.current?.click()}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-zinc-700/60 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-zinc-100 hover:border-zinc-500 transition-all"
                >
                  <Upload className="size-3.5" />
                  Escolher Imagem
                </button>
                {photo && (
                  <button
                    onClick={() => setPhoto("")}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-red-500/20 bg-red-500/5 text-[10px] font-black uppercase tracking-widest text-red-400 hover:bg-red-500/10 transition-all"
                  >
                    <X className="size-3.5" />
                    Remover Foto
                  </button>
                )}
              </div>
              <p className="text-[10px] text-zinc-600 mt-2">Use uma imagem quadrada para melhor resultado.</p>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-zinc-800/60">
            <p className={cn("text-[11px] transition-colors", saved ? "text-emerald-400" : "text-zinc-600")}> 
              {saved ? "Alterações salvas no Supabase." : "Revise suas informações antes de salvar."}
            </p>
            <button
              onClick={handleSave}
              disabled={savingProfile || uploadingAvatar || !name.trim()}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-[10px] font-black uppercase tracking-widest text-white transition-colors shadow-[0_4px_20px_rgba(255,31,31,0.25)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="size-3.5" />
              {savingProfile || uploadingAvatar ? "Salvando..." : "Salvar Alterações"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
