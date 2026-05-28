"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Lightbulb, Wrench, CheckCircle2, Archive,
  Plus, Search, X, Loader2, Trash2, Edit3,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Status = "ativa" | "em-desenvolvimento" | "usada" | "arquivada";

const STATUS_CFG: Record<Status, {
  label: string;
  icon: React.ElementType;
  selected: string;
  badge: string;
}> = {
  "ativa": {
    label: "Ativa", icon: Lightbulb,
    selected: "bg-emerald-600/80 text-emerald-100 border-emerald-500/40",
    badge: "text-emerald-400 bg-emerald-500/10 border-emerald-500/25",
  },
  "em-desenvolvimento": {
    label: "Em desenvolvimento", icon: Wrench,
    selected: "bg-violet-600/80 text-violet-100 border-violet-500/40",
    badge: "text-violet-400 bg-violet-500/10 border-violet-500/25",
  },
  "usada": {
    label: "Usada", icon: CheckCircle2,
    selected: "bg-zinc-600/80 text-zinc-100 border-zinc-500/40",
    badge: "text-zinc-400 bg-zinc-500/10 border-zinc-500/25",
  },
  "arquivada": {
    label: "Arquivada", icon: Archive,
    selected: "bg-amber-600/80 text-amber-100 border-amber-500/40",
    badge: "text-amber-400 bg-amber-500/10 border-amber-500/25",
  },
};

const CHANNELS: { value: string; label: string; dot: string }[] = [];

interface Idea {
  id: number;
  title: string;
  channelId: string;
  description: string;
  tags: string[];
  status: Status;
  createdAt: string;
}

const SEED: Idea[] = [];

