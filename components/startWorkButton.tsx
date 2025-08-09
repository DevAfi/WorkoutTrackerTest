import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useWorkout } from "../context/WorkoutContext.js";

const StartWorkButton = () => {
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();
  const { startWorkout } = useWorkout();

  const handleStart = async () => {
    setLoading(true);
    const workoutId = await startWorkout();
    setLoading(false);

    if (workoutId) {
      navigation.navigate("currentWorkoutScreen", { sessionId: workoutId });
    }
  };

  return (
    <View style={styles.buttonContainer}>
      {loading ? (
        <ActivityIndicator />
      ) : (
        <TouchableOpacity onPress={handleStart}>
          <Text style={styles.buttonText}>Start Workout</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    backgroundColor: "#0D0C0C",
    padding: 7,
    borderRadius: 10,
    width: 350,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "#f5f1ed",
    fontSize: 28,
    fontWeight: "600",
  },
});

export default StartWorkButton;
