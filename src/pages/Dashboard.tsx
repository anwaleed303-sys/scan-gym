import { useState, useEffect, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../Components/ui/button";
import { Input } from "../Components/ui/input";
import {
  QrCode,
  User,
  CreditCard,
  History,
  LogOut,
  Dumbbell,
  RotateCcw,
  Building2,
  MapPin,
  Scan,
  Navigation,
  Search,
  ShoppingBag,
} from "lucide-react";
import { useToast } from "../hooks/use-toast";
import { useAuth } from "../Contexts/AuthContext";
import SubscriptionPlans from "../Components/dashboard/subscriptionPlans";
import DashboardFeatures from "../Components/dashboard/DashboardFeatures";
import QRScanner from "../Components/dashboard/QRScanner";
import NearbyGymsMap from "../Components/dashboard/NearbyGymsMap";
import GymStreak from "../Components/dashboard/GymStreak";
import { Switch } from "../Components/ui/switch";
import { Label } from "../Components/ui/label";
import { supabase } from "../Integrations/client";
import { useGeolocation } from "../hooks/useGeolocation";

interface Subscription {
  id: string;
  plan_id: string;
  plan_name: string;
  price: number;
  expires_at: string;
  auto_renew: boolean;
}

const Dashboard = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loadingSubscription, setLoadingSubscription] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "nearby" | "features" | "scanner" | "profile" | "history" | "settings"
  >("nearby");
  const [autoRenew, setAutoRenew] = useState(true);
  const {
    coordinates,
    loading: locationLoading,
    error: locationError,
    requestLocation,
    setManualLocation,
    availableCities,
  } = useGeolocation();
  const [locationGranted, setLocationGranted] = useState(false);
  const [citySearch, setCitySearch] = useState("");

  // Check for existing subscription
  useEffect(() => {
    const fetchSubscription = async () => {
      if (!user) {
        setLoadingSubscription(false);
        return;
      }

      const { data, error } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "active")
        .gte("expires_at", new Date().toISOString())
        .single();

      if (data && !error) {
        setSubscription(data);
        setAutoRenew(data.auto_renew);
      }
      setLoadingSubscription(false);
    };

    fetchSubscription();
  }, [user]);

  // Track location status
  useEffect(() => {
    if (coordinates) {
      setLocationGranted(true);
    }
  }, [coordinates]);

  const handleLogout = async () => {
    await signOut();
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
    navigate("/");
  };

  const handleSubscribe = async (
    planId: string,
    planName: string,
    price: number,
    paymentMethod: string
  ) => {
    if (!user) return;

    // If Safepay is selected, redirect to Safepay checkout
    if (paymentMethod === "safepay") {
      try {
        const { data: session } = await supabase.auth.getSession();
        const token = session?.session?.access_token;

        if (!token) {
          toast({
            title: "Session Expired",
            description: "Please login again.",
            variant: "destructive",
          });
          return;
        }

        const successUrl = `${window.location.origin}/payment-success?order_id={ORDER_ID}`;
        const cancelUrl = `${window.location.origin}/dashboard`;

        const response = await supabase.functions.invoke("safepay-checkout", {
          body: {
            amount: price,
            payment_type: "subscription",
            metadata: {
              plan_id: planId,
              plan_name: planName,
            },
            success_url: successUrl,
            cancel_url: cancelUrl,
          },
        });

        if (response.error) {
          console.error("Safepay error:", response.error);
          toast({
            title: "Payment Error",
            description: "Failed to initiate payment. Please try again.",
            variant: "destructive",
          });
          return;
        }

        if (response.data?.checkout_url) {
          // Redirect to Safepay checkout
          window.location.href = response.data.checkout_url;
          return;
        }
      } catch (error) {
        console.error("Payment error:", error);
        toast({
          title: "Payment Error",
          description: "Something went wrong. Please try again.",
          variant: "destructive",
        });
        return;
      }
    }

    // For other payment methods, use the existing flow (demo/placeholder)
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + 1); // 1 month subscription

    const { data, error } = await supabase
      .from("subscriptions")
      .insert({
        user_id: user.id,
        plan_id: planId,
        plan_name: planName,
        price: price,
        payment_method: paymentMethod,
        auto_renew: true,
        status: "active",
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single();

    if (error) {
      toast({
        title: "Subscription Failed",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    setSubscription(data);
    toast({
      title: "Subscription Activated!",
      description: "Please enable location access to use ScanGym.",
    });
  };

  const handleEnableLocation = () => {
    requestLocation();
  };

  const displayName =
    profile?.full_name || user?.email?.split("@")[0] || "User";
  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    : "January 2024";

  const hasSubscription = !!subscription;
  const currentPlan = subscription?.plan_id || null;

  if (loadingSubscription) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Dashboard - ScanGym Pakistan</title>
        <meta
          name="description"
          content="Manage your ScanGym subscription and access your account."
        />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="bg-card border-b border-border">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center shadow-glow">
                <QrCode className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="font-display text-xl font-bold text-foreground">
                Scan<span className="text-gradient">Gym</span>
              </span>
            </Link>
            <div className="flex items-center gap-4">
              {hasSubscription && (
                <span className="hidden md:flex items-center gap-2 text-sm text-primary bg-primary/10 px-3 py-1.5 rounded-full">
                  <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                  Active Subscription
                </span>
              )}
              <Button
                variant="ghost"
                onClick={handleLogout}
                className="text-muted-foreground hover:text-foreground"
              >
                <LogOut className="w-5 h-5 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </header>

        {!hasSubscription ? (
          /* Subscription Selection Screen */
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-10">
                <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
                  Choose Your{" "}
                  <span className="text-gradient">Subscription</span>
                </h1>
                <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                  Select a plan to unlock full access to gyms, trainer booking,
                  diet plans, AI fitness tracking, and more!
                </p>
              </div>

              <SubscriptionPlans onSubscribe={handleSubscribe} />
            </div>
          </div>
        ) : !locationGranted ? (
          /* Location Permission Screen */
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-md mx-auto text-center">
              <div className="bg-card rounded-2xl p-8 border border-border">
                <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Navigation className="w-10 h-10 text-primary" />
                </div>
                <h1 className="font-display text-2xl font-bold text-foreground mb-4">
                  Enable Location Access
                </h1>
                <p className="text-muted-foreground mb-6">
                  To find gyms near you and verify check-ins, we need access to
                  your location.
                </p>
                {locationError && (
                  <p className="text-destructive text-sm mb-4">
                    {locationError}
                  </p>
                )}
                <Button
                  variant="hero"
                  size="lg"
                  className="w-full"
                  onClick={handleEnableLocation}
                  disabled={locationLoading}
                >
                  {locationLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2" />
                      Getting Location...
                    </>
                  ) : (
                    <>
                      <MapPin className="w-5 h-5 mr-2" />
                      Enable Location
                    </>
                  )}
                </Button>

                {/* Manual City Selection with Search */}
                <div className="mt-6 pt-6 border-t border-border">
                  <p className="text-sm text-muted-foreground mb-4">
                    Or search and select your city:
                  </p>
                  <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Search cities..."
                      value={citySearch}
                      onChange={(e) => setCitySearch(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <div className="flex flex-wrap gap-2 justify-center max-h-40 overflow-y-auto">
                    {availableCities
                      .filter((city) =>
                        city.toLowerCase().includes(citySearch.toLowerCase())
                      )
                      .map((city) => (
                        <Button
                          key={city}
                          variant="outline"
                          size="sm"
                          onClick={() => setManualLocation(city)}
                          className="capitalize"
                        >
                          {city}
                        </Button>
                      ))}
                    {availableCities.filter((city) =>
                      city.toLowerCase().includes(citySearch.toLowerCase())
                    ).length === 0 && (
                      <p className="text-sm text-muted-foreground">
                        No cities found
                      </p>
                    )}
                  </div>
                </div>

                <p className="text-xs text-muted-foreground mt-4">
                  Your location is only used to find nearby gyms and verify
                  check-ins.
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* Main Dashboard */
          <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Sidebar */}
              <aside className="lg:w-64 shrink-0">
                <nav className="bg-card rounded-xl p-4 space-y-2">
                  <button
                    onClick={() => setActiveTab("nearby")}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      activeTab === "nearby"
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <MapPin className="w-5 h-5" />
                    Nearby Gyms
                  </button>
                  <button
                    onClick={() => setActiveTab("features")}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      activeTab === "features"
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <Dumbbell className="w-5 h-5" />
                    Features
                  </button>
                  <button
                    onClick={() => setActiveTab("scanner")}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      activeTab === "scanner"
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <Scan className="w-5 h-5" />
                    QR Scanner
                  </button>
                  <button
                    onClick={() => setActiveTab("profile")}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      activeTab === "profile"
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <User className="w-5 h-5" />
                    Profile
                  </button>
                  <button
                    onClick={() => setActiveTab("history")}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      activeTab === "history"
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <History className="w-5 h-5" />
                    Scan History
                  </button>
                  <button
                    onClick={() => navigate("/orders")}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-muted-foreground hover:bg-muted hover:text-foreground"
                  >
                    <ShoppingBag className="w-5 h-5" />
                    My Orders
                  </button>
                  <button
                    onClick={() => setActiveTab("settings")}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      activeTab === "settings"
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <CreditCard className="w-5 h-5" />
                    Subscription
                  </button>
                </nav>

                {/* Current Status Card */}
                <div className="bg-card rounded-xl p-4 mt-4">
                  <h3 className="font-medium text-foreground mb-3">
                    Current Plan
                  </h3>
                  <div className="flex items-center gap-2 text-primary mb-2">
                    <div className="w-3 h-3 rounded-full bg-primary animate-pulse" />
                    <span className="text-sm font-medium capitalize">
                      {currentPlan?.replace("city-", "").replace("-", " ") ||
                        "Premium"}{" "}
                      Plan
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Valid until{" "}
                    {new Date(
                      Date.now() + 30 * 24 * 60 * 60 * 1000
                    ).toLocaleDateString()}
                  </p>
                </div>

                {/* Gym Streak Card */}
                <div className="mt-4">
                  <GymStreak />
                </div>
              </aside>

              {/* Main Content */}
              <main className="flex-1">
                {activeTab === "nearby" && coordinates && (
                  <div>
                    <h1 className="font-display text-3xl font-bold text-foreground mb-6">
                      Gyms <span className="text-gradient">Near You</span>
                    </h1>
                    <NearbyGymsMap userLocation={coordinates} />
                  </div>
                )}

                {activeTab === "features" && <DashboardFeatures />}

                {activeTab === "scanner" && <QRScanner />}

                {activeTab === "profile" && (
                  <div>
                    <h1 className="font-display text-3xl font-bold text-foreground mb-6">
                      Profile Settings
                    </h1>
                    <div className="bg-card rounded-xl p-6 space-y-6">
                      <div className="flex items-center gap-4">
                        <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center">
                          <User className="w-10 h-10 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-display text-xl font-bold text-foreground">
                            {displayName}
                          </h3>
                          <p className="text-muted-foreground">{user?.email}</p>
                        </div>
                      </div>
                      <div className="grid md:grid-cols-2 gap-4 pt-4 border-t border-border">
                        <div>
                          <label className="text-muted-foreground text-sm">
                            Full Name
                          </label>
                          <p className="text-foreground font-medium">
                            {profile?.full_name || "Not set"}
                          </p>
                        </div>
                        <div>
                          <label className="text-muted-foreground text-sm">
                            Email
                          </label>
                          <p className="text-foreground font-medium">
                            {user?.email}
                          </p>
                        </div>
                        <div>
                          <label className="text-muted-foreground text-sm">
                            Member Since
                          </label>
                          <p className="text-foreground font-medium">
                            {memberSince}
                          </p>
                        </div>
                        <div>
                          <label className="text-muted-foreground text-sm">
                            Phone
                          </label>
                          <p className="text-foreground font-medium">
                            {profile?.phone || "Not set"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "history" && (
                  <div>
                    <h1 className="font-display text-3xl font-bold text-foreground mb-6">
                      Scan History
                    </h1>
                    <div className="space-y-4">
                      {[
                        {
                          gym: "FitZone Gulberg",
                          city: "Lahore",
                          date: "2024-01-15",
                          time: "09:30 AM",
                        },
                        {
                          gym: "PowerHouse DHA",
                          city: "Lahore",
                          date: "2024-01-12",
                          time: "06:00 PM",
                        },
                        {
                          gym: "Iron Paradise",
                          city: "Islamabad",
                          date: "2024-01-10",
                          time: "07:00 AM",
                        },
                        {
                          gym: "Muscle Factory",
                          city: "Karachi",
                          date: "2024-01-08",
                          time: "05:30 PM",
                        },
                      ].map((visit, index) => (
                        <div
                          key={index}
                          className="bg-card rounded-xl p-5 border border-border"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center">
                                <QrCode className="w-6 h-6 text-primary" />
                              </div>
                              <div>
                                <h3 className="font-display font-bold text-foreground">
                                  {visit.gym}
                                </h3>
                                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                                  <MapPin className="w-4 h-4" />
                                  {visit.city}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-foreground text-sm font-medium">
                                {visit.date}
                              </p>
                              <p className="text-muted-foreground text-sm">
                                {visit.time}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === "settings" && (
                  <div>
                    <h1 className="font-display text-3xl font-bold text-foreground mb-6">
                      Subscription Settings
                    </h1>
                    <div className="space-y-6">
                      {/* Current Subscription */}
                      <div className="bg-card rounded-xl p-6 border border-primary/20">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-display text-lg font-bold text-foreground">
                            Current Subscription
                          </h3>
                          <span className="bg-primary/20 text-primary text-xs font-bold px-3 py-1 rounded-full">
                            ACTIVE
                          </span>
                        </div>
                        <div className="grid md:grid-cols-3 gap-4">
                          <div>
                            <p className="text-muted-foreground text-sm">
                              Plan
                            </p>
                            <p className="text-foreground font-medium capitalize">
                              {currentPlan
                                ?.replace("city-", "")
                                .replace("-", " ") || "Premium"}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground text-sm">
                              Valid Until
                            </p>
                            <p className="text-foreground font-medium">
                              {new Date(
                                Date.now() + 30 * 24 * 60 * 60 * 1000
                              ).toLocaleDateString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground text-sm">
                              Amount Paid
                            </p>
                            <p className="text-foreground font-medium">
                              PKR 2,999
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Auto Renew */}
                      <div className="bg-card rounded-xl p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <RotateCcw className="w-5 h-5 text-primary" />
                            <div>
                              <Label
                                htmlFor="auto-renew-settings"
                                className="text-foreground font-medium"
                              >
                                Auto-Renew Subscription
                              </Label>
                              <p className="text-muted-foreground text-sm">
                                Automatically renew when your plan expires
                              </p>
                            </div>
                          </div>
                          <Switch
                            id="auto-renew-settings"
                            checked={autoRenew}
                            onCheckedChange={setAutoRenew}
                          />
                        </div>
                      </div>

                      {/* Upgrade Plan */}
                      <div className="bg-card rounded-xl p-6">
                        <h3 className="font-display text-lg font-bold text-foreground mb-4">
                          Upgrade Your Plan
                        </h3>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="p-4 border border-border rounded-xl hover:border-primary/30 transition-colors cursor-pointer">
                            <h4 className="font-medium text-foreground mb-1">
                              6 Months Plan
                            </h4>
                            <p className="text-muted-foreground text-sm mb-2">
                              15% savings
                            </p>
                            <p className="font-display text-xl font-bold text-primary">
                              PKR 14,999
                            </p>
                          </div>
                          <div className="p-4 border border-primary/50 rounded-xl bg-primary/5 cursor-pointer">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium text-foreground">
                                Yearly Plan
                              </h4>
                              <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                                BEST VALUE
                              </span>
                            </div>
                            <p className="text-muted-foreground text-sm mb-2">
                              30% savings
                            </p>
                            <p className="font-display text-xl font-bold text-primary">
                              PKR 24,999
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Corporate Plans */}
                      <div className="bg-gradient-card rounded-xl p-6 border border-primary/20">
                        <div className="flex items-center gap-3 mb-2">
                          <Building2 className="w-6 h-6 text-primary" />
                          <h3 className="font-display text-lg font-bold text-foreground">
                            Corporate Plans
                          </h3>
                          <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">
                            Coming Soon
                          </span>
                        </div>
                        <p className="text-muted-foreground">
                          Bulk subscriptions for companies. Give your employees
                          fitness benefits with discounted rates.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </main>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Dashboard;
