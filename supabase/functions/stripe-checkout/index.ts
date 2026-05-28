import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const STRIPE_SECRET = Deno.env.get("STRIPE_SECRET_KEY")!;

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  const { priceId, userId, email, planId, successUrl, cancelUrl } = body;

  if (!priceId || !userId || !email || !planId) {
    return new Response("Missing required fields", { status: 400 });
  }

  const sessionRes = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${STRIPE_SECRET}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      "mode": "subscription",
      "payment_method_types[]": "card",
      "line_items[0][price]": priceId,
      "line_items[0][quantity]": "1",
      "success_url": successUrl || `${Deno.env.get("NEXT_PUBLIC_SITE_URL")}/dashboard/settings?success=1`,
      "cancel_url": cancelUrl || `${Deno.env.get("NEXT_PUBLIC_SITE_URL")}/dashboard/settings?canceled=1`,
      "client_reference_id": userId,
      "customer_email": email,
      "metadata[user_id]": userId,
      "metadata[plan_id]": planId,
    }).toString(),
  });

  const session = await sessionRes.json();

  if (!sessionRes.ok) {
    console.error("[checkout] Stripe error:", session);
    return new Response(JSON.stringify({ error: session.error?.message || "Stripe error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ url: session.url }), {
    headers: { "Content-Type": "application/json" },
  });
});
