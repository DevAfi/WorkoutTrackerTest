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
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topButtonsContainer}>
        <TouchableOpacity style={styles.topButton}>
          <Text
            style={styles.topButtonText}
            onPress={() => console.log("PrePackaged workouts")}
          >
            Workouts
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.topButton}
          onPress={() => console.log("custom workouts")}
        >
          <Text style={styles.topButtonText}>View Exercises</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#252323",
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

export default workoutHub;
