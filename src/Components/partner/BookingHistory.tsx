import { useEffect, useState } from "react";
import { supabase } from "../../Integrations/client";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { Calendar, Clock, User, Dumbbell } from "lucide-react";

interface Booking {
  id: string;
  trainer_name: string;
  trainer_specialty: string | null;
  session_date: string;
  session_time: string;
  price: number;
  status: string;
  created_at: string;
  user_profile: {
    full_name: string | null;
  } | null;
  gym: {
    name: string;
  } | null;
}

interface BookingHistoryProps {
  gymIds: string[];
}

const BookingHistory = ({ gymIds }: BookingHistoryProps) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      if (gymIds.length === 0) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("bookings")
        .select(
          `
          id,
          trainer_name,
          trainer_specialty,
          session_date,
          session_time,
          price,
          status,
          created_at,
          user_id,
          gym_id
        `
        )
        .in("gym_id", gymIds)
        .order("session_date", { ascending: false });

      if (error) {
        console.error("Error fetching bookings:", error);
        setLoading(false);
        return;
      }

      // Fetch user profiles and gym names
      // Fetch user profiles and gym names
      const bookingsWithDetails = await Promise.all(
        (data || []).map(async (booking) => {
          const [profileResult, gymResult] = await Promise.all([
            // Only fetch profile if user_id exists
            booking.user_id
              ? supabase
                  .from("profiles")
                  .select("full_name")
                  .eq("id", booking.user_id)
                  .single()
              : Promise.resolve({ data: null, error: null }),
            // Only fetch gym if gym_id exists
            booking.gym_id
              ? supabase
                  .from("gyms")
                  .select("name")
                  .eq("id", booking.gym_id)
                  .single()
              : Promise.resolve({ data: null, error: null }),
          ]);

          return {
            ...booking,
            user_profile: profileResult.data,
            gym: gymResult.data,
          };
        })
      );
      setBookings(bookingsWithDetails);
      setLoading(false);
    };

    fetchBookings();
  }, [gymIds]);

  if (loading) {
    return (
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardContent className="p-6">
          <p className="text-muted-foreground text-center">
            Loading bookings...
          </p>
        </CardContent>
      </Card>
    );
  }

  if (bookings.length === 0) {
    return (
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardContent className="p-6">
          <p className="text-muted-foreground text-center">
            No trainer bookings yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-primary/20 text-primary border-primary/30";
      case "completed":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "cancelled":
        return "bg-destructive/20 text-destructive border-destructive/30";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="space-y-3">
      {bookings.map((booking) => (
        <Card
          key={booking.id}
          className="bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/30 transition-colors"
        >
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-primary" />
                  <span className="font-medium text-foreground">
                    {booking.user_profile?.full_name || "Unknown Customer"}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Dumbbell className="h-4 w-4" />
                  <span>
                    Trainer: {booking.trainer_name}
                    {booking.trainer_specialty &&
                      ` (${booking.trainer_specialty})`}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {new Date(booking.session_date).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{booking.session_time}</span>
                  </div>
                </div>
                {booking.gym && (
                  <p className="text-xs text-muted-foreground">
                    Gym: {booking.gym.name}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-3">
                <span className="text-primary font-semibold">
                  ₦{booking.price.toLocaleString()}
                </span>
                <Badge className={getStatusColor(booking.status)}>
                  {booking.status}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default BookingHistory;
