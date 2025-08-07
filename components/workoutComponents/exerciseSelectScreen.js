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
  const [groupedExercises, setGroupedExercises] = useState([]);
  const [selected, setSelected] = useState([]);
  const [sortBy, setSortBy] = useState("name");
  const [expandedSections, setExpandedSections] = useState(new Set());
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

  const groupExercisesByLetter = (exercises) => {
    const groups = {};
    exercises.forEach((exercise) => {
      const firstLetter = exercise.name.charAt(0).toUpperCase();
      if (!groups[firstLetter]) {
        groups[firstLetter] = [];
      }
      groups[firstLetter].push(exercise);
    });

    return Object.keys(groups)
      .sort()
      .map((letter) => ({
        id: `letter-${letter}`,
        type: "header",
        title: letter,
        exercises: groups[letter].sort((a, b) => a.name.localeCompare(b.name)),
      }));
  };

  const groupExercisesByMuscle = (exercises) => {
    const groups = {};
    exercises.forEach((exercise) => {
      const muscle = exercise.category;
      if (!groups[muscle]) {
        groups[muscle] = [];
      }
      groups[muscle].push(exercise);
    });

    return Object.keys(groups)
      .sort()
      .map((muscle) => ({
        id: `muscle-${muscle}`,
        type: "header",
        title: muscle,
        exercises: groups[muscle].sort((a, b) => a.name.localeCompare(b.name)),
      }));
  };

  const handleSortChange = (newSortType) => {
    setSortBy(newSortType);
    setExpandedSections(new Set());

    let grouped;
    if (newSortType === "name") {
      grouped = groupExercisesByLetter(allExercises);
    } else if (newSortType === "muscle") {
      grouped = groupExercisesByMuscle(allExercises);
    }

    setGroupedExercises(grouped);
  };

  const toggleSection = (sectionId) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const isSelected = (exercise) => selected.some((e) => e.id === exercise.id);

  const renderItem = ({ item }) => {
    if (item.type === "header") {
      const isExpanded = expandedSections.has(item.id);
      return (
        <View>
          <TouchableOpacity
            style={styles.sectionHeader}
            onPress={() => toggleSection(item.id)}
          >
            <Text style={styles.sectionHeaderText}>
              {item.title} ({item.exercises.length})
            </Text>
            <Text style={styles.expandIcon}>{isExpanded ? "−" : "+"}</Text>
          </TouchableOpacity>

          {isExpanded &&
            item.exercises.map((exercise) => (
              <View key={exercise.id}>
                <TouchableOpacity
                  onPress={() => toggleSelect(exercise)}
                  style={styles.exerciseContainer}
                >
                  <Text
                    style={
                      isSelected(exercise)
                        ? styles.selectedExercise
                        : styles.unselectedExercise
                    }
                  >
                    {exercise.name || JSON.stringify(exercise)}
                  </Text>
                </TouchableOpacity>
                <Text>Test</Text>
              </View>
            ))}
        </View>
      );
    }
    return null;
  };

  React.useEffect(() => {
    fetchExercises().then((data) => {
      setAllExercises(data);
      const grouped = groupExercisesByLetter(data);
      setGroupedExercises(grouped);
    });
  }, []);

  return (
    <View style={{ flex: 1, padding: 16, backgroundColor: "black" }}>
      {/* Sort buttons */}
      <View style={styles.sortContainer}>
        <TouchableOpacity
          style={[
            styles.sortButton,
            sortBy === "name" && styles.activeSortButton,
          ]}
          onPress={() => handleSortChange("name")}
        >
          <Text
            style={[
              styles.sortButtonText,
              sortBy === "name" && styles.activeSortButtonText,
            ]}
          >
            A-Z
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.sortButton,
            sortBy === "muscle" && styles.activeSortButton,
          ]}
          onPress={() => handleSortChange("muscle")}
        >
          <Text
            style={[
              styles.sortButtonText,
              sortBy === "muscle" && styles.activeSortButtonText,
            ]}
          >
            By Muscle
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={groupedExercises}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
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
  exerciseContainer: {
    marginLeft: 20,
    borderLeftWidth: 2,
    borderLeftColor: "#333",
    paddingLeft: 10,
  },
  sortContainer: {
    flexDirection: "row",
    marginBottom: 16,
    gap: 10,
  },
  sortButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "#333",
    borderWidth: 1,
    borderColor: "#555",
  },
  activeSortButton: {
    backgroundColor: "#4a9eff",
    borderColor: "#4a9eff",
  },
  sortButtonText: {
    color: "#AF125A",
    fontSize: 16,
    fontWeight: "500",
  },
  activeSortButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#333",
    padding: 15,
    marginVertical: 5,
    borderRadius: 8,
  },
  sectionHeaderText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#AF125A",
    textTransform: "uppercase",
  },
  expandIcon: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#AF125A",
  },
});

export default ExerciseSelectScreen;
