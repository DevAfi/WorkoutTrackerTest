import * as React from "react";

import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  Button,
  ScrollView,
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
    return <Text>Loading stats...</Text>;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollviewContainer}>
        <View style={styles.topButtonsContainer}>
          <TouchableOpacity
            style={styles.topButton}
            onPress={() => setPersonal(true)}
          >
            <Text style={styles.topButtonText}>Personal</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.topButton}
            onPress={() => setPersonal(false)}
          >
            <Text style={styles.topButtonText}>Exercises</Text>
          </TouchableOpacity>
        </View>
        {personal == true ? (
          <View style={styles.statsContainer}>
            <View style={styles.topStatsSection}>
              <View style={styles.rectangleStatsBox}>
                <Text style={styles.statisticTitle}>Total Volume</Text>
                <Text style={styles.statisticText}>
                  {stats.total_volume > 999999
                    ? Math.round(stats.total_volume / 10000).toLocaleString() /
                        100 +
                      "m "
                    : Math.round(stats.total_volume).toLocaleString()}
                  kg
                </Text>
              </View>
              <View style={styles.rectangleStatsBox}>
                <Text style={styles.statisticTitle}>Duration</Text>
                <Text style={styles.statisticText}>
                  {stats.total_duration_seconds / 3600 > 24
                    ? (stats.total_duration_seconds / 86400).toFixed(1) +
                      " days"
                    : stats.total_duration_seconds / 60 > 60
                    ? (stats.total_duration_seconds / 3600).toFixed(1) + " hrs"
                    : (stats.total_duration_seconds / 60).toFixed(1) + " mins"}
                </Text>
              </View>
            </View>
            <View style={styles.topStatsSection}>
              <View style={styles.squareStatsBox}>
                <Text style={styles.squareStatisticTitle}>Reps</Text>
                <Text style={styles.squareStatisticText}>
                  {stats.total_reps}
                </Text>
              </View>
              <View style={styles.squareStatsBox}>
                <Text style={styles.squareStatisticTitle}>Sets</Text>
                <Text style={styles.squareStatisticText}>
                  {stats.total_sets}
                </Text>
              </View>
              <View style={styles.squareStatsBox}>
                <Text style={styles.squareStatisticTitle}>Workouts</Text>
                <Text style={styles.squareStatisticText}>
                  {stats.total_workouts}
                </Text>
              </View>
            </View>
            <View style={styles.graphsContainer}>
              <Text style={styles.graphTitle}>Volume</Text>
              {volumeData ? (
                <VolumeChart data={volumeData} period={period} />
              ) : (
                <Text>Loading...</Text>
              )}
              <Text style={styles.graphTitle}>Frequency</Text>

              {frequencyData ? (
                <FrequencyChart data={frequencyData} period={period} />
              ) : (
                <Text>Loading frequency data...</Text>
              )}

              <View>
                {muscleData && (
                  <MuscleDistributionPieChart
                    data={muscleData}
                    muscleGroupMap={muscleGroupMap}
                  />
                )}
              </View>

              <View style={styles.periodButtons}>
                {["day", "week", "month", "year"].map((p) => (
                  <Button
                    key={p}
                    title={p.charAt(0).toUpperCase() + p.slice(1)}
                    onPress={() => {
                      console.log("Setting period:", p);
                      setPeriod(p);
                    }}
                    color={period === p ? "#AF125A" : "gray"}
                  />
                ))}
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.statsContainer}>
            {/* exercise stats */}
            <Text style={{ color: "white" }}>2</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  scrollviewContainer: {
    height: "80%",
    width: "100%",
  },
  topButtonsContainer: {
    //backgroundColor: "red",
    flexDirection: "row",
    justifyContent: "space-evenly",
    gap: 10,
    marginTop: 5,
    marginBottom: "7.5%",
  },
  topButton: {
    backgroundColor: "#252222",
    height: 50,
    width: 190,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 15,
  },
  topButtonText: {
    fontFamily: "Arial",
    fontWeight: "600",
    fontSize: 20,
    color: "#AF125A",
  },
  //
  //  Stats screen
  //
  statsContainer: {
    //backgroundColor: "white", // debugging
    width: "100%",
    flexDirection: "column",
    paddingHorizontal: "7.5%",
  },
  topStatsSection: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    width: "100%",
    //backgroundColor: "blue", // debugging
  },
  rectangleStatsBox: {
    marginTop: "0.75%",
    maxWidth: "52%",
    width: "47%",
    marginHorizontal: "1%",
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: "7.5%",
    borderWidth: 1,
    borderColor: "#333",
  },
  statisticTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#AF125A",
    marginBottom: 4,
    textAlign: "center",
  },
  statisticText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#f5f1ed",
    textAlign: "center",
    textAlign: "center",
  },
  squareStatisticTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#AF125A",
    marginBottom: 2,
    textAlign: "center",
  },
  squareStatisticText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#f5f1ed",
    textAlign: "center",
  },
  squareStatsBox: {
    marginTop: "2%",
    maxWidth: "30%",
    width: "30%",
    marginHorizontal: "1%",
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: "5%",
    borderWidth: 1,
    borderColor: "#333",
  },

  // Graphs
  graphsContainer: { alignItems: "center", marginTop: "5%" },
  graphTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#AF125A",
  },
  periodButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
});

export default StatsScreen;
