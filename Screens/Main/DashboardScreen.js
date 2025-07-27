import * as React from "react";

import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
const DashboardScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      {/*  <SafeAreaView style={styles.headerBar}>
        <Text style={styles.headerText}>Hello</Text>
      </SafeAreaView>
    */}
      <Text style={styles.titleText}>Welcome back</Text>
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
  headerBar: {
    width: "100%",
    height: 50,
    backgroundColor: "white",
    position: "absolute",
    top: 10,
  },
  headerText: {
    backgroundColor: "white",
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
export default DashboardScreen;
