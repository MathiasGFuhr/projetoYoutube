"use client";

import { useState, useRef, useEffect } from "react";
import {
  X, Upload, Link2, Copy, Check, Folder, Tag, Plus, Trash2, Loader2, Pencil,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useChannels } from "@/shared/hooks/use-channels";
import { useChannelMutations } from "@/shared/hooks/use-channel-mutations";
import { DatePicker } from "@/shared/components/date-picker";
import { Select } from "@/shared/components/select";
import { ChannelModal } from "@/modules/dashboard/components/channels-view";

const STAGES = [
  "Pronto", "Agendado", "Publicado",
];

const VIDEO_TYPES = [
  { value: "Vídeo Standard", label: "Vídeo Longo" },
  { value: "Shorts", label: "Short" },
];

export function normalizeVideoType(value?: string | null): ProjectFormData["videoType"] {
  if (value === "Short" || value === "Shorts") return "Shorts";
  if (value === "Live") return "Live";
  if (value === "Documentário") return "Documentário";
  if (value === "Tutorial") return "Tutorial";
  return "Vídeo Standard";
}

interface ProjectModalProps {
  open: boolean;
  onClose: () => void;
  onSave?: (data: ProjectFormData) => Promise<void> | void;
  initialDate?: string;
  initialData?: Partial<ProjectFormData>;
  videoId?: string;
}

export interface ProjectFormData {
  title: string;
  channelId: string;
  videoType: "Vídeo Standard" | "Shorts" | "Live" | "Documentário" | "Tutorial";
  stage: string;
  publishDate: string;
  driveLink: string;
  localPath: string;
  tags: string[];
  thumbnail: string;
  description: string;
  notes: string;
}

const INPUT = "w-full bg-zinc-900/80 border border-zinc-800/70 rounded-xl px-4 py-2.5 text-[13px] text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors";

const LABEL = "text-[9px] font-bold uppercase tracking-[0.18em] text-zinc-500 block mb-2";

