import * as React from "react";

import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Dimensions,
} from "react-native";
import { useState, useEffect } from "react";
import { getWorkoutStats } from "../../Util/getWorkoutStats";
import { supabase } from "../../lib/supabase";
import {
  fetchVolumeOverTime,
  fetchWorkoutFrequency,
  fetchVolumeByMuscleGroup,
} from "../../Util/volumeStats";
import VolumeChart from "../../components/statisticComponents/volumeChart";
import FrequencyChart from "../../components/statisticComponents/frequencyChart";
import MuscleDistributionPieChart from "../../components/statisticComponents/muscleDistributionPie";

const { width } = Dimensions.get("window");

const muscleGroupMap = {
  ["abdominals"]: "core",
  ["abductors"]: "legs",
  ["adductors"]: "legs",
  ["biceps"]: "arms",
  ["calves"]: "legs",
  ["chest"]: "chest",
  ["forearms"]: "arms",
  ["front_deltoids"]: "shoulders",
  ["glutes"]: "legs",
  ["hamstrings"]: "legs",
  ["lateral_deltoids"]: "shoulders",
  ["lats"]: "back",
  ["lower_back"]: "back",
  ["lower_chest"]: "chest",
  ["middle_back"]: "back",
  ["neck"]: "back",
  ["quadriceps"]: "legs",
  ["rear_deltoids"]: "shoulders",
  ["traps"]: "back",
  ["upper_chest"]: "chest",
  ["triceps"]: "arms",
};

