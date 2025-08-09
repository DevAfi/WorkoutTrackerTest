import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { supabase } from "../../lib/supabase";

const Exercise = ({ exercise, workoutExerciseId }) => {
  const [sets, setSets] = useState([]);
  const [reps, setReps] = useState("");
  const [weight, setWeight] = useState("");
  const [rpe, setRpe] = useState("");

  const fetchSets = async () => {
    if (!workoutExerciseId) return;
    const { data, error } = await supabase
      .from("sets")
      .select("*")
      .eq("workout_exercise_id", workoutExerciseId)
      .order("set_number", { ascending: true });

    if (!error) {
      setSets(data || []);
    } else {
      console.error("Error fetching sets:", error);
    }
  };

  useEffect(() => {
    fetchSets();
  }, [workoutExerciseId]);

  // Add new set
  const handleAddSet = async () => {
    if (!reps || !weight || !rpe) return;

    const { error } = await supabase.from("sets").insert([
      {
        workout_exercise_id: workoutExerciseId,
        reps: parseInt(reps),
        weight: parseFloat(weight),
        rpe: parseFloat(rpe),
      },
    ]);

    if (error) {
      console.error("Error adding set:", error);
      return;
    }

    setReps("");
    setWeight("");
    setRpe("");
    fetchSets(); // refresh
  };

  return (
    <View style={styles.exerciseContainer}>
      <Text style={styles.exerciseName}>{exercise.name}</Text>

      {/* List all sets */}
      {sets.map((set, index) => (
        <Text key={set.id} style={styles.setText}>
          Set {index + 1}: {set.reps} reps × {set.weight} kg @ RPE: {set.rpe}
        </Text>
      ))}

      {/* Inputs for new set */}
      <View style={styles.setInputRow}>
        <TextInput
          style={styles.setInput}
          placeholder="Weight (kg)"
          placeholderTextColor={"rgb(108, 101, 101)"}
          keyboardType="numeric"
          value={weight}
          onChangeText={setWeight}
        />
        <TextInput
          style={styles.setInput}
          placeholder="Reps"
          placeholderTextColor={"rgb(108, 101, 101)"}
          keyboardType="numeric"
          value={reps}
          onChangeText={setReps}
        />
        <TextInput
          style={styles.setInput}
          placeholder="RPE"
          placeholderTextColor={"rgb(108, 101, 101)"}
          keyboardType="numeric"
          value={rpe}
          onChangeText={setRpe}
        />
        <TouchableOpacity style={styles.addSetButton} onPress={handleAddSet}>
          <Text style={styles.addSetButtonText}>Add</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  exerciseContainer: {
    padding: 10,
    marginBottom: 15,
    backgroundColor: "#1a1a1a",
    borderRadius: 8,
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 5,
  },
  setText: {
    fontSize: 16,
    color: "#ccc",
    marginBottom: 3,
  },
  setInputRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  setInput: {
    flex: 1,
    backgroundColor: "#333",
    color: "#fff",
    padding: 8,
    marginRight: 5,
    borderRadius: 5,
  },
  addSetButton: {
    backgroundColor: "#AF125A",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
  },
  addSetButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});

export default Exercise;
