"use client";

import { createContext, useContext, useState, useCallback, useMemo } from "react";
import type { Tables } from "@/lib/supabase/database.types";

export type Channel = Tables<"channels">;
export type Video = Tables<"videos">;

interface DataCacheContextValue {
  channels: Channel[];
  setChannels: (channels: Channel[]) => void;
  videos: Video[];
  setVideos: (videos: Video[]) => void;
  lastFetch: { channels: number; videos: number };
  markFetched: (key: "channels" | "videos") => void;
}

const DataCacheContext = createContext<DataCacheContextValue | undefined>(undefined);

const CACHE_TTL_MS = 60_000; // 1 minute cache

export function DataCacheProvider({ children }: { readonly children: React.ReactNode }) {
  const [channels, setChannelsState] = useState<Channel[]>([]);
  const [videos, setVideosState] = useState<Video[]>([]);
  const [lastFetch, setLastFetch] = useState({ channels: 0, videos: 0 });

  const setChannels = useCallback((data: Channel[]) => {
    setChannelsState(data);
  }, []);

  const setVideos = useCallback((data: Video[]) => {
    setVideosState(data);
  }, []);

  const markFetched = useCallback((key: "channels" | "videos") => {
    setLastFetch((prev) => ({ ...prev, [key]: Date.now() }));
  }, []);

  const value = useMemo(
    () => ({ channels, setChannels, videos, setVideos, lastFetch, markFetched }),
    [channels, videos, lastFetch, setChannels, setVideos, markFetched]
  );

  return <DataCacheContext.Provider value={value}>{children}</DataCacheContext.Provider>;
}

export function useDataCache() {
  const ctx = useContext(DataCacheContext);
  if (!ctx) throw new Error("useDataCache must be used within DataCacheProvider");
  return ctx;
}

export function isCacheStale(lastFetch: number, ttl = CACHE_TTL_MS) {
  return Date.now() - lastFetch > ttl || lastFetch === 0;
}
