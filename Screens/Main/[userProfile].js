import React, { useLayoutEffect } from "react";
import { View, Text, StyleSheet, ScrollView, Image } from "react-native";
import ViewAvatar from "../../components/viewAvatar";

const UserProfile = ({ route, navigation }) => {
  const { username, full_name, goal, avatar_url } = route.params;

  useLayoutEffect(() => {
    navigation.setOptions({ title: username });
  }, [navigation, username]);

  return (
    <View style={styles.container}>
      <ScrollView style={{ width: "100%", height: "100%" }}>
        <View style={styles.topSectionContainer}>
          <View style={styles.pfp}>
            <ViewAvatar url={avatar_url} />
          </View>
          <View style={styles.topSectionText}>
            <Text style={{ fontSize: 24, color: "white" }}>@{username}</Text>
            <Text style={{ fontSize: 14, color: "grey" }}>{full_name}</Text>
            <Text style={{ fontSize: 14, color: "grey" }}>"{goal}"</Text>
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
    borderColor: "#3C3939",
    borderWidth: 1,
    width: "100%",
    alignItems: "center",
    flexDirection: "row",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
    gap: 20,
  },
  pfp: {
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 100,
    width: 75,
    height: 75,
  },
  topSectionText: {
    gap: 1,
  },
});
export default UserProfile;
