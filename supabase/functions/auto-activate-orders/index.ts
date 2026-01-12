import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Calculate 24 hours ago
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const adminMessage = `Your order has been automatically approved after 24 hours.

PAYMENT DETAILS:
━━━━━━━━━━━━━━━━━━
📱 JazzCash: 0305-6248720
👤 Account Holder: Waleed Ali Nawazish
💬 WhatsApp: 03407615594

ORDER INSTRUCTIONS:
━━━━━━━━━━━━━━━━━━
1. Send payment to the JazzCash number above
2. Take a screenshot of the payment
3. Share the screenshot on WhatsApp
4. Your order will be processed once payment is confirmed

Thank you for your patience!`;

    // Find and update orders that are pending for more than 24 hours
    const { data: orders, error: updateError } = await supabase
      .from("orders")
      .update({ 
        status: "active", 
        approved_at: new Date().toISOString(),
        admin_response: adminMessage 
      })
      .eq("status", "pending")
      .lt("created_at", twentyFourHoursAgo)
      .select();

    if (updateError) {
      throw updateError;
    }

    // Send notifications to customers
    if (orders && orders.length > 0) {
      const notifications = orders.map(order => ({
        user_id: order.user_id,
        type: "order_auto_approved",
        title: "Order Automatically Approved",
        message: `Your order ${order.order_number} has been approved after 24 hours. Please check payment details.`,
        metadata: {
          order_id: order.id,
          order_number: order.order_number,
          total_amount: order.total_amount,
          payment_details: {
            easypasa: "03241729660",
            account_holder: "Saas",
            whatsapp: "0328 7337847"
          }
        }
      }));

      await supabase.from("notifications").insert(notifications);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        ordersActivated: orders?.length || 0,
        message: `Successfully auto-activated ${orders?.length || 0} orders`
      }),
      { 
        status: 200,
        headers: { "Content-Type": "application/json" } 
      }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      { 
        status: 500,
        headers: { "Content-Type": "application/json" } 
      }
    );
  }
});