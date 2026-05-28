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
    console.log("[signInAction] Attempting login for:", parsed.data.email);
    const supabase = await createSupabaseServerClient();
    const { error, data } = await supabase.auth.signInWithPassword(parsed.data);

    console.log("[signInAction] Supabase response:", { error: error?.message, hasSession: !!data.session });

    if (error) {
      hasError = true;
      errorMessage = resolveAuthErrorMessage(error.message);
      console.error("[signInAction] Login error:", error.message, error.status);
    } else {
      console.log("[signInAction] Login success, session:", !!data.session);
    }
  } catch (err: any) {
    console.error("[signInAction] Exception:", err.message, err.stack);
    hasError = true;
    errorMessage = `Erro: ${err.message}`;
  }

  if (hasError) {
    return { success: false, error: errorMessage };
  }

  redirect("/dashboard");
}
