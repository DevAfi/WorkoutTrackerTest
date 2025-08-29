import React, { useState } from "react";
import {
  ActivityIndicator,
  TouchableOpacity,
  Text,
  StyleSheet,
} from "react-native";
import { useWorkout } from "../context/WorkoutContext";

interface EndWorkoutButtonProps {
  onEnded?: () => void;
  onShowRecap?: (workoutId: string, duration: number) => void;
  workoutStartTime?: Date;
}

const EndWorkoutButton: React.FC<EndWorkoutButtonProps> = ({
  onEnded,
  onShowRecap,
  workoutStartTime,
}) => {
  const [loading, setLoading] = useState(false);
  const { endWorkout, activeWorkoutId } = useWorkout();

  const handleEnd = async () => {
    if (!activeWorkoutId) return;

    setLoading(true);

    // Calculate workout duration
    const endTime = new Date();
    const duration = workoutStartTime
      ? Math.floor(
          (endTime.getTime() - workoutStartTime.getTime()) / (1000 * 60)
        )
      : 0;

    await endWorkout();
    setLoading(false);

    // Show recap modal instead of immediately navigating
    if (onShowRecap) {
      onShowRecap(activeWorkoutId, duration);
    } else if (onEnded) {
      onEnded();
    }
  };

  return loading ? (
    <ActivityIndicator size="small" color="#10b981" />
  ) : (
    <TouchableOpacity onPress={handleEnd} style={styles.button}>
      <Text style={styles.endText}>Finish Workout</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#10b981",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  endText: {
    color: "#ffffff",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default EndWorkoutButton;
