// @ts-nocheck
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SAFEPAY_SECRET_KEY = Deno.env.get("SAFEPAY_SECRET_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!SAFEPAY_SECRET_KEY) {
      console.error("Missing Safepay secret key");
      return new Response(
        JSON.stringify({ error: "Payment service not configured" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { tracker, order_id } = await req.json();

    if (!tracker && !order_id) {
      return new Response(
        JSON.stringify({ error: "Missing tracker or order_id" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log("Verifying payment:", { tracker, order_id });

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    // First check our database
    let query = supabase.from("payments").select("*");
    if (tracker) {
      query = query.eq("tracker", tracker);
    } else if (order_id) {
      query = query.eq("order_id", order_id);
    }

    const { data: payment, error: dbError } = await query.maybeSingle();

    if (dbError) {
      console.error("Database error:", dbError);
    }

    // If payment is already marked complete, return success
    if (payment?.status === "completed") {
      console.log("Payment already verified as completed");
      return new Response(
        JSON.stringify({
          success: true,
          status: "completed",
          payment,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Verify with Safepay API
    if (tracker) {
      const safepayHost = "https://api.getsafepay.com";

      // Create auth header using secret key
      const authHeader = `Basic ${btoa(`:${SAFEPAY_SECRET_KEY}`)}`;

      const verifyResponse = await fetch(
        `${safepayHost}/order/v1/tracker/${tracker}`,
        {
          method: "GET",
          headers: {
            Authorization: authHeader,
            "Content-Type": "application/json",
          },
        }
      );

      const verifyData = await verifyResponse.json();
      console.log("Safepay verification response:", verifyData);

      if (verifyResponse.ok && verifyData.data) {
        const safepayStatus = verifyData.data.state;
        let dbStatus = "pending";

        if (safepayStatus === "PAID") {
          dbStatus = "completed";
        } else if (
          safepayStatus === "FAILED" ||
          safepayStatus === "CANCELLED"
        ) {
          dbStatus = "failed";
        }

        // Update payment status if changed
        if (payment && payment.status !== dbStatus) {
          await supabase
            .from("payments")
            .update({ status: dbStatus, updated_at: new Date().toISOString() })
            .eq("id", payment.id);

          // If payment just completed, handle post-payment logic
          if (
            dbStatus === "completed" &&
            payment.payment_type === "subscription" &&
            payment.metadata
          ) {
            const meta = payment.metadata as Record<string, unknown>;
            const expiresAt = new Date();
            expiresAt.setMonth(expiresAt.getMonth() + 1);

            await supabase.from("subscriptions").insert({
              user_id: payment.user_id,
              plan_id: meta.plan_id as string,
              plan_name: meta.plan_name as string,
              price: payment.amount / 100,
              payment_method: "safepay",
              expires_at: expiresAt.toISOString(),
            });
            console.log("Subscription created after verification");
          } else if (
            dbStatus === "completed" &&
            payment.payment_type === "trainer_booking" &&
            payment.metadata
          ) {
            const meta = payment.metadata as Record<string, unknown>;
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
            console.log("Booking created after verification");
          } else if (
            dbStatus === "completed" &&
            payment.payment_type === "shop" &&
            payment.metadata
          ) {
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
            console.log("Shop order created after verification");
          }
        }

        return new Response(
          JSON.stringify({
            success: dbStatus === "completed",
            status: dbStatus,
            safepay_status: safepayStatus,
            payment: { ...payment, status: dbStatus },
          }),
          {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
    }

    // Return current status from database
    return new Response(
      JSON.stringify({
        success: payment?.status === "completed",
        status: payment?.status || "unknown",
        payment,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Verification error:", error);
    return new Response(
      JSON.stringify({ error: "Verification failed", details: String(error) }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
