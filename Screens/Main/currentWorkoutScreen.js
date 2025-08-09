import React, { useState, useEffect } from "react";
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Modal,
} from "react-native";
import { useWorkout } from "../../context/WorkoutContext";
import { supabase } from "../../lib/supabase";
import Exercise from "../../components/workoutComponents/Exercise";
import EndWorkoutButton from "../../components/endWorkButton";
import AddNote from "../../components/workoutComponents/addNote";

const CurrentWorkoutScreen = ({ navigation }) => {
  const { activeWorkoutId } = useWorkout();
  const [exercises, setExercises] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    if (!activeWorkoutId) return;
    fetchWorkoutData();
  }, [activeWorkoutId]);

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
      const total = data.workout_exercises.reduce((sum, ex) => {
        return (
          sum +
          ex.sets.reduce((s, set) => s + (set.weight || 0) * (set.reps || 0), 0)
        );
      }, 0);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.titleText}>Log your workout</Text>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.bottomHalfModal}>
            {activeWorkoutId && <AddNote sessionId={activeWorkoutId} />}
            <TouchableOpacity
              style={[styles.button, styles.buttonClose]}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.textStyle}>Hide Notes</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <ScrollView style={styles.exercisesContainer}>
        {exercises.map((exercise, index) => (
          <Exercise
            key={index}
            exercise={exercise.exercise}
            workoutExerciseId={exercise.id}
          />
        ))}
      </ScrollView>

      <View style={styles.bottomButtonContainer}>
        <TouchableOpacity
          onPress={() => navigation.navigate("selectExercise")}
          style={styles.addButtonContainer}
        >
          <Text style={styles.addButton}>Add exercises</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.buttonOpen]}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.textStyle}>Show Notes</Text>
        </TouchableOpacity>
        {activeWorkoutId && (
          <EndWorkoutButton onEnded={() => navigation.navigate("MainTabs")} />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "black" },
  titleText: {
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    color: "#f5f1ed",
  },
  weightText: {
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
    paddingTop: 15,
    color: "#f5f1ed",
  },
  exercisesContainer: { marginTop: 15, paddingVertical: 10 },
  addButton: {
    fontSize: 20,
    color: "#f5f1ed",
    textAlign: "center",
    height: 50,
    top: "25%",
  },
  bottomButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  modalBackground: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  bottomHalfModal: {
    height: "50%",
    backgroundColor: "#252323",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    alignItems: "center",
  },
  button: { borderRadius: 20, padding: 10, elevation: 2 },
  buttonOpen: { backgroundColor: "#0D0C0C" },
  buttonClose: { backgroundColor: "#0D0C0C" },
  textStyle: { color: "#AF125A", fontWeight: "bold", textAlign: "center" },
});

export default CurrentWorkoutScreen;
