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
        {/* Order Management */}
        <div className="mb-8" id="order-management">
          <OrderManagement orders={orders} onRefresh={fetchData} />
        </div>
        {/* Partner Management */}
        <PartnerManagement
          partners={partners}
          gyms={gyms}
          onRefresh={fetchData}
        />
      </main>
    </div>
  );
};

export default AdminDashboard;
