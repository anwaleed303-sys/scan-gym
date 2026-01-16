// import { useEffect, useState } from "react";
// import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
// import { Button } from "../ui/button";
// import { Badge } from "../ui/badge";
// import { Textarea } from "../ui/texarea";
// import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
// import { Input } from "../ui/input";
// import { Label } from "../ui/label";
// import { useToast } from "../../hooks/use-toast";
// import { supabase } from "../../Integrations/client";
// import {
//   ShoppingBag,
//   Check,
//   MessageSquare,
//   Phone,
//   DollarSign,
//   User,
//   MapPin,
//   Printer,
//   Trash2,
//   Filter,
//   X,
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
//   const [showDeleteDialog, setShowDeleteDialog] = useState(false);
//   const [showFilterDialog, setShowFilterDialog] = useState(false);
//   const [dialogType, setDialogType] = useState<"approve" | "alternate">(
//     "approve"
//   );
//   const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);

//   // Filter states
//   const [filteredOrders, setFilteredOrders] = useState<Order[]>(orders);
//   const [filterStartDate, setFilterStartDate] = useState("");
//   const [filterEndDate, setFilterEndDate] = useState("");
//   const [filterCustomerName, setFilterCustomerName] = useState("");
//   const [filterStatus, setFilterStatus] = useState("");
//   const [showStatusDropdown, setShowStatusDropdown] = useState(false);

//   const ADMIN_Easypasa = "03241729660";
//   const ADMIN_NAME = "Saad";
//   const ADMIN_WHATSAPP = "03287337847";

//   useEffect(() => {
//     setFilteredOrders(orders);
//   }, [orders]);

//   const pendingOrders = filteredOrders.filter((o) => o.status === "pending");
//   const activeOrders = filteredOrders.filter((o) => o.status === "active");
//   const completedOrders = filteredOrders.filter(
//     (o) => o.status === "completed"
//   );

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

//   const handleDeleteOrder = (order: Order) => {
//     setOrderToDelete(order);
//     setShowDeleteDialog(true);
//   };

//   const confirmDelete = async () => {
//     if (!orderToDelete) return;

//     setIsProcessing(true);
//     try {
//       const { error } = await supabase
//         .from("orders")
//         .delete()
//         .eq("id", orderToDelete.id);

//       if (error) throw error;

//       toast({
//         title: "Order Deleted",
//         description: `Order ${orderToDelete.order_number} has been deleted.`,
//       });

//       onRefresh();
//       setShowDeleteDialog(false);
//       setOrderToDelete(null);
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

//   const handlePrintBill = (order: Order) => {
//     const printWindow = window.open("", "_blank");
//     if (!printWindow) return;

//     const billHTML = `
//       <!DOCTYPE html>
//       <html>
//         <head>
//           <title>Order Bill - ${order.order_number}</title>
//           <style>
//             body {
//               font-family: Arial, sans-serif;
//               padding: 20px;
//               max-width: 800px;
//               margin: 0 auto;
//             }
//             .header {
//               text-align: center;
//               border-bottom: 2px solid #333;
//               padding-bottom: 20px;
//               margin-bottom: 20px;
//             }
//             .company-name {
//               font-size: 28px;
//               font-weight: bold;
//               color: #333;
//             }
//             .bill-title {
//               font-size: 20px;
//               margin-top: 10px;
//               color: #666;
//             }
//             .section {
//               margin: 20px 0;
//               padding: 15px;
//               border: 1px solid #ddd;
//               border-radius: 5px;
//             }
//             .section-title {
//               font-weight: bold;
//               font-size: 16px;
//               margin-bottom: 10px;
//               color: #333;
//               border-bottom: 1px solid #eee;
//               padding-bottom: 5px;
//             }
//             .info-row {
//               display: flex;
//               justify-content: space-between;
//               padding: 5px 0;
//             }
//             .info-label {
//               font-weight: bold;
//               color: #666;
//             }
//             table {
//               width: 100%;
//               border-collapse: collapse;
//               margin: 15px 0;
//             }
//             th, td {
//               padding: 12px;
//               text-align: left;
//               border-bottom: 1px solid #ddd;
//             }
//             th {
//               background-color: #f5f5f5;
//               font-weight: bold;
//             }
//             .total-row {
//               font-weight: bold;
//               font-size: 18px;
//               background-color: #f9f9f9;
//             }
//             .payment-info {
//               background-color: #f0f9ff;
//               padding: 15px;
//               border-radius: 5px;
//               margin-top: 20px;
//             }
//             .footer {
//               text-align: center;
//               margin-top: 30px;
//               padding-top: 20px;
//               border-top: 2px solid #333;
//               color: #666;
//             }
//             @media print {
//               body {
//                 padding: 0;
//               }
//               .no-print {
//                 display: none;
//               }
//             }
//           </style>
//         </head>
//         <body>
//           <div class="header">
//             <div class="company-name">SCANGYM</div>
//             <div class="bill-title">ORDER INVOICE</div>
//           </div>

//           <div class="section">
//             <div class="section-title">Order Information</div>
//             <div class="info-row">
//               <span class="info-label">Order Number:</span>
//               <span>${order.order_number}</span>
//             </div>
//             <div class="info-row">
//               <span class="info-label">Order Date:</span>
//               <span>${new Date(order.created_at).toLocaleString("en-PK", {
//                 dateStyle: "full",
//                 timeStyle: "short",
//               })}</span>
//             </div>
//             <div class="info-row" >
//               <span class="info-label">Status:</span>
//               <span style="text-transform: uppercase; font-weight: bold;">${
//                 order.status
//               }</span>
//             </div>
//           </div>

//           <div class="section">
//             <div class="section-title">Customer Details</div>
//             <div class="info-row">
//               <span class="info-label">Name:</span>
//               <span>${
//                 order.shipping_address?.fullName ||
//                 order.profiles?.full_name ||
//                 "N/A"
//               }</span>
//             </div>
//             <div class="info-row">
//               <span class="info-label">Email:</span>
//               <span>${order.shipping_address?.email || "N/A"}</span>
//             </div>
//             <div class="info-row">
//               <span class="info-label">Phone:</span>
//               <span>${order.shipping_address?.phone || "N/A"}</span>
//             </div>
//           </div>

//           <div class="section">
//             <div class="section-title">Shipping Address</div>
//             <p>${order.shipping_address?.address || "N/A"}</p>
//             <p>${order.shipping_address?.city || "N/A"}${
//       order.shipping_address?.postalCode
//         ? ` - ${order.shipping_address.postalCode}`
//         : ""
//     }</p>
//           </div>

//           <div class="section">
//             <div class="section-title">Order Items</div>
//             <table>
//               <thead>
//                 <tr>
//                   <th>Item</th>
//                   <th>Quantity</th>
//                   <th>Price</th>
//                   <th>Total</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 ${order.items
//                   .map(
//                     (item) => `
//                   <tr>
//                     <td>${item.name}</td>
//                     <td>${item.quantity}</td>
//                     <td>Rs. ${item.price.toLocaleString()}</td>
//                     <td>Rs. ${(
//                       item.price * item.quantity
//                     ).toLocaleString()}</td>
//                   </tr>
//                 `
//                   )
//                   .join("")}
//                 <tr class="total-row">
//                   <td colspan="3" style="text-align: right;">TOTAL AMOUNT:</td>
//                   <td>Rs. ${order.total_amount.toLocaleString()}</td>
//                 </tr>
//               </tbody>
//             </table>
//           </div>

//           ${
//             order.status === "active"
//               ? `
//             <div class="payment-info">
//               <div class="section-title">Payment Details</div>
//               <div class="info-row">
//                 <span class="info-label">JazzCash Number:</span>
//                 <span>${ADMIN_Easypasa}</span>
//               </div>
//               <div class="info-row">
//                 <span class="info-label">Account Holder:</span>
//                 <span>${ADMIN_NAME}</span>
//               </div>
//               <div class="info-row">
//                 <span class="info-label">WhatsApp:</span>
//                 <span>${ADMIN_WHATSAPP}</span>
//               </div>
//             </div>
//           `
//               : ""
//           }

//           <div class="footer">
//             <p>Thank you for your order!</p>
//             <p>For any queries, contact us at support@scangym.com</p>
//           </div>

//           <div class="no-print" style="text-align: center; margin-top: 20px;">
//             <button onclick="window.print()" style="padding: 10px 20px; background: #333; color: white; border: none; border-radius: 5px; cursor: pointer;">Print Bill</button>
//             <button onclick="window.close()" style="padding: 10px 20px; background: #666; color: white; border: none; border-radius: 5px; cursor: pointer; margin-left: 10px;">Close</button>
//           </div>
//         </body>
//       </html>
//     `;

//     printWindow.document.write(billHTML);
//     printWindow.document.close();
//   };

//   const applyFilters = () => {
//     let filtered = [...orders];

