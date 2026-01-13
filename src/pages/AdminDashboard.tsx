import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../Components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../Components/ui/card";
import { useToast } from "../hooks/use-toast";
import { supabase } from "../Integrations/client";
import {
  Shield,
  LogOut,
  Users,
  Building2,
  FileText,
  ShoppingBag,
  Dumbbell,
  Salad,
} from "lucide-react";
import { PartnerManagement } from "../Components/admin/PartnerManagement";
import { GymManagement } from "../Components/admin/GymManagement";
import { GymsMapView } from "../Components/admin/GymMapview";
import { TrainerManagement } from "../Components/admin/TrainerManagement";
import { DietPlanManagement } from "../Components/admin/DietPlanManagement";
import { NotificationBell } from "@/Components/admin/NotificationBell";
import { OrderManagement } from "../Components/admin/OrderManagement";

interface GymPartner {
  id: string;
  user_id: string;
  gym_id: string;
  created_at: string;
  gym: {
    id: string;
    name: string;
    city: string;
  } | null;
  profile: {
    full_name: string | null;
  } | null;
}

interface Gym {
  id: string;
  name: string;
  city: string;
  address: string | null;
  qr_code: string;
  latitude: number | null;
  longitude: number | null;
  opening_time: string | null;
  closing_time: string | null;
  services: string[] | null;
  phone: string | null;
  email: string | null;
  description: string | null;
  is_active: boolean | null;
  created_at: string;
}

interface Trainer {
  id: string;
  name: string;
  specialty: string;
  price: number;
  image: string | null;
  bio: string | null;
  experience_years: number | null;
  is_available: boolean | null;
  created_at: string;
}

