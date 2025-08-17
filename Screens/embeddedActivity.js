import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { supabase } from "../lib/supabase";
import ViewAvatar from "../components/viewAvatar";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

const EmbeddedActivityFeed = ({ navigation, userId, maxItems = 3 }) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      loadActivityFeed();
    }
  }, [userId]);

  const loadActivityFeed = async () => {
    try {
      setLoading(true);
      console.log("Loading activity feed for userId:", userId);

      const { data, error } = await supabase.rpc("get_activity_feed", {
        p_user_id: userId,
        p_limit: maxItems,
      });

      if (error) {
        console.error("RPC Error:", error);
        throw error;
      }

      console.log("Activity feed data:", data);
      setActivities(data || []);
    } catch (error) {
      console.error("Error loading activity feed:", error);
    } finally {
      setLoading(false);
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
          <Text style={styles.activityTitle}>
            completed a {activity_data.workout_duration || "?"} minute workout
            {activity_data.exercise_title &&
              ` - "${activity_data.exercise_title}"`}
          </Text>
        );

      case "streak_milestone":
        return (
          <Text style={styles.activityTitle}>
            reached a {activity_data.streak_days} day streak! 🔥
          </Text>
        );

      case "level_up":
        return (
          <Text style={styles.activityTitle}>
            leveled up to Level {activity_data.new_level}! 🎉
          </Text>
        );

      case "badge_earned":
        return (
          <Text style={styles.activityTitle}>
            earned the "{activity_data.badge_name}" badge! ⭐
          </Text>
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
        onPress={() => {
          if (navigation) {
            navigation.navigate("viewProfile", {
              userId: activity.user_id,
              username: activity.username,
            });
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
            <MaterialIcons name={icon.name} size={16} color={icon.color} />
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
        <ActivityIndicator size="small" color="#007bff" />
        <Text style={styles.loadingText}>Loading activities...</Text>
      </View>
    );
  }

  if (activities.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <MaterialIcons name="people-outline" size={32} color="grey" />
        <Text style={styles.emptyTitle}>No recent activity</Text>
        <Text style={styles.emptySubtitle}>
          Follow friends to see their activities here!
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      nestedScrollEnabled={true}
    >
      {activities.map(renderActivityItem)}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    maxHeight: 300,
  },
  activityItem: {
    backgroundColor: "#0d1117",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#333",
  },
  activityHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatarContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    overflow: "hidden",
    marginRight: 10,
  },
  userDetails: {
    flex: 1,
  },
  username: {
    fontSize: 14,
    fontWeight: "bold",
    color: "white",
  },
  timestamp: {
    fontSize: 11,
    color: "grey",
    marginTop: 1,
  },
  activityIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  activityContent: {
    marginLeft: 42, // Align with username
  },
  activityTitle: {
    fontSize: 13,
    color: "white",
    lineHeight: 18,
  },
  loadingContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    color: "grey",
    marginLeft: 8,
    fontSize: 14,
  },
  emptyContainer: {
    alignItems: "center",
    padding: 30,
  },
  emptyTitle: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 10,
    marginBottom: 4,
  },
  emptySubtitle: {
    color: "grey",
    fontSize: 12,
    textAlign: "center",
    lineHeight: 16,
  },
});

export default EmbeddedActivityFeed;
