import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { supabase } from "../lib/supabase";

export default function StreakTracker({ userId }) {
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      fetchWorkoutHistory();
    }
  }, [userId]);

  async function fetchWorkoutHistory() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("workout_sessions")
        .select("started_at")
        .eq("user_id", userId)
        .order("started_at", { ascending: false });

      if (error) throw error;
      console.log(data);

      const uniqueDates = [
        ...new Set(data.map((w) => w.started_at.split("T")[0])),
      ];
      const streakCount = calculateStreak(uniqueDates);
      setStreak(streakCount);
    } catch (err) {
      console.error("Error fetching workout history:", err);
    } finally {
      setLoading(false);
    }
  }

  function calculateStreak(dates) {
    let count = 0;
    let dayCursor = new Date();

    for (let i = 0; i < dates.length; i++) {
      const itemDate = new Date(dates[i]);
      const expectedDate = new Date(dayCursor);

      if (
        itemDate.toISOString().split("T")[0] ===
        expectedDate.toISOString().split("T")[0]
      ) {
        count++;
        dayCursor.setDate(dayCursor.getDate() - 1);
      } else if (itemDate < expectedDate) {
        break; // streak ends
      }
    }
    return count;
  }

  if (loading) {
    return <ActivityIndicator />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.streakText}>🔥 {streak}-Day Streak</Text>

      <View style={styles.bubblesContainer}>
        <View style={styles.bubbleRow}>
          {Array.from({ length: 7 }).map((_, i) => {
            const daysAgo = 14 - i; // 14, 13, 12, 11, 10, 9, 8
            return (
              <View
                key={`top-${i}`}
                style={[
                  styles.bubble,
                  streak >= daysAgo
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
                  streak >= daysAgo
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
  streakText: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
    color: "white",
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
    borderRadius: 10,
  },
  bubbleActive: {
    backgroundColor: "#4caf50",
  },
  bubbleInactive: {
    backgroundColor: "#ccc",
  },
});
