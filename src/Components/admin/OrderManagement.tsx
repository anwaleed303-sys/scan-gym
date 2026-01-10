// import { useState } from "react";
// import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
// import { Button } from "../ui/button";
// import { Badge } from "../ui/badge";
// import { Textarea } from "../ui/texarea";
// import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
// import { useToast } from "../../hooks/use-toast";
// import { supabase } from "../../Integrations/client";
// import {
//   ShoppingBag,
//   Check,
//   X,
//   MessageSquare,
//   Phone,
//   DollarSign,
// } from "lucide-react";

// interface OrderItem {
//   id: string;
//   name: string;
//   price: number;
//   quantity: number;
// }

// interface Order {
//   id: string;
//   order_number: string;
//   user_id: string;
//   status: string;
//   total_amount: number;
//   items: OrderItem[];
//   created_at: string;
//   shipping_address?: {
//     fullName: string;
//     email: string;
//     phone: string;
//     address: string;
//     city: string;
//     postalCode: string;
//   };
//   profiles?: {
//     full_name: string;
//     email: string;
//   };
//   admin_response?: string;
//   approved_at?: string;
// }

// interface OrderManagementProps {
//   orders: Order[];
//   onRefresh: () => void;
// }

// export const OrderManagement = ({
//   orders,
//   onRefresh,
// }: OrderManagementProps) => {
//   const { toast } = useToast();
//   const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
//   const [isProcessing, setIsProcessing] = useState(false);
//   const [alternateMessage, setAlternateMessage] = useState("");
//   const [showDialog, setShowDialog] = useState(false);
//   const [dialogType, setDialogType] = useState<"approve" | "alternate">(
//     "approve"
//   );

//   const ADMIN_JAZZCASH = "0305-6248720";
//   const ADMIN_NAME = "Waleed Ali Nawazish";
//   const ADMIN_WHATSAPP = "03407615594";

//   const pendingOrders = orders.filter((o) => o.status === "paid");
//   const approvedOrders = orders.filter((o) => o.status === "approved");
//   const completedOrders = orders.filter((o) => o.status === "completed");

//   const handleApprove = async (order: Order) => {
//     setSelectedOrder(order);
//     setDialogType("approve");
//     setShowDialog(true);
//   };

//   const handleAlternate = async (order: Order) => {
//     setSelectedOrder(order);
//     setDialogType("alternate");
//     setAlternateMessage("");
//     setShowDialog(true);
//   };

//   const confirmApprove = async () => {
//     if (!selectedOrder) return;

//     setIsProcessing(true);
//     try {
//       const { error } = await supabase
//         .from("orders")
//         .update({
//           status: "approved",
//           approved_at: new Date().toISOString(),
//           admin_response: `Your order has been approved! Please send payment to:\n\nJazzCash: ${ADMIN_JAZZCASH}\nAccount Holder: ${ADMIN_NAME}\n\nFor queries, WhatsApp: ${ADMIN_WHATSAPP}`,
//         })
//         .eq("id", selectedOrder.id);

//       if (error) throw error;

//       // Create notification
//       await supabase.from("notifications").insert({
//         user_id: selectedOrder.user_id,
//         type: "order_approved",
//         title: "Order Approved",
//         message: `Your order ${selectedOrder.order_number} has been approved!`,
//         metadata: {
//           order_id: selectedOrder.id,
//           order_number: selectedOrder.order_number,
//           payment_details: {
//             jazzcash: ADMIN_JAZZCASH,
//             account_holder: ADMIN_NAME,
//             whatsapp: ADMIN_WHATSAPP,
//           },
//         },
//       });

//       toast({
//         title: "Order Approved",
//         description: `Order ${selectedOrder.order_number} has been approved.`,
//       });

//       onRefresh();
//       setShowDialog(false);
//     } catch (error: any) {
//       toast({
//         title: "Error",
//         description: error.message,
//         variant: "destructive",
//       });
//     } finally {
//       setIsProcessing(false);
//     }
//   };

//   const confirmAlternate = async () => {
//     if (!selectedOrder || !alternateMessage.trim()) {
//       toast({
//         title: "Error",
//         description: "Please enter an alternate message",
//         variant: "destructive",
//       });
//       return;
//     }

