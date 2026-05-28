"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/core/lib/supabase/server";
import { resolveAuthErrorMessage } from "@/core/errors/error-handler";
import type { ActionState } from "@/types/api";

export async function signOutAction(): Promise<ActionState> {
  let hasError = false;
  let errorMessage = "";

  try {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.signOut();

    if (error) {
      hasError = true;
      errorMessage = resolveAuthErrorMessage(error.message);
    }
  } catch {
    hasError = true;
    errorMessage = "Erro ao encerrar sessão. Tente novamente.";
  }

  if (hasError) {
    return { success: false, error: errorMessage };
  }

  redirect("/login");
}
