import { NextRequest, NextResponse } from "next/server";

/**
 * Test endpoint to simulate Stripe webhook events.
 * ONLY available in development mode.
 * This bypasses signature verification for testing purposes.
 */
export async function POST(req: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not available in production" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { eventType, data } = body;

    if (!eventType || !data) {
      return NextResponse.json({ error: "eventType and data required" }, { status: 400 });
    }

    // Forward to the actual webhook endpoint
    const webhookUrl = `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/stripe/webhook`;

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: eventType,
        data: { object: data },
        id: `evt_test_${Date.now()}`,
      }),
    });

    const result = await response.text();

    return NextResponse.json({
      success: true,
      forwarded: true,
      webhookResponse: result,
    });
  } catch (err: any) {
    console.error("[webhook-test] error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