export function ProjectModal({ open, onClose, onSave, initialDate, initialData, videoId }: ProjectModalProps) {
  const isEdit = Boolean(videoId);
  const [form, setForm] = useState<ProjectFormData>({
    title: initialData?.title ?? "",
    channelId: initialData?.channelId ?? "",
    videoType: normalizeVideoType(initialData?.videoType),
    stage: initialData?.stage ?? "Pronto",
    publishDate: initialData?.publishDate ?? initialDate ?? new Date().toISOString().split("T")[0],
    driveLink: initialData?.driveLink ?? "",
    localPath: initialData?.localPath ?? "",
    tags: initialData?.tags ?? [],
    thumbnail: initialData?.thumbnail ?? "",
    description: initialData?.description ?? "",
    notes: initialData?.notes ?? "",
  });

  const [tagInput, setTagInput] = useState("");
  const [copied, setCopied] = useState(false);
  const thumbRef = useRef<HTMLInputElement>(null);
  const lastFormKeyRef = useRef<string | null>(null);
  const [showChannelModal, setShowChannelModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { channels, refetch } = useChannels();
  const { createChannel } = useChannelMutations();

  useEffect(() => {
    if (!open) {
      lastFormKeyRef.current = null;
      return;
    }

    const formKey = videoId ?? `new:${initialDate ?? ""}`;
    if (lastFormKeyRef.current === formKey) return;
    lastFormKeyRef.current = formKey;

    setForm({
      title: initialData?.title ?? "",
      channelId: initialData?.channelId ?? "",
      videoType: normalizeVideoType(initialData?.videoType),
      stage: initialData?.stage ?? "Pronto",
      publishDate: initialData?.publishDate ?? initialDate ?? new Date().toISOString().split("T")[0],
      driveLink: initialData?.driveLink ?? "",
      localPath: initialData?.localPath ?? "",
      tags: initialData?.tags ?? [],
      thumbnail: initialData?.thumbnail ?? "",
      description: initialData?.description ?? "",
      notes: initialData?.notes ?? "",
    });
    setTagInput("");
  }, [open, videoId, initialDate]);

  const handleSave = async () => {
    if (!onSave || !form.title.trim()) return;
    setIsSaving(true);
    try {
      await onSave(form);
      onClose();
    } catch (err) {
      console.error("[ProjectModal] save failed:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const set = <K extends keyof ProjectFormData>(key: K, val: ProjectFormData[K]) => {
    setForm((f) => ({ ...f, [key]: val }));
  };

  const addTag = () => {
    const t = tagInput.trim().toLowerCase();
    if (t && !form.tags.includes(t)) set("tags", [...form.tags, t]);
    setTagInput("");
  };

  const removeTag = (t: string) => set("tags", form.tags.filter((x) => x !== t));

  const copyPath = () => {
    if (form.localPath) {
      navigator.clipboard.writeText(form.localPath);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  const handleThumb = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => set("thumbnail", ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-8 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-[960px] rounded-2xl bg-[#111111] border border-zinc-800/60 shadow-2xl shadow-black/80 flex flex-col mb-8">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800/60">
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.22em] text-red-500 mb-1">Ficha Técnica do Vídeo</p>
            <h2 className="text-[15px] font-black uppercase tracking-widest text-zinc-100">{isEdit ? "Editar Produção" : "Criar Nova Produção"}</h2>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-200 transition-colors p-1">
            <X className="size-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Row 1: Title + Channel */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={LABEL}>Título Provisório / Tema</label>
              <input
                className={INPUT}
                value={form.title}
                onChange={(e) => set("title", e.target.value)}
                placeholder="Ex: Como Dominar o Algoritmo"
              />
            </div>
            <div>
              <label className={LABEL}>Canal do YouTube</label>
              <Select
                value={form.channelId}
                onChange={(val) => {
                  if (val === "new") {
                    setShowChannelModal(true);
                  } else {
                    set("channelId", val);
                  }
                }}
                placeholder="Selecionar canal..."
                options={[
                  ...channels.map((c) => ({ value: c.id, label: c.name })),
                  { value: "new", label: "+ Cadastrar novo canal" },
                ]}
              />
            </div>
          </div>

          {/* Row 2: Stage + Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={LABEL}>Estágio de Produção</label>
              <Select
                value={form.stage}
                onChange={(val) => set("stage", val)}
                placeholder="Selecionar estágio..."
                options={STAGES.map((s) => ({ value: s, label: s }))}
              />
            </div>
            <div>
              <label className={LABEL}>Tipo de Conteúdo</label>
              <Select
                value={form.videoType}
                onChange={(val) => set("videoType", val as ProjectFormData["videoType"])}
                placeholder="Selecionar tipo..."
                options={VIDEO_TYPES}
              />
            </div>
          </div>

          {/* Row 3: Date + Drive */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={LABEL}>Data de Publicação</label>
              <DatePicker
                value={form.publishDate}
                onChange={(val) => set("publishDate", val)}
                markedDates={[]}
              />
            </div>
            <div>
              <label className={LABEL}>Link do Google Drive (Assets/Brutos)</label>
              <div className="relative">
                <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-600 pointer-events-none" />
                <input
                  className={cn(INPUT, "pl-10")}
                  value={form.driveLink}
                  onChange={(e) => set("driveLink", e.target.value)}
                  placeholder="https://drive.google.com/..."
                />
              </div>
            </div>
          </div>

          {/* Local path */}
          <div className="rounded-xl border border-zinc-800/50 bg-zinc-900/30 p-4">
            <label className={LABEL}>Caminho da Pasta do Projeto (PC Local)</label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Folder className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-600 pointer-events-none" />
                <input
                  className={cn(INPUT, "pl-10")}
                  value={form.localPath}
                  onChange={(e) => set("localPath", e.target.value)}
                  placeholder="C:/YouTube/Canal_Premium/Video_01"
                />
              </div>
              <button
                onClick={copyPath}
                className={cn(
                  "flex items-center gap-1.5 px-4 py-2.5 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all flex-shrink-0",
                  copied
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                    : "border-zinc-700/60 bg-zinc-900/60 text-zinc-400 hover:text-zinc-100 hover:border-zinc-500"
                )}
              >
                {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                {copied ? "Copiado" : "Copiar"}
              </button>
            </div>
          </div>

          {/* Row: Thumbnail + Description/Notes */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
            {/* Thumbnail */}
            <div className="lg:col-span-2">
              <label className={LABEL}>Thumbnail do Vídeo</label>
              <div className="rounded-xl border border-dashed border-zinc-700/50 bg-zinc-900/30 p-4 flex flex-col items-center justify-center text-center min-h-[220px]">
                {form.thumbnail ? (
                  <div className="relative w-full">
                    <img src={form.thumbnail} alt="Thumbnail" className="w-full rounded-lg object-cover max-h-[180px]" />
                    <button
                      onClick={() => set("thumbnail", "")}
                      className="absolute top-2 right-2 p-1 rounded-lg bg-black/60 text-zinc-400 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                ) : (
                  <>
                    <p className="text-sm font-semibold text-zinc-400 mb-1">Nenhuma thumbnail cadastrada</p>
                    <p className="text-[10px] text-zinc-600 mb-4">Envie um arquivo do PC, insira uma URL direta ou gere uma base.</p>
                    <div className="flex items-center gap-2">
                      <input ref={thumbRef} type="file" accept="image/*" className="hidden" onChange={handleThumb} />
                      <button
                        onClick={() => thumbRef.current?.click()}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-[10px] font-black uppercase tracking-widest text-white transition-colors"
                      >
                        <Upload className="size-3" />Subir PC
                      </button>
                      <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-zinc-700/60 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-zinc-100 hover:border-zinc-500 transition-all">
                        <Link2 className="size-3" />Colar Link
                      </button>
                    </div>
                    <button className="mt-2 text-[9px] text-zinc-600 hover:text-zinc-400 transition-colors uppercase tracking-wide">
                      Mockup Rápido (Unsplash)
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Right column */}
            <div className="lg:col-span-3 space-y-4">
              {/* Description */}
              <div>
                <label className={LABEL}>Descrição Oficial (SEO)</label>
                <textarea
                  className={cn(INPUT, "resize-none h-28")}
                  value={form.description}
                  onChange={(e) => set("description", e.target.value)}
                  placeholder="Copie ou edite aqui a descrição que irá no painel do YouTube..."
                />
              </div>

              {/* Notes */}
              <div>
                <label className={LABEL}>Anotações / Roteiro Resumido</label>
                <textarea
                  className={cn(INPUT, "resize-none h-28")}
                  value={form.notes}
                  onChange={(e) => set("notes", e.target.value)}
                  placeholder="Ideias de piadas, rascunhos de diálogos, links de referências gerais..."
                />
              </div>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className={LABEL}>Tags do Vídeo / Metadados</label>
            <div className="relative">
              <Tag className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-600 pointer-events-none" />
              <input
                className={cn(INPUT, "pl-10")}
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
                placeholder="Pressione Enter para adicionar tag..."
              />
            </div>
            {form.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {form.tags.map((t) => (
                  <span key={t} className="flex items-center gap-1 text-[10px] font-medium text-zinc-400 bg-zinc-800/60 border border-zinc-700/40 px-2.5 py-1 rounded-full">
                    #{t}
                    <button onClick={() => removeTag(t)} className="text-zinc-600 hover:text-zinc-300 transition-colors">
                      <X className="size-2.5" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-zinc-800/60">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-zinc-700/60 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-zinc-100 hover:border-zinc-600 transition-all"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving || !form.title.trim()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-[10px] font-black uppercase tracking-widest text-white transition-colors shadow-[0_4px_20px_rgba(255,31,31,0.25)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                {isEdit ? "Salvando..." : "Criando vídeo..."}
              </>
            ) : (
              <>
                {isEdit ? <Pencil className="size-3.5" /> : <Upload className="size-3.5" />}
                {isEdit ? "Salvar Alterações" : "Criar Vídeo"}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Channel creation modal */}
      {showChannelModal && (
        <ChannelModal
          initial={{}}
          onSave={async (data) => {
            try {
              const newChannel = await createChannel(data);
              await refetch();
              if (newChannel?.id) {
                set("channelId", newChannel.id);
              }
              setShowChannelModal(false);
            } catch (err) {
              console.error("[ProjectModal] create channel failed:", err);
            }
          }}
          onClose={() => setShowChannelModal(false)}
        />
      )}
    </div>
  );
}
