import React from "react";
import { Button, StyleSheet, View, TouchableOpacity } from "react-native";

import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer } from "@react-navigation/native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

import ViewAllExercises from "../components/workoutComponents/viewAllExercises";
import DashboardScreen from "../Screens/Main/DashboardScreen";
import SocialScreen from "../Screens/Main/SocialScreen";
import ProfileScreen from "../Screens/Main/ProfileScreen";
import StatsScreen from "../Screens/Main/StatsScreen";
import WorkoutScreen from "../Screens/Main/WorkoutScreen";
import SettingsScreen from "../Screens/Main/SettingsScreen";
import Account from "../components/Account";
import ProfileSettings from "../Screens/SettingsScreens/ProfileSettings";
import Auth from "../components/Auth";
import UserProfile from "../Screens/Main/[userProfile]";
import ViewExerciseDetails from "./[exerciseDetails]";
import CurrentWorkoutScreen from "../Screens/Main/CurrentWorkoutScreen";
import ExerciseSelectScreen from "../components/workoutComponents/exerciseSelectScreen";
import SessionDetailScreen from "../Screens/StatsScreens/SessionDetailScreen";
import WorkoutHub from "../Screens/workoutScreens/workoutsHubScreen";
import FriendsActivityScreen from "../Screens/friendFeedScreen";
import WorkoutTemplateDetail from "../components/workoutComponents/workoutTemplateDetail";
import StandaloneStatsScreen from "../Screens/Main/standaloneStatsScreen";
import WeightTrackerScreen from "../Screens/StatsScreens/weightStats";

import StreakLeaderboard from "../Screens/StatsScreens/leaderboardScreen";

import OnboardingSettings from "../Screens/SettingsScreens/OnboardingSettings";

import TnCScreen from "../Screens/SettingsScreens/TnCScreen";
import PrivacyPolicy from "../Screens/SettingsScreens/PrivacyPolicy";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const MainTabs = () => {
  return (
    <Tab.Navigator
      initialRouteName="Dash"
      screenOptions={{
        //headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: "black",
          borderColor: "#252323",
        },
        headerTitle: "",
      }}
    >
      <Tab.Screen
        name="Dash"
        component={DashboardScreen}
        options={({ navigation }) => ({
          tabBarIcon: ({ focused }) => (
            <View style={styles.tabIconStyling}>
              <MaterialIcons
                name="account-circle"
                color={focused ? "#AF125A" : "#f5f1ed"}
                size={35}
              />
            </View>
          ),
          headerStyle: {
            backgroundColor: "#252323",
          },
          headerShown: false,
        })}
      />
      <Tab.Screen
        name="Social"
        component={SocialScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={styles.tabIconStyling}>
              <MaterialIcons
                name="groups-3"
                color={focused ? "#AF125A" : "#f5f1ed"}
                size={35}
              />
            </View>
          ),
          headerStyle: {
            backgroundColor: "#252323",
          },
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="Workouts"
        component={WorkoutScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={styles.tabIconStyling}>
              <MaterialIcons
                name="add-circle"
                color={focused ? "#AF125A" : "#f5f1ed"}
                size={55}
              />
            </View>
          ),
          headerStyle: {
            backgroundColor: "#252323",
          },
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="Stats"
        component={StatsScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={styles.tabIconStyling}>
              <MaterialIcons
                name="query-stats"
                color={focused ? "#AF125A" : "#f5f1ed"}
                size={35}
              />
            </View>
          ),
          headerStyle: {
            backgroundColor: "#252323",
          },
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={({ navigation }) => ({
          tabBarIcon: ({ focused }) => (
            <View style={styles.tabIconStyling}>
              <MaterialIcons
                name="list"
                color={focused ? "#AF125A" : "#f5f1ed"}
                size={35}
              />
            </View>
          ),
          headerStyle: {
            backgroundColor: "#252323",
          },
          headerShown: false,
        })}
      />
    </Tab.Navigator>
  );
};

const Tabs = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="MainTabs"
        component={MainTabs}
        options={{ headerShown: false, gestureEnabled: false }}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: "Settings",
          headerStyle: {
            backgroundColor: "#252323",
          },
          headerShown: false,
        }}
      />
      <Tab.Screen name="Account" component={Account} />
      <Tab.Screen
        name="ProfileSettings"
        component={ProfileSettings}
        options={{
          title: "Profile Settings",
          headerStyle: {
            backgroundColor: "#252323",
          },
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="OnboardingSettingsScreen"
        component={OnboardingSettings}
        options={{
          title: "Profile Settings",
          headerStyle: {
            backgroundColor: "#252323",
          },
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="Auth"
        component={Auth}
        options={{
          title: "Authentication",
          headerStyle: {
            backgroundColor: "#252323",
          },
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="viewProfile"
        component={UserProfile}
        options={{
          headerStyle: {
            backgroundColor: "#403d3d",
          },
          headerTitleStyle: { color: "#f5f1ed" },
        }}
      />
      <Stack.Screen
        name="exerciseDetailsPage"
        component={ViewExerciseDetails}
        options={{
          headerStyle: {
            backgroundColor: "#403d3d",
          },
          headerTitleStyle: { color: "#f5f1ed" },
        }}
      />
      <Stack.Screen
        name="currentWorkoutScreen"
        component={CurrentWorkoutScreen}
        options={{
          headerStyle: {
            backgroundColor: "#403d3d",
          },
          headerShown: false,
          headerTitleStyle: { color: "#f5f1ed" },
          gestureEnabled: false,
        }}
      />
      <Stack.Screen
        name="selectExercise"
        component={ExerciseSelectScreen}
        options={{
          headerStyle: {
            backgroundColor: "#403d3d",
          },
          headerTitleStyle: { color: "#f5f1ed" },
        }}
      />
      <Stack.Screen
        name="ViewExercises"
        component={ViewAllExercises}
        options={{
          headerStyle: {
            backgroundColor: "#403d3d",
          },
          headerTitleStyle: { color: "#f5f1ed" },
          headerTitle: "Select An Exercise",
        }}
      />
      <Stack.Screen
        name="SessionDetail"
        component={SessionDetailScreen}
        options={{
          title: "Session Details",
          headerStyle: { backgroundColor: "black" },
        }}
      />
      <Stack.Screen
        name="AllWorkoutsScreen"
        component={WorkoutHub}
        options={{
          title: "All Workouts",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="friendActivity"
        component={FriendsActivityScreen}
        options={{
          title: "All Workouts",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="Leaderboard"
        component={StreakLeaderboard}
        options={{
          title: "All Workouts",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="WorkoutTemplateDetail"
        component={WorkoutTemplateDetail}
        options={{ headerShown: false }}
      />

      {/* SETTINGS NAVIGATION */}
      <Stack.Screen
        name="terms"
        component={TnCScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Privpolicy"
        component={PrivacyPolicy}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="SSC"
        component={StandaloneStatsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="WeightStatisticsScreen"
        component={WeightTrackerScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  tabIconStyling: {
    alignItems: "center",
    justifyContent: "center",
    top: 10,
    width: 55,
    height: 55,
  },
});

export default Tabs;
