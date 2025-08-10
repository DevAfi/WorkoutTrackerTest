import * as React from "react";

import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { useState, useEffect } from "react";
import { getWorkoutStats } from "../../Util/getWorkoutStats";
import { supabase } from "../../lib/supabase";
const StatsScreen = ({ navigation }) => {
  const [personal, setPersonal] = useState(true);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    async function loadStats() {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) {
        console.error("No user data found");
      }
      console.log("1");

      const userId = userData.user.id;
      const results = await getWorkoutStats(userId);
      console.log("Workout stats results:", results);
      setStats(results);
    }

    loadStats();
  }, []);

  if (!stats) return <Text>Loading stats...</Text>;

  return (
    <SafeAreaView style={styles.container}>
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
                {Math.round(stats.total_volume).toLocaleString()} kg
              </Text>
            </View>
            <View style={styles.rectangleStatsBox}>
              <Text style={styles.statisticTitle}>Duration</Text>
              <Text style={styles.statisticText}>
                {(stats.total_duration_seconds / 60).toFixed(1)} mins
              </Text>
            </View>
          </View>
          <View style={styles.topStatsSection}>
            <View style={styles.squareStatsBox}>
              <Text style={styles.squareStatisticTitle}>Reps</Text>
              <Text style={styles.squareStatisticText}>{stats.total_reps}</Text>
            </View>
            <View style={styles.squareStatsBox}>
              <Text style={styles.squareStatisticTitle}>Sets</Text>
              <Text style={styles.squareStatisticText}>{stats.total_sets}</Text>
            </View>
            <View style={styles.squareStatsBox}>
              <Text style={styles.squareStatisticTitle}>Workouts</Text>
              <Text style={styles.squareStatisticText}>
                {stats.total_workouts}
              </Text>
            </View>
          </View>
        </View>
      ) : (
        <View style={styles.statsContainer}>
          {/* exercise stats */}
          <Text style={{ color: "white" }}>2</Text>
        </View>
      )}
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
    //backgroundColor: "white",   // debugging
    width: "100%",
    flexDirection: "column",
    paddingHorizontal: "7.5%",
  },
  topStatsSection: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    width: "100%",
    //backgroundColor: "blue",    // debugging
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
});

export default StatsScreen;
