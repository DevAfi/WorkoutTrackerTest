import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { supabase } from "../../lib/supabase";

const CreateTemplateScreen = ({ navigation }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("Error", "Template name is required.");
      return;
    }

    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData?.user) {
      Alert.alert("Error", "You must be logged in.");
      return;
    }

    const { data, error } = await supabase
      .from("workout_templates")
      .insert([
        {
          created_by: userData.user.id,
          name,
          description,
          category,
          is_public: false,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Error creating template:", error);
      Alert.alert("Error", "Could not create template.");
      return;
    }

    Alert.alert("Success", "Template created!");
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.sav}>
      <ScrollView style={styles.container}>
        <Text style={styles.title}>Create Workout Template</Text>

        <Text style={styles.label}>Template Name</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Push Day"
          placeholderTextColor="#999"
          value={name}
          onChangeText={setName}
        />

        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.multilineInput]}
          placeholder="Short description"
          placeholderTextColor="#999"
          value={description}
          onChangeText={setDescription}
          multiline
        />

        <Text style={styles.label}>Category</Text>
        <TextInput
          style={styles.input}
          placeholder="Strength, Cardio, etc."
          placeholderTextColor="#999"
          value={category}
          onChangeText={setCategory}
        />

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
    padding: 20,
  },
  sav: {
    flex: 1,
    backgroundColor: "black",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#f5f1ed",
    marginBottom: 20,
  },
  label: {
    color: "#f5f1ed",
    fontSize: 16,
    fontWeight: "600",
    marginTop: 15,
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#252323",
    color: "white",
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
  },
  multilineInput: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 40,
    gap: 15,
  },
  saveButton: {
    flex: 1,
    backgroundColor: "#AF125A",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
  },
  saveButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#2A2A2A",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#ccc",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default CreateTemplateScreen;
