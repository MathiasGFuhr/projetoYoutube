"use client";

import { useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { useAuth } from "@/shared/hooks/use-auth";
import type { TablesInsert, TablesUpdate } from "@/lib/supabase/database.types";
import { useDataCache } from "@/shared/providers/data-cache-provider";

export function useVideoMutations() {
  const { user } = useAuth();
  const supabase = getSupabaseBrowserClient();
  const cache = useDataCache();
  const [isPending, setIsPending] = useState(false);

  const createVideo = async (data: Omit<TablesInsert<"videos">, "user_id">) => {
    if (!user) throw new Error("Usuário não autenticado");
    setIsPending(true);
    try {
      const { data: result, error } = await supabase
        .from("videos")
        .insert({ ...data, user_id: user.id })
        .select()
        .single();
      if (error) throw error;
      cache.setVideos([result, ...cache.videos.filter((video) => video.id !== result.id)]);
      return result;
    } finally {
      setIsPending(false);
    }
  };

  const updateVideo = async (id: string, data: Partial<TablesUpdate<"videos">>) => {
    setIsPending(true);
    try {
      const { data: result, error } = await supabase
        .from("videos")
        .update(data)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      cache.setVideos(cache.videos.map((video) => video.id === id ? result : video));
      return result;
    } finally {
      setIsPending(false);
    }
  };

  const deleteVideo = async (id: string) => {
    setIsPending(true);
    try {
      const { error } = await supabase.from("videos").delete().eq("id", id);
      if (error) throw error;
      cache.setVideos(cache.videos.filter((video) => video.id !== id));
    } finally {
      setIsPending(false);
    }
  };

  return { createVideo, updateVideo, deleteVideo, isPending };
}
