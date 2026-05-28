import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/core/lib/supabase/server";
import { rateLimit, getRateLimitIdentifier } from "@/lib/rate-limit";

const STRIPE_SECRET = process.env.STRIPE_SECRET_KEY!;
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

/**
 * Creates a Stripe checkout session for authenticated users only.
 * Validates the user is logged in and owns the session.
 */
export async function POST(req: NextRequest) {
  try {
    // Rate limit: 5 requests per minute per IP
    const limit = rateLimit(getRateLimitIdentifier(req) + ":stripe-checkout", 5, 60 * 1000);
    if (!limit.success) {
      return NextResponse.json(
        { error: "Muitas tentativas. Aguarde um momento." },
        { status: 429 }
      );
    }

    // Authenticate user
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const body = await req.json();
    const { priceId, planId } = body;

    if (!priceId || !planId) {
      return NextResponse.json({ error: "Dados incompletos" }, { status: 400 });
    }

    // Validate priceId format (Stripe price IDs start with 'price_')
    if (!/^price_[a-zA-Z0-9]+$/.test(priceId)) {
      return NextResponse.json({ error: "ID de preço inválido" }, { status: 400 });
    }

    // Validate planId format
    if (!/^[a-zA-Z0-9-_]+$/.test(planId)) {
      return NextResponse.json({ error: "ID de plano inválido" }, { status: 400 });
    }

    const sessionRes = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${STRIPE_SECRET}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        mode: "subscription",
        "payment_method_types[]": "card",
        "line_items[0][price]": priceId,
        "line_items[0][quantity]": "1",
        success_url: `${SITE_URL}/dashboard/billing?success=1`,
        cancel_url: `${SITE_URL}/dashboard/billing?canceled=1`,
        client_reference_id: user.id,
        customer_email: user.email!,
        "metadata[user_id]": user.id,
        "metadata[plan_id]": planId,
      }).toString(),
    });

    const session = await sessionRes.json();

    if (!sessionRes.ok) {
      console.error("[checkout] Stripe error:", session);
      return NextResponse.json({ error: "Erro ao criar sessão de pagamento" }, { status: 500 });
    }

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error("[checkout] error:", err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
