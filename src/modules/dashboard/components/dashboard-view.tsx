"use client";

import { useState, useMemo, memo } from "react";
import {
  FolderOpen,
  Zap,
  CalendarClock,
  CheckCircle2,
  ArrowRight,
  Plus,
  Tv2,
  AlertTriangle,
  FileText,
  ImageIcon,
  Scissors,
  Send,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ChannelModal } from "@/modules/dashboard/components/channels-view";
import { ProjectModal } from "@/modules/dashboard/components/project-modal";
import { useChannels } from "@/shared/hooks/use-channels";
import { useChannelMutations } from "@/shared/hooks/use-channel-mutations";
import { useVideos } from "@/shared/hooks/use-videos";
import { useVideoMutations } from "@/shared/hooks/use-video-mutations";
import { SubscriptionGuard } from "@/modules/dashboard/components/subscription-guard";
import { toast } from "sonner";

interface Channel {
  id: string;
  label: string;
  dot?: string;
}

interface Project {
  id: number;
  title: string;
  channel: string;
  channelId: string;
  date: string;
  status: "Pronto" | "Publicado" | "Análise" | "Rascunho" | "Atrasado";
  thumbColor: string;
}

interface UpcomingItem {
  title: string;
  channelId: string;
  overdue: boolean;
  date: string;
}

interface ActivityItem {
  title: string;
  description: string;
  channelId: string;
  time: string;
}

const CHANNELS: Channel[] = [{ id: "all", label: "Todos" }];

const PROJECTS: Project[] = [];
const UPCOMING: UpcomingItem[] = [];
const ACTIVITY: ActivityItem[] = [];

const STATUS_STYLES: Record<Project["status"], string> = {
  Pronto:    "text-emerald-400 bg-emerald-500/10 border-emerald-500/25",
  Publicado: "text-sky-400 bg-sky-500/10 border-sky-500/25",
  Análise:   "text-amber-400 bg-amber-500/10 border-amber-500/25",
  Rascunho:  "text-zinc-400 bg-zinc-800/60 border-zinc-700/40",
  Atrasado:  "text-red-400 bg-red-500/10 border-red-500/25",
};

const CHANNEL_DOTS: Record<string, string> = {};

