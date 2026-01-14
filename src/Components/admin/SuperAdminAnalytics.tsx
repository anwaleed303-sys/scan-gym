// At the top, update the import from react:
import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { supabase } from "../../Integrations/client";
import { useToast } from "../../hooks/use-toast";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  Users,
  DollarSign,
  TrendingUp,
  Calendar,
  Activity,
  CreditCard,
  UserPlus,
  Building2,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  format,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachMonthOfInterval,
  subDays,
  eachDayOfInterval,
} from "date-fns";

interface SuperAdminAnalyticsProps {
  gyms: { id: string; name: string; city: string }[];
}

interface GymPerformance {
  gym_name: string;
  check_ins: number;
  members: number;
  revenue: number;
  active_members: number;
}

interface MonthlyRevenue {
  month: string;
  revenue: number;
}

interface DailyCheckIn {
  date: string;
  checkIns: number;
}

interface MembershipDistribution {
  type: string;
  count: number;
  percentage: number;
}

interface RecentActivity {
  id: string;
  type: "check_in" | "payment" | "new_member" | "booking";
  member_name: string;
  gym_name: string;
  amount?: number;
  timestamp: string;
}

const COLORS = [
  "hsl(25 100% 50%)",
  "hsl(210 100% 50%)",
  "hsl(142 76% 36%)",
  "hsl(262 83% 58%)",
  "hsl(37 92% 50%)",
];

