import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from "react-native";
import { supabase } from "../../lib/supabase";
import { useWorkout } from "../../context/WorkoutContext";

const WorkoutTemplateDetail = ({ route, navigation }) => {
  const { templateId } = route.params;
  const [template, setTemplate] = useState(null);
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const { setActiveWorkoutId } = useWorkout();

  useEffect(() => {
    loadTemplateDetails();
  }, [templateId]);

  const loadTemplateDetails = async () => {
    try {
      // Get template info and exercises in one query
      const { data, error } = await supabase
        .from("workout_templates")
        .select(
          `
          *,
          template_exercises (
            id,
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

      if (error) {
        Alert.alert("Error", "Failed to load template");
        navigation.goBack();
        return;
      }

      setTemplate(data);
      // Sort exercises by order_index
      const sortedExercises = (data.template_exercises || []).sort(
        (a, b) => a.order_index - b.order_index
      );
      setExercises(sortedExercises);
    } catch (error) {
      console.error("Error loading template:", error);
      Alert.alert("Error", "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const startWorkout = async () => {
    try {
      // Create new workout session
      const { data: session, error: sessionError } = await supabase
        .from("workout_sessions")
        .insert({
          user_id: (await supabase.auth.getUser()).data.user?.id,
          exercise_title: template.name,
          started_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (sessionError) throw sessionError;

      // Copy template exercises to workout exercises
      if (exercises.length > 0) {
        const workoutExercises = exercises.map((te) => ({
          workout_id: session.id,
          exercise_id: te.exercise.id,
          order_index: te.order_index,
          notes: te.notes,
        }));

        const { error: exercisesError } = await supabase
          .from("workout_exercises")
          .insert(workoutExercises);

        if (exercisesError) throw exercisesError;
      }

      // Set active workout and navigate
      setActiveWorkoutId(session.id);
      navigation.navigate("CurrentWorkoutScreen");
    } catch (error) {
      console.error("Error starting workout:", error);
      Alert.alert("Error", "Failed to start workout");
    }
  };

  const ExerciseCard = ({ exerciseData }) => (
    <View style={styles.exerciseCard}>
      <View style={styles.exerciseHeader}>
        <Text style={styles.exerciseName}>{exerciseData.exercise.name}</Text>
        <Text style={styles.exerciseCategory}>
          {exerciseData.exercise.category}
        </Text>
      </View>

      <View style={styles.exerciseDetails}>
        <Text style={styles.exerciseTarget}>
          {exerciseData.target_sets} sets × {exerciseData.target_reps} reps
        </Text>
        {exerciseData.exercise.equipment && (
          <Text style={styles.exerciseEquipment}>
            Equipment: {exerciseData.exercise.equipment}
          </Text>
        )}
      </View>

      {exerciseData.notes && (
        <Text style={styles.exerciseNotes}>{exerciseData.notes}</Text>
      )}
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.loadingText}>Loading template...</Text>
      </SafeAreaView>
    );
  }

  if (!template) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Template not found</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Template Details</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content}>
        {/* Template Info */}
        <View style={styles.templateInfo}>
          <Text style={styles.templateTitle}>{template.name}</Text>
          {template.description && (
            <Text style={styles.templateDescription}>
              {template.description}
            </Text>
          )}

          <View style={styles.templateMeta}>
            {template.category && (
              <Text style={styles.templateCategory}>{template.category}</Text>
            )}
            <Text style={styles.exerciseCount}>
              {exercises.length} exercise{exercises.length !== 1 ? "s" : ""}
            </Text>
          </View>
        </View>

        {/* Exercises List */}
        <View style={styles.exercisesSection}>
          <Text style={styles.sectionTitle}>Exercises</Text>

          {exercises.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>
                No exercises in this template
              </Text>
            </View>
          ) : (
            exercises.map((exerciseData, index) => (
              <ExerciseCard key={exerciseData.id} exerciseData={exerciseData} />
            ))
          )}
        </View>
      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.bottomActions}>
        <TouchableOpacity style={styles.startButton} onPress={startWorkout}>
          <Text style={styles.startButtonText}>Start Workout</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a0a0a",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
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
  backButtonText: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "500",
  },
  headerTitle: {
    flex: 1,
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  templateInfo: {
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#1a1a1a",
  },
  templateTitle: {
    color: "#ffffff",
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 8,
  },
  templateDescription: {
    color: "#cccccc",
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
  },
  templateMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  templateCategory: {
    color: "#AF125A",
    fontSize: 14,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  exerciseCount: {
    color: "#888888",
    fontSize: 14,
  },
  exercisesSection: {
    paddingTop: 20,
    paddingBottom: 100,
  },
  sectionTitle: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 16,
  },
  exerciseCard: {
    backgroundColor: "#111111",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  exerciseHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  exerciseName: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "600",
    flex: 1,
  },
  exerciseCategory: {
    color: "#AF125A",
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  exerciseDetails: {
    marginBottom: 8,
  },
  exerciseTarget: {
    color: "#cccccc",
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
  },
  exerciseEquipment: {
    color: "#888888",
    fontSize: 14,
  },
  exerciseNotes: {
    color: "#cccccc",
    fontSize: 14,
    fontStyle: "italic",
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#1a1a1a",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    color: "#888888",
    fontSize: 16,
  },
  bottomActions: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: "#0a0a0a",
    borderTopWidth: 1,
    borderTopColor: "#1a1a1a",
  },
  startButton: {
    backgroundColor: "#AF125A",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  startButtonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "600",
  },
  loadingText: {
    color: "#ffffff",
    fontSize: 18,
    textAlign: "center",
    marginTop: 100,
  },
  errorText: {
    color: "#ef4444",
    fontSize: 18,
    textAlign: "center",
    marginTop: 100,
  },
});

export default WorkoutTemplateDetail;
