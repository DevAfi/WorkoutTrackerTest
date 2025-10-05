import React, { useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Dimensions,
  Animated,
  Alert,
} from "react-native";
import { useState } from "react";
import { LinearGradient } from "expo-linear-gradient";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { supabase } from "../../lib/supabase";
import ViewAvatar from "../../components/viewAvatar";

import StartWorkButton from "../../components/startWorkButton";
import EndWorkoutButton from "../../components/endWorkButton";
import StreakTracker from "../../components/streakComponent";
import LatestSessionRecap from "../../components/statisticComponents/LatestSessionRecap";
import InlineWeightLogger from "../../components/statisticComponents/quickWeightInput";

const { width } = Dimensions.get("window");

const WorkoutScreen = ({ navigation }) => {
  const [sessionId, setSessionId] = useState("");
  const [userID, setUserID] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [userName, setUserName] = useState("");
  const [userLoading, setUserLoading] = useState(true);
  const [goalNumber, setGoalNumber] = useState(6);
  const [currentWeeklyProgress, setCurrentWeeklyProgress] = useState(0);
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(30))[0];

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
      const { data, error } = await supabase
        .from("user_misc_data")
        .select("weekly_workout_goal")
        .eq("user_id", userId)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          const { data: newData, error: insertError } = await supabase
            .from("user_misc_data")
            .insert([{ user_id: userId, weekly_workout_goal: 6 }])
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

  const getMotivationalQuote = () => {
    const quotes = [
      "Progressive overload is the foundation of strength. Every rep counts!",
      "Consistency beats perfection. Show up today!",
      "Your only competition is who you were yesterday.",
      "Strong is built one rep at a time.",
      "The hardest part is showing up. You're already winning!",
      "Every workout is a deposit in your future self.",
    ];
    return quotes[Math.floor(Math.random() * quotes.length)];
  };

  useEffect(() => {
    fetchProfile();

    // Start animations
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
    ]).start();
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
      .select("avatar_url, full_name")
      .eq("id", user.id)
      .single();

    if (error) {
      Alert.alert("Error loading profile", error.message);
    } else if (data) {
      setAvatarUrl(data.avatar_url || "");
      setUserName(data.full_name || "");
    }

    setUserID(user.id);
  }

  useEffect(() => {
    (async () => {
      try {
        const { data: userData } = await supabase.auth.getUser();
        if (!userData?.user) {
          console.error("No user data found");
          return;
        }

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

  const getProgressMessage = () => {
    const percentage = (currentWeeklyProgress / goalNumber) * 100;
    if (percentage >= 100) return "Goal crushed! 🔥";
    if (percentage >= 75) return "Almost there! 💪";
    if (percentage >= 50) return "Halfway there!";
    if (percentage >= 25) return "Good start!";
    return "Let's begin!";
  };

  const NavCard = ({
    icon,
    title,
    subtitle,
    onPress,
    isPrimary = false,
    color = "#AF125A",
  }) => {
    const [scaleAnim] = useState(new Animated.Value(1));

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
      <Animated.View style={[{ transform: [{ scale: scaleAnim }] }]}>
        <TouchableOpacity
          style={[
            styles.navButton,
            isPrimary ? styles.primaryNavButton : styles.secondaryNavButton,
          ]}
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={0.9}
        >
          {isPrimary ? (
            <LinearGradient
              colors={["#AF125A", "#D91A72"]}
              style={styles.primaryGradient}
            >
              <View style={styles.primaryContent}>
                <MaterialIcons name={icon} color="#ffffff" size={32} />
                <Text style={styles.primaryButtonTitle}>{title}</Text>
                <Text style={styles.primaryButtonSubtitle}>{subtitle}</Text>
              </View>
            </LinearGradient>
          ) : (
            <View style={styles.secondaryContent}>
              <View style={styles.secondaryLeft}>
                <View
                  style={[styles.iconCircle, { backgroundColor: `${color}20` }]}
                >
                  <MaterialIcons name={icon} color={color} size={24} />
                </View>
                <View>
                  <Text style={styles.navButtonTitle}>{title}</Text>
                  <Text style={styles.navButtonSubtitle}>{subtitle}</Text>
                </View>
              </View>
              <MaterialIcons name="chevron-right" color="#666" size={20} />
            </View>
          )}
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const QuickTool = ({ icon, title, onPress, color = "#AF125A" }) => {
    const [scaleAnim] = useState(new Animated.Value(1));

    const handlePressIn = () => {
      Animated.spring(scaleAnim, {
        toValue: 0.95,
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
      <Animated.View style={[{ transform: [{ scale: scaleAnim }] }]}>
        <TouchableOpacity
          style={styles.quickTool}
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={0.8}
        >
          <View
            style={[styles.quickToolIcon, { backgroundColor: `${color}15` }]}
          >
            <MaterialIcons name={icon} color={color} size={24} />
          </View>
          <Text style={styles.quickToolText}>{title}</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <LinearGradient
      colors={["#0D0D0D", "#1A1A1A", "#0D0D0D"]}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
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
            <View style={styles.headerSection}>
              <View style={styles.greetingContainer}>
                <Text style={styles.greetingText}>
                  {getGreeting()}
                  {userName ? `, ${userName.split(" ")[0]}!` : "!"}
                </Text>
                <Text style={styles.dateText}>{getCurrentDate()}</Text>
              </View>
              <TouchableOpacity
                style={styles.profileButton}
                onPress={() => navigation.navigate("ProfileSettings")}
              >
                <ViewAvatar url={avatarUrl} />
                <View style={styles.profileIndicator} />
              </TouchableOpacity>
            </View>

            <View style={styles.statsOverview}>
              <View style={styles.streakContainer}>
                {userID && <StreakTracker userId={userID} />}
              </View>

              <TouchableOpacity
                style={styles.weeklyProgressContainer}
                onPress={() => navigation.navigate("ProgressScreen")}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={["rgba(175, 18, 90, 0.1)", "rgba(175, 18, 90, 0.05)"]}
                  style={styles.progressGradient}
                >
                  <View style={styles.progressHeader}>
                    <MaterialIcons
                      name="trending-up"
                      color="#AF125A"
                      size={20}
                    />
                    <Text style={styles.statTitle}>Weekly Goal</Text>
                    <View style={styles.progressBadge}>
                      <Text style={styles.progressBadgeText}>
                        {Math.round((currentWeeklyProgress / goalNumber) * 100)}
                        %
                      </Text>
                    </View>
                  </View>
                  <View style={styles.progressContent}>
                    <Text style={styles.statValue}>
                      {currentWeeklyProgress}
                    </Text>
                    <Text style={styles.statDivider}>/</Text>
                    <Text style={styles.statGoal}>{goalNumber}</Text>
                  </View>
                  <Text style={styles.statSubtitle}>
                    {getProgressMessage()}
                  </Text>

                  <View style={styles.progressBarContainer}>
                    <Animated.View
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
                </LinearGradient>
              </TouchableOpacity>
            </View>

            <View style={styles.sessionRecapContainer}>
              <LatestSessionRecap
                onPress={(session) =>
                  navigation.navigate("SessionDetail", {
                    sessionId: session.id,
                  })
                }
              />
            </View>

            <View style={styles.navigationContainer}>
              <Text style={styles.sectionTitle}>Your Fitness Hub</Text>
              <View style={styles.navigationGrid}>
                <NavCard
                  icon="fitness-center"
                  title="Start Workout"
                  subtitle="Browse routines & start training"
                  onPress={() => navigation.navigate("AllWorkoutsScreen")}
                  isPrimary={true}
                />
                <NavCard
                  icon="list-alt"
                  title="Exercise Library"
                  subtitle="Browse all exercises"
                  onPress={() => navigation.navigate("ViewExercises")}
                />
                <NavCard
                  icon="insights"
                  title="Progress Analytics"
                  subtitle="Track your performance"
                  onPress={() => navigation.navigate("SSC")}
                  color="#4ECDC4"
                />
                <NavCard
                  icon="monitor-weight"
                  title="Weight Tracking"
                  subtitle="Log body weight & progress"
                  onPress={() => navigation.navigate("WeightStatisticsScreen")}
                  color="#FFE66D"
                />
              </View>
            </View>

            <View style={styles.quickToolsContainer}>
              <Text style={styles.sectionTitle}>Quick Tools</Text>
              <View style={styles.quickToolsGrid}>
                <View style={styles.quickToolsRow}>
                  <QuickTool
                    icon="timer"
                    title="Rest Timer"
                    onPress={() => navigation.navigate("TimerScreen")}
                    color="#4ECDC4"
                  />
                  <QuickTool
                    icon="calculate"
                    title="1RM Calculator"
                    onPress={() => navigation.navigate("ProgressScreen")}
                    color="#FFE66D"
                  />
                </View>
                <InlineWeightLogger
                  onWeightLogged={() => {
                    console.log("Weight logged successfully!");
                  }}
                />
              </View>
            </View>

            {/* Enhanced Motivation Section */}
            <View style={styles.motivationContainer}>
              <LinearGradient
                colors={["rgba(255, 215, 0, 0.1)", "rgba(255, 215, 0, 0.05)"]}
                style={styles.motivationGradient}
              >
                <View style={styles.motivationHeader}>
                  <MaterialIcons
                    name="emoji-events"
                    color="#FFD700"
                    size={24}
                  />
                  <Text style={styles.motivationTitle}>Daily Motivation</Text>
                </View>
                <Text style={styles.motivationText}>
                  {getMotivationalQuote()}
                </Text>
              </LinearGradient>
            </View>
          </Animated.View>
        </ScrollView>

        {/* Enhanced Action Button */}
        <View style={styles.actionButtonContainer}>
          {!sessionId ? (
            <View style={styles.startWorkoutContainer}>
              <StartWorkButton onSessionCreated={(id) => setSessionId(id)} />
            </View>
          ) : (
            <View style={styles.sessionInfoContainer}>
              <LinearGradient
                colors={["rgba(175, 18, 90, 0.1)", "rgba(175, 18, 90, 0.05)"]}
                style={styles.activeSessionGradient}
              >
                <View style={styles.sessionHeader}>
                  <Animated.View
                    style={[
                      styles.pulseIndicator,
                      {
                        transform: [
                          {
                            scale: fadeAnim.interpolate({
                              inputRange: [0, 1],
                              outputRange: [1, 1.2],
                            }),
                          },
                        ],
                      },
                    ]}
                  />
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
                    <MaterialIcons
                      name="play-arrow"
                      color="#ffffff"
                      size={16}
                    />
                    <Text style={styles.continueButtonText}>Continue</Text>
                  </TouchableOpacity>
                  <EndWorkoutButton onWorkoutEnded={() => setSessionId("")} />
                </View>
              </LinearGradient>
            </View>
          )}
        </View>
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
  content: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 140,
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
    fontSize: 28,
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  dateText: {
    fontSize: 16,
    color: "#999999",
    fontWeight: "500",
  },
  profileButton: {
    position: "relative",
    backgroundColor: "#1A1A1A",
    borderRadius: 100,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#AF125A",
  },
  profileIndicator: {
    position: "absolute",
    top: -2,
    right: -2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#4ECDC4",
    borderWidth: 2,
    borderColor: "#0D0D0D",
  },

  statsOverview: {
    gap: 16,
    marginBottom: 28,
  },
  streakContainer: {
    width: "100%",
  },
  weeklyProgressContainer: {
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(175, 18, 90, 0.3)",
  },
  progressGradient: {
    padding: 20,
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
    fontWeight: "600",
    flex: 1,
  },
  progressBadge: {
    backgroundColor: "#AF125A",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  progressBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },
  progressContent: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 8,
  },
  statValue: {
    fontSize: 32,
    fontWeight: "800",
    color: "#AF125A",
  },
  statDivider: {
    fontSize: 24,
    color: "#666666",
    marginHorizontal: 6,
  },
  statGoal: {
    fontSize: 24,
    color: "#666666",
    fontWeight: "600",
  },
  statSubtitle: {
    fontSize: 14,
    color: "#AF125A",
    marginBottom: 16,
    fontWeight: "600",
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: "rgba(175, 18, 90, 0.2)",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#AF125A",
    borderRadius: 3,
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
    marginBottom: 20,
  },
  navigationGrid: {
    gap: 16,
  },
  navButton: {
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 12,
  },
  primaryNavButton: {
    borderWidth: 2,
    borderColor: "#AF125A",
  },
  primaryGradient: {
    padding: 24,
  },
  primaryContent: {
    alignItems: "center",
  },
  primaryButtonTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFFFFF",
    marginTop: 12,
    marginBottom: 4,
  },
  primaryButtonSubtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
  },
  secondaryNavButton: {
    backgroundColor: "#1A1A1A",
    borderWidth: 1,
    borderColor: "#2A2A2A",
  },
  secondaryContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
  },
  secondaryLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  navButtonTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 2,
  },
  navButtonSubtitle: {
    fontSize: 14,
    color: "#CCCCCC",
  },

  quickToolsContainer: {
    marginBottom: 28,
  },
  quickToolsGrid: {
    gap: 16,
  },
  quickToolsRow: {
    flexDirection: "row",
    gap: 10,
    justifyContent: "space-around",
  },
  quickTool: {
    flex: 1,
    backgroundColor: "#1A1A1A",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#2A2A2A",
    maxWidth: 190,
    width: 150,
  },
  quickToolIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  quickToolText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FFFFFF",
    textAlign: "center",
  },

  motivationContainer: {
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255, 215, 0, 0.3)",
    marginBottom: 28,
  },
  motivationGradient: {
    padding: 24,
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
  },
  motivationText: {
    fontSize: 15,
    color: "#CCCCCC",
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
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "#AF125A",
  },
  activeSessionGradient: {
    padding: 24,
  },
  sessionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  pulseIndicator: {
    width: 12,
    height: 12,
    backgroundColor: "#AF125A",
    borderRadius: 6,
    marginRight: 12,
  },
  sessionText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  sessionIdText: {
    fontSize: 12,
    color: "#888888",
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
