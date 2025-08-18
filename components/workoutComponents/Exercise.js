import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { supabase } from "../../lib/supabase";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

const Exercise = ({ exercise, workoutExerciseId, onDelete }) => {
  const [sets, setSets] = useState([]);
  const [previousSets, setPreviousSets] = useState([]);
  const [note, setNote] = useState("");
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    getCurrentUser();
  }, []);

  useEffect(() => {
    if (workoutExerciseId) {
      fetchSets();
    }
    if (exercise?.id && userId) {
      fetchPreviousWorkoutData();
    }
  }, [workoutExerciseId, exercise, userId]);

  const getCurrentUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      setUserId(user.id);
    }
  };

  const fetchSets = async () => {
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

  const fetchPreviousWorkoutData = async () => {
    try {
      const { data, error } = await supabase
        .from("workout_sessions")
        .select(
          `
          id,
          ended_at,
          workout_exercises!inner (
            id,
            exercise_id,
            sets (
              set_number,
              reps,
              weight,
              rpe
            )
          )
        `
        )
        .eq("user_id", userId)
        .eq("workout_exercises.exercise_id", exercise.id)
        .not("ended_at", "is", null)
        .order("ended_at", { ascending: false })
        .limit(1);

      if (error) {
        console.error("Error fetching previous workout data:", error);
        return;
      }

      if (data && data.length > 0) {
        const lastWorkout = data[0];
        const exerciseData = lastWorkout.workout_exercises.find(
          (we) => we.exercise_id === exercise.id
        );

        if (exerciseData && exerciseData.sets) {
          const sortedSets = exerciseData.sets.sort(
            (a, b) => a.set_number - b.set_number
          );
          setPreviousSets(sortedSets);

          const initialSets = sortedSets.map((_, index) => ({
            id: `temp_${index}`,
            set_number: index + 1,
            reps: "",
            weight: "",
            rpe: "",
            completed: false,
            isFromPrevious: false,
          }));

          setSets(initialSets);
        }
      }
    } catch (error) {
      console.error("Error in fetchPreviousWorkoutData:", error);
    }
  };

  const handleDeleteExercise = () => {
    Alert.alert(
      "Delete Exercise",
      `Are you sure you want to delete ${exercise.name} from this workout? This will remove all sets for this exercise.`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const { error: setsError } = await supabase
                .from("sets")
                .delete()
                .eq("workout_exercise_id", workoutExerciseId);

              if (setsError) {
                console.error("Error deleting sets:", setsError);
                Alert.alert("Error", "Failed to delete exercise sets");
                return;
              }

              const { error: exerciseError } = await supabase
                .from("workout_exercises")
                .delete()
                .eq("id", workoutExerciseId);

              if (exerciseError) {
                console.error(
                  "Error deleting workout exercise:",
                  exerciseError
                );
                Alert.alert("Error", "Failed to delete exercise");
                return;
              }

              if (onDelete) {
                onDelete();
              }
            } catch (error) {
              console.error("Error in handleDeleteExercise:", error);
              Alert.alert("Error", "Failed to delete exercise");
            }
          },
        },
      ]
    );
  };

  const handleSetCompletion = async (setIndex) => {
    const currentSet = sets[setIndex];

    if (currentSet.completed) {
      return;
    }

    try {
      const { data, error } = await supabase
        .from("sets")
        .insert([
          {
            workout_exercise_id: workoutExerciseId,
            set_number: setIndex + 1,
            reps: parseInt(currentSet.reps),
            weight: parseFloat(currentSet.weight),
            rpe: parseFloat(currentSet.rpe),
          },
        ])
        .select()
        .single();

      if (error) {
        console.error("Error adding set:", error);
        Alert.alert("Error", "Failed to save set");
        return;
      }

      const updatedSets = [...sets];
      updatedSets[setIndex] = {
        ...data,
        completed: true,
        isFromPrevious: false,
      };
      setSets(updatedSets);
    } catch (error) {
      console.error("Error in handleSetCompletion:", error);
      Alert.alert("Error", "Failed to save set");
    }
  };

  const handleSetValueChange = (setIndex, field, value) => {
    const updatedSets = [...sets];
    updatedSets[setIndex] = {
      ...updatedSets[setIndex],
      [field]: value,
    };
    setSets(updatedSets);
  };

  const addNewSet = () => {
    const newSetNumber = sets.length + 1;
    const lastSet = sets[sets.length - 1];

    const newSet = {
      id: `temp_${Date.now()}`,
      set_number: newSetNumber,
      reps: lastSet ? lastSet.reps : "",
      weight: lastSet ? lastSet.weight : "",
      rpe: lastSet ? lastSet.rpe : "",
      completed: false,
      isFromPrevious: false,
    };

    setSets([...sets, newSet]);
  };

  const removeSet = (setIndex) => {
    const setToRemove = sets[setIndex];

    if (
      setToRemove.completed &&
      !setToRemove.id.toString().startsWith("temp_")
    ) {
      Alert.alert("Cannot delete completed sets");
      return;
    }

    const updatedSets = sets.filter((_, index) => index !== setIndex);
    setSets(updatedSets);
  };

  const getPlaceholder = (setIndex, field) => {
    if (previousSets && previousSets[setIndex]) {
      const previousSet = previousSets[setIndex];
      switch (field) {
        case "weight":
          return previousSet.weight ? `${previousSet.weight}kg` : "kg";
        case "reps":
          return previousSet.reps ? `${previousSet.reps}` : "reps";
        case "rpe":
          return previousSet.rpe ? `${previousSet.rpe}` : "RPE";
        default:
          return field;
      }
    }
    switch (field) {
      case "weight":
        return "kg";
      case "reps":
        return "reps";
      case "rpe":
        return "RPE";
      default:
        return field;
    }
  };

  const renderSetRow = (set, index) => {
    const isCompleted = set.completed;
    const canEdit = !isCompleted;

    return (
      <View key={set.id} style={styles.setRow}>
        <View style={styles.setNumberContainer}>
          <Text style={styles.setNumber}>{index + 1}</Text>
        </View>

        <TextInput
          style={[styles.setInput, isCompleted && styles.completedInput]}
          placeholder={getPlaceholder(index, "weight")}
          placeholderTextColor="rgb(108, 101, 101)"
          keyboardType="numeric"
          value={set.weight.toString()}
          onChangeText={(value) => handleSetValueChange(index, "weight", value)}
          editable={canEdit}
        />

        <Text style={styles.inputSeparator}>×</Text>

        <TextInput
          style={[styles.setInput, isCompleted && styles.completedInput]}
          placeholder={getPlaceholder(index, "reps")}
          placeholderTextColor="rgb(108, 101, 101)"
          keyboardType="numeric"
          value={set.reps.toString()}
          onChangeText={(value) => handleSetValueChange(index, "reps", value)}
          editable={canEdit}
        />

        <TextInput
          style={[styles.setInput, isCompleted && styles.completedInput]}
          placeholder={getPlaceholder(index, "rpe")}
          placeholderTextColor="rgb(108, 101, 101)"
          keyboardType="numeric"
          value={set.rpe.toString()}
          onChangeText={(value) => handleSetValueChange(index, "rpe", value)}
          editable={canEdit}
        />

        <TouchableOpacity
          style={[
            styles.checkButton,
            isCompleted && styles.checkButtonCompleted,
          ]}
          onPress={() => handleSetCompletion(index)}
          disabled={isCompleted}
        >
          <MaterialIcons
            name={isCompleted ? "check-circle" : "radio-button-unchecked"}
            size={24}
            color={isCompleted ? "#10b981" : "#666"}
          />
        </TouchableOpacity>

        {canEdit && (
          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => removeSet(index)}
          >
            <MaterialIcons name="close" size={20} color="#ef4444" />
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View style={styles.exerciseContainer}>
      <View style={styles.exerciseHeader}>
        <View style={styles.exerciseHeaderLeft}>
          <Text style={styles.exerciseName}>{exercise.name}</Text>
          {previousSets.length > 0 && (
            <Text style={styles.previousWorkoutText}>
              Last: {previousSets.length} sets
            </Text>
          )}
        </View>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={handleDeleteExercise}
        >
          <MaterialIcons name="delete" size={20} color="#ef4444" />
        </TouchableOpacity>
      </View>

      <TextInput
        style={styles.notesInput}
        placeholder="Add notes here..."
        placeholderTextColor="rgb(108, 101, 101)"
        value={note}
        onChangeText={setNote}
        multiline
      />

      <View style={styles.setsHeader}>
        <Text style={styles.setsHeaderText}>Set</Text>
        <Text style={styles.setsHeaderText}>Weight</Text>
        <Text style={styles.setsHeaderText}>Reps</Text>
        <Text style={styles.setsHeaderText}>RPE</Text>
        <Text style={styles.setsHeaderText}>✓</Text>
        <View style={styles.headerSpacer} />
      </View>

      {sets.map((set, index) => renderSetRow(set, index))}

      <TouchableOpacity style={styles.addSetButton} onPress={addNewSet}>
        <MaterialIcons name="add" size={20} color="#2563eb" />
        <Text style={styles.addSetButtonText}>Add Set</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  exerciseContainer: {
    padding: 16,
    backgroundColor: "#111111",
    borderRadius: 12,
    marginBottom: 12,
  },
  exerciseHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  exerciseHeaderLeft: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  previousWorkoutText: {
    fontSize: 12,
    color: "#888",
    fontStyle: "italic",
    marginTop: 2,
  },
  deleteButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: "#1a1a1a",
    marginLeft: 12,
  },
  notesInput: {
    backgroundColor: "#1a1a1a",
    color: "#fff",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    minHeight: 40,
  },
  setsHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 8,
    backgroundColor: "#1a1a1a",
    borderRadius: 8,
    marginBottom: 8,
  },
  setsHeaderText: {
    color: "#888",
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
    flex: 1,
  },
  headerSpacer: {
    width: 40,
  },
  setRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 4,
    marginBottom: 8,
    backgroundColor: "#0d1117",
    borderRadius: 8,
  },
  setNumberContainer: {
    width: 30,
    alignItems: "center",
  },
  setNumber: {
    color: "#888",
    fontSize: 14,
    fontWeight: "600",
  },
  setInput: {
    flex: 1,
    backgroundColor: "#1a1a1a",
    color: "#fff",
    padding: 8,
    marginHorizontal: 4,
    borderRadius: 6,
    textAlign: "center",
    fontSize: 14,
  },
  completedInput: {
    backgroundColor: "#0f3f2f",
    color: "#10b981",
  },
  inputSeparator: {
    color: "#666",
    fontSize: 16,
    fontWeight: "bold",
    marginHorizontal: 4,
  },
  checkButton: {
    padding: 4,
    marginLeft: 8,
  },
  checkButtonCompleted: {
    opacity: 0.7,
  },
  removeButton: {
    padding: 4,
    marginLeft: 4,
    width: 32,
    alignItems: "center",
  },
  addSetButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1a1a1a",
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#2563eb",
    borderStyle: "dashed",
  },
  addSetButtonText: {
    color: "#2563eb",
    fontWeight: "600",
    marginLeft: 4,
  },
});

export default Exercise;
