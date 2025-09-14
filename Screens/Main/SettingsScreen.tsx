import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Animated,
  Alert,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { supabase } from "../../lib/supabase";
import { LinearGradient } from "expo-linear-gradient";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

const { width } = Dimensions.get("window");

interface SettingItem {
  id: string;
  title: string;
  icon: string;
  onPress?: () => void;
  badge?: string;
  isDestructive?: boolean;
}

interface SettingSection {
  title: string;
  items: SettingItem[];
}

const SettingsScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const fadeAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    getUserProfile();

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const getUserProfile = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name, username, avatar_url")
          .eq("id", user.id)
          .single();

        setUser({ ...user, profile });
      }
    } catch (error) {
      console.error("Error fetching user:", error);
    }
  };

  const handleSignOut = () => {
    Alert.alert(
      "Sign Out",
      "Are you sure you want to sign out of your account?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Sign Out",
          style: "destructive",
          onPress: async () => {
            setLoading(true);
            try {
              await supabase.auth.signOut();
            } catch (error) {
              Alert.alert("Error", "Failed to sign out. Please try again.");
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const settingSections: SettingSection[] = [
    {
      title: "Personal",
      items: [
        {
          id: "profile",
          title: "Profile",
          icon: "person",
          onPress: () => navigation.navigate("ProfileSettings"),
        },
        {
          id: "account",
          title: "Account Settings",
          icon: "manage-accounts",
          onPress: () => navigation.navigate("OnboardingSettingsScreen"),
        },
        {
          id: "privacy",
          title: "Privacy & Security",
          icon: "lock",
          onPress: () => navigation.navigate("PrivacySettings"),
        },
      ],
    },
    {
      title: "Preferences",
      items: [
        {
          id: "units",
          title: "Units & Measurements",
          icon: "straighten",
          onPress: () => navigation.navigate("UnitSettings"),
        },
        {
          id: "notifications",
          title: "Notifications",
          icon: "notifications",
          badge: "3",
          onPress: () => navigation.navigate("NotificationsSettings"),
        },
        {
          id: "goals",
          title: "Workout Goals",
          icon: "flag",
          onPress: () => navigation.navigate("OnboardingSettingsScreen"),
        },
      ],
    },
    {
      title: "Support & Information",
      items: [
        {
          id: "faq",
          title: "FAQ & Help",
          icon: "help",
          onPress: () => navigation.navigate("FAQ"),
        },
        {
          id: "about",
          title: "About",
          icon: "info",
          onPress: () => navigation.navigate("AboutScreen"),
        },
        {
          id: "privacy-policy",
          title: "Privacy Policy",
          icon: "privacy-tip",
          onPress: () => navigation.navigate("Privpolicy"),
        },
        {
          id: "terms",
          title: "Terms & Conditions",
          icon: "description",
          onPress: () => navigation.navigate("terms"),
        },
      ],
    },
  ];

  const SettingButton = ({
    item,
    index,
  }: {
    item: SettingItem;
    index: number;
  }) => {
    const [scaleAnim] = useState(new Animated.Value(1));

    const handlePressIn = () => {
      Animated.spring(scaleAnim, {
        toValue: 0.98,
        useNativeDriver: true,
      }).start();
    };

    const handlePressOut = () => {
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    };

    return (
      <Animated.View
        style={[
          styles.settingButtonContainer,
          {
            transform: [{ scale: scaleAnim }],
            opacity: fadeAnim,
          },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.settingButton,
            item.isDestructive && styles.destructiveButton,
          ]}
          onPress={item.onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={0.8}
        >
          <View style={styles.settingButtonContent}>
            <View style={styles.leftContent}>
              <View
                style={[
                  styles.iconContainer,
                  item.isDestructive && styles.destructiveIconContainer,
                ]}
              >
                <MaterialIcons
                  name={item.icon}
                  size={24}
                  color={item.isDestructive ? "#FF6B6B" : "#AF125A"}
                />
              </View>
              <Text
                style={[
                  styles.settingText,
                  item.isDestructive && styles.destructiveText,
                ]}
              >
                {item.title}
              </Text>
            </View>
            <View style={styles.rightContent}>
              {item.badge && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{item.badge}</Text>
                </View>
              )}
              <MaterialIcons
                name="chevron-right"
                size={20}
                color="rgba(245, 241, 237, 0.4)"
              />
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={["#1a1a1a", "#2d2d2d", "#1a1a1a"]}
        style={styles.gradient}
      >
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          <View style={styles.header}>
            <Text style={styles.titleText}>Settings</Text>
            <Text style={styles.subtitleText}>
              Customize your fitness journey
            </Text>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {user && (
              <Animated.View
                style={[styles.profileCard, { opacity: fadeAnim }]}
              >
                <View style={styles.profileAvatar}>
                  <MaterialIcons
                    name="fitness-center"
                    size={32}
                    color="#AF125A"
                  />
                </View>
                <View style={styles.profileInfo}>
                  <Text style={styles.profileName}>
                    {user.profile?.full_name || "Fitness Enthusiast"}
                  </Text>
                  <Text style={styles.profileEmail}>{user.email}</Text>
                  {user.profile?.username && (
                    <Text style={styles.profileUsername}>
                      @{user.profile.username}
                    </Text>
                  )}
                </View>
                <View style={styles.profileBadge}>
                  <Text style={styles.profileBadgeText}>Pro</Text>
                </View>
              </Animated.View>
            )}

            {settingSections.map((section, sectionIndex) => (
              <Animated.View
                key={section.title}
                style={[
                  styles.settingsSection,
                  {
                    opacity: fadeAnim,
                    transform: [
                      {
                        translateY: fadeAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [30, 0],
                        }),
                      },
                    ],
                  },
                ]}
              >
                <Text style={styles.sectionTitle}>{section.title}</Text>
                <View style={styles.sectionContent}>
                  {section.items.map((item, index) => (
                    <SettingButton key={item.id} item={item} index={index} />
                  ))}
                </View>
              </Animated.View>
            ))}

            <Animated.View
              style={[styles.signOutContainer, { opacity: fadeAnim }]}
            >
              <TouchableOpacity
                style={styles.signOutButton}
                onPress={handleSignOut}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#FF6B6B" size="small" />
                ) : (
                  <>
                    <MaterialIcons name="logout" size={24} color="#FF6B6B" />
                    <Text style={styles.signOutText}>Sign Out</Text>
                  </>
                )}
              </TouchableOpacity>
            </Animated.View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>
                Version 1.0.0 • Made with grit by a single developer
              </Text>
            </View>
          </ScrollView>
        </Animated.View>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  gradient: {
    flex: 1,
    backgroundColor: "#000000",
  },
  content: {
    flex: 1,
    backgroundColor: "#000000",
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    alignItems: "center",
  },
  titleText: {
    color: "#f5f1ed",
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 5,
  },
  subtitleText: {
    color: "rgba(245, 241, 237, 0.7)",
    fontSize: 16,
    textAlign: "center",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  profileCard: {
    backgroundColor: "rgba(175, 18, 90, 0.1)",
    borderRadius: 16,
    padding: 20,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: "rgba(175, 18, 90, 0.3)",
    flexDirection: "row",
    alignItems: "center",
  },
  profileAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(175, 18, 90, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    color: "#f5f1ed",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 4,
  },
  profileEmail: {
    color: "rgba(245, 241, 237, 0.7)",
    fontSize: 14,
    marginBottom: 2,
    maxWidth: "90%",
  },
  profileUsername: {
    color: "#AF125A",
    fontSize: 14,
    fontWeight: "600",
  },
  profileBadge: {
    backgroundColor: "#AF125A",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  profileBadgeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  settingsSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    color: "#AF125A",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    marginLeft: 5,
  },
  sectionContent: {
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    borderRadius: 16,
    overflow: "hidden",
  },
  settingButtonContainer: {
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.05)",
  },
  settingButton: {
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  destructiveButton: {
    backgroundColor: "rgba(255, 107, 107, 0.05)",
  },
  settingButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  leftContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(175, 18, 90, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  destructiveIconContainer: {
    backgroundColor: "rgba(255, 107, 107, 0.1)",
  },
  rightContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  settingText: {
    color: "#f5f1ed",
    fontSize: 16,
    fontWeight: "600",
  },
  destructiveText: {
    color: "#FF6B6B",
  },
  badge: {
    backgroundColor: "#AF125A",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  badgeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  signOutContainer: {
    marginTop: 20,
    marginBottom: 20,
  },
  signOutButton: {
    backgroundColor: "rgba(255, 107, 107, 0.1)",
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 107, 107, 0.3)",
  },
  signOutText: {
    color: "#FF6B6B",
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 10,
  },
  footer: {
    alignItems: "center",
    paddingVertical: 20,
  },
  footerText: {
    color: "rgba(245, 241, 237, 0.4)",
    fontSize: 12,
    textAlign: "center",
  },
});

export default SettingsScreen;
