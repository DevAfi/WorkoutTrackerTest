import React, { useLayoutEffect, useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { LineChart } from "react-native-chart-kit";
import { supabase } from "../lib/supabase";

const screenWidth = Dimensions.get("window").width;

const ViewExerciseDetails = ({ route, navigation }) => {
  const { exerciseId, name, category, equipment, instructions } = route.params;
  const [isExpanded, setIsExpanded] = useState(false);
  const [historySelected, setHistorySelected] = useState(true);
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedChart, setSelectedChart] = useState("e1rm");

  console.log("exerciseId param:", exerciseId);

  useLayoutEffect(() => {
    navigation.setOptions({ title: name });
  }, [navigation, name]);

  useEffect(() => {
    const getCurrentUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setCurrentUser(user);
    };
    getCurrentUser();
  }, []);

  useEffect(() => {
    if (!exerciseId || !currentUser) return;

    if (!historySelected) {
      fetchExerciseData();
    }
  }, [exerciseId, historySelected, currentUser]);

  const fetchExerciseData = async () => {
    setLoadingStats(true);

    try {
      const { data, error } = await supabase.rpc("exercise_stats_rpc", {
        target_user_id: currentUser.id,
        target_exercise_id: exerciseId,
      });

      if (error) {
        console.error("Error fetching exercise stats:", error);
        setStats(null);
        setLoadingStats(false);
        return;
      }

      if (data && data.length > 0) {
        const totalVolume = data.reduce(
          (sum, day) => sum + Number(day.total_volume),
          0
        );
        const maxWeight = Math.max(
          ...data.map((day) => Number(day.best_set_weight))
        );
        const maxE1RM = Math.max(...data.map((day) => Number(day.e1rm)));

        setStats({
          totalVolume,
          maxWeight,
          maxE1RM,
          history: data.map((day) => ({
            date: day.workout_date,
            volume: Number(day.total_volume),
            weight: Number(day.best_set_weight),
            reps: Number(day.best_set_reps),
            e1rm: Number(day.e1rm),
            pr_weight: Number(day.pr_weight),
            pr_volume: Number(day.pr_volume),
            pr_e1rm: Number(day.pr_e1rm),
          })),
        });
      } else {
        setStats(null);
      }

      setLoadingStats(false);
    } catch (err) {
      console.error("Error in fetchExerciseData:", err);
      setStats(null);
      setLoadingStats(false);
    }
  };

  const getChartData = () => {
    if (!stats || !stats.history.length) return null;

    const points = stats.history.slice(-30);

    const getDataByType = () => {
      switch (selectedChart) {
        case "volume":
          return {
            data: points.map((p) => Number(p.volume.toFixed(0))),
            label: "Volume (kg)",
            color: (opacity = 1) => `rgba(54, 162, 235, ${opacity})`,
          };
        case "weight":
          return {
            data: points.map((p) => Number(p.weight.toFixed(1))),
            label: "Max Weight (kg)",
            color: (opacity = 1) => `rgba(255, 193, 7, ${opacity})`,
          };
        case "alltime1rm":
          let currentMaxWeight = 0;
          const progressiveWeightData = points.map((p) => {
            if (Number(p.weight) > currentMaxWeight) {
              currentMaxWeight = Number(p.weight);
            }
            return Number(currentMaxWeight.toFixed(1));
          });
          return {
            data: progressiveWeightData,
            label: "All-Time Max Weight (kg)",
            color: (opacity = 1) => `rgba(40, 167, 69, ${opacity})`,
          };
        case "e1rm":
        default:
          let currentBestE1RM = 0;
          const progressiveE1RMData = points.map((p) => {
            if (Number(p.e1rm) > currentBestE1RM) {
              currentBestE1RM = Number(p.e1rm);
            }
            return Number(currentBestE1RM.toFixed(1));
          });
          return {
            data: progressiveE1RMData,
            label: "Progressive E1RM (kg)",
            color: (opacity = 1) => `rgba(175, 18, 90, ${opacity})`,
          };
      }
    };

    const chartData = getDataByType();

    return {
      labels: points.map((p) => {
        const date = new Date(p.date);
        return `${date.getMonth() + 1}/${date.getDate()}`;
      }),
      datasets: [
        {
          data: chartData.data,
          strokeWidth: 2,
          color: chartData.color,
        },
      ],
    };
  };

  const getChartTitle = () => {
    switch (selectedChart) {
      case "volume":
        return "Volume Progress";
      case "weight":
        return "Max Weight Progress";
      case "alltime1rm":
        return "All-Time Max Weight Record";
      case "e1rm":
      default:
        return "Progressive E1RM Record";
    }
  };

  const chartConfig = {
    backgroundColor: "#1a1a1a",
    backgroundGradientFrom: "#1a1a1a",
    backgroundGradientTo: "#252323",
    decimalPlaces: 1,
    color: (opacity = 1) => `rgba(245, 241, 237, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(245, 241, 237, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: "4",
      strokeWidth: "2",
      stroke: "#AF125A",
    },
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Exercise Details */}
        <View style={styles.detailsContainer}>
          <Text style={styles.title}>{name}</Text>
          <View style={styles.secondSection}>
            <View style={styles.detailItem}>
              <Text style={styles.label}>Muscle Group:</Text>
              <Text style={styles.value}>{category}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.label}>Equipment:</Text>
              <Text style={styles.value}>{equipment}</Text>
            </View>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.label}>Instructions:</Text>
            <Text
              style={styles.instructions}
              numberOfLines={isExpanded ? 0 : 3}
            >
              {instructions}
            </Text>
            <Text
              onPress={() => setIsExpanded(!isExpanded)}
              style={styles.seeMoreText}
            >
              {isExpanded ? "See less" : "See more"}
            </Text>
          </View>
        </View>

        {/* Toggle History / Stats */}
        <View style={styles.topButtonsContainer}>
          <TouchableOpacity
            style={[
              styles.topButton,
              historySelected && styles.topButtonActive,
            ]}
            onPress={() => setHistorySelected(true)}
          >
            <Text style={styles.topButtonText}>History</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.topButton,
              !historySelected && styles.topButtonActive,
            ]}
            onPress={() => setHistorySelected(false)}
          >
            <Text style={styles.topButtonText}>Stats</Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        {historySelected ? (
          <View style={{ padding: 20 }}>
            <Text style={styles.statsText}>History content coming soon...</Text>
          </View>
        ) : (
          <View style={{ padding: 20 }}>
            {loadingStats ? (
              <View style={{ alignItems: "center", padding: 20 }}>
                <ActivityIndicator color="#AF125A" size="large" />
                <Text style={{ color: "white", marginTop: 10 }}>
                  Loading stats...
                </Text>
              </View>
            ) : stats ? (
              <View>
                {/* Stats Summary */}
                <View style={styles.statsContainer}>
                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Total Volume</Text>
                    <Text style={styles.statValue}>
                      {Math.round(stats.totalVolume).toLocaleString()} kg
                    </Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Max Weight</Text>
                    <Text style={styles.statValue}>{stats.maxWeight} kg</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Best E1RM</Text>
                    <Text style={styles.statValue}>
                      {stats.maxE1RM.toFixed(1)} kg
                    </Text>
                  </View>
                </View>

                {/* Chart */}
                {getChartData() && (
                  <View style={styles.chartContainer}>
                    {/* Chart Type Selector */}
                    <View style={styles.chartSelectorContainer}>
                      <TouchableOpacity
                        style={[
                          styles.chartSelectorButton,
                          selectedChart === "e1rm" &&
                            styles.chartSelectorActive,
                          { borderColor: "rgba(175, 18, 90, 0.8)" },
                        ]}
                        onPress={() => setSelectedChart("e1rm")}
                      >
                        <Text
                          style={[
                            styles.chartSelectorText,
                            selectedChart === "e1rm" && {
                              color: "rgba(175, 18, 90, 1)",
                            },
                          ]}
                        >
                          E1RM
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[
                          styles.chartSelectorButton,
                          selectedChart === "alltime1rm" &&
                            styles.chartSelectorActive,
                          { borderColor: "rgba(40, 167, 69, 0.8)" },
                        ]}
                        onPress={() => setSelectedChart("alltime1rm")}
                      >
                        <Text
                          style={[
                            styles.chartSelectorText,
                            selectedChart === "alltime1rm" && {
                              color: "rgba(40, 167, 69, 1)",
                            },
                          ]}
                        >
                          PR
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[
                          styles.chartSelectorButton,
                          selectedChart === "volume" &&
                            styles.chartSelectorActive,
                          { borderColor: "rgba(54, 162, 235, 0.8)" },
                        ]}
                        onPress={() => setSelectedChart("volume")}
                      >
                        <Text
                          style={[
                            styles.chartSelectorText,
                            selectedChart === "volume" && {
                              color: "rgba(54, 162, 235, 1)",
                            },
                          ]}
                        >
                          Volume
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[
                          styles.chartSelectorButton,
                          selectedChart === "weight" &&
                            styles.chartSelectorActive,
                          { borderColor: "rgba(255, 193, 7, 0.8)" },
                        ]}
                        onPress={() => setSelectedChart("weight")}
                      >
                        <Text
                          style={[
                            styles.chartSelectorText,
                            selectedChart === "weight" && {
                              color: "rgba(255, 193, 7, 1)",
                            },
                          ]}
                        >
                          Weight
                        </Text>
                      </TouchableOpacity>
                    </View>

                    <Text style={styles.chartTitle}>{getChartTitle()}</Text>
                    <LineChart
                      data={getChartData()}
                      width={screenWidth - 40}
                      height={220}
                      chartConfig={chartConfig}
                      bezier
                      style={styles.chart}
                      withDots={true}
                      withShadow={false}
                      withScrollableDot={false}
                      fromZero={true}
                    />
                  </View>
                )}
              </View>
            ) : (
              <View style={{ alignItems: "center", padding: 20 }}>
                <Text style={{ color: "white", fontSize: 16 }}>
                  No stats available
                </Text>
                <Text
                  style={{
                    color: "#cccccc",
                    fontSize: 14,
                    textAlign: "center",
                    marginTop: 10,
                  }}
                >
                  Complete some workouts with this exercise to see your
                  progress!
                </Text>
              </View>
            )}
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
  },
  scrollView: {
    backgroundColor: "black",
  },
  detailsContainer: {
    backgroundColor: "#1a1a1a",
    borderBottomRightRadius: 10,
    borderBottomLeftRadius: 10,
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#f5f1ed",
    marginBottom: 20,
    textAlign: "center",
    fontFamily: "Arial",
  },
  secondSection: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    gap: 65,
  },
  detailItem: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#f5f1ed",
    marginBottom: 5,
    fontFamily: "Arial",
  },
  value: {
    fontSize: 14,
    color: "#cccccc",
    fontFamily: "Arial",
    textAlign: "center",
  },
  instructions: {
    fontSize: 14,
    color: "#cccccc",
    lineHeight: 22,
    fontFamily: "Arial",
  },
  seeMoreText: {
    color: "#f5f1ed",
    fontWeight: "bold",
    textAlign: "right",
    marginTop: 5,
  },
  topButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    gap: 10,
    paddingTop: 20,
  },
  topButton: {
    backgroundColor: "#0D0C0C",
    height: 50,
    width: 200,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 15,
  },
  topButtonActive: {
    backgroundColor: "#AF125A",
  },
  topButtonText: {
    fontFamily: "Arial",
    fontWeight: "600",
    fontSize: 20,
    color: "#f5f1ed",
  },
  statsText: {
    color: "#f5f1ed",
    fontSize: 16,
    marginBottom: 8,
    fontFamily: "Arial",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 30,
    backgroundColor: "#1a1a1a",
    borderRadius: 10,
    padding: 15,
  },
  statItem: {
    alignItems: "center",
  },
  statLabel: {
    color: "#cccccc",
    fontSize: 12,
    fontFamily: "Arial",
    marginBottom: 5,
  },
  statValue: {
    color: "#f5f1ed",
    fontSize: 16,
    fontWeight: "bold",
    fontFamily: "Arial",
  },
  chartContainer: {
    marginTop: 10,
    alignItems: "center",
  },
  chartTitle: {
    color: "#f5f1ed",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
    fontFamily: "Arial",
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  chartSelectorContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  chartSelectorButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#cccccc",
    backgroundColor: "transparent",
    minWidth: 70,
    alignItems: "center",
  },
  chartSelectorActive: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  chartSelectorText: {
    color: "#cccccc",
    fontSize: 14,
    fontWeight: "600",
    fontFamily: "Arial",
  },
});

export default ViewExerciseDetails;
