import React from "react";
import { Button, StyleSheet, View, TouchableOpacity } from "react-native";

import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer } from "@react-navigation/native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

import DashboardScreen from "../Screens/Main/DashboardScreen";
import SocialScreen from "../Screens/Main/SocialScreen";
import ProfileScreen from "../Screens/Main/ProfileScreen";
import StatsScreen from "../Screens/Main/StatsScreen";
import WorkoutScreen from "../Screens/Main/WorkoutScreen";
import SettingsScreen from "../Screens/Main/SettingsScreen";
import Account from "../components/Account";

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
          position: "absolute",
          backgroundColor: "#252323",
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
                color={focused ? "#fed42d" : "#f5f1ed"}
                size={35}
              />
            </View>
          ),
          headerStyle: {
            backgroundColor: "#252323",
          },

          headerRight: () => (
            <TouchableOpacity
              onPress={() => navigation.navigate("Settings")}
              style={{ marginRight: 10 }}
            >
              <MaterialIcons
                name="settings"
                size={30}
                color="#f5f1ed"
                marginRight={10}
              />
            </TouchableOpacity>
          ),
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
                color={focused ? "#fed42d" : "#f5f1ed"}
                size={35}
              />
            </View>
          ),
          headerStyle: {
            backgroundColor: "#252323",
          },
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
                color={focused ? "#fed42d" : "#f5f1ed"}
                size={55}
              />
            </View>
          ),
          headerStyle: {
            backgroundColor: "#252323",
          },
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
                color={focused ? "#fed42d" : "#f5f1ed"}
                size={35}
              />
            </View>
          ),
          headerStyle: {
            backgroundColor: "#252323",
          },
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
                color={focused ? "#fed42d" : "#f5f1ed"}
                size={35}
              />
            </View>
          ),
          headerStyle: {
            backgroundColor: "#252323",
          },
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
        options={{ headerShown: false }}
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
