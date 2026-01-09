import { useState, useEffect } from "react";
import { Flame, Calendar, Trophy, TrendingUp } from "lucide-react";
import { supabase } from "../../Integrations/client";
import { useAuth } from "../../Contexts/AuthContext";

const GymStreak = () => {
  const { user } = useAuth();
  const [streak, setStreak] = useState(0);
  const [totalVisits, setTotalVisits] = useState(0);
  const [thisWeek, setThisWeek] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchStreakData();
    }
  }, [user]);

  const fetchStreakData = async () => {
    if (!user) return;

    try {
      // Fetch all check-ins for the user
      const { data: checkIns, error } = await supabase
        .from("check_ins")
        .select("checked_in_at")
        .eq("user_id", user.id)
        .order("checked_in_at", { ascending: false });

      if (error || !checkIns) {
        setLoading(false);
        return;
      }

      // Calculate total visits
      setTotalVisits(checkIns.length);

      // Calculate this week's visits
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      weekStart.setHours(0, 0, 0, 0);

      const weekVisits = checkIns.filter(
        (ci) => new Date(ci.checked_in_at) >= weekStart
      ).length;
      setThisWeek(weekVisits);

      // Calculate streak (consecutive days)
      const uniqueDays = new Set<string>();
      checkIns.forEach((ci) => {
        const date = new Date(ci.checked_in_at).toDateString();
        uniqueDays.add(date);
      });

      const sortedDays = Array.from(uniqueDays)
        .map((d) => new Date(d))
        .sort((a, b) => b.getTime() - a.getTime());

      let currentStreak = 0;
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      for (let i = 0; i < sortedDays.length; i++) {
        const checkDate = new Date(sortedDays[i]);
        checkDate.setHours(0, 0, 0, 0);

        const expectedDate = new Date(today);
        expectedDate.setDate(today.getDate() - i);
        expectedDate.setHours(0, 0, 0, 0);

        if (checkDate.getTime() === expectedDate.getTime()) {
          currentStreak++;
        } else if (
          i === 0 &&
          checkDate.getTime() === expectedDate.getTime() - 86400000
        ) {
          // Yesterday counts for streak continuation
          const yesterdayExpected = new Date(today);
          yesterdayExpected.setDate(today.getDate() - 1);
          if (checkDate.getTime() === yesterdayExpected.getTime()) {
            currentStreak++;
          } else {
            break;
          }
        } else {
          break;
        }
      }

      setStreak(currentStreak);
    } catch (err) {
      console.error("Error fetching streak:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-card rounded-xl p-4 animate-pulse">
        <div className="h-16 bg-muted rounded" />
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-primary/20 via-card to-card rounded-xl p-6 border border-primary/30">
      <h3 className="font-display text-lg font-bold text-foreground mb-4 flex items-center gap-2">
        <Flame className="w-5 h-5 text-primary" />
        Daily Gym Streak
      </h3>

      <div className="grid grid-cols-3 gap-4">
        {/* Current Streak */}
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-2">
            <div className="absolute inset-0 bg-primary/20 rounded-full animate-pulse" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold text-primary">{streak}</span>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">Day Streak</p>
          {streak >= 7 && (
            <span className="inline-flex items-center gap-1 text-xs text-primary mt-1">
              <Trophy className="w-3 h-3" />
              Champion!
            </span>
          )}
        </div>

        {/* This Week */}
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-2 bg-muted rounded-full flex items-center justify-center">
            <Calendar className="w-6 h-6 text-muted-foreground" />
          </div>
          <p className="text-xl font-bold text-foreground">{thisWeek}/7</p>
          <p className="text-sm text-muted-foreground">This Week</p>
        </div>

        {/* Total Visits */}
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-2 bg-muted rounded-full flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-muted-foreground" />
          </div>
          <p className="text-xl font-bold text-foreground">{totalVisits}</p>
          <p className="text-sm text-muted-foreground">Total Visits</p>
        </div>
      </div>

      {/* Motivation Message */}
      <div className="mt-4 pt-4 border-t border-border">
        <p className="text-sm text-center text-muted-foreground">
          {streak === 0 && "Start your streak today! Visit a gym to begin. 💪"}
          {streak >= 1 && streak < 3 && "Great start! Keep it going! 🔥"}
          {streak >= 3 &&
            streak < 7 &&
            "You're on fire! Don't break the chain! 🚀"}
          {streak >= 7 && streak < 14 && "1 week strong! You're a champion! 🏆"}
          {streak >= 14 && streak < 30 && "2 weeks! You're unstoppable! ⭐"}
          {streak >= 30 && "30+ days! Legendary dedication! 👑"}
        </p>
      </div>
    </div>
  );
};

export default GymStreak;