//     setIsProcessing(true);
//     try {
//       const { error } = await supabase
//         .from("orders")
//         .update({
//           status: "alternate",
//           admin_response: alternateMessage,
//         })
//         .eq("id", selectedOrder.id);

//       if (error) throw error;

//       // Create notification
//       await supabase.from("notifications").insert({
//         user_id: selectedOrder.user_id,
//         type: "order_alternate",
//         title: "Order Update Required",
//         message: `Alternate products suggested for order ${selectedOrder.order_number}`,
//         metadata: {
//           order_id: selectedOrder.id,
//           order_number: selectedOrder.order_number,
//           admin_message: alternateMessage,
//         },
//       });

//       toast({
//         title: "Alternate Sent",
//         description: `Alternate suggestion sent for order ${selectedOrder.order_number}.`,
//       });

//       onRefresh();
//       setShowDialog(false);
//     } catch (error: any) {
//       toast({
//         title: "Error",
//         description: error.message,
//         variant: "destructive",
//       });
//     } finally {
//       setIsProcessing(false);
//     }
//   };

//   const getStatusBadge = (status: string) => {
//     const variants: Record<string, any> = {
//       paid: "secondary",
//       approved: "default",
//       alternate: "outline",
//       completed: "default",
//       cancelled: "destructive",
//     };

//     return (
//       <Badge variant={variants[status] || "default"}>
//         {status.toUpperCase()}
//       </Badge>
//     );
//   };

//   const OrderCard = ({ order }: { order: Order }) => (
//     <Card className="mb-4">
//       <CardHeader className="pb-3">
//         <div className="flex items-center justify-between">
//           <CardTitle className="text-lg flex items-center gap-2">
//             <ShoppingBag className="w-5 h-5" />
//             {order.order_number}
//           </CardTitle>
//           {getStatusBadge(order.status)}
//         </div>
//         <p className="text-sm text-muted-foreground">
//           {new Date(order.created_at).toLocaleString()}
//         </p>
//       </CardHeader>
//       <CardContent className="space-y-4">
//         <div className="grid grid-cols-2 gap-4 text-sm">
//           <div>
//             <p className="font-semibold">Customer</p>
//             <p>
//               {order.shipping_address?.fullName || order.profiles?.full_name}
//             </p>
//             <p className="text-muted-foreground">
//               {order.shipping_address?.email}
//             </p>
//             <p className="text-muted-foreground">
//               {order.shipping_address?.phone}
//             </p>
//           </div>
//           <div>
//             <p className="font-semibold">Shipping Address</p>
//             <p>{order.shipping_address?.address}</p>
//             <p>{order.shipping_address?.city}</p>
//             {order.shipping_address?.postalCode && (
//               <p>{order.shipping_address.postalCode}</p>
//             )}
//           </div>
//         </div>

//         <div>
//           <p className="font-semibold mb-2">Items</p>
//           <div className="space-y-1">
//             {order.items.map((item, idx) => (
//               <div key={idx} className="flex justify-between text-sm">
//                 <span>
//                   {item.name} x {item.quantity}
//                 </span>
//                 <span>Rs. {(item.price * item.quantity).toLocaleString()}</span>
//               </div>
//             ))}
//           </div>
//           <div className="flex justify-between font-semibold mt-2 pt-2 border-t">
//             <span>Total</span>
//             <span>Rs. {order.total_amount.toLocaleString()}</span>
//           </div>
//         </div>

//         {order.admin_response && (
//           <div className="bg-muted p-3 rounded-lg">
//             <p className="text-sm font-semibold mb-1">Admin Response:</p>
//             <p className="text-sm whitespace-pre-wrap">
//               {order.admin_response}
//             </p>
//           </div>
//         )}

//         {order.status === "paid" && (
//           <div className="flex gap-2">
//             <Button
//               onClick={() => handleApprove(order)}
//               className="flex-1"
//               disabled={isProcessing}
//             >
//               <Check className="w-4 h-4 mr-2" />
//               Approve Order
//             </Button>
//             <Button
//               onClick={() => handleAlternate(order)}
//               variant="outline"
//               className="flex-1"
//               disabled={isProcessing}
//             >
//               <MessageSquare className="w-4 h-4 mr-2" />
//               Suggest Alternate
//             </Button>
//           </div>
//         )}