const STAGE_ICONS = [
  { icon: FileText,  color: "text-blue-400",    bg: "bg-blue-500/10",    border: "border-blue-500/20",    label: "Roteiro",   count: 0 },
  { icon: ImageIcon, color: "text-violet-400",  bg: "bg-violet-500/10",  border: "border-violet-500/20",  label: "Thumbnail", count: 0 },
  { icon: Scissors,  color: "text-amber-400",   bg: "bg-amber-500/10",   border: "border-amber-500/20",   label: "Edição",    count: 0 },
  { icon: Send,      color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", label: "Publicado", count: 0 },
];

export function DashboardView({ displayName }: { displayName: string }) {
  const [selectedChannel, setSelectedChannel] = useState("all");
  const [showChannelModal, setShowChannelModal] = useState(false);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const { channels } = useChannels();
  const { createChannel } = useChannelMutations();
  const { videos, refetch: refetchVideos } = useVideos();
  const { createVideo } = useVideoMutations();

  const firstName = displayName.split(" ")[0];

  const channelFilterTabs: Channel[] = [
    { id: "all", label: "Todos" },
    ...channels.map((c) => ({
      id: c.id,
      label: c.name,
      dot: "rounded-full",
    })),
  ];
  const channelColors = Object.fromEntries(channels.map((c) => [c.id, c.color ?? "#ef4444"]));

  const channelMap = useMemo(() => {
    const map = new Map<string, typeof channels[0]>();
    channels.forEach((c) => map.set(c.id, c));
    return map;
  }, [channels]);

  const filteredVideos = useMemo(
    () => selectedChannel === "all" ? videos : videos.filter((v) => v.channel_id === selectedChannel),
    [selectedChannel, videos]
  );

  const stats = useMemo(() => ({
    total: videos.length,
    emProducao: videos.filter((v) => v.status !== "Publicado").length,
    agendados: videos.filter((v) => v.status === "Agendado").length,
    publicados: videos.filter((v) => v.status === "Publicado").length,
  }), [videos]);

  return (
    <SubscriptionGuard>
      <div className="flex flex-col min-h-full">
      {/* Page header */}
      <div className="sticky top-0 z-20 bg-[#0d0d0d]/95 backdrop-blur-sm border-b border-zinc-800/50 px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-zinc-100 leading-none">Dashboard</h1>
          <p className="text-xs text-zinc-500 mt-1">Visão geral do pipeline de produção</p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          {/* Channel filter tabs */}
          <div className="flex items-center gap-0.5 bg-zinc-900/80 border border-zinc-800/60 rounded-xl p-1 overflow-x-auto max-w-full">
            {channelFilterTabs.map((ch) => (
              <button
                key={ch.id}
                onClick={() => setSelectedChannel(ch.id)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] font-medium transition-all duration-150 whitespace-nowrap",
                  selectedChannel === ch.id
                    ? "bg-zinc-800 text-zinc-100 shadow-sm"
                    : "text-zinc-500 hover:text-zinc-300"
                )}
              >
                {ch.dot && (
                  <span
                    className={cn("size-1.5 rounded-full flex-shrink-0", ch.dot)}
                    style={ch.id !== "all" ? { backgroundColor: channelColors[ch.id] } : undefined}
                  />
                )}
                {ch.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowChannelModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-zinc-700/60 text-xs text-zinc-400 hover:text-zinc-100 hover:border-zinc-600 transition-all"
          >
            <Tv2 className="size-3.5" />
            Cadastrar Canal
          </button>
          <button
            onClick={() => setShowProjectModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-xs font-semibold text-white transition-colors shadow-[0_4px_20px_rgba(255,31,31,0.25)]"
          >
            <Plus className="size-3.5" />
            Novo Projeto
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 sm:p-6 space-y-4 sm:space-y-5">

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
          {[
            { label: "Total Projetos", value: stats.total,       sub: "No pipeline",       icon: FolderOpen,    iconBg: "bg-orange-500/15 border-orange-500/25",  iconColor: "text-orange-400" },
            { label: "Em Produção",    value: stats.emProducao,  sub: "Roteiro + Render",  icon: Zap,           iconBg: "bg-yellow-500/15 border-yellow-500/25",  iconColor: "text-yellow-400" },
            { label: "Agendados",      value: stats.agendados,   sub: "Prontos p/ lançar", icon: CalendarClock, iconBg: "bg-sky-500/15 border-sky-500/25",        iconColor: "text-sky-400"    },
            { label: "Publicados",     value: stats.publicados,  sub: "No YouTube",        icon: CheckCircle2,  iconBg: "bg-emerald-500/15 border-emerald-500/25", iconColor: "text-emerald-400"},
          ].map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.label}
                className="relative flex items-center justify-between rounded-2xl bg-zinc-900/40 border border-zinc-800/60 px-5 py-4 hover:bg-zinc-900/60 transition-colors cursor-default"
              >
                <div>
                  <p className="text-[11px] text-zinc-500 font-medium">{s.label}</p>
                  <p className="text-3xl font-bold text-zinc-50 leading-none mt-1.5">{s.value}</p>
                  <p className="text-[10px] text-zinc-600 mt-1.5">{s.sub}</p>
                </div>
                <div className={cn("flex items-center justify-center size-11 rounded-2xl border flex-shrink-0", s.iconBg)}>
                  <Icon className={cn("size-5", s.iconColor)} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 lg:gap-5">

          {/* Projects list */}
          <div className="lg:col-span-3 rounded-2xl bg-zinc-900/30 border border-zinc-800/60 overflow-hidden">
            <div className="px-5 py-3.5 border-b border-zinc-800/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-red-500" />
                <h2 className="text-sm font-semibold text-zinc-200">Projetos Recentes</h2>
                <span className="text-[11px] text-zinc-600 bg-zinc-800/60 border border-zinc-700/40 px-2 py-0.5 rounded-full">
                  {filteredVideos.length} /{" "}{stats.total}
                </span>
              </div>
              <button className="flex items-center gap-1 text-xs text-zinc-500 hover:text-red-400 transition-colors">
                Ver tudo <ArrowRight className="size-3" />
              </button>
            </div>

            <div className="divide-y divide-zinc-800/30">
              {filteredVideos.length === 0 ? (
                <div className="px-5 py-8 text-center">
                  <p className="text-sm text-zinc-600">Nenhum vídeo no pipeline</p>
                  <p className="text-[11px] text-zinc-700 mt-1">Clique em "Novo Vídeo" para começar</p>
                </div>
              ) : (
                filteredVideos.map((v) => {
                  const ch = channelMap.get(v.channel_id);
                  const status = (v.status ?? "Pronto") as keyof typeof STATUS_STYLES;
                  return (
                    <div
                      key={v.id}
                      className="group flex items-center gap-3.5 px-5 py-3 hover:bg-zinc-800/20 transition-colors"
                    >
                      {/* Thumbnail */}
                      {v.thumbnail_url ? (
                        <img
                          src={v.thumbnail_url}
                          alt={v.title}
                          className="size-10 rounded-lg flex-shrink-0 object-cover border border-zinc-700/30"
                          loading="lazy"
                        />
                      ) : (
                        <div
                          className="size-10 rounded-lg flex-shrink-0 bg-gradient-to-br border border-zinc-700/30"
                          style={{ background: `linear-gradient(145deg, ${ch?.color ?? "#ef4444"}33, ${ch?.color ?? "#ef4444"}11)` }}
                        />
                      )}
                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-zinc-300 truncate group-hover:text-zinc-100 transition-colors leading-snug">
                          {v.title}
                        </p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span
                            className="size-1.5 rounded-full flex-shrink-0"
                            style={{ backgroundColor: ch?.color ?? "#ef4444" }}
                          />
                          <p className="text-[10px] text-zinc-600 truncate">{ch?.name ?? v.channel_id}</p>
                        </div>
                      </div>
                      {/* Date */}
                      <span className="text-[10px] text-zinc-600 flex-shrink-0 hidden sm:block">{v.publish_date ? new Date(v.publish_date).toLocaleDateString("pt-BR") : "—"}</span>
                      {/* Status */}
                      <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-lg border flex-shrink-0", STATUS_STYLES[status] ?? STATUS_STYLES["Pronto"])}>
                        {v.status ?? "Pronto"}
                      </span>
                      {/* Action */}
                      <button className="flex-shrink-0 flex items-center justify-center size-6 rounded-lg text-zinc-600 hover:text-zinc-300 hover:bg-zinc-700/60 transition-all opacity-0 group-hover:opacity-100">
                        <ArrowRight className="size-3" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right panels */}
          <div className="lg:col-span-2 flex flex-col gap-4 lg:gap-5">

            {/* A Seguir */}
            <div className="rounded-2xl bg-zinc-900/30 border border-zinc-800/60 overflow-hidden">
              <div className="px-5 py-3.5 border-b border-zinc-800/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="size-3.5 text-orange-400" />
                  <h2 className="text-sm font-semibold text-zinc-200">A Seguir</h2>
                </div>
                <span className="size-4 flex items-center justify-center rounded-full bg-red-500/15 text-[10px] font-bold text-red-400">
                  {UPCOMING.filter((u) => u.overdue).length}
                </span>
              </div>
              <div className="divide-y divide-zinc-800/30">
                {UPCOMING.map((item, i) => (
                  <div key={i} className="flex items-start gap-3 px-5 py-3 hover:bg-zinc-800/20 transition-colors">
                    {item.overdue ? (
                      <span className="flex-shrink-0 mt-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded bg-red-500/15 text-red-400 border border-red-500/25 uppercase tracking-wide">
                        Atrasado
                      </span>
                    ) : (
                      <span className="flex-shrink-0 mt-0.5 size-1.5 rounded-full bg-amber-500 mt-1.5" />
                    )}
                    <p className="text-xs text-zinc-400 leading-snug line-clamp-2 hover:text-zinc-200 transition-colors cursor-pointer">
                      {item.title}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Atividade Recente */}
            <div className="rounded-2xl bg-zinc-900/30 border border-zinc-800/60 overflow-hidden flex-1">
              <div className="px-5 py-3.5 border-b border-zinc-800/50">
                <h2 className="text-sm font-semibold text-zinc-200">Atividade Recente</h2>
              </div>
              <div className="divide-y divide-zinc-800/30">
                {ACTIVITY.map((item, i) => (
                  <div key={i} className="flex items-start gap-3 px-5 py-3 hover:bg-zinc-800/20 transition-colors">
                    <div className={cn(
                      "flex-shrink-0 mt-0.5 size-1.5 rounded-full mt-1.5 bg-zinc-500"
                    )} />
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-medium text-zinc-400 leading-snug line-clamp-1 hover:text-zinc-200 transition-colors cursor-pointer">
                        {item.title}
                      </p>
                      <p className="text-[10px] text-zinc-600 mt-0.5 truncate">{item.description}</p>
                      <p className="text-[9px] text-zinc-700 mt-0.5">{item.time}</p>
                    </div>
                    {item.description.includes("Atrasado") && (
                      <AlertTriangle className="size-3 text-red-400 flex-shrink-0 mt-0.5" />
                    )}
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Channel Modal */}
      {showChannelModal && (
        <ChannelModal
          initial={{}}
          onSave={async (data) => {
            try {
              await createChannel(data);
              toast.success("Canal criado!");
              setShowChannelModal(false);
            } catch (err) {
              console.error(err);
              toast.error("Erro ao criar canal.");
            }
          }}
          onClose={() => setShowChannelModal(false)}
        />
      )}

      {/* Project Modal */}
      <ProjectModal
        open={showProjectModal}
        onClose={() => setShowProjectModal(false)}
        onSave={async (data) => {
          try {
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
            refetchVideos();
          } catch (err) {
            console.error("[Dashboard] create video failed:", err);
            toast.error("Erro ao criar vídeo. Tente novamente.");
          }
        }}
      />
      </div>
    </SubscriptionGuard>
  );
}