interface DietPlan {
  id: string;
  name: string;
  description: string | null;
  price: number;
  duration_days: number | null;
  calories_per_day: number | null;
  meal_count: number | null;
  features: string[] | null;
  is_active: boolean | null;
  created_at: string;
}

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [partners, setPartners] = useState<GymPartner[]>([]);
  const [gyms, setGyms] = useState<Gym[]>([]);
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [dietPlans, setDietPlans] = useState<DietPlan[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        navigate("/admin-login");
        return;
      }

      const { data: roleData, error: roleError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();

      if (roleError) throw roleError;

      if (!roleData) {
        toast({
          title: "Access Denied",
          description: "You don't have admin privileges.",
          variant: "destructive",
        });
        navigate("/");
        return;
      }

      setIsAdmin(true);
      await fetchData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const fetchData = async () => {
    try {
      // Fetch gyms with all fields
      const { data: gymsData, error: gymsError } = await supabase
        .from("gyms")
        .select(
          "id, name, city, address, qr_code, latitude, longitude, opening_time, closing_time, services, phone, email, description, is_active, created_at"
        )
        .order("name");

      if (gymsError) throw gymsError;
      setGyms(gymsData || []);

      // Fetch partners with gym and profile info
      const { data: partnersData, error: partnersError } = await supabase
        .from("gym_partners")
        .select(
          `
          id,
          user_id,
          gym_id,
          created_at,
          gyms (id, name, city, address, opening_time, closing_time, services, phone, email, is_active)
        `
        )
        .order("created_at", { ascending: false });

      if (partnersError) throw partnersError;

      // Fetch profiles for partners
      const userIds = partnersData?.map((p) => p.user_id) || [];
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", userIds);

      const partnersWithProfiles =
        partnersData?.map((partner) => ({
          ...partner,
          gym: partner.gyms,
          profile: profilesData?.find((p) => p.id === partner.user_id) || null,
        })) || [];

      setPartners(partnersWithProfiles);

      // Fetch trainers
      const { data: trainersData, error: trainersError } = await supabase
        .from("trainers")
        .select("*")
        .order("name");

      if (trainersError) throw trainersError;
      setTrainers(trainersData || []);

      // Fetch diet plans
      const { data: dietPlansData, error: dietPlansError } = await supabase
        .from("diet_plans")
        .select("*")
        .order("name");

      if (dietPlansError) throw dietPlansError;
      setDietPlans(dietPlansData || []);

      if (dietPlansError) throw dietPlansError;
      setDietPlans(dietPlansData || []);
      // Fetch orders WITHOUT relationship syntax
      const { data: ordersData, error: ordersError } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (ordersError) throw ordersError;

      console.log("📦 Raw orders from database:", ordersData);

      // Manually fetch user profiles for orders
      const orderUserIds =
        ordersData?.map((o) => o.user_id).filter(Boolean) || [];
      let orderProfiles: any[] = [];

      if (orderUserIds.length > 0) {
        const { data: orderProfilesData } = await supabase
          .from("profiles")
          .select("id, full_name, email")
          .in("id", orderUserIds);
        orderProfiles = orderProfilesData || [];
      }

      // Manually combine orders with profiles
      // const ordersWithProfiles =
      //   ordersData?.map((order) => ({
      //     ...order,
      //     profiles: orderProfiles.find((p) => p.id === order.user_id) || null,
      //   })) || [];

      // console.log("✅ Processed orders with profiles:", ordersWithProfiles);

      // setOrders(ordersWithProfiles);

      // Combine orders with profiles
      const ordersWithProfiles =
        ordersData?.map((order) => ({
          ...order,
          profiles: orderProfiles.find((p) => p.id === order.user_id) || null,
        })) || [];

      // Debug: Log processed orders
      console.log("✅ Processed orders with profiles:", ordersWithProfiles);
      console.log("📈 Breakdown by status:", {
        pending: ordersWithProfiles.filter((o) => o.status === "pending")
          .length,
        active: ordersWithProfiles.filter((o) => o.status === "active").length,
        completed: ordersWithProfiles.filter((o) => o.status === "completed")
          .length,
        cancelled: ordersWithProfiles.filter((o) => o.status === "cancelled")
          .length,
      });

      setOrders(ordersWithProfiles);
    } catch (error: any) {
      console.error("❌ Error loading orders:", error);
      toast({
        title: "Error loading data",
        description: error.message,
        variant: "destructive",
      });
    }
  };
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-display font-bold">
                Admin Dashboard
              </h1>
              <p className="text-sm text-muted-foreground">
                Manage gym partners
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <NotificationBell />
            <Link to="/blog-admin">
              <Button variant="outline" size="sm">
                <FileText className="w-4 h-4 mr-2" />
                Blog Admin
              </Button>
            </Link>
            <Link to="/shop-admin">
              <Button variant="outline" size="sm">
                <ShoppingBag className="w-4 h-4 mr-2" />
                Shop Admin
              </Button>
            </Link>
            <Button
              variant="ghost"
              onClick={handleSignOut}
              className="text-muted-foreground hover:text-foreground"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Partners
              </CardTitle>
              <Users className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{partners.length}</div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Gyms
              </CardTitle>
              <Building2 className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{gyms.length}</div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Trainers
              </CardTitle>
              <Dumbbell className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{trainers.length}</div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Diet Plans
              </CardTitle>
              <Salad className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{dietPlans.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Gyms Map View */}
        <div className="mb-8">
          <GymsMapView gyms={gyms} />
        </div>

        {/* Gym Management */}
        <div className="mb-8">
          <GymManagement gyms={gyms} onRefresh={fetchData} />
        </div>

        {/* Trainer Management */}
        <div className="mb-8">
          <TrainerManagement trainers={trainers} onRefresh={fetchData} />
        </div>

        {/* Diet Plan Management */}
        <div className="mb-8">
          <DietPlanManagement dietPlans={dietPlans} onRefresh={fetchData} />
        </div>
        {/* Partner Management */}
        <div className="mb-8" id="order-management">
          <PartnerManagement
            partners={partners}
            gyms={gyms}
            onRefresh={fetchData}
          />
        </div>
        {/* Order Management */}
        <div className="mb-8" id="order-management">
          <OrderManagement orders={orders} onRefresh={fetchData} />
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
<style>{`
        /* ============================================
           ADMIN DASHBOARD RESPONSIVE STYLES
           ============================================ */

        /* Mobile First - Base Styles (320px+) */
        @media (max-width: 640px) {
          /* Header adjustments */
          header .container {
            padding-left: 1rem !important;
            padding-right: 1rem !important;
          }

          .flex.items-center.justify-between {
            gap: 0.75rem;
          }

          /* Header left section */
          .flex.items-center.gap-3:first-child {
            gap: 0.5rem !important;
          }

          /* Logo/Shield */
          .w-10.h-10.bg-primary\\/10 {
            width: 2.5rem !important;
            height: 2.5rem !important;
          }

          .w-10.h-10.bg-primary\\/10 svg {
            width: 1.125rem !important;
            height: 1.125rem !important;
          }

          /* Header title */
          .text-xl.font-display {
            font-size: 1.125rem !important;
          }

          /* Header subtitle */
          .text-sm.text-muted-foreground {
            font-size: 0.75rem !important;
          }

          /* Header right buttons section */
          .flex.items-center.gap-3:last-child {
            gap: 0.5rem !important;
          }

          /* Hide text on small buttons, show icons only */
          header button span:not(.sr-only) {
            display: none !important;
          }

          header a button span:not(.sr-only) {
            display: none !important;
          }

          /* Keep icons visible */
          header button svg,
          header a button svg {
            margin: 0 !important;
          }

          /* Adjust button sizes */
          header button {
            min-width: 40px !important;
            min-height: 40px !important;
            padding: 0.5rem !important;
          }

          header a button {
            min-width: 40px !important;
            min-height: 40px !important;
            padding: 0.5rem !important;
          }

          /* Main container padding */
          main.container {
            padding-left: 1rem !important;
            padding-right: 1rem !important;
            padding-top: 1.5rem !important;
            padding-bottom: 1.5rem !important;
          }

          /* Stats grid - stack on mobile */
          .grid.grid-cols-1.md\\:grid-cols-4 {
            grid-template-columns: 1fr !important;
            gap: 1rem !important;
          }

          /* Stats cards */
          .grid.grid-cols-1.md\\:grid-cols-4 > div {
            padding: 0.75rem !important;
          }

          /* Stats card header */
          .grid.grid-cols-1.md\\:grid-cols-4 [class*="CardHeader"] {
            padding: 0.75rem !important;
            padding-bottom: 0.5rem !important;
          }

          /* Stats card content */
          .grid.grid-cols-1.md\\:grid-cols-4 [class*="CardContent"] {
            padding: 0 0.75rem 0.75rem !important;
          }

          /* Stats number */
          .text-3xl.font-bold {
            font-size: 2rem !important;
          }

          /* Stats title */
          [class*="CardTitle"].text-sm {
            font-size: 0.8125rem !important;
          }

          /* Stats icon */
          [class*="CardHeader"] svg.w-4 {
            width: 1rem !important;
            height: 1rem !important;
          }

          /* Section spacing */
          .mb-8 {
            margin-bottom: 1.5rem !important;
          }

          /* Loading spinner */
          .animate-spin {
            width: 2.5rem !important;
            height: 2.5rem !important;
          }

          /* Sticky header z-index fix for mobile */
          header.sticky {
            position: sticky !important;
            top: 0 !important;
            z-index: 50 !important;
          }
        }

        /* Very small mobile (320px - 375px) */
        @media (max-width: 375px) {
          /* Even more compact header */
          .text-xl.font-display {
            font-size: 1rem !important;
          }

          .text-sm.text-muted-foreground {
            display: none !important;
          }

          /* Smaller stats grid gap */
          .grid.grid-cols-1.md\\:grid-cols-4 {
            gap: 0.75rem !important;
          }

          /* Smaller stats numbers */
          .text-3xl.font-bold {
            font-size: 1.75rem !important;
          }

          /* Compact header buttons */
          header button,
          header a button {
            min-width: 36px !important;
            min-height: 36px !important;
            padding: 0.375rem !important;
          }

          header button svg,
          header a button svg {
            width: 1rem !important;
            height: 1rem !important;
          }
        }

        /* Small tablets (641px - 768px) */
        @media (min-width: 641px) and (max-width: 768px) {
          /* 2-column grid for stats */
          .grid.grid-cols-1.md\\:grid-cols-4 {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 1.25rem !important;
          }

          /* Show button text */
          header button span,
          header a button span {
            display: inline !important;
          }

          header button svg,
          header a button svg {
            margin-right: 0.5rem !important;
          }

          /* Stats card sizing */
          .text-3xl.font-bold {
            font-size: 2.25rem !important;
          }
        }

        /* Tablets (769px - 1024px) */
        @media (min-width: 769px) and (max-width: 1024px) {
          /* 4-column grid for stats */
          .grid.grid-cols-1.md\\:grid-cols-4 {
            grid-template-columns: repeat(4, 1fr) !important;
            gap: 1.25rem !important;
          }

          /* Container max width */
          .container {
            max-width: 100% !important;
            padding-left: 2rem !important;
            padding-right: 2rem !important;
          }
        }

        /* Landscape mobile devices */
        @media (max-height: 500px) and (orientation: landscape) {
          /* Reduce header padding */
          header .container {
            padding-top: 0.75rem !important;
            padding-bottom: 0.75rem !important;
          }

          /* Reduce main padding */
          main.container {
            padding-top: 1rem !important;
            padding-bottom: 1rem !important;
          }

          /* Smaller section margins */
          .mb-8 {
            margin-bottom: 1rem !important;
          }

          /* 2-column stats in landscape */
          .grid.grid-cols-1.md\\:grid-cols-4 {
            grid-template-columns: repeat(2, 1fr) !important;
          }

          /* Compact stats */
          .text-3xl.font-bold {
            font-size: 1.5rem !important;
          }

          [class*="CardHeader"] {
            padding: 0.5rem !important;
          }

          [class*="CardContent"] {
            padding: 0.5rem !important;
          }
        }

        /* Touch device improvements */
        @media (hover: none) and (pointer: coarse) {
          /* Minimum touch targets */
          button,
          a {
            min-height: 44px !important;
          }

          /* Header buttons */
          header button,
          header a button {
            min-width: 44px !important;
            min-height: 44px !important;
          }

          /* Increase tap spacing */
          .flex.items-center.gap-3 {
            gap: 0.75rem !important;
          }
        }

        /* Improve scrolling on iOS */
        body,
        main {
          -webkit-overflow-scrolling: touch;
        }

        /* Prevent horizontal scroll */
        body {
          overflow-x: hidden;
        }

        /* Safe area for notched devices */
        @supports (padding: max(0px)) {
          header .container {
            padding-left: max(1rem, env(safe-area-inset-left)) !important;
            padding-right: max(1rem, env(safe-area-inset-right)) !important;
            padding-top: max(1rem, env(safe-area-inset-top)) !important;
          }

          main.container {
            padding-left: max(1rem, env(safe-area-inset-left)) !important;
            padding-right: max(1rem, env(safe-area-inset-right)) !important;
            padding-bottom: max(1.5rem, env(safe-area-inset-bottom)) !important;
          }
        }

        /* Sticky header shadow on scroll */
        header.sticky {
          box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
        }

        /* Dark mode optimizations */
        @media (prefers-color-scheme: dark) {
          /* Header backdrop */
          header {
            background-color: rgba(0, 0, 0, 0.8) !important;
          }

          /* Card backgrounds */
          .bg-card {
            background-color: hsl(var(--card)) !important;
          }

          /* Sticky header shadow */
          header.sticky {
            box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.3);
          }
        }

        /* Light mode optimizations */
        @media (prefers-color-scheme: light) {
          /* Header backdrop */
          header {
            background-color: rgba(255, 255, 255, 0.9) !important;
          }

          /* Sticky header shadow */
          header.sticky {
            box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.05);
          }
        }

        /* Loading state */
        .min-h-screen.bg-background {
          min-height: 100vh;
          min-height: -webkit-fill-available;
        }

        /* Loading spinner animation */
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .animate-spin {
          animation: spin 1s linear infinite;
        }

        /* Backdrop blur performance */
        .backdrop-blur-sm {
          -webkit-backdrop-filter: blur(8px);
          backdrop-filter: blur(8px);
        }

        /* Card hover effects on desktop */
        @media (min-width: 1025px) {
          .grid > div {
            transition: transform 0.2s ease, box-shadow 0.2s ease;
          }

          .grid > div:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
                        0 2px 4px -1px rgba(0, 0, 0, 0.06);
          }
        }

        /* Disable hover effects on touch devices */
        @media (hover: none) {
          .grid > div:hover {
            transform: none;
            box-shadow: none;
          }
        }

        /* Stats grid responsive breakpoints */
        @media (min-width: 640px) and (max-width: 768px) {
          .grid.md\\:grid-cols-4 {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }

        @media (min-width: 768px) {
          .grid.md\\:grid-cols-4 {
            grid-template-columns: repeat(4, 1fr) !important;
          }
        }

        /* Link button styling */
        a button {
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
        }

        /* Accessibility - Reduced motion */
        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }

          .grid > div {
            transition: none !important;
          }
        }

        /* High contrast mode support */
        @media (prefers-contrast: high) {
          header {
            border-bottom-width: 2px !important;
          }

          .border,
          .border-border {
            border-width: 2px !important;
          }

          button {
            border: 2px solid currentColor !important;
          }
        }

        /* Focus visible styles for keyboard navigation */
        button:focus-visible,
        a:focus-visible {
          outline: 2px solid hsl(var(--primary)) !important;
          outline-offset: 2px !important;
        }

        /* Print styles */
        @media print {
          header button,
          header a {
            display: none !important;
          }

          header {
            position: relative !important;
            box-shadow: none !important;
          }

          .mb-8 {
            break-inside: avoid;
            page-break-inside: avoid;
          }

          @page {
            margin: 1cm;
          }
        }

        /* Container max-width adjustments */
        @media (min-width: 1280px) {
          .container {
            max-width: 1280px !important;
          }
        }

        @media (min-width: 1536px) {
          .container {
            max-width: 1536px !important;
          }
        }

        /* Grid gap responsive adjustments */
        @media (max-width: 640px) {
          .gap-6 {
            gap: 1rem !important;
          }
        }

        @media (min-width: 641px) and (max-width: 1024px) {
          .gap-6 {
            gap: 1.25rem !important;
          }
        }

        /* Notification bell responsive (if applicable) */
        @media (max-width: 640px) {
          [class*="NotificationBell"] button {
            min-width: 40px !important;
            min-height: 40px !important;
          }
        }

        /* Smooth scrolling */
        html {
          scroll-behavior: smooth;
        }

        @media (prefers-reduced-motion: reduce) {
          html {
            scroll-behavior: auto;
          }
        }

        /* Fix for iOS Safari bottom bar */
        @supports (-webkit-touch-callout: none) {
          .min-h-screen {
            min-height: -webkit-fill-available;
          }
        }
      `}</style>;
