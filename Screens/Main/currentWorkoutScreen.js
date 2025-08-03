import React, { useState, useEffect, useLayoutEffect } from "react";
import {
  View,
  Button,
  ScrollView,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from "react-native";
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
  const [totalWeight, setTotalWeight] = useState("0");

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

      navigation.setParams({ newExercises: null });
    }
  }, [route.params?.newExercises]);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.titleText}>Log your workout</Text>
      <Text style={styles.weightText}>Total Weight: {totalWeight}</Text>

      <ScrollView style={styles.exercisesContainer}>
        {exercises.map((exercise, index) => (
          <Exercise key={index} exercise={exercise} />
        ))}
      </ScrollView>

      <TouchableOpacity
        onPress={() => navigation.navigate("selectExercise")}
        style={styles.addButtonContainer}
      >
        <Text style={styles.addButton}>Add exercises</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#252323",
  },
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
  exercisesContainer: {
    marginTop: 15,
    paddingVertical: 10,
    //backgroundColor: "blue",
  },
  addButtonContainer: {},
  addButton: {
    fontSize: 20,
    color: "#f5f1ed",

    textAlign: "center",
    height: 50,
    top: "25%",
  },
});
export default CurrentWorkoutScreen;
