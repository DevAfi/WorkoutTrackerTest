import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";

export default function LevelProgressBar({
  currentLevel,
  totalXP,
  xpToNextLevel,
  animated = true,
}) {
  const [progressAnimation] = useState(new Animated.Value(0));
  const currentLevelXP = (currentLevel - 1) * 1000;
  const nextLevelXP = currentLevel * 1000;
  const xpInCurrentLevel = totalXP - currentLevelXP;
  const xpNeededForLevel = nextLevelXP - currentLevelXP;
  const progressPercentage = (xpInCurrentLevel / xpNeededForLevel) * 100;

  useEffect(() => {
    if (animated) {
      Animated.timing(progressAnimation, {
        toValue: progressPercentage / 100,
        duration: 1000,
        useNativeDriver: false,
      }).start();
    } else {
      progressAnimation.setValue(progressPercentage / 100);
    }
  }, [progressPercentage, animated]);

  const progressWidth = animated
    ? progressAnimation.interpolate({
        inputRange: [0, 1],
        outputRange: ["0%", "100%"],
      })
    : `${progressPercentage}%`;

  return (
    <View style={styles.container}>
      <View style={styles.levelInfo}>
        <Text style={styles.currentLevelText}>Level {currentLevel}</Text>
        <Text style={styles.nextLevelText}>Level {currentLevel + 1}</Text>
      </View>

      <View style={styles.progressBarContainer}>
        <View style={styles.progressBarBackground}>
          <Animated.View
            style={[styles.progressBarFill, { width: progressWidth }]}
          />
        </View>
      </View>

      <View style={styles.xpInfo}>
        <Text style={styles.xpText}>
          {xpInCurrentLevel} / {xpNeededForLevel} XP
        </Text>
        <Text style={styles.remainingXpText}>{xpToNextLevel} XP remaining</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    marginVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  levelInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  currentLevelText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#495057",
  },
  nextLevelText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#6c757d",
  },
  progressBarContainer: {
    marginBottom: 8,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: "#e9ecef",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#28a745",
    borderRadius: 4,
  },
  xpInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  xpText: {
    fontSize: 14,
    color: "#495057",
    fontWeight: "600",
  },
  remainingXpText: {
    fontSize: 14,
    color: "#6c757d",
  },
});
