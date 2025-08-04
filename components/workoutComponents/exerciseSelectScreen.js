import React, { useState, useEffect } from "react";
import {
  View,
  FlatList,
  Text,
  TouchableOpacity,
  Button,
  StyleSheet,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { supabase } from "../../lib/supabase";

async function fetchExercises() {
  const { data, error } = await supabase
    .from("exercises")
    .select("*")
    .order("name", { ascending: true });
  console.log("fetching exercises");
  if (error) throw error;
  return data;
}

const ExerciseSelectScreen = () => {
  const navigation = useNavigation();
  const [allExercises, setAllExercises] = useState([]);
  const [selected, setSelected] = useState([]);
  const route = useRoute();
  const sessionId = route.params?.sessionId;

  const toggleSelect = (exercise) => {
    setSelected((prev) =>
      prev.find((e) => e.id === exercise.id)
        ? prev.filter((e) => e.id !== exercise.id)
        : [...prev, exercise]
    );
  };

  const confirmSelection = () => {
    navigation.navigate({
      name: "currentWorkoutScreen",
      params: { newExercises: selected, sessionId },
      merge: true,
    });
  };

  const isSelected = (exercise) => selected.some((e) => e.id === exercise.id);

  React.useEffect(() => {
    fetchExercises().then((data) => {
      setAllExercises(data);
    });
  }, []);
  return (
    <View style={{ flex: 1, padding: 16, backgroundColor: "black" }}>
      <FlatList
        data={allExercises}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View>
            <TouchableOpacity onPress={() => toggleSelect(item)}>
              <Text
                style={
                  isSelected(item)
                    ? styles.selectedExercise
                    : styles.unselectedExercise
                }
              >
                {item.name || JSON.stringify(item)}
              </Text>
            </TouchableOpacity>
            <Text>Test</Text>
          </View>
        )}
      />
      <Button
        title="Add Exercise(s)"
        onPress={confirmSelection}
        disabled={selected.length === 0}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  selectedExercise: {
    fontFamily: "Arial",
    color: "#f5f1ed",
    fontSize: 20,
    fontWeight: "700",
    backgroundColor: "#252323",
    borderRadius: 10,
    padding: 10,
  },
  unselectedExercise: {
    fontFamily: "Arial",
    color: "#f5f1ed",
    fontSize: 20,
    fontWeight: "500",
    marginVertical: 10,
  },
});
export default ExerciseSelectScreen;