const StatsScreen = ({ navigation }) => {
  const [personal, setPersonal] = useState(true);
  const [stats, setStats] = useState(null);
  const [volumeData, setVolumeData] = useState(null);
  const [frequencyData, setFrequencyData] = useState(null);
  const [muscleData, setMuscleData] = useState(null);
  const [period, setPeriod] = useState("day");

  useEffect(() => {
    async function loadStats() {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) {
        console.error("No user data found");
      }
      console.log("1");

      const userId = userData.user.id;
      const results = await getWorkoutStats(userId);
      //console.log("Workout stats results:", results);
      setStats(results);
    }

    loadStats();
  }, [navigation]);

  useEffect(() => {
    async function loadVolumeData() {
      console.log("Vol 1");
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) {
        console.error("No user data found");
        return;
      }

      const userId = userData.user.id;
      const results = await fetchVolumeOverTime(userId, period);
      //console.log("Volume data results:", results);
      setVolumeData(results);
    }

    loadVolumeData();
  }, [period]);

  useEffect(() => {
    async function loadWorkoutFrequencyData() {
      console.log("Freq 1");
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) {
        console.error("No user data found");
        return;
      }

      const userId = userData.user.id;
      const results = await fetchWorkoutFrequency(userId, period);
      //console.log("frequency data results:", results);
      setFrequencyData(results);
    }

    loadWorkoutFrequencyData();
  }, [period]);

  useEffect(() => {
    async function loadMuscleData() {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) return;
      const userId = userData.user.id;
      const data = await fetchVolumeByMuscleGroup(userId);
      setMuscleData(data);
      console.log(data);
    }

    loadMuscleData();
  }, []);

  if (!stats || !volumeData || !muscleData)
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingCard}>
          <Text style={styles.loadingText}>Loading stats...</Text>
          <View style={styles.loadingSpinner} />
        </View>
      </View>
    );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollviewContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header with Navigation Tabs */}
        <View style={styles.headerContainer}>
          <Text style={styles.screenTitle}>Workout Analytics</Text>
          <View style={styles.topButtonsContainer}>
            <TouchableOpacity
              style={[styles.topButton, personal && styles.topButtonActive]}
              onPress={() => setPersonal(true)}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.topButtonText,
                  personal && styles.topButtonTextActive,
                ]}
              >
                Personal
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.topButton, !personal && styles.topButtonActive]}
              onPress={() => navigation.navigate("viewExercises")}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.topButtonText,
                  !personal && styles.topButtonTextActive,
                ]}
              >
                Exercises
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {personal ? (
          <View style={styles.statsContainer}>
            {/* Primary Stats Cards */}
            <View style={styles.primaryStatsContainer}>
              <View style={styles.primaryStatsCard}>
                <Text style={styles.primaryStatTitle}>Total Volume</Text>
                <Text style={styles.primaryStatValue}>
                  {stats.total_volume > 999999
                    ? Math.round(stats.total_volume / 10000).toLocaleString() /
                        100 +
                      "m "
                    : Math.round(stats.total_volume).toLocaleString()}
                  <Text style={styles.primaryStatUnit}>kg</Text>
                </Text>
              </View>
              <View style={styles.primaryStatsCard}>
                <Text style={styles.primaryStatTitle}>Duration</Text>
                <Text style={styles.primaryStatValue}>
                  {stats.total_duration_seconds / 3600 > 24
                    ? (stats.total_duration_seconds / 86400).toFixed(1)
                    : stats.total_duration_seconds / 60 > 60
                    ? (stats.total_duration_seconds / 3600).toFixed(1)
                    : (stats.total_duration_seconds / 60).toFixed(1)}
                  <Text style={styles.primaryStatUnit}>
                    {stats.total_duration_seconds / 3600 > 24
                      ? " days"
                      : stats.total_duration_seconds / 60 > 60
                      ? " hrs"
                      : " mins"}
                  </Text>
                </Text>
              </View>
            </View>

            {/* Secondary Stats Grid */}
            <View style={styles.secondaryStatsContainer}>
              <View style={styles.secondaryStatsCard}>
                <Text style={styles.secondaryStatTitle}>Reps</Text>
                <Text style={styles.secondaryStatValue}>
                  {stats.total_reps}
                </Text>
              </View>
              <View style={styles.secondaryStatsCard}>
                <Text style={styles.secondaryStatTitle}>Sets</Text>
                <Text style={styles.secondaryStatValue}>
                  {stats.total_sets}
                </Text>
              </View>
              <View style={styles.secondaryStatsCard}>
                <Text style={styles.secondaryStatTitle}>Workouts</Text>
                <Text style={styles.secondaryStatValue}>
                  {stats.total_workouts}
                </Text>
              </View>
            </View>

            {/* Charts Section */}
            <View style={styles.chartsContainer}>
              {/* Period Selector */}
              <View style={styles.periodSelectorContainer}>
                <Text style={styles.sectionTitle}>Analytics Period</Text>
                <View style={styles.periodButtons}>
                  {["day", "week", "month", "year"].map((p) => (
                    <TouchableOpacity
                      key={p}
                      style={[
                        styles.periodButton,
                        period === p && styles.periodButtonActive,
                      ]}
                      onPress={() => {
                        console.log("Setting period:", p);
                        setPeriod(p);
                      }}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.periodButtonText,
                          period === p && styles.periodButtonTextActive,
                        ]}
                      >
                        {p.charAt(0).toUpperCase() + p.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Volume Chart */}
              <View style={styles.chartCard}>
                <Text style={styles.chartTitle}>Volume Progression</Text>
                {volumeData ? (
                  <VolumeChart data={volumeData} period={period} />
                ) : (
                  <View style={styles.chartLoadingContainer}>
                    <Text style={styles.chartLoadingText}>
                      Loading chart...
                    </Text>
                  </View>
                )}
              </View>

              {/* Frequency Chart */}
              <View style={styles.chartCard}>
                <Text style={styles.chartTitle}>Workout Frequency</Text>
                {frequencyData ? (
                  <FrequencyChart data={frequencyData} period={period} />
                ) : (
                  <View style={styles.chartLoadingContainer}>
                    <Text style={styles.chartLoadingText}>
                      Loading frequency data...
                    </Text>
                  </View>
                )}
              </View>

              {/* Muscle Distribution Chart */}
              <View style={styles.chartCard}>
                <Text style={styles.chartTitle}>Muscle Group Distribution</Text>
                {muscleData && (
                  <MuscleDistributionPieChart
                    data={muscleData}
                    muscleGroupMap={muscleGroupMap}
                  />
                )}
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.statsContainer}>
            {/* exercise stats */}
            <Text style={styles.placeholderText}>
              Exercise Statistics Coming Soon
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a0a0a",
  },
  scrollviewContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: "#0a0a0a",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingCard: {
    backgroundColor: "#1a1a1a",
    borderRadius: 20,
    padding: 32,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#2a2a2a",
  },
  loadingText: {
    fontSize: 18,
    color: "#ffffff",
    fontWeight: "600",
    marginBottom: 16,
  },
  loadingSpinner: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 3,
    borderColor: "#AF125A",
    borderTopColor: "transparent",
  },

  headerContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  screenTitle: {
    fontSize: 32,
    fontWeight: "700",
    color: "#ffffff",
    textAlign: "center",
    marginBottom: 24,
  },
  topButtonsContainer: {
    flexDirection: "row",
    backgroundColor: "#1a1a1a",
    borderRadius: 16,
    padding: 4,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#2a2a2a",
  },
  topButton: {
    flex: 1,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
    marginHorizontal: 2,
  },
  topButtonActive: {
    backgroundColor: "#AF125A",
    shadowColor: "#AF125A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  topButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#888888",
  },
  topButtonTextActive: {
    color: "#ffffff",
  },

  statsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },

  primaryStatsContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  primaryStatsCard: {
    flex: 1,
    backgroundColor: "#1a1a1a",
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "#2a2a2a",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryStatTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#AF125A",
    marginBottom: 8,
    textAlign: "center",
  },
  primaryStatValue: {
    fontSize: 28,
    fontWeight: "700",
    color: "#ffffff",
    textAlign: "center",
  },
  primaryStatUnit: {
    fontSize: 18,
    fontWeight: "500",
    color: "#888888",
  },

  secondaryStatsContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 32,
  },
  secondaryStatsCard: {
    flex: 1,
    backgroundColor: "#1a1a1a",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#2a2a2a",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  secondaryStatTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#AF125A",
    marginBottom: 6,
    textAlign: "center",
  },
  secondaryStatValue: {
    fontSize: 24,
    fontWeight: "700",
    color: "#ffffff",
    textAlign: "center",
  },

  chartsContainer: {
    gap: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: 16,
  },

  periodSelectorContainer: {
    marginBottom: 8,
  },
  periodButtons: {
    flexDirection: "row",
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    padding: 4,
    gap: 4,
    borderWidth: 1,
    borderColor: "#2a2a2a",
  },
  periodButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    alignItems: "center",
  },
  periodButtonActive: {
    backgroundColor: "#AF125A",
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#888888",
  },
  periodButtonTextActive: {
    color: "#ffffff",
  },

  chartCard: {
    backgroundColor: "#1a1a1a",
    borderRadius: 20,
    paddingVertical: 20,
    borderWidth: 1,
    borderColor: "#2a2a2a",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#AF125A",
    marginBottom: 16,
    textAlign: "center",
  },
  chartLoadingContainer: {
    paddingVertical: 40,
    alignItems: "center",
  },
  chartLoadingText: {
    fontSize: 16,
    color: "#888888",
    fontWeight: "500",
  },

  placeholderText: {
    fontSize: 18,
    color: "#888888",
    textAlign: "center",
    marginTop: 60,
    fontWeight: "500",
  },
});

export default StatsScreen;
