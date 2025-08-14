import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import { supabase } from "../../lib/supabase";
export default function XPDisplay({ userId, showAnimation = false }) {
  const [xpData, setXpData] = useState({
    total_xp: 0,
    current_level: 1,
    xp_to_next_level: 1000,
  });
  const [loading, setLoading] = useState(true);
  const [xpAnimation] = useState(new Animated.Value(0));

  useEffect(() => {
    if (userId) {
      fetchXPData();
    }
  }, [userId]);

  useEffect(() => {
    if (showAnimation) {
      animateXPGain();
    }
  }, [showAnimation]);

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

  function animateXPGain() {
    xpAnimation.setValue(0);
    Animated.sequence([
      Animated.timing(xpAnimation, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(xpAnimation, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }

  const xpGainStyle = {
    opacity: xpAnimation,
    transform: [
      {
        translateY: xpAnimation.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -20],
        }),
      },
    ],
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.levelContainer}>
        <Text style={styles.levelText}>Level {xpData.current_level}</Text>
        <Text style={styles.xpText}>{xpData.total_xp} XP</Text>
      </View>

      <Text style={styles.nextLevelText}>
        {xpData.xp_to_next_level} XP to next level
      </Text>

      {showAnimation && (
        <Animated.View style={[styles.xpGainAnimation, xpGainStyle]}>
          <Text style={styles.xpGainText}>+50 XP!</Text>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#f8f9fa",
    padding: 16,
    borderRadius: 12,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  levelContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  levelText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#495057",
  },
  xpText: {
    fontSize: 16,
    color: "#6c757d",
    fontWeight: "600",
  },
  nextLevelText: {
    fontSize: 14,
    color: "#6c757d",
    textAlign: "center",
  },
  loadingText: {
    textAlign: "center",
    color: "#6c757d",
  },
  xpGainAnimation: {
    position: "absolute",
    top: -10,
    right: 16,
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
});
