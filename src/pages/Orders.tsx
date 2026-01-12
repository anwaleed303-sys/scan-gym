import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { supabase } from "../Integrations/client";
import Navbar from "../Components/layout/Navbar";
import Footer from "../Components/layout/Footer";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../Components/ui/card";
import { Badge } from "../Components/ui/badge";
import { Button } from "../Components/ui/button";
import {
  Package,
  Clock,
  CheckCircle,
  XCircle,
  ArrowLeft,
  ShoppingBag,
  Edit,
  Trash2,
  DollarSign,
  Phone,
  Printer,
} from "lucide-react";
import { Skeleton } from "../Components/ui/skeleton";
import { useToast } from "../hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../Components/ui/dialog";
import { Input } from "../Components/ui/input";
import { Label } from "../Components/ui/label";

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface Order {
  id: string;
  order_number: string;
  status: string;
  total_amount: number;
  items: OrderItem[];
  created_at: string;
  admin_response?: string;
  approved_at?: string;
  shipping_address?: {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    postalCode: string;
  };
}

const Orders = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [editedAddress, setEditedAddress] = useState<any>(null);

  const ADMIN_JAZZCASH = "Easypasa";
  const ADMIN_NAME = "Saad";
  const ADMIN_WHATSAPP = "03241729660";
  // Helper function to check if 24 hours have passed
  const hasPassedAutoActivationTime = (orderDate: string) => {
    const orderTime = new Date(orderDate).getTime();
    const currentTime = new Date().getTime();
    const hoursPassed = (currentTime - orderTime) / (1000 * 60 * 60);
    return hoursPassed >= 24;
  };

  // Helper function to get countdown message
  const getOrderStatusMessage = (order: Order) => {
    if (order.status !== "pending") return null;

    const orderTime = new Date(order.created_at).getTime();
    const currentTime = new Date().getTime();
    const hoursRemaining = 24 - (currentTime - orderTime) / (1000 * 60 * 60);

    if (hoursRemaining <= 0) {
      return "⏰ Order will be activated automatically soon...";
    }

    const hours = Math.floor(hoursRemaining);
    const minutes = Math.floor((hoursRemaining - hours) * 60);

    return `⏰ Auto-activates in ${hours}h ${minutes}m`;
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      navigate("/shop");
      toast({
        title: "Login Required",
        description: "Please login to view your orders.",
      });
    }

    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching orders:", error);
    } else {
      const parsedOrders: Order[] = (data || []).map((order: any) => ({
        id: order.id,
        order_number: order.order_number,
        status: order.status,
        total_amount: order.total_amount,
        created_at: order.created_at,
        items: order.items as OrderItem[],
        admin_response: order.admin_response,
        approved_at: order.approved_at,
        shipping_address: order.shipping_address as any,
      }));
      setOrders(parsedOrders);
    }
    setLoading(false);
  };

  const canEditOrCancel = (orderDate: string) => {
    const orderTime = new Date(orderDate).getTime();
    const currentTime = new Date().getTime();
    const hoursDiff = (currentTime - orderTime) / (1000 * 60 * 60);
    return hoursDiff < 24;
  };

  const handleEditOrder = (order: Order) => {
    setEditingOrder(order);
    setEditedAddress(order.shipping_address);
  };

  const handleSaveEdit = async () => {
    if (!editingOrder || !editedAddress) return;

    const { error } = await supabase
      .from("orders")
      .update({
        shipping_address: editedAddress,
      })
      .eq("id", editingOrder.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update order",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Order Updated",
      description: "Your shipping address has been updated.",
    });

    setEditingOrder(null);
    fetchOrders();
  };

  const handleCancelOrder = async (orderId: string, orderNumber: string) => {
    const { error } = await supabase
      .from("orders")
      .update({ status: "cancelled" })
      .eq("id", orderId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to cancel order",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Order Cancelled",
      description: `Order ${orderNumber} has been cancelled.`,
    });

    fetchOrders();
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
              <span>${order.shipping_address?.fullName || "N/A"}</span>
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
                <span>${ADMIN_JAZZCASH}</span>
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

  const formatPrice = (price: number) => {
    return `Rs. ${price.toLocaleString()}`;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-PK", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "active":
        return <CheckCircle className="w-4 h-4" />;
      case "completed":
        return <CheckCircle className="w-4 h-4" />;
      case "cancelled":
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "secondary";
      case "active":
        return "default";
      case "completed":
        return "default";
      case "cancelled":
        return "destructive";
      default:
        return "secondary";
    }
  };

  return (
    <>
      <Helmet>
        <title>My Orders - ScanGym</title>
        <meta
          name="description"
          content="View your order history and track your purchases from ScanGym Shop."
        />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between gap-4 mb-8 w-full">
              <Button
                variant="outline"
                size="icon"
                onClick={() => navigate("/shop")}
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div>
                <h1 className="font-display text-3xl font-bold text-foreground">
                  My Orders
                </h1>
                <p className="text-muted-foreground">
                  Track your shop purchases
                </p>
              </div>
              <Button
                variant="outline"
                className="ml-auto"
                onClick={async () => {
                  await supabase.auth.signOut();
                  navigate("/shop");
                  toast({
                    title: "Logged Out",
                    description: "You have been successfully logged out.",
                  });
                }}
                style={{ marginRight: "40px" }}
              >
                Logout
              </Button>
            </div>

            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i}>
                    <CardHeader>
                      <Skeleton className="h-6 w-48" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-20 w-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : orders.length === 0 ? (
              <Card className="text-center py-16">
                <CardContent>
                  <ShoppingBag className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h2 className="text-xl font-semibold mb-2">No orders yet</h2>
                  <p className="text-muted-foreground mb-6">
                    You haven't placed any orders yet. Start shopping now!
                  </p>
                  <Button onClick={() => navigate("/shop")}>Browse Shop</Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <Card key={order.id}>
                    <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div>
                        <CardTitle className="text-lg">
                          Order #{order.order_number}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(order.created_at)}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        {order.status === "pending" && (
                          <p className="text-xs text-yellow-600 dark:text-yellow-400 font-medium whitespace-nowrap">
                            {getOrderStatusMessage(order)}
                          </p>
                        )}
                        <Badge
                          variant={
                            getStatusColor(order.status) as
                              | "default"
                              | "secondary"
                              | "destructive"
                          }
                          className="flex items-center gap-1"
                        >
                          {getStatusIcon(order.status)}
                          {order.status.charAt(0).toUpperCase() +
                            order.status.slice(1)}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="p-3 bg-muted rounded-lg">
                          <h4 className="font-semibold text-sm mb-2">
                            Shipping Address
                          </h4>
                          <div className="text-sm space-y-1">
                            <p>{order.shipping_address?.fullName}</p>
                            <p>{order.shipping_address?.phone}</p>
                            <p>{order.shipping_address?.address}</p>
                            <p>
                              {order.shipping_address?.city}
                              {order.shipping_address?.postalCode &&
                                ` - ${order.shipping_address.postalCode}`}
                            </p>
                          </div>
                        </div>

                        {order.items.map((item, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between py-2 border-b border-border last:border-0"
                          >
                            <div className="flex-1 min-w-0 pr-2">
                              <p className="font-medium break-words">
                                {item.name}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Qty: {item.quantity}
                              </p>
                            </div>
                            <p className="font-semibold whitespace-nowrap">
                              {formatPrice(item.price * item.quantity)}
                            </p>
                          </div>
                        ))}
                        <div className="flex items-center justify-between pt-2 border-t border-border">
                          <span className="font-semibold">Total</span>
                          <span className="text-lg font-bold text-primary">
                            {formatPrice(order.total_amount)}
                          </span>
                        </div>
                      </div>

                      {order.admin_response && (
                        <div className="mt-4 p-4 bg-muted rounded-lg">
                          <h4 className="font-semibold text-sm mb-2">
                            {order.admin_response.includes(
                              "automatically approved"
                            )
                              ? "✅ Auto-Approved (24 hours passed)"
                              : "Admin Response:"}
                          </h4>
                          <p className="text-sm whitespace-pre-wrap break-words">
                            {order.admin_response}
                          </p>
                        </div>
                      )}

                      {/* {order.status === "active" && (
                        // <div className="mt-4 p-4 dark:bg-green-950 rounded-lg">
                        //   <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                        //     <DollarSign className="w-4 h-4" />
                        //     Payment Details
                        //   </h4>
                        //   <div className="text-sm space-y-1">
                        //     <p>
                        //       <strong>JazzCash:</strong> {ADMIN_JAZZCASH}
                        //     </p>
                        //     <p>
                        //       <strong>Account Holder:</strong> {ADMIN_NAME}
                        //     </p>
                        //     <p className="flex items-center gap-2">
                        //       <Phone className="w-4 h-4" />
                        //       <strong>WhatsApp:</strong> {ADMIN_WHATSAPP}
                        //     </p>
                        //   </div>
                        //   <p className="text-xs text-muted-foreground mt-2">
                        //     Please send payment and share screenshot on WhatsApp
                        //   </p>
                        // </div>
                      )} */}

                      <div className="flex flex-col sm:flex-row gap-2 mt-4">
                        {(order.status === "active" ||
                          order.status === "completed") && (
                          <Button
                            onClick={() => handlePrintBill(order)}
                            variant="outline"
                            size="sm"
                            className="flex-1"
                          >
                            <Printer className="w-4 h-4 mr-2" />
                            Print Bill
                          </Button>
                        )}

                        {order.status === "pending" &&
                          canEditOrCancel(order.created_at) && (
                            <>
                              <div className="bg-yellow-50 dark:bg-yellow-950 p-3 rounded-lg border border-yellow-200 dark:border-yellow-800 text-xs">
                                <p className="text-xs text-yellow-800 dark:text-yellow-200">
                                  ⚠️ You can edit or cancel this order within 24
                                  hours. After that, it will be automatically
                                  approved.
                                </p>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditOrder(order)}
                                className="flex-1"
                              >
                                <Edit className="w-4 h-4 mr-2" />
                                Edit Address
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() =>
                                  handleCancelOrder(
                                    order.id,
                                    order.order_number
                                  )
                                }
                                className="flex-1"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Cancel Order
                              </Button>
                            </>
                          )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </main>
        <Footer />
      </div>

      <Dialog
        open={!!editingOrder}
        onOpenChange={(open) => !open && setEditingOrder(null)}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Shipping Address</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input
                value={editedAddress?.fullName || ""}
                onChange={(e) =>
                  setEditedAddress((prev: any) => ({
                    ...prev,
                    fullName: e.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input
                value={editedAddress?.phone || ""}
                onChange={(e) =>
                  setEditedAddress((prev: any) => ({
                    ...prev,
                    phone: e.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Address</Label>
              <Input
                value={editedAddress?.address || ""}
                onChange={(e) =>
                  setEditedAddress((prev: any) => ({
                    ...prev,
                    address: e.target.value,
                  }))
                }
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>City</Label>
                <Input
                  value={editedAddress?.city || ""}
                  onChange={(e) =>
                    setEditedAddress((prev: any) => ({
                      ...prev,
                      city: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Postal Code</Label>
                <Input
                  value={editedAddress?.postalCode || ""}
                  onChange={(e) =>
                    setEditedAddress((prev: any) => ({
                      ...prev,
                      postalCode: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setEditingOrder(null)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button onClick={handleSaveEdit} className="flex-1">
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Orders;
