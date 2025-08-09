import React, { useState } from "react";
import {
  ActivityIndicator,
  TouchableOpacity,
  Text,
  StyleSheet,
} from "react-native";
import { useWorkout } from "../context/WorkoutContext";

const EndWorkoutButton = ({ onEnded }) => {
  const [loading, setLoading] = useState(false);
  const { endWorkout } = useWorkout();

  const handleEnd = async () => {
    setLoading(true);
    await endWorkout();
    setLoading(false);
    if (onEnded) onEnded();
  };

  return loading ? (
    <ActivityIndicator />
  ) : (
    <TouchableOpacity onPress={handleEnd}>
      <Text style={styles.endText}>End Workout</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  endText: {
    color: "crimson",
    textAlign: "center",
    height: 50,
    top: "25%",
    fontSize: 20,
  },
});

export default EndWorkoutButton;
