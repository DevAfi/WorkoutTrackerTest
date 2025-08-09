import React, { useState, useEffect } from "react";
import {
  View,
  FlatList,
  Text,
  TouchableOpacity,
  Button,
  StyleSheet,
  TextInput,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { supabase } from "../../lib/supabase";
import { useWorkout } from "../../context/WorkoutContext";

async function fetchExercises() {
  const { data, error } = await supabase
    .from("exercises")
    .select("*")
    .order("name", { ascending: true });
  if (error) throw error;
  return data;
}

const ExerciseSelectScreen = () => {
  const navigation = useNavigation();
  const { addExerciseToWorkout } = useWorkout();
  const [allExercises, setAllExercises] = useState([]);
  const [filteredExercises, setFilteredExercises] = useState([]);
  const [groupedExercises, setGroupedExercises] = useState([]);
  const [selected, setSelected] = useState([]);
  const [sortBy, setSortBy] = useState("name");
  const [expandedSections, setExpandedSections] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState("");

  const toggleSelect = (exercise) => {
    setSelected((prev) =>
      prev.find((e) => e.id === exercise.id)
        ? prev.filter((e) => e.id !== exercise.id)
        : [...prev, exercise]
    );
  };

  const confirmSelection = async () => {
    for (let i = 0; i < selected.length; i++) {
      await addExerciseToWorkout(selected[i].id, i + 1);
    }
    navigation.navigate("currentWorkoutScreen");
  };

  const filterExercises = (exercises, query) => {
    if (!query.trim()) return exercises;

    return exercises.filter(
      (exercise) =>
        exercise.name?.toLowerCase().includes(query.toLowerCase()) ||
        exercise.category?.toLowerCase().includes(query.toLowerCase()) ||
        exercise.equipment?.toLowerCase().includes(query.toLowerCase())
    );
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
      const muscle = exercise.category || "Unknown";
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

  const updateGroupedExercises = (exercises, sortType) => {
    let grouped;
    if (sortType === "name") {
      grouped = groupExercisesByLetter(exercises);
    } else if (sortType === "muscle") {
      grouped = groupExercisesByMuscle(exercises);
    }
    setGroupedExercises(grouped);
  };

  const handleSortChange = (newSortType) => {
    setSortBy(newSortType);
    setExpandedSections(new Set());
    updateGroupedExercises(filteredExercises, newSortType);
  };

  const handleSearchChange = (query) => {
    setSearchQuery(query);
    const filtered = filterExercises(allExercises, query);
    setFilteredExercises(filtered);
    updateGroupedExercises(filtered, sortBy);

    // Auto-expand sections if searching
    if (query.trim()) {
      const allSectionIds = new Set();
      const grouped =
        sortBy === "name"
          ? groupExercisesByLetter(filtered)
          : groupExercisesByMuscle(filtered);
      grouped.forEach((section) => allSectionIds.add(section.id));
      setExpandedSections(allSectionIds);
    } else {
      setExpandedSections(new Set());
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    setFilteredExercises(allExercises);
    updateGroupedExercises(allExercises, sortBy);
    setExpandedSections(new Set());
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

  const highlightSearchTerm = (text, searchTerm) => {
    if (!searchTerm.trim()) return text;

    const regex = new RegExp(`(${searchTerm})`, "gi");
    return text.replace(regex, "**$1**"); // Simple highlighting placeholder
  };

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
              <TouchableOpacity
                key={exercise.id}
                onPress={() => toggleSelect(exercise)}
                style={styles.exerciseContainer}
              >
                <View>
                  <Text
                    style={
                      isSelected(exercise)
                        ? styles.selectedExercise
                        : styles.unselectedExercise
                    }
                  >
                    {exercise.name}
                  </Text>
                  {searchQuery.trim() && (
                    <Text style={styles.exerciseDetails}>
                      {exercise.category || "Unknown"} •{" "}
                      {exercise.equipment || "No equipment"}
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            ))}
        </View>
      );
    }
    return null;
  };

  useEffect(() => {
    fetchExercises().then((data) => {
      setAllExercises(data);
      setFilteredExercises(data);
      const grouped = groupExercisesByLetter(data);
      setGroupedExercises(grouped);
    });
  }, []);

  return (
    <View style={{ flex: 1, padding: 16, backgroundColor: "black" }}>
      {/* Search Input */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search exercises, muscle groups, or equipment..."
          placeholderTextColor="#888"
          value={searchQuery}
          onChangeText={handleSearchChange}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
            <Text style={styles.clearButtonText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Results counter */}
      {searchQuery.trim() && (
        <Text style={styles.resultsCounter}>
          {filteredExercises.length} result
          {filteredExercises.length !== 1 ? "s" : ""} found
        </Text>
      )}

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
        showsVerticalScrollIndicator={false}
      />

      <Button
        title={`Add Exercise${selected.length !== 1 ? "s" : ""} (${
          selected.length
        })`}
        onPress={confirmSelection}
        disabled={selected.length === 0}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    position: "relative",
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#555",
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: "#f5f1ed",
    backgroundColor: "#1a1a1a",
  },
  clearButton: {
    position: "absolute",
    right: 15,
    padding: 5,
  },
  clearButtonText: {
    color: "#AF125A",
    fontSize: 18,
    fontWeight: "bold",
  },
  resultsCounter: {
    color: "#888",
    fontSize: 14,
    marginBottom: 10,
    textAlign: "center",
  },
  exerciseDetails: {
    color: "#888",
    fontSize: 14,
    marginTop: 2,
  },
  selectedExercise: {
    color: "#f5f1ed",
    fontSize: 20,
    fontWeight: "700",
    backgroundColor: "#252323",
    borderRadius: 10,
    padding: 10,
  },
  unselectedExercise: {
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
