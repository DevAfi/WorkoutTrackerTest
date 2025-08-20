import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from "react-native";
import { supabase } from "../../lib/supabase";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
const AddNote = ({ sessionId }: { sessionId: string }) => {
  const [note, setNote] = useState(null);
  const [sentiment, setSentiment] = useState(null);
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
      .update({ notes: note, score: sentiment })
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
        placeholderTextColor={"rgb(108, 101, 101)"}
        value={note}
        onChangeText={setNote}
        style={styles.input}
        multiline
      />

      <View style={styles.sentimentContainer}>
        <TouchableOpacity onPress={() => setSentiment(0)}>
          <MaterialIcons
            name="sentiment-very-dissatisfied"
            color={sentiment === 0 ? "#AF125A" : "#ffffff"}
            size={40}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setSentiment(3.5)}>
          <MaterialIcons
            name="sentiment-dissatisfied"
            color={sentiment === 3.5 ? "#AF125A" : "#ffffff"}
            size={40}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setSentiment(5)}>
          <MaterialIcons
            name="sentiment-neutral"
            color={sentiment === 5 ? "#AF125A" : "#ffffff"}
            size={40}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setSentiment(7.5)}>
          <MaterialIcons
            name="sentiment-satisfied"
            color={sentiment === 7.5 ? "#AF125A" : "#ffffff"}
            size={40}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setSentiment(10)}>
          <MaterialIcons
            name="sentiment-satisfied-alt"
            color={sentiment === 10 ? "#AF125A" : "#ffffff"}
            size={40}
          />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        onPress={saveNote}
        disabled={loading}
        style={styles.addButton}
      >
        <Text style={styles.addButtonText}>
          {loading ? "Saving..." : "Save Note"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 10,
    width: "95%",
  },
  input: {
    color: "#f5f1ed",
    padding: 10,
    backgroundColor: "#0D0C0C",
    borderRadius: 8,
    minHeight: 60,
    marginBottom: 8,
    maxHeight: "60.5%",
  },
  sentimentContainer: {
    flexDirection: "row",
    justifyContent: "space-evenly",
  },
  addButton: {
    marginTop: 20,
    backgroundColor: "#1a1a1a",
    padding: 7,
    borderRadius: 5,
    alignItems: "center",
    alignSelf: "center",
    justifyContent: "center",
  },
  addButtonText: {
    color: "#f5f1ed",
    fontFamily: "Arial",
    fontSize: 20,
    fontWeight: "bold",
  },
});

export default AddNote;
