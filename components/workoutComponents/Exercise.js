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
import Set from "./Set";

export default function Exercise() {
  let numberOfSets = 0;

  const addSet = () => {
    // THIS FUNCTION ADDS A SET TO THIS EXERCISE
  };
  return (
    <View style={styles.container}>
      <Set numberOfSets />
    </View>
  );
}

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
