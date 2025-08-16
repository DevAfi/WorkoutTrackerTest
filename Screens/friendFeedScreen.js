import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
} from "react-native";
import { useRoute } from "@react-navigation/native";
import { supabase } from "../lib/supabase";
import ViewAvatar from "../components/viewAvatar";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

const FriendsActivityScreen = ({ navigation }) => {
  const route = useRoute();
  const { userId } = route.params || {};

  console.log("FriendsActivityScreen - userId from route params:", userId);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedActivities, setExpandedActivities] = useState({});

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

      const enrichedActivities = await Promise.all(
        (data || []).map(async (activity) => {
          if (
            activity.activity_type === "workout_completed" &&
            activity.activity_data?.workout_id
          ) {
            try {
              const { data: workoutData, error: workoutError } = await supabase
                .from("workout_sessions")
                .select(
                  `
                  *,
                  workout_exercises (
                    *,
                    exercises (name, category, equipment),
                    sets (*)
                  )
                `
                )
                .eq("id", activity.activity_data.workout_id)
                .single();

              if (!workoutError && workoutData) {
                if (workoutData.workout_exercises) {
                  workoutData.workout_exercises.sort(
                    (a, b) => a.order_index - b.order_index
                  );
                  workoutData.workout_exercises.forEach((exercise) => {
                    exercise.sets.sort((a, b) => a.set_number - b.set_number);
                  });
                }
                activity.workout_details = workoutData;
              }
            } catch (err) {
              console.error("Error fetching workout details:", err);
            }
          }
          return activity;
        })
      );

      setActivities(enrichedActivities);
    } catch (error) {
      console.error("Error loading activity feed:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
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

  const formatDuration = (startedAt, endedAt) => {
    if (!startedAt || !endedAt) return "0m";

    const startTime = new Date(startedAt);
    const endTime = new Date(endedAt);
    const diffMs = endTime - startTime;
    const diffMinutes = Math.round(diffMs / (1000 * 60));

    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
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

  const toggleActivityExpansion = (activityId) => {
    setExpandedActivities((prev) => ({
      ...prev,
      [activityId]: !prev[activityId],
    }));
  };

  const calculateWorkoutStats = (workoutExercises) => {
    if (!workoutExercises) return {};

    const totalSets = workoutExercises.reduce(
      (total, exercise) => total + exercise.sets.length,
      0
    );

    const totalWeight = workoutExercises.reduce(
      (total, exercise) =>
        total +
        exercise.sets.reduce(
          (exerciseTotal, set) =>
            exerciseTotal + (set.weight || 0) * (set.reps || 0),
          0
        ),
      0
    );

    const totalReps = workoutExercises.reduce(
      (total, exercise) =>
        total +
        exercise.sets.reduce(
          (exerciseTotal, set) => exerciseTotal + (set.reps || 0),
          0
        ),
      0
    );

    return { totalSets, totalWeight, totalReps };
  };

  const renderWorkoutDetails = (activity) => {
    const { workout_details } = activity;
    if (!workout_details || !expandedActivities[activity.activity_id])
      return null;

    const stats = calculateWorkoutStats(workout_details.workout_exercises);

    return (
      <View style={styles.workoutDetailsContainer}>
        <View style={styles.workoutSummary}>
          <View style={styles.workoutStatItem}>
            <Text style={styles.workoutStatNumber}>
              {formatDuration(
                workout_details.started_at,
                workout_details.ended_at
              )}
            </Text>
            <Text style={styles.workoutStatLabel}>Duration</Text>
          </View>

          <View style={styles.workoutStatItem}>
            <Text style={styles.workoutStatNumber}>
              {workout_details.workout_exercises?.length || 0}
            </Text>
            <Text style={styles.workoutStatLabel}>Exercises</Text>
          </View>

          <View style={styles.workoutStatItem}>
            <Text style={styles.workoutStatNumber}>{stats.totalSets}</Text>
            <Text style={styles.workoutStatLabel}>Sets</Text>
          </View>

          <View style={styles.workoutStatItem}>
            <Text style={styles.workoutStatNumber}>
              {Math.round(stats.totalWeight).toLocaleString()}
            </Text>
            <Text style={styles.workoutStatLabel}>Total lbs</Text>
          </View>
        </View>

        {workout_details.workout_exercises?.map((workoutExercise, index) => (
          <View key={workoutExercise.id} style={styles.exerciseItem}>
            <View style={styles.exerciseHeader}>
              <Text style={styles.exerciseName}>
                {workoutExercise.exercises.name}
              </Text>
              <Text style={styles.exerciseCategory}>
                {workoutExercise.exercises.category}
              </Text>
            </View>

            <View style={styles.setsContainer}>
              {workoutExercise.sets.map((set, setIndex) => (
                <View key={set.id} style={styles.setRow}>
                  <Text style={styles.setNumber}>{set.set_number}</Text>
                  <Text style={styles.setDetails}>
                    {set.weight ? `${set.weight} lbs` : "BW"} × {set.reps || 0}
                    {set.rpe && ` • RPE ${set.rpe}`}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        ))}
      </View>
    );
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

            {activity.workout_details && (
              <TouchableOpacity
                style={styles.expandButton}
                onPress={() => toggleActivityExpansion(activity.activity_id)}
              >
                <Text style={styles.expandButtonText}>
                  {expandedActivities[activity.activity_id]
                    ? "Hide Details"
                    : "View Workout Details"}
                </Text>
                <MaterialIcons
                  name={
                    expandedActivities[activity.activity_id]
                      ? "expand-less"
                      : "expand-more"
                  }
                  size={16}
                  color="#007bff"
                />
              </TouchableOpacity>
            )}
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
      <View key={activity.activity_id} style={styles.activityItem}>
        <TouchableOpacity
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
              <MaterialIcons name={icon.name} size={20} color={icon.color} />
            </View>
          </View>
        </TouchableOpacity>

        <View style={styles.activityContent}>
          {renderActivityContent(activity)}
          {renderWorkoutDetails(activity)}
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007bff" />
          <Text style={styles.loadingText}>Loading friend activities...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation?.goBack()}
          style={styles.backButton}
        >
          <MaterialIcons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <MaterialIcons name="dynamic-feed" size={24} color="#007bff" />
        <Text style={styles.headerTitle}>Friend Activity</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadActivityFeed(true)}
            tintColor="#007bff"
          />
        }
      >
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
    </SafeAreaView>
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
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
    marginLeft: 8,
    flex: 1,
  },
  headerSpacer: {
    width: 24,
  },
  scrollView: {
    flex: 1,
  },
  activitiesList: {
    padding: 16,
  },
  activityItem: {
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
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
    marginLeft: 52,
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
  expandButton: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    paddingVertical: 4,
  },
  expandButtonText: {
    color: "#007bff",
    fontSize: 12,
    fontWeight: "600",
    marginRight: 4,
  },
  workoutDetailsContainer: {
    marginTop: 12,
    backgroundColor: "#0d1117",
    borderRadius: 8,
    padding: 12,
  },
  workoutSummary: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  workoutStatItem: {
    flex: 1,
    alignItems: "center",
  },
  workoutStatNumber: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#f5f1ed",
  },
  workoutStatLabel: {
    fontSize: 10,
    color: "#888",
    marginTop: 2,
  },
  exerciseItem: {
    backgroundColor: "#1a1a1a",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  exerciseHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  exerciseName: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#f5f1ed",
    flex: 1,
  },
  exerciseCategory: {
    fontSize: 12,
    color: "#007bff",
    fontWeight: "600",
  },
  setsContainer: {
    backgroundColor: "#0d1117",
    borderRadius: 6,
    padding: 8,
  },
  setRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
  },
  setNumber: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#007bff",
    width: 20,
  },
  setDetails: {
    fontSize: 12,
    color: "#f5f1ed",
    marginLeft: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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

export default FriendsActivityScreen;
