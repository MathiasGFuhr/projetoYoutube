/**
 * Script to test Stripe Webhook locally without Stripe CLI.
 * Run: node scripts/test-stripe-webhook.js
 */

const WEBHOOK_URL = "https://cvxbqoyqybdvkcjqjrau.supabase.co/functions/v1/stripe-webhook";

// Simulate a checkout.session.completed event
const testEvent = {
  id: "evt_test_" + Date.now(),
  type: "checkout.session.completed",
  data: {
    object: {
      id: "cs_test_" + Date.now(),
      client_reference_id: "YOUR_USER_ID_HERE", // Replace with a real user UUID from your database
      customer: "cus_test_123456",
      subscription: "sub_test_123456",
      metadata: {
        user_id: "YOUR_USER_ID_HERE",
        plan_id: "pro-yearly",
      },
    },
  },
};

async function sendTestWebhook() {
  console.log("Sending test webhook to:", WEBHOOK_URL);
  console.log("Event type:", testEvent.type);
  console.log("---");

  try {
    const response = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "stripe-signature": "test-signature-bypass", // The webhook function will reject this
      },
      body: JSON.stringify(testEvent),
    });

    const result = await response.text();
    console.log("Status:", response.status);
    console.log("Response:", result);
  } catch (err) {
    console.error("Error:", err.message);
  }
}

sendTestWebhook();