//         {order.status === "approved" && (
//           <div className="bg-green-50 dark:bg-green-950 p-3 rounded-lg space-y-2">
//             <p className="text-sm font-semibold flex items-center gap-2">
//               <DollarSign className="w-4 h-4" />
//               Payment Details
//             </p>
//             <div className="text-sm space-y-1">
//               <p>
//                 <strong>JazzCash:</strong> {ADMIN_JAZZCASH}
//               </p>
//               <p>
//                 <strong>Account Holder:</strong> {ADMIN_NAME}
//               </p>
//               <p className="flex items-center gap-2">
//                 <Phone className="w-4 h-4" />
//                 <strong>WhatsApp:</strong> {ADMIN_WHATSAPP}
//               </p>
//             </div>
//           </div>
//         )}
//       </CardContent>
//     </Card>
//   );

//   return (
//     <>
//       <Card>
//         <CardHeader>
//           <CardTitle className="flex items-center gap-2">
//             <ShoppingBag className="w-6 h-6" />
//             Order Management
//           </CardTitle>
//         </CardHeader>
//         <CardContent>
//           <div className="space-y-6">
//             {/* Pending Orders */}
//             {pendingOrders.length > 0 && (
//               <div>
//                 <h3 className="text-lg font-semibold mb-3">
//                   Pending Orders ({pendingOrders.length})
//                 </h3>
//                 {pendingOrders.map((order) => (
//                   <OrderCard key={order.id} order={order} />
//                 ))}
//               </div>
//             )}

//             {/* Approved Orders */}
//             {approvedOrders.length > 0 && (
//               <div>
//                 <h3 className="text-lg font-semibold mb-3">
//                   Approved Orders ({approvedOrders.length})
//                 </h3>
//                 {approvedOrders.map((order) => (
//                   <OrderCard key={order.id} order={order} />
//                 ))}
//               </div>
//             )}

//             {/* Completed Orders */}
//             {completedOrders.length > 0 && (
//               <div>
//                 <h3 className="text-lg font-semibold mb-3">
//                   Completed Orders ({completedOrders.length})
//                 </h3>
//                 {completedOrders.map((order) => (
//                   <OrderCard key={order.id} order={order} />
//                 ))}
//               </div>
//             )}

//             {orders.length === 0 && (
//               <div className="text-center py-8 text-muted-foreground">
//                 No orders found
//               </div>
//             )}
//           </div>
//         </CardContent>
//       </Card>

//       {/* Dialog for Approve/Alternate */}
//       <Dialog open={showDialog} onOpenChange={setShowDialog}>
//         <DialogContent>
//           <DialogHeader>
//             <DialogTitle>
//               {dialogType === "approve" ? "Approve Order" : "Suggest Alternate"}
//             </DialogTitle>
//           </DialogHeader>
//           <div className="space-y-4">
//             {dialogType === "approve" ? (
//               <div className="space-y-3">
//                 <p>Customer will receive payment details:</p>
//                 <div className="bg-muted p-4 rounded-lg space-y-2 text-sm">
//                   <p>
//                     <strong>JazzCash Number:</strong> {ADMIN_JAZZCASH}
//                   </p>
//                   <p>
//                     <strong>Account Holder:</strong> {ADMIN_NAME}
//                   </p>
//                   <p>
//                     <strong>WhatsApp:</strong> {ADMIN_WHATSAPP}
//                   </p>
//                 </div>
//                 <p className="text-sm text-muted-foreground">
//                   Order will be marked as approved and customer will be
//                   notified.
//                 </p>
//               </div>
//             ) : (
//               <div className="space-y-3">
//                 <p className="text-sm">
//                   Enter your message about alternate products or availability:
//                 </p>
//                 <Textarea
//                   placeholder="e.g., The requested product is out of stock. We have a similar alternative available..."
//                   value={alternateMessage}
//                   onChange={(e) => setAlternateMessage(e.target.value)}
//                   rows={5}
//                 />
//               </div>
//             )}