//     if (filterStartDate) {
//       filtered = filtered.filter(
//         (order) => new Date(order.created_at) >= new Date(filterStartDate)
//       );
//     }
//     if (filterEndDate) {
//       filtered = filtered.filter(
//         (order) =>
//           new Date(order.created_at) <= new Date(filterEndDate + "T23:59:59")
//       );
//     }

//     if (filterCustomerName) {
//       filtered = filtered.filter((order) => {
//         const customerName =
//           order.shipping_address?.fullName || order.profiles?.full_name || "";
//         return customerName
//           .toLowerCase()
//           .includes(filterCustomerName.toLowerCase());
//       });
//     }

//     if (filterStatus) {
//       filtered = filtered.filter((order) => order.status === filterStatus);
//     }

//     setFilteredOrders(filtered);
//     setShowFilterDialog(false);
//   };

//   const clearFilters = () => {
//     setFilterStartDate("");
//     setFilterEndDate("");
//     setFilterCustomerName("");
//     setFilterStatus("");
//     setFilteredOrders(orders);
//     setShowFilterDialog(false);
//   };

//   const confirmApprove = async () => {
//     if (!selectedOrder) return;

//     setIsProcessing(true);
//     try {
//       const adminMessage = `Your order has been approved!

//   PAYMENT DETAILS:
//   ━━━━━━━━━━━━━━━━━━
//    Easypasa: ${ADMIN_Easypasa}
//    Account Holder: ${ADMIN_NAME}
//    WhatsApp: ${ADMIN_WHATSAPP}

//   ORDER DETAILS:
//   ━━━━━━━━━━━━━━━━━━
//   Order #: ${selectedOrder.order_number}
//   Total Amount: Rs. ${selectedOrder.total_amount.toLocaleString()}

//   Items:
//   ${selectedOrder.items
//     .map(
//       (item) =>
//         ` ${item.name} x ${item.quantity} = Rs. ${(
//           item.price * item.quantity
//         ).toLocaleString()}`
//     )
//     .join("\n")}

//   Please send payment to the above EasyPasa number and share the screenshot on WhatsApp. Your order will be processed once payment is confirmed.`;

//       const { error } = await supabase
//         .from("orders")
//         .update({
//           status: "active",
//           approved_at: new Date().toISOString(),
//           admin_response: adminMessage,
//         })
//         .eq("id", selectedOrder.id);

//       if (error) throw error;

//       await supabase.from("notifications").insert({
//         user_id: selectedOrder.user_id,
//         type: "order_approved",
//         title: "Order Approved",
//         message: `Your order ${selectedOrder.order_number} has been approved!`,
//         metadata: {
//           order_id: selectedOrder.id,
//           order_number: selectedOrder.order_number,
//           payment_details: {
//             Easypasa: ADMIN_Easypasa,
//             account_holder: ADMIN_NAME,
//             whatsapp: ADMIN_WHATSAPP,
//           },
//         },
//       });

//       toast({
//         title: "Order Approved",
//         description: `Order ${selectedOrder.order_number} has been approved and customer notified.`,
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
//           admin_response: alternateMessage,
//         })
//         .eq("id", selectedOrder.id);

//       if (error) throw error;

//       await supabase.from("notifications").insert({
//         user_id: selectedOrder.user_id,
//         type: "order_alternate",
//         title: "Order Update",
//         message: `Admin has sent a message about order ${selectedOrder.order_number}`,
//         metadata: {
//           order_id: selectedOrder.id,
//           order_number: selectedOrder.order_number,
//           admin_message: alternateMessage,
//         },
//       });

//       toast({
//         title: "Message Sent",
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
//       pending: "secondary",
//       active: "default",
//       completed: "default",
//       cancelled: "destructive",
//     };

//     const colors: Record<string, string> = {
//       pending: "bg-yellow-500",
//       active: "bg-green-500",
//       completed: "bg-blue-500",
//       cancelled: "bg-red-500",
//     };

//     return (
//       <Badge variant={variants[status] || "default"}>
//         <span className={`w-2 h-2 rounded-full ${colors[status]} mr-2`} />
//         {status.toUpperCase()}
//       </Badge>
//     );
//   };

//   const OrderCard = ({ order }: { order: Order }) => (
//     <Card className="mb-4 border-l-4 border-l-primary">
//       <CardHeader className="pb-3">
//         <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
//           <div>
//             <CardTitle className="text-lg flex items-center gap-2">
//               <ShoppingBag className="w-5 h-5 text-primary" />
//               {order.order_number}
//             </CardTitle>
//             <p className="text-sm text-muted-foreground">
//               {new Date(order.created_at).toLocaleString("en-PK", {
//                 dateStyle: "full",
//                 timeStyle: "short",
//               })}
//             </p>
//           </div>
//           <div className="flex items-center gap-3">
//             {order.status === "pending" &&
//               (() => {
//                 const orderTime = new Date(order.created_at).getTime();
//                 const activationTime = orderTime + 24 * 60 * 60 * 1000;
//                 const timeRemaining = activationTime - Date.now();

//                 if (timeRemaining <= 0) {
//                   return (
//                     <p className="text-xs text-orange-600 dark:text-orange-400 flex items-center gap-1 font-medium whitespace-nowrap">
//                       ⏰ Will auto-activate soon
//                     </p>
//                   );
//                 }

//                 const hoursLeft = Math.floor(timeRemaining / (1000 * 60 * 60));
//                 const minutesLeft = Math.floor(
//                   (timeRemaining % (1000 * 60 * 60)) / (1000 * 60)
//                 );

//                 return (
//                   <p className="text-xs text-orange-600 dark:text-orange-400 flex items-center gap-1 font-medium whitespace-nowrap">
//                     ⏰ Auto-activates in {hoursLeft}h {minutesLeft}m
//                   </p>
//                 );
//               })()}
//             {getStatusBadge(order.status)}
//           </div>
//         </div>
//       </CardHeader>
//       <CardContent className="space-y-4">
//         <div className="p-4 bg-muted/50 rounded-lg space-y-3">
//           <div className="flex items-start gap-3">
//             <User className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
//             <div className="flex-1 min-w-0">
//               <p className="font-semibold text-sm mb-1">Customer Details</p>
//               <div className="text-sm space-y-1">
//                 <p className="font-medium break-words">
//                   {order.shipping_address?.fullName ||
//                     order.profiles?.full_name}
//                 </p>
//                 <p className="text-muted-foreground break-all">
//                   {order.shipping_address?.email}
//                 </p>
//                 <p className="text-muted-foreground">
//                   📱 {order.shipping_address?.phone}
//                 </p>
//               </div>
//             </div>
//           </div>

//           <div className="flex items-start gap-3 pt-3 border-t border-border">
//             <MapPin className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
//             <div className="flex-1 min-w-0">
//               <p className="font-semibold text-sm mb-1">Shipping Address</p>
//               <div className="text-sm space-y-1">
//                 <p className="break-words">{order.shipping_address?.address}</p>
//                 <p>
//                   {order.shipping_address?.city}
//                   {order.shipping_address?.postalCode &&
//                     ` - ${order.shipping_address.postalCode}`}
//                 </p>
//               </div>
//             </div>
//           </div>
//         </div>

//         <div>
//           <p className="font-semibold mb-3 text-sm flex items-center gap-2">
//             <ShoppingBag className="w-4 h-4" />
//             Order Items
//           </p>
//           <div className="space-y-2">
//             {order.items.map((item, idx) => (
//               <div
//                 key={idx}
//                 className="flex justify-between items-center p-2 bg-muted/30 rounded"
//               >
//                 <div className="flex-1 min-w-0 pr-2">
//                   <p className="font-medium text-sm break-words">{item.name}</p>
//                   <p className="text-xs text-muted-foreground">
//                     Quantity: {item.quantity} × Rs.{" "}
//                     {item.price.toLocaleString()}
//                   </p>
//                 </div>
//                 <p className="font-semibold whitespace-nowrap">
//                   Rs. {(item.price * item.quantity).toLocaleString()}
//                 </p>
//               </div>
//             ))}
//           </div>
//           <div className="flex justify-between font-bold text-lg mt-3 pt-3 border-t-2 border-primary">
//             <span>Total Amount</span>
//             <span className="text-primary">
//               Rs. {order.total_amount.toLocaleString()}
//             </span>
//           </div>
//         </div>

//         {/* {order.admin_response && (
//           <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
//             <p className="text-sm font-semibold mb-1 flex items-center gap-2">
//               <MessageSquare className="w-4 h-4" />
//               Admin Response:
//             </p>
//             <p className="text-sm whitespace-pre-wrap break-words">
//               {order.admin_response}
//             </p>
//           </div>
//         )} */}

//         {order.status === "pending" && (
//           <div className="flex flex-col sm:flex-row gap-2 pt-2">
//             <div className="bg-yellow-50 dark:bg-yellow-950 p-3 rounded-lg border border-yellow-200 dark:border-yellow-800 mb-2">
//               <p className="text-xs text-yellow-800 dark:text-yellow-200">
//                 ⚠️ This order will be automatically approved after 24 hours if
//                 no action is taken.
//               </p>
//             </div>
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
//               Send Message
//             </Button>
//           </div>
//         )}

