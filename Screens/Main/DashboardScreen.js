import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ScrollView,
  RefreshControl,
} from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { supabase } from "../../lib/supabase";
import ActivityFeed from "../../components/socialComponents/activityFeed";

const DashboardScreen = ({ navigation }) => {
  const [userID, setUserID] = useState("");
  const [userLoading, setUserLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [notifications, setNotifications] = useState(2);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const { data: userData } = await supabase.auth.getUser();
        if (!userData?.user) {
          console.error("No user data found");
          return;
        }
        setUserID(userData.user.id);
      } catch (error) {
        console.error("Error getting user:", error);
      } finally {
        setUserLoading(false);
      }
    })();
  }, []);

  if (userLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#AF125A"
            colors={["#AF125A"]}
            title="Refreshing feed..."
            titleColor="#888888"
          />
        }
      >
        {/* Header */}
        <View style={styles.headerContainer}>
          <View style={styles.headerLeft}>
            <Text style={styles.titleText}>Community</Text>
            <Text style={styles.subtitleText}>
              See what your friends are up to
            </Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity
              onPress={() => navigation.navigate("Notifications")}
              style={styles.iconButton}
            >
              <MaterialIcons name="notifications" size={26} color="#f5f1ed" />
              {notifications > 0 && (
                <View style={styles.notificationBadge}>
                  <Text style={styles.badgeText}>{notifications}</Text>
                </View>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => navigation.navigate("Search")}
              style={styles.iconButton}
            >
              <MaterialIcons name="search" size={26} color="#f5f1ed" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => navigation.navigate("Settings")}
              style={styles.iconButton}
            >
              <MaterialIcons name="settings" size={26} color="#f5f1ed" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Social Actions */}
        <View style={styles.socialActionsContainer}>
          <TouchableOpacity
            style={styles.socialAction}
            onPress={() => navigation.navigate("FriendsList")}
          >
            <MaterialIcons name="person-add" size={20} color="#AF125A" />
            <Text style={styles.socialActionText}>Find Friends</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.socialAction}
            onPress={() => navigation.navigate("CreateChallenge")}
          >
            <MaterialIcons name="emoji-events" size={20} color="#AF125A" />
            <Text style={styles.socialActionText}>Create Challenge</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.socialAction}
            onPress={() => navigation.navigate("Leaderboard")}
          >
            <MaterialIcons name="leaderboard" size={20} color="#AF125A" />
            <Text style={styles.socialActionText}>Leaderboard</Text>
          </TouchableOpacity>
        </View>

        {/* Activity Feed Container */}
        <View style={styles.feedContainer}>
          {userID && <ActivityFeed navigation={navigation} userId={userID} />}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#f5f1ed",
    fontSize: 16,
  },

  // Header
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  titleText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#f5f1ed",
    fontFamily: "Arial",
    marginBottom: 4,
  },
  subtitleText: {
    fontSize: 14,
    color: "#888888",
    fontFamily: "Arial",
  },
  iconButton: {
    position: "relative",
    padding: 6,
  },
  notificationBadge: {
    position: "absolute",
    top: 2,
    right: 2,
    backgroundColor: "#AF125A",
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },

  // Social Actions
  socialActionsContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginBottom: 24,
    gap: 12,
  },
  socialAction: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1a1a1a",
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#333",
    gap: 6,
  },
  socialActionText: {
    color: "#AF125A",
    fontSize: 12,
    fontWeight: "600",
  },

  // Feed Container
  feedContainer: {
    flex: 1,
    paddingHorizontal: 20,
    marginBottom: 40,
  },
});

export default DashboardScreen;
