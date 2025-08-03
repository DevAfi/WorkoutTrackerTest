import React, { useState } from "react";
import { Button, ActivityIndicator, Alert } from "react-native";
import { supabase } from "../lib/supabase";

const EndWorkoutButton = ({
  sessionId,
  onEnded,
}: {
  sessionId: string;
  onEnded?: () => void;
}) => {
  const [loading, setLoading] = useState(false);

  const endWorkout = async () => {
    setLoading(true);

    const { error } = await supabase
      .from("workout_sessions")
      .update({ ended_at: new Date().toISOString() })
      .eq("id", sessionId);
    console.log("Ended");
    setLoading(false);

    if (error) {
      console.error("Error ending workout:", error);
      Alert.alert("Error", "Failed to end workout.");
      return;
    }

    Alert.alert("Workout Complete", "Session has been ended.");
    if (onEnded) onEnded(); // Optional callback for parent
    console.log("Last Line");
  };

  return loading ? (
    <ActivityIndicator />
  ) : (
    <Button title="End Workout" onPress={endWorkout} color="crimson" />
  );
};

export default EndWorkoutButton;