//         {order.status === "active" && (
//           <div className=" dark:bg-green-950 p-4 rounded-lg border border-green-200 dark:border-green-800 space-y-2">
//             <p className="text-sm font-semibold flex items-center gap-2">
//               {/* <DollarSign className="w-4 h-4" /> */}
//               Payment Details Sent to customer
//             </p>
//             <div className="text-sm space-y-1">
//               <p>
//                 <strong>EasyPasa:</strong> {ADMIN_Easypasa}
//               </p>
//               <p>
//                 <strong>Account Holder:</strong> {ADMIN_NAME}
//               </p>
//               <p className="flex items-center gap-2">
//                 {/* <Phone className="w-4 h-4" /> */}
//                 <strong>WhatsApp:</strong> {ADMIN_WHATSAPP}
//               </p>
//             </div>
//             {/* <p className="text-xs text-muted-foreground mt-2">
//               Waiting for customer payment confirmation
//             </p> */}
//           </div>
//         )}

//         <div className="flex flex-col sm:flex-row gap-2 pt-2">
//           {(order.status === "active" || order.status === "completed") && (
//             <Button
//               onClick={() => handlePrintBill(order)}
//               variant="outline"
//               className="flex-1"
//             >
//               <Printer className="w-4 h-4 mr-2" />
//               Print Bill
//             </Button>
//           )}
//           <Button
//             onClick={() => handleDeleteOrder(order)}
//             variant="destructive"
//             className="flex-1"
//             disabled={isProcessing}
//           >
//             <Trash2 className="w-4 h-4 mr-2" />
//             Delete Order
//           </Button>
//         </div>
//       </CardContent>
//     </Card>
//   );

//   return (
//     <>
//       <Card>
//         <CardHeader>
//           <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
//             <div>
//               <CardTitle className="flex items-center gap-2">
//                 <ShoppingBag className="w-6 h-6" />
//                 Order Management
//               </CardTitle>
//               <div className="flex flex-wrap gap-4 text-sm mt-2">
//                 <span className="text-muted-foreground">
//                   Pending: <strong>{pendingOrders.length}</strong>
//                 </span>
//                 <span className="text-muted-foreground">
//                   Active: <strong>{activeOrders.length}</strong>
//                 </span>
//                 <span className="text-muted-foreground">
//                   Completed: <strong>{completedOrders.length}</strong>
//                 </span>
//               </div>
//             </div>
//             <Button
//               onClick={() => setShowFilterDialog(true)}
//               variant="outline"
//               className="w-full sm:w-auto"
//             >
//               <Filter className="w-4 h-4 mr-2" />
//               Filter Orders
//             </Button>
//           </div>
//         </CardHeader>
//         <CardContent>
//           <div className="space-y-6">
//             {pendingOrders.length > 0 && (
//               <div>
//                 <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
//                   <span className="w-3 h-3 rounded-full bg-yellow-500 animate-pulse" />
//                   Pending Orders ({pendingOrders.length})
//                 </h3>
//                 {pendingOrders.map((order) => (
//                   <OrderCard key={order.id} order={order} />
//                 ))}
//               </div>
//             )}

//             {activeOrders.length > 0 && (
//               <div>
//                 <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
//                   <span className="w-3 h-3 rounded-full bg-green-500" />
//                   Active Orders ({activeOrders.length})
//                 </h3>
//                 {activeOrders.map((order) => (
//                   <OrderCard key={order.id} order={order} />
//                 ))}
//               </div>
//             )}

//             {completedOrders.length > 0 && (
//               <div>
//                 <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
//                   <span className="w-3 h-3 rounded-full bg-blue-500" />
//                   Completed Orders ({completedOrders.length})
//                 </h3>
//                 {completedOrders.map((order) => (
//                   <OrderCard key={order.id} order={order} />
//                 ))}
//               </div>
//             )}

//             {filteredOrders.length === 0 && (
//               <div className="text-center py-12">
//                 <ShoppingBag className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
//                 <p className="text-muted-foreground">No orders found</p>
//                 {(filterStartDate ||
//                   filterEndDate ||
//                   filterCustomerName ||
//                   filterStatus) && (
//                   <Button
//                     onClick={clearFilters}
//                     variant="outline"
//                     className="mt-4"
//                   >
//                     Clear Filters
//                   </Button>
//                 )}
//               </div>
//             )}
//           </div>
//         </CardContent>
//       </Card>

//       {/* Filter Dialog */}
//       <Dialog open={showFilterDialog} onOpenChange={setShowFilterDialog}>
//         <DialogContent className="max-w-md bg-transparent shadow-none border-none">
//           <DialogHeader>
//             <DialogTitle>Filter Orders</DialogTitle>
//           </DialogHeader>
//           <div className="space-y-4">
//             {/* <div className="space-y-2">
//               <Label>Start Date</Label>
//               <Input
//                 type="date"
//                 value={filterStartDate}
//                 onChange={(e) => setFilterStartDate(e.target.value)}
//               />
//             </div>
//             <div className="space-y-2">
//               <Label>End Date</Label>
//               <Input
//                 type="date"
//                 value={filterEndDate}
//                 onChange={(e) => setFilterEndDate(e.target.value)}
//               />
//             </div> */}
//             <div className="space-y-2">
//               <Label>Customer Name</Label>
//               <Input
//                 placeholder="Search by customer name"
//                 value={filterCustomerName}
//                 onChange={(e) => setFilterCustomerName(e.target.value)}
//               />
//             </div>
//             <div className="space-y-2">
//               <Label>Status</Label>
//               <div className="relative">
//                 <button
//                   type="button"
//                   onClick={() => setShowStatusDropdown(!showStatusDropdown)}
//                   onBlur={() =>
//                     setTimeout(() => setShowStatusDropdown(false), 200)
//                   }
//                   className="w-full h-10 px-3 py-2 border border-input bg-card text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 flex items-center justify-between"
//                 >
//                   <span className="text-left truncate">
//                     {filterStatus === ""
//                       ? "All Status"
//                       : filterStatus.charAt(0).toUpperCase() +
//                         filterStatus.slice(1)}
//                   </span>
//                   <svg
//                     className={`fill-current h-4 w-4 transition-transform ${
//                       showStatusDropdown ? "rotate-180" : ""
//                     }`}
//                     xmlns="http://www.w3.org/2000/svg"
//                     viewBox="0 0 20 20"
//                   >
//                     <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
//                   </svg>
//                 </button>
//                 {showStatusDropdown && (
//                   <div className="absolute z-50 w-full mt-1 bg-card border border-input rounded-md shadow-lg max-h-60 overflow-auto">
//                     {[
//                       { value: "", label: "All Status" },
//                       { value: "pending", label: "Pending" },
//                       { value: "active", label: "Active" },
//                       // { value: "completed", label: "Completed" },
//                       // { value: "cancelled", label: "Cancelled" },
//                     ].map((option) => (
//                       <div
//                         key={option.value}
//                         onMouseDown={(e) => {
//                           e.preventDefault();
//                           setFilterStatus(option.value);
//                           setShowStatusDropdown(false);
//                         }}
//                         className={`px-3 py-2 cursor-pointer transition-colors ${
//                           filterStatus === option.value
//                             ? "bg-primary text-primary-foreground"
//                             : "hover:bg-primary/10"
//                         }`}
//                       >
//                         {option.label}
//                       </div>
//                     ))}
//                   </div>
//                 )}
//               </div>
//             </div>
//             <div className="flex gap-2">
//               <Button
//                 onClick={clearFilters}
//                 variant="outline"
//                 className="flex-1"
//               >
//                 Clear
//               </Button>
//               <Button onClick={applyFilters} className="flex-1">
//                 Apply Filters
//               </Button>
//             </div>
//           </div>
//         </DialogContent>
//       </Dialog>

//       {/* Delete Confirmation Dialog */}
//       <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
//         <DialogContent className="max-w-md">
//           <DialogHeader>
//             <DialogTitle>Delete Order</DialogTitle>
//           </DialogHeader>
//           <div className="space-y-4">
//             <p>
//               Are you sure you want to delete order{" "}
//               <strong>{orderToDelete?.order_number}</strong>?
//             </p>
//             <p className="text-sm text-muted-foreground">
//               This action cannot be undone.
//             </p>
//             <div className="flex gap-2">
//               <Button
//                 onClick={() => setShowDeleteDialog(false)}
//                 variant="outline"
//                 className="flex-1"
//                 disabled={isProcessing}
//               >
//                 Cancel
//               </Button>
//               <Button
//                 onClick={confirmDelete}
//                 variant="destructive"
//                 className="flex-1"
//                 disabled={isProcessing}
//               >
//                 {isProcessing ? "Deleting..." : "Delete Order"}
//               </Button>
//             </div>
//           </div>
//         </DialogContent>
//       </Dialog>

