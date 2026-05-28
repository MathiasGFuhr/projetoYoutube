"use client";

import { useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

export function useUploadImage() {
  const [isPending, setIsPending] = useState(false);

  const uploadImage = async (file: File, bucket: string, path: string): Promise<string> => {
    setIsPending(true);
    try {
      const supabase = getSupabaseBrowserClient();

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(path, file, { upsert: true, contentType: file.type });

      if (uploadError) {
        console.error("[uploadImage] Storage upload error:", uploadError);
        throw new Error(`Storage upload failed: ${uploadError.message}`);
      }

      const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(path);
      return publicUrlData.publicUrl;
    } finally {
      setIsPending(false);
    }
  };

  return { uploadImage, isPending };
}
