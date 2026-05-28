import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const STRIPE_SECRET = Deno.env.get("STRIPE_SECRET_KEY")!;
const WEBHOOK_SECRET = Deno.env.get("STRIPE_WEBHOOK_SECRET")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE);

async function verifyStripeSignature(payload: string, sig: string) {
  const encoder = new TextEncoder();
  const secret = encoder.encode(WEBHOOK_SECRET);
  const cryptoKey = await crypto.subtle.importKey(
    "raw", secret, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
  );
  const signed = await crypto.subtle.sign("HMAC", cryptoKey, encoder.encode(payload));
  const expectedSig = btoa(String.fromCharCode(...new Uint8Array(signed)));
  return expectedSig === sig;
}

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const payload = await req.text();
  const sig = req.headers.get("stripe-signature") || "";

  if (!WEBHOOK_SECRET) {
    return new Response("Webhook secret not configured", { status: 500 });
  }

  if (!(await verifyStripeSignature(payload, sig))) {
    return new Response("Invalid signature", { status: 400 });
  }

  let event: any;
  try {
    event = JSON.parse(payload);
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  const { type, data } = event;
  const obj = data.object;

  if (type === "checkout.session.completed") {
    const customerId = obj.customer as string;
    const subscriptionId = obj.subscription as string;
    const metadata = obj.metadata || {};
    const userId = metadata.user_id;
    const planId = metadata.plan_id;

    if (!userId || !planId) {
      return new Response("Missing metadata", { status: 400 });
    }

    // Update or insert subscription
    const { error: upsertErr } = await supabase
      .from("subscriptions")
      .upsert({
        user_id: userId,
        plan_id: planId,
        stripe_customer_id: customerId,
        stripe_subscription_id: subscriptionId,
        status: "active",
        current_period_start: new Date().toISOString(),
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        cancel_at_period_end: false,
      }, { onConflict: "user_id" });

    if (upsertErr) {
      console.error("[webhook] upsert subscription failed:", upsertErr);
      return new Response("Database error", { status: 500 });
    }

    // Update profile with stripe_customer_id
    await supabase
      .from("profiles")
      .update({ stripe_customer_id: customerId })
      .eq("id", userId);
  }

  if (type === "customer.subscription.updated") {
    const subscriptionId = obj.id as string;
    const status = obj.status as string;
    const currentPeriodStart = new Date(obj.current_period_start * 1000).toISOString();
    const currentPeriodEnd = new Date(obj.current_period_end * 1000).toISOString();
    const cancelAtPeriodEnd = obj.cancel_at_period_end as boolean;

    const { error } = await supabase
      .from("subscriptions")
      .update({
        status: status === "active" ? "active" : status,
        current_period_start: currentPeriodStart,
        current_period_end: currentPeriodEnd,
        cancel_at_period_end: cancelAtPeriodEnd,
      })
      .eq("stripe_subscription_id", subscriptionId);

    if (error) {
      console.error("[webhook] update subscription failed:", error);
    }
  }

  if (type === "customer.subscription.deleted") {
    const subscriptionId = obj.id as string;

    const { error } = await supabase
      .from("subscriptions")
      .update({
        status: "canceled",
        cancel_at_period_end: true,
      })
      .eq("stripe_subscription_id", subscriptionId);

    if (error) {
      console.error("[webhook] cancel subscription failed:", error);
    }
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { "Content-Type": "application/json" },
  });
});