//             <div className="flex gap-2">
//               <Button
//                 onClick={() => setShowDialog(false)}
//                 variant="outline"
//                 className="flex-1"
//               >
//                 Cancel
//               </Button>
//               <Button
//                 onClick={
//                   dialogType === "approve" ? confirmApprove : confirmAlternate
//                 }
//                 className="flex-1"
//                 disabled={isProcessing}
//               >
//                 {isProcessing ? "Processing..." : "Confirm"}
//               </Button>
//             </div>
//           </div>
//         </DialogContent>
//       </Dialog>
//     </>
//   );
// };

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Textarea } from "../ui/texarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { useToast } from "../../hooks/use-toast";
import { supabase } from "../../Integrations/client";
import {
  ShoppingBag,
  Check,
  MessageSquare,
  Phone,
  DollarSign,
  User,
  MapPin,
} from "lucide-react";

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface Order {
  id: string;
  order_number: string;
  user_id: string;
  status: string;
  total_amount: number;
  items: OrderItem[];
  created_at: string;
  shipping_address?: {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    postalCode: string;
  };
  profiles?: {
    full_name: string;
    email: string;
  };
  admin_response?: string;
  approved_at?: string;
}

interface OrderManagementProps {
  orders: Order[];
  onRefresh: () => void;
}

