"use client";

import { useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { useAuth } from "@/shared/hooks/use-auth";
import type { TablesInsert, TablesUpdate } from "@/lib/supabase/database.types";

export function useChannelMutations() {
  const { user } = useAuth();
  const supabase = getSupabaseBrowserClient();
  const [isPending, setIsPending] = useState(false);

  const createChannel = async (data: Omit<TablesInsert<"channels">, "user_id">) => {
    if (!user) throw new Error("Usuário não autenticado");
    setIsPending(true);
    try {
      const { data: result, error } = await supabase
        .from("channels")
        .insert({ ...data, user_id: user.id })
        .select()
        .single();
      if (error) throw error;
      return result;
    } finally {
      setIsPending(false);
    }
  };

  const updateChannel = async (id: string, data: Partial<TablesUpdate<"channels">>) => {
    setIsPending(true);
    try {
      const { data: result, error } = await supabase
        .from("channels")
        .update(data)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return result;
    } finally {
      setIsPending(false);
    }
  };

  const deleteChannel = async (id: string) => {
    setIsPending(true);
    try {
      const { error } = await supabase.from("channels").delete().eq("id", id);
      if (error) throw error;
    } finally {
      setIsPending(false);
    }
  };

  return { createChannel, updateChannel, deleteChannel, isPending };
}
