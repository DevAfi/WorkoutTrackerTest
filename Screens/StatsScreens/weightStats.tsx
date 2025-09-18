import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  Animated,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { Input, Button } from "@rneui/themed";
import { LinearGradient } from "expo-linear-gradient";
import { LineChart } from "react-native-chart-kit";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { supabase } from "../../lib/supabase";

const { width } = Dimensions.get("window");

interface WeightLog {
  id: string;
  weight: number;
  unit: string;
  logged_at: string;
  notes?: string;
}

interface WeightProgress {
  logged_date: string;
  weight: number;
  weight_change: number;
  trend: "gaining" | "losing" | "stable";
}

export default function WeightTrackerScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentWeight, setCurrentWeight] = useState("");
  const [targetWeight, setTargetWeight] = useState("");
  const [notes, setNotes] = useState("");
  const [unit, setUnit] = useState<"lbs" | "kg">("lbs");
  const [recentLogs, setRecentLogs] = useState<WeightLog[]>([]);
  const [progress, setProgress] = useState<WeightProgress[]>([]);
  const [stats, setStats] = useState({
    startWeight: 0,
    currentWeight: 0,
    targetWeight: 0,
    totalChange: 0,
    weeklyChange: 0,
  });

  const fadeAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    loadWeightData();

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const loadWeightData = async () => {
    try {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("current_weight, target_weight, weight_unit")
        .eq("id", user.id)
        .single();

      if (profile) {
        setCurrentWeight(profile.current_weight?.toString() || "");
        setTargetWeight(profile.target_weight?.toString() || "");
        setUnit(profile.weight_unit || "lbs");
      }

      const { data: logs } = await supabase
        .from("weight_logs")
        .select("*")
        .eq("user_id", user.id)
        .order("logged_at", { ascending: false })
        .limit(10);

      if (logs) {
        setRecentLogs(logs);
        calculateStats(logs);
      }

      const { data: progressData } = await supabase.rpc("get_weight_progress", {
        user_uuid: user.id,
        days: 30,
      });

      if (progressData) {
        setProgress(progressData);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to load weight data");
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (logs: WeightLog[]) => {
    if (logs.length === 0) return;

    const sortedLogs = [...logs].sort(
      (a, b) =>
        new Date(a.logged_at).getTime() - new Date(b.logged_at).getTime()
    );

    const startWeight = sortedLogs[0]?.weight || 0;
    const currentWeight = sortedLogs[sortedLogs.length - 1]?.weight || 0;
    const totalChange = currentWeight - startWeight;

    //  7 days
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const recentLogs = logs.filter((log) => new Date(log.logged_at) >= weekAgo);
    const weeklyChange =
      recentLogs.length > 1
        ? recentLogs[0].weight - recentLogs[recentLogs.length - 1].weight
        : 0;

    setStats({
      startWeight,
      currentWeight,
      targetWeight: parseFloat(targetWeight) || 0,
      totalChange,
      weeklyChange,
    });
  };

  const saveWeightEntry = async () => {
    if (!currentWeight.trim()) {
      Alert.alert("Error", "Please enter your current weight");
      return;
    }

    setSaving(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const weight = parseFloat(currentWeight);

      // Insert weight
      const { error: logError } = await supabase.from("weight_logs").insert({
        user_id: user.id,
        weight,
        unit,
        notes: notes.trim() || null,
      });

      if (logError) throw logError;

      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          current_weight: weight,
          target_weight: targetWeight ? parseFloat(targetWeight) : null,
          weight_unit: unit,
        })
        .eq("id", user.id);

      if (profileError) throw profileError;

      Alert.alert("Success! ", "Weight logged successfully");
      setNotes("");
      loadWeightData();
    } catch (error) {
      Alert.alert("Error", "Failed to save weight entry");
    } finally {
      setSaving(false);
    }
  };

  const deleteWeightLog = async (logId: string) => {
    Alert.alert(
      "Delete Entry",
      "Are you sure you want to delete this weight entry?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const { error } = await supabase
                .from("weight_logs")
                .delete()
                .eq("id", logId);

              if (error) throw error;
              loadWeightData();
            } catch (error) {
              Alert.alert("Error", "Failed to delete entry");
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const getProgressColor = (change: number) => {
    if (change > 0) return "#FF6B6B"; // weight gain
    if (change < 0) return "#4ECDC4"; //weight loss
    return "#FFE66D"; // stable
  };

  if (loading) {
    return (
      <LinearGradient
        colors={["#1a1a1a", "#2d2d2d", "#1a1a1a"]}
        style={styles.container}
      >
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#AF125A" />
            <Text style={styles.loadingText}>Loading weight data...</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={["#1a1a1a", "#2d2d2d", "#1a1a1a"]}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <MaterialIcons name="arrow-back" size={24} color="#f5f1ed" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Weight Tracker</Text>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            <View style={styles.statsContainer}>
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>Current</Text>
                <Text style={styles.statValue}>
                  {stats.currentWeight.toFixed(1)} {unit}
                </Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>Goal</Text>
                <Text style={styles.statValue}>
                  {stats.targetWeight
                    ? `${stats.targetWeight.toFixed(1)} ${unit}`
                    : "Not Set"}
                </Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>Progress</Text>
                <Text
                  style={[
                    styles.statValue,
                    { color: getProgressColor(stats.totalChange) },
                  ]}
                >
                  {stats.totalChange > 0 ? "+" : ""}
                  {stats.totalChange.toFixed(1)} {unit}
                </Text>
              </View>
            </View>

            {progress.length > 0 && (
              <View style={styles.chartContainer}>
                <Text style={styles.sectionTitle}>30-Day Progress</Text>
                <LineChart
                  data={{
                    labels: progress
                      .slice(-7)
                      .map((p) => formatDate(p.logged_date)),
                    datasets: [
                      {
                        data: progress.slice(-7).map((p) => p.weight),
                        strokeWidth: 3,
                      },
                    ],
                  }}
                  width={width - 40}
                  height={200}
                  chartConfig={{
                    backgroundColor: "rgba(175, 18, 90, 0.1)",
                    backgroundGradientFrom: "#1a1a1a",
                    backgroundGradientTo: "#2d2d2d",
                    decimalPlaces: 1,
                    color: (opacity = 1) => `rgba(175, 18, 90, ${opacity})`,
                    labelColor: (opacity = 1) =>
                      `rgba(245, 241, 237, ${opacity})`,
                    style: { borderRadius: 16 },
                  }}
                  bezier
                  style={styles.chart}
                />
              </View>
            )}

            <View style={styles.entryContainer}>
              <Text style={styles.sectionTitle}>Log New Weight</Text>

              <View style={styles.weightInputContainer}>
                <Input
                  label="Current Weight"
                  value={currentWeight}
                  onChangeText={setCurrentWeight}
                  keyboardType="numeric"
                  placeholder="Enter weight"
                  leftIcon={{
                    type: "material",
                    name: "fitness-center",
                    color: "#AF125A",
                  }}
                  inputContainerStyle={styles.inputContainer}
                  labelStyle={styles.labelStyle}
                  inputStyle={styles.inputText}
                />

                <View style={styles.unitToggle}>
                  <TouchableOpacity
                    style={[
                      styles.unitButton,
                      unit === "lbs" && styles.unitButtonActive,
                    ]}
                    onPress={() => setUnit("lbs")}
                  >
                    <Text
                      style={[
                        styles.unitText,
                        unit === "lbs" && styles.unitTextActive,
                      ]}
                    >
                      lbs
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.unitButton,
                      unit === "kg" && styles.unitButtonActive,
                    ]}
                    onPress={() => setUnit("kg")}
                  >
                    <Text
                      style={[
                        styles.unitText,
                        unit === "kg" && styles.unitTextActive,
                      ]}
                    >
                      kg
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <Input
                label="Target Weight (Optional)"
                value={targetWeight}
                onChangeText={setTargetWeight}
                keyboardType="numeric"
                placeholder="Enter goal weight"
                leftIcon={{
                  type: "material",
                  name: "flag",
                  color: "#AF125A",
                }}
                inputContainerStyle={styles.inputContainer}
                labelStyle={styles.labelStyle}
                inputStyle={styles.inputText}
              />

              <Input
                label="Notes (Optional)"
                value={notes}
                onChangeText={setNotes}
                placeholder="How are you feeling? Any observations?"
                multiline
                numberOfLines={2}
                leftIcon={{
                  type: "material",
                  name: "note",
                  color: "#AF125A",
                }}
                inputContainerStyle={[
                  styles.inputContainer,
                  styles.multilineInput,
                ]}
                labelStyle={styles.labelStyle}
                inputStyle={[styles.inputText, styles.multilineText]}
              />

              <Button
                title={saving ? "Saving..." : "Log Weight"}
                onPress={saveWeightEntry}
                disabled={saving}
                buttonStyle={[
                  styles.saveButton,
                  saving && styles.disabledButton,
                ]}
                titleStyle={styles.saveButtonText}
              />
            </View>

            {recentLogs.length > 0 && (
              <View style={styles.historyContainer}>
                <Text style={styles.sectionTitle}>Recent Entries</Text>
                {recentLogs.slice(0, 5).map((log) => (
                  <View key={log.id} style={styles.logEntry}>
                    <View style={styles.logInfo}>
                      <Text style={styles.logWeight}>
                        {log.weight} {log.unit}
                      </Text>
                      <Text style={styles.logDate}>
                        {new Date(log.logged_at).toLocaleDateString()}
                      </Text>
                      {log.notes && (
                        <Text style={styles.logNotes}>{log.notes}</Text>
                      )}
                    </View>
                    <TouchableOpacity
                      onPress={() => deleteWeightLog(log.id)}
                      style={styles.deleteButton}
                    >
                      <MaterialIcons name="delete" size={20} color="#FF6B6B" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </ScrollView>
        </Animated.View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 20,
  },
  loadingText: {
    color: "#f5f1ed",
    fontSize: 18,
    fontWeight: "600",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#f5f1ed",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  statsContainer: {
    flexDirection: "row",
    marginBottom: 30,
    gap: 15,
  },
  statCard: {
    flex: 1,
    backgroundColor: "rgba(175, 18, 90, 0.1)",
    padding: 20,
    borderRadius: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(175, 18, 90, 0.3)",
  },
  statLabel: {
    color: "rgba(245, 241, 237, 0.7)",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 5,
  },
  statValue: {
    color: "#f5f1ed",
    fontSize: 18,
    fontWeight: "bold",
  },
  chartContainer: {
    marginBottom: 30,
  },
  sectionTitle: {
    color: "#AF125A",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
  },
  chart: {
    borderRadius: 16,
  },
  entryContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    padding: 20,
    borderRadius: 16,
    marginBottom: 30,
  },
  weightInputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 15,
  },
  unitToggle: {
    flexDirection: "row",
    marginBottom: 25,
  },
  unitButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "rgba(175, 18, 90, 0.3)",
    marginHorizontal: 5,
  },
  unitButtonActive: {
    backgroundColor: "#AF125A",
    borderColor: "#AF125A",
  },
  unitText: {
    color: "rgba(245, 241, 237, 0.7)",
    fontWeight: "600",
  },
  unitTextActive: {
    color: "#fff",
  },
  inputContainer: {
    borderBottomWidth: 2,
    borderBottomColor: "rgba(175, 18, 90, 0.3)",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 5,
  },
  multilineInput: {
    minHeight: 80,
    alignItems: "flex-start",
    paddingVertical: 15,
  },
  labelStyle: {
    color: "#f5f1ed",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  inputText: {
    color: "#f5f1ed",
    fontSize: 16,
    paddingVertical: 8,
  },
  multilineText: {
    minHeight: 60,
    textAlignVertical: "top",
  },
  saveButton: {
    backgroundColor: "#AF125A",
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 20,
  },
  disabledButton: {
    backgroundColor: "rgba(175, 18, 90, 0.5)",
  },
  saveButtonText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  historyContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    padding: 20,
    borderRadius: 16,
  },
  logEntry: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  logInfo: {
    flex: 1,
  },
  logWeight: {
    color: "#f5f1ed",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 2,
  },
  logDate: {
    color: "rgba(245, 241, 237, 0.7)",
    fontSize: 14,
    marginBottom: 2,
  },
  logNotes: {
    color: "rgba(245, 241, 237, 0.6)",
    fontSize: 12,
    fontStyle: "italic",
  },
  deleteButton: {
    padding: 10,
  },
});
