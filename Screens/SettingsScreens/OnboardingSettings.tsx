import { useState, useEffect } from "react";
import {
  View,
  Alert,
  StyleSheet,
  SafeAreaView,
  Text,
  TouchableWithoutFeedback,
} from "react-native";
import { Input, Button } from "@rneui/themed";
import { supabase } from "../../lib/supabase";
import { useNavigation } from "@react-navigation/native";
import ViewAvatar from "../../components/viewAvatar";

export default function OnboardSettings() {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [weekGoal, setWeekGoal] = useState("");
  const [monthGoal, setMonthGoal] = useState("");
  const [fullName, setFullName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    fetchProfile();
    fetchUserGoal();
  }, []);

  async function fetchProfile() {
    setLoading(true);
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      Alert.alert("Error", "Could not get user.");
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("full_name, avatar_url")
      .eq("id", user.id)
      .single();

    if (error) {
      Alert.alert("Error loading profile", error.message);
    } else if (data) {
      setFullName(data.full_name || "");
      setAvatarUrl(data.avatar_url || "");
      setEmail(user.email || "");
    }

    setLoading(false);
  }

  const fetchUserGoal = async () => {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      Alert.alert("Error", "Could not get user.");
      setLoading(false);
      return;
    }

    try {
      console.log("Loading data now");
      const { data, error } = await supabase
        .from("user_misc_data")
        .select("weekly_workout_goal, monthly_workout_goal")
        .eq("user_id", user.id)
        .single();

      if (error) {
        console.error("Error fetching user goal:", error);
        if (error.code === "PGRST116") {
          console.log("No user_misc_data found, creating default record");
          const { data: newData, error: insertError } = await supabase
            .from("user_misc_data")
            .insert([
              {
                user_id: user.id,
                weekly_workout_goal: 6,
                monthly_workout_goal: 20,
              },
            ])
            .select("weekly_workout_goal, monthly_workout_goal")
            .single();

          if (insertError) {
            console.error("Error creating user_misc_data:", insertError);
            setWeekGoal("6");
            setMonthGoal("20");
            return;
          }
          setWeekGoal(newData?.weekly_workout_goal?.toString() || "6");
          setMonthGoal(newData?.monthly_workout_goal?.toString() || "20");
          return;
        }
        setWeekGoal("6");
        setMonthGoal("20");
        return;
      }

      console.log("User goal data:", data);
      setWeekGoal(data?.weekly_workout_goal?.toString() || "6");
      setMonthGoal(data?.monthly_workout_goal?.toString() || "20");
    } catch (error) {
      console.error("Error in fetchUserGoal:", error);
      setWeekGoal("6");
      setMonthGoal("20");
    }
  };

  async function handleUpdateProfile() {
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      Alert.alert("Error", "No user found");
      setLoading(false);
      return;
    }

    const updates = {
      user_id: user.id,
      weekly_workout_goal: parseInt(weekGoal) || 6,
      monthly_workout_goal: parseInt(monthGoal) || 20,
      updated_at: new Date(),
    };

    const { error } = await supabase.from("user_misc_data").upsert(updates, {
      onConflict: "user_id",
    });

    if (error) {
      Alert.alert("Error updating goals", error.message);
    } else {
      Alert.alert("Success", "Goals updated!");
    }
    navigation.goBack();
    setLoading(false);
  }

  return (
    <TouchableWithoutFeedback>
      <SafeAreaView style={styles.container}>
        <Text style={styles.headerText}>Edit your goals</Text>
        <View style={styles.inputContainer}>
          <ViewAvatar
            url={avatarUrl}
            size={125}
            onUpload={(url: string) => {
              setAvatarUrl(url);
            }}
          />
          <Input
            label="Email"
            value={email}
            disabled
            style={styles.inputText}
          />
          <Input
            label="Weekly workout goal"
            value={weekGoal}
            onChangeText={setWeekGoal}
            keyboardType="numeric"
            style={styles.inputText}
          />
          <Input
            label="Monthly workout goal"
            value={monthGoal}
            onChangeText={setMonthGoal}
            keyboardType="numeric"
            style={styles.inputText}
          />
        </View>
        <Button
          title={loading ? "Loading..." : "Update Goals"}
          onPress={handleUpdateProfile}
          disabled={loading}
          buttonStyle={styles.button}
        />
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "black",
    flex: 1,
    gap: 20,
  },
  headerText: {
    fontSize: 36,
    fontFamily: "Arial",
    fontWeight: "bold",
    color: "#f5f1ed",
    textAlign: "center",
  },
  inputContainer: {
    paddingVertical: 20,
  },
  button: {
    marginTop: 20,
    backgroundColor: "#AF125A",
  },
  inputText: {
    color: "white",
    paddingVertical: 10,
  },
});
