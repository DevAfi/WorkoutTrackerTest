import React, { useLayoutEffect, useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";

const workoutHub = ({ navigation }) => {
  const [workoutView, setWorkoutView] = useState("Custom");
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topButtonsContainer}>
        <TouchableOpacity
          style={styles.topButton}
          onPress={() => setWorkoutView("premade")}
        >
          <Text style={styles.topButtonText}>Legacy Workouts</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.topButton}
          onPress={() => setWorkoutView("custom")}
        >
          <Text style={styles.topButtonText}>Custom Workouts</Text>
        </TouchableOpacity>
      </View>

      {workoutView == "premade" ? <Text>1</Text> : <Text>2</Text>}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
    alignItems: "center",
    justifyContent: "flex-start",
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
  },
  topButton: {
    backgroundColor: "#252323",
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

export default workoutHub;
