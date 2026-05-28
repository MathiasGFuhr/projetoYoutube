"use client";

import { useState, useMemo } from "react";
import { CheckCircle2, Calendar, ExternalLink, Trash2, Search, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useChannels } from "@/shared/hooks/use-channels";

interface Video {
  id: number;
  title: string;
  channelId: string;
  date: string;
  gradFrom: string;
  gradTo: string;
  thumbText: string;
  youtubeUrl: string;
}

const VIDEOS: Video[] = [];

function VideoCardInner({
  video,
  onDelete,
  channels,
}: {
  video: Video;
  onDelete: (id: number) => void;
  channels: { id: string; name: string; color?: string | null }[];
}) {
  const ch = channels.find((c) => c.id === video.channelId);
  const color = ch?.color ?? "#ef4444";


  return (
    <div className="flex flex-col rounded-2xl overflow-hidden bg-zinc-900/50 border border-zinc-800/50 hover:border-zinc-700/60 transition-all group">
      {/* Thumbnail */}
      <div
        className="relative w-full overflow-hidden"
        style={{
          height: 168,
          background: `linear-gradient(145deg, ${video.gradFrom}, ${video.gradTo})`,
        }}
      >
        {/* Thumbnail text (mimics YouTube thumbnail typography) */}
        <div className="absolute inset-0 flex flex-col items-center justify-center p-4 select-none">
          <p className="text-white/10 text-4xl font-black uppercase text-center leading-none tracking-tight">
            {video.thumbText}
          </p>
        </div>
        {/* Bottom overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
        {/* PUBLICADO badge */}
        <div className="absolute top-2.5 left-2.5">
          <span className="flex items-center gap-1 bg-emerald-500 text-white text-[9px] font-black uppercase tracking-wide px-2 py-1 rounded-full shadow-lg">
            <CheckCircle2 className="size-2.5" />
            PUBLICADO
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="px-3.5 pt-3 pb-2 flex flex-col gap-1.5 flex-1">
        <p className="text-[12px] font-bold text-zinc-200 line-clamp-2 leading-snug group-hover:text-zinc-100 transition-colors">
          {video.title}
        </p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="size-1.5 rounded-full flex-shrink-0" style={{ background: color }} />
          <span className="text-[10px] text-zinc-500 truncate">{ch?.name ?? video.channelId}</span>
        </div>
        <div className="flex items-center gap-1.5 text-zinc-600">
          <Calendar className="size-3 flex-shrink-0" />
          <span className="text-[10px]">{video.date}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="px-3.5 py-2.5 border-t border-zinc-800/50 flex items-center justify-between">
        <a
          href={video.youtubeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-[11px] font-medium text-zinc-400 hover:text-zinc-100 transition-colors"
        >
          <ExternalLink className="size-3" />
          Abrir
        </a>
        <button
          onClick={() => onDelete(video.id)}
          className="text-zinc-600 hover:text-red-400 transition-colors p-1 rounded-lg hover:bg-red-500/10"
        >
          <Trash2 className="size-3.5" />
        </button>
      </div>
    </div>
  );
}

export function PublishedView() {
  const { channels } = useChannels();
  const [videos, setVideos] = useState<Video[]>(VIDEOS);
  const [selectedChannel, setSelectedChannel] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = useMemo(() => {
    let list = videos;
    if (selectedChannel !== "all") {
      list = list.filter((v) => v.channelId === selectedChannel);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((v) => v.title.toLowerCase().includes(q));
    }
    return list;
  }, [videos, selectedChannel, searchQuery]);

  const handleDelete = (id: number) => {
    setVideos((prev) => prev.filter((v) => v.id !== id));
  };

  return (
    <div className="p-4 sm:p-6 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-3 sm:gap-4">
        {/* Left */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center size-9 rounded-full bg-emerald-500/15 border border-emerald-500/25">
            <CheckCircle2 className="size-4.5 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-black text-zinc-100 leading-none">Vídeos Publicados</h1>
            <p className="text-[11px] text-zinc-500 mt-0.5">{videos.length} publicados</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Channel select */}
          <div className="relative">
            <select
              value={selectedChannel}
              onChange={(e) => setSelectedChannel(e.target.value)}
              className="appearance-none bg-zinc-900/80 border border-zinc-700/60 rounded-xl pl-4 pr-9 py-2.5 text-[12px] text-zinc-300 focus:outline-none focus:border-zinc-600 transition-colors cursor-pointer"
            >
              <option value="all">Todos os canais</option>
              {channels.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 size-3.5 text-zinc-500 pointer-events-none" />
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-zinc-500 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar título..."
              className="bg-zinc-900/80 border border-zinc-700/60 rounded-xl pl-9 pr-4 py-2.5 text-[12px] text-zinc-300 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-600 transition-colors w-[200px]"
            />
          </div>
        </div>
      </div>

      {/* Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((video) => (
            <VideoCardInner key={video.id} video={video} onDelete={handleDelete} channels={channels} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <CheckCircle2 className="size-10 text-zinc-700" />
          <p className="text-sm text-zinc-500">Nenhum vídeo encontrado</p>
        </div>
      )}

      {/* Footer */}
      {filtered.length > 0 && (
        <p className="text-center text-[11px] text-zinc-600 mt-8">
          Exibindo {filtered.length} de {videos.length} publicados
        </p>
      )}
    </div>
  );
}
