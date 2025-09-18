import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { supabase } from "../../lib/supabase";
import { useWorkout } from "../../context/WorkoutContext";

const WorkoutHub = ({ navigation }) => {
  const [workoutView, setWorkoutView] = useState("custom");
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const { setActiveWorkoutId } = useWorkout();

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("workout_templates")
      .select("*")
      .eq("is_public", workoutView === "premade")
      .order("created_at", { ascending: false });

    if (!error) {
      setTemplates(data || []);
    }
    setLoading(false);
  };

  // When view changes, reload templates
  useEffect(() => {
    loadTemplates();
  }, [workoutView]);

  const viewTemplate = (template) => {
    navigation.navigate("WorkoutTemplateDetail", { templateId: template.id });
  };

  const SimpleTemplateCard = ({ template }) => (
    <TouchableOpacity
      style={styles.templateCard}
      onPress={() => viewTemplate(template)}
    >
      <Text style={styles.templateTitle}>{template.name}</Text>
      <Text style={styles.templateDescription}>{template.description}</Text>
      <Text style={styles.templateCategory}>{template.category}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topButtonsContainer}>
        <TouchableOpacity
          style={[
            styles.topButton,
            workoutView === "premade" && styles.activeTopButton,
          ]}
          onPress={() => setWorkoutView("premade")}
        >
          <Text
            style={[
              styles.topButtonText,
              workoutView === "premade" && styles.activeTopButtonText,
            ]}
          >
            Legacy Workouts
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.topButton,
            workoutView === "custom" && styles.activeTopButton,
          ]}
          onPress={() => setWorkoutView("custom")}
        >
          <Text
            style={[
              styles.topButtonText,
              workoutView === "custom" && styles.activeTopButtonText,
            ]}
          >
            Custom Workouts
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollContainer}>
        <Text style={styles.sectionTitle}>
          {workoutView === "premade" ? "Pre-Made Templates" : "Your Templates"}
        </Text>

        {workoutView === "custom" && (
          <TouchableOpacity
            style={{
              padding: 15,
              backgroundColor: "#AF125A",
              borderRadius: 50,
            }}
            onPress={() => navigation.navigate("CreateWorkoutTemplate")}
          >
            <Text style={{ color: "white", fontWeight: "bold" }}>+</Text>
          </TouchableOpacity>
        )}

        {loading ? (
          <Text style={styles.loadingText}>Loading...</Text>
        ) : templates.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>
              {workoutView === "premade"
                ? "No pre-made templates available"
                : "No custom templates yet"}
            </Text>
          </View>
        ) : (
          templates.map((template) => (
            <SimpleTemplateCard key={template.id} template={template} />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },
  topButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    gap: 10,
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  topButton: {
    backgroundColor: "#252323",
    height: 50,
    width: 190,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 15,
  },
  activeTopButton: {
    backgroundColor: "#AF125A",
  },
  topButtonText: {
    fontFamily: "Arial",
    fontWeight: "600",
    fontSize: 18,
    color: "#AF125A",
  },
  activeTopButtonText: {
    color: "white",
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#f5f1ed",
    marginBottom: 20,
  },
  templateCard: {
    backgroundColor: "#252323",
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
  },
  templateTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#f5f1ed",
    marginBottom: 5,
  },
  templateDescription: {
    fontSize: 16,
    color: "#ccc",
    marginBottom: 10,
  },
  templateCategory: {
    fontSize: 12,
    color: "#AF125A",
    fontWeight: "600",
    textTransform: "uppercase",
  },
  loadingText: {
    color: "#ccc",
    textAlign: "center",
    marginTop: 50,
  },
  emptyState: {
    alignItems: "center",
    marginTop: 50,
  },
  emptyText: {
    color: "#ccc",
    fontSize: 16,
  },
});

export default WorkoutHub;
