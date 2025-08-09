import React, { useState, useEffect } from "react";
import { View, TextInput, Button, StyleSheet, Alert } from "react-native";
import { supabase } from "../../lib/supabase";

const AddNote = ({ sessionId }: { sessionId: string }) => {
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  // Optional: Fetch existing note
  useEffect(() => {
    const fetchNote = async () => {
      const { data, error } = await supabase
        .from("workout_sessions")
        .select("notes")
        .eq("id", sessionId)
        .single();

      if (data?.notes) setNote(data.notes);
    };

    if (sessionId) fetchNote();
  }, [sessionId]);

  const saveNote = async () => {
    setLoading(true);
    const { error } = await supabase
      .from("workout_sessions")
      .update({ notes: note })
      .eq("id", sessionId);

    setLoading(false);

    if (error) {
      console.error("Failed to save note:", error);
      Alert.alert("Error", "Could not save note.");
    } else {
      Alert.alert("Note Saved", "Your workout note was saved.");
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Add a workout note..."
        value={note}
        onChangeText={setNote}
        style={styles.input}
        multiline
      />
      <Button
        title={loading ? "Saving..." : "Save Note"}
        color={"#f5f1ed"}
        onPress={saveNote}
        disabled={loading}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 10,
    width: "100%",
  },
  input: {
    color: "#f5f1ed",
    padding: 10,
    backgroundColor: "#0D0C0C",
    borderRadius: 8,
    minHeight: 60,
    marginBottom: 8,
    maxHeight: 280,
  },
});

export default AddNote;
