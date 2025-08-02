import React, { useState, useEffect, useCallback } from "react";
import { View, Button, ScrollView, Text, StyleSheet } from "react-native";
import {
  useNavigation,
  useIsFocused,
  useRoute,
  useFocusEffect,
} from "@react-navigation/native";
import Exercise from "../../components/workoutComponents/[Exercise}";

const currentWorkoutScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const isFocused = useIsFocused();

  const [exercises, setExercises] = useState([]);

  useFocusEffect(
    useCallback(() => {
      if (route.params?.newExercises) {
        console.log("Received new exercises:", route.params.newExercises); // 🧪 TEST LOG
        setExercises((prev) => [
          ...prev,
          ...route.params.newExercises.map((ex) => ({
            ...ex,
            sets: [{ id: 1 }],
          })),
        ]);

        navigation.setParams({ newExercises: null }); // clear to avoid double adding
      }
    }, [route.params?.newExercises])
  );

  return (
    <View style={{ flex: 1, padding: 16 }}>
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
  exercisesContainer: {
    paddingVertical: 10,
  },
});
export default currentWorkoutScreen;
