import React, { useState, useEffect } from "react";
import { View, Button, ScrollView, Text } from "react-native";
import {
  useNavigation,
  useIsFocused,
  useRoute,
} from "@react-navigation/native";

const currentWorkoutScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const isFocused = useIsFocused();

  const [exercises, setExercises] = useState([]);

  useEffect(() => {
    if (isFocused && route.params?.newExercises) {
      setExercises((prev) => [
        ...prev,
        ...route.params.newExercises.map((ex, idx) => ({
          ...ex,
          sets: [{ id: 1 }],
        })),
      ]);
      navigation.setParams({ newExercises: null });
    }
  }, [route.params?.newExercises, isFocused]);

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <ScrollView>
        {exercises.map((exercise, index) => (
          <ExerciseEntry key={index} exercise={exercise} />
        ))}
      </ScrollView>

      <Button
        title="Add Exercise"
        onPress={() => navigation.navigate("selectExercise")}
      />
    </View>
  );
};

export default currentWorkoutScreen;
