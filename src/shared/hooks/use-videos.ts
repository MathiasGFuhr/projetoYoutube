"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import type { Tables } from "@/lib/supabase/database.types";
import { toast } from "sonner";
import { useDataCache, isCacheStale } from "@/shared/providers/data-cache-provider";

export type Video = Tables<"videos">;

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const COLUMNS = "id,user_id,channel_id,title,status,priority,video_type,publish_date,drive_link,local_path,thumbnail_url,description,notes,tags,created_at,updated_at" as const;

export function useVideos() {
  const [localLoading, setLocalLoading] = useState(false);
  const cache = useDataCache();
  const supabase = getSupabaseBrowserClient();
  const isMounted = useRef(true);

  const videos = cache.videos;
  const isLoading = localLoading || (videos.length === 0 && isCacheStale(cache.lastFetch.videos));

  const load = useCallback(async (attempt = 1) => {
    if (!isCacheStale(cache.lastFetch.videos)) {
      setLocalLoading(false);
      return;
    }

    setLocalLoading(true);
    try {
      const { data, error } = await supabase
        .from("videos")
        .select(COLUMNS)
        .order("created_at", { ascending: false })
        .limit(200);

      if (error) throw error;
      if (isMounted.current) {
        cache.setVideos(data ?? []);
        cache.markFetched("videos");
      }
    } catch (err: any) {
      console.error(`[useVideos] load error (attempt ${attempt}):`, err);
      if (attempt < 3) {
        const delay = attempt * 1500;
        console.log(`[useVideos] retrying in ${delay}ms...`);
        await sleep(delay);
        return load(attempt + 1);
      }
      toast.error("Erro ao carregar vídeos. Tente recarregar a página.");
    } finally {
      if (isMounted.current) setLocalLoading(false);
    }
  }, [supabase, cache]);

  useEffect(() => {
    isMounted.current = true;
    load();
    return () => { isMounted.current = false; };
  }, [load]);

  return { videos, isLoading, refetch: load };
}
