"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Wrench, Plus, Search, Loader2, X, CheckCircle2,
  Lightbulb, Trash2, ChevronRight, Undo2,
} from "lucide-react";
import { cn } from "@/lib/utils";

const CHANNELS: { value: string; label: string; dot: string }[] = [];

const STAGE_KEYS = ["roteiro", "gravacao", "edicao", "thumbnail"] as const;
type StageKey = (typeof STAGE_KEYS)[number];

const STAGE_LABELS: Record<StageKey, string> = {
  roteiro:   "Roteiro",
  gravacao:  "Gravação",
  edicao:    "Edição",
  thumbnail: "Thumbnail",
};

interface DevIdea {
  id: number;
  title: string;
  channelId: string;
  description: string;
  tags: string[];
  createdAt: string;
  stages: Record<StageKey, boolean>;
}

interface PoolIdea {
  id: number;
  title: string;
  channelId: string;
  description: string;
  tags: string[];
}

const POOL: PoolIdea[] = [];

function emptyStages(): Record<StageKey, boolean> {
  return { roteiro: false, gravacao: false, edicao: false, thumbnail: false };
}

// ─── Dev Card ──────────────────────────────────────────────────────────────
function DevCard({
  idea,
  onToggleStage,
  onMarkDone,
  onReturn,
  onDelete,
}: {
  idea: DevIdea;
  onToggleStage: (id: number, stage: StageKey) => void;
  onMarkDone: (id: number) => void;
  onReturn: (id: number) => void;
  onDelete: (id: number) => void;
}) {
  const ch = CHANNELS.find((c) => c.value === idea.channelId);
  const completedCount = STAGE_KEYS.filter((k) => idea.stages[k]).length;
  const pct = Math.round((completedCount / STAGE_KEYS.length) * 100);
  const allDone = completedCount === STAGE_KEYS.length;

  return (
    <div className={cn(
      "flex flex-col gap-3 p-4 rounded-2xl border transition-all group",
      allDone
        ? "bg-emerald-500/5 border-emerald-500/25"
        : "bg-zinc-900/50 border-zinc-800/50 hover:border-zinc-700/60"
    )}>
      {/* Channel + progress */}
      <div className="flex items-center justify-between gap-2">
        {ch && (
          <div className="flex items-center gap-1.5">
            <span className={cn("size-1.5 rounded-full flex-shrink-0", ch.dot)} />
            <span className="text-[10px] text-zinc-500">{ch.label}</span>
          </div>
        )}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {allDone && (
            <span className="flex items-center gap-1 text-[9px] font-black text-emerald-400 uppercase tracking-wide">
              <CheckCircle2 className="size-2.5" />Pronto
            </span>
          )}
          <span className="text-[9px] font-bold text-violet-400 tabular-nums">{pct}%</span>
        </div>
      </div>

      {/* Title */}
      <p className="text-[13px] font-bold text-zinc-200 line-clamp-2 leading-snug group-hover:text-zinc-100 transition-colors">
        {idea.title}
      </p>

      {/* Description */}
      {idea.description && (
        <p className="text-[11px] text-zinc-500 line-clamp-2 leading-relaxed">{idea.description}</p>
      )}

      {/* Tags */}
      {idea.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {idea.tags.map((t) => (
            <span key={t} className="text-[9px] text-zinc-500 bg-zinc-800/60 border border-zinc-700/40 px-2 py-0.5 rounded-full">
              #{t}
            </span>
          ))}
        </div>
      )}

      {/* Progress bar */}
      <div className="h-[2px] rounded-full bg-zinc-800">
        <div className="h-full rounded-full bg-violet-500 transition-all" style={{ width: `${pct}%` }} />
      </div>

      {/* Stage checkboxes */}
      <div className="grid grid-cols-4 gap-1">
        {STAGE_KEYS.map((key) => {
          const done = idea.stages[key];
          return (
            <button
              key={key}
              onClick={() => onToggleStage(idea.id, key)}
              className={cn(
                "flex flex-col items-center gap-1 py-2 rounded-xl border text-[9px] font-bold uppercase tracking-wide transition-all",
                done
                  ? "bg-violet-500/15 border-violet-500/30 text-violet-300"
                  : "bg-zinc-800/40 border-zinc-700/40 text-zinc-600 hover:border-zinc-600 hover:text-zinc-400"
              )}
            >
              <div className={cn(
                "size-3.5 rounded-full border-2 flex items-center justify-center transition-all",
                done ? "bg-violet-500 border-violet-400" : "border-zinc-600"
              )}>
                {done && <div className="size-1.5 rounded-full bg-white" />}
              </div>
              {STAGE_LABELS[key]}
            </button>
          );
        })}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-1 border-t border-zinc-800/50">
        <span className="text-[10px] text-zinc-700">{idea.createdAt}</span>
        <div className="flex items-center gap-1">
          {allDone && (
            <button onClick={() => onMarkDone(idea.id)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/25 text-[9px] font-bold text-emerald-400 hover:bg-emerald-500/25 transition-all">
              <CheckCircle2 className="size-3" />Marcar como Usada
            </button>
          )}
          <button onClick={() => onReturn(idea.id)}
            className="p-1.5 rounded-lg text-zinc-600 hover:text-amber-400 hover:bg-amber-500/10 transition-all" title="Voltar para Ideias">
            <Undo2 className="size-3.5" />
          </button>
          <button onClick={() => onDelete(idea.id)}
            className="p-1.5 rounded-lg text-zinc-600 hover:text-red-400 hover:bg-red-500/10 transition-all">
            <Trash2 className="size-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Picker Modal ───────────────────────────────────────────────────────────
function IdeaPicker({
  available,
  onPick,
  onClose,
}: {
  available: PoolIdea[];
  onPick: (idea: PoolIdea) => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl bg-[#141414] border border-zinc-800/60 flex flex-col max-h-[80vh]">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-zinc-800/60 flex-shrink-0">
          <Lightbulb className="size-4 text-amber-400" />
          <h2 className="flex-1 text-[12px] font-black uppercase tracking-widest text-zinc-100">
            Mover Ideia para Desenvolvimento
          </h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-200 transition-colors">
            <X className="size-4" />
          </button>
        </div>

        <div className="overflow-y-auto p-4 space-y-2">
          {available.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-sm text-zinc-500">Nenhuma ideia disponível no banco</p>
            </div>
          ) : (
            available.map((idea) => {
              const ch = CHANNELS.find((c) => c.value === idea.channelId);
              return (
                <button
                  key={idea.id}
                  onClick={() => onPick(idea)}
                  className="w-full text-left flex items-center gap-3 p-3.5 rounded-xl border border-zinc-800/50 hover:border-zinc-600/60 hover:bg-zinc-800/30 transition-all group"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-1">
                      {ch && <span className={cn("size-1.5 rounded-full flex-shrink-0", ch.dot)} />}
                      <span className="text-[10px] text-zinc-500">{ch?.label}</span>
                    </div>
                    <p className="text-[12px] font-semibold text-zinc-300 group-hover:text-zinc-100 transition-colors line-clamp-1">
                      {idea.title}
                    </p>
                    {idea.description && (
                      <p className="text-[10px] text-zinc-600 line-clamp-1 mt-0.5">{idea.description}</p>
                    )}
                  </div>
                  <ChevronRight className="size-3.5 text-zinc-600 group-hover:text-violet-400 transition-colors flex-shrink-0" />
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main ────────────────────────────────────────────────────────────────────
export function DevelopmentView() {
  const [items,   setItems]   = useState<DevIdea[]>([]);
  const [pool,    setPool]    = useState<PoolIdea[]>([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState("");
  const [picker,  setPicker]  = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 700);
    return () => clearTimeout(t);
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return items;
    const q = search.toLowerCase();
    return items.filter((i) => i.title.toLowerCase().includes(q));
  }, [items, search]);

  const handlePick = (idea: PoolIdea) => {
    const today = new Date().toLocaleDateString("pt-BR");
    const dev: DevIdea = {
      id:          idea.id,
      title:       idea.title,
      channelId:   idea.channelId,
      description: idea.description,
      tags:        idea.tags,
      createdAt:   today,
      stages:      emptyStages(),
    };
    setItems((p) => [...p, dev]);
    setPool((p) => p.filter((x) => x.id !== idea.id));
    setPicker(false);
  };

  const toggleStage = (id: number, stage: StageKey) => {
    setItems((p) => p.map((i) =>
      i.id === id ? { ...i, stages: { ...i.stages, [stage]: !i.stages[stage] } } : i
    ));
  };

  const markDone = (id: number) => {
    setItems((p) => p.filter((i) => i.id !== id));
  };

  const returnToPool = (id: number) => {
    const item = items.find((i) => i.id === id);
    if (item) {
      setPool((p) => [...p, { id: item.id, title: item.title, channelId: item.channelId, description: item.description, tags: item.tags }]);
    }
    setItems((p) => p.filter((i) => i.id !== id));
  };

  const deleteItem = (id: number) => setItems((p) => p.filter((i) => i.id !== id));

  return (
    <div className="p-4 sm:p-6 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-5 gap-3 sm:gap-4">
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-xl bg-violet-500/15 border border-violet-500/25 flex items-center justify-center flex-shrink-0">
            <Wrench className="size-4.5 text-violet-400" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-black text-zinc-100 leading-none">Ideias em Desenvolvimento</h1>
            <p className="text-[11px] text-zinc-500 mt-0.5">
              Gerencie as Ideias que estão sendo <span className="text-amber-400 font-semibold">trabalhadas</span> agora
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Counter badge */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-amber-500/40 bg-amber-500/10">
            <span className="text-[11px] font-black text-amber-400">{items.length} em andamento</span>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-zinc-500 pointer-events-none" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar em desenvolvimento..."
              className="bg-zinc-900/80 border border-zinc-700/60 rounded-xl pl-9 pr-4 py-2.5 text-[12px] text-zinc-300 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-600 transition-colors w-[230px]"
            />
          </div>
        </div>
      </div>

      {/* Action bar */}
      <div className="flex items-center justify-between mb-5">
        <button
          onClick={() => setPicker(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-dashed border-zinc-700/60 text-[11px] font-bold text-zinc-500 hover:text-violet-300 hover:border-violet-500/40 hover:bg-violet-500/5 transition-all"
        >
          <Plus className="size-3.5" />
          Mover do Banco de Ideias
        </button>
        {items.length > 0 && (
          <p className="text-[11px] text-zinc-600">
            {STAGE_KEYS.reduce((acc, k) => acc + items.filter((i) => i.stages[k]).length, 0)}{" "}
            etapas concluídas de {items.length * STAGE_KEYS.length}
          </p>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 gap-3">
          <Loader2 className="size-5 text-zinc-600 animate-spin" />
          <p className="text-sm text-zinc-600">Carregando Ideias...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-28 gap-3">
          <Wrench className="size-10 text-zinc-700" />
          <p className="text-sm text-zinc-500">
            {items.length === 0
              ? "Nenhuma ideia em desenvolvimento"
              : "Nenhum resultado para a busca"}
          </p>
          {items.length === 0 && (
            <button onClick={() => setPicker(true)}
              className="mt-1 flex items-center gap-2 px-4 py-2 rounded-xl border border-zinc-700/60 text-[11px] font-bold text-zinc-400 hover:text-zinc-200 hover:border-zinc-600 transition-all">
              <Plus className="size-3.5" />Mover do Banco de Ideias
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((idea) => (
            <DevCard
              key={idea.id}
              idea={idea}
              onToggleStage={toggleStage}
              onMarkDone={markDone}
              onReturn={returnToPool}
              onDelete={deleteItem}
            />
          ))}
        </div>
      )}

      {/* Picker modal */}
      {picker && (
        <IdeaPicker
          available={pool}
          onPick={handlePick}
          onClose={() => setPicker(false)}
        />
      )}
    </div>
  );
}
