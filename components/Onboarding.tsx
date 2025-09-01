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
} from "react-native";
import { Button, Input, Slider } from "@rneui/themed";
import { Session } from "@supabase/supabase-js";
import { useNavigation } from "@react-navigation/native";
import ViewAvatar from "./viewAvatar";

export default function Onboarding({ session }: { session: Session }) {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [weeklyGoal, setWeeklyGoal] = useState(3);
  const [monthlyGoal, setMonthlyGoal] = useState(12);
  const [name, setName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [initialLoad, setInitialLoad] = useState(false);

  useEffect(() => {
    if (session) getProfile();
  }, [session]);

  useEffect(() => {
    setMonthlyGoal(weeklyGoal * 4);
  }, [weeklyGoal]);

  async function getProfile() {
    try {
      setInitialLoad(true);
      if (!session?.user) throw new Error("No user on the session!");

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select(`avatar_url, full_name`)
        .eq("id", session?.user.id)
        .single();

      if (profileError && profileError.code !== "PGRST116") {
        console.log("Profile error:", profileError);
      }

      if (profileData) {
        setAvatarUrl(profileData.avatar_url || "");
        setName(profileData.full_name || "");
      }
    } catch (error) {
      console.log("Error getting profile:", error);
    } finally {
      setInitialLoad(false);
    }
  }

  async function setupGoals() {
    try {
      setLoading(true);
      if (!session?.user) {
        Alert.alert("Error", "No user session found");
        return;
      }

      const updates = {
        user_id: session.user.id,
        weekly_workout_goal: weeklyGoal,
        monthly_workout_goal: monthlyGoal,
        updated_at: new Date(),
      };

      const { error } = await supabase.from("user_misc_data").upsert(updates, {
        onConflict: "user_id",
      });

      if (error) {
        throw error;
      }

      setTimeout(() => {
        navigation.navigate("Tabs");
      }, 500);
    } catch (error) {
      console.error("Error setting up goals:", error);
      Alert.alert("Error", "Failed to save your goals. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (initialLoad) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Setting things up...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <TouchableWithoutFeedback>
      <SafeAreaView style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.headerText}>Almost Done! 🎯</Text>
            <Text style={styles.subHeaderText}>
              Set your workout goals to stay motivated
            </Text>
          </View>

          <View style={styles.avatarContainer}>
            <ViewAvatar
              size={80}
              url={avatarUrl}
              onUpload={(url: string) => setAvatarUrl(url)}
            />
            {name && (
              <Text style={styles.nameText}>Hey {name.split(" ")[0]}! 👋</Text>
            )}
          </View>

          <View style={styles.goalsContainer}>
            <View style={styles.goalCard}>
              <Text style={styles.goalLabel}>Weekly Goal</Text>
              <Text style={styles.goalValue}>{weeklyGoal} workouts</Text>
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
              />
              <View style={styles.sliderLabels}>
                <Text style={styles.sliderLabelText}>1/week</Text>
                <Text style={styles.sliderLabelText}>7/week</Text>
              </View>
            </View>

            <View style={styles.goalCard}>
              <Text style={styles.goalLabel}>Monthly Goal</Text>
              <Text style={styles.goalValue}>{monthlyGoal} workouts</Text>
              <Text style={styles.autoText}>
                Auto-calculated from weekly goal
              </Text>
            </View>

            <View style={styles.motivationCard}>
              <Text style={styles.motivationText}>
                {weeklyGoal <= 2 && "Starting strong! Every workout counts."}
                {weeklyGoal >= 3 &&
                  weeklyGoal <= 4 &&
                  "Great balance! You've got this."}
                {weeklyGoal >= 5 &&
                  weeklyGoal <= 6 &&
                  "Ambitious goals! You're dedicated."}
                {weeklyGoal === 7 && "Daily grind mode! Absolute beast."}
              </Text>
            </View>
          </View>

          <View style={styles.buttonContainer}>
            <Button
              title={loading ? "Saving..." : "Let's Go!"}
              onPress={setupGoals}
              disabled={loading}
              buttonStyle={[styles.button, loading && styles.buttonDisabled]}
              titleStyle={styles.buttonText}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#f5f1ed",
    fontSize: 18,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    alignItems: "center",
    marginBottom: 30,
    marginTop: 20,
  },
  headerText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#f5f1ed",
    textAlign: "center",
    marginBottom: 10,
  },
  subHeaderText: {
    fontSize: 16,
    color: "#f5f1ed",
    textAlign: "center",
    opacity: 0.8,
  },
  avatarContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  nameText: {
    fontSize: 20,
    color: "#f5f1ed",
    marginTop: 15,
    fontWeight: "500",
  },
  goalsContainer: {
    flex: 1,
    marginBottom: 20,
  },
  goalCard: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    padding: 25,
    borderRadius: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(175, 18, 90, 0.3)",
  },
  goalLabel: {
    fontSize: 18,
    color: "#f5f1ed",
    fontWeight: "600",
    marginBottom: 10,
  },
  goalValue: {
    fontSize: 28,
    color: "#AF125A",
    fontWeight: "bold",
    marginBottom: 20,
  },
  slider: {
    width: "100%",
    height: 40,
  },
  sliderThumb: {
    backgroundColor: "#AF125A",
    width: 24,
    height: 24,
  },
  sliderTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  sliderLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  sliderLabelText: {
    color: "#f5f1ed",
    fontSize: 12,
    opacity: 0.7,
  },
  autoText: {
    color: "#f5f1ed",
    fontSize: 14,
    opacity: 0.6,
    fontStyle: "italic",
    marginTop: 10,
  },
  motivationCard: {
    backgroundColor: "rgba(175, 18, 90, 0.1)",
    padding: 20,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "rgba(175, 18, 90, 0.3)",
  },
  motivationText: {
    color: "#f5f1ed",
    fontSize: 16,
    textAlign: "center",
    fontWeight: "500",
  },
  buttonContainer: {
    marginTop: 30,
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#AF125A",
    paddingVertical: 18,
    borderRadius: 12,
    elevation: 3,
    shadowColor: "#AF125A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  buttonDisabled: {
    backgroundColor: "rgba(175, 18, 90, 0.5)",
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "bold",
  },
});