//       {/* Approve/Alternate Dialog */}
//       <Dialog open={showDialog} onOpenChange={setShowDialog}>
//         <DialogContent className="max-w-md">
//           <DialogHeader>
//             <DialogTitle>
//               {dialogType === "approve"
//                 ? "Approve Order"
//                 : "Send Message to Customer"}
//             </DialogTitle>
//           </DialogHeader>
//           <div className="space-y-4">
//             {dialogType === "approve" ? (
//               <div className="space-y-3">
//                 <p className="font-medium">
//                   Customer will receive complete order details with payment
//                   information:
//                 </p>
//                 <div className="bg-muted p-4 rounded-lg space-y-2 text-sm">
//                   <p>
//                     <strong>Order:</strong> {selectedOrder?.order_number}
//                   </p>
//                   <p>
//                     <strong>Total:</strong> Rs.{" "}
//                     {selectedOrder?.total_amount.toLocaleString()}
//                   </p>
//                   <div className="pt-2 border-t border-border">
//                     <p>
//                       <strong>JazzCash:</strong> {ADMIN_Easypasa}
//                     </p>
//                     <p>
//                       <strong>Account Holder:</strong> {ADMIN_NAME}
//                     </p>
//                     <p>
//                       <strong>WhatsApp:</strong> {ADMIN_WHATSAPP}
//                     </p>
//                   </div>
//                 </div>
//                 <p className="text-sm text-muted-foreground">
//                   Order will be marked as active and customer will be notified
//                   via email.
//                 </p>
//               </div>
//             ) : (
//               <div className="space-y-3">
//                 <p className="text-sm">
//                   Send a message to customer about their order (e.g., product
//                   availability, alternate suggestions):
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
// <style>{`
//         /* ============================================
//            ORDER MANAGEMENT RESPONSIVE STYLES
//            ============================================ */

//         /* Mobile First - Base Styles (320px+) */
//         @media (max-width: 640px) {
//           /* Card header adjustments */
//           .flex.flex-col.sm\\:flex-row.items-start.sm\\:items-center.justify-between {
//             flex-direction: column !important;
//             align-items: flex-start !important;
//             gap: 1rem;
//           }

//           /* Filter button full width on mobile */
//           .flex.flex-col.sm\\:flex-row.items-start.sm\\:items-center.justify-between button {
//             width: 100% !important;
//           }

//           /* Stats counters */
//           .flex.flex-wrap.gap-4.text-sm {
//             gap: 0.75rem !important;
//             font-size: 0.875rem !important;
//           }

//           /* Order card adjustments */
//           .mb-4.border-l-4 {
//             margin-bottom: 1rem !important;
//           }

//           /* Order card header */
//           .flex.flex-col.sm\\:flex-row.sm\\:items-center.justify-between.gap-3 {
//             flex-direction: column !important;
//             align-items: flex-start !important;
//             gap: 0.75rem;
//           }

//           /* Order number and date */
//           .text-lg.flex.items-center.gap-2 {
//             font-size: 1rem !important;
//             flex-wrap: wrap;
//           }

//           .text-sm.text-muted-foreground {
//             font-size: 0.8125rem !important;
//             word-break: break-word;
//           }

//           /* Status badge container */
//           .flex.items-center.gap-3 {
//             width: 100%;
//             justify-content: space-between;
//             flex-wrap: wrap;
//             gap: 0.5rem !important;
//           }

//           /* Auto-activate timer */
//           .text-xs.text-orange-600 {
//             font-size: 0.7rem !important;
//           }

//           /* Customer details section */
//           .p-4.bg-muted\\/50 {
//             padding: 0.875rem !important;
//           }

//           .space-y-3 {
//             gap: 0.75rem !important;
//           }

//           .flex.items-start.gap-3 {
//             gap: 0.75rem !important;
//           }

//           /* Icons in details */
//           .w-5.h-5.text-primary {
//             width: 1.125rem !important;
//             height: 1.125rem !important;
//           }

//           /* Customer info text */
//           .font-semibold.text-sm {
//             font-size: 0.875rem !important;
//           }

//           .text-sm.space-y-1 {
//             font-size: 0.8125rem !important;
//             gap: 0.25rem !important;
//           }

//           .break-words,
//           .break-all {
//             word-break: break-word;
//             overflow-wrap: break-word;
//           }

//           /* Order items section */
//           .space-y-2 {
//             gap: 0.5rem !important;
//           }

//           .flex.justify-between.items-center.p-2 {
//             flex-direction: column !important;
//             align-items: flex-start !important;
//             padding: 0.75rem !important;
//             gap: 0.5rem;
//           }

//           .flex.justify-between.items-center.p-2 > div:first-child {
//             width: 100%;
//           }

//           .flex.justify-between.items-center.p-2 > p {
//             width: 100%;
//             text-align: right;
//           }

//           /* Total amount row */
//           .flex.justify-between.font-bold.text-lg {
//             font-size: 1rem !important;
//             flex-wrap: wrap;
//             gap: 0.5rem;
//           }

//           /* Admin response box */
//           .bg-blue-50,
//           .bg-yellow-50,
//           .dark\\:bg-green-950 {
//             padding: 0.75rem !important;
//           }

//           /* Warning box */
//           .bg-yellow-50.dark\\:bg-yellow-950.p-3 {
//             padding: 0.75rem !important;
//             margin-bottom: 0.75rem !important;
//           }

//           .text-xs.text-yellow-800 {
//             font-size: 0.7rem !important;
//             line-height: 1.4;
//           }

//           /* Action buttons */
//           .flex.flex-col.sm\\:flex-row.gap-2 {
//             flex-direction: column !important;
//             gap: 0.5rem !important;
//           }

//           .flex.flex-col.sm\\:flex-row.gap-2 button {
//             width: 100% !important;
//             flex: none !important;
//             min-height: 44px !important;
//           }

//           /* Payment details box */
//           .dark\\:bg-green-950.p-4 {
//             padding: 0.875rem !important;
//           }

//           .dark\\:bg-green-950.p-4 .text-sm {
//             font-size: 0.8125rem !important;
//           }

//           /* Section headers */
//           .text-lg.font-semibold.mb-3 {
//             font-size: 1rem !important;
//             margin-bottom: 0.75rem !important;
//           }

//           /* Empty state */
//           .text-center.py-12 {
//             padding: 3rem 1rem !important;
//           }

//           .w-16.h-16 {
//             width: 3rem !important;
//             height: 3rem !important;
//           }

//           /* Dialog adjustments */
//           .max-w-md {
//             max-width: calc(100% - 1rem) !important;
//             margin: 0 0.5rem;
//           }

//           /* Dialog content */
//           [class*="DialogContent"] {
//             padding: 1.25rem !important;
//           }

//           /* Filter dialog */
//           .space-y-4 {
//             gap: 0.875rem !important;
//           }

//           .space-y-2 {
//             gap: 0.5rem !important;
//           }

//           /* Input fields */
//           input[type="date"],
//           input[type="text"],
//           select,
//           textarea {
//             font-size: 16px !important; /* Prevents zoom on iOS */
//           }

//           /* Select dropdown */
//           select {
//             padding: 0.625rem !important;
//           }

//           /* Dialog buttons */
//           .flex.gap-2:has(button) {
//             flex-direction: column-reverse !important;
//             gap: 0.5rem !important;
//           }

//           .flex.gap-2 button {
//             width: 100% !important;
//             flex: none !important;
//           }

//           /* Delete dialog */
//           .max-w-md p {
//             font-size: 0.9375rem !important;
//           }

//           /* Approve dialog payment details */
//           .bg-muted.p-4 {
//             padding: 0.875rem !important;
//           }

//           /* Badge styling */
//           [class*="Badge"] {
//             font-size: 0.7rem !important;
//             padding: 0.25rem 0.5rem !important;
//             white-space: nowrap;
//           }

//           /* Status indicator dot */
//           .w-2.h-2.rounded-full {
//             width: 0.375rem !important;
//             height: 0.375rem !important;
//           }

//           /* Pulse animation for pending orders */
//           .animate-pulse {
//             animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
//           }

//           @keyframes pulse {
//             0%, 100% {
//               opacity: 1;
//             }
//             50% {
//               opacity: 0.5;
//             }
//           }

//           /* Print button adjustments */
//           button:has(.lucide-printer) {
//             font-size: 0.875rem !important;
//           }
//         }

//         /* Small tablets (641px - 768px) */
//         @media (min-width: 641px) and (max-width: 768px) {
//           /* Dialog width */
//           .max-w-md {
//             max-width: 90% !important;
//           }

//           /* Order cards */
//           .mb-4.border-l-4 {
//             margin-bottom: 1.25rem !important;
//           }

//           /* Customer details */
//           .p-4.bg-muted\\/50 {
//             padding: 1.25rem !important;
//           }

//           /* Font sizes */
//           .text-lg {
//             font-size: 1.0625rem !important;
//           }

