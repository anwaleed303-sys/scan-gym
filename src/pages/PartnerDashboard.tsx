import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../Components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../Components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../Components/ui/tabs";
import {
  Building2,
  Users,
  Calendar,
  TrendingUp,
  LogOut,
  RefreshCw,
  LayoutDashboard,
  UserCheck,
  CreditCard,
  BarChart3,
} from "lucide-react";
import { useAuth } from "../Contexts/AuthContext";
import { supabase } from "../../src/Integrations/client";
import { useToast } from "../hooks/use-toast";
import GymQRCode from "../Components/partner/GymQRCode";
import CheckInHistory from "../Components/partner/CheckInHistory";
import BookingHistory from "../Components/partner/BookingHistory";
import MemberManagement from "../Components/partner/MemberManagement";
import PaymentTracking from "../Components/partner/PaymentTracking";
import ReportsAnalytics from "../Components/partner/ReportsAnalytics";

interface GymWithCheckIns {
  id: string;
  name: string;
  city: string;
  qrCode: string;
  totalCheckIns: number;
  todayCheckIns: number;
  weekCheckIns: number;
}

const PartnerDashboard = () => {
  const { user, signOut, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [gyms, setGyms] = useState<GymWithCheckIns[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchGymData = async () => {
    if (!user) return;

    try {
      // Get partner's gyms
      const { data: partnerGyms, error: partnerError } = await supabase
        .from("gym_partners")
        .select("gym_id")
        .eq("user_id", user.id);

      if (partnerError) throw partnerError;

      if (!partnerGyms || partnerGyms.length === 0) {
        navigate("/partner-login");
        return;
      }

      const gymIds = partnerGyms.map((pg) => pg.gym_id);

      // Get gym details
      const { data: gymDetails, error: gymError } = await supabase
        .from("gyms")
        .select("*")
        .in("id", gymIds);

      if (gymError) throw gymError;

      // Get check-ins for these gyms
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      weekAgo.setHours(0, 0, 0, 0);

      const gymsWithStats: GymWithCheckIns[] = await Promise.all(
        (gymDetails || []).map(async (gym) => {
          // Total check-ins
          const { count: totalCheckIns } = await supabase
            .from("check_ins")
            .select("*", { count: "exact", head: true })
            .eq("gym_id", gym.id);

          // Today's check-ins
          const { count: todayCheckIns } = await supabase
            .from("check_ins")
            .select("*", { count: "exact", head: true })
            .eq("gym_id", gym.id)
            .gte("checked_in_at", today.toISOString());

          // Week's check-ins
          const { count: weekCheckIns } = await supabase
            .from("check_ins")
            .select("*", { count: "exact", head: true })
            .eq("gym_id", gym.id)
            .gte("checked_in_at", weekAgo.toISOString());

          return {
            id: gym.id,
            name: gym.name,
            city: gym.city,
            qrCode: gym.qr_code,
            totalCheckIns: totalCheckIns || 0,
            todayCheckIns: todayCheckIns || 0,
            weekCheckIns: weekCheckIns || 0,
          };
        })
      );

      setGyms(gymsWithStats);
    } catch (error) {
      console.error("Error fetching gym data:", error);
      toast({
        title: "Error",
        description: "Failed to load gym data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/partner-login");
      return;
    }

    if (user) {
      fetchGymData();
    }
  }, [user, authLoading, navigate]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchGymData();
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/partner-login");
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const totalCheckIns = gyms.reduce((sum, gym) => sum + gym.totalCheckIns, 0);
  const totalToday = gyms.reduce((sum, gym) => sum + gym.todayCheckIns, 0);
  const totalWeek = gyms.reduce((sum, gym) => sum + gym.weekCheckIns, 0);

  return (
    <>
      <Helmet>
        <title>Partner Dashboard - ScanGym Pakistan</title>
        <meta
          name="description"
          content="View check-in statistics for your gym."
        />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
          <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-1.5 sm:gap-2">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-primary rounded-lg flex items-center justify-center shadow-glow">
                <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-primary-foreground" />
              </div>
              <span className="font-display text-lg sm:text-xl font-bold text-foreground">
                Scan<span className="text-gradient">Gym</span>
                <span className="text-muted-foreground text-xs sm:text-sm ml-1 sm:ml-2 hidden xs:inline">
                  Partner
                </span>
              </span>
            </Link>

            <div className="flex items-center gap-2 sm:gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={refreshing}
                className="h-8 sm:h-9 px-2 sm:px-3"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 sm:w-4 sm:h-4 sm:mr-2 ${
                    refreshing ? "animate-spin" : ""
                  }`}
                />
                <span className="hidden sm:inline">Refresh</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="h-8 sm:h-9 px-2 sm:px-3"
              >
                <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4 sm:mr-2" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
          <div className="mb-6 sm:mb-8">
            <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-1 sm:mb-2">
              Partner Dashboard
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Manage your gym{gyms.length > 1 ? "s" : ""} and members
            </p>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
            <Card className="bg-card border-border">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 sm:px-6 pt-4 sm:pt-6">
                <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
                  Today's Check-ins
                </CardTitle>
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              </CardHeader>
              <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
                <div className="text-2xl sm:text-3xl font-bold text-foreground">
                  {totalToday}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Across all your gyms
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 sm:px-6 pt-4 sm:pt-6">
                <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
                  This Week
                </CardTitle>
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              </CardHeader>
              <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
                <div className="text-2xl sm:text-3xl font-bold text-foreground">
                  {totalWeek}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Last 7 days
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border sm:col-span-2 lg:col-span-1">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 sm:px-6 pt-4 sm:pt-6">
                <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
                  Total Check-ins
                </CardTitle>
                <Users className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              </CardHeader>
              <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
                <div className="text-2xl sm:text-3xl font-bold text-foreground">
                  {totalCheckIns}
                </div>
                <p className="text-xs text-muted-foreground mt-1">All time</p>
              </CardContent>
            </Card>
          </div>

          {/* Tabs for different sections */}
          <Tabs defaultValue="overview" className="space-y-4 sm:space-y-6">
            <div className="overflow-x-auto -mx-3 px-3 sm:mx-0 sm:px-0">
              <TabsList className="grid w-full grid-cols-5 min-w-[500px] sm:min-w-0 lg:w-[600px]">
                <TabsTrigger
                  value="overview"
                  className="gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3"
                >
                  <LayoutDashboard className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Overview</span>
                  <span className="sm:hidden">Home</span>
                </TabsTrigger>
                <TabsTrigger
                  value="members"
                  className="gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3"
                >
                  <UserCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Members</span>
                  <span className="sm:hidden">Team</span>
                </TabsTrigger>
                <TabsTrigger
                  value="payments"
                  className="gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3"
                >
                  <CreditCard className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Payments</span>
                  <span className="sm:hidden">Pay</span>
                </TabsTrigger>
                <TabsTrigger
                  value="reports"
                  className="gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3"
                >
                  <BarChart3 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Reports</span>
                  <span className="sm:hidden">Stats</span>
                </TabsTrigger>
                <TabsTrigger
                  value="history"
                  className="gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3"
                >
                  <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">History</span>
                  <span className="sm:hidden">Log</span>
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-4 sm:space-y-6">
              <h2 className="font-display text-lg sm:text-xl font-bold text-foreground">
                Your Gym{gyms.length > 1 ? "s" : ""}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                {gyms.map((gym) => (
                  <Card key={gym.id} className="bg-card border-border">
                    <CardHeader className="px-4 sm:px-6 pt-4 sm:pt-6">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                            <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" />
                            <span className="truncate">{gym.name}</span>
                          </CardTitle>
                          <p className="text-xs sm:text-sm text-muted-foreground mt-1 truncate">
                            {gym.city}
                          </p>
                        </div>
                        <div className="flex-shrink-0">
                          <GymQRCode gymName={gym.name} qrCode={gym.qrCode} />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
                      <div className="space-y-2.5 sm:space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-xs sm:text-sm text-muted-foreground">
                            Today
                          </span>
                          <span className="text-sm sm:text-base font-bold text-foreground">
                            {gym.todayCheckIns}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs sm:text-sm text-muted-foreground">
                            This Week
                          </span>
                          <span className="text-sm sm:text-base font-bold text-foreground">
                            {gym.weekCheckIns}
                          </span>
                        </div>
                        <div className="flex justify-between items-center border-t border-border pt-2.5 sm:pt-3">
                          <span className="text-xs sm:text-sm text-muted-foreground">
                            Total
                          </span>
                          <span className="text-base sm:text-lg font-bold text-primary">
                            {gym.totalCheckIns}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {gyms.length === 0 && (
                <Card className="bg-card border-border">
                  <CardContent className="py-8 sm:py-12 text-center px-4">
                    <Building2 className="w-10 h-10 sm:w-12 sm:h-12 text-muted-foreground mx-auto mb-3 sm:mb-4" />
                    <h3 className="text-base sm:text-lg font-medium text-foreground mb-2">
                      No Gyms Found
                    </h3>
                    <p className="text-sm sm:text-base text-muted-foreground max-w-md mx-auto">
                      You are not associated with any gyms yet. Contact support
                      if you believe this is an error.
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Members Tab */}
            <TabsContent value="members">
              {gyms.length > 0 ? (
                <MemberManagement
                  gymIds={gyms.map((g) => g.id)}
                  gyms={gyms.map((g) => ({ id: g.id, name: g.name }))}
                />
              ) : (
                <Card className="bg-card border-border">
                  <CardContent className="py-8 sm:py-12 text-center px-4">
                    <Users className="w-10 h-10 sm:w-12 sm:h-12 text-muted-foreground mx-auto mb-3 sm:mb-4" />
                    <h3 className="text-base sm:text-lg font-medium text-foreground mb-2">
                      No Gyms Found
                    </h3>
                    <p className="text-sm sm:text-base text-muted-foreground max-w-md mx-auto">
                      You need to be associated with a gym to manage members.
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Payments Tab */}
            <TabsContent value="payments">
              {gyms.length > 0 ? (
                <PaymentTracking
                  gymIds={gyms.map((g) => g.id)}
                  gyms={gyms.map((g) => ({ id: g.id, name: g.name }))}
                />
              ) : (
                <Card className="bg-card border-border">
                  <CardContent className="py-8 sm:py-12 text-center px-4">
                    <CreditCard className="w-10 h-10 sm:w-12 sm:h-12 text-muted-foreground mx-auto mb-3 sm:mb-4" />
                    <h3 className="text-base sm:text-lg font-medium text-foreground mb-2">
                      No Gyms Found
                    </h3>
                    <p className="text-sm sm:text-base text-muted-foreground max-w-md mx-auto">
                      You need to be associated with a gym to track payments.
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Reports Tab */}
            <TabsContent value="reports">
              {gyms.length > 0 ? (
                <ReportsAnalytics
                  gymIds={gyms.map((g) => g.id)}
                  gyms={gyms.map((g) => ({ id: g.id, name: g.name }))}
                />
              ) : (
                <Card className="bg-card border-border">
                  <CardContent className="py-8 sm:py-12 text-center px-4">
                    <BarChart3 className="w-10 h-10 sm:w-12 sm:h-12 text-muted-foreground mx-auto mb-3 sm:mb-4" />
                    <h3 className="text-base sm:text-lg font-medium text-foreground mb-2">
                      No Data Available
                    </h3>
                    <p className="text-sm sm:text-base text-muted-foreground max-w-md mx-auto">
                      You need to be associated with a gym to view reports.
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* History Tab */}
            <TabsContent value="history" className="space-y-6 sm:space-y-8">
              {gyms.length > 0 && (
                <>
                  <div>
                    <h2 className="font-display text-lg sm:text-xl font-bold text-foreground mb-3 sm:mb-4">
                      Customer Check-in History
                    </h2>
                    <CheckInHistory gymIds={gyms.map((g) => g.id)} />
                  </div>

                  <div>
                    <h2 className="font-display text-lg sm:text-xl font-bold text-foreground mb-3 sm:mb-4">
                      Trainer Bookings
                    </h2>
                    <BookingHistory gymIds={gyms.map((g) => g.id)} />
                  </div>
                </>
              )}
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </>
  );
};

export default PartnerDashboard;
