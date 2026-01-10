// import { useState, useEffect } from "react";
// import { Helmet } from "react-helmet-async";
// import { useNavigate } from "react-router-dom";
// import { supabase } from "../Integrations/client";
// import Navbar from "../Components/layout/Navbar";
// import Footer from "../Components/layout/Footer";
// import {
//   Card,
//   CardContent,
//   CardHeader,
//   CardTitle,
// } from "../Components/ui/card";
// import { Badge } from "../Components/ui/badge";
// import { Button } from "../Components/ui/button";
// import {
//   Package,
//   Clock,
//   CheckCircle,
//   XCircle,
//   Truck,
//   ArrowLeft,
//   ShoppingBag,
// } from "lucide-react";
// import { Skeleton } from "../Components/ui/skeleton";

// interface OrderItem {
//   id: string;
//   name: string;
//   price: number;
//   quantity: number;
// }

// interface Order {
//   id: string;
//   order_number: string;
//   status: string;
//   total_amount: number;
//   items: OrderItem[];
//   created_at: string;
//   admin_response?: string;
//   approved_at?: string;
//   shipping_address?: {
//     fullName: string;
//     email: string;
//     phone: string;
//     address: string;
//     city: string;
//     postalCode: string;
//   };
// }

// const Orders = () => {
//   const navigate = useNavigate();
//   const [orders, setOrders] = useState<Order[]>([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     fetchOrders();
//   }, []);

//   const fetchOrders = async () => {
//     const {
//       data: { user },
//     } = await supabase.auth.getUser();

//     if (!user) {
//       navigate("/login");
//       return;
//     }

//     const { data, error } = await supabase
//       .from("orders")
//       .select("*")
//       .eq("user_id", user.id)
//       .order("created_at", { ascending: false });

//     if (error) {
//       console.error("Error fetching orders:", error);
//     } else {
//       // Parse items and shipping_address from JSONB
//       const parsedOrders: Order[] = (data || []).map((order: any) => ({
//         id: order.id,
//         order_number: order.order_number,
//         status: order.status,
//         total_amount: order.total_amount,
//         created_at: order.created_at,
//         items: order.items as OrderItem[],
//         admin_response: order.admin_response,
//         approved_at: order.approved_at,
//         shipping_address: order.shipping_address as
//           | {
//               fullName: string;
//               email: string;
//               phone: string;
//               address: string;
//               city: string;
//               postalCode: string;
//             }
//           | undefined,
//       }));
//       setOrders(parsedOrders);
//     }
//     setLoading(false);
//   };

//   const formatPrice = (price: number) => {
//     return `Rs. ${price.toLocaleString()}`;
//   };

//   const formatDate = (dateStr: string) => {
//     return new Date(dateStr).toLocaleDateString("en-PK", {
//       year: "numeric",
//       month: "long",
//       day: "numeric",
//       hour: "2-digit",
//       minute: "2-digit",
//     });
//   };

//   const getStatusIcon = (status: string) => {
//     switch (status) {
//       case "pending":
//         return <Clock className="w-4 h-4" />;
//       case "paid":
//         return <Package className="w-4 h-4" />;
//       case "approved":
//         return <CheckCircle className="w-4 h-4" />;
//       case "alternate":
//         return <Package className="w-4 h-4" />;
//       case "completed":
//         return <CheckCircle className="w-4 h-4" />;
//       case "cancelled":
//         return <XCircle className="w-4 h-4" />;
//       default:
//         return <Clock className="w-4 h-4" />;
//     }
//   };

//   const getStatusColor = (status: string) => {
//     switch (status) {
//       case "pending":
//         return "secondary";
//       case "paid":
//         return "secondary";
//       case "approved":
//         return "default";
//       case "alternate":
//         return "outline";
//       case "completed":
//         return "default";
//       case "cancelled":
//         return "destructive";
//       default:
//         return "secondary";
//     }
//   };

//   return (
//     <>
//       <Helmet>
//         <title>My Orders - ScanGym</title>
//         <meta
//           name="description"
//           content="View your order history and track your purchases from ScanGym Shop."
//         />
//       </Helmet>

//       <div className="min-h-screen bg-background">
//         <Navbar />
//         <main className="pt-24 pb-16">
//           <div className="container mx-auto px-4">
//             <div className="flex items-center gap-4 mb-8">
//               <Button
//                 variant="outline"
//                 size="icon"
//                 onClick={() => navigate(-1)}
//               >
//                 <ArrowLeft className="w-4 h-4" />
//               </Button>
//               <div>
//                 <h1 className="font-display text-3xl font-bold text-foreground">
//                   My Orders
//                 </h1>
//                 <p className="text-muted-foreground">
//                   Track your shop purchases
//                 </p>
//               </div>
//             </div>

