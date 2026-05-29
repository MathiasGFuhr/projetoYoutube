"use client";

import { useState, useMemo, useCallback } from "react";
import { ChevronLeft, ChevronRight, Flame, Plus, X, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import { useVideos } from "@/shared/hooks/use-videos";
import { useChannels } from "@/shared/hooks/use-channels";
import { useVideoMutations } from "@/shared/hooks/use-video-mutations";
import { ProjectModal } from "@/modules/dashboard/components/project-modal";
import { SubscriptionGuard } from "@/modules/dashboard/components/subscription-guard";
import type { ProjectFormData } from "@/modules/dashboard/components/project-modal";
import { toast } from "sonner";

const MONTH_NAMES = [
  "JANEIRO","FEVEREIRO","MARÇO","ABRIL","MAIO","JUNHO",
  "JULHO","AGOSTO","SETEMBRO","OUTUBRO","NOVEMBRO","DEZEMBRO",
];

const DAY_HEADERS = ["DOM","SEG","TER","QUA","QUI","SEX","SÁB"];

function pad2(n: number) { return String(n).padStart(2, "0"); }

function toDateStr(year: number, month: number, day: number) {
  return `${year}-${pad2(month + 1)}-${pad2(day)}`;
}

function formatDisplay(dateStr: string) {
  const [y, m, d] = dateStr.split("-");
  return `${d}/${m}/${y}`;
}

function getCalendarDays(year: number, month: number) {
  const firstDay   = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevDays    = new Date(year, month, 0).getDate();

  const days: { day: number; current: boolean; dateStr: string }[] = [];

  for (let i = firstDay - 1; i >= 0; i--) {
    const d = prevDays - i;
    const pm = month === 0 ? 11 : month - 1;
    const py = month === 0 ? year - 1 : year;
    days.push({ day: d, current: false, dateStr: toDateStr(py, pm, d) });
  }

  for (let d = 1; d <= daysInMonth; d++) {
    days.push({ day: d, current: true, dateStr: toDateStr(year, month, d) });
  }

  let nextD = 1;
  while (days.length < 42) {
    const nm = month === 11 ? 0 : month + 1;
    const ny = month === 11 ? year + 1 : year;
    days.push({ day: nextD, current: false, dateStr: toDateStr(ny, nm, nextD) });
    nextD++;
  }

  return days;
}

export function CalendarView() {
  const [current, setCurrent] = useState(() => new Date());
  const year  = current.getFullYear();
  const month = current.getMonth();

  const { videos, refetch: refetchVideos } = useVideos();
  const { channels } = useChannels();
  const { createVideo, updateVideo } = useVideoMutations();

  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [projectDate, setProjectDate] = useState<string>("");
  const [editingVideo, setEditingVideo] = useState<typeof videos[0] | null>(null);

  const calDays = useMemo(() => getCalendarDays(year, month), [year, month]);

  const byDate = useMemo(() => {
    const map: Record<string, typeof videos> = {};
    videos.forEach((v) => {
      const d = v.publish_date;
      if (d) (map[d] ??= []).push(v);
    });
    return map;
  }, [videos]);

  const dayVideos = selectedDay ? (byDate[selectedDay] ?? []) : [];

  const todayStr = useMemo(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  }, []);

  const getDayBadgeStyle = useCallback((vids: typeof videos) => {
    if (vids.length === 0) return null;
    const allPublished = vids.every((v) => v.status === "Publicado");
    const anyOverdue = vids.some(
      (v) => v.publish_date && v.publish_date < todayStr && v.status !== "Publicado"
    );
    if (anyOverdue) return "text-red-300 bg-red-500/15 border-red-500/25";
    if (allPublished) return "text-emerald-300 bg-emerald-500/15 border-emerald-500/25";
    return "text-amber-300 bg-amber-500/15 border-amber-500/25";
  }, [todayStr]);

  const upcoming = useMemo(() => {
    return [...videos]
      .filter((v) => v.publish_date)
      .sort((a, b) => (a.publish_date ?? "").localeCompare(b.publish_date ?? ""))
      .slice(0, 5);
  }, [videos]);

  const prev = () => setCurrent(new Date(year, month - 1, 1));
  const next = () => setCurrent(new Date(year, month + 1, 1));

  const handleDayClick = (dateStr: string, isCurrent: boolean) => {
    if (!isCurrent) return;
    setSelectedDay(dateStr);
  };

  const handleCreateProject = () => {
    setEditingVideo(null);
    setSelectedDay(null);
    setProjectDate(selectedDay ?? "");
    setShowProjectModal(true);
  };

  const handleSaveProject = async (data: ProjectFormData) => {
    try {
      if (editingVideo) {
        await updateVideo(editingVideo.id, {
          title: data.title,
          channel_id: data.channelId,
          status: data.stage as any,
          publish_date: data.publishDate || null,
          drive_link: data.driveLink || null,
          local_path: data.localPath || null,
          tags: data.tags,
          thumbnail_url: data.thumbnail || null,
          description: data.description || null,
          notes: data.notes || null,
        });
        toast.success("Vídeo atualizado!");
        setEditingVideo(null);
      } else {
        await createVideo({
          title: data.title,
          channel_id: data.channelId,
          status: data.stage as any,
          publish_date: data.publishDate || null,
          drive_link: data.driveLink || null,
          local_path: data.localPath || null,
          tags: data.tags,
          thumbnail_url: data.thumbnail || null,
          description: data.description || null,
          notes: data.notes || null,
          priority: "media",
          video_type: "Vídeo Standard",
        });
        toast.success("Vídeo criado com sucesso!");
      }
      refetchVideos();
      setShowProjectModal(false);
    } catch (err) {
      console.error("[Calendar] save video failed:", err);
      toast.error(editingVideo ? "Erro ao atualizar vídeo." : "Erro ao criar vídeo. Tente novamente.");
    }
  };

  return (
    <SubscriptionGuard>
      <div className="flex flex-col lg:flex-row h-screen bg-[#0d0d0d]">

      {/* ── Calendar ─────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden p-3 sm:p-5">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-3 sm:mb-4 flex-shrink-0 gap-2">
          <div>
            <h1 className="text-base sm:text-lg font-black uppercase tracking-widest text-zinc-100">
              Calendário de Lançamentos
            </h1>
            <p className="text-[10px] sm:text-xs text-zinc-500 mt-0.5">
              Agende e rastreie seus vídeos ao longo dos meses para otimizar frequência
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={prev}
              className="flex items-center justify-center size-7 rounded-lg border border-zinc-700/60 text-zinc-400 hover:text-zinc-100 hover:border-zinc-600 transition-all"
            >
              <ChevronLeft className="size-3.5" />
            </button>
            <span className="text-[13px] font-bold text-zinc-200 w-32 text-center uppercase tracking-wider">
              {MONTH_NAMES[month]} {year}
            </span>
            <button
              onClick={next}
              className="flex items-center justify-center size-7 rounded-lg border border-zinc-700/60 text-zinc-400 hover:text-zinc-100 hover:border-zinc-600 transition-all"
            >
              <ChevronRight className="size-3.5" />
            </button>
          </div>
        </div>

        {/* Grid wrapper */}
        <div className="flex-1 flex flex-col">

          {/* Day headers */}
          <div className="grid grid-cols-7 flex-shrink-0 gap-1 sm:gap-2 mb-1 sm:mb-2">
            {DAY_HEADERS.map((d) => (
              <div
                key={d}
                className="py-1 text-center text-[9px] sm:text-[11px] font-bold text-zinc-600 uppercase tracking-widest"
              >
                {d}
              </div>
            ))}
          </div>

          {/* Day cells */}
          <div
            className="flex-1 grid grid-cols-7 gap-1 sm:gap-2"
            style={{ gridTemplateRows: "repeat(6, 1fr)" }}
          >
            {calDays.map((day, idx) => {
              const vids = byDate[day.dateStr] ?? [];
              const SHOW = 2;
              const extra = vids.length - SHOW;

              return (
                <div
                  key={idx}
                  onClick={() => handleDayClick(day.dateStr, day.current)}
                  className={cn(
                    "relative flex flex-col rounded-lg sm:rounded-2xl border p-1 sm:p-2 overflow-hidden transition-all duration-200",
                    !day.current
                      ? "border-zinc-900/40 bg-zinc-950/30 opacity-40"
                      : "border-zinc-800/50 bg-zinc-950/55 hover:border-zinc-700/60 hover:bg-zinc-900/60 cursor-pointer"
                  )}
                >
                  {/* Day number + badge */}
                  <div className="flex items-start justify-between mb-1.5">
                    <span className={cn(
                      "text-[10px] sm:text-[12px] font-bold",
                      day.current ? "text-zinc-300" : "text-zinc-700"
                    )}>
                      {day.day}
                    </span>
                    {vids.length > 0 && day.current && (
                      <span className={cn(
                        "text-[7px] sm:text-[9px] font-black px-1 sm:px-1.5 py-0.5 rounded-md border",
                        getDayBadgeStyle(vids)
                      )}>
                        {vids.length} VÍD
                      </span>
                    )}
                  </div>

                  {/* Video pills */}
                  {day.current && (
                    <div className="hidden sm:flex flex-col gap-[3px]">
                      {vids.slice(0, SHOW).map((v) => {
                        const ch = channels.find((c) => c.id === v.channel_id);
                        return (
                          <div
                            key={v.id}
                            title={`${ch?.name ?? "Canal"} — ${v.title}`}
                            className="flex items-center gap-1.5 px-2 py-[5px] rounded-lg overflow-hidden bg-zinc-800/60 text-zinc-300"
                          >
                            <span
                              className="size-1.5 rounded-full flex-shrink-0"
                              style={{ backgroundColor: ch?.color ?? "#ef4444" }}
                            />
                            <span className="text-[9px] text-zinc-500 truncate max-w-[50px] flex-shrink-0">
                              {ch?.name ?? "Canal"}
                            </span>
                            <span className="text-[10px] font-semibold truncate leading-none">
                              {v.title}
                            </span>
                          </div>
                        );
                      })}
                      {extra > 0 && (
                        <span className="hidden sm:block text-[9px] text-zinc-500 pl-1.5 font-medium">+{extra} mais</span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Right panel ──────────────────────────────── */}
      <div className="lg:w-[270px] flex-shrink-0 border-t lg:border-t-0 lg:border-l border-zinc-800/50 bg-[#0a0a0a] flex flex-col overflow-y-auto max-h-[40vh] lg:max-h-none">

        {/* Próximos Lançamentos */}
        <div className="p-4 flex-shrink-0">
          <h2 className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-3">
            <span className="size-1.5 rounded-full bg-red-500 flex-shrink-0" />
            Próximos Lançamentos
          </h2>

          <div className="space-y-3">
            {upcoming.length === 0 ? (
              <p className="text-[11px] text-zinc-600">Nenhum vídeo agendado</p>
            ) : (
              upcoming.map((video, i) => {
                const ch = channels.find((c) => c.id === video.channel_id);
                return (
                  <div key={video.id}>
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span
                        className="text-[8px] font-black px-2 py-0.5 rounded flex-shrink-0 text-white"
                        style={{ backgroundColor: ch?.color ?? "#ef4444" }}
                      >
                        {ch?.name ?? "CANAL"}
                      </span>
                      <span className="text-[9px] text-zinc-500 flex-shrink-0 tabular-nums">
                        {video.publish_date ? formatDisplay(video.publish_date) : "—"}
                      </span>
                    </div>
                    <p className="text-[11px] font-medium text-zinc-300 line-clamp-2 leading-snug mb-1">
                      {video.title}
                    </p>
                    <p className="text-[9px] text-zinc-600 uppercase tracking-wide">
                      STATUS:{" "}
                      <span className="text-zinc-400">{video.status ?? "Pronto"}</span>
                      {" | "}STANDARD
                    </p>
                    {i < upcoming.length - 1 && (
                      <div className="mt-3 border-b border-zinc-800/40" />
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Meta Editorial */}
        <div className="p-4 border-t border-zinc-800/50 mt-auto">
          <h2 className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2">
            <Flame className="size-3 text-orange-400 flex-shrink-0" />
            Meta Editorial
          </h2>
          <p className="text-[11px] text-zinc-500 leading-relaxed">
            Mantenha uma frequência de envio de pelo menos 2 vídeos semanais por canal
            para treinar o algoritmo do YouTube.
          </p>
          <div className="mt-3 flex items-center justify-between px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <span className="text-[10px] text-zinc-400">Frequência ideal:</span>
            <span className="text-[11px] font-black text-emerald-400">100% OK</span>
          </div>
        </div>

      </div>

      {/* ── Day Modal ──────────────────────────────── */}
      {selectedDay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-[#141414] border border-zinc-800/60 flex flex-col max-h-[80vh]">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800/60 flex-shrink-0">
              <div>
                <h2 className="text-sm font-bold text-zinc-100">
                  {formatDisplay(selectedDay)}
                </h2>
                <p className="text-[11px] text-zinc-500 mt-0.5">
                  {dayVideos.length} vídeo{dayVideos.length !== 1 ? "s" : ""} agendado{dayVideos.length !== 1 ? "s" : ""}
                </p>
              </div>
              <button
                onClick={() => setSelectedDay(null)}
                className="text-zinc-500 hover:text-zinc-200 transition-colors"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Body */}
            <div className="overflow-y-auto px-6 py-4 flex-1">
              {dayVideos.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm text-zinc-500">Nenhum vídeo agendado para este dia</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {dayVideos.map((v) => {
                    const ch = channels.find((c) => c.id === v.channel_id);
                    return (
                      <div
                        key={v.id}
                        className="group flex items-center gap-3 p-3 rounded-xl bg-zinc-900/50 border border-zinc-800/50"
                      >
                        {v.thumbnail_url ? (
                          <img
                            src={v.thumbnail_url}
                            alt={v.title}
                            className="size-10 rounded-lg flex-shrink-0 object-cover border border-zinc-700/30"
                            loading="lazy"
                          />
                        ) : (
                          <div
                            className="size-10 rounded-lg flex-shrink-0 border border-zinc-700/30"
                            style={{ backgroundColor: ch?.color ?? "#ef4444" }}
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-[12px] font-medium text-zinc-200 truncate">
                            {v.title}
                          </p>
                          <p className="text-[10px] text-zinc-500">{ch?.name ?? v.channel_id}</p>
                        </div>
                        <span className="text-[10px] font-semibold text-zinc-400 flex-shrink-0">
                          {v.status ?? "Pronto"}
                        </span>
                        <button
                          onClick={(e) => { e.stopPropagation(); setEditingVideo(v); setShowProjectModal(true); }}
                          className="opacity-0 group-hover:opacity-100 flex items-center justify-center size-6 rounded-lg text-zinc-600 hover:text-zinc-300 hover:bg-zinc-700/60 transition-all"
                          title="Editar"
                        >
                          <Pencil className="size-3" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center gap-3 px-6 py-4 border-t border-zinc-800/60 flex-shrink-0">
              <button
                onClick={() => setSelectedDay(null)}
                className="px-5 py-2.5 rounded-xl border border-zinc-700/60 text-[10px] font-bold uppercase tracking-widest text-zinc-400 hover:text-zinc-200 hover:border-zinc-600 transition-all"
              >
                Fechar
              </button>
              <button
                onClick={handleCreateProject}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-[10px] font-black uppercase tracking-widest text-white transition-colors shadow-[0_4px_20px_rgba(255,31,31,0.3)]"
              >
                <Plus className="size-3.5" />
                Cadastrar Projeto
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Project Modal ──────────────────────────────── */}
      <ProjectModal
        open={showProjectModal}
        onClose={() => { setShowProjectModal(false); setEditingVideo(null); }}
        videoId={editingVideo?.id}
        initialDate={projectDate}
        initialData={editingVideo ? {
          title: editingVideo.title,
          channelId: editingVideo.channel_id,
          stage: editingVideo.status ?? "Pronto",
          publishDate: editingVideo.publish_date ? new Date(editingVideo.publish_date).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
          driveLink: editingVideo.drive_link ?? "",
          localPath: editingVideo.local_path ?? "",
          tags: (editingVideo.tags as string[]) ?? [],
          thumbnail: editingVideo.thumbnail_url ?? "",
          description: editingVideo.description ?? "",
          notes: editingVideo.notes ?? "",
        } : undefined}
        onSave={handleSaveProject}
      />
      </div>
    </SubscriptionGuard>
  );
}
