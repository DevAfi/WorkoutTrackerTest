import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import {
  StyleSheet,
  View,
  Alert,
  SafeAreaView,
  Text,
  TouchableWithoutFeedback,
  ScrollView,
  Animated,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { Button, Slider } from "@rneui/themed";
import { Session } from "@supabase/supabase-js";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import ViewAvatar from "./viewAvatar";

const { width } = Dimensions.get("window");

export default function Onboarding() {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [weeklyGoal, setWeeklyGoal] = useState(3);
  const [monthlyGoal, setMonthlyGoal] = useState(12);
  const [name, setName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [initialLoad, setInitialLoad] = useState(true);
  const [sessionReady, setSessionReady] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [goalExplanation, setGoalExplanation] = useState("");

  // Animation
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(50))[0];
  const scaleAnim = useState(new Animated.Value(0.9))[0];

  useEffect(() => {
    const getSession = async () => {
      const {
        data: { session: currentSession },
      } = await supabase.auth.getSession();
      setSession(currentSession);
    };

    getSession();
  }, []);

  useEffect(() => {
    if (session?.user?.id) {
      getProfile();
    } else if (session === null) {
      Alert.alert("Session Error", "Please log in again");
    }
  }, [session]);

  useEffect(() => {
    setMonthlyGoal(weeklyGoal * 4);
    updateGoalExplanation(weeklyGoal);
  }, [weeklyGoal]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const updateGoalExplanation = (goal: number) => {
    const explanations = {
      1: "Perfect for beginners! One quality workout per week builds a sustainable habit.",
      2: "Great balance for busy schedules. Two workouts weekly will show steady progress.",
      3: "The sweet spot! Three sessions per week is ideal for most fitness goals.",
      4: "Ambitious and effective! Four workouts weekly will accelerate your progress.",
      5: "High commitment level! Five sessions show serious dedication to your goals.",
      6: "Near-daily training! Six workouts per week is for the truly committed.",
      7: "Ultimate dedication! Daily workouts require serious commitment and recovery.",
    };
    setGoalExplanation(explanations[goal as keyof typeof explanations] || "");
  };

  async function getProfile() {
    try {
      setInitialLoad(true);

      if (!session?.user?.id) {
        console.log("No session or user ID available");
        setInitialLoad(false);
        return;
      }

      console.log("Getting profile for user:", session.user.id);

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select(`avatar_url, full_name`)
        .eq("id", session.user.id)
        .single();

      if (profileError && profileError.code !== "PGRST116") {
        console.log("Profile error:", profileError);
      }

      if (profileData) {
        setAvatarUrl(profileData.avatar_url || "");
        setName(profileData.full_name || "");
        console.log("Profile loaded:", profileData.full_name);
      }

      setSessionReady(true);
    } catch (error) {
      console.log("Error getting profile:", error);
    } finally {
      setInitialLoad(false);
    }
  }

  async function setupGoals() {
    try {
      setLoading(true);

      console.log("Session check:", session?.user?.id);

      if (!session?.user?.id) {
        Alert.alert(
          "Error",
          "No user session found. Please try logging in again."
        );
        return;
      }

      console.log("Setting up goals for user:", session.user.id);

      const updates = {
        user_id: session.user.id,
        weekly_workout_goal: weeklyGoal,
        monthly_workout_goal: monthlyGoal,
        updated_at: new Date(),
      };

      console.log("Updating with:", updates);

      const { error } = await supabase.from("user_misc_data").upsert(updates, {
        onConflict: "user_id",
      });

      if (error) {
        console.error("Database error:", error);
        throw error;
      }

      console.log("Goals saved successfully!");

      Alert.alert(
        "🎉 Welcome Aboard!",
        `Your goals are set! Let's start your journey with ${weeklyGoal} workouts per week.`,
        [
          {
            text: "Let's Go!",
            onPress: () => {
              setTimeout(() => {
                navigation.navigate("Tabs");
              }, 500);
            },
          },
        ]
      );
    } catch (error) {
      console.error("Error setting up goals:", error);
      Alert.alert("Error", `Failed to save your goals: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }

  if (initialLoad) {
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

  if (!sessionReady || !session?.user?.id) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={["#1a1a1a", "#2d2d2d", "#1a1a1a"]}
          style={styles.gradient}
        >
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Session not ready...</Text>
            <Text style={styles.subText}>
              Please wait or try logging in again
            </Text>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <TouchableWithoutFeedback>
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={["#1a1a1a", "#2d2d2d", "#1a1a1a"]}
          style={styles.gradient}
        >
          <Animated.View
            style={[
              styles.content,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
              },
            ]}
          >
            <View style={styles.headerSection}>
              <Text style={styles.stepText}>Step 2 of 2</Text>
              <Text style={styles.headerText}>Set Your Goals 🎯</Text>
              <Text style={styles.subHeaderText}>
                Customize your workout frequency to match your lifestyle
              </Text>
            </View>

            <ScrollView
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              <Animated.View
                style={[styles.profileSection, { opacity: fadeAnim }]}
              >
                <ViewAvatar
                  size={80}
                  url={avatarUrl}
                  onUpload={(url: string) => setAvatarUrl(url)}
                />
                {name && (
                  <Text style={styles.welcomeText}>
                    Welcome, {name.split(" ")[0]}! 👋
                  </Text>
                )}
              </Animated.View>

              <Animated.View
                style={[styles.goalsSection, { opacity: fadeAnim }]}
              >
                <View style={styles.goalCard}>
                  <View style={styles.goalHeader}>
                    <Text style={styles.goalIcon}>📅</Text>
                    <View style={styles.goalTitleContainer}>
                      <Text style={styles.goalTitle}>Weekly Goal</Text>
                      <Text style={styles.goalSubtitle}>
                        How often will you workout?
                      </Text>
                    </View>
                  </View>

                  <View style={styles.goalValueContainer}>
                    <Text style={styles.goalValue}>{weeklyGoal}</Text>
                    <Text style={styles.goalUnit}>
                      workout{weeklyGoal !== 1 ? "s" : ""} per week
                    </Text>
                  </View>

                  <View style={styles.sliderContainer}>
                    <Slider
                      style={styles.slider}
                      minimumValue={1}
                      maximumValue={7}
                      step={1}
                      value={weeklyGoal}
                      onValueChange={setWeeklyGoal}
                      thumbStyle={styles.sliderThumb}
                      trackStyle={styles.sliderTrack}
                      minimumTrackTintColor="#AF125A"
                      maximumTrackTintColor="rgba(175, 18, 90, 0.2)"
                    />
                    <View style={styles.sliderLabels}>
                      <Text style={styles.sliderLabel}>1</Text>
                      <Text style={styles.sliderLabel}>7</Text>
                    </View>
                  </View>

                  <View style={styles.explanationContainer}>
                    <Text style={styles.explanationText}>
                      {goalExplanation}
                    </Text>
                  </View>
                </View>

                <View style={styles.goalCard}>
                  <View style={styles.goalHeader}>
                    <Text style={styles.goalIcon}>🗓️</Text>
                    <View style={styles.goalTitleContainer}>
                      <Text style={styles.goalTitle}>Monthly Target</Text>
                      <Text style={styles.goalSubtitle}>
                        Auto-calculated from weekly goal
                      </Text>
                    </View>
                  </View>

                  <View style={styles.goalValueContainer}>
                    <Text style={styles.goalValue}>{monthlyGoal}</Text>
                    <Text style={styles.goalUnit}>workouts per month</Text>
                  </View>

                  <View style={styles.monthlyBreakdown}>
                    <Text style={styles.breakdownText}>
                      That's approximately {Math.round(monthlyGoal * 12)}{" "}
                      workouts per year! 💪
                    </Text>
                  </View>
                </View>

                <View style={styles.motivationCard}>
                  <Text style={styles.motivationIcon}>
                    {weeklyGoal <= 2 && "🌱"}
                    {weeklyGoal >= 3 && weeklyGoal <= 4 && "💪"}
                    {weeklyGoal >= 5 && weeklyGoal <= 6 && "🔥"}
                    {weeklyGoal === 7 && "⚡"}
                  </Text>
                  <Text style={styles.motivationTitle}>
                    {weeklyGoal <= 2 && "Building Foundations"}
                    {weeklyGoal >= 3 && weeklyGoal <= 4 && "Finding Balance"}
                    {weeklyGoal >= 5 && weeklyGoal <= 6 && "High Performance"}
                    {weeklyGoal === 7 && "Elite Dedication"}
                  </Text>
                  <Text style={styles.motivationText}>
                    {weeklyGoal <= 2 &&
                      "Every journey starts with a single step. You're building sustainable habits!"}
                    {weeklyGoal >= 3 &&
                      weeklyGoal <= 4 &&
                      "Perfect balance of challenge and sustainability. You've got this!"}
                    {weeklyGoal >= 5 &&
                      weeklyGoal <= 6 &&
                      "Impressive commitment! Remember to prioritize recovery too."}
                    {weeklyGoal === 7 &&
                      "Ultimate dedication! Make sure to listen to your body and rest when needed."}
                  </Text>
                </View>

                {/* I HAVE TO FIX THE SCROLLING ISSUE, BUTTON IS JUST HERE TO BE ABLE TO
                    SCROLL WITHOUT BEING SOFTLOCKED IN THIS SCREEN
                */}

                <Button></Button>

                <View style={styles.tipsCard}>
                  <Text style={styles.tipsTitle}>💡 Pro Tips</Text>
                  <View style={styles.tipsList}>
                    <Text style={styles.tipItem}>
                      • Start with shorter sessions if you're new
                    </Text>
                    <Text style={styles.tipItem}>
                      • Consistency beats intensity
                    </Text>
                    <Text style={styles.tipItem}>
                      • You can adjust your goals anytime
                    </Text>
                    <Text style={styles.tipItem}>
                      • Rest days are part of the plan
                    </Text>
                  </View>
                </View>
              </Animated.View>

              <View style={styles.buttonSection}>
                <Button
                  title={
                    loading ? (
                      <View style={styles.loadingButtonContent}>
                        <ActivityIndicator
                          color="white"
                          size="small"
                          style={{ marginRight: 10 }}
                        />
                        <Text style={styles.loadingButtonText}>
                          Setting up your journey...
                        </Text>
                      </View>
                    ) : (
                      `Start My Journey! 🚀`
                    )
                  }
                  onPress={setupGoals}
                  disabled={loading}
                  buttonStyle={[
                    styles.primaryButton,
                    loading && styles.disabledButton,
                  ]}
                  titleStyle={styles.primaryButtonText}
                />

                <Text style={styles.buttonSubtext}>
                  Ready to transform your fitness routine?
                </Text>
              </View>
            </ScrollView>
          </Animated.View>
        </LinearGradient>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
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
  subText: {
    color: "rgba(245, 241, 237, 0.7)",
    fontSize: 14,
    textAlign: "center",
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
    fontSize: 32,
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
  scrollContent: {
    paddingBottom: 40,
  },
  profileSection: {
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  welcomeText: {
    fontSize: 24,
    color: "#f5f1ed",
    marginTop: 15,
    fontWeight: "600",
    textAlign: "center",
  },
  goalsSection: {
    paddingHorizontal: 20,
    gap: 20,
  },
  goalCard: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    padding: 25,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(175, 18, 90, 0.3)",
  },
  goalHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  goalIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  goalTitleContainer: {
    flex: 1,
  },
  goalTitle: {
    fontSize: 20,
    color: "#f5f1ed",
    fontWeight: "700",
    marginBottom: 2,
  },
  goalSubtitle: {
    fontSize: 14,
    color: "rgba(245, 241, 237, 0.6)",
  },
  goalValueContainer: {
    alignItems: "center",
    marginBottom: 25,
  },
  goalValue: {
    fontSize: 48,
    color: "#AF125A",
    fontWeight: "bold",
    marginBottom: 5,
  },
  goalUnit: {
    fontSize: 16,
    color: "rgba(245, 241, 237, 0.8)",
    fontWeight: "500",
  },
  sliderContainer: {
    marginBottom: 15,
  },
  slider: {
    width: "100%",
    height: 40,
  },
  sliderThumb: {
    backgroundColor: "#AF125A",
    width: 28,
    height: 28,
    borderRadius: 14,
    elevation: 4,
    shadowColor: "#AF125A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  sliderTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  sliderLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    paddingHorizontal: 10,
  },
  sliderLabel: {
    color: "rgba(245, 241, 237, 0.6)",
    fontSize: 12,
    fontWeight: "600",
  },
  explanationContainer: {
    backgroundColor: "rgba(175, 18, 90, 0.1)",
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(175, 18, 90, 0.2)",
  },
  explanationText: {
    color: "#f5f1ed",
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
  },
  monthlyBreakdown: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    padding: 15,
    borderRadius: 10,
    marginTop: 15,
  },
  breakdownText: {
    color: "rgba(245, 241, 237, 0.8)",
    fontSize: 14,
    textAlign: "center",
    fontStyle: "italic",
  },
  motivationCard: {
    backgroundColor: "rgba(175, 18, 90, 0.1)",
    padding: 25,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(175, 18, 90, 0.3)",
    alignItems: "center",
  },
  motivationIcon: {
    fontSize: 32,
    marginBottom: 10,
  },
  motivationTitle: {
    fontSize: 20,
    color: "#AF125A",
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  motivationText: {
    color: "#f5f1ed",
    fontSize: 16,
    textAlign: "center",
    lineHeight: 22,
  },
  tipsCard: {
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(245, 241, 237, 0.1)",
  },
  tipsTitle: {
    fontSize: 18,
    color: "#f5f1ed",
    fontWeight: "600",
    marginBottom: 15,
    textAlign: "center",
  },
  tipsList: {
    gap: 8,
  },
  tipItem: {
    color: "rgba(245, 241, 237, 0.8)",
    fontSize: 14,
    lineHeight: 20,
  },
  buttonSection: {
    paddingHorizontal: 20,
    marginTop: 30,
    alignItems: "center",
    gap: 10,
  },
  primaryButton: {
    backgroundColor: "#AF125A",
    paddingVertical: 18,
    paddingHorizontal: 40,
    borderRadius: 16,
    width: "100%",
    elevation: 6,
    shadowColor: "#AF125A",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
  },
  disabledButton: {
    backgroundColor: "rgba(175, 18, 90, 0.5)",
  },
  primaryButtonText: {
    fontSize: 20,
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
  buttonSubtext: {
    color: "rgba(245, 241, 237, 0.6)",
    fontSize: 14,
    textAlign: "center",
    marginTop: 5,
  },
});