//           .text-sm {
//             font-size: 0.9rem !important;
//           }

//           .text-xs {
//             font-size: 0.8rem !important;
//           }
//         }

//         /* Tablets (769px - 1024px) */
//         @media (min-width: 769px) and (max-width: 1024px) {
//           /* Dialog width */
//           .max-w-md {
//             max-width: 600px !important;
//           }

//           /* Order cards spacing */
//           .space-y-6 {
//             gap: 1.25rem !important;
//           }

//           /* Section spacing */
//           .space-y-4 {
//             gap: 1rem !important;
//           }
//         }

//         /* Landscape mobile devices */
//         @media (max-height: 500px) and (orientation: landscape) {
//           /* Dialog height */
//           [class*="DialogContent"] {
//             max-height: 90vh !important;
//             overflow-y: auto !important;
//           }

//           /* Reduce spacing */
//           .space-y-6 {
//             gap: 1rem !important;
//           }

//           .space-y-4 {
//             gap: 0.75rem !important;
//           }

//           .space-y-3 {
//             gap: 0.5rem !important;
//           }

//           .space-y-2 {
//             gap: 0.375rem !important;
//           }

//           /* Reduce padding */
//           .p-4 {
//             padding: 0.75rem !important;
//           }

//           .p-3 {
//             padding: 0.625rem !important;
//           }

//           /* Empty state */
//           .text-center.py-12 {
//             padding: 2rem 1rem !important;
//           }

//           /* Section headers */
//           .text-lg.font-semibold {
//             font-size: 0.9375rem !important;
//           }
//         }

//         /* Touch device improvements */
//         @media (hover: none) and (pointer: coarse) {
//           /* Minimum touch targets */
//           button,
//           input,
//           select,
//           textarea {
//             min-height: 44px !important;
//           }

//           button[class*="icon"] {
//             min-width: 44px !important;
//             min-height: 44px !important;
//           }

//           /* Increase spacing for easier tapping */
//           .flex.gap-2 {
//             gap: 0.75rem !important;
//           }

//           .flex.gap-3 {
//             gap: 1rem !important;
//           }

//           /* Select options */
//           select option {
//             min-height: 44px !important;
//             padding: 0.75rem !important;
//           }
//         }

//         /* Improve scrolling on iOS */
//         [class*="overflow-y-auto"],
//         [class*="DialogContent"],
//         [class*="CardContent"] {
//           -webkit-overflow-scrolling: touch;
//         }

//         /* Fix for border-l-4 on small screens */
//         @media (max-width: 640px) {
//           .border-l-4 {
//             border-left-width: 3px !important;
//           }
//         }

//         /* Status badge colors - ensure visibility */
//         .bg-yellow-500 {
//           background-color: rgb(234 179 8) !important;
//         }

//         .bg-green-500 {
//           background-color: rgb(34 197 94) !important;
//         }

//         .bg-blue-500 {
//           background-color: rgb(59 130 246) !important;
//         }

//         .bg-red-500 {
//           background-color: rgb(239 68 68) !important;
//         }

//         /* Safe area for notched devices */
//         @supports (padding: max(0px)) {
//           [class*="DialogContent"],
//           [class*="Card"] {
//             padding-left: max(1rem, env(safe-area-inset-left)) !important;
//             padding-right: max(1rem, env(safe-area-inset-right)) !important;
//           }

//           @media (max-width: 640px) {
//             [class*="DialogContent"],
//             [class*="Card"] {
//               padding-bottom: max(1rem, env(safe-area-inset-bottom)) !important;
//             }
//           }
//         }

//         /* Print styles for bill */
//         @media print {
//           body {
//             background: white !important;
//             color: black !important;
//           }

//           .no-print {
//             display: none !important;
//           }

//           button:not(.no-print) {
//             display: none !important;
//           }

//           .space-y-6 > div {
//             break-inside: avoid;
//             page-break-inside: avoid;
//           }

//           .mb-4 {
//             margin-bottom: 1.5rem !important;
//           }
//         }

//         /* Dark mode optimizations */
//         @media (prefers-color-scheme: dark) {
//           /* Dialog shadow */
//           [class*="DialogContent"] {
//             box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5),
//                         0 10px 10px -5px rgba(0, 0, 0, 0.4) !important;
//           }

//           /* Select dropdown background */
//           select {
//             background-color: hsl(var(--background)) !important;
//           }

//           select option {
//             background-color: hsl(var(--background)) !important;
//           }

//           /* Warning boxes */
//           .bg-yellow-50 {
//             background-color: rgba(234, 179, 8, 0.1) !important;
//           }

//           .bg-blue-50 {
//             background-color: rgba(59, 130, 246, 0.1) !important;
//           }
//         }

//         /* Light mode optimizations */
//         @media (prefers-color-scheme: light) {
//           /* Dialog shadow */
//           [class*="DialogContent"] {
//             box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1),
//                         0 10px 10px -5px rgba(0, 0, 0, 0.04) !important;
//           }
//         }

//         /* Textarea in alternate message */
//         textarea {
//           resize: vertical !important;
//           min-height: 100px !important;
//         }

//         @media (max-width: 640px) {
//           textarea {
//             min-height: 80px !important;
//           }
//         }

//         /* Prevent text selection on non-text elements */
//         button,
//         [class*="Badge"] {
//           user-select: none;
//           -webkit-user-select: none;
//         }

//         /* Improve input readability */
//         input,
//         select,
//         textarea {
//           -webkit-appearance: none;
//           appearance: none;
//         }

//         /* Fix for iOS input borders */
//         @supports (-webkit-touch-callout: none) {
//           input,
//           select,
//           textarea {
//             border-radius: 0.375rem;
//           }
//         }

//         /* Accessibility - Reduced motion */
//         @media (prefers-reduced-motion: reduce) {
//           * {
//             animation-duration: 0.01ms !important;
//             animation-iteration-count: 1 !important;
//             transition-duration: 0.01ms !important;
//           }

//           .animate-pulse {
//             animation: none !important;
//           }
//         }

//         /* High contrast mode support */
//         @media (prefers-contrast: high) {
//           .border,
//           .border-border {
//             border-width: 2px !important;
//           }

//           button {
//             border: 2px solid currentColor !important;
//           }

//           [class*="Badge"] {
//             border: 1px solid currentColor !important;
//           }

//           .border-l-4 {
//             border-left-width: 4px !important;
//           }
//         }

//         /* Focus visible styles for keyboard navigation */
//         button:focus-visible,
//         input:focus-visible,
//         select:focus-visible,
//         textarea:focus-visible {
//           outline: 2px solid hsl(var(--primary)) !important;
//           outline-offset: 2px !important;
//         }

//         /* Whitespace handling for long text */
//         .whitespace-pre-wrap {
//           white-space: pre-wrap;
//           word-wrap: break-word;
//         }

//         /* Icon sizing consistency */
//         .lucide {
//           flex-shrink: 0;
//         }

//         /* Card border on mobile */
//         @media (max-width: 640px) {
//           .border-l-primary {
//             border-left-color: hsl(var(--primary)) !important;
//           }
//         }
//       `}</style>;

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../Components/ui/card";
import { Button } from "../../Components/ui/button";
import { Badge } from "../../Components/ui/badge";
import { Textarea } from "../../Components/ui/texarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../Components/ui/dialog";
import { Input } from "../../Components/ui/input";
import { Label } from "../../Components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "../../Components/ui/separator";
import {
  ShoppingBag,
  Check,
  MessageSquare,
  Phone,
  DollarSign,
  User,
  MapPin,
  Printer,
  Trash2,
  Filter,
  X,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  Package,
  RefreshCw,
  Download,
  Mail,
  Calendar,
  CreditCard,
  FileText,
  Eye,
  Search,
} from "lucide-react";
import { supabase } from "@/Integrations/client";

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface ShippingAddress {
  fullName?: string;
  name?: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode?: string;
}

