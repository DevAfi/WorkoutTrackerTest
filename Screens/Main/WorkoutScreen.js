import * as React from "react";

import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { useState } from "react";
import StartWorkButton from "../../components/startWorkButton";
const WorkoutScreen = ({ navigation }) => {
  const [sessionId, setSessionId] = useState("");

  return (
    <SafeAreaView style={styles.container}>
      <View>
        {!sessionId ? (
          <StartWorkButton onSessionCreated={(id) => setSessionId(id)} />
        ) : (
          <Text>Workout started! Session ID: {sessionId}</Text>
        )}
      </View>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#252323",
    alignItems: "center",
    justifyContent: "space-around",
  },
  titleText: {
    fontSize: 24,
    fontWeight: "bold",
    marginVertical: 10,
    color: "#f5f1ed",
    fontFamily: "Arial",
  },

  calcButton: {
    backgroundColor: "#70798c",
    padding: "30",
    width: "80%",
    alignItems: "center",
    borderRadius: 10,
  },
  calcButtonText: {
    color: "#d0d8c3",
    fontSize: 18,
    fontWeight: "bold",
    fontFamily: "Arial",
  },
});

export default WorkoutScreen;
