"use client";

import { useState } from "react";
import { useAuth } from "@/shared/hooks/use-auth";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".gif"];
const MAX_SIZE_MB = 5;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

export function useUploadAvatar() {
  const { user } = useAuth();
  const [isPending, setIsPending] = useState(false);

  const uploadAvatar = async (file: File): Promise<string> => {
    if (!user) throw new Error("Usuário não autenticado");

    // Validate file size
    if (file.size > MAX_SIZE_BYTES) {
      throw new Error(`Imagem muito grande. Máximo: ${MAX_SIZE_MB}MB`);
    }

    // Validate MIME type
    if (!ALLOWED_TYPES.includes(file.type)) {
      throw new Error("Tipo de arquivo não permitido. Use: JPG, PNG, WebP ou GIF");
    }

    // Validate extension
    const ext = file.name.toLowerCase().slice(file.name.lastIndexOf("."));
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      throw new Error("Extensão de arquivo inválida");
    }

    // Sanitize filename - use only safe characters
    const safeExt = ext.replace(/[^a-z0-9.]/g, "");
    const filePath = `${user.id}/avatar${safeExt}`;

    setIsPending(true);
    try {
      const supabase = getSupabaseBrowserClient();

      // Upload to storage with correct content type
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, {
          upsert: true,
          contentType: file.type,
          cacheControl: "3600",
        });

      if (uploadError) {
        console.error("[uploadAvatar] Storage upload error:", uploadError);
        throw new Error("Erro ao enviar imagem. Tente novamente.");
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
