import { NextRequest, NextResponse } from "next/server";

const STRIPE_SECRET = process.env.STRIPE_SECRET_KEY!;
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { priceId, userId, email, planId } = body;

    if (!priceId || !userId || !email || !planId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
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
        client_reference_id: userId,
        customer_email: email,
        "metadata[user_id]": userId,
        "metadata[plan_id]": planId,
      }).toString(),
    });

    const session = await sessionRes.json();

    if (!sessionRes.ok) {
      console.error("[checkout] Stripe error:", session);
      return NextResponse.json({ error: session.error?.message || "Stripe error" }, { status: 500 });
    }

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error("[checkout] error:", err);
    return NextResponse.json({ error: err.message || "Internal error" }, { status: 500 });
  }
}
