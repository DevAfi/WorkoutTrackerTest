import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { supabase } from "../../lib/supabase";
import LevelProgressBar from "./progressBarComponent";

export default function XPLevelDashboard({ userId, showXPAnimation = false }) {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      fetchUserData();
      const subscription = supabase
        .channel("xp-updates")
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "user_misc_data",
            filter: `user_id=eq.${userId}`,
          },
          (payload) => {
            setUserData(payload.new);
          }
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [userId]);

  async function fetchUserData() {
    try {
      const { data, error } = await supabase
        .from("user_misc_data")
        .select(
          `
          total_xp,
          current_level,
          xp_to_next_level,
          total_workouts,
          total_workout_time
        `
        )
        .eq("user_id", userId)
        .single();

      if (error && error.code !== "PGRST116") throw error;

      if (data) {
        setUserData(data);
      } else {
        // Create initial record if it doesn't exist
        const { data: newData, error: insertError } = await supabase
          .from("user_misc_data")
          .insert({ user_id: userId })
          .select()
          .single();

        if (!insertError) {
          setUserData(newData);
        }
      }
    } catch (err) {
      console.error("Error fetching user data:", err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Loading your progress...</Text>
      </View>
    );
  }

  if (!userData) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Unable to load progress data</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Your Progress</Text>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{userData.total_workouts}</Text>
            <Text style={styles.statLabel}>Workouts</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {Math.floor(userData.total_workout_time / 60)}h{" "}
              {userData.total_workout_time % 60}m
            </Text>
            <Text style={styles.statLabel}>Time Trained</Text>
          </View>
        </View>
      </View>

      <View style={styles.xpContainer}>
        <View style={styles.xpHeader}>
          <Text style={styles.levelBadge}>LVL {userData.current_level}</Text>
          <Text style={styles.xpText}>{userData.total_xp} XP</Text>
        </View>

        {showXPAnimation && (
          <View style={styles.xpGainBadge}>
            <Text style={styles.xpGainText}>+50 XP!</Text>
          </View>
        )}
      </View>

      <LevelProgressBar
        currentLevel={userData.current_level}
        totalXP={userData.total_xp}
        xpToNextLevel={userData.xp_to_next_level}
        animated={true}
      />

      <View style={styles.nextLevelContainer}>
        <Text style={styles.nextLevelText}>
          🎯 {userData.xp_to_next_level} XP until Level{" "}
          {userData.current_level + 1}
        </Text>
        <Text style={styles.motivationText}>
          Keep it up! You're doing great! 💪
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    margin: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  loadingContainer: {
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 10,
    color: "#6c757d",
    fontSize: 16,
  },
  errorText: {
    textAlign: "center",
    color: "#dc3545",
    fontSize: 16,
  },
  header: {
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#212529",
    marginBottom: 12,
    textAlign: "center",
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#007bff",
  },
  statLabel: {
    fontSize: 12,
    color: "#6c757d",
    marginTop: 4,
  },
  xpContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    position: "relative",
  },
  xpHeader: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  levelBadge: {
    backgroundColor: "#007bff",
    color: "white",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    fontSize: 16,
    fontWeight: "bold",
    marginRight: 12,
  },
  xpText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#495057",
  },
  xpGainBadge: {
    position: "absolute",
    right: 0,
    top: -10,
    backgroundColor: "#28a745",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  xpGainText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 14,
  },
  nextLevelContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    alignItems: "center",
  },
  nextLevelText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#495057",
    textAlign: "center",
  },
  motivationText: {
    fontSize: 14,
    color: "#6c757d",
    marginTop: 4,
    textAlign: "center",
  },
});
