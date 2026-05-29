"use client";

import { useState, useRef, useMemo } from "react";
import { Plus, Link2, X, Edit3, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useChannels } from "@/shared/hooks/use-channels";
import { useVideos } from "@/shared/hooks/use-videos";
import { useChannelMutations } from "@/shared/hooks/use-channel-mutations";
import { SubscriptionGuard } from "@/modules/dashboard/components/subscription-guard";
import { useUploadImage } from "@/shared/hooks/use-upload-image";
import type { Channel } from "@/shared/hooks/use-channels";

export const PRESET_COLORS = [
  "#ef4444", "#3b82f6", "#22c55e", "#f97316",
  "#a855f7", "#ec4899", "#14b8a6", "#06b6d4",
];

export const EMPTY_FORM: Omit<Channel, "id" | "user_id" | "created_at" | "updated_at"> = {
  name: "", handle: "", link: "", color: "#ef4444", photo_url: "", niche: "",
  videos: 0, published: 0, active: true,
};

interface ChannelStats {
  videos: number;
  published: number;
  remaining: number;
  pct: number;
}

// ─── Card ────────────────────────────────────────────────────────────────────
function ChannelCard({ ch, onEdit, stats }: { ch: Channel; onEdit: () => void; stats?: ChannelStats }) {
  const videos = stats?.videos ?? ch.videos ?? 0;
  const published = stats?.published ?? ch.published ?? 0;
  const remaining = stats?.remaining ?? videos - published;
  const pct = stats?.pct ?? (videos > 0 ? Math.round((published / videos) * 100) : 0);
  const color = ch.color ?? "#ef4444";
  const initials = ch.name.split(" ").filter(Boolean).map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div
      className="group relative flex flex-col rounded-2xl overflow-hidden bg-gradient-to-b from-zinc-900/80 to-zinc-950/90 border border-zinc-800/60 hover:border-zinc-700/70 transition-all duration-300"
      style={{ boxShadow: `0 0 0 1px ${color}15, 0 20px 60px rgba(0,0,0,0.4)` }}
    >
      {/* Accent top bar */}
      <div
        className="h-[3px] w-full flex-shrink-0"
        style={{ background: `linear-gradient(90deg, ${color}cc, ${color}66)` }}
      />

      {/* Header */}
      <div className="flex items-center gap-3.5 px-5 pt-4 pb-3">
        {ch.photo_url ? (
          <img src={ch.photo_url} alt={ch.name}
            className="size-12 rounded-2xl object-cover flex-shrink-0 ring-2 ring-zinc-800/80" />
        ) : (
          <div
            className="size-12 rounded-2xl flex items-center justify-center flex-shrink-0 text-sm font-black"
            style={{
              background: `${color}18`,
              boxShadow: `inset 0 0 0 1.5px ${color}40, 0 4px 20px ${color}15`,
              color: color,
            }}
          >
            {initials}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-bold text-zinc-100 truncate leading-snug tracking-[-0.01em]">{ch.name}</p>
          <p className="text-[11px] text-zinc-500 truncate mt-0.5">{ch.handle}</p>
        </div>
        <button
          onClick={onEdit}
          className="flex items-center justify-center size-8 rounded-xl text-zinc-600 hover:text-zinc-200 hover:bg-zinc-800/70 transition-all opacity-0 group-hover:opacity-100"
          title="Editar canal"
        >
          <Edit3 className="size-3.5" />
        </button>
      </div>

      <div className="mx-5 h-px bg-zinc-800/50" />

      {/* Stats */}
      <div className="grid grid-cols-3 px-5 py-3.5">
        {[
          { label: "VÍDEOS",     value: ch.videos ?? 0,    accent: false },
          { label: "PUBLICADOS", value: ch.published ?? 0, accent: false },
          { label: "RESTANTES",  value: remaining,         accent: remaining > 0 },
        ].map((s) => (
          <div key={s.label} className="text-center">
            <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-[0.16em] mb-1.5">{s.label}</p>
            <p className={cn(
              "text-[28px] font-black leading-none tracking-[-0.04em]",
              s.accent ? "text-red-500" : "text-zinc-50"
            )}>
              {s.value}
            </p>
          </div>
        ))}
      </div>

      {/* Progress */}
      <div className="px-5 pb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] text-zinc-500 font-medium">Média de Lançamentos:</span>
          <span className="text-[10px] font-black" style={{ color: color }}>{pct}% de conclusão</span>
        </div>
        <div className="h-[4px] rounded-full bg-zinc-800/80 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700 ease-out"
            style={{
              width: `${pct}%`,
              background: `linear-gradient(90deg, ${color}dd, ${color}88)`,
              boxShadow: `0 0 12px ${color}40`,
            }}
          />
        </div>
      </div>

      <div className="mx-5 h-px bg-zinc-800/50" />

      {/* Footer */}
      <div className="flex items-center justify-between px-5 py-3">
        <div className="flex items-center gap-1.5">
          <span className="size-2 rounded-full flex-shrink-0" style={{ background: color, boxShadow: `0 0 8px ${color}60` }} />
          <span className="text-[10px] font-mono text-zinc-500 tracking-wide">{color}</span>
        </div>
        <div className="flex items-center gap-3">
          {ch.link && (
            <a href={ch.link} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1 text-[10px] font-bold text-zinc-500 hover:text-zinc-200 uppercase tracking-wider transition-colors"
            >
              <Link2 className="size-3" />Canal
            </a>
          )}
          <button
            onClick={onEdit}
            className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-400 uppercase tracking-wider hover:text-emerald-300 transition-colors"
          >
            <span className="size-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(34,197,94,0.5)]" />
            Ativo
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────
export function ChannelModal({
  initial,
  onSave,
  onClose,
}: {
  initial: Partial<Channel>;
  onSave: (data: Omit<Channel, "id" | "user_id" | "created_at" | "updated_at">) => Promise<void> | void;
  onClose: () => void;
}) {
  const isEdit = !!initial.id;
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const { uploadImage } = useUploadImage();
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<Omit<Channel, "id" | "user_id" | "created_at" | "updated_at">>({
    ...EMPTY_FORM,
    name:      initial.name       ?? "",
    handle:    initial.handle     ?? "",
    link:      initial.link       ?? "",
    color:     initial.color      ?? "#ef4444",
    photo_url: initial.photo_url  ?? "",
    niche:     initial.niche      ?? "",
    videos:    initial.videos     ?? 0,
    published: initial.published  ?? 0,
    active:    initial.active     ?? true,
  });

  const set = <K extends keyof typeof form>(key: K, val: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [key]: val }));

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(form);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Local preview immediately
    const reader = new FileReader();
    reader.onload = (ev) => set("photo_url", ev.target?.result as string);
    reader.readAsDataURL(file);

    // Upload to Supabase Storage
    setIsUploadingPhoto(true);
    try {
      const ext = file.name.split(".").pop() ?? "png";
      const path = `channels/${Date.now()}.${ext}`;
      const publicUrl = await uploadImage(file, "avatars", path);
      set("photo_url", publicUrl);
      toast.success("Foto enviada!");
    } catch (err) {
      console.error("[ChannelModal] photo upload failed:", err);
      toast.error("Erro ao enviar foto. Tente novamente.");
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const INPUT = "w-full bg-zinc-900/80 border border-zinc-700/60 rounded-xl px-4 py-3 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="w-full max-w-xl rounded-2xl bg-[#141414] border border-zinc-800/60 flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800/60 flex-shrink-0">
          <h2 className="text-[12px] font-black uppercase tracking-widest text-zinc-100">
            {isEdit ? "Editar Canal do YouTube" : "Cadastrar Canal do YouTube"}
          </h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-200 transition-colors">
            <X className="size-4" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto px-6 py-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 block mb-2">
                Nome do Canal
              </label>
              <input className={INPUT} value={form.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="Nome do canal" />
            </div>
            <div>
              <label className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 block mb-2">
                Handle do Canal (Opcional)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 text-xs select-none pointer-events-none">
                  @
                </span>
                <input
                  className={`${INPUT} pl-7`}
                  value={form.handle?.replace(/^@/, "") ?? ""}
                  onChange={(e) => set("handle", e.target.value)}
                  placeholder="handle_do_canal"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 block mb-2">
              Link do Canal (Opcional)
            </label>
            <input className={INPUT} value={form.link ?? ""}
              onChange={(e) => set("link", e.target.value)}
              placeholder="https://www.youtube.com/@canal" />
          </div>

          {/* Color picker */}
          <div>
            <label className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 block mb-2">
              Escolha a Cor de Identificação Coesiva
            </label>
            <div className="flex items-center gap-3 flex-wrap">
              {/* Current color + custom picker */}
              <div className="relative">
                <input
                  type="color"
                  value={form.color ?? "#ef4444"}
                  onChange={(e) => set("color", e.target.value)}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <div
                  className={cn(
                    "size-10 rounded-xl border-2 transition-all duration-150 flex-shrink-0 cursor-pointer",
                    form.color ? "border-white/30" : "border-zinc-700"
                  )}
                  style={{ background: form.color ?? "#ef4444" }}
                  title="Clique para escolher qualquer cor"
                />
              </div>

              <div className="w-px h-6 bg-zinc-800" />

              {/* Preset shortcuts */}
              {PRESET_COLORS.map((c) => (
                <button key={c} onClick={() => set("color", c)}
                  className={cn(
                    "size-7 rounded-lg transition-all duration-150 flex-shrink-0",
                    form.color === c
                      ? "ring-2 ring-white/40 scale-110"
                      : "opacity-60 hover:opacity-100 hover:scale-105"
                  )}
                  style={{ background: c }}
                  title={c}
                />
              ))}
            </div>
          </div>

          {/* Photo */}
          <div>
            <label className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 block mb-2">
              Foto do Canal
            </label>
            <div className="flex items-center gap-3">
              {form.photo_url ? (
                <img src={form.photo_url} alt="" className="size-12 rounded-xl object-cover flex-shrink-0" />
              ) : (
                <div className="size-12 rounded-xl bg-zinc-800/60 border border-zinc-700/40 flex-shrink-0" />
              )}
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
              <button onClick={() => fileRef.current?.click()}
                disabled={isUploadingPhoto}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-zinc-700/60 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-zinc-100 hover:border-zinc-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                {isUploadingPhoto ? (
                  <>
                    <Loader2 className="size-3 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  "Escolher Imagem"
                )}
              </button>
              {form.photo_url && (
                <button onClick={() => set("photo_url", "")}
                  className="text-[10px] font-black uppercase tracking-widest text-red-500 hover:text-red-400 transition-colors">
                  Remover
                </button>
              )}
            </div>
          </div>

          {/* Niche */}
          <div>
            <label className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 block mb-2">
              Nicho / Descrição Curta do Canal
            </label>
            <textarea
              className={cn(INPUT, "resize-none h-24")}
              value={form.niche ?? ""}
              onChange={(e) => set("niche", e.target.value)}
              placeholder="Ex: Canal focado em review de softwares e novidades de tecnologia..."
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 px-6 py-4 border-t border-zinc-800/60 flex-shrink-0">
          <button onClick={handleSave}
            disabled={isSaving || !form.name.trim()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed text-[10px] font-black uppercase tracking-widest text-white transition-colors shadow-[0_4px_20px_rgba(255,31,31,0.3)]">
            {isSaving && <Loader2 className="size-3.5 animate-spin" />}
            {isSaving ? "Criando canal..." : "Salvar Alterações"}
          </button>
          <button onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-zinc-700/60 text-[10px] font-bold uppercase tracking-widest text-zinc-400 hover:text-zinc-200 hover:border-zinc-600 transition-all">
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export function ChannelsView() {
  const { channels, isLoading, refetch } = useChannels();
  const { videos } = useVideos();
  const { createChannel, updateChannel, deleteChannel, isPending } = useChannelMutations();
  const [editing, setEditing] = useState<Partial<Channel> | null>(null);

  const channelStats = useMemo(() => {
    const map = new Map<string, ChannelStats>();
    channels.forEach((ch) => {
      const chVideos = videos.filter((v) => v.channel_id === ch.id);
      const total = chVideos.length;
      const published = chVideos.filter((v) => v.status === "Publicado").length;
      map.set(ch.id, {
        videos: total,
        published,
        remaining: total - published,
        pct: total > 0 ? Math.round((published / total) * 100) : 0,
      });
    });
    return map;
  }, [channels, videos]);

  const handleSave = async (data: Omit<Channel, "id" | "user_id" | "created_at" | "updated_at">) => {
    const payload = {
      ...data,
      handle: data.handle ? (data.handle.startsWith("@") ? data.handle : `@${data.handle}`) : "",
    };
    try {
      if (editing?.id) {
        await updateChannel(editing.id, payload);
        toast.success("Canal atualizado!");
      } else {
        await createChannel(payload);
        toast.success("Canal criado!");
      }
      await refetch();
      setEditing(null);
    } catch (err) {
      console.error(err);
      toast.error("Erro ao salvar canal.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este canal?")) return;
    try {
      await deleteChannel(id);
      toast.success("Canal excluído!");
      await refetch();
    } catch (err) {
      console.error(err);
      toast.error("Erro ao excluir canal.");
    }
  };

  return (
    <SubscriptionGuard>
      <div className="p-4 sm:p-6 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-6 gap-3 sm:gap-4">
        <div>
          <h1 className="text-lg sm:text-xl font-black uppercase tracking-widest text-zinc-100">
            Gerenciamento de Canais
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Monitore os canais ativos sob seu guarda-chuva de criação de conteúdo
          </p>
        </div>
        <button
          onClick={() => setEditing({})}
          disabled={isPending}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-[10px] font-black uppercase tracking-widest text-white transition-colors shadow-[0_4px_20px_rgba(255,31,31,0.25)] disabled:opacity-50 w-fit"
        >
          <Plus className="size-3.5" />
          Cadastrar Canal
        </button>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="size-6 animate-spin text-zinc-600" />
        </div>
      )}

      {/* Cards */}
      {!isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {channels.map((ch) => (
            <div key={ch.id} className="relative group">
              <ChannelCard ch={ch} onEdit={() => setEditing(ch)} stats={channelStats.get(ch.id)} />
              <button
                onClick={() => handleDelete(ch.id)}
                className="absolute top-3 right-3 p-1.5 rounded-lg bg-black/60 text-zinc-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                title="Excluir canal"
              >
                <Trash2 className="size-3.5" />
              </button>
            </div>
          ))}
          {channels.length === 0 && (
            <div className="col-span-full text-center py-20">
              <p className="text-sm text-zinc-500">Nenhum canal cadastrado.</p>
              <p className="text-xs text-zinc-600 mt-1">Clique em "Cadastrar Canal" para começar.</p>
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {editing !== null && (
        <ChannelModal initial={editing} onSave={handleSave} onClose={() => setEditing(null)} />
      )}
      </div>
    </SubscriptionGuard>
  );
}
