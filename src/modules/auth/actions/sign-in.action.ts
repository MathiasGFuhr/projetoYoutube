"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/core/lib/supabase/server";
import { loginSchema } from "@/modules/auth/schemas/login.schema";
import { resolveAuthErrorMessage } from "@/core/errors/error-handler";
import type { ActionState } from "@/types/api";
import type { LoginFormValues } from "@/modules/auth/schemas/login.schema";

export async function signInAction(
  credentials: LoginFormValues
): Promise<ActionState> {
  const parsed = loginSchema.safeParse(credentials);

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Dados inválidos.",
    };
  }

  let hasError = false;
  let errorMessage = "";

  try {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.signInWithPassword(parsed.data);

    if (error) {
      hasError = true;
      errorMessage = resolveAuthErrorMessage(error.message);
    }
  } catch {
    hasError = true;
    errorMessage = "Erro ao conectar com o servidor. Tente novamente.";
  }

  if (hasError) {
    return { success: false, error: errorMessage };
  }

  redirect("/dashboard");
}
