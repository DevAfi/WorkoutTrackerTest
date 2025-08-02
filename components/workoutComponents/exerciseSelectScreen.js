import React, { useState, useEffect } from "react";
import {
  View,
  FlatList,
  Text,
  TouchableOpacity,
  Button,
  StyleSheet,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
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

  const toggleSelect = (exercise) => {
    setSelected((prev) =>
      prev.find((e) => e.id === exercise.id)
        ? prev.filter((e) => e.id !== exercise.id)
        : [...prev, exercise]
    );
  };

  const confirmSelection = () => {
    navigation.navigate("currentWorkoutScreen", { newExercises: selected });
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
              <Text style={{ color: "white" }}>
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

const styles = StyleSheet.create({});
export default ExerciseSelectScreen;
