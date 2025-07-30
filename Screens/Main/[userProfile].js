import React, { useLayoutEffect } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";

const UserProfile = ({ route, navigation }) => {
  const { username, full_name, goal } = route.params;

  // Set the screen title dynamically
  useLayoutEffect(() => {
    navigation.setOptions({ title: username });
  }, [navigation, username]);

  return (
    <View style={styles.container}>
      <ScrollView style={{ width: "100%", height: "100%" }}>
        <View style={styles.topSectionContainer}>
          <View style={styles.pfp}>
            <Text style={{ fontSize: 24, fontWeight: "bold" }}>
              {full_name[0]}
            </Text>
          </View>
          <View style={styles.topSectionText}>
            <Text style={{ fontSize: 24, color: "white" }}>@{username}</Text>
            <Text style={{ fontSize: 12, color: "grey" }}>{full_name}</Text>
            <Text style={{ fontSize: 12, color: "grey" }}>Goal: {goal}</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#252323",
    alignItems: "center",
    flexDirection: "column",
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  topSectionContainer: {
    backgroundColor: "#3C3939",
    width: "100%",
    alignItems: "center",
    flexDirection: "row",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
    gap: 20,
  },
  pfp: {
    backgroundColor: "pink",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 100,
    width: 50,
    height: 50,
  },
});
export default UserProfile;
