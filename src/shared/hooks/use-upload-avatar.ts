"use client";

import { useState } from "react";
import { useAuth } from "@/shared/hooks/use-auth";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

export function useUploadAvatar() {
  const { user } = useAuth();
  const [isPending, setIsPending] = useState(false);

  const uploadAvatar = async (file: File): Promise<string> => {
    if (!user) throw new Error("Usuário não autenticado");

    setIsPending(true);
    try {
      const supabase = getSupabaseBrowserClient();
      const fileExt = file.name.split(".").pop() ?? "png";
      const filePath = `${user.id}/avatar.${fileExt}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true, contentType: file.type });

      if (uploadError) {
        console.error("[uploadAvatar] Storage upload error:", uploadError);
        throw new Error(`Storage upload failed: ${uploadError.message}`);
      }

      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      return publicUrlData.publicUrl;
    } finally {
      setIsPending(false);
    }
  };

  return { uploadAvatar, isPending };
}
