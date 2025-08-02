import React, { useState, useEffect, useLayoutEffect } from "react";
import { View, Button, ScrollView, Text, StyleSheet } from "react-native";
import {
  useNavigation,
  useIsFocused,
  useRoute,
} from "@react-navigation/native";
import Exercise from "../../components/workoutComponents/Exercise";

const CurrentWorkoutScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const isFocused = useIsFocused();
  const [exercises, setExercises] = useState([]);

  useEffect(() => {
    if (route.params?.newExercises) {
      console.log("Received from ExerciseSelect:", route.params.newExercises);
      setExercises((prev) => [
        ...prev,
        ...route.params.newExercises.map((ex) => ({
          ...ex,
          sets: [{ id: 1 }],
        })),
      ]);

      // Clear param to prevent repeated addition
      navigation.setParams({ newExercises: null });
    }
  }, [route.params?.newExercises]);

  return (
    <View style={styles.container}>
      <ScrollView style={styles.exercisesContainer}>
        {exercises.map((exercise, index) => (
          <Exercise key={index} exercise={exercise} />
        ))}
      </ScrollView>

      <Button
        title="Add Exercise"
        onPress={() => navigation.navigate("selectExercise")}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  exercisesContainer: {
    paddingVertical: 10,
    backgroundColor: "blue",
  },
});
export default CurrentWorkoutScreen;
