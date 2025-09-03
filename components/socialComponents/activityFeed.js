import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { supabase } from "../../lib/supabase";
import ViewAvatar from "../viewAvatar";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

const ActivityFeed = ({ navigation, userId }) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (userId) {
      loadActivityFeed();
    }
  }, [userId]);

  const loadActivityFeed = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const { data, error } = await supabase.rpc("get_activity_feed", {
        p_user_id: userId,
        p_limit: 50,
      });

      if (error) throw error;
      setActivities(data || []);
    } catch (error) {
      console.error("Error loading activity feed:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  const findSessionByActivity = async (activity) => {
    try {
      const activityTime = new Date(activity.created_at);
      const searchStart = new Date(activityTime.getTime() - 60 * 60 * 1000); // 1 hour before
      const searchEnd = new Date(activityTime.getTime() + 5 * 60 * 1000); // 5 minutes after

      //console.log("Activity time:", activityTime.toISOString());
      //console.log("User ID:", activity.user_id);

      const { data, error } = await supabase
        .from("workout_sessions")
        .select("id, started_at, ended_at, exercise_title, user_id")
        .eq("user_id", activity.user_id)
        .gte("started_at", searchStart.toISOString())
        .lte("started_at", searchEnd.toISOString())
        .order("started_at", { ascending: false });

      if (error) {
        console.error("❌ Supabase error:", error);
        throw error;
      }

      console.log("📊 Found sessions:", data?.length || 0);
      if (data && data.length > 0) {
        //console.log("Sessions found:", JSON.stringify(data, null, 2));

        const session = data[0];
        console.log("✅ Using most recent session! Session ID:", session.id);
        return session.id;
      } else {
        //console.log("❌ No sessions found in time range");

        const { data: allSessions } = await supabase
          .from("workout_sessions")
          .select("id, started_at, ended_at, exercise_title")
          .eq("user_id", activity.user_id)
          .order("started_at", { ascending: false })
          .limit(5);

        /*console.log(
          "📋 Recent sessions for user:",
          JSON.stringify(allSessions, null, 2)
        );*/
      }

      return null;
    } catch (error) {
      console.error("❌ Error finding session:", error);
      return null;
    }
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const activityTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now - activityTime) / (1000 * 60));

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const getActivityIcon = (activityType) => {
    switch (activityType) {
      case "workout_completed":
        return { name: "fitness-center", color: "#28a745" };
      case "streak_milestone":
        return { name: "local-fire-department", color: "#ff6b35" };
      case "level_up":
        return { name: "trending-up", color: "#007bff" };
      case "badge_earned":
        return { name: "star", color: "#ffd700" };
      default:
        return { name: "notifications", color: "#6c757d" };
    }
  };

  const renderActivityContent = (activity) => {
    const { activity_type, activity_data } = activity;

    switch (activity_type) {
      case "workout_completed":
        return (
          <View>
            <Text style={styles.activityTitle}>
              completed a {activity_data.workout_duration || "?"} minute workout
            </Text>
            {activity_data.exercise_title && (
              <Text style={styles.activitySubtitle}>
                "{activity_data.exercise_title}"
              </Text>
            )}
            <Text style={styles.xpText}>
              +{activity_data.xp_earned || 50} XP earned
            </Text>
          </View>
        );

      case "streak_milestone":
        return (
          <View>
            <Text style={styles.activityTitle}>
              reached a {activity_data.streak_days} day streak! 🔥
            </Text>
            <Text style={styles.xpText}>
              +{activity_data.xp_earned || 0} XP bonus
            </Text>
          </View>
        );

      case "level_up":
        return (
          <View>
            <Text style={styles.activityTitle}>
              leveled up to Level {activity_data.new_level}! 🎉
            </Text>
            <Text style={styles.activitySubtitle}>
              Total XP: {activity_data.total_xp || 0}
            </Text>
          </View>
        );

      case "badge_earned":
        return (
          <View>
            <Text style={styles.activityTitle}>
              earned the "{activity_data.badge_name}" badge! ⭐
            </Text>
            <Text style={styles.activitySubtitle}>
              {activity_data.badge_description}
            </Text>
          </View>
        );

      default:
        return <Text style={styles.activityTitle}>had some activity</Text>;
    }
  };

  const renderActivityItem = (activity) => {
    const icon = getActivityIcon(activity.activity_type);

    return (
      <TouchableOpacity
        key={activity.activity_id}
        style={styles.activityItem}
        onPress={async () => {
          //console.log("=== DEBUGGING ACTIVITY CLICK ===");
          /*console.log(
            "Full activity object:",
            JSON.stringify(activity, null, 2)
          );*/
          //console.log("activity.session_id:", activity.session_id);
          //console.log("activity.activity_data:", activity.activity_data);
          //console.log("================================");

          if (navigation) {
            if (activity.session_id) {
              console.log("✅ Navigating to session:", activity.session_id);
              navigation.navigate("SessionDetail", {
                sessionId: activity.session_id,
              });
              return;
            }

            if (activity.activity_type === "workout_completed") {
              console.log("❌ No session_id found, trying fallback method...");
              const foundSessionId = await findSessionByActivity(activity);
              if (foundSessionId) {
                console.log("✅ Found session via fallback:", foundSessionId);
                navigation.navigate("SessionDetail", {
                  sessionId: foundSessionId,
                });
              } else {
                //console.log("❌ Could not find session for this activity");
                //console.log("Activity created at:", activity.created_at);
                //console.log("Activity user_id:", activity.user_id);

                //console.log("=== FALLBACK SEARCH DETAILS ===");
                const activityTime = new Date(activity.created_at);
                const searchStart = new Date(
                  activityTime.getTime() - 60 * 60 * 1000
                );
                const searchEnd = new Date(
                  activityTime.getTime() + 5 * 60 * 1000
                );
                /*console.log(
                  "Search window:",
                  searchStart.toISOString(),
                  "to",
                  searchEnd.toISOString()
                );*/
              }
            } else {
              console.log(
                "ℹ️  Activity type doesn't support navigation:",
                activity.activity_type
              );
            }
          }
        }}
      >
        <View style={styles.activityHeader}>
          <View style={styles.userInfo}>
            <View style={styles.avatarContainer}>
              <ViewAvatar url={activity.avatar_url} />
            </View>
            <View style={styles.userDetails}>
              <Text style={styles.username}>@{activity.username}</Text>
              <Text style={styles.timestamp}>
                {formatTimeAgo(activity.created_at)}
              </Text>
            </View>
          </View>
          <View
            style={[
              styles.activityIcon,
              { backgroundColor: icon.color + "20" },
            ]}
          >
            <MaterialIcons name={icon.name} size={20} color={icon.color} />
          </View>
        </View>

        <View style={styles.activityContent}>
          {renderActivityContent(activity)}
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Loading activity feed...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => loadActivityFeed(true)}
          tintColor="#007bff"
        />
      }
    >
      <View style={styles.header}>
        <MaterialIcons name="dynamic-feed" size={24} color="#007bff" />
        <Text style={styles.headerTitle}>Friend Activity</Text>
      </View>

      {activities.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialIcons name="people-outline" size={48} color="grey" />
          <Text style={styles.emptyTitle}>No activity yet</Text>
          <Text style={styles.emptySubtitle}>
            Follow some friends to see their workout activities here!
          </Text>
        </View>
      ) : (
        <View style={styles.activitiesList}>
          {activities.map(renderActivityItem)}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
    marginLeft: 8,
  },
  activitiesList: {
    padding: 16,
  },
  activityItem: {
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#333",
  },
  activityHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: "hidden",
    marginRight: 12,
  },
  userDetails: {
    flex: 1,
  },
  username: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
  },
  timestamp: {
    fontSize: 12,
    color: "grey",
    marginTop: 2,
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  activityContent: {
    marginLeft: 52, // Align with username
  },
  activityTitle: {
    fontSize: 14,
    color: "white",
    marginBottom: 4,
  },
  activitySubtitle: {
    fontSize: 12,
    color: "grey",
    marginBottom: 4,
    fontStyle: "italic",
  },
  xpText: {
    fontSize: 12,
    color: "#28a745",
    fontWeight: "600",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "black",
  },
  loadingText: {
    color: "grey",
    marginTop: 12,
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    color: "grey",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
});

export default ActivityFeed;
