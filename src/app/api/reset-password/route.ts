import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/core/lib/supabase/server";
import { rateLimit, getRateLimitIdentifier } from "@/lib/rate-limit";

/**
 * Secure password reset using Supabase Auth magic link flow.
 * Sends a password reset email with a secure token link.
 * NEVER allows direct password reset without email verification.
 */
export async function POST(req: NextRequest) {
  try {
    // Rate limit: 3 requests per 15 minutes per IP
    const limit = rateLimit(getRateLimitIdentifier(req) + ":reset-password", 3, 15 * 60 * 1000);
    if (!limit.success) {
      return NextResponse.json(
        { error: "Muitas tentativas. Aguarde 15 minutos." },
        { status: 429 }
      );
    }

    const { email } = await req.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "E-mail é obrigatório" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "E-mail inválido" },
        { status: 400 }
      );
    }

    const supabase = await createSupabaseServerClient();

    // Supabase resetPasswordForEmail sends a secure magic link
    // The link contains a one-time token that expires
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/atualizar-senha`,
    });

    if (error) {
      // Return generic message to prevent user enumeration
      console.error("[reset-password] Supabase error:", error);
    }

    // Always return success to prevent user enumeration attacks
    // Even if email doesn't exist, attacker shouldn't know
    return NextResponse.json({
      success: true,
      message: "Se o e-mail estiver cadastrado, você receberá instruções para redefinir sua senha.",
    });
  } catch (err: any) {
    console.error("[reset-password] unexpected error:", err);
    return NextResponse.json(
      { error: "Erro interno. Tente novamente." },
      { status: 500 }
    );
  }
}
