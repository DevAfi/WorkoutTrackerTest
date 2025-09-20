import React, { useState, useEffect } from "react";
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Modal,
  StatusBar,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
  ActivityIndicator,
} from "react-native";
import { supabase } from "../../lib/supabase";
import { useFocusEffect } from "@react-navigation/native";
import Exercise from "../../components/workoutComponents/Exercise";
import EndWorkoutButton from "../../components/endWorkButton";
import AddNote from "../../components/workoutComponents/addNote";
import DiscardWorkoutButton from "../../components/discardWorkoutButton";
import WorkoutRecapModal from "../../components/workoutComponents/RecapModal";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

const TemplateWorkoutScreen = ({ route, navigation }) => {
  const { templateId, templateName } = route.params;
  const [activeWorkoutId, setActiveWorkoutId] = useState(null);
  const [exercises, setExercises] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [workoutStartTime, setWorkoutStartTime] = useState(new Date());
  const [elapsedTime, setElapsedTime] = useState("00:00:00");
  const [showRecapModal, setShowRecapModal] = useState(false);
  const [workoutDuration, setWorkoutDuration] = useState(0);
  const [completedWorkoutId, setCompletedWorkoutId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [templateData, setTemplateData] = useState(null);

  useEffect(() => {
    initializeTemplateWorkout();
  }, [templateId]);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const diff = now - workoutStartTime;
      const hours = Math.floor(diff / 3600000);
      const minutes = Math.floor((diff % 3600000) / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      setElapsedTime(
        `${hours.toString().padStart(2, "0")}:${minutes
          .toString()
          .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
      );
    }, 1000);

    return () => clearInterval(timer);
  }, [workoutStartTime]);

  useFocusEffect(
    React.useCallback(() => {
      if (activeWorkoutId) {
        fetchWorkoutData();
      }
    }, [activeWorkoutId])
  );

  const initializeTemplateWorkout = async () => {
    try {
      setLoading(true);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) {
        Alert.alert("Error", "Authentication required");
        navigation.goBack();
        return;
      }

      const { data: template, error: templateError } = await supabase
        .from("workout_templates")
        .select(
          `
          id,
          name,
          description,
          category,
          template_exercises (
            id,
            exercise_id,
            order_index,
            target_sets,
            target_reps,
            notes,
            exercise:exercise_id (
              id,
              name,
              category,
              equipment,
              instructions
            )
          )
        `
        )
        .eq("id", templateId)
        .single();

      if (templateError) {
        console.error("Template fetch error:", templateError);
        Alert.alert("Error", "Failed to load template");
        navigation.goBack();
        return;
      }

      if (
        !template ||
        !template.template_exercises ||
        template.template_exercises.length === 0
      ) {
        Alert.alert(
          "Empty Template",
          "This template has no exercises. Please add exercises to the template first."
        );
        navigation.goBack();
        return;
      }

      setTemplateData(template);

      const { data: workoutSession, error: sessionError } = await supabase
        .from("workout_sessions")
        .insert({
          user_id: user.id,
          started_at: new Date().toISOString(),
          exercise_title: template.name,
          notes: `Started from template: ${template.name}`,
        })
        .select()
        .single();

      if (sessionError) {
        console.error("Session creation error:", sessionError);
        Alert.alert("Error", "Failed to start workout session");
        navigation.goBack();
        return;
      }

      setActiveWorkoutId(workoutSession.id);
      setWorkoutStartTime(new Date(workoutSession.started_at));

      const workoutExercisesData = template.template_exercises
        .sort((a, b) => a.order_index - b.order_index)
        .map((templateExercise) => ({
          workout_id: workoutSession.id,
          exercise_id: templateExercise.exercise_id,
          order_index: templateExercise.order_index,
          notes: templateExercise.notes,
        }));

      const { data: workoutExercises, error: exercisesError } = await supabase
        .from("workout_exercises")
        .insert(workoutExercisesData).select(`
          id,
          exercise_id,
          order_index,
          notes,
          exercise:exercise_id (
            id,
            name,
            category,
            equipment,
            instructions
          )
        `);

      if (exercisesError) {
        console.error("Workout exercises creation error:", exercisesError);
        Alert.alert("Error", "Failed to create workout exercises");
        navigation.goBack();
        return;
      }
      for (const workoutExercise of workoutExercises) {
        const templateExercise = template.template_exercises.find(
          (te) => te.exercise_id === workoutExercise.exercise_id
        );

        if (templateExercise && templateExercise.target_sets > 0) {
          const setsData = Array.from(
            { length: templateExercise.target_sets },
            (_, index) => ({
              workout_exercise_id: workoutExercise.id,
              set_number: index + 1,
              reps: templateExercise.target_reps || 0,
              weight: 0,
              rpe: null,
            })
          );

          const { error: setsError } = await supabase
            .from("sets")
            .insert(setsData);

          if (setsError) {
            console.error(
              "Sets creation error for exercise:",
              workoutExercise.exercise.name,
              setsError
            );
          }
        }
      }

      await fetchWorkoutData();
    } catch (error) {
      console.error("Initialization error:", error);
      Alert.alert("Error", "Failed to initialize workout");
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const fetchWorkoutData = async () => {
    if (!activeWorkoutId) return;

    try {
      const { data, error } = await supabase
        .from("workout_sessions")
        .select(
          `
          id,
          exercise_title,
          workout_exercises (
            id,
            order_index,
            notes,
            exercise:exercise_id (
              id,
              name,
              category,
              equipment,
              instructions
            ),
            sets (
              id,
              set_number,
              reps,
              weight,
              rpe,
              completed_at
            )
          )
        `
        )
        .eq("id", activeWorkoutId)
        .single();

      if (!error && data) {
        const sortedExercises = (data.workout_exercises || [])
          .sort((a, b) => a.order_index - b.order_index)
          .map((exercise) => ({
            ...exercise,
            sets: (exercise.sets || []).sort(
              (a, b) => a.set_number - b.set_number
            ),
          }));

        setExercises(sortedExercises);
      } else if (error) {
        console.error("Fetch workout data error:", error);
      }
    } catch (error) {
      console.error("Fetch workout data error:", error);
    }
  };

  const handleSetChange = () => {
    fetchWorkoutData();
  };

  const getTotalVolume = () => {
    return exercises.reduce((sum, ex) => {
      if (!ex.sets || !Array.isArray(ex.sets)) return sum;
      return (
        sum +
        ex.sets.reduce((s, set) => {
          if (set.weight > 0 && set.reps > 0) {
            return s + set.weight * set.reps;
          }
          return s;
        }, 0)
      );
    }, 0);
  };

  const getTotalSets = () => {
    return exercises.reduce((sum, ex) => {
      if (!ex.sets || !Array.isArray(ex.sets)) return sum;
      return (
        sum + ex.sets.filter((set) => set.weight > 0 && set.reps > 0).length
      );
    }, 0);
  };

  const getPlannedSets = () => {
    return exercises.reduce((sum, ex) => {
      if (!ex.sets || !Array.isArray(ex.sets)) return sum;
      return sum + ex.sets.length;
    }, 0);
  };

  const handleShowRecap = (workoutId, duration) => {
    setCompletedWorkoutId(workoutId);
    setWorkoutDuration(duration);
    setShowRecapModal(true);
  };

  const handleCloseRecap = () => {
    setShowRecapModal(false);
    setActiveWorkoutId(null);
    navigation.navigate("MainTabs");
  };

  const handleDiscardWorkout = () => {
    Alert.alert(
      "Discard Workout",
      "Are you sure you want to discard this workout? All progress will be lost.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Discard",
          style: "destructive",
          onPress: () => {
            setActiveWorkoutId(null);
            navigation.navigate("MainTabs");
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#af125f" />
          <Text style={styles.loadingText}>Starting your workout...</Text>
          <Text style={styles.loadingSubtext}>
            Setting up exercises from template
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#0a0a0a" />
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <MaterialIcons name="close" color="#ffffff" size={20} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.workoutTitle}>
              {templateData?.name || templateName || "Template Workout"}
            </Text>
            <Text style={styles.workoutTime}>{elapsedTime}</Text>
          </View>
          <TouchableOpacity
            style={styles.notesButton}
            onPress={() => setModalVisible(true)}
          >
            <MaterialIcons name="note-alt" color="#fff" size={24} />
          </TouchableOpacity>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{exercises.length}</Text>
            <Text style={styles.statLabel}>Exercises</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {getTotalSets()}/{getPlannedSets()}
            </Text>
            <Text style={styles.statLabel}>Sets Done</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{getTotalVolume().toFixed(0)}</Text>
            <Text style={styles.statLabel}>Volume (kg)</Text>
          </View>
        </View>

        {templateData && (
          <View style={styles.templateInfo}>
            <MaterialIcons name="assignment" color="#af125f" size={16} />
            <Text style={styles.templateInfoText}>
              From template: {templateData.name}
            </Text>
            {templateData.category && (
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryBadgeText}>
                  {templateData.category}
                </Text>
              </View>
            )}
          </View>
        )}

        <ScrollView
          style={styles.exercisesContainer}
          showsVerticalScrollIndicator={false}
        >
          {exercises.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialIcons name="fitness-center" color="#666" size={48} />
              <Text style={styles.emptyStateTitle}>No exercises loaded</Text>
              <Text style={styles.emptyStateSubtitle}>
                There was an issue loading the template exercises
              </Text>
            </View>
          ) : (
            exercises.map((exercise, index) => (
              <View key={exercise.id || index} style={styles.exerciseCard}>
                {exercise.id && exercise.exercise ? (
                  <Exercise
                    exercise={exercise.exercise}
                    workoutExerciseId={exercise.id}
                    onDelete={fetchWorkoutData}
                    onSetChange={handleSetChange}
                  />
                ) : (
                  <Text style={{ color: "#fff", padding: 16 }}>
                    Loading exercise...
                  </Text>
                )}
                {exercise.notes && (
                  <View style={styles.exerciseNotes}>
                    <MaterialIcons name="note" color="#af125f" size={16} />
                    <Text style={styles.exerciseNotesText}>
                      {exercise.notes}
                    </Text>
                  </View>
                )}
              </View>
            ))
          )}
          <View style={styles.bottomPadding} />
        </ScrollView>

        <View style={styles.bottomActions}>
          <TouchableOpacity
            onPress={() => navigation.navigate("selectExercise")}
            style={styles.addExerciseButton}
          >
            <MaterialIcons name="add" color="#ffffff" size={20} />
            <Text style={styles.addExerciseButtonText}>Add Extra Exercise</Text>
          </TouchableOpacity>

          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.discardButton}
              onPress={handleDiscardWorkout}
            >
              <MaterialIcons name="close" color="#ef4444" size={20} />
              <Text style={styles.discardButtonText}>Discard</Text>
            </TouchableOpacity>

            {activeWorkoutId && (
              <View style={styles.finishButtonWrapper}>
                <EndWorkoutButton
                  onShowRecap={handleShowRecap}
                  workoutStartTime={workoutStartTime}
                  style={styles.finishButton}
                />
              </View>
            )}
          </View>
        </View>

        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.modalBackground}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Workout Notes</Text>
                  <TouchableOpacity
                    style={styles.modalCloseButton}
                    onPress={() => setModalVisible(false)}
                  >
                    <MaterialIcons name="close" color="#ffffff" size={18} />
                  </TouchableOpacity>
                </View>
                {activeWorkoutId && <AddNote sessionId={activeWorkoutId} />}
              </View>
            </View>
          </TouchableWithoutFeedback>
        </Modal>

        <WorkoutRecapModal
          visible={showRecapModal}
          onClose={handleCloseRecap}
          workoutId={completedWorkoutId}
          workoutDuration={workoutDuration}
          onWorkoutNameChanged={(newName) => {
            console.log("Workout renamed to:", newName);
          }}
        />
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a0a0a",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  loadingText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "600",
  },
  loadingSubtext: {
    color: "#888888",
    fontSize: 14,
    textAlign: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#1a1a1a",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#1a1a1a",
    alignItems: "center",
    justifyContent: "center",
  },
  headerCenter: {
    alignItems: "center",
    flex: 1,
  },
  workoutTitle: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "600",
  },
  workoutTime: {
    color: "#888888",
    fontSize: 14,
    marginTop: 2,
  },
  notesButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#1a1a1a",
    alignItems: "center",
    justifyContent: "center",
  },
  statsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingVertical: 20,
    marginHorizontal: 20,
    backgroundColor: "#111111",
    borderRadius: 12,
    marginTop: 16,
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statValue: {
    color: "#ffffff",
    fontSize: 24,
    fontWeight: "700",
  },
  statLabel: {
    color: "#888888",
    fontSize: 12,
    marginTop: 4,
    textTransform: "uppercase",
    fontWeight: "500",
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: "#333333",
  },
  templateInfo: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginHorizontal: 20,
    marginTop: 12,
    backgroundColor: "rgba(175, 18, 95, 0.1)",
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: "#af125f",
    gap: 8,
  },
  templateInfoText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "500",
    flex: 1,
  },
  categoryBadge: {
    backgroundColor: "#af125f",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryBadgeText: {
    color: "#ffffff",
    fontSize: 10,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  exercisesContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  exerciseCard: {
    backgroundColor: "#111111",
    borderRadius: 12,
    marginBottom: 12,
    overflow: "hidden",
  },
  exerciseNotes: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "rgba(175, 18, 95, 0.1)",
    gap: 8,
  },
  exerciseNotesText: {
    color: "#cccccc",
    fontSize: 12,
    fontStyle: "italic",
    flex: 1,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    gap: 16,
  },
  emptyStateTitle: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "600",
  },
  emptyStateSubtitle: {
    color: "#888888",
    fontSize: 16,
    textAlign: "center",
  },
  bottomPadding: {
    height: 100,
  },
  bottomActions: {
    paddingHorizontal: 20,
    paddingBottom: 34,
    paddingTop: 16,
    backgroundColor: "#0a0a0a",
    borderTopWidth: 1,
    borderTopColor: "#1a1a1a",
  },
  addExerciseButton: {
    backgroundColor: "#af125f",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  addExerciseButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  discardButton: {
    flex: 1,
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "#ef4444",
  },
  discardButtonText: {
    color: "#ef4444",
    fontSize: 16,
    fontWeight: "600",
  },
  finishButtonWrapper: {
    flex: 1,
  },
  finishButton: {
    backgroundColor: "#10b981",
    borderRadius: 12,
    paddingVertical: 16,
  },
  modalBackground: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.7)",
  },
  modalContent: {
    height: "80%",
    backgroundColor: "#111111",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    alignItems: "center",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#1a1a1a",
    justifyContent: "space-between",
    width: "100%",
  },
  modalTitle: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "600",
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#1a1a1a",
    alignItems: "center",
    justifyContent: "center",
  },
});

export default TemplateWorkoutScreen;
