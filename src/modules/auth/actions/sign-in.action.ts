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

  try {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.signInWithPassword(parsed.data);

    if (error) {
      return { success: false, error: resolveAuthErrorMessage(error.message) };
    }
  } catch {
    return { success: false, error: "Erro ao conectar com o servidor. Tente novamente." };
  }

  redirect("/dashboard");
}
