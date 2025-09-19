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

const CreateTemplateScreen = ({ navigation }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [loading, setLoading] = useState(false);
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
  }, []);

  const validateForm = () => {
    const newErrors = {};

    if (!name.trim()) {
      newErrors.name = "Template name is required";
    } else if (name.trim().length < 3) {
      newErrors.name = "Template name must be at least 3 characters";
    }

    if (!description.trim()) {
      newErrors.description = "Description is required";
    } else if (description.trim().length < 10) {
      newErrors.description = "Description should be at least 10 characters";
    }

    if (!selectedCategory) {
      newErrors.category = "Please select a category";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCategorySelect = (category) => {
    if (category.premium) {
      Alert.alert(
        "Premium Feature",
        "Custom categories are available with Premium. Upgrade to unlock unlimited custom tags and colors for your workouts!",
        [
          { text: "Maybe Later", style: "cancel" },
          {
            text: "Upgrade to Premium",
            onPress: () => {
              // Navigate to premium upgrade screen, im gonna add this later
              console.log("Navigate to premium upgrade");
            },
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
        created_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from("workout_templates")
        .insert([templateData])
        .select()
        .single();

      if (error) {
        console.error("Error creating template:", error);
        Alert.alert("Error", "Could not create template. Please try again.");
        return;
      }

      Alert.alert(
        "Success! 🎉",
        "Your workout template has been created successfully!",
        [
          {
            text: "Create Another",
            onPress: () => {
              setName("");
              setDescription("");
              setSelectedCategory(null);
              setErrors({});
            },
          },
          {
            text: "Done",
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      console.error("Unexpected error:", error);
      Alert.alert("Error", "An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

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
                  <View style={styles.premiumBadge}>
                    <MaterialIcons name="star" size={16} color="#FFD700" />
                  </View>
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
                <Text style={styles.characterCount}>{name.length}/50</Text>
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
                    placeholder="Describe your workout routine..."
                    placeholderTextColor="#666"
                    value={description}
                    onChangeText={(text) => {
                      setDescription(text);
                      if (errors.description) {
                        setErrors((prev) => ({ ...prev, description: null }));
                      }
                    }}
                    multiline
                    numberOfLines={4}
                    maxLength={200}
                    textAlignVertical="top"
                  />
                </View>
                {errors.description && (
                  <Text style={styles.errorText}>{errors.description}</Text>
                )}
                <Text style={styles.characterCount}>
                  {description.length}/200
                </Text>
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

              {name && description && selectedCategory && (
                <View style={styles.previewSection}>
                  <Text style={styles.previewTitle}>Preview</Text>
                  <View style={styles.previewCard}>
                    <LinearGradient
                      colors={[
                        `${selectedCategory.color}15`,
                        `${selectedCategory.color}08`,
                      ]}
                      style={styles.previewGradient}
                    >
                      <View style={styles.previewHeader}>
                        <View
                          style={[
                            styles.previewIcon,
                            { backgroundColor: `${selectedCategory.color}20` },
                          ]}
                        >
                          <MaterialIcons
                            name={selectedCategory.icon}
                            size={20}
                            color={selectedCategory.color}
                          />
                        </View>
                        <View style={styles.previewText}>
                          <Text style={styles.previewName}>{name}</Text>
                          <Text style={styles.previewCategory}>
                            {selectedCategory.name}
                          </Text>
                        </View>
                      </View>
                      <Text style={styles.previewDescription} numberOfLines={2}>
                        {description}
                      </Text>
                    </LinearGradient>
                  </View>
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
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  formSection: {
    gap: 24,
  },
  inputGroup: {
    gap: 8,
  },
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
  multilineIcon: {
    marginTop: 2,
  },
  input: {
    flex: 1,
    color: "#f5f1ed",
    fontSize: 16,
    padding: 0,
  },
  multilineInput: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  inputError: {
    borderColor: "#FF6B6B",
  },
  errorText: {
    color: "#FF6B6B",
    fontSize: 12,
    marginTop: 4,
  },
  characterCount: {
    color: "#666",
    fontSize: 12,
    textAlign: "right",
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
  previewSection: {
    marginTop: 8,
  },
  previewTitle: {
    color: "#f5f1ed",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  previewCard: {
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  previewGradient: {
    padding: 16,
  },
  previewHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 12,
  },
  previewIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  previewText: {
    flex: 1,
  },
  previewName: {
    color: "#f5f1ed",
    fontSize: 18,
    fontWeight: "bold",
  },
  previewCategory: {
    color: "#999",
    fontSize: 12,
    textTransform: "capitalize",
  },
  previewDescription: {
    color: "#ccc",
    fontSize: 14,
    lineHeight: 20,
  },
  buttonSection: {
    flexDirection: "row",
    gap: 16,
    marginTop: 40,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
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

  // Modal
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
  premiumBadge: {
    marginRight: 8,
  },
});

export default CreateTemplateScreen;
