import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Animated,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { supabase } from "../../lib/supabase";
import { useWorkout } from "../../context/WorkoutContext";

const { width } = Dimensions.get("window");

const WorkoutHub = ({ navigation }) => {
  const [workoutView, setWorkoutView] = useState("custom");
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const { setActiveWorkoutId } = useWorkout();

  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(30))[0];

  // runs in the beginning, loads templates
  useEffect(() => {
    loadTemplates();

    // Start animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const loadTemplates = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("workout_templates")
        .select("*")
        .eq("is_public", workoutView === "premade")
        .order("created_at", { ascending: false });

      if (!error) {
        setTemplates(data || []);
      }
    } catch (error) {
      console.error("Error loading templates:", error);
    } finally {
      setLoading(false);
    }
  };

  // When view changes, reload templates
  useEffect(() => {
    loadTemplates();
  }, [workoutView]);

  const viewTemplate = (template) => {
    navigation.navigate("WorkoutTemplateDetail", { templateId: template.id });
  };

  const getTemplateIcon = (category) => {
    const icons = {
      strength: "fitness-center",
      cardio: "directions-run",
      flexibility: "self-improvement",
      powerlifting: "sports-gymnastics",
      bodybuilding: "sports-kabaddi",
      crossfit: "sports-mma",
    };
    return icons[category?.toLowerCase()] || "fitness-center";
  };

  const getTemplateColor = (category) => {
    const colors = {
      strength: "#AF125A",
      cardio: "#4ECDC4",
      flexibility: "#FFE66D",
      powerlifting: "#FF6B6B",
      bodybuilding: "#9B59B6",
      crossfit: "#E67E22",
    };
    return colors[category?.toLowerCase()] || "#AF125A";
  };

  const EnhancedTemplateCard = ({ template, index }) => {
    const [scaleAnim] = useState(new Animated.Value(1));
    const templateColor = getTemplateColor(template.category);

    const handlePressIn = () => {
      Animated.spring(scaleAnim, {
        toValue: 0.98,
        useNativeDriver: true,
      }).start();
    };

    const handlePressOut = () => {
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    };

    return (
      <Animated.View
        style={[
          {
            opacity: fadeAnim,
            transform: [
              { scale: scaleAnim },
              {
                translateY: fadeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [50, 0],
                }),
              },
            ],
          },
        ]}
      >
        <TouchableOpacity
          style={styles.enhancedTemplateCard}
          onPress={() => viewTemplate(template)}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={[
              `${templateColor}15`,
              `${templateColor}08`,
              "rgba(26, 26, 26, 0.8)",
            ]}
            style={styles.cardGradient}
          >
            <View style={styles.cardHeader}>
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: `${templateColor}20` },
                ]}
              >
                <MaterialIcons
                  name={getTemplateIcon(template.category)}
                  size={24}
                  color={templateColor}
                />
              </View>
              <View style={styles.headerText}>
                <Text style={styles.templateTitle}>{template.name}</Text>
                <View style={styles.categoryContainer}>
                  <View
                    style={[
                      styles.categoryBadge,
                      { backgroundColor: templateColor },
                    ]}
                  >
                    <Text style={styles.categoryText}>
                      {template.category || "General"}
                    </Text>
                  </View>
                </View>
              </View>
              <MaterialIcons name="chevron-right" size={20} color="#666" />
            </View>

            {template.description && (
              <Text style={styles.templateDescription} numberOfLines={2}>
                {template.description}
              </Text>
            )}

            <View style={styles.cardFooter}>
              <View style={styles.metadataRow}>
                <View style={styles.metadataItem}>
                  <MaterialIcons name="schedule" size={14} color="#888" />
                  <Text style={styles.metadataText}>
                    {new Date(template.created_at).toLocaleDateString()}
                  </Text>
                </View>
                {template.exercises_count && (
                  <View style={styles.metadataItem}>
                    <MaterialIcons
                      name="format-list-numbered"
                      size={14}
                      color="#888"
                    />
                    <Text style={styles.metadataText}>
                      {template.exercises_count} exercises
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const TabButton = ({ title, isActive, onPress, icon }) => {
    const [scaleAnim] = useState(new Animated.Value(1));

    const handlePressIn = () => {
      Animated.spring(scaleAnim, {
        toValue: 0.96,
        useNativeDriver: true,
      }).start();
    };

    const handlePressOut = () => {
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    };

    return (
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <TouchableOpacity
          style={[styles.tabButton, isActive && styles.activeTabButton]}
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={0.8}
        >
          {isActive ? (
            <LinearGradient
              colors={["#AF125A", "#D91A72"]}
              style={styles.tabGradient}
            >
              <MaterialIcons name={icon} size={20} color="white" />
              <Text style={[styles.tabButtonText, styles.activeTabButtonText]}>
                {title}
              </Text>
            </LinearGradient>
          ) : (
            <View style={styles.inactiveTab}>
              <MaterialIcons name={icon} size={20} color="#AF125A" />
              <Text style={styles.tabButtonText}>{title}</Text>
            </View>
          )}
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const EmptyState = ({ type }) => (
    <Animated.View
      style={[
        styles.emptyStateContainer,
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
      ]}
    >
      <LinearGradient
        colors={["rgba(175, 18, 90, 0.1)", "rgba(175, 18, 90, 0.05)"]}
        style={styles.emptyStateGradient}
      >
        <MaterialIcons
          name={type === "premade" ? "fitness-center" : "add-circle-outline"}
          size={64}
          color="rgba(175, 18, 90, 0.5)"
        />
        <Text style={styles.emptyStateTitle}>
          {type === "premade"
            ? "No Pre-Made Templates"
            : "No Custom Templates Yet"}
        </Text>
        <Text style={styles.emptyStateDescription}>
          {type === "premade"
            ? "Check back later for new workout templates"
            : "Create your first custom workout template to get started"}
        </Text>
        {type === "custom" && (
          <TouchableOpacity
            style={styles.emptyStateButton}
            onPress={() => navigation.navigate("CreateWorkoutTemplate")}
          >
            <MaterialIcons name="add" size={20} color="white" />
            <Text style={styles.emptyStateButtonText}>Create Template</Text>
          </TouchableOpacity>
        )}
      </LinearGradient>
    </Animated.View>
  );

  const FloatingActionButton = () => (
    <Animated.View
      style={[
        styles.fabContainer,
        {
          opacity: fadeAnim,
          transform: [{ scale: fadeAnim }],
        },
      ]}
    >
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate("CreateWorkoutTemplate")}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={["#AF125A", "#D91A72"]}
          style={styles.fabGradient}
        >
          <MaterialIcons name="add" size={28} color="white" />
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <LinearGradient
      colors={["#0D0D0D", "#1A1A1A", "#0D0D0D"]}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <Animated.View
          style={[
            styles.header,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <MaterialIcons name="arrow-back" size={24} color="#f5f1ed" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Workout Templates</Text>
          <View style={styles.headerSpacer} />
        </Animated.View>

        <Animated.View
          style={[
            styles.tabContainer,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <TabButton
            title="Legacy Workouts"
            isActive={workoutView === "premade"}
            onPress={() => setWorkoutView("premade")}
            icon="stars"
          />
          <TabButton
            title="Custom Workouts"
            isActive={workoutView === "custom"}
            onPress={() => setWorkoutView("custom")}
            icon="build"
          />
        </Animated.View>

        <ScrollView
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View
            style={[
              styles.sectionHeader,
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
            ]}
          >
            <Text style={styles.sectionTitle}>
              {workoutView === "premade"
                ? "Pre-Made Templates"
                : "Your Templates"}
            </Text>
            <Text style={styles.sectionSubtitle}>
              {workoutView === "premade"
                ? "Professional workout routines designed by experts"
                : "Your personalized workout templates"}
            </Text>
          </Animated.View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#AF125A" />
              <Text style={styles.loadingText}>Loading templates...</Text>
            </View>
          ) : templates.length === 0 ? (
            <EmptyState type={workoutView} />
          ) : (
            <View style={styles.templatesContainer}>
              {templates.map((template, index) => (
                <EnhancedTemplateCard
                  key={template.id}
                  template={template}
                  index={index}
                />
              ))}
            </View>
          )}
        </ScrollView>

        {workoutView === "custom" && <FloatingActionButton />}
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    flex: 1,
    fontSize: 24,
    fontWeight: "bold",
    color: "#f5f1ed",
    textAlign: "center",
  },
  headerSpacer: {
    width: 40,
  },

  tabContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 12,
  },
  tabButton: {
    flex: 1,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "rgba(175, 18, 90, 0.3)",
  },
  activeTabButton: {
    borderColor: "#AF125A",
  },
  tabGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    gap: 8,
  },
  inactiveTab: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    backgroundColor: "rgba(26, 26, 26, 0.8)",
    gap: 8,
  },
  tabButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#AF125A",
  },
  activeTabButtonText: {
    color: "white",
  },

  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  sectionHeader: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#f5f1ed",
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 16,
    color: "#999",
    lineHeight: 22,
  },

  templatesContainer: {
    gap: 16,
  },
  enhancedTemplateCard: {
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  cardGradient: {
    padding: 20,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  headerText: {
    flex: 1,
  },
  templateTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#f5f1ed",
    marginBottom: 4,
  },
  categoryContainer: {
    flexDirection: "row",
  },
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: "600",
    color: "white",
    textTransform: "capitalize",
  },
  templateDescription: {
    fontSize: 16,
    color: "#ccc",
    lineHeight: 22,
    marginBottom: 16,
  },
  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.1)",
    paddingTop: 16,
  },
  metadataRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  metadataItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  metadataText: {
    fontSize: 12,
    color: "#888",
  },

  loadingContainer: {
    alignItems: "center",
    paddingVertical: 60,
    gap: 16,
  },
  loadingText: {
    color: "#ccc",
    fontSize: 16,
    fontWeight: "500",
  },

  emptyStateContainer: {
    marginTop: 40,
  },
  emptyStateGradient: {
    alignItems: "center",
    padding: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(175, 18, 90, 0.3)",
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#f5f1ed",
    marginTop: 20,
    marginBottom: 8,
  },
  emptyStateDescription: {
    fontSize: 16,
    color: "#999",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24,
  },
  emptyStateButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#AF125A",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 16,
    gap: 8,
  },
  emptyStateButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },

  fabContainer: {
    position: "absolute",
    bottom: 24,
    right: 24,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    elevation: 8,
    shadowColor: "#AF125A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  fabGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default WorkoutHub;
