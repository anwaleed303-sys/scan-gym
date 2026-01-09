import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  DollarSign,
  Users,
  TrendingUp,
  UserPlus,
  Calendar,
} from "lucide-react";
import { supabase } from "../../Integrations/client";
import { useToast } from "../../hooks/use-toast";
import {
  format,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachMonthOfInterval,
  subDays,
  eachDayOfInterval,
} from "date-fns";

interface ReportsAnalyticsProps {
  gymIds: string[];
  gyms: { id: string; name: string }[];
}

interface MonthlyRevenue {
  month: string;
  revenue: number;
}

interface DailyCheckIn {
  date: string;
  checkIns: number;
}

interface MembershipStats {
  type: string;
  count: number;
}

const COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

const ReportsAnalytics = ({ gymIds, gyms }: ReportsAnalyticsProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [selectedGym, setSelectedGym] = useState<string>("all");
  const [timeRange, setTimeRange] = useState<string>("6months");

  // Stats
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalMembers, setTotalMembers] = useState(0);
  const [activeMembers, setActiveMembers] = useState(0);
  const [newMembersThisMonth, setNewMembersThisMonth] = useState(0);
  const [monthlyRevenue, setMonthlyRevenue] = useState<MonthlyRevenue[]>([]);
  const [dailyCheckIns, setDailyCheckIns] = useState<DailyCheckIn[]>([]);
  const [membershipStats, setMembershipStats] = useState<MembershipStats[]>([]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const filterGymIds = selectedGym === "all" ? gymIds : [selectedGym];
      const monthsBack =
        timeRange === "3months" ? 3 : timeRange === "6months" ? 6 : 12;

      // Fetch total revenue
      const { data: payments, error: paymentsError } = await supabase
        .from("member_payments")
        .select("amount, payment_date, gym_id")
        .in("gym_id", filterGymIds);

      if (paymentsError) throw paymentsError;

      const total = payments?.reduce((sum, p) => sum + p.amount, 0) || 0;
      setTotalRevenue(total);

      // Calculate monthly revenue
      const startDate = startOfMonth(subMonths(new Date(), monthsBack - 1));
      const endDate = endOfMonth(new Date());
      const months = eachMonthOfInterval({ start: startDate, end: endDate });

      const revenueByMonth = months.map((month) => {
        const monthStart = startOfMonth(month);
        const monthEnd = endOfMonth(month);
        const monthRevenue =
          payments
            ?.filter((p) => {
              const paymentDate = new Date(p.payment_date);
              return paymentDate >= monthStart && paymentDate <= monthEnd;
            })
            .reduce((sum, p) => sum + p.amount, 0) || 0;

        return {
          month: format(month, "MMM yyyy"),
          revenue: monthRevenue,
        };
      });
      setMonthlyRevenue(revenueByMonth);

      // Fetch members
      const { data: members, error: membersError } = await supabase
        .from("gym_members")
        .select("id, status, membership_type, created_at")
        .in("gym_id", filterGymIds);

      if (membersError) throw membersError;

      setTotalMembers(members?.length || 0);
      setActiveMembers(
        members?.filter((m) => m.status === "active").length || 0
      );

      // New members this month
      const thisMonthStart = startOfMonth(new Date());
      const newMembers =
        members?.filter((m) => new Date(m.created_at) >= thisMonthStart)
          .length || 0;
      setNewMembersThisMonth(newMembers);

      // Membership type distribution
      const typeCount: Record<string, number> = {};
      members?.forEach((m) => {
        typeCount[m.membership_type] = (typeCount[m.membership_type] || 0) + 1;
      });
      setMembershipStats(
        Object.entries(typeCount).map(([type, count]) => ({
          type: type.charAt(0).toUpperCase() + type.slice(1),
          count,
        }))
      );

      // Fetch daily check-ins for last 30 days
      const thirtyDaysAgo = subDays(new Date(), 30);
      const { data: checkIns, error: checkInsError } = await supabase
        .from("check_ins")
        .select("checked_in_at")
        .in("gym_id", filterGymIds)
        .gte("checked_in_at", thirtyDaysAgo.toISOString());

      if (checkInsError) throw checkInsError;

      const days = eachDayOfInterval({ start: thirtyDaysAgo, end: new Date() });
      const checkInsByDay = days.map((day) => {
        const dayStart = new Date(day);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(day);
        dayEnd.setHours(23, 59, 59, 999);

        const count =
          checkIns?.filter((c) => {
            const checkInDate = new Date(c.checked_in_at);
            return checkInDate >= dayStart && checkInDate <= dayEnd;
          }).length || 0;

        return {
          date: format(day, "dd MMM"),
          checkIns: count,
        };
      });
      setDailyCheckIns(checkInsByDay);
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

  useEffect(() => {
    if (gymIds.length > 0) {
      fetchAnalytics();
    }
  }, [gymIds, selectedGym, timeRange]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {gyms.length > 1 && (
          <Select value={selectedGym} onValueChange={setSelectedGym}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Select gym" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Gyms</SelectItem>
              {gyms.map((gym) => (
                <SelectItem key={gym.id} value={gym.id}>
                  {gym.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="3months">Last 3 Months</SelectItem>
            <SelectItem value="6months">Last 6 Months</SelectItem>
            <SelectItem value="12months">Last 12 Months</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Revenue
            </CardTitle>
            <DollarSign className="w-5 h-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              Rs. {totalRevenue.toLocaleString()}
            </div>
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
            <p className="text-xs text-muted-foreground">
              {activeMembers} active
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
            <p className="text-xs text-muted-foreground">new members</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg Monthly Revenue
            </CardTitle>
            <TrendingUp className="w-5 h-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              Rs.{" "}
              {monthlyRevenue.length > 0
                ? Math.round(
                    monthlyRevenue.reduce((sum, m) => sum + m.revenue, 0) /
                      monthlyRevenue.length
                  ).toLocaleString()
                : 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-primary" />
              Revenue Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            {monthlyRevenue.length > 0 ? (
              <ResponsiveContainer
                width="100%"
                height={250}
                className="md:h-[300px]"
              >
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
                    tickLine={{ stroke: "hsl(var(--border))" }}
                  />
                  <YAxis
                    tick={{
                      fill: "hsl(var(--muted-foreground))",
                      fontSize: 12,
                    }}
                    tickLine={{ stroke: "hsl(var(--border))" }}
                    tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(0 0% 0%)",
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
                    fill="hsl(var(--primary))"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] md:h-[300px] flex items-center justify-center text-muted-foreground">
                No revenue data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Check-ins Chart */}
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
                    tickLine={{ stroke: "hsl(var(--border))" }}
                    interval={4}
                  />
                  <YAxis
                    tick={{
                      fill: "hsl(var(--muted-foreground))",
                      fontSize: 12,
                    }}
                    tickLine={{ stroke: "hsl(var(--border))" }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(0 0% 0%)",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                    formatter={(value: number) => [value, "Check-ins"]}
                  />
                  <Line
                    type="monotone"
                    dataKey="checkIns"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] md:h-[300px]  flex items-center justify-center text-muted-foreground">
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
          {membershipStats.length > 0 ? (
            <div className="flex flex-col lg:flex-row items-center gap-8">
              <ResponsiveContainer
                width="100%"
                height={250}
                className="max-w-full lg:max-w-[300px]"
              >
                <PieChart>
                  <Pie
                    data={membershipStats}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="count"
                  >
                    {membershipStats.map((_, index) => (
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
                    itemStyle={{
                      color: " hsl(25 100% 50%)",
                    }}
                    formatter={(value: number) => [value, "Members"]}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                {membershipStats.map((stat, index) => (
                  <div key={stat.type} className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <div>
                      <p className="font-medium text-foreground">{stat.type}</p>
                      <p className="text-sm text-muted-foreground">
                        {stat.count} members
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
    </div>
  );
};

export default ReportsAnalytics;
