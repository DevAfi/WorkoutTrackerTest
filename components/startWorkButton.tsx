import React, { useState } from "react";
import {
  View,
  TextInput,
  Button,
  ActivityIndicator,
  Alert,
} from "react-native";
import { supabase } from "../lib/supabase";
import { useNavigation } from "@react-navigation/native";

const StartWorkButton = ({
  onSessionCreated,
}: {
  onSessionCreated: (id: string) => void;
}) => {
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  const startWorkout = async () => {
    setLoading(true);

    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData?.user) {
      Alert.alert(
        "Authentication Error",
        "You must be logged in to start a workout."
      );
      setLoading(false);
      return null;
    }

    const { data, error } = await supabase
      .from("workout_sessions")
      .insert([{ user_id: userData.user.id }])
      .select()
      .single();

    setLoading(false);

    if (error) {
      console.error("Session creation error:", error.message);
      Alert.alert("Error", "Could not start workout. Try again.");
      return null;
    }

    onSessionCreated(data.id);
    return data.id;
  };

  return (
    <View>
      {loading ? (
        <ActivityIndicator />
      ) : (
        <Button
          title="Start Workout"
          onPress={async () => {
            const sessionId = await startWorkout(); // Modify startWorkout to return sessionId
            if (sessionId) {
              navigation.navigate("currentWorkoutScreen", { sessionId });
            }
          }}
        />
      )}
    </View>
  );
};

export default StartWorkButton;
