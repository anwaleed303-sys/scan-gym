// import { useState, useEffect } from "react";
// import { Bell } from "lucide-react";
// import { Button } from "../ui/button";
// import { Badge } from "../ui/badge";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuLabel,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from "../ui/dropdown-menu";
// import { supabase } from "../../Integrations/client";
// import { useNavigate } from "react-router-dom";

// interface Notification {
//   id: string;
//   type: string;
//   title: string;
//   message: string;
//   created_at: string;
//   read: boolean;
//   metadata?: {
//     order_id?: string;
//     order_number?: string;
//   };
// }

// export const NotificationBell = () => {
//   const [notifications, setNotifications] = useState<Notification[]>([]);
//   const [unreadCount, setUnreadCount] = useState(0);
//   const navigate = useNavigate();

//   useEffect(() => {
//     fetchNotifications();

//     // Subscribe to new orders
//     const channel = supabase
//       .channel("new-orders")
//       .on(
//         "postgres_changes",
//         {
//           event: "INSERT",
//           schema: "public",
//           table: "orders",
//         },
//         () => {
//           fetchNotifications();
//         }
//       )
//       .subscribe();

//     return () => {
//       supabase.removeChannel(channel);
//     };
//   }, []);

//   const fetchNotifications = async () => {
//     try {
//       // Get all pending orders
//       const { data: orders, error } = await supabase
//         .from("orders")
//         .select(
//           `
//           id,
//           order_number,
//           status,
//           created_at,
//           total_amount
//         `
//         )
//         .eq("status", "paid")
//         .order("created_at", { ascending: false })
//         .limit(10);

//       if (error) throw error;

//       // Convert orders to notification format
//       const orderNotifications: Notification[] =
//         orders?.map((order) => ({
//           id: order.id,
//           type: "new_order",
//           title: "New Order",
//           message: `Order ${
//             order.order_number
//           } - Rs. ${order.total_amount.toLocaleString()}`,
//           created_at: order.created_at,
//           read: false,
//           metadata: {
//             order_id: order.id,
//             order_number: order.order_number,
//           },
//         })) || [];

//       setNotifications(orderNotifications);
//       setUnreadCount(orderNotifications.length);
//     } catch (error) {
//       console.error("Error fetching notifications:", error);
//     }
//   };

//   const handleNotificationClick = (notification: Notification) => {
//     // Navigate to admin dashboard (orders will be visible there)
//     navigate("/admin-dashboard");

//     // Scroll to orders section after navigation
//     setTimeout(() => {
//       const ordersSection = document.getElementById("order-management");
//       if (ordersSection) {
//         ordersSection.scrollIntoView({ behavior: "smooth" });
//       }
//     }, 100);
//   };

//   const formatTime = (timestamp: string) => {
//     const date = new Date(timestamp);
//     const now = new Date();
//     const diffMs = now.getTime() - date.getTime();
//     const diffMins = Math.floor(diffMs / 60000);

//     if (diffMins < 1) return "Just now";
//     if (diffMins < 60) return `${diffMins}m ago`;

//     const diffHours = Math.floor(diffMins / 60);
//     if (diffHours < 24) return `${diffHours}h ago`;

//     const diffDays = Math.floor(diffHours / 24);
//     return `${diffDays}d ago`;
//   };

//   return (
//     <DropdownMenu>
//       <DropdownMenuTrigger asChild>
//         <Button variant="outline" size="icon" className="relative">
//           <Bell className="w-5 h-5" />
//           {unreadCount > 0 && (
//             <Badge
//               className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
//               variant="destructive"
//             >
//               {unreadCount > 9 ? "9+" : unreadCount}
//             </Badge>
//           )}
//         </Button>
//       </DropdownMenuTrigger>
//       <DropdownMenuContent align="end" className="w-80">
//         <DropdownMenuLabel>Notifications</DropdownMenuLabel>
//         <DropdownMenuSeparator />
//         {notifications.length === 0 ? (
//           <div className="p-4 text-center text-sm text-muted-foreground">
//             No new notifications
//           </div>
//         ) : (
//           notifications.map((notification) => (
//             <DropdownMenuItem
//               key={notification.id}
//               onClick={() => handleNotificationClick(notification)}
//               className="cursor-pointer p-3"
//             >
//               <div className="flex flex-col gap-1 w-full">
//                 <div className="flex items-start justify-between">
//                   <span className="font-semibold text-sm">
//                     {notification.title}
//                   </span>
//                   <span className="text-xs text-muted-foreground">
//                     {formatTime(notification.created_at)}
//                   </span>
//                 </div>
//                 <p className="text-sm text-muted-foreground">
//                   {notification.message}
//                 </p>
//                 {!notification.read && (
//                   <div className="w-2 h-2 bg-primary rounded-full mt-1" />
//                 )}
//               </div>
//             </DropdownMenuItem>
//           ))
//         )}
//       </DropdownMenuContent>
//     </DropdownMenu>
//   );
// };

import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { supabase } from "../../Integrations/client";
import { useNavigate } from "react-router-dom";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  created_at: string;
  read: boolean;
  metadata?: {
    order_id?: string;
    order_number?: string;
  };
}

export const NotificationBell = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotifications();

    // Subscribe to new orders in real-time
    const channel = supabase
      .channel("new-orders-realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "orders",
        },
        (payload) => {
          console.log("New order detected:", payload);
          fetchNotifications();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "orders",
        },
        (payload) => {
          console.log("Order updated:", payload);
          fetchNotifications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchNotifications = async () => {
    try {
      // Get all pending orders
      const { data: orders, error } = await supabase
        .from("orders")
        .select(
          `
          id,
          order_number,
          status,
          created_at,
          total_amount,
          shipping_address
        `
        )
        .eq("status", "pending")
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;

      // Convert orders to notification format
      const orderNotifications: Notification[] =
        orders?.map((order) => ({
          id: order.id,
          type: "new_order",
          title: "🔔 New Order",
          message: `Order ${
            order.order_number
          } - Rs. ${order.total_amount.toLocaleString()}`,
          created_at: order.created_at,
          read: false,
          metadata: {
            order_id: order.id,
            order_number: order.order_number,
          },
        })) || [];

      setNotifications(orderNotifications);
      setUnreadCount(orderNotifications.length);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    // Navigate to admin dashboard
    navigate("/admin-dashboard");

    // Scroll to orders section after navigation
    setTimeout(() => {
      const ordersSection = document.getElementById("order-management");
      if (ordersSection) {
        ordersSection.scrollIntoView({ behavior: "smooth" });
      }
    }, 100);
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;

    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <Badge
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs animate-pulse"
              variant="destructive"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <Badge variant="secondary" className="ml-2">
              {unreadCount} new
            </Badge>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {notifications.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            No new notifications
          </div>
        ) : (
          notifications.map((notification) => (
            <DropdownMenuItem
              key={notification.id}
              onClick={() => handleNotificationClick(notification)}
              className="cursor-pointer p-3 focus:bg-accent"
            >
              <div className="flex flex-col gap-1 w-full">
                <div className="flex items-start justify-between">
                  <span className="font-semibold text-sm">
                    {notification.title}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatTime(notification.created_at)}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {notification.message}
                </p>
                <div className="w-2 h-2 bg-primary rounded-full mt-1 animate-pulse" />
              </div>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
