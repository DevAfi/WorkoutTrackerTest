import React, { useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Dimensions,
} from "react-native";
import { useState } from "react";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { supabase } from "../../lib/supabase";
import ViewAvatar from "../../components/viewAvatar";

import StartWorkButton from "../../components/startWorkButton";
import EndWorkoutButton from "../../components/endWorkButton";
import StreakTracker from "../../components/streakComponent";
import LatestSessionRecap from "../../components/statisticComponents/LatestSessionRecap";

const { width } = Dimensions.get("window");

const WorkoutScreen = ({ navigation }) => {
  const [sessionId, setSessionId] = useState("");
  const [userID, setUserID] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [userLoading, setUserLoading] = useState(true);
  const [goalNumber, setGoalNumber] = useState(6);
  const [currentWeeklyProgress, setCurrentWeeklyProgress] = useState(0);

  const getCurrentDate = () => {
    const now = new Date();
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return now.toLocaleDateString("en-US", options);
  };

  const getCurrentWeekWorkouts = async (userId) => {
    try {
      const startOfWeek = new Date();
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
      startOfWeek.setHours(0, 0, 0, 0);

      const { data, error } = await supabase
        .from("workout_sessions")
        .select("id")
        .eq("user_id", userId)
        .gte("started_at", startOfWeek.toISOString())
        .not("ended_at", "is", null);

      if (error) {
        console.error("Error fetching weekly workouts:", error);
        return 0;
      }

      return data?.length || 0;
    } catch (error) {
      console.error("Error in getCurrentWeekWorkouts:", error);
      return 0;
    }
  };

  const fetchUserGoal = async (userId) => {
    try {
      console.log("Loading data now");
      const { data, error } = await supabase
        .from("user_misc_data")
        .select("weekly_workout_goal")
        .eq("user_id", userId)
        .single();

      if (error) {
        console.error("Error fetching user goal:", error);
        if (error.code === "PGRST116") {
          console.log("No user_misc_data found, creating default record");
          const { data: newData, error: insertError } = await supabase
            .from("user_misc_data")
            .insert([
              {
                user_id: userId,
                weekly_workout_goal: 6,
              },
            ])
            .select("weekly_workout_goal")
            .single();

          if (insertError) {
            console.error("Error creating user_misc_data:", insertError);
            return 6;
          }
          return newData?.weekly_workout_goal || 6;
        }
        return 6;
      }

      console.log("User goal data:", data);
      return data?.weekly_workout_goal || 6;
    } catch (error) {
      console.error("Error in fetchUserGoal:", error);
      return 6;
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
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
      .select("avatar_url")
      .eq("id", user.id)
      .single();

    if (error) {
      Alert.alert("Error loading profile", error.message);
    } else if (data) {
      setAvatarUrl(data.avatar_url || "loading pfp...");
    }

    setUserID(user.id);
    console.log("UID: ", userID);
  }

  useEffect(() => {
    (async () => {
      try {
        const { data: userData } = await supabase.auth.getUser();
        if (!userData?.user) {
          console.error("No user data found");
          return;
        }

        console.log("User ID:", userData.user.id);
        setUserID(userData.user.id);

        const [weeklyGoal, currentProgress] = await Promise.all([
          fetchUserGoal(userData.user.id),
          getCurrentWeekWorkouts(userData.user.id),
        ]);

        setGoalNumber(weeklyGoal);
        setCurrentWeeklyProgress(currentProgress);
      } catch (error) {
        console.error("Error getting user:", error);
      } finally {
        setUserLoading(false);
      }
    })();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerSection}>
          <View style={styles.greetingContainer}>
            <Text style={styles.greetingText}>{getGreeting()}!</Text>
            <Text style={styles.dateText}>{getCurrentDate()}</Text>
          </View>
          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => console.log("Profile Clicked")}
          >
            <ViewAvatar url={avatarUrl} />
          </TouchableOpacity>
        </View>

        <View style={styles.statsOverview}>
          <View style={styles.streakContainer}>
            {userID && <StreakTracker userId={userID} />}
          </View>

          <TouchableOpacity
            style={styles.weeklyProgressContainer}
            onPress={() => navigation.navigate("ProgressScreen")}
          >
            <View style={styles.progressHeader}>
              <MaterialIcons name="trending-up" color="#AF125A" size={20} />
              <Text style={styles.statTitle}>Weekly Goal</Text>
            </View>
            <View style={styles.progressContent}>
              <Text style={styles.statValue}>{currentWeeklyProgress}</Text>
              <Text style={styles.statDivider}>/</Text>
              <Text style={styles.statGoal}>{goalNumber}</Text>
            </View>
            <Text style={styles.statSubtitle}>workouts completed</Text>

            <View style={styles.progressBarContainer}>
              <View
                style={[
                  styles.progressBar,
                  {
                    width: `${Math.min(
                      (currentWeeklyProgress / goalNumber) * 100,
                      100
                    )}%`,
                  },
                ]}
              />
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.sessionRecapContainer}>
          <LatestSessionRecap
            onPress={(session) =>
              navigation.navigate("SessionDetail", { sessionId: session.id })
            }
          />
        </View>

        <View style={styles.navigationContainer}>
          <Text style={styles.sectionTitle}>Your Fitness Hub</Text>
          <View style={styles.navigationGrid}>
            <TouchableOpacity
              style={[styles.navButton, styles.primaryNavButton]}
              onPress={() => navigation.navigate("AllWorkoutsScreen")}
              activeOpacity={0.8}
            >
              <View style={styles.navIconContainer}>
                <MaterialIcons
                  name="fitness-center"
                  color="#ffffff"
                  size={28}
                />
              </View>
              <Text style={styles.navButtonTitle}>Workouts</Text>
              <Text style={styles.navButtonSubtitle}>
                Browse & start routines
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.navButton, styles.secondaryNavButton]}
              onPress={() => navigation.navigate("ViewExercises")}
              activeOpacity={0.8}
            >
              <View style={styles.navIconContainer}>
                <MaterialIcons name="list-alt" color="#AF125A" size={24} />
              </View>
              <Text style={styles.navButtonTitle}>Exercises</Text>
              <Text style={styles.navButtonSubtitle}>Exercise library</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.navButton, styles.secondaryNavButton]}
              onPress={() => navigation.navigate("SSC")}
              activeOpacity={0.8}
            >
              <View style={styles.navIconContainer}>
                <MaterialIcons name="insights" color="#AF125A" size={24} />
              </View>
              <Text style={styles.navButtonTitle}>Progress</Text>
              <Text style={styles.navButtonSubtitle}>Track your gains</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.navButton, styles.secondaryNavButton]}
              onPress={() => navigation.navigate("BodyWeightScreen")}
              activeOpacity={0.8}
            >
              <View style={styles.navIconContainer}>
                <MaterialIcons
                  name="monitor-weight"
                  color="#AF125A"
                  size={24}
                />
              </View>
              <Text style={styles.navButtonTitle}>Weight Log</Text>
              <Text style={styles.navButtonSubtitle}>Body weight tracking</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.quickToolsContainer}>
          <Text style={styles.sectionTitle}>Quick Tools</Text>
          <View style={styles.quickToolsRow}>
            <TouchableOpacity
              style={styles.quickTool}
              onPress={() => navigation.navigate("TimerScreen")}
            >
              <MaterialIcons name="timer" color="#AF125A" size={24} />
              <Text style={styles.quickToolText}>Timer</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickTool}
              onPress={() => navigation.navigate("ProgressScreen")}
            >
              <MaterialIcons name="calculate" color="#AF125A" size={24} />
              <Text style={styles.quickToolText}>1RM Calc</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickTool}
              onPress={() => navigation.navigate("BodyWeightScreen")}
            >
              <MaterialIcons name="add" color="#AF125A" size={24} />
              <Text style={styles.quickToolText}>Log Weight</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.motivationContainer}>
          <View style={styles.motivationHeader}>
            <MaterialIcons name="emoji-events" color="#FFD700" size={20} />
            <Text style={styles.motivationTitle}>Daily Motivation</Text>
          </View>
          <Text style={styles.motivationText}>
            "Progressive overload is the foundation of strength. Every rep
            counts, every session matters!"
          </Text>
        </View>
      </ScrollView>

      {/* Fixed Action Button */}
      <View style={styles.actionButtonContainer}>
        {!sessionId ? (
          <View style={styles.startWorkoutContainer}>
            <StartWorkButton onSessionCreated={(id) => setSessionId(id)} />
          </View>
        ) : (
          <View style={styles.sessionInfoContainer}>
            <View style={styles.sessionHeader}>
              <View style={styles.pulseIndicator} />
              <Text style={styles.sessionText}>Workout in Progress</Text>
            </View>
            <Text style={styles.sessionIdText}>Session: {sessionId}</Text>
            <View style={styles.sessionActions}>
              <TouchableOpacity
                style={styles.continueButton}
                onPress={() =>
                  navigation.navigate("ActiveWorkout", { sessionId })
                }
              >
                <MaterialIcons name="play-arrow" color="#ffffff" size={16} />
                <Text style={styles.continueButtonText}>Continue</Text>
              </TouchableOpacity>
              <EndWorkoutButton onWorkoutEnded={() => setSessionId("")} />
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0D0D0D",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 120,
  },

  headerSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingVertical: 20,
    paddingTop: 16,
  },
  greetingContainer: {
    flex: 1,
  },
  greetingText: {
    fontSize: 32,
    fontWeight: "800",
    color: "#FFFFFF",
    fontFamily: "Arial",
    marginBottom: 4,
  },
  dateText: {
    fontSize: 16,
    color: "#999999",
    fontFamily: "Arial",
    fontWeight: "500",
  },
  profileButton: {
    backgroundColor: "#1A1A1A",
    borderRadius: 100,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#AF125A",
  },

  statsOverview: {
    gap: 16,
    marginBottom: 28,
  },
  streakContainer: {
    width: "100%",
  },
  weeklyProgressContainer: {
    width: "100%",
    backgroundColor: "#1A1A1A",
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "#2A2A2A",
  },
  progressHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
  },
  statTitle: {
    fontSize: 14,
    color: "#CCCCCC",
    fontFamily: "Arial",
    fontWeight: "600",
  },
  progressContent: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 8,
  },
  statValue: {
    fontSize: 28,
    fontWeight: "800",
    color: "#AF125A",
    fontFamily: "Arial",
  },
  statDivider: {
    fontSize: 20,
    color: "#666666",
    marginHorizontal: 4,
  },
  statGoal: {
    fontSize: 20,
    color: "#666666",
    fontWeight: "600",
  },
  statSubtitle: {
    fontSize: 12,
    color: "#888888",
    fontFamily: "Arial",
    marginBottom: 16,
  },
  progressBarContainer: {
    height: 4,
    backgroundColor: "#333333",
    borderRadius: 2,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#AF125A",
    borderRadius: 2,
  },

  sessionRecapContainer: {
    marginBottom: 28,
    alignItems: "center",
  },

  navigationContainer: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#FFFFFF",
    fontFamily: "Arial",
    marginBottom: 20,
  },
  navigationGrid: {
    gap: 16,
  },
  navButton: {
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
  },
  primaryNavButton: {
    backgroundColor: "#AF125A",
    borderColor: "#AF125A",
    marginBottom: 8,
  },
  secondaryNavButton: {
    backgroundColor: "#1A1A1A",
    borderColor: "#2A2A2A",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 20,
  },
  navIconContainer: {
    marginBottom: 10,
  },
  navButtonTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
    fontFamily: "Arial",
    marginBottom: 4,
  },
  navButtonSubtitle: {
    fontSize: 14,
    color: "#CCCCCC",
    fontFamily: "Arial",
  },

  quickToolsContainer: {
    marginBottom: 28,
  },
  quickToolsRow: {
    flexDirection: "row",
    gap: 12,
  },
  quickTool: {
    flex: 1,
    backgroundColor: "#1A1A1A",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#2A2A2A",
  },
  quickToolText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FFFFFF",
    fontFamily: "Arial",
    marginTop: 8,
  },

  motivationContainer: {
    backgroundColor: "#1A1A1A",
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: "#2A2A2A",
    marginBottom: 28,
  },
  motivationHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 10,
  },
  motivationTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
    fontFamily: "Arial",
  },
  motivationText: {
    fontSize: 15,
    color: "#CCCCCC",
    fontFamily: "Arial",
    lineHeight: 22,
    fontStyle: "italic",
  },

  actionButtonContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#0D0D0D",
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingBottom: 12,
    borderTopWidth: 1,
    borderTopColor: "#2A2A2A",
  },
  startWorkoutContainer: {
    alignItems: "center",
  },

  sessionInfoContainer: {
    backgroundColor: "#1A1A1A",
    borderRadius: 20,
    padding: 24,
    borderWidth: 2,
    borderColor: "#AF125A",
  },
  sessionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  pulseIndicator: {
    width: 10,
    height: 10,
    backgroundColor: "#AF125A",
    borderRadius: 5,
    marginRight: 12,
  },
  sessionText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
    fontFamily: "Arial",
  },
  sessionIdText: {
    fontSize: 12,
    color: "#888888",
    fontFamily: "Arial",
    textAlign: "center",
    marginBottom: 20,
  },
  sessionActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 16,
  },
  continueButton: {
    backgroundColor: "#AF125A",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flex: 1,
    justifyContent: "center",
  },
  continueButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 16,
  },
});

export default WorkoutScreen;
