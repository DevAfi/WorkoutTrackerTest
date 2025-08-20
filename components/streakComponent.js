import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { supabase } from "../lib/supabase";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

export default function StreakTracker({ userId }) {
  const [streak, setStreak] = useState(0);
  const [workoutDates, setWorkoutDates] = useState(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      fetchStreak();
    }
  }, [userId]);

  async function fetchStreak() {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc(
        "calculate_user_current_streak",
        {
          p_user_id: userId,
        }
      );

      if (error) throw error;

      setStreak(data || 0);
      await fetchWorkoutDates();
    } catch (err) {
      console.error("Error fetching streak:", err);
      await fetchWorkoutHistoryFallback();
    } finally {
      setLoading(false);
    }
  }

  async function fetchWorkoutDates() {
    try {
      const { data, error } = await supabase
        .from("workout_sessions")
        .select("ended_at")
        .eq("user_id", userId)
        .not("ended_at", "is", null)
        .gte(
          "ended_at",
          new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
        ) // Last 14 days
        .order("ended_at", { ascending: false });

      if (error) throw error;
      const dates = new Set(data.map((w) => w.ended_at.split("T")[0]));
      setWorkoutDates(dates);
    } catch (err) {
      console.error("Error fetching workout dates:", err);
    }
  }

  async function fetchWorkoutHistoryFallback() {
    try {
      const { data, error } = await supabase
        .from("workout_sessions")
        .select("ended_at")
        .eq("user_id", userId)
        .not("ended_at", "is", null) // Only completed workouts
        .order("ended_at", { ascending: false });

      if (error) throw error;

      const uniqueDates = [
        ...new Set(data.map((w) => w.ended_at.split("T")[0])),
      ];
      const streakCount = calculateStreakWithRestDays(uniqueDates);
      setStreak(streakCount);

      const recentDates = new Set(
        uniqueDates.filter((date) => {
          const workoutDate = new Date(date);
          const fourteenDaysAgo = new Date(
            Date.now() - 14 * 24 * 60 * 60 * 1000
          );
          return workoutDate >= fourteenDaysAgo;
        })
      );
      setWorkoutDates(recentDates);
    } catch (err) {
      console.error("Error in fallback streak calculation:", err);
    }
  }

  function calculateStreakWithRestDays(dates) {
    if (dates.length === 0) return 0;

    let count = 0;
    let currentDate = new Date();

    const lastWorkoutDate = new Date(dates[0]);
    const daysSinceLastWorkout = Math.floor(
      (currentDate - lastWorkoutDate) / (1000 * 60 * 60 * 24)
    );

    if (daysSinceLastWorkout > 2) {
      return 0; // Streak is broken
    }

    let checkDate = new Date(dates[0]);
    count = 1;

    for (let i = 1; i < dates.length; i++) {
      const workoutDate = new Date(dates[i]);
      const daysBetween = Math.floor(
        (checkDate - workoutDate) / (1000 * 60 * 60 * 24)
      );

      if (daysBetween <= 3) {
        count++;
        checkDate = workoutDate;
      } else {
        break; // if the break between workout is too big you lose the streak
      }
    }

    return count;
  }

  function hasWorkoutOnDate(daysAgo) {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() - daysAgo);
    const dateString = targetDate.toISOString().split("T")[0];
    return workoutDates.has(dateString);
  }

  if (loading) {
    return <ActivityIndicator />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.streakContainer}>
        <MaterialIcons name="local-fire-department" color="#fff" size={24} />
        <Text style={styles.streakText}> {streak}-Day Streak</Text>
      </View>

      <View style={styles.bubblesContainer}>
        <View style={styles.bubbleRow}>
          {Array.from({ length: 7 }).map((_, i) => {
            const daysAgo = 14 - i; // 14, 13, 12, 11, 10, 9, 8
            return (
              <View
                key={`top-${i}`}
                style={[
                  styles.bubble,
                  hasWorkoutOnDate(daysAgo - 1)
                    ? styles.bubbleActive
                    : styles.bubbleInactive,
                ]}
              />
            );
          })}
        </View>

        <View style={styles.bubbleRow}>
          {Array.from({ length: 7 }).map((_, i) => {
            const daysAgo = 7 - i; // 7, 6, 5, 4, 3, 2, 1
            return (
              <View
                key={`bottom-${i}`}
                style={[
                  styles.bubble,
                  hasWorkoutOnDate(daysAgo - 1)
                    ? styles.bubbleActive
                    : styles.bubbleInactive,
                ]}
              />
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    marginVertical: 10,
  },
  streakContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  streakText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
    fontFamily: "Arial",
  },
  bubblesContainer: {
    alignItems: "center",
    gap: 8,
  },
  bubbleRow: {
    flexDirection: "row",
    gap: 8,
  },
  bubble: {
    width: 20,
    height: 20,
    borderRadius: 5,
  },
  bubbleActive: {
    backgroundColor: "#4caf50",
  },
  bubbleInactive: {
    backgroundColor: "#ccc",
  },
});
