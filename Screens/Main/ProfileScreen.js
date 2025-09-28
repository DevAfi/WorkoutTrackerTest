import React, { useLayoutEffect, useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import ViewAvatar from "../../components/viewAvatar";
import { supabase } from "../../lib/supabase";
import SimpleXPBar from "../../components/GameComponents/simpleProgressBar";
import UserActivityFeed from "../../components/socialComponents/userActivityFeed";

const ProfileScreen = ({ route, navigation }) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [username, setUsername] = useState("");
  const [goal, setGoal] = useState("");
  const [fullName, setFullName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [activeTab, setActiveTab] = useState("feed");
  const [userID, setUserID] = useState("");

  const [sbd, setSbd] = useState({
    squat: 0,
    bench: 0,
    deadlift: 0,
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        Alert.alert("Error", "Could not get user.");
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
        setUsername(data.username || "");
        setGoal(data.goal || "");
        setFullName(data.full_name || "");
        setAvatarUrl(data.avatar_url || "");
      }

      setUserID(user.id);

      // GOTTA DO THIS LATER

      // TODO: Fetch actual SBD data from your database
      // const sbdData = await fetchSBDData(user.id);
      // setSbd(sbdData);
    } catch (error) {
      Alert.alert("Error", "Something went wrong loading your profile.");
      console.error("Profile fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchProfile();
    setRefreshing(false);
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      title: username || "Profile",
      headerStyle: {
        backgroundColor: "#000",
      },
      headerTintColor: "#fff",
    });
  }, [navigation, username]);

  const formatWeight = (weight) => {
    return weight > 0 ? `${weight}` : "-";
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#AF125A" />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.contentContainer}>
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <ViewAvatar url={avatarUrl} />
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.username}>@{username}</Text>
              <Text style={styles.userDetails}>
                {fullName}
                {goal && ` • "${goal}"`}
              </Text>
            </View>
          </View>

          <View style={styles.xpContainer}>
            <SimpleXPBar userId={userID} compact={true} />
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Squat</Text>

              <Text style={styles.statValue}>{formatWeight(sbd.squat)}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Bench</Text>
              <Text style={styles.statValue}>{formatWeight(sbd.bench)}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Deadlift</Text>
              <Text style={styles.statValue}>{formatWeight(sbd.deadlift)}</Text>
            </View>
          </View>

          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, activeTab === "feed" && styles.activeTab]}
              onPress={() => setActiveTab("feed")}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === "feed" && styles.activeTabText,
                ]}
              >
                Activity
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === "progress" && styles.activeTab]}
              onPress={() => navigation.navigate("SSC")}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === "progress" && styles.activeTabText,
                ]}
              >
                Progress
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.tabContent}>
            {activeTab === "feed" ? (
              <UserActivityFeed userId={userID} />
            ) : (
              <View style={styles.progressPlaceholder}>
                <Text style={styles.placeholderText}>
                  Progress tracking coming soon!
                </Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    gap: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  loadingText: {
    color: "#888",
    fontSize: 16,
  },
  profileHeader: {
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    borderWidth: 1,
    borderColor: "#333",
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: "hidden",
  },
  profileInfo: {
    flex: 1,
    gap: 4,
  },
  username: {
    fontSize: 22,
    fontWeight: "600",
    color: "#fff",
  },
  userDetails: {
    fontSize: 15,
    color: "#888",
    lineHeight: 20,
  },
  xpContainer: {
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#333",
  },
  statsContainer: {
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#333",
  },
  statItem: {
    alignItems: "center",
    gap: 8,
  },
  statLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  statValue: {
    fontSize: 18,
    fontWeight: "300",
    color: "#AF125A",
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: "#333",
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    padding: 4,
    gap: 4,
    borderWidth: 1,
    borderColor: "#333",
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  activeTab: {
    backgroundColor: "#AF125A",
  },
  tabText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#888",
  },
  activeTabText: {
    color: "#fff",
  },
  tabContent: {
    minHeight: 200,
  },
  progressPlaceholder: {
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    padding: 40,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#333",
  },
  placeholderText: {
    color: "#666",
    fontSize: 16,
    textAlign: "center",
  },
});

export default ProfileScreen;
