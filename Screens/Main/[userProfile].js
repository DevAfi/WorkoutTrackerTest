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

            <Text style={styles.smallTopText}>
              {full_name} | "{goal}"
            </Text>
          </View>
        </View>
        {/* SBD SECTION */}
        <View style={styles.secondSectionContainer}>
          <View style={styles.liftSection}>
            <Text style={styles.liftBigText}>Squat</Text>
            <Text style={styles.liftNumber}>999</Text>
          </View>
          <View style={styles.liftSection}>
            <Text style={styles.liftBigText}>Bench</Text>
            <Text style={styles.liftNumber}>999</Text>
          </View>
          <View style={styles.liftSection}>
            <Text style={styles.liftBigText}>Deadlift</Text>
            <Text style={styles.liftNumber}>999</Text>
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
  secondSectionContainer: {
    borderColor: "#3C3939",
    borderWidth: 1,
    width: "100%",
    alignItems: "center",
    flexDirection: "row",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
    gap: 20,
    marginTop: 10,
    justifyContent: "space-around",
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
  smallTopText: {
    paddingLeft: 20,
    color: "grey",
    fontFamily: "Arial",
  },
  liftSection: {
    alignItems: "center",
  },
  liftBigText: {
    color: "#f5f1ed",
    fontWeight: "600",
    fontFamily: "Arial",
    fontSize: 18,
  },
  liftNumber: {
    color: "#f5f1ed",
    fontWeight: "600",
    fontFamily: "Arial",
    fontSize: 18,
  },
});
export default UserProfile;
