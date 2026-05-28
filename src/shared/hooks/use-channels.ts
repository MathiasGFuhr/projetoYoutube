"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import type { Tables } from "@/lib/supabase/database.types";
import { toast } from "sonner";
import { useDataCache, isCacheStale } from "@/shared/providers/data-cache-provider";

export type Channel = Tables<"channels">;

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const COLUMNS = "id,name,handle,link,color,photo_url,niche,videos,published,active,created_at,updated_at,user_id" as const;

export function useChannels() {
  const [localLoading, setLocalLoading] = useState(false);
  const cache = useDataCache();
  const supabase = getSupabaseBrowserClient();
  const isMounted = useRef(true);

  const channels = cache.channels;
  const isLoading = localLoading || (channels.length === 0 && isCacheStale(cache.lastFetch.channels));

  const load = useCallback(async (attempt = 1) => {
    if (!isCacheStale(cache.lastFetch.channels)) {
      setLocalLoading(false);
      return;
    }

    setLocalLoading(true);
    try {
      const { data, error } = await supabase
        .from("channels")
        .select(COLUMNS)
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw error;
      if (isMounted.current) {
        cache.setChannels(data ?? []);
        cache.markFetched("channels");
      }
    } catch (err: any) {
      console.error(`[useChannels] load error (attempt ${attempt}):`, err);
      if (attempt < 3) {
        const delay = attempt * 1500;
        console.log(`[useChannels] retrying in ${delay}ms...`);
        await sleep(delay);
        return load(attempt + 1);
      }
      toast.error("Erro ao carregar canais. Tente recarregar a página.");
    } finally {
      if (isMounted.current) setLocalLoading(false);
    }
  }, [supabase, cache]);

  useEffect(() => {
    isMounted.current = true;
    load();
    return () => { isMounted.current = false; };
  }, [load]);

  return { channels, isLoading, refetch: load };
}
