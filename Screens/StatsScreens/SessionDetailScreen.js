import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { supabase } from "../../lib/supabase";

const SessionDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { sessionId } = route.params || {};
  console.log("SDS SID: ", sessionId);

  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSessionDetails = async () => {
    //console.log("fetching session details");
    if (!sessionId) return;

    try {
      setLoading(true);

      const { data: sessionData, error: sessionError } = await supabase
        .from("workout_sessions")
        .select(
          `
          *,
          workout_exercises (
            *,
            exercises (name, category, equipment),
            sets (*)
          )
        `
        )
        .eq("id", sessionId)
        .single();
      //console.log("Workout session raw data: ", sessionData);

      if (sessionError) throw sessionError;

      if (sessionData.workout_exercises) {
        sessionData.workout_exercises.sort(
          (a, b) => a.order_index - b.order_index
        );
        sessionData.workout_exercises.forEach((exercise) => {
          exercise.sets.sort((a, b) => a.set_number - b.set_number);
        });
      }

      setSession(sessionData);
    } catch (err) {
      console.log("error");
      setError(err.message);
      console.error("Error fetching session details:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = () => {
    if (!session?.started_at || !session?.ended_at) return "0m";

    const startTime = new Date(session.started_at);
    const endTime = new Date(session.ended_at);
    const diffMs = endTime - startTime;
    const diffMinutes = Math.round(diffMs / (1000 * 60));

    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const calculateSessionStats = () => {
    if (!session?.workout_exercises) return {};

    const totalSets = session.workout_exercises.reduce(
      (total, exercise) => total + exercise.sets.length,
      0
    );

    const totalWeight = session.workout_exercises.reduce(
      (total, exercise) =>
        total +
        exercise.sets.reduce(
          (exerciseTotal, set) =>
            exerciseTotal + (set.weight || 0) * (set.reps || 0),
          0
        ),
      0
    );

    const totalReps = session.workout_exercises.reduce(
      (total, exercise) =>
        total +
        exercise.sets.reduce(
          (exerciseTotal, set) => exerciseTotal + (set.reps || 0),
          0
        ),
      0
    );

    return { totalSets, totalWeight, totalReps };
  };

  const renderExercise = (workoutExercise, index) => {
    const { exercises: exercise, sets } = workoutExercise;

    const exerciseStats = sets.reduce(
      (stats, set) => ({
        totalWeight: stats.totalWeight + (set.weight || 0) * (set.reps || 0),
        maxWeight: Math.max(stats.maxWeight, set.weight || 0),
        totalReps: stats.totalReps + (set.reps || 0),
      }),
      { totalWeight: 0, maxWeight: 0, totalReps: 0 }
    );

    return (
      <View key={workoutExercise.id} style={styles.exerciseContainer}>
        <View style={styles.exerciseHeader}>
          <Text style={styles.exerciseName}>{exercise.name}</Text>
          <Text style={styles.exerciseCategory}>
            {exercise.category || "Unknown"}
          </Text>
        </View>

        <View style={styles.exerciseStats}>
          <Text style={styles.exerciseStatText}>
            {sets.length} sets • {exerciseStats.totalReps} total reps •{" "}
            {Math.round(exerciseStats.totalWeight)} lbs total
          </Text>
        </View>

        <View style={styles.setsContainer}>
          {sets.map((set, setIndex) => (
            <View key={set.id} style={styles.setRow}>
              <Text style={styles.setNumber}>{set.set_number}</Text>
              <Text style={styles.setDetails}>
                {set.weight ? `${set.weight} lbs` : "BW"} × {set.reps || 0} reps
                {set.rpe && ` • RPE ${set.rpe}`}
              </Text>
              {set.completed_at && (
                <Text style={styles.setTime}>
                  {new Date(set.completed_at).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Text>
              )}
            </View>
          ))}
        </View>

        {workoutExercise.notes && (
          <View style={styles.notesContainer}>
            <Text style={styles.notesLabel}>Notes:</Text>
            <Text style={styles.notesText}>{workoutExercise.notes}</Text>
          </View>
        )}
      </View>
    );
  };

  useEffect(() => {
    fetchSessionDetails();
  }, [sessionId]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#AF125A" />
        <Text style={styles.loadingText}>Loading session details...</Text>
      </View>
    );
  }

  if (error || !session) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error loading session details</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={fetchSessionDetails}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const stats = calculateSessionStats();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.workoutTitle}>Workout Session</Text>
        <Text style={styles.dateText}>
          {formatDateTime(session.ended_at || session.started_at)}
        </Text>
      </View>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Session Summary</Text>

        <View style={styles.summaryStats}>
          <View style={styles.summaryStatItem}>
            <Text style={styles.summaryStatNumber}>{formatDuration()}</Text>
            <Text style={styles.summaryStatLabel}>Duration</Text>
          </View>

          <View style={styles.summaryStatItem}>
            <Text style={styles.summaryStatNumber}>
              {session.workout_exercises?.length || 0}
            </Text>
            <Text style={styles.summaryStatLabel}>Exercises</Text>
          </View>

          <View style={styles.summaryStatItem}>
            <Text style={styles.summaryStatNumber}>{stats.totalSets}</Text>
            <Text style={styles.summaryStatLabel}>Total Sets</Text>
          </View>

          <View style={styles.summaryStatItem}>
            <Text style={styles.summaryStatNumber}>
              {Math.round(stats.totalWeight).toLocaleString()}
            </Text>
            <Text style={styles.summaryStatLabel}>Total Weight</Text>
          </View>
        </View>
      </View>

      <View style={styles.exercisesSection}>
        <Text style={styles.sectionTitle}>Exercises</Text>
        {session.workout_exercises?.map((exercise, index) =>
          renderExercise(exercise, index)
        )}
      </View>

      {session.notes && (
        <View style={styles.sessionNotesContainer}>
          <Text style={styles.sectionTitle}>Session Notes</Text>
          <Text style={styles.sessionNotes}>{session.notes}</Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "black",
  },
  loadingText: {
    color: "#888",
    marginTop: 16,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "black",
    padding: 20,
  },
  errorText: {
    color: "#ff6b6b",
    fontSize: 18,
    textAlign: "center",
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: "#AF125A",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  workoutTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#f5f1ed",
    marginBottom: 8,
  },
  dateText: {
    fontSize: 16,
    color: "#888",
  },
  summaryCard: {
    margin: 16,
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#333",
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#AF125A",
    marginBottom: 16,
  },
  summaryStats: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  summaryStatItem: {
    flex: 1,
    alignItems: "center",
  },
  summaryStatNumber: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#f5f1ed",
  },
  summaryStatLabel: {
    fontSize: 12,
    color: "#888",
    marginTop: 4,
  },
  exercisesSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#f5f1ed",
    marginBottom: 16,
  },
  exerciseContainer: {
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#333",
  },
  exerciseHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#f5f1ed",
    flex: 1,
  },
  exerciseCategory: {
    fontSize: 14,
    color: "#AF125A",
    fontWeight: "600",
  },
  exerciseStats: {
    marginBottom: 12,
  },
  exerciseStatText: {
    fontSize: 14,
    color: "#888",
  },
  setsContainer: {
    backgroundColor: "#0d1117",
    borderRadius: 8,
    padding: 12,
  },
  setRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  setNumber: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#AF125A",
    width: 30,
  },
  setDetails: {
    fontSize: 16,
    color: "#f5f1ed",
    flex: 1,
    marginLeft: 16,
  },
  setTime: {
    fontSize: 12,
    color: "#888",
  },
  notesContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: "#0d1117",
    borderRadius: 8,
  },
  notesLabel: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#AF125A",
    marginBottom: 4,
  },
  notesText: {
    fontSize: 14,
    color: "#f5f1ed",
  },
  sessionNotesContainer: {
    padding: 16,
  },
  sessionNotes: {
    fontSize: 16,
    color: "#f5f1ed",
    backgroundColor: "#1a1a1a",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#333",
  },
});

export default SessionDetailScreen;