export const OrderManagement = ({
  orders,
  onRefresh,
}: OrderManagementProps) => {
  const { toast } = useToast();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [alternateMessage, setAlternateMessage] = useState("");
  const [showDialog, setShowDialog] = useState(false);
  const [dialogType, setDialogType] = useState<"approve" | "alternate">(
    "approve"
  );

  const ADMIN_JAZZCASH = "0305-6248720";
  const ADMIN_NAME = "Waleed Ali Nawazish";
  const ADMIN_WHATSAPP = "03407615594";

  const pendingOrders = orders.filter((o) => o.status === "pending");
  const activeOrders = orders.filter((o) => o.status === "active");
  const completedOrders = orders.filter((o) => o.status === "completed");

  const handleApprove = async (order: Order) => {
    setSelectedOrder(order);
    setDialogType("approve");
    setShowDialog(true);
  };

  const handleAlternate = async (order: Order) => {
    setSelectedOrder(order);
    setDialogType("alternate");
    setAlternateMessage("");
    setShowDialog(true);
  };

  const confirmApprove = async () => {
    if (!selectedOrder) return;

    setIsProcessing(true);
    try {
      const adminMessage = `Your order has been approved!

PAYMENT DETAILS:
━━━━━━━━━━━━━━━━━━
💰 JazzCash: ${ADMIN_JAZZCASH}
👤 Account Holder: ${ADMIN_NAME}
📱 WhatsApp: ${ADMIN_WHATSAPP}

ORDER DETAILS:
━━━━━━━━━━━━━━━━━━
Order #: ${selectedOrder.order_number}
Total Amount: Rs. ${selectedOrder.total_amount.toLocaleString()}

Items:
${selectedOrder.items
  .map(
    (item) =>
      `• ${item.name} x ${item.quantity} = Rs. ${(
        item.price * item.quantity
      ).toLocaleString()}`
  )
  .join("\n")}

Please send payment to the above JazzCash number and share the screenshot on WhatsApp. Your order will be processed once payment is confirmed.`;

      const { error } = await supabase
        .from("orders")
        .update({
          status: "active",
          approved_at: new Date().toISOString(),
          admin_response: adminMessage,
        })
        .eq("id", selectedOrder.id);

      if (error) throw error;

      // Create notification
      await supabase.from("notifications").insert({
        user_id: selectedOrder.user_id,
        type: "order_approved",
        title: "Order Approved",
        message: `Your order ${selectedOrder.order_number} has been approved!`,
        metadata: {
          order_id: selectedOrder.id,
          order_number: selectedOrder.order_number,
          payment_details: {
            jazzcash: ADMIN_JAZZCASH,
            account_holder: ADMIN_NAME,
            whatsapp: ADMIN_WHATSAPP,
          },
        },
      });

      toast({
        title: "Order Approved",
        description: `Order ${selectedOrder.order_number} has been approved and customer notified.`,
      });

      onRefresh();
      setShowDialog(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const confirmAlternate = async () => {
    if (!selectedOrder || !alternateMessage.trim()) {
      toast({
        title: "Error",
        description: "Please enter an alternate message",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      const { error } = await supabase
        .from("orders")
        .update({
          admin_response: alternateMessage,
        })
        .eq("id", selectedOrder.id);

      if (error) throw error;

      // Create notification
      await supabase.from("notifications").insert({
        user_id: selectedOrder.user_id,
        type: "order_alternate",
        title: "Order Update",
        message: `Admin has sent a message about order ${selectedOrder.order_number}`,
        metadata: {
          order_id: selectedOrder.id,
          order_number: selectedOrder.order_number,
          admin_message: alternateMessage,
        },
      });

      toast({
        title: "Message Sent",
        description: `Alternate suggestion sent for order ${selectedOrder.order_number}.`,
      });

      onRefresh();
      setShowDialog(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      pending: "secondary",
      active: "default",
      completed: "default",
      cancelled: "destructive",
    };

    const colors: Record<string, string> = {
      pending: "bg-yellow-500",
      active: "bg-green-500",
      completed: "bg-blue-500",
      cancelled: "bg-red-500",
    };
    // Debug: Log orders received
    useEffect(() => {
      console.log("🎯 OrderManagement received orders:", orders);
      console.log("📊 Total orders:", orders.length);
      console.log("📋 Status breakdown:", {
        pending: orders.filter((o) => o.status === "pending").length,
        active: orders.filter((o) => o.status === "active").length,
        completed: orders.filter((o) => o.status === "completed").length,
        cancelled: orders.filter((o) => o.status === "cancelled").length,
        other: orders.filter(
          (o) =>
            !["pending", "active", "completed", "cancelled"].includes(o.status)
        ).length,
      });
    }, [orders]);

    const pendingOrders = orders.filter((o) => o.status === "pending");
    const activeOrders = orders.filter((o) => o.status === "active");
    const completedOrders = orders.filter((o) => o.status === "completed");
    const cancelledOrders = orders.filter((o) => o.status === "cancelled");

    // Catch any orders with unexpected statuses
    const otherOrders = orders.filter(
      (o) => !["pending", "active", "completed", "cancelled"].includes(o.status)
    );

    // Log if there are any other statuses
    if (otherOrders.length > 0) {
      console.warn("⚠️ Orders with unexpected statuses:", otherOrders);
    }
    return (
      <Badge variant={variants[status] || "default"}>
        <span className={`w-2 h-2 rounded-full ${colors[status]} mr-2`} />
        {status.toUpperCase()}
      </Badge>
    );
  };

  const OrderCard = ({ order }: { order: Order }) => (
    <Card className="mb-4 border-l-4 border-l-primary">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-primary" />
            {order.order_number}
          </CardTitle>
          {getStatusBadge(order.status)}
        </div>
        <p className="text-sm text-muted-foreground">
          {new Date(order.created_at).toLocaleString("en-PK", {
            dateStyle: "full",
            timeStyle: "short",
          })}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Customer Info */}
        <div className="p-4 bg-muted/50 rounded-lg space-y-3">
          <div className="flex items-start gap-3">
            <User className="w-5 h-5 text-primary mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-sm mb-1">Customer Details</p>
              <div className="text-sm space-y-1">
                <p className="font-medium">
                  {order.shipping_address?.fullName ||
                    order.profiles?.full_name}
                </p>
                <p className="text-muted-foreground">
                  {order.shipping_address?.email}
                </p>
                <p className="text-muted-foreground">
                  📱 {order.shipping_address?.phone}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3 pt-3 border-t border-border">
            <MapPin className="w-5 h-5 text-primary mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-sm mb-1">Shipping Address</p>
              <div className="text-sm space-y-1">
                <p>{order.shipping_address?.address}</p>
                <p>
                  {order.shipping_address?.city}
                  {order.shipping_address?.postalCode &&
                    ` - ${order.shipping_address.postalCode}`}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div>
          <p className="font-semibold mb-3 text-sm flex items-center gap-2">
            <ShoppingBag className="w-4 h-4" />
            Order Items
          </p>
          <div className="space-y-2">
            {order.items.map((item, idx) => (
              <div
                key={idx}
                className="flex justify-between items-center p-2 bg-muted/30 rounded"
              >
                <div>
                  <p className="font-medium text-sm">{item.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Quantity: {item.quantity} × Rs.{" "}
                    {item.price.toLocaleString()}
                  </p>
                </div>
                <p className="font-semibold">
                  Rs. {(item.price * item.quantity).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
          <div className="flex justify-between font-bold text-lg mt-3 pt-3 border-t-2 border-primary">
            <span>Total Amount</span>
            <span className="text-primary">
              Rs. {order.total_amount.toLocaleString()}
            </span>
          </div>
        </div>

        {order.admin_response && (
          <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm font-semibold mb-1 flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Admin Response:
            </p>
            <p className="text-sm whitespace-pre-wrap">
              {order.admin_response}
            </p>
          </div>
        )}

        {order.status === "pending" && (
          <div className="flex gap-2 pt-2">
            <Button
              onClick={() => handleApprove(order)}
              className="flex-1"
              disabled={isProcessing}
            >
              <Check className="w-4 h-4 mr-2" />
              Approve Order
            </Button>
            <Button
              onClick={() => handleAlternate(order)}
              variant="outline"
              className="flex-1"
              disabled={isProcessing}
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Send Message
            </Button>
          </div>
        )}

        {order.status === "active" && (
          <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg border border-green-200 dark:border-green-800 space-y-2">
            <p className="text-sm font-semibold flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Payment Details Sent
            </p>
            <div className="text-sm space-y-1">
              <p>
                <strong>JazzCash:</strong> {ADMIN_JAZZCASH}
              </p>
              <p>
                <strong>Account Holder:</strong> {ADMIN_NAME}
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <strong>WhatsApp:</strong> {ADMIN_WHATSAPP}
              </p>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Waiting for customer payment confirmation
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingBag className="w-6 h-6" />
            Order Management
          </CardTitle>
          <div className="flex gap-4 text-sm">
            <span className="text-muted-foreground">
              Pending: <strong>{pendingOrders.length}</strong>
            </span>
            <span className="text-muted-foreground">
              Active: <strong>{activeOrders.length}</strong>
            </span>
            <span className="text-muted-foreground">
              Completed: <strong>{completedOrders.length}</strong>
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Pending Orders */}
            {pendingOrders.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-yellow-500 animate-pulse" />
                  Pending Orders ({pendingOrders.length})
                </h3>
                {pendingOrders.map((order) => (
                  <OrderCard key={order.id} order={order} />
                ))}
              </div>
            )}

            {/* Active Orders */}
            {activeOrders.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-green-500" />
                  Active Orders ({activeOrders.length})
                </h3>
                {activeOrders.map((order) => (
                  <OrderCard key={order.id} order={order} />
                ))}
              </div>
            )}

            {/* Completed Orders */}
            {completedOrders.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-blue-500" />
                  Completed Orders ({completedOrders.length})
                </h3>
                {completedOrders.map((order) => (
                  <OrderCard key={order.id} order={order} />
                ))}
              </div>
            )}

            {orders.length === 0 && (
              <div className="text-center py-12">
                <ShoppingBag className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No orders found</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Dialog for Approve/Alternate */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {dialogType === "approve"
                ? "Approve Order"
                : "Send Message to Customer"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {dialogType === "approve" ? (
              <div className="space-y-3">
                <p className="font-medium">
                  Customer will receive complete order details with payment
                  information:
                </p>
                <div className="bg-muted p-4 rounded-lg space-y-2 text-sm">
                  <p>
                    <strong>Order:</strong> {selectedOrder?.order_number}
                  </p>
                  <p>
                    <strong>Total:</strong> Rs.{" "}
                    {selectedOrder?.total_amount.toLocaleString()}
                  </p>
                  <div className="pt-2 border-t border-border">
                    <p>
                      <strong>JazzCash:</strong> {ADMIN_JAZZCASH}
                    </p>
                    <p>
                      <strong>Account Holder:</strong> {ADMIN_NAME}
                    </p>
                    <p>
                      <strong>WhatsApp:</strong> {ADMIN_WHATSAPP}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Order will be marked as active and customer will be notified
                  via email.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm">
                  Send a message to customer about their order (e.g., product
                  availability, alternate suggestions):
                </p>
                <Textarea
                  placeholder="e.g., The requested product is out of stock. We have a similar alternative available..."
                  value={alternateMessage}
                  onChange={(e) => setAlternateMessage(e.target.value)}
                  rows={5}
                />
              </div>
            )}

            <div className="flex gap-2">
              <Button
                onClick={() => setShowDialog(false)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={
                  dialogType === "approve" ? confirmApprove : confirmAlternate
                }
                className="flex-1"
                disabled={isProcessing}
              >
                {isProcessing ? "Processing..." : "Confirm"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