//             {loading ? (
//               <div className="space-y-4">
//                 {[1, 2, 3].map((i) => (
//                   <Card key={i}>
//                     <CardHeader>
//                       <Skeleton className="h-6 w-48" />
//                     </CardHeader>
//                     <CardContent>
//                       <Skeleton className="h-20 w-full" />
//                     </CardContent>
//                   </Card>
//                 ))}
//               </div>
//             ) : orders.length === 0 ? (
//               <Card className="text-center py-16">
//                 <CardContent>
//                   <ShoppingBag className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
//                   <h2 className="text-xl font-semibold mb-2">No orders yet</h2>
//                   <p className="text-muted-foreground mb-6">
//                     You haven't placed any orders yet. Start shopping now!
//                   </p>
//                   <Button onClick={() => navigate("/shop")}>Browse Shop</Button>
//                 </CardContent>
//               </Card>
//             ) : (
//               <div className="space-y-4">
//                 {orders.map((order) => (
//                   <Card key={order.id}>
//                     <CardHeader className="flex flex-row items-center justify-between">
//                       <div>
//                         <CardTitle className="text-lg">
//                           Order #{order.order_number}
//                         </CardTitle>
//                         <p className="text-sm text-muted-foreground">
//                           {formatDate(order.created_at)}
//                         </p>
//                       </div>
//                       <Badge
//                         variant={
//                           getStatusColor(order.status) as
//                             | "default"
//                             | "secondary"
//                             | "destructive"
//                         }
//                         className="flex items-center gap-1"
//                       >
//                         {getStatusIcon(order.status)}
//                         {order.status.charAt(0).toUpperCase() +
//                           order.status.slice(1)}
//                       </Badge>
//                     </CardHeader>
//                     <CardContent>
//                       <div className="space-y-3">
//                         {order.items.map((item, index) => (
//                           <div
//                             key={index}
//                             className="flex items-center justify-between py-2 border-b border-border last:border-0"
//                           >
//                             <div>
//                               <p className="font-medium">{item.name}</p>
//                               <p className="text-sm text-muted-foreground">
//                                 Qty: {item.quantity}
//                               </p>
//                             </div>
//                             <p className="font-semibold">
//                               {formatPrice(item.price * item.quantity)}
//                             </p>
//                           </div>
//                         ))}
//                         <div className="flex items-center justify-between pt-2 border-t border-border">
//                           <span className="font-semibold">Total</span>
//                           <span className="text-lg font-bold text-primary">
//                             {formatPrice(order.total_amount)}
//                           </span>
//                         </div>
//                       </div>
//                       {order.admin_response && (
//                         <div className="mt-4 p-4 bg-muted rounded-lg">
//                           <h4 className="font-semibold text-sm mb-2">
//                             Admin Response:
//                           </h4>
//                           <p className="text-sm whitespace-pre-wrap">
//                             {order.admin_response}
//                           </p>
//                         </div>
//                       )}

//                       {order.status === "approved" && (
//                         <div className="mt-4 p-4 bg-green-50 dark:bg-green-950 rounded-lg">
//                           <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
//                             <CheckCircle className="w-4 h-4" />
//                             Payment Details
//                           </h4>
//                           <div className="text-sm space-y-1">
//                             <p>
//                               <strong>JazzCash:</strong> 0305-6248720
//                             </p>
//                             <p>
//                               <strong>Account Holder:</strong> Waleed Ali
//                               Nawazish
//                             </p>
//                             <p>
//                               <strong>WhatsApp:</strong> 03407615594
//                             </p>
//                           </div>
//                           <p className="text-xs text-muted-foreground mt-2">
//                             Please send payment and share screenshot on WhatsApp
//                           </p>
//                         </div>
//                       )}
//                     </CardContent>
//                   </Card>
//                 ))}
//               </div>
//             )}
//           </div>
//         </main>
//         <Footer />
//       </div>
//     </>
//   );
// };

// export default Orders;

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

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      navigate("/login");
      return;
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

  const ADMIN_JAZZCASH = "0305-6248720";
  const ADMIN_NAME = "Waleed Ali Nawazish";
  const ADMIN_WHATSAPP = "03407615594";

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
            <div className="flex items-center gap-4 mb-8">
              <Button
                variant="outline"
                size="icon"
                onClick={() => navigate(-1)}
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
                    <CardHeader className="flex flex-row items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">
                          Order #{order.order_number}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(order.created_at)}
                        </p>
                      </div>
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
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {/* Shipping Address */}
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

                        {/* Items */}
                        {order.items.map((item, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between py-2 border-b border-border last:border-0"
                          >
                            <div>
                              <p className="font-medium">{item.name}</p>
                              <p className="text-sm text-muted-foreground">
                                Qty: {item.quantity}
                              </p>
                            </div>
                            <p className="font-semibold">
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
                            Admin Response:
                          </h4>
                          <p className="text-sm whitespace-pre-wrap">
                            {order.admin_response}
                          </p>
                        </div>
                      )}

                      {order.status === "active" && (
                        <div className="mt-4 p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                          <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                            <DollarSign className="w-4 h-4" />
                            Payment Details
                          </h4>
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
                            Please send payment and share screenshot on WhatsApp
                          </p>
                        </div>
                      )}

                      {/* Edit/Cancel Buttons */}
                      {order.status === "pending" &&
                        canEditOrCancel(order.created_at) && (
                          <div className="flex gap-2 mt-4">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditOrder(order)}
                            >
                              <Edit className="w-4 h-4 mr-2" />
                              Edit Address
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() =>
                                handleCancelOrder(order.id, order.order_number)
                              }
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Cancel Order
                            </Button>
                          </div>
                        )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </main>
        <Footer />
      </div>

      {/* Edit Address Dialog */}
      <Dialog
        open={!!editingOrder}
        onOpenChange={(open) => !open && setEditingOrder(null)}
      >
        <DialogContent>
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
            <div className="grid grid-cols-2 gap-4">
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
