import React, { useLayoutEffect } from "react";
import { View, Text, StyleSheet } from "react-native";

const UserProfile = ({ route, navigation }) => {
  const { username, full_name, goal } = route.params;

  // Set the screen title dynamically
  useLayoutEffect(() => {
    navigation.setOptions({ title: username });
  }, [navigation, username]);

  return (
    <View style={styles.container}>
      <View style={styles.topSectionContainer}>
        <Text style={{ fontSize: 24, color: "white" }}>{full_name}</Text>
      </View>

      <Text style={{ fontSize: 18, color: "white" }}>@{username}</Text>
      <Text style={{ fontSize: 16, color: "white" }}>Goal: {goal}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#252323",
    alignItems: "center",
    flexDirection: "column",
  },
  topSectionContainer: {
    backgroundColor: "#3C3939",
    width: "90%",
  },
});
export default UserProfile;
