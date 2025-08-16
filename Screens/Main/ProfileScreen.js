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
import ViewAvatar from "../../components/viewAvatar";
import { supabase } from "../../lib/supabase";
import SimpleXPBar from "../../components/GameComponents/simpleProgressBar";
import ActivityFeed from "../../components/socialComponents/activityFeed";

const ProfileScreen = ({ route, navigation }) => {
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState("");
  const [goal, setGoal] = useState("");
  const [fullName, setFullName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState(""); // optional
  const [seeFeed, setSeeFeed] = useState(false);
  const [userID, setUserID] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    setLoading(true);
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      Alert.alert("Error", "Could not get user.");
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("username, goal, full_name, avatar_url")
      .eq("id", user.id)
      .single();

    if (error) {
      Alert.alert("Error loading profile", error.message);
    } else if (data) {
      setUsername(data.username || "loading username...");
      setGoal(data.goal || "loading goal...");
      setFullName(data.full_name || "loading name...");
      setAvatarUrl(data.avatar_url || "loading pfp...");
    }
    setUserID(user.id);
    console.log("UID: ", userID);

    setLoading(false);
  }

  useLayoutEffect(() => {
    navigation.setOptions({ title: username });
  }, [navigation, username]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={{ width: "100%", height: "100%" }}>
        <View style={{ gap: "2.5%" }}>
          <View style={styles.topSectionContainer}>
            <View style={styles.pfp}>
              <ViewAvatar url={avatarUrl} />
            </View>
            <View style={styles.topSectionText}>
              <Text style={{ fontSize: 21, color: "white", width: 255 }}>
                @{username}
              </Text>

              <Text style={styles.smallTopText}>
                {fullName} | "{goal}"
              </Text>
            </View>
          </View>
          <SimpleXPBar userId={userID} compact={true} />
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
        </View>
        {/* Buttons below */}
        <View style={styles.topButtonsContainer}>
          <TouchableOpacity
            style={styles.topButton}
            onPress={() => setSeeFeed(true)}
          >
            <Text style={styles.topButtonText}>Feed</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.topButton}
            onPress={() => setSeeFeed(false)}
          >
            <Text style={styles.topButtonText}>Progress</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
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
    width: 250,
  },
  liftSection: {
    alignItems: "center",
  },
  liftBigText: {
    color: "#f5f1ed",
    fontWeight: "600",
    fontFamily: "Arial",
    fontSize: 20,
  },
  liftNumber: {
    color: "#f5f1ed",
    fontWeight: "200",
    fontFamily: "Arial",
    fontSize: 16,
    paddingTop: 5,
  },
  topButtonsContainer: {
    //backgroundColor: "red",
    flexDirection: "row",
    alignSelf: "center",
    justifyContent: "space-evenly",
    gap: 25,
    paddingTop: 20,
  },
  topButton: {
    backgroundColor: "#333",
    height: "65%",
    width: "45%",
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
export default ProfileScreen;
