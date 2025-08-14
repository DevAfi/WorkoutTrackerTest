import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { supabase } from "../../lib/supabase";

export default function SimpleXPBar({
  userId,
  onPress = null,
  compact = false,
}) {
  const [xpData, setXpData] = useState({
    total_xp: 0,
    current_level: 1,
    xp_to_next_level: 1000,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      fetchXPData();

      // Real-time updates
      const subscription = supabase
        .channel("simple-xp-updates")
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "user_misc_data",
            filter: `user_id=eq.${userId}`,
          },
          (payload) => {
            const newData = payload.new;
            setXpData({
              total_xp: newData.total_xp,
              current_level: newData.current_level,
              xp_to_next_level: newData.xp_to_next_level,
            });
          }
        )
        .subscribe();

      return () => subscription.unsubscribe();
    }
  }, [userId]);

  async function fetchXPData() {
    try {
      const { data, error } = await supabase
        .from("user_misc_data")
        .select("total_xp, current_level, xp_to_next_level")
        .eq("user_id", userId)
        .single();

      if (error && error.code !== "PGRST116") throw error;

      if (data) {
        setXpData(data);
      }
    } catch (err) {
      console.error("Error fetching XP data:", err);
    } finally {
      setLoading(false);
    }
  }

  // Calculate progress percentage for current level
  const currentLevelXP = (xpData.current_level - 1) * 1000;
  const nextLevelXP = xpData.current_level * 1000;
  const xpInCurrentLevel = xpData.total_xp - currentLevelXP;
  const xpNeededForLevel = nextLevelXP - currentLevelXP;
  const progressPercentage = Math.min(
    (xpInCurrentLevel / xpNeededForLevel) * 100,
    100
  );

  if (loading) {
    return (
      <View style={[styles.container, compact && styles.compactContainer]}>
        <View style={styles.loadingBar} />
      </View>
    );
  }

  const Container = onPress ? TouchableOpacity : View;

  return (
    <Container
      style={[styles.container, compact && styles.compactContainer]}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      {/* Level Badge and XP */}
      <View style={styles.infoRow}>
        <View style={[styles.levelBadge, compact && styles.compactLevelBadge]}>
          <Text style={[styles.levelText, compact && styles.compactLevelText]}>
            {xpData.current_level}
          </Text>
        </View>

        <View style={styles.xpInfo}>
          <Text style={[styles.xpText, compact && styles.compactXpText]}>
            {xpData.total_xp} XP
          </Text>
          {!compact && (
            <Text style={styles.nextLevelText}>
              {xpData.xp_to_next_level} to level {xpData.current_level + 1}
            </Text>
          )}
        </View>
      </View>

      {/* Progress Bar */}
      <View
        style={[
          styles.progressContainer,
          compact && styles.compactProgressContainer,
        ]}
      >
        <View style={styles.progressBackground}>
          <View
            style={[styles.progressFill, { width: `${progressPercentage}%` }]}
          />
        </View>

        {compact && (
          <Text style={styles.compactProgressText}>
            {xpData.xp_to_next_level} XP
          </Text>
        )}
      </View>
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#0D0C0C",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderColor: "#AF125A",
    borderWidth: 1,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    width: "100%",
    alignSelf: "center",
  },
  compactContainer: {
    paddingVertical: 8,
    marginVertical: 4,
  },
  loadingBar: {
    height: 20,
    backgroundColor: "#e9ecef",
    borderRadius: 4,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  levelBadge: {
    backgroundColor: "#007bff",
    borderRadius: 16,
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  compactLevelBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
  },
  levelText: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
  },
  compactLevelText: {
    fontSize: 12,
  },
  xpInfo: {
    flex: 1,
  },
  xpText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#495057",
  },
  compactXpText: {
    fontSize: 14,
  },
  nextLevelText: {
    fontSize: 12,
    color: "#6c757d",
    marginTop: 2,
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  compactProgressContainer: {
    marginTop: 4,
  },
  progressBackground: {
    flex: 1,
    height: 6,
    backgroundColor: "#e9ecef",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#28a745",
    borderRadius: 3,
  },
  compactProgressText: {
    fontSize: 10,
    color: "#6c757d",
    marginLeft: 8,
    minWidth: 40,
    textAlign: "right",
  },
});
