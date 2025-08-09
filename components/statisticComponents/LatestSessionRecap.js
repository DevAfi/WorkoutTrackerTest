import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { supabase } from "../../lib/supabase";

const LatestSessionRecap = ({ onPress }) => {
  const [latestSession, setLatestSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchLatestSession = async () => {
    try {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: sessionData, error: sessionError } = await supabase
        .from("workout_sessions")
        .select(
          `
          *,
          workout_exercises (
            *,
            exercises (name, category),
            sets (*)
          )
        `
        )
        .eq("user_id", user.id)
        .not("ended_at", "is", null)
        .order("ended_at", { ascending: false })
        .limit(1);

      if (sessionError) throw sessionError;

      if (sessionData && sessionData.length > 0) {
        const session = sessionData[0];

        // Calculates the duration of the exercise, basic maths
        const startTime = new Date(session.started_at);
        const endTime = new Date(session.ended_at);
        const durationMinutes = Math.round((endTime - startTime) / (1000 * 60));

        const processedSession = {
          ...session,
          totalSets: session.workout_exercises.reduce(
            (total, exercise) => total + exercise.sets.length,
            0
          ),
          totalWeight: session.workout_exercises.reduce(
            (total, exercise) =>
              total +
              exercise.sets.reduce(
                (exerciseTotal, set) =>
                  exerciseTotal + (set.weight || 0) * (set.reps || 0),
                0
              ),
            0
          ),
          exerciseCount: session.workout_exercises.length,
          duration: formatDuration(durationMinutes),
          date: formatDate(session.ended_at),
        };

        setLatestSession(processedSession);
      }
    } catch (err) {
      setError(err.message);
      console.error("Error fetching latest session:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (minutes) => {
    if (!minutes || minutes === 0) return "0m";
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (hours > 0) {
      return `${hours}h ${remainingMinutes}m`;
    }
    return `${remainingMinutes}m`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  };

  const getTopExercises = (session) => {
    if (!session?.workout_exercises) return [];

    return session.workout_exercises
      .map((exercise) => ({
        name: exercise.exercises.name,
        sets: exercise.sets.length,
        totalWeight: exercise.sets.reduce(
          (total, set) => total + (set.weight || 0) * (set.reps || 0),
          0
        ),
        maxWeight: Math.max(...exercise.sets.map((set) => set.weight || 0)),
      }))
      .sort((a, b) => b.totalWeight - a.totalWeight)
      .slice(0, 3);
  };

  useEffect(() => {
    fetchLatestSession();
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="small" color="#AF125A" />
        <Text style={styles.loadingText}>Loading latest session...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Error loading session data</Text>
      </View>
    );
  }

  if (!latestSession) {
    return (
      <View style={styles.container}>
        <Text style={styles.noSessionText}>No completed workouts yet</Text>
        <Text style={styles.noSessionSubtext}>
          Start your first workout to see a recap here!
        </Text>
      </View>
    );
  }

  const topExercises = getTopExercises(latestSession);

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onPress && onPress(latestSession)}
      activeOpacity={0.8}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Latest Session</Text>
        <Text style={styles.date}>{latestSession.date}</Text>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{latestSession.duration}</Text>
          <Text style={styles.statLabel}>Duration</Text>
        </View>

        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{latestSession.exerciseCount}</Text>
          <Text style={styles.statLabel}>Exercises</Text>
        </View>

        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{latestSession.totalSets}</Text>
          <Text style={styles.statLabel}>Sets</Text>
        </View>

        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {Math.round(latestSession.totalWeight).toLocaleString()}kg
          </Text>
          <Text style={styles.statLabel}>Total Volume</Text>
        </View>
      </View>

      {topExercises.length > 0 && (
        <View style={styles.topExercises}>
          <Text style={styles.topExercisesTitle}>Top Exercises</Text>
          {topExercises.map((exercise, index) => (
            <View key={index} style={styles.exerciseItem}>
              <Text style={styles.exerciseName}>{exercise.name}</Text>
              <Text style={styles.exerciseStats}>
                {exercise.sets} sets • {exercise.maxWeight}Kg max
              </Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.footer}>
        <Text style={styles.tapToView}>Tap to view full session details</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#333",
    width: "85%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#AF125A",
  },
  date: {
    fontSize: 14,
    color: "#888",
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statNumber: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#f5f1ed",
  },
  statLabel: {
    fontSize: 12,
    color: "#888",
    marginTop: 4,
  },
  topExercises: {
    marginBottom: 12,
  },
  topExercisesTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#f5f1ed",
    marginBottom: 8,
  },
  exerciseItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4,
  },
  exerciseName: {
    fontSize: 14,
    color: "#f5f1ed",
    flex: 1,
  },
  exerciseStats: {
    fontSize: 12,
    color: "#888",
  },
  footer: {
    alignItems: "center",
  },
  tapToView: {
    fontSize: 12,
    color: "#4a9eff",
    fontStyle: "italic",
  },
  loadingText: {
    color: "#888",
    marginTop: 8,
    textAlign: "center",
  },
  errorText: {
    color: "#ff6b6b",
    textAlign: "center",
  },
  noSessionText: {
    color: "#f5f1ed",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 8,
  },
  noSessionSubtext: {
    color: "#888",
    fontSize: 14,
    textAlign: "center",
  },
});

export default LatestSessionRecap;
