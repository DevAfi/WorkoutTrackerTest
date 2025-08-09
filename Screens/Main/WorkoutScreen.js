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
        <TouchableOpacity
          style={styles.topButton}
          onPress={() => navigation.navigate("allWorkoutsScreen")}
        >
          <Text style={styles.topButtonText}>Workouts</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.topButton}
          onPress={() => navigation.navigate("viewExercises")}
        >
          <Text style={styles.topButtonText}>View Exercises</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.nonAbsoluteContainer}>
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
    justifyContent: "space-around",
  },
  titleText: {
    fontSize: 24,
    fontWeight: "bold",
    marginVertical: 10,
    color: "#f5f1ed",
    fontFamily: "Arial",
  },
  topButtonsContainer: {
    //backgroundColor: "red",
    flexDirection: "row",
    justifyContent: "space-evenly",
    gap: 10,
    position: "absolute",
    top: 0,
  },
  topButton: {
    backgroundColor: "#0D0C0C",
    height: 50,
    width: 190,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 15,
  },
  topButtonText: {
    fontFamily: "Arial",
    fontWeight: "600",
    fontSize: 20,
    color: "#AF125A",
  },
  nonAbsoluteContainer: {
    flexDirection: "collumn",
    justifyContent: "space-evenly",
    gap: "25%",
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
    position: "absolute",
    bottom: 90,
  },
});

export default WorkoutScreen;
