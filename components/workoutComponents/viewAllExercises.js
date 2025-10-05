import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  View,
  FlatList,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  Alert,
} from "react-native";
import {
  useNavigation,
  useRoute,
  useFocusEffect,
} from "@react-navigation/native";
import { supabase } from "../../lib/supabase";

const fetchExercises = async () => {
  try {
    const { data, error } = await supabase
      .from("exercises")
      .select("*")
      .order("name", { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching exercises:", error);
    throw error;
  }
};

const ViewAllExercises = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const sessionId = route.params?.sessionId;

  const [allExercises, setAllExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [expandedSections, setExpandedSections] = useState(
    new Set(["A", "B", "C"])
  );
  const [refreshing, setRefreshing] = useState(false);

  const groupExercisesByLetter = useCallback((exercises) => {
    const groups = exercises.reduce((acc, exercise) => {
      const firstLetter = exercise.name?.charAt(0).toUpperCase() || "#";
      if (!acc[firstLetter]) acc[firstLetter] = [];
      acc[firstLetter].push(exercise);
      return acc;
    }, {});

    return Object.keys(groups)
      .sort()
      .map((letter) => ({
        id: `letter-${letter}`,
        type: "header",
        title: letter,
        exercises: groups[letter].sort((a, b) => a.name.localeCompare(b.name)),
      }));
  }, []);

  const groupExercisesByMuscle = useCallback((exercises) => {
    const groups = exercises.reduce((acc, exercise) => {
      const muscle = exercise.category || "Other";
      if (!acc[muscle]) acc[muscle] = [];
      acc[muscle].push(exercise);
      return acc;
    }, {});

    return Object.keys(groups)
      .sort()
      .map((muscle) => ({
        id: `muscle-${muscle}`,
        type: "header",
        title: muscle,
        exercises: groups[muscle].sort((a, b) => a.name.localeCompare(b.name)),
      }));
  }, []);

  const filteredExercises = useMemo(() => {
    if (!searchQuery.trim()) return allExercises;

    const query = searchQuery.toLowerCase().trim();
    return allExercises.filter(
      (exercise) =>
        exercise.name?.toLowerCase().includes(query) ||
        exercise.category?.toLowerCase().includes(query) ||
        exercise.equipment?.toLowerCase().includes(query)
    );
  }, [allExercises, searchQuery]);

  const groupedExercises = useMemo(() => {
    if (sortBy === "name") {
      return groupExercisesByLetter(filteredExercises);
    }
    return groupExercisesByMuscle(filteredExercises);
  }, [
    filteredExercises,
    sortBy,
    groupExercisesByLetter,
    groupExercisesByMuscle,
  ]);

  const loadExercises = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchExercises();
      setAllExercises(data);
    } catch (error) {
      Alert.alert("Error", "Failed to load exercises. Please try again.", [
        { text: "OK" },
      ]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadExercises();
    setRefreshing(false);
  }, [loadExercises]);

  const navigateToExercise = useCallback(
    (exercise) => {
      navigation.navigate("exerciseDetailsPage", {
        exerciseId: exercise.id,
        name: exercise.name,
        category: exercise.category,
        equipment: exercise.equipment,
        instructions: exercise.instructions,
        sessionId,
      });
    },
    [navigation, sessionId]
  );

  const handleSortChange = useCallback((newSortType) => {
    setSortBy(newSortType);
    setExpandedSections(new Set());
  }, []);

  const toggleSection = useCallback((sectionId) => {
    setExpandedSections((prev) => {
      const newExpanded = new Set(prev);
      if (newExpanded.has(sectionId)) {
        newExpanded.delete(sectionId);
      } else {
        newExpanded.add(sectionId);
      }
      return newExpanded;
    });
  }, []);

  const expandAll = useCallback(() => {
    const allSectionIds = groupedExercises.map((group) => group.id);
    setExpandedSections(new Set(allSectionIds));
  }, [groupedExercises]);

  const collapseAll = useCallback(() => {
    setExpandedSections(new Set());
  }, []);

  const clearSearch = useCallback(() => {
    setSearchQuery("");
  }, []);

  const renderExerciseItem = useCallback(
    ({ exercise }) => (
      <TouchableOpacity
        key={exercise.id}
        onPress={() => navigateToExercise(exercise)}
        style={styles.exerciseContainer}
        activeOpacity={0.7}
      >
        <View style={styles.exerciseContent}>
          <Text style={styles.exerciseName}>{exercise.name}</Text>
          {exercise.equipment && (
            <Text style={styles.exerciseDetail}>
              Equipment: {exercise.equipment}
            </Text>
          )}
        </View>
        <Text style={styles.chevron}>›</Text>
      </TouchableOpacity>
    ),
    [navigateToExercise]
  );

  const renderSectionHeader = useCallback(
    ({ item }) => {
      const isExpanded = expandedSections.has(item.id);

      return (
        <View>
          <TouchableOpacity
            style={styles.sectionHeader}
            onPress={() => toggleSection(item.id)}
            activeOpacity={0.8}
          >
            <Text style={styles.sectionHeaderText}>
              {item.title} ({item.exercises.length})
            </Text>
            <Text style={styles.expandIcon}>{isExpanded ? "−" : "+"}</Text>
          </TouchableOpacity>

          {isExpanded && (
            <View style={styles.exercisesList}>
              {item.exercises.map((exercise) =>
                renderExerciseItem({ exercise })
              )}
            </View>
          )}
        </View>
      );
    },
    [expandedSections, toggleSection, renderExerciseItem]
  );

  const renderItem = useCallback(
    ({ item }) => {
      if (item.type === "header") {
        return renderSectionHeader({ item });
      }
      return null;
    },
    [renderSectionHeader]
  );

  const keyExtractor = useCallback((item) => item.id, []);

  const renderEmptyComponent = useCallback(
    () => (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>
          {searchQuery
            ? "No exercises match your search"
            : "No exercises found"}
        </Text>
        {searchQuery && (
          <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
            <Text style={styles.clearButtonText}>Clear Search</Text>
          </TouchableOpacity>
        )}
      </View>
    ),
    [searchQuery, clearSearch]
  );

  useFocusEffect(
    useCallback(() => {
      loadExercises();
    }, [loadExercises])
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4a9eff" />
        <Text style={styles.loadingText}>Loading exercises...</Text>
      </View>
    );
  }

  const hasExpandedSections = expandedSections.size > 0;
  const totalExercises = filteredExercises.length;

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search exercises, muscles, or equipment..."
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
          returnKeyType="search"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            onPress={clearSearch}
            style={styles.searchClearButton}
          >
            <Text style={styles.searchClearText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.controlsContainer}>
        <View style={styles.sortContainer}>
          <TouchableOpacity
            style={[
              styles.sortButton,
              sortBy === "name" && styles.activeSortButton,
            ]}
            onPress={() => handleSortChange("name")}
            activeOpacity={0.8}
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
            activeOpacity={0.8}
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

        <View style={styles.expandContainer}>
          <TouchableOpacity
            onPress={hasExpandedSections ? collapseAll : expandAll}
            style={styles.expandAllButton}
            activeOpacity={0.8}
          >
            <Text style={styles.expandAllText}>
              {hasExpandedSections ? "Collapse All" : "Expand All"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {totalExercises > 0 && (
        <Text style={styles.resultsCount}>
          {totalExercises} exercise{totalExercises !== 1 ? "s" : ""} found
        </Text>
      )}

      <FlatList
        data={groupedExercises}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        ListEmptyComponent={renderEmptyComponent}
        showsVerticalScrollIndicator={false}
        getItemLayout={null}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={10}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "black",
  },
  loadingText: {
    color: "#f5f1ed",
    fontSize: 16,
    marginTop: 12,
  },
  searchContainer: {
    position: "relative",
    marginBottom: 16,
  },
  searchInput: {
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingRight: 40,
    fontSize: 16,
    color: "#f5f1ed",
    borderWidth: 1,
    borderColor: "#333",
  },
  searchClearButton: {
    position: "absolute",
    right: 12,
    top: "50%",
    transform: [{ translateY: -10 }],
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  searchClearText: {
    color: "#999",
    fontSize: 14,
    fontWeight: "bold",
  },
  controlsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sortContainer: {
    flexDirection: "row",
    gap: 10,
  },
  sortButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "#1a1a1a",
    borderWidth: 1,
    borderColor: "#333",
  },
  activeSortButton: {
    backgroundColor: "#4a9eff",
    borderColor: "#4a9eff",
  },
  sortButtonText: {
    color: "#AF125A",
    fontSize: 14,
    fontWeight: "500",
  },
  activeSortButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  expandContainer: {
    flexShrink: 1,
  },
  expandAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  expandAllText: {
    color: "#4a9eff",
    fontSize: 14,
    fontWeight: "500",
  },
  resultsCount: {
    color: "#999",
    fontSize: 14,
    marginBottom: 12,
    textAlign: "center",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#1a1a1a",
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#333",
  },
  sectionHeaderText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#AF125A",
    textTransform: "uppercase",
  },
  expandIcon: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#AF125A",
  },
  exercisesList: {
    marginLeft: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  exerciseContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#0a0a0a",
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginVertical: 2,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: "#4a9eff",
  },
  exerciseContent: {
    flex: 1,
  },
  exerciseName: {
    color: "#f5f1ed",
    fontSize: 16,
    fontWeight: "500",
  },
  exerciseDetail: {
    color: "#999",
    fontSize: 13,
    marginTop: 2,
  },
  chevron: {
    color: "#666",
    fontSize: 18,
    fontWeight: "300",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    color: "#999",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 16,
  },
  clearButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "#4a9eff",
    borderRadius: 20,
  },
  clearButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },
});

export default ViewAllExercises;
