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
import StartWorkButton from "../../components/startWorkButton";
import EndWorkoutButton from "../../components/endWorkButton";
import StreakTracker from "../../components/streakComponent";
import LatestSessionRecap from "../../components/statisticComponents/LatestSessionRecap";

const { width } = Dimensions.get("window");

const WorkoutScreen = ({ navigation }) => {
  const [sessionId, setSessionId] = useState("");
  const [userID, setUserID] = useState("");
  const [userLoading, setUserLoading] = useState(true);
  const [goalNumber, setGoalNumber] = useState("0");

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

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

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
        {/* Header Section */}
        <View style={styles.headerSection}>
          <Text style={styles.greetingText}>{getGreeting()}!</Text>
          <Text style={styles.dateText}>{getCurrentDate()}</Text>
        </View>

        {/* Top Navigation Buttons */}
        <View style={styles.topButtonsContainer}>
          <TouchableOpacity
            style={styles.topButton}
            onPress={() => navigation.navigate("allWorkoutsScreen")}
            activeOpacity={0.8}
          >
            <View style={styles.buttonContent}>
              <MaterialIcons name="list-alt" color="#AF125A" size={20} />
              <Text style={styles.topButtonText}>Workouts</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.topButton}
            onPress={() => navigation.navigate("viewExercises")}
            activeOpacity={0.8}
          >
            <View style={styles.buttonContent}>
              <MaterialIcons name="fitness-center" color="#AF125A" size={20} />
              <Text style={styles.topButtonText}>Exercises</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Quick Stats Row */}
        <View style={styles.quickStatsRow}>
          {/* Streak Component */}
          <View style={styles.streakContainer}>
            {userID && <StreakTracker userId={userID} />}
          </View>

          {/* Weekly Progress Placeholder */}
          <TouchableOpacity
            style={styles.weeklyProgressContainer}
            onPress={() => navigation.navigate("ProgressScreen")}
          >
            <Text style={styles.statTitle}>Weekly Goal</Text>
            <Text style={styles.statValue}>4/{goalNumber}</Text>
            <Text style={styles.statSubtitle}>workouts</Text>
          </TouchableOpacity>
        </View>

        {/* Latest Session Recap */}
        <View style={styles.sessionRecapContainer}>
          <LatestSessionRecap
            onPress={(session) =>
              navigation.navigate("SessionDetail", { sessionId: session.id })
            }
          />
        </View>

        {/* Quick Actions Grid */}
        <View style={styles.quickActionsContainer}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={() => navigation.navigate("TimerScreen")}
            >
              <MaterialIcons
                name="timer"
                color="#ffffff"
                size={24}
                marginBottom={3}
              />
              <Text style={styles.quickActionText}>Timer</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={() => navigation.navigate("ProgressScreen")}
            >
              <MaterialIcons
                name="bar-chart"
                color="#ffffff"
                size={24}
                marginBottom={3}
              />
              <Text style={styles.quickActionText}>Progress</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={() => navigation.navigate("BodyWeightScreen")}
            >
              <MaterialIcons
                name="scale"
                color="#ffffff"
                size={24}
                marginBottom={3}
              />
              <Text style={styles.quickActionText}>Weight Log</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={() => navigation.navigate("SettingsScreen")}
            >
              <MaterialIcons
                name="settings"
                color="#ffffff"
                size={24}
                marginBottom={3}
              />
              <Text style={styles.quickActionText}>Settings</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Motivational Quote/Tip */}
        <View style={styles.motivationContainer}>
          <Text style={styles.motivationTitle}>💡 Today's Tip</Text>
          <Text style={styles.motivationText}>
            "Progressive overload is key - aim to increase weight, reps, or sets
            each week!"
          </Text>
        </View>
      </ScrollView>

      {/* Fixed Action Button */}
      <View style={styles.actionButtonContainer}>
        {!sessionId ? (
          <StartWorkButton onSessionCreated={(id) => setSessionId(id)} />
        ) : (
          <View style={styles.sessionInfoContainer}>
            <View style={styles.sessionHeader}>
              <View style={styles.pulseIndicator} />
              <Text style={styles.sessionText}>Workout in Progress</Text>
            </View>
            <Text style={styles.sessionIdText}>Session: {sessionId}</Text>
            <View style={styles.sessionActions}>
              <TouchableOpacity
                style={styles.pauseButton}
                onPress={() =>
                  navigation.navigate("ActiveWorkout", { sessionId })
                }
              >
                <Text style={styles.pauseButtonText}>Continue</Text>
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
    backgroundColor: "#000000",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },

  // Header
  headerSection: {
    alignItems: "center",
    paddingVertical: 24,
    paddingTop: 16,
  },
  greetingText: {
    fontSize: 28,
    fontWeight: "700",
    color: "#f5f1ed",
    fontFamily: "Arial",
    marginBottom: 4,
  },
  dateText: {
    fontSize: 16,
    color: "#888888",
    fontFamily: "Arial",
  },

  // Top Navigation
  topButtonsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 24,
    gap: 16,
  },
  topButton: {
    backgroundColor: "#252323",
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  topButtonText: {
    fontFamily: "Arial",
    fontWeight: "600",
    fontSize: 16,
    color: "#AF125A",
  },
  buttonContent: {
    flexDirection: "row",
    gap: 15,
    alignItems: "center",
  },

  // Quick Stats
  quickStatsRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 24,
    gap: 16,
  },
  streakContainer: {
    flex: 1,
    maxWidth: (width - 48) / 2,
  },
  weeklyProgressContainer: {
    flex: 1,
    maxWidth: (width - 48) / 2,
    backgroundColor: "#1a1a1a",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#333333",
  },
  statTitle: {
    fontSize: 14,
    color: "#888888",
    fontFamily: "Arial",
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#AF125A",
    fontFamily: "Arial",
    marginBottom: 4,
  },
  statSubtitle: {
    fontSize: 12,
    color: "#666666",
    fontFamily: "Arial",
  },

  // Session Recap
  sessionRecapContainer: {
    marginBottom: 24,
    alignItems: "center",
  },

  // Quick Actions
  quickActionsContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#f5f1ed",
    fontFamily: "Arial",
    marginBottom: 16,
    textAlign: "center",
  },
  quickActionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 12,
  },
  quickActionButton: {
    backgroundColor: "#1a1a1a",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#333333",
    width: (width - 48) / 2 - 6,
    minHeight: 90,
    justifyContent: "center",
  },
  quickActionEmoji: {
    fontSize: 24,
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#f5f1ed",
    fontFamily: "Arial",
  },

  // Motivation
  motivationContainer: {
    backgroundColor: "#1a1a1a",
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#AF125A",
    borderStyle: "dashed",
  },
  motivationTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#AF125A",
    fontFamily: "Arial",
    marginBottom: 12,
    textAlign: "center",
  },
  motivationText: {
    fontSize: 14,
    color: "#cccccc",
    fontFamily: "Arial",
    textAlign: "center",
    lineHeight: 20,
    fontStyle: "italic",
  },

  // Action Button (Fixed)
  actionButtonContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
    marginBottom: 32, // extra space at the very bottom
  },

  sessionInfoContainer: {
    backgroundColor: "#1a1a1a",
    borderRadius: 16,
    padding: 20,
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
    width: 8,
    height: 8,
    backgroundColor: "#AF125A",
    borderRadius: 4,
    marginRight: 8,
  },
  sessionText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#f5f1ed",
    fontFamily: "Arial",
  },
  sessionIdText: {
    fontSize: 12,
    color: "#888888",
    fontFamily: "Arial",
    textAlign: "center",
    marginBottom: 16,
  },
  sessionActions: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  pauseButton: {
    backgroundColor: "#AF125A",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  pauseButtonText: {
    color: "#f5f1ed",
    fontWeight: "600",
    fontSize: 14,
  },
});

export default WorkoutScreen;
