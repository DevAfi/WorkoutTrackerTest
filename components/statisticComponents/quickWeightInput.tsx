import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Alert,
  StyleSheet,
  ActivityIndicator,
  Animated,
} from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { supabase } from "../../lib/supabase";

interface InlineWeightLoggerProps {
  onWeightLogged?: () => void;
}

export default function InlineWeightLogger({
  onWeightLogged,
}: InlineWeightLoggerProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [weight, setWeight] = useState("");
  const [unit, setUnit] = useState<"lbs" | "kg">("lbs");
  const [saving, setSaving] = useState(false);
  const [scaleAnim] = useState(new Animated.Value(1));

  const animatePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePress = () => {
    if (!isExpanded) {
      animatePress();
      setIsExpanded(true);
    }
  };

  const handleSave = async () => {
    if (!weight.trim()) {
      Alert.alert("Error", "Please enter your weight");
      return;
    }

    const weightValue = parseFloat(weight);
    if (isNaN(weightValue) || weightValue <= 0) {
      Alert.alert("Error", "Please enter a valid weight");
      return;
    }

    setSaving(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        Alert.alert("Error", "Please sign in to log weight");
        return;
      }

      const { error: logError } = await supabase.from("weight_logs").insert({
        user_id: user.id,
        weight: weightValue,
        unit,
      });

      if (logError) throw logError;

      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          current_weight: weightValue,
          weight_unit: unit,
        })
        .eq("id", user.id);

      if (profileError) throw profileError;

      Alert.alert("Success! 🎉", `Weight logged: ${weightValue} ${unit}`);
      setWeight("");
      setIsExpanded(false);
      onWeightLogged?.();
    } catch (error) {
      Alert.alert("Error", "Failed to log weight. Please try again.");
      console.error("Weight logging error:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setWeight("");
    setIsExpanded(false);
  };

  if (!isExpanded) {
    return (
      <Animated.View
        style={[styles.quickTool, { transform: [{ scale: scaleAnim }] }]}
      >
        <TouchableOpacity
          style={styles.quickToolButton}
          onPress={handlePress}
          activeOpacity={0.8}
        >
          <MaterialIcons name="monitor-weight" color="#AF125A" size={24} />
          <Text style={styles.quickToolText}>Log Weight</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  }

  return (
    <View style={styles.expandedContainer}>
      <View style={styles.expandedHeader}>
        <MaterialIcons name="monitor-weight" color="#AF125A" size={20} />
        <Text style={styles.expandedTitle}>Quick Log</Text>
      </View>

      <View style={styles.inputRow}>
        <TextInput
          style={styles.weightInput}
          value={weight}
          onChangeText={setWeight}
          placeholder="Enter weight"
          placeholderTextColor="#666"
          keyboardType="numeric"
          autoFocus
          selectTextOnFocus
        />

        <View style={styles.unitToggle}>
          <TouchableOpacity
            style={[
              styles.unitButton,
              unit === "lbs" && styles.unitButtonActive,
            ]}
            onPress={() => setUnit("lbs")}
          >
            <Text
              style={[styles.unitText, unit === "lbs" && styles.unitTextActive]}
            >
              lbs
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.unitButton,
              unit === "kg" && styles.unitButtonActive,
            ]}
            onPress={() => setUnit("kg")}
          >
            <Text
              style={[styles.unitText, unit === "kg" && styles.unitTextActive]}
            >
              kg
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.actionRow}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={handleCancel}
          disabled={saving}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <MaterialIcons name="check" color="#fff" size={16} />
              <Text style={styles.saveButtonText}>Save</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  quickTool: {
    flex: 1,
    backgroundColor: "#1A1A1A",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#2A2A2A",
    overflow: "hidden",
  },
  quickToolButton: {
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 80,
  },
  quickToolText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FFFFFF",
    fontFamily: "Arial",
    marginTop: 8,
  },
  expandedContainer: {
    flex: 1,
    backgroundColor: "#1A1A1A",
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#AF125A",
    padding: 16,
  },
  expandedHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
  },
  expandedTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
    fontFamily: "Arial",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
  },
  weightInput: {
    flex: 1,
    backgroundColor: "#2A2A2A",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  unitToggle: {
    flexDirection: "row",
    backgroundColor: "#2A2A2A",
    borderRadius: 8,
    padding: 2,
  },
  unitButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  unitButtonActive: {
    backgroundColor: "#AF125A",
  },
  unitText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#666",
  },
  unitTextActive: {
    color: "#fff",
  },
  actionRow: {
    flexDirection: "row",
    gap: 8,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#2A2A2A",
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButtonText: {
    color: "#CCCCCC",
    fontSize: 14,
    fontWeight: "600",
  },
  saveButton: {
    flex: 1,
    backgroundColor: "#AF125A",
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 6,
  },
  saveButtonDisabled: {
    backgroundColor: "rgba(175, 18, 90, 0.5)",
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
});