interface Order {
  id: string;
  order_number: string;
  user_id: string;
  status: string;
  total_amount: number;
  items: OrderItem[];
  created_at: string;
  shipping_address?: ShippingAddress;
  profiles?: {
    full_name: string;
    email: string;
  };
  admin_response?: string;
  approved_at?: string;
  payment_id?: string;
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
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showFilterDialog, setShowFilterDialog] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [dialogType, setDialogType] = useState<
    "approve" | "alternate" | "status"
  >("approve");
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);
  const [newStatus, setNewStatus] = useState("");

  // Filter states
  const [filteredOrders, setFilteredOrders] = useState<Order[]>(orders);
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");
  const [filterCustomerName, setFilterCustomerName] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("all");
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);

  const ADMIN_Easypasa = "03241729660";
  const ADMIN_NAME = "Saad";
  const ADMIN_WHATSAPP = "03287337847";

  const ORDER_STATUS_OPTIONS = [
    { value: "pending", label: "Pending" },
    { value: "paid", label: "Confirmed" },
    { value: "processing", label: "Processing" },
    { value: "shipped", label: "Shipped" },
    { value: "delivered", label: "Delivered" },
    { value: "cancelled", label: "Cancelled" },
  ];

  useEffect(() => {
    applyAllFilters();
  }, [
    orders,
    searchQuery,
    filterStatus,
    dateFilter,
    filterCustomerName,
    filterStartDate,
    filterEndDate,
  ]);

  const applyAllFilters = () => {
    let filtered = [...orders];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter((order) => {
        const customerName = getCustomerName(order);
        return (
          order.order_number
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order.shipping_address?.email
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          order.shipping_address?.phone?.includes(searchQuery)
        );
      });
    }

    // Status filter
    if (filterStatus && filterStatus !== "all") {
      filtered = filtered.filter((order) => order.status === filterStatus);
    }

    // Date range filter
    if (filterStartDate) {
      filtered = filtered.filter(
        (order) => new Date(order.created_at) >= new Date(filterStartDate)
      );
    }
    if (filterEndDate) {
      filtered = filtered.filter(
        (order) =>
          new Date(order.created_at) <= new Date(filterEndDate + "T23:59:59")
      );
    }

    // Date filter (today, week, month)
    if (dateFilter && dateFilter !== "all") {
      const today = new Date();
      filtered = filtered.filter((order) => {
        const orderDate = new Date(order.created_at);
        switch (dateFilter) {
          case "today":
            return orderDate.toDateString() === today.toDateString();
          case "week":
            const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
            return orderDate >= weekAgo;
          case "month":
            const monthAgo = new Date(
              today.getTime() - 30 * 24 * 60 * 60 * 1000
            );
            return orderDate >= monthAgo;
          default:
            return true;
        }
      });
    }

    // Customer name filter
    if (filterCustomerName) {
      filtered = filtered.filter((order) => {
        const customerName = getCustomerName(order);
        return customerName
          .toLowerCase()
          .includes(filterCustomerName.toLowerCase());
      });
    }

    setFilteredOrders(filtered);
  };

  const pendingOrders = filteredOrders.filter((o) => o.status === "pending");
  const activeOrders = filteredOrders.filter(
    (o) => o.status === "paid" || o.status === "processing"
  );
  const shippedOrders = filteredOrders.filter((o) => o.status === "shipped");
  const completedOrders = filteredOrders.filter(
    (o) => o.status === "delivered"
  );
  const cancelledOrders = filteredOrders.filter(
    (o) => o.status === "cancelled"
  );

  const orderStats = {
    total: orders.length,
    pending: orders.filter((o) => o.status === "pending").length,
    confirmed: orders.filter((o) => o.status === "paid").length,
    processing: orders.filter((o) => o.status === "processing").length,
    shipped: orders.filter((o) => o.status === "shipped").length,
    delivered: orders.filter((o) => o.status === "delivered").length,
    cancelled: orders.filter((o) => o.status === "cancelled").length,
    totalRevenue: orders
      .filter((o) => o.status === "delivered")
      .reduce((sum, o) => sum + o.total_amount, 0),
  };

  const getCustomerName = (order: Order) => {
    return (
      order.shipping_address?.fullName ||
      order.shipping_address?.name ||
      order.profiles?.full_name ||
      "N/A"
    );
  };

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

  const handleStatusChange = (order: Order) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setDialogType("status");
    setShowDialog(true);
  };

  const handleDeleteOrder = (order: Order) => {
    setOrderToDelete(order);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!orderToDelete) return;

    setIsProcessing(true);
    try {
      // Replace with actual Supabase call:
      // const { error } = await supabase
      //   .from("orders")
      //   .delete()
      //   .eq("id", orderToDelete.id);
      // if (error) throw error;

      toast({
        title: "Order Deleted",
        description: `Order ${orderToDelete.order_number} has been deleted.`,
      });
      onRefresh();
      setShowDeleteDialog(false);
      setOrderToDelete(null);
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

  const confirmApprove = async () => {
    if (!selectedOrder) return;

    setIsProcessing(true);
    try {
      const adminMessage = `Your order has been approved!

PAYMENT DETAILS:
━━━━━━━━━━━━━━━━━━
 Easypasa: ${ADMIN_Easypasa}
 Account Holder: ${ADMIN_NAME}
 WhatsApp: ${ADMIN_WHATSAPP}

ORDER DETAILS:
━━━━━━━━━━━━━━━━━━
Order #: ${selectedOrder.order_number}
Total Amount: Rs. ${selectedOrder.total_amount.toLocaleString()}

Items:
${selectedOrder.items
  .map(
    (item) =>
      ` ${item.name} x ${item.quantity} = Rs. ${(
        item.price * item.quantity
      ).toLocaleString()}`
  )
  .join("\n")}

Please send payment to the above EasyPasa number and share the screenshot on WhatsApp.`;

      // Replace with actual Supabase call:
      const { error } = await supabase
        .from("orders")
        .update({
          status: "paid",
          approved_at: new Date().toISOString(),
          admin_response: adminMessage,
        })
        .eq("id", selectedOrder.id);
      if (error) throw error;

      await supabase.from("notifications").insert({
        user_id: selectedOrder.user_id,
        type: "order_approved",
        title: "Order Approved",
        message: `Your order ${selectedOrder.order_number} has been approved!`,
        metadata: {
          order_id: selectedOrder.id,
          order_number: selectedOrder.order_number,
          payment_details: {
            Easypasa: ADMIN_Easypasa,
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
        description: "Please enter a message",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      // Replace with actual Supabase call:
      const { error } = await supabase
        .from("orders")
        .update({
          admin_response: alternateMessage,
        })
        .eq("id", selectedOrder.id);
      if (error) throw error;

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
        description: `Message sent for order ${selectedOrder.order_number}.`,
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

  const confirmStatusChange = async () => {
    if (!selectedOrder) return;

    setIsProcessing(true);
    try {
      // Replace with actual Supabase call:
      const { error } = await supabase
        .from("orders")
        .update({ status: newStatus })
        .eq("id", selectedOrder.id);
      if (error) throw error;
      // Notify user of status change
      await supabase.from("notifications").insert({
        user_id: selectedOrder.user_id,
        type: "order_status_changed",
        title: "Order Status Updated",
        message: `Your order ${
          selectedOrder.order_number
        } status changed to ${getStatusLabel(newStatus)}`,
        metadata: {
          order_id: selectedOrder.id,
          order_number: selectedOrder.order_number,
          new_status: newStatus,
        },
      });
      toast({
        title: "Status Updated",
        description: `Order status changed to ${getStatusLabel(newStatus)}`,
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

  const handlePrintBill = (order: Order) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const billHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Order Bill - ${order.order_number}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; max-width: 800px; margin: 0 auto; }
            .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 20px; }
            .company-name { font-size: 28px; font-weight: bold; color: #333; }
            .bill-title { font-size: 20px; margin-top: 10px; color: #666; }
            .section { margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
            .section-title { font-weight: bold; font-size: 16px; margin-bottom: 10px; color: #333; border-bottom: 1px solid #eee; padding-bottom: 5px; }
            .info-row { display: flex; justify-content: space-between; padding: 5px 0; }
            .info-label { font-weight: bold; color: #666; }
            table { width: 100%; border-collapse: collapse; margin: 15px 0; }
            th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
            th { background-color: #f5f5f5; font-weight: bold; }
            .total-row { font-weight: bold; font-size: 18px; background-color: #f9f9f9; }
            .payment-info { background-color: #f0f9ff; padding: 15px; border-radius: 5px; margin-top: 20px; }
            .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 2px solid #333; color: #666; }
            @media print { body { padding: 0; } .no-print { display: none; } }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="company-name">SCANGYM</div>
            <div class="bill-title">ORDER INVOICE</div>
          </div>

          <div class="section">
            <div class="section-title">Order Information</div>
            <div class="info-row">
              <span class="info-label">Order Number:</span>
              <span>${order.order_number}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Order Date:</span>
              <span>${new Date(order.created_at).toLocaleString("en-PK", {
                dateStyle: "full",
                timeStyle: "short",
              })}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Status:</span>
              <span style="text-transform: uppercase; font-weight: bold;">${getStatusLabel(
                order.status
              )}</span>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Customer Details</div>
            <div class="info-row">
              <span class="info-label">Name:</span>
              <span>${getCustomerName(order)}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Email:</span>
              <span>${order.shipping_address?.email || "N/A"}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Phone:</span>
              <span>${order.shipping_address?.phone || "N/A"}</span>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Shipping Address</div>
            <p>${order.shipping_address?.address || "N/A"}</p>
            <p>${order.shipping_address?.city || "N/A"}${
      order.shipping_address?.postalCode
        ? ` - ${order.shipping_address.postalCode}`
        : ""
    }</p>
          </div>

          <div class="section">
            <div class="section-title">Order Items</div>
            <table>
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Quantity</th>
                  <th>Price</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                ${order.items
                  .map(
                    (item) => `
                  <tr>
                    <td>${item.name}</td>
                    <td>${item.quantity}</td>
                    <td>Rs. ${item.price.toLocaleString()}</td>
                    <td>Rs. ${(
                      item.price * item.quantity
                    ).toLocaleString()}</td>
                  </tr>
                `
                  )
                  .join("")}
                <tr class="total-row">
                  <td colspan="3" style="text-align: right;">Subtotal:</td>
                  <td>Rs. ${(order.total_amount - 200).toLocaleString()}</td>
                </tr>
                <tr>
                  <td colspan="3" style="text-align: right;">Delivery Fee:</td>
                  <td>Rs. 200</td>
                </tr>
                <tr class="total-row">
                  <td colspan="3" style="text-align: right;">TOTAL AMOUNT:</td>
                  <td>Rs. ${order.total_amount.toLocaleString()}</td>
                </tr>
              </tbody>
            </table>
          </div>

          ${
            order.status === "paid" || order.status === "processing"
              ? `
            <div class="payment-info">
              <div class="section-title">Payment Details</div>
              <div class="info-row">
                <span class="info-label">JazzCash Number:</span>
                <span>${ADMIN_Easypasa}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Account Holder:</span>
                <span>${ADMIN_NAME}</span>
              </div>
              <div class="info-row">
                <span class="info-label">WhatsApp:</span>
                <span>${ADMIN_WHATSAPP}</span>
              </div>
            </div>
          `
              : ""
          }

          <div class="footer">
            <p>Thank you for your order!</p>
            <p>For any queries, contact us at support@scangym.com</p>
          </div>

          <div class="no-print" style="text-align: center; margin-top: 20px;">
            <button onclick="window.print()" style="padding: 10px 20px; background: #333; color: white; border: none; border-radius: 5px; cursor: pointer;">Print Bill</button>
            <button onclick="window.close()" style="padding: 10px 20px; background: #666; color: white; border: none; border-radius: 5px; cursor: pointer; margin-left: 10px;">Close</button>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(billHTML);
    printWindow.document.close();
  };

  const exportToCSV = () => {
    const headers = [
      "Order #",
      "Customer",
      "Phone",
      "Email",
      "City",
      "Address",
      "Items",
      "Total",
      "Status",
      "Date",
    ];
    const rows = filteredOrders.map((order) => [
      order.order_number,
      getCustomerName(order),
      order.shipping_address?.phone || "",
      order.shipping_address?.email || "",
      order.shipping_address?.city || "",
      order.shipping_address?.address || "",
      order.items?.map((i) => `${i.name} x${i.quantity}`).join("; ") || "",
      order.total_amount,
      getStatusLabel(order.status),
      formatDate(order.created_at),
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `orders-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  };

  const clearFilters = () => {
    setFilterStartDate("");
    setFilterEndDate("");
    setFilterCustomerName("");
    setFilterStatus("");
    setSearchQuery("");
    setDateFilter("all");
    setShowFilterDialog(false);
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-yellow-500",
      paid: "bg-blue-500",
      processing: "bg-indigo-500",
      shipped: "bg-purple-500",
      delivered: "bg-green-500",
      cancelled: "bg-red-500",
    };

    return (
      <Badge variant="default" className="flex items-center gap-1.5">
        <span
          className={`w-2 h-2 rounded-full ${colors[status] || "bg-gray-500"}`}
        />
        {getStatusLabel(status)}
      </Badge>
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "paid":
      case "processing":
        return <Package className="w-4 h-4" />;
      case "shipped":
        return <Truck className="w-4 h-4" />;
      case "delivered":
        return <CheckCircle className="w-4 h-4" />;
      case "cancelled":
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusLabel = (status: string) => {
    return (
      ORDER_STATUS_OPTIONS.find((s) => s.value === status)?.label || status
    );
  };

  const formatPrice = (price: number) => {
    return `Rs. ${price.toLocaleString()}`;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-PK", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDateShort = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-PK", {
      month: "short",
      day: "numeric",
    });
  };

  const OrderCard = ({ order }: { order: Order }) => (
    <Card className="mb-4 border-l-4 border-l-primary">
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-primary" />
              {order.order_number}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {formatDate(order.created_at)}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {order.status === "pending" &&
              (() => {
                const orderTime = new Date(order.created_at).getTime();
                const activationTime = orderTime + 24 * 60 * 60 * 1000;
                const timeRemaining = activationTime - Date.now();

                if (timeRemaining <= 0) {
                  return (
                    <p className="text-xs text-orange-600 dark:text-orange-400 flex items-center gap-1 font-medium whitespace-nowrap">
                      ⏰ Will auto-activate soon
                    </p>
                  );
                }

                const hoursLeft = Math.floor(timeRemaining / (1000 * 60 * 60));
                const minutesLeft = Math.floor(
                  (timeRemaining % (1000 * 60 * 60)) / (1000 * 60)
                );

                return (
                  <p className="text-xs text-orange-600 dark:text-orange-400 flex items-center gap-1 font-medium whitespace-nowrap">
                    ⏰ Auto-activates in {hoursLeft}h {minutesLeft}m
                  </p>
                );
              })()}
            {getStatusBadge(order.status)}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 bg-muted/50 rounded-lg space-y-3">
          <div className="flex items-start gap-3">
            <User className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm mb-1">Customer Details</p>
              <div className="text-sm space-y-1">
                <p className="font-medium break-words">
                  {getCustomerName(order)}
                </p>
                <p className="text-muted-foreground break-all">
                  {order.shipping_address?.email}
                </p>
                <p className="text-muted-foreground">
                  📱 {order.shipping_address?.phone}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3 pt-3 border-t border-border">
            <MapPin className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm mb-1">Shipping Address</p>
              <div className="text-sm space-y-1">
                <p className="break-words">{order.shipping_address?.address}</p>
                <p>
                  {order.shipping_address?.city}
                  {order.shipping_address?.postalCode &&
                    ` - ${order.shipping_address.postalCode}`}
                </p>
              </div>
            </div>
          </div>
        </div>

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
                <div className="flex-1 min-w-0 pr-2">
                  <p className="font-medium text-sm break-words">{item.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Quantity: {item.quantity} × Rs.{" "}
                    {item.price.toLocaleString()}
                  </p>
                </div>
                <p className="font-semibold whitespace-nowrap">
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

        {order.status === "pending" && (
          <div className="space-y-2">
            <div className="bg-yellow-50 dark:bg-yellow-950 p-3 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <p className="text-xs text-yellow-800 dark:text-yellow-200">
                ⚠️ This order will be automatically approved after 24 hours if
                no action is taken.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
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
          </div>
        )}

        {(order.status === "paid" || order.status === "processing") && (
          <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg border border-green-200 dark:border-green-800 space-y-2">
            <p className="text-sm font-semibold flex items-center gap-2">
              Payment Details Sent to customer
            </p>
            <div className="text-sm space-y-1">
              <p>
                <strong>EasyPasa:</strong> {ADMIN_Easypasa}
              </p>
              <p>
                <strong>Account Holder:</strong> {ADMIN_NAME}
              </p>
              <p className="flex items-center gap-2">
                <strong>WhatsApp:</strong> {ADMIN_WHATSAPP}
              </p>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-2 pt-2">
          <Button
            onClick={() => {
              setSelectedOrder(order);
              setShowDetailDialog(true);
            }}
            variant="outline"
            className="flex-1"
          >
            <Eye className="w-4 h-4 mr-2" />
            View Details
          </Button>
          {(order.status === "paid" ||
            order.status === "processing" ||
            order.status === "shipped" ||
            order.status === "delivered") && (
            <Button
              onClick={() => handlePrintBill(order)}
              variant="outline"
              className="flex-1"
            >
              <Printer className="w-4 h-4 mr-2" />
              Print Bill
            </Button>
          )}
          <Button
            onClick={() => handleStatusChange(order)}
            variant="outline"
            className="flex-1"
          >
            <Package className="w-4 h-4 mr-2" />
            Update Status
          </Button>
          <Button
            onClick={() => handleDeleteOrder(order)}
            variant="destructive"
            className="flex-1"
            disabled={isProcessing}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="w-full">
              <CardTitle className="flex items-center gap-2 mb-4">
                <ShoppingBag className="w-6 h-6" />
                Order Management
              </CardTitle>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full">
                <div className="bg-muted/50 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold">{orderStats.total}</p>
                  <p className="text-xs text-muted-foreground">Total</p>
                </div>
                <div className="bg-yellow-500/10 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-yellow-600">
                    {orderStats.pending}
                  </p>
                  <p className="text-xs text-muted-foreground">Pending</p>
                </div>
                <div className="bg-blue-500/10 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-blue-600">
                    {orderStats.confirmed}
                  </p>
                  <p className="text-xs text-muted-foreground">Confirmed</p>
                </div>
                <div className="bg-indigo-500/10 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-indigo-600">
                    {orderStats.processing}
                  </p>
                  <p className="text-xs text-muted-foreground">Processing</p>
                </div>
                <div className="bg-purple-500/10 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-purple-600">
                    {orderStats.shipped}
                  </p>
                  <p className="text-xs text-muted-foreground">Shipped</p>
                </div>
                <div className="bg-green-500/10 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-green-600">
                    {orderStats.delivered}
                  </p>
                  <p className="text-xs text-muted-foreground">Delivered</p>
                </div>
                <div className="bg-red-500/10 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-red-600">
                    {orderStats.cancelled}
                  </p>
                  <p className="text-xs text-muted-foreground">Cancelled</p>
                </div>
                <div className="bg-primary/10 rounded-lg p-3 text-center">
                  <p className="text-xl font-bold text-primary">
                    {formatPrice(orderStats.totalRevenue)}
                  </p>
                  <p className="text-xs text-muted-foreground">Revenue</p>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by order #, name, email, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="relative w-full md:w-40">
              <button
                type="button"
                onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                onBlur={() =>
                  setTimeout(() => setShowStatusDropdown(false), 200)
                }
                className="w-full h-10 px-3 py-2 border border-input bg-card text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 flex items-center justify-between"
              >
                <span className="text-left truncate">
                  {filterStatus === "" || filterStatus === "all"
                    ? "All Statuses"
                    : getStatusLabel(filterStatus)}
                </span>
                <svg
                  className={`fill-current h-4 w-4 transition-transform ${
                    showStatusDropdown ? "rotate-180" : ""
                  }`}
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
              </button>
              {showStatusDropdown && (
                <div className="absolute z-50 w-full mt-1 bg-card border border-input rounded-md shadow-lg max-h-60 overflow-auto">
                  <div
                    onMouseDown={(e) => {
                      e.preventDefault();
                      setFilterStatus("all");
                      setShowStatusDropdown(false);
                    }}
                    className={`px-3 py-2 cursor-pointer transition-colors ${
                      filterStatus === "all" || filterStatus === ""
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-primary/10"
                    }`}
                  >
                    All Statuses
                  </div>
                  {ORDER_STATUS_OPTIONS.map((option) => (
                    <div
                      key={option.value}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setFilterStatus(option.value);
                        setShowStatusDropdown(false);
                      }}
                      className={`px-3 py-2 cursor-pointer transition-colors ${
                        filterStatus === option.value
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-primary/10"
                      }`}
                    >
                      {option.label}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Button
              variant="outline"
              onClick={exportToCSV}
              className="w-full md:w-auto"
            >
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
            <Button
              variant="outline"
              onClick={onRefresh}
              className="w-full md:w-auto"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>

          <div className="space-y-6">
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

            {activeOrders.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-blue-500" />
                  Active Orders ({activeOrders.length})
                </h3>
                {activeOrders.map((order) => (
                  <OrderCard key={order.id} order={order} />
                ))}
              </div>
            )}

            {shippedOrders.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-purple-500" />
                  Shipped Orders ({shippedOrders.length})
                </h3>
                {shippedOrders.map((order) => (
                  <OrderCard key={order.id} order={order} />
                ))}
              </div>
            )}

            {completedOrders.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-green-500" />
                  Completed Orders ({completedOrders.length})
                </h3>
                {completedOrders.map((order) => (
                  <OrderCard key={order.id} order={order} />
                ))}
              </div>
            )}

            {cancelledOrders.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-red-500" />
                  Cancelled Orders ({cancelledOrders.length})
                </h3>
                {cancelledOrders.map((order) => (
                  <OrderCard key={order.id} order={order} />
                ))}
              </div>
            )}

            {filteredOrders.length === 0 && (
              <div className="text-center py-12">
                <ShoppingBag className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No orders found</p>
                {(searchQuery ||
                  filterStartDate ||
                  filterEndDate ||
                  filterCustomerName ||
                  (filterStatus && filterStatus !== "all")) && (
                  <Button
                    onClick={clearFilters}
                    variant="outline"
                    className="mt-4"
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Filter Dialog */}
      <Dialog open={showFilterDialog} onOpenChange={setShowFilterDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Filter Orders</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Input
                type="date"
                value={filterStartDate}
                onChange={(e) => setFilterStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>End Date</Label>
              <Input
                type="date"
                value={filterEndDate}
                onChange={(e) => setFilterEndDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Customer Name</Label>
              <Input
                placeholder="Search by customer name"
                value={filterCustomerName}
                onChange={(e) => setFilterCustomerName(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={clearFilters}
                variant="outline"
                className="flex-1"
              >
                Clear
              </Button>
              <Button
                onClick={() => setShowFilterDialog(false)}
                className="flex-1"
              >
                Apply Filters
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Order</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>
              Are you sure you want to delete order{" "}
              <strong>{orderToDelete?.order_number}</strong>?
            </p>
            <p className="text-sm text-muted-foreground">
              This action cannot be undone.
            </p>
            <div className="flex gap-2">
              <Button
                onClick={() => setShowDeleteDialog(false)}
                variant="outline"
                className="flex-1"
                disabled={isProcessing}
              >
                Cancel
              </Button>
              <Button
                onClick={confirmDelete}
                variant="destructive"
                className="flex-1"
                disabled={isProcessing}
              >
                {isProcessing ? "Deleting..." : "Delete Order"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Order Details Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Order #{selectedOrder?.order_number}
            </DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6">
              {/* Status & Actions */}
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  {getStatusBadge(selectedOrder.status)}
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {formatDate(selectedOrder.created_at)}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePrintBill(selectedOrder)}
                >
                  <Printer className="w-4 h-4 mr-2" />
                  Print Invoice
                </Button>
              </div>

              {/* Payment Method */}
              <div className="flex items-center gap-3 p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                <CreditCard className="w-5 h-5 text-green-600" />
                <div>
                  <p className="font-medium text-green-700 dark:text-green-400">
                    Cash on Delivery
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Payment to be collected on delivery
                  </p>
                </div>
              </div>

              {/* Customer Info */}
              <div className="bg-muted/50 rounded-lg p-4">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Customer & Shipping
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Name</p>
                    <p className="font-medium">
                      {getCustomerName(selectedOrder)}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Phone</p>
                    <p className="font-medium flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      {selectedOrder.shipping_address?.phone || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Email</p>
                    <p className="font-medium flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      {selectedOrder.shipping_address?.email || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">City</p>
                    <p className="font-medium">
                      {selectedOrder.shipping_address?.city || "N/A"}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-muted-foreground">Address</p>
                    <p className="font-medium">
                      {selectedOrder.shipping_address?.address || "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  Order Items
                </h4>
                <div className="space-y-3">
                  {selectedOrder.items?.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between py-3 border-b border-border last:border-0"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded bg-muted flex items-center justify-center">
                          <Package className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatPrice(item.price)} × {item.quantity}
                          </p>
                        </div>
                      </div>
                      <p className="font-semibold">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="border-t mt-4 pt-4 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatPrice(selectedOrder.total_amount - 200)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Delivery Fee</span>
                    <span>Rs. 200</span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between pt-2">
                    <span className="font-semibold">Total</span>
                    <span className="text-xl font-bold text-primary">
                      {formatPrice(selectedOrder.total_amount)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-4 border-t">
                <Button
                  onClick={() => {
                    setShowDetailDialog(false);
                    handleStatusChange(selectedOrder);
                  }}
                  className="flex-1"
                >
                  <Package className="w-4 h-4 mr-2" />
                  Update Status
                </Button>
                <Button
                  onClick={() => {
                    setShowDetailDialog(false);
                    handleAlternate(selectedOrder);
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Send Message
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Approve/Alternate/Status Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {dialogType === "approve"
                ? "Approve Order"
                : dialogType === "alternate"
                ? "Send Message to Customer"
                : "Update Order Status"}
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
                      <strong>JazzCash:</strong> {ADMIN_Easypasa}
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
                  Order will be marked as confirmed and customer will be
                  notified.
                </p>
              </div>
            ) : dialogType === "alternate" ? (
              <div className="space-y-3">
                <p className="text-sm">
                  Send a message to customer about their order:
                </p>
                <Textarea
                  placeholder="e.g., The requested product is out of stock. We have a similar alternative available..."
                  value={alternateMessage}
                  onChange={(e) => setAlternateMessage(e.target.value)}
                  rows={5}
                />
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm">
                  Select new status for order {selectedOrder?.order_number}:
                </p>
                <div className="space-y-2">
                  {ORDER_STATUS_OPTIONS.map((status) => (
                    <button
                      key={status.value}
                      onClick={() => setNewStatus(status.value)}
                      className={`w-full p-3 rounded-lg border-2 transition-all flex items-center gap-3 ${
                        newStatus === status.value
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      {getStatusIcon(status.value)}
                      <span className="font-medium">{status.label}</span>
                    </button>
                  ))}
                </div>
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
                  dialogType === "approve"
                    ? confirmApprove
                    : dialogType === "alternate"
                    ? confirmAlternate
                    : confirmStatusChange
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