const SuperAdminAnalytics = ({ gyms }: SuperAdminAnalyticsProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<string>("30days");
  const [selectedTab, setSelectedTab] = useState("overview");

  // Summary Stats
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalMembers, setTotalMembers] = useState(0);
  const [totalCheckIns, setTotalCheckIns] = useState(0);
  const [totalActiveMembers, setTotalActiveMembers] = useState(0);
  const [newMembersThisMonth, setNewMembersThisMonth] = useState(0);
  const [revenueGrowth, setRevenueGrowth] = useState(0);

  // Detailed Data
  const [gymPerformance, setGymPerformance] = useState<GymPerformance[]>([]);
  const [monthlyRevenue, setMonthlyRevenue] = useState<MonthlyRevenue[]>([]);
  const [dailyCheckIns, setDailyCheckIns] = useState<DailyCheckIn[]>([]);
  const [membershipDistribution, setMembershipDistribution] = useState<
    MembershipDistribution[]
  >([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [cityPerformance, setCityPerformance] = useState<
    { city: string; gyms: number; members: number; revenue: number }[]
  >([]);

  const gymIds = useMemo(() => gyms.map((g) => g.id), [gyms]);

  useEffect(() => {
    if (gymIds.length > 0) {
      fetchAnalytics();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeRange, gymIds.length]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);

      // Calculate date ranges
      const now = new Date();
      let startDate = new Date();
      const daysMap: Record<string, number> = {
        "7days": 7,
        "30days": 30,
        "90days": 90,
        "12months": 365,
      };
      startDate = subDays(now, daysMap[timeRange] || 30);

      // Fetch all members
      const { data: allMembers, error: membersError } = await supabase
        .from("gym_members")
        .select("id, gym_id, status, membership_type, created_at")
        .in("gym_id", gymIds);

      if (membersError) throw membersError;

      setTotalMembers(allMembers?.length || 0);
      setTotalActiveMembers(
        allMembers?.filter((m) => m.status === "active").length || 0
      );

      // New members this month
      const thisMonthStart = startOfMonth(now);
      const newMembers =
        allMembers?.filter((m) => new Date(m.created_at) >= thisMonthStart)
          .length || 0;
      setNewMembersThisMonth(newMembers);

      // Membership distribution
      const typeCount: Record<string, number> = {};
      allMembers?.forEach((m) => {
        typeCount[m.membership_type] = (typeCount[m.membership_type] || 0) + 1;
      });
      const distribution = Object.entries(typeCount).map(([type, count]) => ({
        type: type.charAt(0).toUpperCase() + type.slice(1).replace("_", " "),
        count,
        percentage: Math.round((count / (allMembers?.length || 1)) * 100),
      }));
      setMembershipDistribution(distribution);

      // Fetch all payments
      const { data: allPayments, error: paymentsError } = await supabase
        .from("member_payments")
        .select("amount, payment_date, gym_id, member_id")
        .in("gym_id", gymIds);

      if (paymentsError) throw paymentsError;

      const total = allPayments?.reduce((sum, p) => sum + p.amount, 0) || 0;
      setTotalRevenue(total);

      // Monthly revenue trend
      const monthsBack = timeRange === "12months" ? 12 : 6;
      const monthStart = startOfMonth(subMonths(now, monthsBack - 1));
      const monthEnd = endOfMonth(now);
      const months = eachMonthOfInterval({ start: monthStart, end: monthEnd });

      const revenueByMonth = months.map((month) => {
        const mStart = startOfMonth(month);
        const mEnd = endOfMonth(month);
        const monthRevenue =
          allPayments
            ?.filter((p) => {
              const paymentDate = new Date(p.payment_date);
              return paymentDate >= mStart && paymentDate <= mEnd;
            })
            .reduce((sum, p) => sum + p.amount, 0) || 0;

        return {
          month: format(month, "MMM yyyy"),
          revenue: monthRevenue,
        };
      });
      setMonthlyRevenue(revenueByMonth);

      // Calculate revenue growth
      if (revenueByMonth.length >= 2) {
        const current = revenueByMonth[revenueByMonth.length - 1].revenue;
        const previous = revenueByMonth[revenueByMonth.length - 2].revenue;
        const growth =
          previous > 0
            ? Math.round(((current - previous) / previous) * 100)
            : 0;
        setRevenueGrowth(growth);
      }

      // Fetch all check-ins
      const { data: allCheckIns, error: checkInsError } = await supabase
        .from("check_ins")
        .select("id, gym_id, checked_in_at, user_id")
        .in("gym_id", gymIds)
        .gte("checked_in_at", startDate.toISOString());

      if (checkInsError) throw checkInsError;

      setTotalCheckIns(allCheckIns?.length || 0);

      // Daily check-ins
      const days = eachDayOfInterval({
        start: subDays(now, 30),
        end: now,
      });
      const checkInsByDay = days.map((day) => {
        const dayStart = new Date(day);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(day);
        dayEnd.setHours(23, 59, 59, 999);

        const count =
          allCheckIns?.filter((c) => {
            const checkInDate = new Date(c.checked_in_at);
            return checkInDate >= dayStart && checkInDate <= dayEnd;
          }).length || 0;

        return {
          date: format(day, "dd MMM"),
          checkIns: count,
        };
      });
      setDailyCheckIns(checkInsByDay);

      // Gym Performance
      const gymStats: GymPerformance[] = await Promise.all(
        gyms.map(async (gym) => {
          const gymMembers =
            allMembers?.filter((m) => m.gym_id === gym.id) || [];
          const gymCheckIns =
            allCheckIns?.filter((c) => c.gym_id === gym.id).length || 0;
          const gymRevenue =
            allPayments
              ?.filter((p) => p.gym_id === gym.id)
              .reduce((sum, p) => sum + p.amount, 0) || 0;

          return {
            gym_name: gym.name,
            check_ins: gymCheckIns,
            members: gymMembers.length,
            revenue: gymRevenue,
            active_members: gymMembers.filter((m) => m.status === "active")
              .length,
          };
        })
      );
      setGymPerformance(gymStats.sort((a, b) => b.revenue - a.revenue));

      // City Performance
      const cityStats = gyms.reduce((acc, gym) => {
        const existing = acc.find((c) => c.city === gym.city);
        const gymStat = gymStats.find((g) => g.gym_name === gym.name);

        if (existing && gymStat) {
          existing.gyms += 1;
          existing.members += gymStat.members;
          existing.revenue += gymStat.revenue;
        } else if (gymStat) {
          acc.push({
            city: gym.city,
            gyms: 1,
            members: gymStat.members,
            revenue: gymStat.revenue,
          });
        }
        return acc;
      }, [] as { city: string; gyms: number; members: number; revenue: number }[]);
      setCityPerformance(cityStats.sort((a, b) => b.revenue - a.revenue));

      // Recent Activity (last 10 activities)
      const activities: RecentActivity[] = [];

      // Recent check-ins
      const recentCheckIns = (allCheckIns || [])
        .sort(
          (a, b) =>
            new Date(b.checked_in_at).getTime() -
            new Date(a.checked_in_at).getTime()
        )
        .slice(0, 3);

      for (const checkIn of recentCheckIns) {
        const member = allMembers?.find((m) => m.id === checkIn.user_id);
        const gym = gyms.find((g) => g.id === checkIn.gym_id);
        if (member && gym) {
          // Fetch member name from gym_members
          const { data: memberData } = await supabase
            .from("gym_members")
            .select("name")
            .eq("id", member.id)
            .single();

          activities.push({
            id: checkIn.id,
            type: "check_in",
            member_name: memberData?.name || "Unknown",
            gym_name: gym.name,
            timestamp: checkIn.checked_in_at,
          });
        }
      }

      // Recent payments
      const recentPayments = (allPayments || [])
        .sort(
          (a, b) =>
            new Date(b.payment_date).getTime() -
            new Date(a.payment_date).getTime()
        )
        .slice(0, 3);

      for (const payment of recentPayments) {
        const gym = gyms.find((g) => g.id === payment.gym_id);
        const { data: memberData } = await supabase
          .from("gym_members")
          .select("name")
          .eq("id", payment.member_id)
          .single();

        if (gym) {
          activities.push({
            id: payment.member_id,
            type: "payment",
            member_name: memberData?.name || "Unknown",
            gym_name: gym.name,
            amount: payment.amount,
            timestamp: payment.payment_date,
          });
        }
      }

      // Recent new members
      const recentNewMembers = (allMembers || [])
        .sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
        .slice(0, 4);

      for (const member of recentNewMembers) {
        const gym = gyms.find((g) => g.id === member.gym_id);
        const { data: memberData } = await supabase
          .from("gym_members")
          .select("name")
          .eq("id", member.id)
          .single();

        if (gym) {
          activities.push({
            id: member.id,
            type: "new_member",
            member_name: memberData?.name || "Unknown",
            gym_name: gym.name,
            timestamp: member.created_at,
          });
        }
      }

      setRecentActivity(
        activities
          .sort(
            (a, b) =>
              new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          )
          .slice(0, 10)
      );
    } catch (error) {
      console.error("Error fetching analytics:", error);
      toast({
        title: "Error",
        description: "Failed to load analytics data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "check_in":
        return <Activity className="w-4 h-4" />;
      case "payment":
        return <CreditCard className="w-4 h-4" />;
      case "new_member":
        return <UserPlus className="w-4 h-4" />;
      case "booking":
        return <Calendar className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case "check_in":
        return "text-blue-500 bg-blue-500/10";
      case "payment":
        return "text-green-500 bg-green-500/10";
      case "new_member":
        return "text-purple-500 bg-purple-500/10";
      case "booking":
        return "text-orange-500 bg-orange-500/10";
      default:
        return "text-gray-500 bg-gray-500/10";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Super Admin Analytics
          </h1>
          <p className="text-muted-foreground mt-1">
            Complete overview of all {gyms.length} gym locations
          </p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7days">Last 7 Days</SelectItem>
            <SelectItem value="30days">Last 30 Days</SelectItem>
            <SelectItem value="90days">Last 90 Days</SelectItem>
            <SelectItem value="12months">Last 12 Months</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="w-5 h-5 opacity-80" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              Rs. {totalRevenue.toLocaleString()}
            </div>
            <p className="text-xs opacity-80 mt-1">
              {revenueGrowth > 0 ? "+" : ""}
              {revenueGrowth}% from last month
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Members
            </CardTitle>
            <Users className="w-5 h-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {totalMembers}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {totalActiveMembers} active members
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Check-ins
            </CardTitle>
            <Activity className="w-5 h-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {totalCheckIns}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              In selected period
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              New This Month
            </CardTitle>
            <UserPlus className="w-5 h-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {newMembersThisMonth}
            </div>
            <p className="text-xs text-muted-foreground mt-1">New members</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="gyms">By Gym</TabsTrigger>
          <TabsTrigger value="cities">By City</TabsTrigger>
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Trend */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  Revenue Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                {monthlyRevenue.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={monthlyRevenue}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="hsl(var(--border))"
                      />
                      <XAxis
                        dataKey="month"
                        tick={{
                          fill: "hsl(var(--muted-foreground))",
                          fontSize: 12,
                        }}
                      />
                      <YAxis
                        tick={{
                          fill: "hsl(var(--muted-foreground))",
                          fontSize: 12,
                        }}
                        tickFormatter={(value) =>
                          `${(value / 1000).toFixed(0)}k`
                        }
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                        formatter={(value: number) => [
                          `Rs. ${value.toLocaleString()}`,
                          "Revenue",
                        ]}
                      />
                      <Bar
                        dataKey="revenue"
                        fill="hsl(25 100% 50%)"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                    No revenue data available
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Daily Check-ins */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  Daily Check-ins (Last 30 Days)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {dailyCheckIns.some((d) => d.checkIns > 0) ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={dailyCheckIns}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="hsl(var(--border))"
                      />
                      <XAxis
                        dataKey="date"
                        tick={{
                          fill: "hsl(var(--muted-foreground))",
                          fontSize: 10,
                        }}
                        interval={4}
                      />
                      <YAxis
                        tick={{
                          fill: "hsl(var(--muted-foreground))",
                          fontSize: 12,
                        }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                        formatter={(value: number) => [value, "Check-ins"]}
                      />
                      <Line
                        type="monotone"
                        dataKey="checkIns"
                        stroke="hsl(25 100% 50%)"
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                    No check-in data available
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Membership Distribution */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                Membership Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              {membershipDistribution.length > 0 ? (
                <div className="flex flex-col lg:flex-row items-center gap-8">
                  <ResponsiveContainer
                    width="100%"
                    height={250}
                    className="max-w-[300px]"
                  >
                    <PieChart>
                      <Pie
                        data={membershipDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="count"
                      >
                        {membershipDistribution.map((_, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                        formatter={(value: number) => [value, "Members"]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                    {membershipDistribution.map((stat, index) => (
                      <div key={stat.type} className="flex items-center gap-3">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{
                            backgroundColor: COLORS[index % COLORS.length],
                          }}
                        />
                        <div>
                          <p className="font-medium text-foreground">
                            {stat.type}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {stat.count} members ({stat.percentage}%)
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                  No membership data available
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* By Gym Tab */}
        <TabsContent value="gyms" className="space-y-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-primary" />
                Gym Performance Comparison
              </CardTitle>
            </CardHeader>
            <CardContent>
              {gymPerformance.length > 0 ? (
                <div className="space-y-4">
                  {gymPerformance.map((gym, index) => (
                    <div
                      key={gym.gym_name}
                      className="p-4 bg-secondary/50 rounded-lg border border-border"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-2xl font-bold text-muted-foreground">
                              #{index + 1}
                            </span>
                            <h3 className="font-semibold text-lg text-foreground">
                              {gym.gym_name}
                            </h3>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-primary">
                            Rs. {gym.revenue.toLocaleString()}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Revenue
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div className="text-center p-3 bg-card rounded-md">
                          <p className="text-2xl font-bold text-foreground">
                            {gym.members}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Total Members
                          </p>
                        </div>
                        <div className="text-center p-3 bg-card rounded-md">
                          <p className="text-2xl font-bold text-green-500">
                            {gym.active_members}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Active Members
                          </p>
                        </div>
                        <div className="text-center p-3 bg-card rounded-md">
                          <p className="text-2xl font-bold text-blue-500">
                            {gym.check_ins}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Check-ins
                          </p>
                        </div>
                      </div>

                      {/* Performance Bar */}
                      <div className="mt-4">
                        <div className="w-full bg-secondary rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-orange-500 to-orange-600 h-2 rounded-full transition-all"
                            style={{
                              width: `${Math.min(
                                (gym.revenue / gymPerformance[0].revenue) * 100,
                                100
                              )}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-[400px] flex items-center justify-center text-muted-foreground">
                  No gym data available
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* By City Tab */}
        <TabsContent value="cities" className="space-y-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-primary" />
                Performance by City
              </CardTitle>
            </CardHeader>
            <CardContent>
              {cityPerformance.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={cityPerformance}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="hsl(var(--border))"
                    />
                    <XAxis
                      dataKey="city"
                      tick={{
                        fill: "hsl(var(--muted-foreground))",
                        fontSize: 12,
                      }}
                    />
                    <YAxis
                      yAxisId="left"
                      tick={{
                        fill: "hsl(var(--muted-foreground))",
                        fontSize: 12,
                      }}
                      tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      tick={{
                        fill: "hsl(var(--muted-foreground))",
                        fontSize: 12,
                      }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend />
                    <Bar
                      yAxisId="left"
                      dataKey="revenue"
                      name="Revenue (Rs.)"
                      fill="hsl(25 100% 50%)"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      yAxisId="right"
                      dataKey="members"
                      name="Members"
                      fill="hsl(210 100% 50%)"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[400px] flex items-center justify-center text-muted-foreground">
                  No city data available
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
                {cityPerformance.map((city) => (
                  <div
                    key={city.city}
                    className="p-4 bg-secondary/50 rounded-lg border border-border"
                  >
                    <h4 className="font-semibold text-lg text-foreground mb-3">
                      {city.city}
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Gyms:</span>
                        <span className="font-medium text-foreground">
                          {city.gyms}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Members:</span>
                        <span className="font-medium text-foreground">
                          {city.members}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Revenue:</span>
                        <span className="font-medium text-primary">
                          Rs. {city.revenue.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Recent Activity Tab */}
        <TabsContent value="activity" className="space-y-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                Recent Activity Across All Gyms
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentActivity.length > 0 ? (
                <div className="space-y-3">
                  {recentActivity.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-start gap-4 p-3 bg-secondary/50 rounded-lg border border-border hover:border-primary/30 transition-colors"
                    >
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${getActivityColor(
                          activity.type
                        )}`}
                      >
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-medium text-foreground">
                              {activity.member_name}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {activity.type === "check_in" &&
                                `Checked in at ${activity.gym_name}`}
                              {activity.type === "payment" &&
                                `Made payment at ${activity.gym_name}`}
                              {activity.type === "new_member" &&
                                `Joined ${activity.gym_name}`}
                              {activity.type === "booking" &&
                                `Booked session at ${activity.gym_name}`}
                            </p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            {activity.amount && (
                              <p className="text-sm font-semibold text-primary">
                                Rs. {activity.amount.toLocaleString()}
                              </p>
                            )}
                            <p className="text-xs text-muted-foreground">
                              {format(
                                new Date(activity.timestamp),
                                "MMM d, h:mm a"
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-[400px] flex items-center justify-center text-muted-foreground">
                  No recent activity
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SuperAdminAnalytics;
