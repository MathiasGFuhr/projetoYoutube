"use client";

import { useState } from "react";
import { useAuth } from "@/shared/hooks/use-auth";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

export function useUpdateProfile() {
  const { user } = useAuth();
  const [isPending, setIsPending] = useState(false);

  const updateProfile = async ({
    fullName,
    avatarUrl,
  }: {
    fullName: string;
    avatarUrl?: string | null;
  }) => {
    if (!user) throw new Error("Usuário não autenticado");

    setIsPending(true);
    try {
      const supabase = getSupabaseBrowserClient();

      // Update auth user metadata
      const { error: authError } = await supabase.auth.updateUser({
        data: { full_name: fullName, avatar_url: avatarUrl },
      });
      if (authError) {
        console.error("[updateProfile] Auth update error:", authError);
        throw new Error(`Auth update failed: ${authError.message}`);
      }

      // Upsert into profiles table
      const { error: profileError } = await supabase
        .from("profiles")
        .upsert({
          id: user.id,
          full_name: fullName,
          avatar_url: avatarUrl ?? null,
          email: user.email,
        }, { onConflict: "id" });
      if (profileError) {
        console.error("[updateProfile] Profiles upsert error:", profileError);
        throw new Error(`Profiles upsert failed: ${profileError.message}`);
      }

      return { success: true };
    } finally {
      setIsPending(false);
    }
  };

  return { updateProfile, isPending };
}
