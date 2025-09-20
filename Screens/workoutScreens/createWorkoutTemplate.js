import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  SafeAreaView,
  Modal,
  Animated,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { supabase } from "../../lib/supabase";

const WORKOUT_CATEGORIES = [
  {
    id: "strength",
    name: "Strength Training",
    icon: "fitness-center",
    color: "#AF125A",
  },
  { id: "cardio", name: "Cardio", icon: "directions-run", color: "#4ECDC4" },
  {
    id: "powerlifting",
    name: "Powerlifting",
    icon: "sports-gymnastics",
    color: "#FF6B6B",
  },
  {
    id: "bodybuilding",
    name: "Bodybuilding",
    icon: "sports-kabaddi",
    color: "#9B59B6",
  },
  { id: "crossfit", name: "CrossFit", icon: "sports-mma", color: "#E67E22" },
  {
    id: "flexibility",
    name: "Flexibility & Mobility",
    icon: "self-improvement",
    color: "#FFE66D",
  },
  { id: "hiit", name: "HIIT", icon: "flash-on", color: "#FF9800" },
  {
    id: "functional",
    name: "Functional Training",
    icon: "accessibility-new",
    color: "#795548",
  },
  {
    id: "other",
    name: "Other (Premium)",
    icon: "star",
    color: "#FFD700",
    premium: true,
  },
];

