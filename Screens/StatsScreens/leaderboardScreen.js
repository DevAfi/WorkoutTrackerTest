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
import { supabase } from "../../lib/supabase";
import ViewAvatar from "../../components/viewAvatar";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

const StreakLeaderboard = ({ navigation }) => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    getCurrentUser();
    loadLeaderboard();
  }, []);

  const getCurrentUser = async () => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (userData?.user) {
        setCurrentUserId(userData.user.id);
      }
    } catch (error) {
      console.error("Error getting current user:", error);
    }
  };

  const loadLeaderboard = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const { data, error } = await supabase.rpc("get_streak_leaderboard", {
        p_limit: 100,
      });

      if (error) throw error;
      setLeaderboard(data || []);
    } catch (error) {
      console.error("Error loading streak leaderboard:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    loadLeaderboard(true);
  };

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return "🥇";
      case 2:
        return "🥈";
      case 3:
        return "🥉";
      default:
        return `#${rank}`;
    }
  };

  const getRankColor = (rank) => {
    switch (rank) {
      case 1:
        return "#FFD700";
      case 2:
        return "#C0C0C0";
      case 3:
        return "#CD7F32";
      default:
        return "#666";
    }
  };

  const renderLeaderboardItem = (item, index) => {
    const isCurrentUser = item.user_id === currentUserId;
    const rank = item.rank_position;

    return (
      <TouchableOpacity
        key={item.user_id}
        style={[
          styles.leaderboardItem,
          isCurrentUser && styles.currentUserItem,
        ]}
        onPress={() => {
          navigation.navigate("viewProfile", {
            userId: item.user_id,
            username: item.username,
          });
        }}
      >
        <View style={styles.rankContainer}>
          <Text
            style={[
              styles.rankText,
              { color: getRankColor(rank) },
              rank <= 3 && styles.topThreeRank,
            ]}
          >
            {getRankIcon(rank)}
          </Text>
        </View>

        <View style={styles.avatarContainer}>
          <ViewAvatar url={item.avatar_url} />
          {isCurrentUser && <View style={styles.youBadge} />}
        </View>

        <View style={styles.userInfo}>
          <Text
            style={[styles.username, isCurrentUser && styles.currentUserText]}
          >
            @{item.username}
            {isCurrentUser && <Text style={styles.youText}> (You)</Text>}
          </Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <MaterialIcons
                name="local-fire-department"
                size={16}
                color="#ff6b35"
              />
              <Text style={styles.statText}>
                {item.current_streak} day{item.current_streak !== 1 ? "s" : ""}
              </Text>
            </View>
            <View style={styles.statItem}>
              <MaterialIcons name="emoji-events" size={16} color="#ffd700" />
              <Text style={styles.statText}>Best: {item.longest_streak}</Text>
            </View>
          </View>
        </View>

        <View style={styles.streakContainer}>
          <Text style={styles.currentStreak}>{item.current_streak}</Text>
          <Text style={styles.streakLabel}>streak</Text>
          <Text style={styles.totalWorkouts}>
            {item.total_workouts} workout{item.total_workouts !== 1 ? "s" : ""}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ff6b35" />
          <Text style={styles.loadingText}>Loading streak leaderboard...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color="#f5f1ed" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <MaterialIcons
            name="local-fire-department"
            size={28}
            color="#ff6b35"
          />
          <Text style={styles.headerTitle}>Streak Leaderboard</Text>
        </View>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#ff6b35"
            colors={["#ff6b35"]}
            title="Refreshing leaderboard..."
            titleColor="#888888"
          />
        }
      >
        {leaderboard.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialIcons name="leaderboard" size={64} color="#444" />
            <Text style={styles.emptyTitle}>No streaks yet</Text>
            <Text style={styles.emptyText}>
              Complete daily workouts to start your streak and appear on the
              leaderboard!
            </Text>
          </View>
        ) : (
          <>
            {/* Top 3 Podium */}
            {leaderboard.length >= 3 && (
              <View style={styles.podiumContainer}>
                <Text style={styles.podiumTitle}>🏆 Top Streakers 🏆</Text>
                <View style={styles.podium}>
                  {/* Second Place */}
                  <View style={styles.podiumPosition}>
                    <View style={styles.podiumAvatar}>
                      <ViewAvatar url={leaderboard[1]?.avatar_url} />
                    </View>
                    <Text style={styles.podiumUsername}>
                      @{leaderboard[1]?.username}
                    </Text>
                    <View style={[styles.podiumRank, styles.secondPlace]}>
                      <Text style={styles.podiumRankText}>🥈</Text>
                    </View>
                    <Text style={styles.podiumStreak}>
                      {leaderboard[1]?.current_streak} days
                    </Text>
                  </View>

                  {/* First Place */}
                  <View style={[styles.podiumPosition, styles.firstPlace]}>
                    <View style={styles.podiumAvatar}>
                      <ViewAvatar url={leaderboard[0]?.avatar_url} />
                    </View>
                    <Text style={styles.podiumUsername}>
                      @{leaderboard[0]?.username}
                    </Text>
                    <View style={[styles.podiumRank, styles.firstPlaceRank]}>
                      <Text style={styles.podiumRankText}>🥇</Text>
                    </View>
                    <Text style={styles.podiumStreak}>
                      {leaderboard[0]?.current_streak} days
                    </Text>
                  </View>

                  {/* Third Place */}
                  <View style={styles.podiumPosition}>
                    <View style={styles.podiumAvatar}>
                      <ViewAvatar url={leaderboard[2]?.avatar_url} />
                    </View>
                    <Text style={styles.podiumUsername}>
                      @{leaderboard[2]?.username}
                    </Text>
                    <View style={[styles.podiumRank, styles.thirdPlace]}>
                      <Text style={styles.podiumRankText}>🥉</Text>
                    </View>
                    <Text style={styles.podiumStreak}>
                      {leaderboard[2]?.current_streak} days
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {/* Full Leaderboard */}
            <View style={styles.leaderboardContainer}>
              <Text style={styles.sectionTitle}>Full Rankings</Text>
              {leaderboard.map(renderLeaderboardItem)}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  backButton: {
    padding: 8,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#f5f1ed",
  },
  headerRight: {
    width: 40,
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
    color: "#888",
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
    color: "#f5f1ed",
    fontSize: 20,
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    color: "#888",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },

  podiumContainer: {
    padding: 20,
    marginBottom: 20,
  },
  podiumTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#f5f1ed",
    textAlign: "center",
    marginBottom: 20,
  },
  podium: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "flex-end",
    gap: 10,
  },
  podiumPosition: {
    alignItems: "center",
    flex: 1,
  },
  firstPlace: {
    transform: [{ scale: 1.1 }],
  },
  podiumAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    overflow: "hidden",
    marginBottom: 8,
  },
  podiumUsername: {
    color: "#f5f1ed",
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 8,
    textAlign: "center",
  },
  podiumRank: {
    width: 60,
    height: 40,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  firstPlaceRank: {
    backgroundColor: "#FFD700",
    height: 50,
  },
  secondPlace: {
    backgroundColor: "#C0C0C0",
  },
  thirdPlace: {
    backgroundColor: "#CD7F32",
  },
  podiumRankText: {
    fontSize: 20,
  },
  podiumStreak: {
    color: "#ff6b35",
    fontSize: 12,
    fontWeight: "600",
  },

  leaderboardContainer: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#f5f1ed",
    marginBottom: 16,
  },
  leaderboardItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#333",
  },
  currentUserItem: {
    borderColor: "#ff6b35",
    backgroundColor: "#2a1a1a",
  },
  rankContainer: {
    width: 40,
    alignItems: "center",
  },
  rankText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  topThreeRank: {
    fontSize: 20,
  },
  avatarContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: "hidden",
    marginHorizontal: 12,
    position: "relative",
  },
  youBadge: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#ff6b35",
    borderWidth: 2,
    borderColor: "#000",
  },
  userInfo: {
    flex: 1,
  },
  username: {
    fontSize: 16,
    fontWeight: "600",
    color: "#f5f1ed",
    marginBottom: 4,
  },
  currentUserText: {
    color: "#ff6b35",
  },
  youText: {
    color: "#ff6b35",
    fontSize: 12,
    fontWeight: "400",
  },
  statsRow: {
    flexDirection: "row",
    gap: 16,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statText: {
    color: "#888",
    fontSize: 12,
  },
  streakContainer: {
    alignItems: "center",
    minWidth: 60,
  },
  currentStreak: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ff6b35",
  },
  streakLabel: {
    fontSize: 10,
    color: "#888",
    textTransform: "uppercase",
  },
  totalWorkouts: {
    fontSize: 10,
    color: "#666",
    marginTop: 2,
  },
});

export default StreakLeaderboard;
