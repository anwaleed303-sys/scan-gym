// @ts-nocheck
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface CheckoutRequest {
  amount: number; // Amount in PKR (will be converted to paisa)
  payment_type: "subscription" | "trainer_booking" | "shop";
  reference_id?: string;
  metadata?: Record<string, unknown>;
  success_url: string;
  cancel_url: string;
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SAFEPAY_API_KEY = Deno.env.get("SAFEPAY_API_KEY");
    const SAFEPAY_SECRET_KEY = Deno.env.get("SAFEPAY_SECRET_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!SAFEPAY_API_KEY || !SAFEPAY_SECRET_KEY) {
      console.error("Missing Safepay credentials");
      return new Response(
        JSON.stringify({ error: "Payment service not configured" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Get user from auth header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    // Verify user token
    const token = authHeader.replace("Bearer ", "");
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(token);

    if (userError || !user) {
      console.error("User verification failed:", userError);
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const {
      amount,
      payment_type,
      reference_id,
      metadata,
      success_url,
      cancel_url,
    }: CheckoutRequest = await req.json();

    if (!amount || amount < 1) {
      return new Response(JSON.stringify({ error: "Invalid amount" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Generate unique order ID
    const orderId = `order_${Date.now()}_${Math.random()
      .toString(36)
      .substring(2, 9)}`;

    // Convert amount to paisa (smallest unit)
    const amountInPaisa = amount * 100;

    console.log("Creating Safepay checkout session:", {
      orderId,
      amount,
      amountInPaisa,
      payment_type,
    });

    // Use Safepay production
    const safepayHost = "https://api.getsafepay.com";

    // Create Safepay checkout session
    const sessionResponse = await fetch(`${safepayHost}/order/v1/init`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client: SAFEPAY_API_KEY,
        amount: amountInPaisa,
        currency: "PKR",
        environment: "production",
        order_id: orderId,
      }),
    });

    const sessionData = await sessionResponse.json();
    console.log("Safepay init response:", sessionData);

    if (!sessionResponse.ok || !sessionData.data?.token) {
      console.error("Safepay session creation failed:", sessionData);
      return new Response(
        JSON.stringify({
          error: "Failed to create payment session",
          details: sessionData,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const tracker = sessionData.data.token;

    // Create checkout URL
    const checkoutUrl = `https://api.getsafepay.com/checkout/pay?tracker=${tracker}&source=custom&redirect_url=${encodeURIComponent(
      success_url
    )}&cancel_url=${encodeURIComponent(cancel_url)}`;

    // Store payment record in database
    const { error: insertError } = await supabase.from("payments").insert({
      user_id: user.id,
      order_id: orderId,
      tracker: tracker,
      payment_type,
      reference_id,
      amount: amountInPaisa,
      currency: "PKR",
      status: "pending",
      payment_method: "safepay",
      metadata: metadata || {},
    });

    if (insertError) {
      console.error("Failed to store payment record:", insertError);
      // Continue anyway - payment can still proceed
    }

    console.log("Checkout session created successfully:", {
      orderId,
      tracker,
      checkoutUrl,
    });

    return new Response(
      JSON.stringify({
        success: true,
        order_id: orderId,
        tracker,
        checkout_url: checkoutUrl,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Checkout error:", error);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        details: String(error),
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
