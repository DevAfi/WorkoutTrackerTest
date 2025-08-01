import React, { useState, useEffect } from "react";
import { View, FlatList, Text, TouchableOpacity, Button } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { supabase } from "../../lib/supabase";

const ExerciseSelectScreen = () => {
  const navigation = useNavigation();
  const [allExercises, setAllExercises] = useState([]);
  const [selected, setSelected] = useState([]);

  useEffect(() => {
    const fetchExercises = async () => {
      const { data, error } = await supabase.from("exercises").select("*");
      if (error) {
        console.error("Supabase error:", error);
      } else {
        console.log("Fetched exercises:", data);
        setAllExercises(data);
      }
    };
    fetchExercises();
  }, []);

  const toggleSelect = (exercise) => {
    setSelected((prev) =>
      prev.find((e) => e.id === exercise.id)
        ? prev.filter((e) => e.id !== exercise.id)
        : [...prev, exercise]
    );
  };

  const confirmSelection = () => {
    navigation.navigate("Workout", { newExercises: selected });
  };

  const isSelected = (exercise) => selected.some((e) => e.id === exercise.id);

  return (
    <View style={{ flex: 1, padding: 16, backgroundColor: "black" }}>
      <FlatList
        data={allExercises}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => toggleSelect(item)}
            style={{
              padding: 12,
              backgroundColor: isSelected(item) ? "#cce5ff" : "#f9f9f9",
              borderBottomWidth: 1,
              borderColor: "#ddd",
            }}
          >
            <Text>{item.name}</Text>
          </TouchableOpacity>
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

export default ExerciseSelectScreen;
