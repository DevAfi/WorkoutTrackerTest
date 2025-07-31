import React, { useState } from "react";
import {
  View,
  TextInput,
  Button,
  ActivityIndicator,
  Alert,
} from "react-native";
import { supabase } from "../lib/supabase";

const StartWorkButton = ({
  onSessionCreated,
}: {
  onSessionCreated: (id: string) => void;
}) => {
  const [loading, setLoading] = useState(false);
  const [note, setNote] = useState("");

  const startWorkout = async () => {
    setLoading(true);

    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData?.user) {
      Alert.alert(
        "Authentication Error",
        "You must be logged in to start a workout."
      );
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("workout_sessions")
      .insert([{ user_id: userData.user.id, notes: note || null }])
      .select()
      .single();

    setLoading(false);

    if (error) {
      console.error("Session creation error:", error.message);
      Alert.alert("Error", "Could not start workout. Try again.");
      return;
    }

    onSessionCreated(data.id); // Pass the session ID upward
  };

  return (
    <View>
      <TextInput
        placeholder="Add an optional note..."
        value={note}
        onChangeText={setNote}
        style={{
          borderColor: "#ccc",
          borderWidth: 1,
          padding: 8,
          marginBottom: 10,
        }}
      />
      {loading ? (
        <ActivityIndicator />
      ) : (
        <Button title="Start Workout" onPress={startWorkout} />
      )}
    </View>
  );
};

export default StartWorkButton;
