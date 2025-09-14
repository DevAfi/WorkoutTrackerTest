import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import {
  StyleSheet,
  View,
  Alert,
  SafeAreaView,
  Text,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
  Animated,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { Button, Input } from "@rneui/themed";
import { Session } from "@supabase/supabase-js";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import Avatar from "./Avatar";

export async function getAllUsers() {
  const { data, error } = await supabase.from("profiles").select("*");
  if (error) throw error;
  return data;
}

export default function Account({ session }: { session: Session }) {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [username, setUsername] = useState("");
  const [goal, setGoal] = useState("");
  const [name, setName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  const [nameError, setNameError] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [goalError, setGoalError] = useState("");
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(
    null
  );

  // Animation
  const fadeAnim = useState(new Animated.Value(0))[0];
  const progressAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    if (session) getProfile();

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, [session]);

  useEffect(() => {
    const completedFields = [name, username, goal, avatarUrl].filter(
      (field) => field.length > 0
    ).length;
    const progress = completedFields / 4;

    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [name, username, goal, avatarUrl]);

  async function getProfile() {
    try {
      setLoading(true);
      if (!session?.user) throw new Error("No user on the session!");

      const { data, error, status } = await supabase
        .from("profiles")
        .select(`username, goal, avatar_url, full_name`)
        .eq("id", session?.user.id)
        .single();

      if (error && status !== 406) {
        throw error;
      }

      if (data) {
        setUsername(data.username || "");
        setGoal(data.goal || "");
        setAvatarUrl(data.avatar_url || "");
        setName(data.full_name || "");
      }

      if (data?.username && data?.full_name) {
        navigation.navigate("Tabs");
        return;
      }
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert("Error Loading Profile", error.message);
      }
    } finally {
      setLoading(false);
    }
  }

  const validateName = (name: string) => {
    if (!name.trim()) {
      setNameError("Name is required");
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
      const { data, error } = await supabase
        .from("profiles")
        .select("username")
        .eq("username", username.toLowerCase())
        .neq("id", session?.user?.id);

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

  async function updateProfile() {
    const isNameValid = validateName(name);
    const isUsernameValid = await validateUsername(username);
    const isGoalValid = validateGoal(goal);

    if (!isNameValid || !isUsernameValid || !isGoalValid) {
      Alert.alert(
        "Validation Error",
        "Please fix the errors above before continuing."
      );
      return;
    }

    try {
      setSaving(true);
      if (!session?.user) throw new Error("No user on the session!");

      const updates = {
        id: session?.user.id,
        username: username.toLowerCase(),
        goal,
        full_name: name,
        avatar_url: avatarUrl,
        updated_at: new Date(),
      };

      const { error } = await supabase.from("profiles").upsert(updates);

      if (error) {
        throw error;
      }

      Alert.alert(
        "Profile Created! 🎉",
        "Your profile has been set up successfully. Let's set your workout goals!",
        [
          {
            text: "Continue",
            onPress: () => navigation.navigate("OnboardingScreen"),
          },
        ]
      );
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert("Error Saving Profile", error.message);
      }
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={["#1a1a1a", "#2d2d2d", "#1a1a1a"]}
          style={styles.gradient}
        >
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#AF125A" />
            <Text style={styles.loadingText}>Loading your profile...</Text>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  const completedFields = [name, username, goal, avatarUrl].filter(
    (field) => field.length > 0
  ).length;
  const isFormComplete =
    completedFields === 4 && !nameError && !usernameError && !goalError;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <LinearGradient
        colors={["#1a1a1a", "#2d2d2d", "#1a1a1a"]}
        style={styles.gradient}
      >
        <TouchableWithoutFeedback>
          <SafeAreaView style={styles.safeArea}>
            <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
              <View style={styles.headerSection}>
                <Text style={styles.stepText}>Step 1 of 2</Text>
                <Text style={styles.headerText}>Create Your Profile</Text>
                <Text style={styles.subHeaderText}>
                  Tell us about yourself to personalize your fitness journey
                </Text>

                <View style={styles.progressContainer}>
                  <View style={styles.progressBar}>
                    <Animated.View
                      style={[
                        styles.progressFill,
                        {
                          width: progressAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: ["0%", "100%"],
                          }),
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.progressText}>
                    {completedFields}/4 completed
                  </Text>
                </View>
              </View>

              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
              >
                <View style={styles.emailSection}>
                  <Input
                    label="Email Address"
                    value={session?.user?.email}
                    disabled
                    leftIcon={{
                      type: "font-awesome",
                      name: "envelope-o",
                      color: "#AF125A",
                    }}
                    inputContainerStyle={styles.disabledInput}
                    labelStyle={styles.labelStyle}
                    inputStyle={styles.disabledText}
                  />
                </View>

                <View style={styles.avatarSection}>
                  <Text style={styles.sectionLabel}>Profile Photo</Text>
                  <View style={styles.avatarContainer}>
                    <Avatar
                      size={120}
                      url={avatarUrl}
                      onUpload={(url: string) => {
                        setAvatarUrl(url);
                      }}
                    />
                    <Text style={styles.avatarHint}>Tap to upload a photo</Text>
                  </View>
                </View>

                <View style={styles.formSection}>
                  <View style={styles.inputContainer}>
                    <Input
                      label="Full Name"
                      value={name}
                      onChangeText={(text) => {
                        setName(text);
                        if (nameError) validateName(text);
                      }}
                      onBlur={() => validateName(name)}
                      placeholder="Enter your full name"
                      leftIcon={{
                        type: "font-awesome",
                        name: "user-o",
                        color: "#AF125A",
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
                    <Text style={styles.hintText}>
                      Be specific! This helps us personalize your experience.
                    </Text>
                  </View>
                </View>

                <View style={styles.buttonSection}>
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
                            Creating Profile...
                          </Text>
                        </View>
                      ) : (
                        "Continue to Goals Setup"
                      )
                    }
                    onPress={updateProfile}
                    disabled={saving || !isFormComplete}
                    buttonStyle={[
                      styles.primaryButton,
                      (!isFormComplete || saving) && styles.disabledButton,
                    ]}
                    titleStyle={styles.primaryButtonText}
                  />

                  {!isFormComplete && (
                    <Text style={styles.buttonHint}>
                      Complete all fields to continue
                    </Text>
                  )}
                </View>
              </ScrollView>
            </Animated.View>
          </SafeAreaView>
        </TouchableWithoutFeedback>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  safeArea: {
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
  headerSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    alignItems: "center",
  },
  stepText: {
    color: "#AF125A",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 5,
  },
  headerText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#f5f1ed",
    textAlign: "center",
    marginBottom: 8,
  },
  subHeaderText: {
    fontSize: 16,
    color: "rgba(245, 241, 237, 0.7)",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 20,
  },
  progressContainer: {
    width: "100%",
    alignItems: "center",
    gap: 8,
  },
  progressBar: {
    width: "80%",
    height: 6,
    backgroundColor: "rgba(175, 18, 90, 0.2)",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#AF125A",
    borderRadius: 3,
  },
  progressText: {
    color: "rgba(245, 241, 237, 0.6)",
    fontSize: 12,
    fontWeight: "500",
  },
  scrollContent: {
    paddingBottom: 40,
  },
  emailSection: {
    paddingHorizontal: 20,
    marginBottom: 10,
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
  },
  formSection: {
    paddingHorizontal: 20,
  },
  inputContainer: {
    marginBottom: 10,
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
  hintText: {
    color: "rgba(245, 241, 237, 0.5)",
    fontSize: 12,
    marginTop: 5,
    marginLeft: 5,
    fontStyle: "italic",
  },
  buttonSection: {
    paddingHorizontal: 20,
    marginTop: 30,
    alignItems: "center",
    gap: 10,
  },
  primaryButton: {
    backgroundColor: "#AF125A",
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 12,
    width: "100%",
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
  loadingButtonContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  loadingButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  buttonHint: {
    color: "rgba(245, 241, 237, 0.5)",
    fontSize: 12,
    textAlign: "center",
  },
});
