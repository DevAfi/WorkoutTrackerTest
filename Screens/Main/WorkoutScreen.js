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
import EndWorkoutButton from "../../components/endWorkButton";
const WorkoutScreen = ({ navigation }) => {
  const [sessionId, setSessionId] = useState("");

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topButtonsContainer}>
        <Text style={styles.titleText}>
          ---------------------------------------------
        </Text>
      </View>
      <View style={styles.dateContainer}>
        <Text style={styles.titleText}>
          ---------------------------------------------
        </Text>
      </View>
      <View style={styles.streakContainer}>
        <Text style={styles.titleText}>
          ---------------------------------------------
        </Text>
      </View>
      <View style={styles.activityContainer}>
        <Text style={styles.titleText}>
          ---------------------------------------------
        </Text>
      </View>
      <View style={styles.startButton}>
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
    justifyContent: "space-evenly",
  },
  titleText: {
    fontSize: 24,
    fontWeight: "bold",
    marginVertical: 10,
    color: "#f5f1ed",
    fontFamily: "Arial",
  },
  topButtonsContainer: {
    backgroundColor: "red",
  },
  dateContainer: {
    backgroundColor: "red",
  },
  streakContainer: {
    backgroundColor: "red",
  },
  activityContainer: {
    backgroundColor: "red",
  },
  startButton: {
    marginTop: 100,
  },
});

export default WorkoutScreen;
