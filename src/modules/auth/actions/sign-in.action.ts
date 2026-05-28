"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/core/lib/supabase/server";
import { loginSchema } from "@/modules/auth/schemas/login.schema";
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

  const supabase = await createSupabaseServerClient();
  const { error, data } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return { success: false, error: `AUTH_ERROR: ${error.message} (status: ${error.status})` };
  }

  if (!data.session) {
    return { success: false, error: "No session returned from Supabase" };
  }

  redirect("/dashboard");
}
