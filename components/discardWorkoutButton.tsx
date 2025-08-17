import React, { useState } from "react";
import {
  ActivityIndicator,
  TouchableOpacity,
  Text,
  StyleSheet,
} from "react-native";
import { useWorkout } from "../context/WorkoutContext";

const DiscardWorkoutButton = ({ onEnded }) => {
  const [loading, setLoading] = useState(false);
  const { discardWorkout } = useWorkout();

  const handleDiscard = async () => {
    setLoading(true);
    await discardWorkout();
    setLoading(false);
    if (onEnded) onEnded();
  };

  return loading ? (
    <ActivityIndicator />
  ) : (
    <TouchableOpacity style={styles.discardButton} onPress={handleDiscard}>
      <Text style={styles.discardButtonText}>Discard</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
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
});

export default DiscardWorkoutButton;
