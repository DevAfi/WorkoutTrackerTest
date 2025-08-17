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
} from "react-native";
import { useWorkout } from "../../context/WorkoutContext";
import { supabase } from "../../lib/supabase";
import Exercise from "../../components/workoutComponents/Exercise";
import EndWorkoutButton from "../../components/endWorkButton";
import AddNote from "../../components/workoutComponents/addNote";
import DiscardWorkoutButton from "../../components/discardWorkoutButton";
const CurrentWorkoutScreen = ({ navigation }) => {
  const { activeWorkoutId } = useWorkout();
  const [exercises, setExercises] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [workoutStartTime] = useState(new Date());
  const [elapsedTime, setElapsedTime] = useState("00:00:00");

  useEffect(() => {
    if (!activeWorkoutId) return;
    fetchWorkoutData();
  }, [activeWorkoutId]);

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

  const fetchWorkoutData = async () => {
    const { data, error } = await supabase
      .from("workout_sessions")
      .select(
        `
    id,
    workout_exercises (
      id,
      exercise:exercise_id ( name ),
      sets ( set_number, reps, weight )
    )
  `
      )
      .eq("id", activeWorkoutId)
      .single();

    if (!error && data) {
      setExercises(data.workout_exercises || []);
    }
  };

  const getTotalVolume = () => {
    return exercises.reduce((sum, ex) => {
      if (!ex.sets || !Array.isArray(ex.sets)) return sum;
      return (
        sum +
        ex.sets.reduce((s, set) => s + (set.weight || 0) * (set.reps || 0), 0)
      );
    }, 0);
  };

  const getTotalSets = () => {
    return exercises.reduce((sum, ex) => {
      if (!ex.sets || !Array.isArray(ex.sets)) return sum;
      return sum + ex.sets.length;
    }, 0);
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#0a0a0a" />
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Text style={styles.backButtonText}>✕</Text>
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.workoutTitle}>Quick Workout</Text>
            <Text style={styles.workoutTime}>{elapsedTime}</Text>
          </View>
          <TouchableOpacity
            style={styles.notesButton}
            onPress={() => setModalVisible(true)}
          >
            <Text style={styles.notesButtonText}>📝</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{exercises.length}</Text>
            <Text style={styles.statLabel}>Exercises</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{getTotalSets()}</Text>
            <Text style={styles.statLabel}>Sets</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{getTotalVolume().toFixed(0)}</Text>
            <Text style={styles.statLabel}>Volume (kg)</Text>
          </View>
        </View>
        <ScrollView
          style={styles.exercisesContainer}
          showsVerticalScrollIndicator={false}
        >
          {exercises.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateTitle}>No exercises yet</Text>
              <Text style={styles.emptyStateSubtitle}>
                Tap "Add Exercise" to get started
              </Text>
            </View>
          ) : (
            exercises.map((exercise, index) => (
              <View key={index} style={styles.exerciseCard}>
                <Exercise
                  exercise={exercise.exercise}
                  workoutExerciseId={exercise.id}
                />
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
            <Text style={styles.addExerciseButtonText}>+ Add Exercise</Text>
          </TouchableOpacity>

          <View style={styles.actionButtons}>
            <DiscardWorkoutButton
              onEnded={() => navigation.navigate("MainTabs")}
            />

            {activeWorkoutId && (
              <View style={styles.finishButtonWrapper}>
                <EndWorkoutButton
                  onEnded={() => navigation.navigate("MainTabs")}
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
          <View style={styles.modalBackground}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Workout Notes</Text>
                <TouchableOpacity
                  style={styles.modalCloseButton}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.modalCloseButtonText}>✕</Text>
                </TouchableOpacity>
              </View>
              {activeWorkoutId && <AddNote sessionId={activeWorkoutId} />}
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </>
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
  backButtonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "500",
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
  notesButtonText: {
    fontSize: 16,
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
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyStateTitle: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 8,
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
    backgroundColor: "#2563eb",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 12,
  },
  addExerciseButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  discardButton: {
    flex: 1,
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginRight: 8,
  },
  discardButtonText: {
    color: "#ef4444",
    fontSize: 16,
    fontWeight: "600",
  },
  finishButtonWrapper: {
    flex: 1,
    marginLeft: 8,
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
    height: "60%",
    backgroundColor: "#111111",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#1a1a1a",
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
  modalCloseButtonText: {
    color: "#ffffff",
    fontSize: 14,
  },
});

export default CurrentWorkoutScreen;
