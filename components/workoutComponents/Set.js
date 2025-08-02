import React from "react";
import { useState } from "react";
import {
  View,
  SafeAreaView,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
} from "react-native";
import { Input } from "@rneui/themed";

const Set = ({ setID }) => {
  const [reps, setReps] = useState(null);
  const [weight, setWeight] = useState("");
  const [RPE, setRPE] = useState("");

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <Text style={styles.setNumberText}>1</Text>
        <TextInput
          placeholder="Weight (kg)"
          value={weight}
          keyboardType="numeric"
          style={styles.inputText}
          onChangeText={(text) => setWeight(text)}
        />
        <TextInput
          placeholder="reps"
          value={reps}
          keyboardType="numeric"
          style={styles.inputText}
          onChangeText={(text) => setReps(text)}
        />
        <TextInput
          label="rpe"
          placeholder="RPE"
          value={RPE}
          keyboardType="numeric"
          style={styles.inputTextShort}
          onChangeText={(text) => setRPE(text)}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    maxWidth: "100%",
    paddingHorizontal: 5,
    paddingVertical: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  inputContainer: {
    flexDirection: "row",
    gap: 10,
    justifyContent: "space-between",
  },
  inputText: {
    fontSize: 18,
    width: 120,
    height: 50,
    fontWeight: "bold",
    textAlign: "center",
    backgroundColor: "rgba(37, 35, 35, 0.42)",
    color: "#f5f1ed",
    borderRadius: 15,
    color: "white",
    marginVertical: 5,
  },
  inputTextShort: {
    fontSize: 18,
    width: 50,
    height: 50,
    fontWeight: "bold",
    textAlign: "center",
    backgroundColor: "rgba(37, 35, 35, 0.42)",
    color: "#f5f1ed",
    borderRadius: 15,
    color: "white",
  },
  setNumberText: {
    fontSize: 20,
    fontWeight: "bold",
    paddingRight: 30,
    color: "white",
  },
});

export default Set;
