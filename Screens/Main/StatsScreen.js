import * as React from "react";

import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
const StatsScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topButtonsContainer}>
        <TouchableOpacity style={styles.topButton}>
          <Text style={styles.topButtonText}>Personal</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.topButton}
          onPress={() => navigation.navigate("viewExercises")}
        >
          <Text style={styles.topButtonText}>Exercises</Text>
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
    justifyContent: "space-around",
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
});

export default StatsScreen;