const CreateTemplateWithExercises = ({ navigation }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [templateExercises, setTemplateExercises] = useState([]);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showExerciseModal, setShowExerciseModal] = useState(false);
  const [availableExercises, setAvailableExercises] = useState([]);
  const [loading, setLoading] = useState(false);
  const [exerciseLoading, setExerciseLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [errors, setErrors] = useState({});
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(30))[0];

  React.useEffect(() => {
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

    loadExercises();
  }, []);

  const loadExercises = async () => {
    setExerciseLoading(true);
    try {
      const { data, error } = await supabase
        .from("exercises")
        .select("*")
        .order("name");

      if (error) throw error;
      setAvailableExercises(data || []);
    } catch (error) {
      console.error("Error loading exercises:", error);
      Alert.alert("Error", "Failed to load exercises");
    } finally {
      setExerciseLoading(false);
    }
  };

  const filteredExercises = availableExercises.filter(
    (exercise) =>
      exercise.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (exercise.category &&
        exercise.category.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const addExercise = (exercise) => {
    const existingExercise = templateExercises.find(
      (te) => te.exercise.id === exercise.id
    );
    if (existingExercise) {
      Alert.alert(
        "Exercise Already Added",
        "This exercise is already in your template."
      );
      return;
    }

    const newTemplateExercise = {
      id: `temp_${Date.now()}`,
      exercise,
      order_index: templateExercises.length,
      target_sets: 3,
      target_reps: 10,
      notes: "",
    };

    setTemplateExercises([...templateExercises, newTemplateExercise]);
    setShowExerciseModal(false);
    setSearchQuery("");
  };

  const removeExercise = (exerciseIndex) => {
    const updatedExercises = templateExercises.filter(
      (_, index) => index !== exerciseIndex
    );
    const reorderedExercises = updatedExercises.map((exercise, index) => ({
      ...exercise,
      order_index: index,
    }));
    setTemplateExercises(reorderedExercises);
  };

  const updateExercise = (index, field, value) => {
    const updatedExercises = [...templateExercises];
    updatedExercises[index] = {
      ...updatedExercises[index],
      [field]: value,
    };
    setTemplateExercises(updatedExercises);
  };

  const moveExercise = (fromIndex, toIndex) => {
    const updatedExercises = [...templateExercises];
    const [movedExercise] = updatedExercises.splice(fromIndex, 1);
    updatedExercises.splice(toIndex, 0, movedExercise);

    const reorderedExercises = updatedExercises.map((exercise, index) => ({
      ...exercise,
      order_index: index,
    }));
    setTemplateExercises(reorderedExercises);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!name.trim()) {
      newErrors.name = "Template name is required";
    }

    if (!description.trim()) {
      newErrors.description = "Description is required";
    }

    if (!selectedCategory) {
      newErrors.category = "Please select a category";
    }

    if (templateExercises.length === 0) {
      newErrors.exercises = "Add at least one exercise";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const { data: userData, error: userError } =
        await supabase.auth.getUser();
      if (userError || !userData?.user) {
        Alert.alert(
          "Authentication Error",
          "You must be logged in to create templates."
        );
        return;
      }

      const templateData = {
        created_by: userData.user.id,
        name: name.trim(),
        description: description.trim(),
        category: selectedCategory.id,
        is_public: false,
      };

      const { data: template, error: templateError } = await supabase
        .from("workout_templates")
        .insert([templateData])
        .select()
        .single();

      if (templateError) throw templateError;

      const exerciseData = templateExercises.map((te) => ({
        template_id: template.id,
        exercise_id: te.exercise.id,
        order_index: te.order_index,
        target_sets: parseInt(te.target_sets) || 3,
        target_reps: parseInt(te.target_reps) || 10,
        notes: te.notes || null,
      }));

      const { error: exerciseError } = await supabase
        .from("template_exercises")
        .insert(exerciseData);

      if (exerciseError) throw exerciseError;

      Alert.alert(
        "Success! 🎉",
        `Template "${name}" created with ${templateExercises.length} exercises!`,
        [
          {
            text: "View Template",
            onPress: () =>
              navigation.navigate("WorkoutTemplateDetail", {
                templateId: template.id,
              }),
          },
          {
            text: "Done",
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      console.error("Error creating template:", error);
      Alert.alert("Error", "Failed to create template. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCategorySelect = (category) => {
    if (category.premium) {
      Alert.alert(
        "Premium Feature",
        "Custom categories are available with Premium. Upgrade to unlock unlimited custom tags and colors!",
        [
          { text: "Maybe Later", style: "cancel" },
          {
            text: "Upgrade to Premium",
            onPress: () => console.log("Navigate to premium"),
          },
        ]
      );
      return;
    }

    setSelectedCategory(category);
    setShowCategoryModal(false);
    if (errors.category) {
      setErrors((prev) => ({ ...prev, category: null }));
    }
  };

  const ExerciseCard = ({ exercise, index }) => (
    <View style={styles.exerciseCard}>
      <View style={styles.exerciseHeader}>
        <View style={styles.exerciseInfo}>
          <Text style={styles.exerciseName}>{exercise.exercise.name}</Text>
          <Text style={styles.exerciseCategory}>
            {exercise.exercise.category}
          </Text>
        </View>
        <View style={styles.exerciseActions}>
          <TouchableOpacity
            onPress={() => removeExercise(index)}
            style={styles.removeButton}
          >
            <MaterialIcons name="close" size={20} color="#FF6B6B" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.exerciseTargets}>
        <View style={styles.targetInput}>
          <Text style={styles.targetLabel}>Sets</Text>
          <TextInput
            style={styles.targetValue}
            value={exercise.target_sets.toString()}
            onChangeText={(text) => updateExercise(index, "target_sets", text)}
            keyboardType="numeric"
            maxLength={2}
          />
        </View>
        <View style={styles.targetInput}>
          <Text style={styles.targetLabel}>Reps</Text>
          <TextInput
            style={styles.targetValue}
            value={exercise.target_reps.toString()}
            onChangeText={(text) => updateExercise(index, "target_reps", text)}
            keyboardType="numeric"
            maxLength={3}
          />
        </View>
      </View>

      <TextInput
        style={styles.exerciseNotes}
        placeholder="Exercise notes (optional)"
        placeholderTextColor="#666"
        value={exercise.notes}
        onChangeText={(text) => updateExercise(index, "notes", text)}
        multiline
      />
    </View>
  );

  const ExerciseSelectionModal = () => (
    <Modal
      visible={showExerciseModal}
      transparent
      animationType="slide"
      onRequestClose={() => setShowExerciseModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.exerciseModalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add Exercise</Text>
            <TouchableOpacity
              onPress={() => setShowExerciseModal(false)}
              style={styles.modalCloseButton}
            >
              <MaterialIcons name="close" size={24} color="#f5f1ed" />
            </TouchableOpacity>
          </View>

          <View style={styles.searchContainer}>
            <MaterialIcons name="search" size={20} color="#666" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search exercises..."
              placeholderTextColor="#666"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          {exerciseLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#AF125A" />
              <Text style={styles.loadingText}>Loading exercises...</Text>
            </View>
          ) : (
            <ScrollView style={styles.exercisesList}>
              {filteredExercises.map((exercise) => (
                <TouchableOpacity
                  key={exercise.id}
                  style={styles.exerciseOption}
                  onPress={() => addExercise(exercise)}
                >
                  <View style={styles.exerciseOptionContent}>
                    <View>
                      <Text style={styles.exerciseOptionName}>
                        {exercise.name}
                      </Text>
                      <Text style={styles.exerciseOptionCategory}>
                        {exercise.category}
                      </Text>
                      {exercise.equipment && (
                        <Text style={styles.exerciseOptionEquipment}>
                          Equipment: {exercise.equipment}
                        </Text>
                      )}
                    </View>
                    <MaterialIcons name="add" size={24} color="#AF125A" />
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );

  const CategoryModal = () => (
    <Modal
      visible={showCategoryModal}
      transparent
      animationType="fade"
      onRequestClose={() => setShowCategoryModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Category</Text>
            <TouchableOpacity
              onPress={() => setShowCategoryModal(false)}
              style={styles.modalCloseButton}
            >
              <MaterialIcons name="close" size={24} color="#f5f1ed" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.categoriesList}>
            {WORKOUT_CATEGORIES.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryOption,
                  category.premium && styles.premiumCategory,
                ]}
                onPress={() => handleCategorySelect(category)}
              >
                <View
                  style={[
                    styles.categoryIcon,
                    { backgroundColor: `${category.color}20` },
                  ]}
                >
                  <MaterialIcons
                    name={category.icon}
                    size={24}
                    color={category.color}
                  />
                </View>
                <Text style={styles.categoryName}>{category.name}</Text>
                {category.premium && (
                  <MaterialIcons name="star" size={16} color="#FFD700" />
                )}
                <MaterialIcons name="chevron-right" size={20} color="#666" />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
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
          <Text style={styles.headerTitle}>Create Template</Text>
          <View style={styles.headerSpacer} />
        </Animated.View>

        <ScrollView
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View
            style={[
              styles.content,
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
            ]}
          >
            <View style={styles.formSection}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Template Name *</Text>
                <View
                  style={[
                    styles.inputContainer,
                    errors.name && styles.inputError,
                  ]}
                >
                  <MaterialIcons
                    name="fitness-center"
                    size={20}
                    color="#AF125A"
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="e.g., Push Day Workout"
                    placeholderTextColor="#666"
                    value={name}
                    onChangeText={(text) => {
                      setName(text);
                      if (errors.name) {
                        setErrors((prev) => ({ ...prev, name: null }));
                      }
                    }}
                    maxLength={50}
                  />
                </View>
                {errors.name && (
                  <Text style={styles.errorText}>{errors.name}</Text>
                )}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Description *</Text>
                <View
                  style={[
                    styles.inputContainer,
                    styles.multilineContainer,
                    errors.description && styles.inputError,
                  ]}
                >
                  <MaterialIcons
                    name="description"
                    size={20}
                    color="#AF125A"
                    style={styles.multilineIcon}
                  />
                  <TextInput
                    style={[styles.input, styles.multilineInput]}
                    placeholder="Describe your workout..."
                    placeholderTextColor="#666"
                    value={description}
                    onChangeText={(text) => {
                      setDescription(text);
                      if (errors.description) {
                        setErrors((prev) => ({ ...prev, description: null }));
                      }
                    }}
                    multiline
                    numberOfLines={3}
                    maxLength={200}
                    textAlignVertical="top"
                  />
                </View>
                {errors.description && (
                  <Text style={styles.errorText}>{errors.description}</Text>
                )}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Category *</Text>
                <TouchableOpacity
                  style={[
                    styles.categorySelector,
                    errors.category && styles.inputError,
                  ]}
                  onPress={() => setShowCategoryModal(true)}
                >
                  {selectedCategory ? (
                    <View style={styles.selectedCategory}>
                      <View
                        style={[
                          styles.categoryIcon,
                          { backgroundColor: `${selectedCategory.color}20` },
                        ]}
                      >
                        <MaterialIcons
                          name={selectedCategory.icon}
                          size={20}
                          color={selectedCategory.color}
                        />
                      </View>
                      <Text style={styles.selectedCategoryText}>
                        {selectedCategory.name}
                      </Text>
                    </View>
                  ) : (
                    <View style={styles.placeholderCategory}>
                      <MaterialIcons name="category" size={20} color="#666" />
                      <Text style={styles.placeholderText}>
                        Select a category
                      </Text>
                    </View>
                  )}
                  <MaterialIcons
                    name="keyboard-arrow-down"
                    size={24}
                    color="#666"
                  />
                </TouchableOpacity>
                {errors.category && (
                  <Text style={styles.errorText}>{errors.category}</Text>
                )}
              </View>
            </View>

            <View style={styles.exercisesSection}>
              <View style={styles.exercisesHeader}>
                <Text style={styles.sectionTitle}>
                  Exercises ({templateExercises.length})
                </Text>
                <TouchableOpacity
                  style={styles.addExerciseButton}
                  onPress={() => setShowExerciseModal(true)}
                >
                  <MaterialIcons name="add" size={20} color="white" />
                  <Text style={styles.addExerciseButtonText}>Add Exercise</Text>
                </TouchableOpacity>
              </View>
              {errors.exercises && (
                <Text style={styles.errorText}>{errors.exercises}</Text>
              )}

              {templateExercises.length === 0 ? (
                <View style={styles.emptyExercises}>
                  <MaterialIcons name="fitness-center" size={48} color="#666" />
                  <Text style={styles.emptyExercisesText}>
                    No exercises added yet
                  </Text>
                  <Text style={styles.emptyExercisesSubtext}>
                    Tap "Add Exercise" to get started
                  </Text>
                </View>
              ) : (
                <View style={styles.exercisesList}>
                  {templateExercises.map((exercise, index) => (
                    <ExerciseCard
                      key={exercise.id}
                      exercise={exercise}
                      index={index}
                    />
                  ))}
                </View>
              )}
            </View>

            <View style={styles.buttonSection}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => navigation.goBack()}
                disabled={loading}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.saveButton,
                  loading && styles.saveButtonDisabled,
                ]}
                onPress={handleSave}
                disabled={loading}
              >
                {loading ? (
                  <View style={styles.loadingContent}>
                    <ActivityIndicator size="small" color="white" />
                    <Text style={styles.saveButtonText}>Creating...</Text>
                  </View>
                ) : (
                  <View style={styles.saveContent}>
                    <MaterialIcons name="save" size={20} color="white" />
                    <Text style={styles.saveButtonText}>Create Template</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </Animated.View>
        </ScrollView>

        <CategoryModal />
        <ExerciseSelectionModal />
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
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
  headerSpacer: { width: 40 },
  scrollContainer: { flex: 1 },
  scrollContent: { paddingBottom: 40 },
  content: { paddingHorizontal: 20, paddingTop: 20 },

  formSection: { gap: 24, marginBottom: 32 },
  inputGroup: { gap: 8 },
  label: {
    color: "#f5f1ed",
    fontSize: 16,
    fontWeight: "600",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 2,
    borderColor: "rgba(175, 18, 90, 0.3)",
    gap: 12,
  },
  multilineContainer: {
    alignItems: "flex-start",
    paddingVertical: 16,
  },
  multilineIcon: { marginTop: 2 },
  input: {
    flex: 1,
    color: "#f5f1ed",
    fontSize: 16,
    padding: 0,
  },
  multilineInput: {
    minHeight: 60,
    textAlignVertical: "top",
  },
  inputError: { borderColor: "#FF6B6B" },
  errorText: {
    color: "#FF6B6B",
    fontSize: 12,
    marginTop: 4,
  },

  categorySelector: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderWidth: 2,
    borderColor: "rgba(175, 18, 90, 0.3)",
  },
  selectedCategory: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 12,
  },
  placeholderCategory: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 12,
  },
  categoryIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  selectedCategoryText: {
    color: "#f5f1ed",
    fontSize: 16,
    fontWeight: "500",
  },
  placeholderText: {
    color: "#666",
    fontSize: 16,
  },

  exercisesSection: { marginBottom: 32 },
  exercisesHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    color: "#f5f1ed",
    fontSize: 20,
    fontWeight: "bold",
  },
  addExerciseButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#AF125A",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 6,
  },
  addExerciseButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },

  emptyExercises: {
    alignItems: "center",
    paddingVertical: 40,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 12,
    gap: 12,
  },
  emptyExercisesText: {
    color: "#f5f1ed",
    fontSize: 18,
    fontWeight: "600",
  },
  emptyExercisesSubtext: {
    color: "#666",
    fontSize: 14,
  },

  exercisesList: { gap: 16 },
  exerciseCard: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  exerciseHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  exerciseInfo: { flex: 1 },
  exerciseName: {
    color: "#f5f1ed",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  exerciseCategory: {
    color: "#666",
    fontSize: 12,
    textTransform: "capitalize",
  },
  exerciseActions: {
    flexDirection: "row",
    gap: 8,
  },
  removeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255, 107, 107, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },

  exerciseTargets: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 12,
  },
  targetInput: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
  },
  targetLabel: {
    color: "#666",
    fontSize: 12,
    marginBottom: 4,
  },
  targetValue: {
    color: "#f5f1ed",
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    minWidth: 40,
  },

  exerciseNotes: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 8,
    padding: 12,
    color: "#f5f1ed",
    fontSize: 14,
    minHeight: 40,
    textAlignVertical: "top",
  },

  buttonSection: {
    flexDirection: "row",
    gap: 16,
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#ccc",
    fontSize: 16,
    fontWeight: "600",
  },
  saveButton: {
    flex: 1,
    backgroundColor: "#AF125A",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  saveButtonDisabled: {
    backgroundColor: "rgba(175, 18, 90, 0.5)",
  },
  saveContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  loadingContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  saveButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#1A1A1A",
    borderRadius: 20,
    width: "90%",
    maxHeight: "70%",
    borderWidth: 1,
    borderColor: "rgba(175, 18, 90, 0.3)",
  },
  exerciseModalContent: {
    backgroundColor: "#1A1A1A",
    borderRadius: 20,
    width: "95%",
    maxHeight: "80%",
    borderWidth: 1,
    borderColor: "rgba(175, 18, 90, 0.3)",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  modalTitle: {
    color: "#f5f1ed",
    fontSize: 20,
    fontWeight: "bold",
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },

  categoriesList: {
    maxHeight: 400,
  },
  categoryOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 16,
  },
  premiumCategory: {
    opacity: 0.8,
  },
  categoryName: {
    flex: 1,
    color: "#f5f1ed",
    fontSize: 16,
    fontWeight: "500",
  },

  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    margin: 20,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    color: "#f5f1ed",
    fontSize: 16,
    padding: 0,
  },
  loadingContainer: {
    alignItems: "center",
    paddingVertical: 40,
    gap: 16,
  },
  loadingText: {
    color: "#ccc",
    fontSize: 16,
    fontWeight: "500",
  },
  exercisesList: {
    maxHeight: 500,
    paddingBottom: 20,
  },
  exerciseOption: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  exerciseOptionContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  exerciseOptionName: {
    color: "#f5f1ed",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  exerciseOptionCategory: {
    color: "#666",
    fontSize: 12,
    textTransform: "capitalize",
    marginBottom: 2,
  },
  exerciseOptionEquipment: {
    color: "#AF125A",
    fontSize: 12,
  },
});

export default CreateTemplateWithExercises;
