import React from "react";
import { useState } from "react";
import {
  View,
  SafeAreaView,
  Text,
  Input,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

const Set = (setNumber) => {
  const [reps, setReps] = useState("");
  const [weight, setWeight] = useState("");
  const [RPE, setRPE] = useState("");

  return (
    <View style={styles.container}>
      <Text>{setNumber}</Text>
      <View style={styles.inputContainer}>
        <Input
          label="Weight"
          placeholder="Weight (kg)"
          value={weight}
          autocapitalise={"none"}
          style={styles.inputText}
          onChangeText={(text) => setWeight(text)}
        />
        <Input
          label="Reps"
          placeholder="reps"
          value={reps}
          autocapitalise={"none"}
          style={styles.inputText}
          onChangeText={(text) => setReps(text)}
        />
        <Input
          label="rpe"
          placeholder="RPE"
          value={RPE}
          autocapitalise={"none"}
          style={styles.inputText}
          onChangeText={(text) => setRPE(text)}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    paddingHorizontal: 5,
    paddingVertical: 12,
    flexDirection: "row",
    gap: 5,
  },
  inputContainer: {
    flexDirection: "row",
    gap: 7,
  },
  inputText: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    backgroundColor: "rgba(37, 35, 35, 0.42)",
    color: "#f5f1ed",
    borderRadius: 5,
  },
});

export default Set;
