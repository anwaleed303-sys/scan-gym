import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Textarea } from "../ui/texarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
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
  Printer,
  Trash2,
  Filter,
  X,
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
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showFilterDialog, setShowFilterDialog] = useState(false);
  const [dialogType, setDialogType] = useState<"approve" | "alternate">(
    "approve"
  );
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);

  // Filter states
  const [filteredOrders, setFilteredOrders] = useState<Order[]>(orders);
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");
  const [filterCustomerName, setFilterCustomerName] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const ADMIN_Easypasa = "03241729660";
  const ADMIN_NAME = "Saad";
  const ADMIN_WHATSAPP = "03287337847";

  useEffect(() => {
    setFilteredOrders(orders);
  }, [orders]);

  const pendingOrders = filteredOrders.filter((o) => o.status === "pending");
  const activeOrders = filteredOrders.filter((o) => o.status === "active");
  const completedOrders = filteredOrders.filter(
    (o) => o.status === "completed"
  );

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

  const handleDeleteOrder = (order: Order) => {
    setOrderToDelete(order);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!orderToDelete) return;

    setIsProcessing(true);
    try {
      const { error } = await supabase
        .from("orders")
        .delete()
        .eq("id", orderToDelete.id);

      if (error) throw error;

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

  const handlePrintBill = (order: Order) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const billHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Order Bill - ${order.order_number}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 20px;
              max-width: 800px;
              margin: 0 auto;
            }
            .header {
              text-align: center;
              border-bottom: 2px solid #333;
              padding-bottom: 20px;
              margin-bottom: 20px;
            }
            .company-name {
              font-size: 28px;
              font-weight: bold;
              color: #333;
            }
            .bill-title {
              font-size: 20px;
              margin-top: 10px;
              color: #666;
            }
            .section {
              margin: 20px 0;
              padding: 15px;
              border: 1px solid #ddd;
              border-radius: 5px;
            }
            .section-title {
              font-weight: bold;
              font-size: 16px;
              margin-bottom: 10px;
              color: #333;
              border-bottom: 1px solid #eee;
              padding-bottom: 5px;
            }
            .info-row {
              display: flex;
              justify-content: space-between;
              padding: 5px 0;
            }
            .info-label {
              font-weight: bold;
              color: #666;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 15px 0;
            }
            th, td {
              padding: 12px;
              text-align: left;
              border-bottom: 1px solid #ddd;
            }
            th {
              background-color: #f5f5f5;
              font-weight: bold;
            }
            .total-row {
              font-weight: bold;
              font-size: 18px;
              background-color: #f9f9f9;
            }
            .payment-info {
              background-color: #f0f9ff;
              padding: 15px;
              border-radius: 5px;
              margin-top: 20px;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              padding-top: 20px;
              border-top: 2px solid #333;
              color: #666;
            }
            @media print {
              body {
                padding: 0;
              }
              .no-print {
                display: none;
              }
            }
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
              <span style="text-transform: uppercase; font-weight: bold;">${
                order.status
              }</span>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Customer Details</div>
            <div class="info-row">
              <span class="info-label">Name:</span>
              <span>${
                order.shipping_address?.fullName ||
                order.profiles?.full_name ||
                "N/A"
              }</span>
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
                  <td colspan="3" style="text-align: right;">TOTAL AMOUNT:</td>
                  <td>Rs. ${order.total_amount.toLocaleString()}</td>
                </tr>
              </tbody>
            </table>
          </div>

          ${
            order.status === "active"
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

  const applyFilters = () => {
    let filtered = [...orders];

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

    if (filterCustomerName) {
      filtered = filtered.filter((order) => {
        const customerName =
          order.shipping_address?.fullName || order.profiles?.full_name || "";
        return customerName
          .toLowerCase()
          .includes(filterCustomerName.toLowerCase());
      });
    }

    if (filterStatus) {
      filtered = filtered.filter((order) => order.status === filterStatus);
    }

    setFilteredOrders(filtered);
    setShowFilterDialog(false);
  };

  const clearFilters = () => {
    setFilterStartDate("");
    setFilterEndDate("");
    setFilterCustomerName("");
    setFilterStatus("");
    setFilteredOrders(orders);
    setShowFilterDialog(false);
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

  Please send payment to the above EasyPasa number and share the screenshot on WhatsApp. Your order will be processed once payment is confirmed.`;

      const { error } = await supabase
        .from("orders")
        .update({
          status: "active",
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-primary" />
              {order.order_number}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {new Date(order.created_at).toLocaleString("en-PK", {
                dateStyle: "full",
                timeStyle: "short",
              })}
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
                  {order.shipping_address?.fullName ||
                    order.profiles?.full_name}
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

        {/* {order.admin_response && (
          <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm font-semibold mb-1 flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Admin Response:
            </p>
            <p className="text-sm whitespace-pre-wrap break-words">
              {order.admin_response}
            </p>
          </div>
        )} */}

        {order.status === "pending" && (
          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <div className="bg-yellow-50 dark:bg-yellow-950 p-3 rounded-lg border border-yellow-200 dark:border-yellow-800 mb-2">
              <p className="text-xs text-yellow-800 dark:text-yellow-200">
                ⚠️ This order will be automatically approved after 24 hours if
                no action is taken.
              </p>
            </div>
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
          <div className=" dark:bg-green-950 p-4 rounded-lg border border-green-200 dark:border-green-800 space-y-2">
            <p className="text-sm font-semibold flex items-center gap-2">
              {/* <DollarSign className="w-4 h-4" /> */}
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
                {/* <Phone className="w-4 h-4" /> */}
                <strong>WhatsApp:</strong> {ADMIN_WHATSAPP}
              </p>
            </div>
            {/* <p className="text-xs text-muted-foreground mt-2">
              Waiting for customer payment confirmation
            </p> */}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-2 pt-2">
          {(order.status === "active" || order.status === "completed") && (
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
            onClick={() => handleDeleteOrder(order)}
            variant="destructive"
            className="flex-1"
            disabled={isProcessing}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Order
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
            <div>
              <CardTitle className="flex items-center gap-2">
                <ShoppingBag className="w-6 h-6" />
                Order Management
              </CardTitle>
              <div className="flex flex-wrap gap-4 text-sm mt-2">
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
            </div>
            <Button
              onClick={() => setShowFilterDialog(true)}
              variant="outline"
              className="w-full sm:w-auto"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filter Orders
            </Button>
          </div>
        </CardHeader>
        <CardContent>
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
                  <span className="w-3 h-3 rounded-full bg-green-500" />
                  Active Orders ({activeOrders.length})
                </h3>
                {activeOrders.map((order) => (
                  <OrderCard key={order.id} order={order} />
                ))}
              </div>
            )}

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

            {filteredOrders.length === 0 && (
              <div className="text-center py-12">
                <ShoppingBag className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No orders found</p>
                {(filterStartDate ||
                  filterEndDate ||
                  filterCustomerName ||
                  filterStatus) && (
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
        <DialogContent className="max-w-md bg-transparent shadow-none border-none">
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
            <div className="space-y-2">
              <Label>Status</Label>
              <select
                className="w-full p-2 border rounded-md bg-transparent"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                style={{
                  backgroundColor: "transparent",
                }}
              >
                <option
                  value=""
                  style={{
                    backgroundColor: "black",
                  }}
                >
                  All Status
                </option>
                <option
                  value="pending"
                  style={{
                    backgroundColor: "black",
                  }}
                >
                  Pending
                </option>
                <option
                  value="active"
                  style={{
                    backgroundColor: "black",
                  }}
                >
                  Active
                </option>
                <option
                  value="completed"
                  style={{
                    backgroundColor: "black",
                  }}
                >
                  Completed
                </option>
                <option
                  value="cancelled"
                  style={{
                    backgroundColor: "black",
                  }}
                >
                  Cancelled
                </option>
              </select>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={clearFilters}
                variant="outline"
                className="flex-1"
              >
                Clear
              </Button>
              <Button onClick={applyFilters} className="flex-1">
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

      {/* Approve/Alternate Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-md">
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
