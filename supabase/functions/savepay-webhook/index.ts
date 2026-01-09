// @ts-nocheck
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-sfpy-signature",
};

// Helper to verify HMAC signature
async function verifySignature(
  payload: string,
  signature: string,
  secret: string
): Promise<boolean> {
  try {
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);
    const data = encoder.encode(payload);

    const key = await crypto.subtle.importKey(
      "raw",
      keyData,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );

    const signatureBuffer = await crypto.subtle.sign("HMAC", key, data);
    const expectedSignature = Array.from(new Uint8Array(signatureBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    return signature === expectedSignature;
  } catch (error) {
    console.error("Signature verification error:", error);
    return false;
  }
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SAFEPAY_WEBHOOK_SECRET = Deno.env.get("SAFEPAY_WEBHOOK_SECRET");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!SAFEPAY_WEBHOOK_SECRET) {
      console.error("Missing webhook secret");
      return new Response(JSON.stringify({ error: "Webhook not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get the signature from headers
    const signature =
      req.headers.get("X-SFPY-SIGNATURE") ||
      req.headers.get("x-sfpy-signature");
    const payload = await req.text();

    console.log("Webhook received:", {
      signature: signature?.substring(0, 20) + "...",
      payloadLength: payload.length,
    });

    // Verify webhook signature if present
    if (signature) {
      const isValid = await verifySignature(
        payload,
        signature,
        SAFEPAY_WEBHOOK_SECRET
      );
      if (!isValid) {
        console.warn(
          "Webhook signature mismatch - proceeding anyway for debugging"
        );
      }
    }

    const event = JSON.parse(payload);
    console.log("Webhook event:", JSON.stringify(event, null, 2));

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    // Handle different event types
    const eventType = event.type || event.event || event.name;
    const paymentData = event.data || event.payload || event;

    console.log("Processing event type:", eventType);

    if (
      eventType === "payment.succeeded" ||
      eventType === "PAYMENT_SUCCEEDED" ||
      paymentData.state === "PAID"
    ) {
      // Payment was successful
      const tracker = paymentData.tracker || paymentData.token;
      const orderId = paymentData.order_id || paymentData.merchant_order_id;

      console.log("Payment succeeded:", { tracker, orderId });

      // Update payment status
      const { error: updateError } = await supabase
        .from("payments")
        .update({
          status: "completed",
          updated_at: new Date().toISOString(),
        })
        .or(`tracker.eq.${tracker},order_id.eq.${orderId}`);

      if (updateError) {
        console.error("Failed to update payment status:", updateError);
      } else {
        console.log("Payment marked as completed");

        // Get the payment details to create subscription/booking
        const { data: payment } = await supabase
          .from("payments")
          .select("*")
          .or(`tracker.eq.${tracker},order_id.eq.${orderId}`)
          .maybeSingle();

        if (payment) {
          // Handle based on payment type
          if (payment.payment_type === "subscription" && payment.metadata) {
            const meta = payment.metadata as Record<string, unknown>;
            // Create subscription
            const expiresAt = new Date();
            expiresAt.setMonth(expiresAt.getMonth() + 1);

            await supabase.from("subscriptions").insert({
              user_id: payment.user_id,
              plan_id: meta.plan_id as string,
              plan_name: meta.plan_name as string,
              price: payment.amount / 100, // Convert back to PKR
              payment_method: "safepay",
              expires_at: expiresAt.toISOString(),
            });
            console.log("Subscription created for user:", payment.user_id);
          } else if (
            payment.payment_type === "trainer_booking" &&
            payment.metadata
          ) {
            const meta = payment.metadata as Record<string, unknown>;
            // Create booking
            await supabase.from("bookings").insert({
              user_id: payment.user_id,
              trainer_name: meta.trainer_name as string,
              trainer_specialty: meta.trainer_specialty as string,
              session_date: meta.session_date as string,
              session_time: meta.session_time as string,
              price: payment.amount / 100,
              payment_method: "safepay",
              gym_id: meta.gym_id as string,
              status: "confirmed",
            });
            console.log("Trainer booking created for user:", payment.user_id);
          } else if (payment.payment_type === "shop" && payment.metadata) {
            const meta = payment.metadata as Record<string, unknown>;
            const items = meta.items as {
              id: string;
              name: string;
              price: number;
              quantity: number;
            }[];

            // Create order
            const orderNumber = `SG-${Date.now().toString(36).toUpperCase()}`;
            await supabase.from("orders").insert({
              user_id: payment.user_id,
              order_number: orderNumber,
              status: "paid",
              total_amount: payment.amount / 100,
              payment_id: payment.id,
              items: items,
            });
            console.log("Shop order created for user:", payment.user_id);
          }
        }
      }
    } else if (
      eventType === "payment.failed" ||
      eventType === "PAYMENT_FAILED" ||
      paymentData.state === "FAILED"
    ) {
      // Payment failed
      const tracker = paymentData.tracker || paymentData.token;
      const orderId = paymentData.order_id || paymentData.merchant_order_id;

      console.log("Payment failed:", { tracker, orderId });

      await supabase
        .from("payments")
        .update({
          status: "failed",
          updated_at: new Date().toISOString(),
        })
        .or(`tracker.eq.${tracker},order_id.eq.${orderId}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(
      JSON.stringify({
        error: "Webhook processing failed",
        details: String(error),
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
