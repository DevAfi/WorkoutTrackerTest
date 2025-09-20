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
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

const WorkoutTemplateDetail = ({ route, navigation }) => {
  const { templateId } = route.params;
  const [template, setTemplate] = useState(null);
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTemplateDetails();
  }, [templateId]);

  // the master query to fill all the infov
  const loadTemplateDetails = async () => {
    try {
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
      if (!template || exercises.length === 0) {
        Alert.alert(
          "Empty Template",
          "This template has no exercises to start with."
        );
        return;
      }
      navigation.navigate("TemplateWorkout", {
        templateId: template.id,
        templateName: template.name,
      });
    } catch (error) {
      console.error("Error starting template workout:", error);
      Alert.alert("Error", "Failed to start workout");
    }
  };

  const ExerciseCard = ({ exerciseData }) => (
    <View style={styles.exerciseCard}>
      <View style={styles.exerciseHeader}>
        <View style={styles.exerciseInfo}>
          <Text style={styles.exerciseName}>{exerciseData.exercise.name}</Text>
          <Text style={styles.exerciseCategory}>
            {exerciseData.exercise.category}
          </Text>
        </View>
        <View style={styles.exerciseIcon}>
          <MaterialIcons name="fitness-center" size={24} color="#AF125A" />
        </View>
      </View>

      <View style={styles.exerciseDetails}>
        <View style={styles.targetInfo}>
          <View style={styles.targetItem}>
            <MaterialIcons name="repeat" size={16} color="#888888" />
            <Text style={styles.targetText}>
              {exerciseData.target_sets} sets
            </Text>
          </View>
          <View style={styles.targetItem}>
            <MaterialIcons name="fitness-center" size={16} color="#888888" />
            <Text style={styles.targetText}>
              {exerciseData.target_reps} reps
            </Text>
          </View>
        </View>

        {exerciseData.exercise.equipment && (
          <View style={styles.equipmentInfo}>
            <MaterialIcons name="build" size={16} color="#888888" />
            <Text style={styles.equipmentText}>
              {exerciseData.exercise.equipment}
            </Text>
          </View>
        )}
      </View>

      {exerciseData.notes && (
        <View style={styles.notesSection}>
          <MaterialIcons name="note" size={16} color="#AF125A" />
          <Text style={styles.exerciseNotes}>{exerciseData.notes}</Text>
        </View>
      )}
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <MaterialIcons name="fitness-center" size={48} color="#AF125A" />
          <Text style={styles.loadingText}>Loading template...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!template) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <MaterialIcons name="error" size={48} color="#ef4444" />
          <Text style={styles.errorText}>Template not found</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.retryButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <MaterialIcons name="arrow-back" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Template Details</Text>
        <TouchableOpacity style={styles.shareButton}>
          <MaterialIcons name="share" size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.templateInfo}>
          <View style={styles.templateHeader}>
            <Text style={styles.templateTitle}>{template.name}</Text>
            {template.category && (
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryBadgeText}>
                  {template.category}
                </Text>
              </View>
            )}
          </View>

          {template.description && (
            <Text style={styles.templateDescription}>
              {template.description}
            </Text>
          )}

          <View style={styles.templateStats}>
            <View style={styles.statItem}>
              <MaterialIcons name="fitness-center" size={20} color="#AF125A" />
              <Text style={styles.statText}>
                {exercises.length} exercise{exercises.length !== 1 ? "s" : ""}
              </Text>
            </View>
            <View style={styles.statItem}>
              <MaterialIcons name="schedule" size={20} color="#888888" />
              <Text style={styles.statText}>
                Est. {Math.max(20, exercises.length * 5)} min
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.exercisesSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              Exercises ({exercises.length})
            </Text>
            <MaterialIcons name="list" size={24} color="#AF125A" />
          </View>

          {exercises.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialIcons name="fitness-center" size={48} color="#666" />
              <Text style={styles.emptyText}>
                No exercises in this template
              </Text>
              <Text style={styles.emptySubtext}>
                Add exercises to this template to get started
              </Text>
            </View>
          ) : (
            exercises.map((exerciseData, index) => (
              <ExerciseCard key={exerciseData.id} exerciseData={exerciseData} />
            ))
          )}
        </View>
      </ScrollView>

      <View style={styles.bottomActions}>
        {exercises.length > 0 ? (
          <TouchableOpacity style={styles.startButton} onPress={startWorkout}>
            <MaterialIcons name="play-arrow" size={24} color="#ffffff" />
            <Text style={styles.startButtonText}>Start Workout</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => {
              Alert.alert(
                "Feature Coming Soon",
                "Template editing will be available soon!"
              );
            }}
          >
            <MaterialIcons name="edit" size={24} color="#AF125A" />
            <Text style={styles.editButtonText}>Edit Template</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
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
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 20,
    paddingHorizontal: 40,
  },
  errorText: {
    color: "#ef4444",
    fontSize: 18,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: "#AF125A",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
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
  headerTitle: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "600",
    flex: 1,
    textAlign: "center",
  },
  shareButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#1a1a1a",
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flex: 1,
  },
  templateInfo: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#1a1a1a",
  },
  templateHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  templateTitle: {
    color: "#ffffff",
    fontSize: 28,
    fontWeight: "bold",
    flex: 1,
  },
  categoryBadge: {
    backgroundColor: "#AF125A",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  categoryBadgeText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  templateDescription: {
    color: "#cccccc",
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 20,
  },
  templateStats: {
    flexDirection: "row",
    gap: 24,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "500",
  },
  exercisesSection: {
    padding: 20,
    paddingBottom: 120,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "600",
  },
  exerciseCard: {
    backgroundColor: "#111111",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: "#AF125A",
  },
  exerciseHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },
  exerciseCategory: {
    color: "#888888",
    fontSize: 12,
    fontWeight: "500",
    textTransform: "capitalize",
  },
  exerciseIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(175, 18, 90, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  exerciseDetails: {
    gap: 8,
  },
  targetInfo: {
    flexDirection: "row",
    gap: 16,
  },
  targetItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  targetText: {
    color: "#cccccc",
    fontSize: 14,
    fontWeight: "500",
  },
  equipmentInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  equipmentText: {
    color: "#888888",
    fontSize: 14,
  },
  notesSection: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#1a1a1a",
  },
  exerciseNotes: {
    color: "#cccccc",
    fontSize: 14,
    fontStyle: "italic",
    flex: 1,
    lineHeight: 18,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
    gap: 12,
  },
  emptyText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "600",
  },
  emptySubtext: {
    color: "#888888",
    fontSize: 14,
    textAlign: "center",
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  startButtonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "600",
  },
  editButton: {
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: "#AF125A",
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  editButtonText: {
    color: "#AF125A",
    fontSize: 18,
    fontWeight: "600",
  },
});

export default WorkoutTemplateDetail;
