import React, { useEffect, useState } from "react";

import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ScrollView,
} from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { supabase } from "../../lib/supabase";
import StreakTracker from "../../components/streakComponent";
import EmbeddedActivityFeed from "../embeddedActivity";
import LatestSessionRecap from "../../components/statisticComponents/LatestSessionRecap";

const DashboardScreen = ({ navigation }) => {
  const [userID, setUserID] = useState("");
  const [userLoading, setUserLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data: userData } = await supabase.auth.getUser();
        if (!userData?.user) {
          console.error("No user data found");
          return;
        }
        console.log("User ID:", userData.user.id);
        setUserID(userData.user.id);
      } catch (error) {
        console.error("Error getting user:", error);
      } finally {
        setUserLoading(false);
      }
    })();
  }, []);

  const handleFriendsActivityPress = () => {
    if (!userID) {
      Alert.alert("Error", "User not loaded yet. Please try again.");
      return;
    }

    console.log("Navigating with userID:", userID);
    navigation.navigate("friendActivity", { userId: userID });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.headerContainer}>
          <Text style={styles.titleText}>Welcome back</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate("Settings")}
            style={styles.settingsButton}
          >
            <MaterialIcons name="settings" size={30} color="#f5f1ed" />
          </TouchableOpacity>
        </View>

        {/* Weekly Activity Section */}
        <View style={styles.topContainer}>
          <MaterialIcons name="home" size={36} color={"white"}></MaterialIcons>
          <Text style={styles.topText}>Weekly Activity</Text>
        </View>

        {/* Streak Tracker */}
        {userID && <StreakTracker userId={userID} />}

        <View style={styles.recapContainer}>
          {/* Uncomment when ready to use LatestSessionRecap */}

          <LatestSessionRecap
            onPress={(session) =>
              navigation.navigate("SessionDetail", { sessionId: session.id })
            }
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },
  scrollView: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 10,
    marginBottom: 20,
  },
  settingsButton: {
    padding: 5,
  },
  titleText: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#f5f1ed",
    fontFamily: "Arial",
  },
  topContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#333",
    padding: 20,
    borderRadius: 10,
    width: "90%",
    alignSelf: "center",
    gap: 20,
    borderColor: "#AF125A",
    borderWidth: 2,
    marginBottom: 20,
  },
  topText: {
    fontSize: 24,
    color: "#f5f1ed",
    fontFamily: "Arial",
  },
  activitySection: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
    marginLeft: 8,
    flex: 1,
  },
  seeAllText: {
    color: "#007bff",
    fontSize: 14,
    fontWeight: "600",
  },
  activityFeedContainer: {
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    maxHeight: 400, // Limit height so it doesn't take over the whole screen
    borderWidth: 1,
    borderColor: "#333",
  },
  loadingActivityContainer: {
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    padding: 40,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#333",
  },
  loadingText: {
    color: "grey",
    fontSize: 16,
  },
  recapContainer: {
    width: "100%",
    alignItems: "center",
    paddingTop: 20,
    paddingBottom: 40,
  },
  // Remove the old styles that are no longer needed
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
  friendsButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#007bff",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  friendsButtonDisabled: {
    backgroundColor: "#666",
  },
  friendsButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default DashboardScreen;
