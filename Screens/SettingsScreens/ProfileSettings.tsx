import { useState, useEffect } from "react";
import {
  View,
  Alert,
  StyleSheet,
  SafeAreaView,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Animated,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { Input, Button } from "@rneui/themed";
import { supabase } from "../../lib/supabase";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import Avatar from "../../components/Avatar";

export default function ProfileSettings() {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [username, setUsername] = useState("");
  const [goal, setGoal] = useState("");
  const [fullName, setFullName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [email, setEmail] = useState("");

  // Validation states
  const [nameError, setNameError] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [goalError, setGoalError] = useState("");
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(
    null
  );

  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(30))[0];

  useEffect(() => {
    fetchProfile();
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

  //
  //
  //

  async function fetchProfile() {
    setLoading(true);
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        Alert.alert("Error", "Could not get user.");
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("username, goal, full_name, avatar_url")
        .eq("id", user.id)
        .single();

      if (error && error.code !== "PGRST116") {
        Alert.alert("Error loading profile", error.message);
      } else if (data) {
        setUsername(data.username || "");
        setGoal(data.goal || "");
        setFullName(data.full_name || "");
        setAvatarUrl(data.avatar_url || "");
      }
      setEmail(user.email || "");
    } catch (error) {
      Alert.alert("Error", "Failed to load profile data.");
    } finally {
      setLoading(false);
    }
  }

  const validateName = (name: string) => {
    if (!name.trim()) {
      setNameError("Full name is required");
      return false;
    }
    if (name.trim().length < 2) {
      setNameError("Name must be at least 2 characters");
      return false;
    }
    setNameError("");
    return true;
  };

  const validateUsername = async (username: string) => {
    if (!username.trim()) {
      setUsernameError("Username is required");
      setUsernameAvailable(null);
      return false;
    }

    if (username.length < 3) {
      setUsernameError("Username must be at least 3 characters");
      setUsernameAvailable(null);
      return false;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      setUsernameError(
        "Username can only contain letters, numbers, and underscores"
      );
      setUsernameAvailable(null);
      return false;
    }

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from("profiles")
        .select("username")
        .eq("username", username.toLowerCase())
        .neq("id", user?.id);

      if (error) throw error;

      if (data && data.length > 0) {
        setUsernameError("Username is already taken");
        setUsernameAvailable(false);
        return false;
      }

      setUsernameError("");
      setUsernameAvailable(true);
      return true;
    } catch (error) {
      setUsernameError("Could not check username availability");
      setUsernameAvailable(null);
      return false;
    }
  };

  const validateGoal = (goal: string) => {
    if (!goal.trim()) {
      setGoalError("Goal is required");
      return false;
    }
    if (goal.trim().length < 5) {
      setGoalError("Please provide a more detailed goal");
      return false;
    }
    setGoalError("");
    return true;
  };

  async function handleUpdateProfile() {
    const isNameValid = validateName(fullName);
    const isUsernameValid = await validateUsername(username);
    const isGoalValid = validateGoal(goal);

    if (!isNameValid || !isUsernameValid || !isGoalValid) {
      Alert.alert(
        "Validation Error",
        "Please fix the errors above before saving."
      );
      return;
    }

    setSaving(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const updates = {
        id: user.id,
        username: username.toLowerCase(),
        goal,
        full_name: fullName,
        avatar_url: avatarUrl,
        updated_at: new Date(),
      };

      const { error } = await supabase.from("profiles").upsert(updates);

      if (error) {
        throw error;
      }

      Alert.alert(
        "Success! 🎉",
        "Your profile has been updated successfully.",
        [
          {
            text: "Done",
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      Alert.alert("Error updating profile", error.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <LinearGradient
        colors={["#1a1a1a", "#2d2d2d", "#1a1a1a"]}
        style={styles.container}
      >
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#AF125A" />
            <Text style={styles.loadingText}>Loading your profile...</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={["#1a1a1a", "#2d2d2d", "#1a1a1a"]}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardView}
        >
          <Animated.View
            style={[
              styles.content,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <View style={styles.header}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}
              >
                <MaterialIcons name="arrow-back" size={24} color="#f5f1ed" />
              </TouchableOpacity>
              <View style={styles.headerTextContainer}>
                <Text style={styles.headerText}>Profile Settings</Text>
                <Text style={styles.subHeaderText}>
                  Update your personal information
                </Text>
              </View>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
            >
              <Animated.View
                style={[styles.avatarSection, { opacity: fadeAnim }]}
              >
                <Text style={styles.sectionLabel}>Profile Photo</Text>
                <View style={styles.avatarContainer}>
                  <Avatar
                    size={120}
                    url={avatarUrl}
                    onUpload={(url: string) => {
                      setAvatarUrl(url);
                    }}
                  />
                  <Text style={styles.avatarHint}>
                    Tap to change your photo
                  </Text>
                </View>
              </Animated.View>

              <Animated.View
                style={[styles.formSection, { opacity: fadeAnim }]}
              >
                <View style={styles.inputContainer}>
                  <Input
                    label="Email Address"
                    value={email}
                    disabled
                    leftIcon={{
                      type: "font-awesome",
                      name: "envelope-o",
                      color: "rgba(175, 18, 90, 0.5)",
                      size: 20,
                    }}
                    inputContainerStyle={styles.disabledInput}
                    labelStyle={styles.labelStyle}
                    inputStyle={styles.disabledText}
                  />
                  <Text style={styles.fieldHint}>Email cannot be changed</Text>
                </View>

                <View style={styles.inputContainer}>
                  <Input
                    label="Full Name"
                    value={fullName}
                    onChangeText={(text) => {
                      setFullName(text);
                      if (nameError) validateName(text);
                    }}
                    onBlur={() => validateName(fullName)}
                    placeholder="Enter your full name"
                    leftIcon={{
                      type: "font-awesome",
                      name: "user-o",
                      color: "#AF125A",
                      size: 20,
                    }}
                    inputContainerStyle={[
                      styles.inputContainerStyle,
                      nameError ? styles.inputError : null,
                    ]}
                    labelStyle={styles.labelStyle}
                    inputStyle={styles.inputText}
                    placeholderTextColor="rgba(245, 241, 237, 0.5)"
                    errorMessage={nameError}
                    errorStyle={styles.errorText}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Input
                    label="Username"
                    value={username}
                    onChangeText={(text) => {
                      setUsername(text.toLowerCase());
                      setUsernameAvailable(null);
                      if (usernameError) {
                        setTimeout(() => validateUsername(text), 500);
                      }
                    }}
                    onBlur={() => validateUsername(username)}
                    placeholder="Choose a unique username"
                    autoCapitalize="none"
                    leftIcon={{
                      type: "font-awesome",
                      name: "at",
                      color: "#AF125A",
                      size: 20,
                    }}
                    rightIcon={
                      usernameAvailable === true
                        ? {
                            type: "font-awesome",
                            name: "check",
                            color: "#4ECDC4",
                          }
                        : usernameAvailable === false
                        ? {
                            type: "font-awesome",
                            name: "times",
                            color: "#FF6B6B",
                          }
                        : undefined
                    }
                    inputContainerStyle={[
                      styles.inputContainerStyle,
                      usernameError
                        ? styles.inputError
                        : usernameAvailable === true
                        ? styles.inputSuccess
                        : null,
                    ]}
                    labelStyle={styles.labelStyle}
                    inputStyle={styles.inputText}
                    placeholderTextColor="rgba(245, 241, 237, 0.5)"
                    errorMessage={usernameError}
                    errorStyle={styles.errorText}
                  />
                  {usernameAvailable === true && (
                    <Text style={styles.successText}>
                      Username is available! ✓
                    </Text>
                  )}
                </View>

                <View style={styles.inputContainer}>
                  <Input
                    label="Fitness Goal"
                    value={goal}
                    onChangeText={(text) => {
                      setGoal(text);
                      if (goalError) validateGoal(text);
                    }}
                    onBlur={() => validateGoal(goal)}
                    placeholder="e.g., Lose 10 pounds, Build muscle, Run a marathon..."
                    multiline
                    numberOfLines={3}
                    leftIcon={{
                      type: "font-awesome",
                      name: "trophy",
                      color: "#AF125A",
                      size: 20,
                    }}
                    inputContainerStyle={[
                      styles.inputContainerStyle,
                      styles.multilineInput,
                      goalError ? styles.inputError : null,
                    ]}
                    labelStyle={styles.labelStyle}
                    inputStyle={[styles.inputText, styles.multilineText]}
                    placeholderTextColor="rgba(245, 241, 237, 0.5)"
                    errorMessage={goalError}
                    errorStyle={styles.errorText}
                  />
                  <Text style={styles.fieldHint}>
                    Be specific about what you want to achieve
                  </Text>
                </View>
              </Animated.View>

              <Animated.View
                style={[styles.buttonSection, { opacity: fadeAnim }]}
              >
                <Button
                  title={
                    saving ? (
                      <View style={styles.loadingButtonContent}>
                        <ActivityIndicator
                          color="white"
                          size="small"
                          style={{ marginRight: 10 }}
                        />
                        <Text style={styles.loadingButtonText}>
                          Updating Profile...
                        </Text>
                      </View>
                    ) : (
                      "Save Changes"
                    )
                  }
                  onPress={handleUpdateProfile}
                  disabled={
                    saving || !!nameError || !!usernameError || !!goalError
                  }
                  buttonStyle={[
                    styles.primaryButton,
                    (saving || !!nameError || !!usernameError || !!goalError) &&
                      styles.disabledButton,
                  ]}
                  titleStyle={styles.primaryButtonText}
                />

                <Button
                  title="Cancel"
                  onPress={() => navigation.goBack()}
                  disabled={saving}
                  buttonStyle={styles.secondaryButton}
                  titleStyle={styles.secondaryButtonText}
                />
              </Animated.View>
            </ScrollView>
          </Animated.View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  safeArea: {
    flex: 1,
    backgroundColor: "#000",
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 20,
  },
  loadingText: {
    color: "#f5f1ed",
    fontSize: 18,
    fontWeight: "600",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#f5f1ed",
    marginBottom: 2,
  },
  subHeaderText: {
    fontSize: 14,
    color: "rgba(245, 241, 237, 0.7)",
  },
  scrollContent: {
    paddingBottom: 40,
  },
  avatarSection: {
    paddingHorizontal: 20,
    alignItems: "center",
    marginBottom: 30,
  },
  sectionLabel: {
    color: "#f5f1ed",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 15,
    alignSelf: "flex-start",
  },
  avatarContainer: {
    alignItems: "center",
    gap: 10,
  },
  avatarHint: {
    color: "rgba(245, 241, 237, 0.5)",
    fontSize: 12,
    textAlign: "center",
  },
  formSection: {
    paddingHorizontal: 20,
  },
  inputContainer: {
    marginBottom: 15,
  },
  inputContainerStyle: {
    borderBottomWidth: 2,
    borderBottomColor: "rgba(175, 18, 90, 0.3)",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 5,
  },
  multilineInput: {
    minHeight: 80,
    alignItems: "flex-start",
    paddingVertical: 15,
  },
  inputError: {
    borderBottomColor: "#FF6B6B",
  },
  inputSuccess: {
    borderBottomColor: "#4ECDC4",
  },
  disabledInput: {
    borderBottomColor: "rgba(245, 241, 237, 0.2)",
    backgroundColor: "rgba(255, 255, 255, 0.02)",
  },
  labelStyle: {
    color: "#f5f1ed",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  inputText: {
    color: "#f5f1ed",
    fontSize: 16,
    paddingVertical: 8,
  },
  multilineText: {
    minHeight: 60,
    textAlignVertical: "top",
  },
  disabledText: {
    color: "rgba(245, 241, 237, 0.5)",
  },
  errorText: {
    color: "#FF6B6B",
    fontSize: 12,
    marginTop: 5,
  },
  successText: {
    color: "#4ECDC4",
    fontSize: 12,
    marginTop: 5,
    marginLeft: 5,
  },
  fieldHint: {
    color: "rgba(245, 241, 237, 0.5)",
    fontSize: 12,
    marginTop: 5,
    marginLeft: 5,
    fontStyle: "italic",
  },
  buttonSection: {
    paddingHorizontal: 20,
    marginTop: 30,
    gap: 15,
  },
  primaryButton: {
    backgroundColor: "#AF125A",
    paddingVertical: 16,
    borderRadius: 12,
    elevation: 3,
    shadowColor: "#AF125A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  disabledButton: {
    backgroundColor: "rgba(175, 18, 90, 0.4)",
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  secondaryButton: {
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: "rgba(245, 241, 237, 0.3)",
    paddingVertical: 14,
    borderRadius: 12,
  },
  secondaryButtonText: {
    color: "rgba(245, 241, 237, 0.8)",
    fontSize: 16,
    fontWeight: "600",
  },
  loadingButtonContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  loadingButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});