// ─── Card ────────────────────────────────────────────────────────────────────
function IdeaCard({
  idea,
  onEdit,
  onDelete,
}: {
  idea: Idea;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const st  = STATUS_CFG[idea.status];
  const StIcon = st.icon;
  const ch = CHANNELS.find((c) => c.value === idea.channelId);

  return (
    <div className="flex flex-col gap-3 p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800/50 hover:border-zinc-700/60 transition-all group">
      {/* Status + Channel */}
      <div className="flex items-center justify-between gap-2">
        <span className={cn("flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wide px-2.5 py-1 rounded-full border", st.badge)}>
          <StIcon className="size-2.5" />{st.label}
        </span>
        {ch && (
          <div className="flex items-center gap-1.5">
            <span className={cn("size-1.5 rounded-full flex-shrink-0", ch.dot)} />
            <span className="text-[10px] text-zinc-500 truncate">{ch.label}</span>
          </div>
        )}
      </div>

      {/* Title */}
      <p className="text-[13px] font-bold text-zinc-200 line-clamp-2 leading-snug group-hover:text-zinc-100 transition-colors">
        {idea.title}
      </p>

      {/* Description */}
      {idea.description && (
        <p className="text-[11px] text-zinc-500 leading-relaxed line-clamp-3">{idea.description}</p>
      )}

      {/* Tags */}
      {idea.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {idea.tags.map((t) => (
            <span key={t} className="text-[9px] font-medium text-zinc-500 bg-zinc-800/60 border border-zinc-700/40 px-2 py-0.5 rounded-full">
              #{t}
            </span>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-1 border-t border-zinc-800/50">
        <span className="text-[10px] text-zinc-700">{idea.createdAt}</span>
        <div className="flex items-center gap-1">
          <button onClick={onEdit} className="p-1.5 rounded-lg text-zinc-600 hover:text-zinc-300 hover:bg-zinc-800/60 transition-all">
            <Edit3 className="size-3.5" />
          </button>
          <button onClick={onDelete} className="p-1.5 rounded-lg text-zinc-600 hover:text-red-400 hover:bg-red-500/10 transition-all">
            <Trash2 className="size-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────
function IdeaModal({
  initial,
  onSave,
  onClose,
}: {
  initial?: Idea;
  onSave: (d: Omit<Idea, "id" | "createdAt">) => void;
  onClose: () => void;
}) {
  const [title,       setTitle]       = useState(initial?.title       ?? "");
  const [channelId,   setChannelId]   = useState(initial?.channelId   ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [tagInput,    setTagInput]    = useState("");
  const [tags,        setTags]        = useState<string[]>(initial?.tags ?? []);
  const [status,      setStatus]      = useState<Status>(initial?.status ?? "ativa");

  const addTag = () => {
    const t = tagInput.trim().toLowerCase().replace(/\s+/g, "-");
    if (t && !tags.includes(t)) setTags((p) => [...p, t]);
    setTagInput("");
  };

  const INPUT = "w-full bg-zinc-900/80 border border-zinc-700/60 rounded-xl px-4 py-3 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl bg-[#141414] border border-zinc-800/60 flex flex-col max-h-[92vh]">

        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-zinc-800/60 flex-shrink-0">
          <div className="size-7 rounded-lg bg-red-600/20 border border-red-500/30 flex items-center justify-center flex-shrink-0">
            <Plus className="size-3.5 text-red-400" />
          </div>
          <h2 className="flex-1 text-[12px] font-black uppercase tracking-widest text-zinc-100">
            {initial ? "Editar Ideia de Clipe" : "Nova Ideia de Clipe"}
          </h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-200 transition-colors">
            <X className="size-4" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto px-5 py-4 space-y-4">
          {/* Title */}
          <div>
            <label className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 block mb-2">Título da Ideia</label>
            <input className={INPUT} value={title} onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: React Hooks para iniciantes" />
          </div>

          {/* Channel */}
          <div>
            <label className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 block mb-2">Canal</label>
            <div className="relative">
              <select value={channelId} onChange={(e) => setChannelId(e.target.value)}
                className={cn(INPUT, "appearance-none pr-9 cursor-pointer")}>
                {CHANNELS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
              <svg className="absolute right-3 top-1/2 -translate-y-1/2 size-3.5 text-zinc-500 pointer-events-none" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
              </svg>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 block mb-2">Descrição / Roteiro</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)}
              placeholder="Escreva os detalhes da ideia, roteiro, ângulos de câmera, etc..."
              className={cn(INPUT, "resize-none h-28 border-l-2 border-l-red-500/60")} />
          </div>

          {/* Tags */}
          <div>
            <label className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 block mb-2">Tags</label>
            <div className="flex gap-2">
              <input value={tagInput} onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
                placeholder="Adicionar tag..."
                className={cn(INPUT, "flex-1")} />
              <button onClick={addTag}
                className="size-[46px] flex-shrink-0 flex items-center justify-center rounded-xl border border-zinc-700/60 text-zinc-400 hover:text-zinc-100 hover:border-zinc-500 bg-zinc-900/80 transition-all">
                <Plus className="size-4" />
              </button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {tags.map((t) => (
                  <span key={t} className="flex items-center gap-1 text-[10px] text-zinc-400 bg-zinc-800/60 border border-zinc-700/40 px-2 py-0.5 rounded-full">
                    #{t}
                    <button onClick={() => setTags((p) => p.filter((x) => x !== t))} className="text-zinc-600 hover:text-zinc-300">
                      <X className="size-2.5" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Status */}
          <div>
            <label className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 block mb-2">Status</label>
            <div className="flex flex-wrap gap-2">
              {(Object.entries(STATUS_CFG) as [Status, (typeof STATUS_CFG)[Status]][]).map(([key, cfg]) => {
                const Icon = cfg.icon;
                const active = status === key;
                return (
                  <button key={key} onClick={() => setStatus(key)}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-2 rounded-xl border text-[11px] font-semibold transition-all",
                      active ? cfg.selected : "bg-zinc-900/60 border-zinc-700/60 text-zinc-400 hover:border-zinc-600"
                    )}>
                    <Icon className="size-3.5" />{cfg.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-zinc-800/60 flex-shrink-0">
          <button onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-zinc-700/60 text-[11px] font-bold uppercase tracking-wide text-zinc-400 hover:text-zinc-200 hover:border-zinc-600 transition-all">
            Cancelar
          </button>
          <button onClick={() => title.trim() && onSave({ title: title.trim(), channelId, description, tags, status })}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-[11px] font-black uppercase tracking-wide text-white transition-colors shadow-[0_4px_20px_rgba(255,31,31,0.3)]">
            <Archive className="size-3.5" />
            {initial ? "Salvar Alterações" : "Criar ideia"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
const TABS: { value: "todas" | Status; label: string }[] = [
  { value: "todas",              label: "Todas" },
  { value: "ativa",              label: "Ativas" },
  { value: "em-desenvolvimento", label: "Em desenvolvimento" },
  { value: "usada",              label: "Usadas" },
  { value: "arquivada",          label: "Arquivadas" },
];

export function IdeasView() {
  const [ideas,   setIdeas]   = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab,     setTab]     = useState<"todas" | Status>("todas");
  const [search,  setSearch]  = useState("");
  const [showModal,    setShowModal]    = useState(false);
  const [editingIdea,  setEditingIdea]  = useState<Idea | null>(null);

  useEffect(() => {
    const t = setTimeout(() => { setIdeas(SEED); setLoading(false); }, 700);
    return () => clearTimeout(t);
  }, []);

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    Object.keys(STATUS_CFG).forEach((s) => { c[s] = ideas.filter((i) => i.status === s).length; });
    return c;
  }, [ideas]);

  const filtered = useMemo(() => {
    let list = ideas;
    if (tab !== "todas") list = list.filter((i) => i.status === tab);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((i) => i.title.toLowerCase().includes(q) || i.tags.some((t) => t.includes(q)));
    }
    return list;
  }, [ideas, tab, search]);

  const openNew  = () => { setEditingIdea(null); setShowModal(true); };
  const openEdit = (idea: Idea) => { setEditingIdea(idea); setShowModal(true); };
  const closeModal = () => { setShowModal(false); setEditingIdea(null); };

  const handleSave = (data: Omit<Idea, "id" | "createdAt">) => {
    if (editingIdea) {
      setIdeas((p) => p.map((i) => i.id === editingIdea.id ? { ...i, ...data } : i));
    } else {
      const today = new Date().toLocaleDateString("pt-BR");
      setIdeas((p) => [...p, { ...data, id: Date.now(), createdAt: today }]);
    }
    closeModal();
  };

  return (
    <div className="p-4 sm:p-6 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3 sm:gap-4">
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center flex-shrink-0">
            <Lightbulb className="size-4.5 text-amber-400" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-black text-zinc-100 leading-none">Ideias de Clipes</h1>
            <p className="text-[11px] text-zinc-500 mt-0.5">Guarde e organize suas ideias de conteúdo</p>
          </div>
        </div>
        <button onClick={openNew}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-[10px] font-black uppercase tracking-widest text-white transition-colors shadow-[0_4px_20px_rgba(255,31,31,0.25)]">
          <Plus className="size-3.5" />Nova Ideia
        </button>
      </div>

      {/* Tabs + Search */}
      <div className="flex items-center justify-between gap-4 mb-5">
        <div className="flex items-center gap-0.5">
          {TABS.map((t) => {
            const count = t.value === "todas" ? ideas.length : (counts[t.value] ?? 0);
            const active = tab === t.value;
            return (
              <button key={t.value} onClick={() => setTab(t.value)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all",
                  active ? "bg-zinc-800 text-zinc-100" : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/40"
                )}>
                {t.label}
                <span className={cn("text-[9px] font-black", active ? "text-zinc-400" : "text-zinc-700")}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-zinc-500 pointer-events-none" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar ideias..."
            className="bg-zinc-900/80 border border-zinc-700/60 rounded-xl pl-9 pr-4 py-2.5 text-[12px] text-zinc-300 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-600 transition-colors w-[220px]" />
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 gap-3">
          <Loader2 className="size-5 text-zinc-600 animate-spin" />
          <p className="text-sm text-zinc-600">Carregando ideias...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 gap-3">
          <Lightbulb className="size-10 text-zinc-700" />
          <p className="text-sm text-zinc-500">Nenhuma ideia encontrada</p>
          <button onClick={openNew}
            className="mt-1 flex items-center gap-2 px-4 py-2 rounded-xl border border-zinc-700/60 text-[11px] font-bold text-zinc-400 hover:text-zinc-200 hover:border-zinc-600 transition-all">
            <Plus className="size-3.5" />Criar primeira ideia
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((idea) => (
            <IdeaCard key={idea.id} idea={idea}
              onEdit={() => openEdit(idea)}
              onDelete={() => setIdeas((p) => p.filter((i) => i.id !== idea.id))}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <IdeaModal
          initial={editingIdea ?? undefined}
          onSave={handleSave}
          onClose={closeModal}
        />
      )}
    </div>
  );
}
