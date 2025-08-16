import * as React from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { FlashList } from "@shopify/flash-list";
import { supabase } from "../../lib/supabase";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import ViewAvatar from "../../components/viewAvatar";

const SocialScreen = ({ navigation, route }) => {
  const [users, setUsers] = React.useState([]);
  const [currentUserId, setCurrentUserId] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [followingUsers, setFollowingUsers] = React.useState(new Set());
  const [activeTab, setActiveTab] = React.useState("all");

  React.useEffect(() => {
    getCurrentUser();
  }, []);

  React.useEffect(() => {
    if (currentUserId) {
      loadUsers();
    }
  }, [currentUserId, activeTab]);

  const getCurrentUser = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user?.id) {
        setCurrentUserId(session.user.id);
      }
    } catch (error) {
      console.error("Error getting current user:", error);
    }
  };

  const loadUsers = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      let data = [];

      switch (activeTab) {
        case "all":
          const { data: allUsers, error: allError } = await supabase.rpc(
            "get_all_users_with_relationship",
            { p_current_user_id: currentUserId }
          );
          if (allError) throw allError;
          data = allUsers || [];

          const followingSet = new Set();
          data.forEach((user) => {
            if (user.is_following) followingSet.add(user.user_id);
          });
          setFollowingUsers(followingSet);
          break;

        case "following":
          const { data: followingData, error: followingError } =
            await supabase.rpc("get_user_following", {
              p_user_id: currentUserId,
            });
          if (followingError) throw followingError;
          data = followingData || [];
          break;

        case "followers":
          const { data: followersData, error: followersError } =
            await supabase.rpc("get_user_followers", {
              p_user_id: currentUserId,
            });
          if (followersError) throw followersError;
          data = followersData || [];
          break;

        case "suggestions":
          const { data: suggestionsData, error: suggestionsError } =
            await supabase.rpc("get_friend_suggestions", {
              p_user_id: currentUserId,
            });
          if (suggestionsError) throw suggestionsError;
          data = suggestionsData || [];
          break;
      }

      setUsers(data);
    } catch (error) {
      console.error("Error loading users:", error);
      Alert.alert("Error", "Failed to load users");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleFollow = async (userId) => {
    try {
      const { data, error } = await supabase.rpc("follow_user", {
        p_follower_id: currentUserId,
        p_following_id: userId,
      });

      if (error) throw error;

      if (data) {
        setFollowingUsers((prev) => new Set([...prev, userId]));
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user.user_id === userId
              ? {
                  ...user,
                  followers_count: (user.followers_count || 0) + 1,
                  is_following: true,
                }
              : user
          )
        );
      }
    } catch (error) {
      console.error("Error following user:", error);
      Alert.alert("Error", "Failed to follow user");
    }
  };

  const handleUnfollow = async (userId) => {
    try {
      const { data, error } = await supabase.rpc("unfollow_user", {
        p_follower_id: currentUserId,
        p_following_id: userId,
      });

      if (error) throw error;

      setFollowingUsers((prev) => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });

      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.user_id === userId
            ? {
                ...user,
                followers_count: Math.max((user.followers_count || 1) - 1, 0),
                is_following: false,
              }
            : user
        )
      );
    } catch (error) {
      console.error("Error unfollowing user:", error);
      Alert.alert("Error", "Failed to unfollow user");
    }
  };

  const getFollowButtonStyle = (isFollowing, isFollower) => {
    if (isFollowing && isFollower) {
      return { ...styles.followButton, backgroundColor: "#28a745" };
    } else if (isFollowing) {
      return { ...styles.followButton, backgroundColor: "#6c757d" };
    } else if (isFollower) {
      return { ...styles.followButton, backgroundColor: "#AF125A" };
    } else {
      return { ...styles.followButton, backgroundColor: "#AF125A" };
    }
  };

  const getFollowButtonText = (isFollowing, isFollower) => {
    if (isFollowing && isFollower) {
      return "Friends";
    } else if (isFollowing) {
      return "Following";
    } else if (isFollower) {
      return "Follow Back";
    } else {
      return "Follow";
    }
  };

  const renderTabButton = (tabKey, title) => (
    <TouchableOpacity
      style={[styles.tabButton, activeTab === tabKey && styles.activeTabButton]}
      onPress={() => setActiveTab(tabKey)}
    >
      <Text
        style={[
          styles.tabButtonText,
          activeTab === tabKey && styles.activeTabButtonText,
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );

  const renderUserItem = ({ item }) => {
    const isFollowing =
      activeTab === "all"
        ? item.is_following
        : activeTab === "following"
        ? true
        : followingUsers.has(item.user_id);
    const isFollower =
      activeTab === "all"
        ? item.is_follower
        : activeTab === "followers"
        ? true
        : activeTab === "following"
        ? item.follows_back
        : false;

    return (
      <TouchableOpacity
        style={styles.touchableItem}
        onPress={() =>
          navigation.navigate("viewProfile", {
            username: item.username,
            full_name: item.full_name,
            goal: item.goal,
            avatar_url: item.avatar_url,
            userId: item.user_id,
          })
        }
      >
        <View style={styles.topSectionContainer}>
          <View style={styles.pfp}>
            <ViewAvatar url={item.avatar_url} />
          </View>

          <View style={styles.topSectionText}>
            <Text style={{ fontSize: 20, color: "white", fontWeight: "bold" }}>
              @{item.username}
            </Text>
            <Text style={{ fontSize: 14, color: "grey" }}>
              {item.full_name}
            </Text>
            {item.goal && (
              <Text
                style={{ fontSize: 12, color: "grey", fontStyle: "italic" }}
              >
                "{item.goal}"
              </Text>
            )}

            {/* Stats Row */}
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {item.current_streak || 0}
                </Text>
                <Text style={styles.statLabel}>Streak</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {item.total_workouts || 0}
                </Text>
                <Text style={styles.statLabel}>Workouts</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {item.followers_count || 0}
                </Text>
                <Text style={styles.statLabel}>Followers</Text>
              </View>
              {activeTab === "suggestions" && item.mutual_friends > 0 && (
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{item.mutual_friends}</Text>
                  <Text style={styles.statLabel}>Mutual</Text>
                </View>
              )}
            </View>
          </View>

          <View style={styles.actionContainer}>
            <TouchableOpacity
              style={getFollowButtonStyle(isFollowing, isFollower)}
              onPress={() => {
                if (isFollowing) {
                  Alert.alert(
                    "Unfollow User",
                    `Are you sure you want to unfollow @${item.username}?`,
                    [
                      { text: "Cancel", style: "cancel" },
                      {
                        text: "Unfollow",
                        onPress: () => handleUnfollow(item.user_id),
                      },
                    ]
                  );
                } else {
                  handleFollow(item.user_id);
                }
              }}
            >
              <Text style={styles.followButtonText}>
                {getFollowButtonText(isFollowing, isFollower)}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.titleText}>Social</Text>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007bff" />
          <Text style={styles.loadingText}>Loading users...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.titleText}>Social</Text>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        {renderTabButton("all", "All Users")}
        {renderTabButton("following", "Following")}
        {renderTabButton("followers", "Followers")}
        {renderTabButton("suggestions", "Suggestions")}
      </View>

      <View style={styles.userList}>
        <FlashList
          data={users}
          renderItem={renderUserItem}
          estimatedItemSize={120}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => loadUsers(true)}
              tintColor="#007bff"
            />
          }
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <MaterialIcons name="people-outline" size={48} color="grey" />
              <Text style={styles.emptyTitle}>
                {activeTab === "following"
                  ? "Not following anyone yet"
                  : activeTab === "followers"
                  ? "No followers yet"
                  : activeTab === "suggestions"
                  ? "No suggestions available"
                  : "No users found"}
              </Text>
              <Text style={styles.emptySubtitle}>
                {activeTab === "following"
                  ? "Start following people to see their activities!"
                  : activeTab === "followers"
                  ? "Share your progress to gain followers!"
                  : activeTab === "suggestions"
                  ? "Follow more people to get suggestions!"
                  : "Check back later for more users."}
              </Text>
            </View>
          )}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
    paddingBottom: 100,
  },
  titleText: {
    fontSize: 24,
    fontWeight: "bold",
    marginVertical: 10,
    color: "#f5f1ed",
    fontFamily: "Arial",
    textAlign: "center",
  },
  tabContainer: {
    flexDirection: "row",
    marginHorizontal: 10,
    marginBottom: 10,
    borderRadius: 8,
    backgroundColor: "#1a1a1a",
    padding: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: "center",
  },
  activeTabButton: {
    backgroundColor: "#AF125A",
  },
  tabButtonText: {
    color: "grey",
    fontSize: 12,
    fontWeight: "600",
  },
  activeTabButtonText: {
    color: "white",
  },
  userList: {
    flex: 1,
    paddingHorizontal: 10,
  },
  touchableItem: {
    marginBottom: 8,
  },
  topSectionContainer: {
    backgroundColor: "#1a1a1a",
    borderColor: "#333",
    borderWidth: 2,
    alignItems: "center",
    flexDirection: "row",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  pfp: {
    backgroundColor: "#AF125A",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 100,
    width: 80,
    height: 80,
    marginRight: 12,
  },
  topSectionText: {
    flex: 1,
    gap: 2,
  },
  statsRow: {
    flexDirection: "row",
    marginTop: 6,
    gap: 12,
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    color: "#AF125A",
    fontSize: 14,
    fontWeight: "bold",
  },
  statLabel: {
    color: "grey",
    fontSize: 10,
  },
  actionContainer: {
    marginLeft: 8,
  },
  followButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 80,
    alignItems: "center",
  },
  followButtonText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "grey",
    marginTop: 10,
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
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
    paddingHorizontal: 32,
    lineHeight: 20,
  },
});

export default SocialScreen;
