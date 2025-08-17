import React, { createContext, useContext, useState } from "react";
import { supabase } from "../lib/supabase";
import { Alert } from "react-native";

const WorkoutContext = createContext(null);

export const WorkoutProvider = ({ children }) => {
  const [activeWorkoutId, setActiveWorkoutId] = useState(null);

  const startWorkout = async (notes = null) => {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData?.user) {
      Alert.alert("Error", "You must be logged in to start a workout.");
      return null;
    }

    const { data, error } = await supabase
      .from("workout_sessions")
      .insert([{ user_id: userData.user.id, started_at: new Date(), notes }])
      .select()
      .single();

    if (error) {
      console.error("Error starting workout:", error);
      Alert.alert("Error", "Could not start workout.");
      return null;
    }

    setActiveWorkoutId(data.id);
    return data.id;
  };

  const addExerciseToWorkout = async (exerciseId, orderIndex = 1) => {
    if (!activeWorkoutId) {
      Alert.alert("Error", "No active workout.");
      return null;
    }

    const { data, error } = await supabase
      .from("workout_exercises")
      .insert([
        {
          workout_id: activeWorkoutId,
          exercise_id: exerciseId,
          order_index: orderIndex,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Error adding exercise:", error);
      Alert.alert("Error", "Could not add exercise.");
      return null;
    }

    return data.id;
  };

  const addSetToExercise = async (
    workoutExerciseId,
    reps,
    weight,
    rpe = null
  ) => {
    const { data, error } = await supabase
      .from("sets")
      .insert([{ workout_exercise_id: workoutExerciseId, reps, weight, rpe }])
      .select()
      .single();

    if (error) {
      console.error("Error adding set:", error);
      Alert.alert("Error", "Could not add set.");
      return null;
    }

    return data;
  };

  const endWorkout = async () => {
    if (!activeWorkoutId) {
      Alert.alert("Error", "No active workout.");
      return;
    }

    const { error } = await supabase
      .from("workout_sessions")
      .update({ ended_at: new Date() })
      .eq("id", activeWorkoutId);

    Alert.alert("Workout Logged!");
    if (error) {
      console.error("Error ending workout:", error);
      Alert.alert("Error", "Could not end workout.");
      return;
    }

    setActiveWorkoutId(null);
  };

  const discardWorkout = async () => {
    if (!activeWorkoutId) {
      Alert.alert("Error", "No active workout.");
      return;
    }

    const { error } = await supabase
      .from("workout_sessions")
      .delete()
      .eq("id", activeWorkoutId);

    Alert.alert("Workout Logged!");
    if (error) {
      console.error("Error ending workout:", error);
      Alert.alert("Error", "Could not end workout.");
      return;
    }

    setActiveWorkoutId(null);
  };

  return (
    <WorkoutContext.Provider
      value={{
        activeWorkoutId,
        startWorkout,
        addExerciseToWorkout,
        addSetToExercise,
        endWorkout,
        discardWorkout,
      }}
    >
      {children}
    </WorkoutContext.Provider>
  );
};

// Hook for easy usage
export const useWorkout = () => {
  const ctx = useContext(WorkoutContext);
  if (!ctx) throw new Error("useWorkout must be used within a WorkoutProvider");
  return ctx;
};
