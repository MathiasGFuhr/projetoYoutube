"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/core/lib/supabase/server";
import { signupSchema } from "@/modules/auth/schemas/signup.schema";
import { resolveAuthErrorMessage } from "@/core/errors/error-handler";
import type { ActionState } from "@/types/api";
import type { SignupFormValues } from "@/modules/auth/schemas/signup.schema";

export async function signUpAction(
  data: SignupFormValues
): Promise<ActionState> {
  const parsed = signupSchema.safeParse(data);

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Dados inválidos.",
      fieldErrors: parsed.error.issues.reduce((acc, issue) => {
        const path = issue.path[0];
        if (typeof path === "string") {
          acc[path] = [issue.message];
        }
        return acc;
      }, {} as Record<string, string[]>),
    };
  }

  let hasError = false;
  let errorMessage = "";

  try {
    console.log("[signUpAction] Attempting signup for:", parsed.data.email);
    const supabase = await createSupabaseServerClient();

    // Sign up — when email confirmation is disabled, Supabase returns a session immediately
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        data: { full_name: parsed.data.fullName },
      },
    });

    console.log("[signUpAction] signUp result:", { error: signUpError?.message, hasSession: !!signUpData.session, userId: signUpData.user?.id });

    if (signUpError) {
      hasError = true;
      errorMessage = resolveAuthErrorMessage(signUpError.message);
      console.error("[signUpAction] Signup error:", signUpError.message, signUpError.status);
    } else if (!signUpData.session) {
      console.log("[signUpAction] No session, trying manual signin...");
      // If no session returned, try manual sign in
      const { error: signInError, data: signInData } = await supabase.auth.signInWithPassword({
        email: parsed.data.email,
        password: parsed.data.password,
      });

      console.log("[signUpAction] Manual signin result:", { error: signInError?.message, hasSession: !!signInData.session });

      if (signInError) {
        hasError = true;
        errorMessage = resolveAuthErrorMessage(signInError.message);
        console.error("[signUpAction] Manual signin error:", signInError.message);
      }
    } else {
      console.log("[signUpAction] Signup success with session");
    }
    // When signUpData.session exists, cookies are already set by Supabase SSR
  } catch (err: any) {
    console.error("[signUpAction] Exception:", err.message);
    hasError = true;
    errorMessage = "Erro ao criar conta. Tente novamente.";
  }

  if (hasError) {
    return { success: false, error: errorMessage };
  }

  redirect("/dashboard");
}
