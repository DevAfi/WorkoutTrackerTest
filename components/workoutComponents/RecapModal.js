import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { supabase } from "../../lib/supabase";
import { createWorkoutActivity } from "../../Util/ActivityUtil";

const { height: screenHeight } = Dimensions.get("window");

const WorkoutRecapModal = ({
  visible,
  onClose,
  workoutId,
  workoutDuration,
  onWorkoutNameChanged,
}) => {
  const [workoutName, setWorkoutName] = useState("Freestyle Workout");
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState("");
  const [workoutData, setWorkoutData] = useState(null);
  const [sentiment, setSentiment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (visible && workoutId) {
      console.log("Fetching workout recap for ID:", workoutId);
      fetchWorkoutRecap();
    }
  }, [visible, workoutId]);

  const fetchWorkoutRecap = async () => {
    setLoading(true);
    try {
      console.log("Fetching workout data for ID:", workoutId);
      const { data, error } = await supabase
        .from("workout_sessions")
        .select(
          `
          id,
          exercise_title,
          started_at,
          ended_at,
          notes,
          score,
          workout_exercises (
            id,
            exercise:exercise_id ( name, category ),
            sets ( 
              id,
              set_number, 
              reps, 
              weight,
              rpe
            )
          )
        `
        )
        .eq("id", workoutId)
        .single();

      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }

      console.log("Fetched workout data:", data);
      setWorkoutData(data);
      setWorkoutName(data.exercise_title || "Freestyle Workout");
      setTempName(data.exercise_title || "Freestyle Workout");
      setSentiment(data.score); // Load existing sentiment if any
    } catch (error) {
      console.error("Error fetching workout recap:", error);
      Alert.alert("Error", "Failed to load workout data");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveWorkoutName = async () => {
    if (!tempName.trim()) {
      Alert.alert("Error", "Workout name cannot be empty");
      return;
    }

    try {
      const { error } = await supabase
        .from("workout_sessions")
        .update({ exercise_title: tempName.trim() })
        .eq("id", workoutId);

      if (error) throw error;

      setWorkoutName(tempName.trim());
      setIsEditingName(false);
      onWorkoutNameChanged && onWorkoutNameChanged(tempName.trim());
    } catch (error) {
      console.error("Error updating workout name:", error);
      Alert.alert("Error", "Failed to update workout name");
    }
  };

  const handleDone = async () => {
    // Check if sentiment is selected
    if (sentiment === null) {
      Alert.alert(
        "Rate Your Workout",
        "Please rate how your workout felt before finishing."
      );
      return;
    }

    try {
      const { error: scoreError } = await supabase
        .from("workout_sessions")
        .update({ score: sentiment })
        .eq("id", workoutId);

      if (scoreError) throw scoreError;

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const activitySuccess = await createWorkoutActivity(
          workoutId,
          user.id,
          {
            xpEarned: 50,
            exerciseTitle: workoutName,
            workoutDuration: workoutDuration,
          }
        );

        if (!activitySuccess) {
          console.warn(
            "Failed to create workout activity, but workout was saved"
          );
        }
      } else {
        console.warn("No user found when trying to create activity");
      }

      onClose();
    } catch (error) {
      console.error("Error completing workout:", error);
      Alert.alert("Error", "Failed to save workout data");
    }
  };

  const cancelNameEdit = () => {
    setTempName(workoutName);
    setIsEditingName(false);
  };

  const getSentimentIcon = (value) => {
    switch (value) {
      case 0:
        return "sentiment-very-dissatisfied";
      case 3.5:
        return "sentiment-dissatisfied";
      case 5:
        return "sentiment-neutral";
      case 7.5:
        return "sentiment-satisfied";
      case 10:
        return "sentiment-satisfied-alt";
      default:
        return "sentiment-neutral";
    }
  };

  const getSentimentLabel = (value) => {
    switch (value) {
      case 0:
        return "Terrible";
      case 3.5:
        return "Poor";
      case 5:
        return "Okay";
      case 7.5:
        return "Good";
      case 10:
        return "Amazing";
      default:
        return "";
    }
  };

  const getWorkoutStats = () => {
    if (!workoutData?.workout_exercises) {
      return {
        totalExercises: 0,
        totalSets: 0,
        totalReps: 0,
        totalVolume: 0,
        heaviestSet: 0,
        exerciseBreakdown: [],
      };
    }

    let totalSets = 0;
    let totalReps = 0;
    let totalVolume = 0;
    let heaviestSet = 0;
    const exerciseBreakdown = [];

    workoutData.workout_exercises.forEach((exercise) => {
      const sets = exercise.sets || [];
      const exerciseStats = {
        name: exercise.exercise?.name || "Unknown Exercise",
        category: exercise.exercise?.category || "",
        sets: sets.length,
        totalReps: 0,
        volume: 0,
        topSet: { weight: 0, reps: 0 },
      };

      sets.forEach((set) => {
        const weight = set.weight || 0;
        const reps = set.reps || 0;
        const volume = weight * reps;

        totalSets++;
        totalReps += reps;
        totalVolume += volume;
        exerciseStats.totalReps += reps;
        exerciseStats.volume += volume;

        if (weight > heaviestSet) {
          heaviestSet = weight;
        }

        if (
          weight > exerciseStats.topSet.weight ||
          (weight === exerciseStats.topSet.weight &&
            reps > exerciseStats.topSet.reps)
        ) {
          exerciseStats.topSet = { weight, reps };
        }
      });

      if (sets.length > 0) {
        exerciseBreakdown.push(exerciseStats);
      }
    });

    return {
      totalExercises: workoutData.workout_exercises.length,
      totalSets,
      totalReps,
      totalVolume,
      heaviestSet,
      exerciseBreakdown,
    };
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const stats = getWorkoutStats();

  if (loading) {
    return (
      <Modal visible={visible} transparent animationType="slide">
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading workout recap...</Text>
            </View>
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalBackground}>
        <KeyboardAvoidingView
          style={styles.keyboardAvoidingView}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <View style={styles.modalContainer}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerContent}>
                <MaterialIcons
                  name="fitness-center"
                  size={24}
                  color="#10b981"
                />
                <Text style={styles.headerTitle}>Workout Complete!</Text>
              </View>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <MaterialIcons name="close" size={24} color="#888" />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.content}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
            >
              {/* Workout Name */}
              <View style={styles.nameSection}>
                {isEditingName ? (
                  <View style={styles.nameEditContainer}>
                    <TextInput
                      style={styles.nameInput}
                      value={tempName}
                      onChangeText={setTempName}
                      placeholder="Enter workout name"
                      placeholderTextColor="#666"
                      maxLength={50}
                      autoFocus
                    />
                    <View style={styles.nameEditButtons}>
                      <TouchableOpacity
                        style={styles.cancelButton}
                        onPress={cancelNameEdit}
                      >
                        <Text style={styles.cancelButtonText}>Cancel</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.saveButton}
                        onPress={handleSaveWorkoutName}
                      >
                        <Text style={styles.saveButtonText}>Save</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.nameContainer}
                    onPress={() => setIsEditingName(true)}
                  >
                    <Text style={styles.workoutName}>{workoutName}</Text>
                    <MaterialIcons name="edit" size={20} color="#666" />
                  </TouchableOpacity>
                )}
              </View>

              {/* Main Stats */}
              <View style={styles.mainStatsContainer}>
                <View style={styles.mainStat}>
                  <Text style={styles.mainStatValue}>
                    {formatDuration(workoutDuration)}
                  </Text>
                  <Text style={styles.mainStatLabel}>Duration</Text>
                </View>
                <View style={styles.mainStat}>
                  <Text style={styles.mainStatValue}>
                    {stats.totalVolume.toFixed(0)}
                  </Text>
                  <Text style={styles.mainStatLabel}>Volume (kg)</Text>
                </View>
                <View style={styles.mainStat}>
                  <Text style={styles.mainStatValue}>{stats.totalSets}</Text>
                  <Text style={styles.mainStatLabel}>Sets</Text>
                </View>
              </View>

              {/* Sentiment Rating Section */}
              <View style={styles.sentimentSection}>
                <Text style={styles.sectionTitle}>How did it feel?</Text>
                <Text style={styles.sentimentSubtitle}>
                  Rate your workout experience
                </Text>
                <View style={styles.sentimentContainer}>
                  {[0, 3.5, 5, 7.5, 10].map((value) => (
                    <TouchableOpacity
                      key={value}
                      style={[
                        styles.sentimentButton,
                        sentiment === value && styles.sentimentButtonSelected,
                      ]}
                      onPress={() => setSentiment(value)}
                    >
                      <MaterialIcons
                        name={getSentimentIcon(value)}
                        color={sentiment === value ? "#AF125A" : "#666"}
                        size={32}
                      />
                      <Text
                        style={[
                          styles.sentimentLabel,
                          sentiment === value && styles.sentimentLabelSelected,
                        ]}
                      >
                        {getSentimentLabel(value)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Secondary Stats */}
              <View style={styles.secondaryStats}>
                <View style={styles.statRow}>
                  <Text style={styles.statLabel}>Exercises</Text>
                  <Text style={styles.statValue}>{stats.totalExercises}</Text>
                </View>
                <View style={styles.statRow}>
                  <Text style={styles.statLabel}>Total Reps</Text>
                  <Text style={styles.statValue}>{stats.totalReps}</Text>
                </View>
                <View style={styles.statRow}>
                  <Text style={styles.statLabel}>Heaviest Set</Text>
                  <Text style={styles.statValue}>{stats.heaviestSet}kg</Text>
                </View>
              </View>

              {/* Exercise Breakdown */}
              {stats.exerciseBreakdown.length > 0 && (
                <View style={styles.exerciseBreakdown}>
                  <Text style={styles.sectionTitle}>Exercise Breakdown</Text>
                  {stats.exerciseBreakdown.map((exercise, index) => (
                    <View key={index} style={styles.exerciseItem}>
                      <View style={styles.exerciseHeader}>
                        <Text style={styles.exerciseName}>{exercise.name}</Text>
                        <Text style={styles.exerciseCategory}>
                          {exercise.category}
                        </Text>
                      </View>
                      <View style={styles.exerciseStats}>
                        <Text style={styles.exerciseStatText}>
                          {exercise.sets} sets • {exercise.totalReps} reps •{" "}
                          {exercise.volume.toFixed(0)}kg volume
                        </Text>
                        {exercise.topSet.weight > 0 && (
                          <Text style={styles.topSetText}>
                            Top set: {exercise.topSet.weight}kg ×{" "}
                            {exercise.topSet.reps}
                          </Text>
                        )}
                      </View>
                    </View>
                  ))}
                </View>
              )}

              {/* Notes if any */}
              {workoutData?.notes && (
                <View style={styles.notesSection}>
                  <Text style={styles.sectionTitle}>Notes</Text>
                  <Text style={styles.notesText}>{workoutData.notes}</Text>
                </View>
              )}
            </ScrollView>

            {/* Footer */}
            <View style={styles.footer}>
              <TouchableOpacity
                style={[
                  styles.doneButton,
                  sentiment === null && styles.doneButtonDisabled,
                ]}
                onPress={handleDone}
              >
                <Text
                  style={[
                    styles.doneButtonText,
                    sentiment === null && styles.doneButtonTextDisabled,
                  ]}
                >
                  Done
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  keyboardAvoidingView: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "95%",
    maxWidth: 400,
    height: screenHeight * 0.85,
    backgroundColor: "#111111",
    borderRadius: 16,
    overflow: "hidden",
    maxHeight: 700,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  loadingText: {
    color: "#888",
    fontSize: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#222",
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "600",
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  nameSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#222",
  },
  nameContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  workoutName: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "600",
    flex: 1,
  },
  nameEditContainer: {
    gap: 12,
  },
  nameInput: {
    backgroundColor: "#1a1a1a",
    color: "#fff",
    fontSize: 18,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#333",
  },
  nameEditButtons: {
    flexDirection: "row",
    gap: 8,
  },
  cancelButton: {
    flex: 1,
    padding: 12,
    backgroundColor: "#1a1a1a",
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#888",
    fontWeight: "600",
  },
  saveButton: {
    flex: 1,
    padding: 12,
    backgroundColor: "#10b981",
    borderRadius: 8,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  mainStatsContainer: {
    flexDirection: "row",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#222",
  },
  mainStat: {
    flex: 1,
    alignItems: "center",
  },
  mainStatValue: {
    color: "#10b981",
    fontSize: 28,
    fontWeight: "700",
  },
  mainStatLabel: {
    color: "#888",
    fontSize: 14,
    marginTop: 4,
  },
  sentimentSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#222",
  },
  sentimentSubtitle: {
    color: "#888",
    fontSize: 14,
    marginBottom: 16,
  },
  sentimentContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  sentimentButton: {
    flex: 1,
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#1a1a1a",
  },
  sentimentButtonSelected: {
    backgroundColor: "rgba(175, 18, 90, 0.2)",
    borderWidth: 1,
    borderColor: "#AF125A",
  },
  sentimentLabel: {
    color: "#666",
    fontSize: 10,
    marginTop: 4,
    fontWeight: "500",
  },
  sentimentLabelSelected: {
    color: "#AF125A",
  },
  secondaryStats: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#222",
    gap: 12,
  },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statLabel: {
    color: "#888",
    fontSize: 16,
  },
  statValue: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  exerciseBreakdown: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#222",
  },
  sectionTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  exerciseItem: {
    backgroundColor: "#1a1a1a",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  exerciseHeader: {
    marginBottom: 4,
  },
  exerciseName: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  exerciseCategory: {
    color: "#666",
    fontSize: 12,
    textTransform: "capitalize",
  },
  exerciseStats: {
    gap: 2,
  },
  exerciseStatText: {
    color: "#888",
    fontSize: 14,
  },
  topSetText: {
    color: "#10b981",
    fontSize: 12,
    fontWeight: "500",
  },
  notesSection: {
    padding: 20,
  },
  notesText: {
    color: "#888",
    fontSize: 14,
    lineHeight: 20,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#222",
  },
  doneButton: {
    backgroundColor: "#10b981",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  doneButtonDisabled: {
    backgroundColor: "#333",
  },
  doneButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  doneButtonTextDisabled: {
    color: "#666",
  },
});

export default WorkoutRecapModal;
