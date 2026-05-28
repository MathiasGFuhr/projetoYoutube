import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/core/lib/supabase/server";

const STRIPE_SECRET = process.env.STRIPE_SECRET_KEY!;

export async function POST(req: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    // Buscar subscription do usuário
    const { data: sub, error: subError } = await supabase
      .from("subscriptions")
      .select("stripe_subscription_id")
      .eq("user_id", user.id)
      .eq("status", "active")
      .single();

    if (subError || !sub?.stripe_subscription_id) {
      return NextResponse.json({ error: "Nenhuma assinatura ativa encontrada" }, { status: 404 });
    }

    // Cancelar no Stripe (no fim do período)
    const res = await fetch(`https://api.stripe.com/v1/subscriptions/${sub.stripe_subscription_id}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${STRIPE_SECRET}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        cancel_at_period_end: "true",
      }).toString(),
    });

    const result = await res.json();

    if (!res.ok) {
      console.error("[cancel] Stripe error:", result);
      return NextResponse.json({ error: result.error?.message || "Erro ao cancelar no Stripe" }, { status: 500 });
    }

    // Atualizar no Supabase
    const { error: updateError } = await supabase
      .from("subscriptions")
      .update({ cancel_at_period_end: true })
      .eq("user_id", user.id)
      .eq("stripe_subscription_id", sub.stripe_subscription_id);

    if (updateError) {
      console.error("[cancel] Supabase update error:", updateError);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("[cancel] unexpected error:", err);
    return NextResponse.json({ error: err.message || "Erro interno" }, { status: 500 });
  }
}
