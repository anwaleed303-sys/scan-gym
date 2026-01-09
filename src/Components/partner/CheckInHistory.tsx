import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Badge } from "../ui/badge";
import { Users, Clock } from "lucide-react";
import { supabase } from "../../Integrations/client";
import { format } from "date-fns";

interface CheckIn {
  id: string;
  checked_in_at: string;
  user_name: string | null;
  gym_name: string;
}

interface CheckInHistoryProps {
  gymIds: string[];
}

const CheckInHistory = ({ gymIds }: CheckInHistoryProps) => {
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCheckIns = async () => {
      if (gymIds.length === 0) return;

      try {
        // Fetch recent check-ins with user profiles and gym names
        const { data, error } = await supabase
          .from("check_ins")
          .select(
            `
            id,
            checked_in_at,
            user_id,
            gym_id,
            gyms!inner(name)
          `
          )
          .in("gym_id", gymIds)
          .order("checked_in_at", { ascending: false })
          .limit(50);

        if (error) throw error;

        // Fetch user profiles for these check-ins
        const userIds = [...new Set((data || []).map((c) => c.user_id))];

        let profilesMap: Record<string, string | null> = {};

        if (userIds.length > 0) {
          const { data: profiles } = await supabase
            .from("profiles")
            .select("id, full_name")
            .in("id", userIds);

          profilesMap = (profiles || []).reduce((acc, p) => {
            acc[p.id] = p.full_name;
            return acc;
          }, {} as Record<string, string | null>);
        }

        const formattedCheckIns: CheckIn[] = (data || []).map((c) => ({
          id: c.id,
          checked_in_at: c.checked_in_at,
          user_name: profilesMap[c.user_id] || "Unknown User",
          gym_name: (c.gyms as { name: string }).name,
        }));

        setCheckIns(formattedCheckIns);
      } catch (error) {
        console.error("Error fetching check-ins:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCheckIns();
  }, [gymIds]);

  if (loading) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="py-8 text-center">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          Recent Check-ins
        </CardTitle>
      </CardHeader>
      <CardContent>
        {checkIns.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No check-ins yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer Name</TableHead>
                  <TableHead>Gym</TableHead>
                  <TableHead>Date & Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {checkIns.map((checkIn) => (
                  <TableRow key={checkIn.id}>
                    <TableCell className="font-medium">
                      {checkIn.user_name}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{checkIn.gym_name}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {format(
                        new Date(checkIn.checked_in_at),
                        "MMM d, yyyy 'at' h:mm a"
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CheckInHistory;
