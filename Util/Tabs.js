import React from "react";
import { StyleSheet, View } from "react-native";

import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

import DashboardScreen from "../Screens/Main/DashboardScreen";
import SocialScreen from "../Screens/Main/SocialScreen";
import ProfileScreen from "../Screens/Main/ProfileScreen";
import StatsScreen from "../Screens/Main/StatsScreen";
import WorkoutScreen from "../Screens/Main/WorkoutScreen";

const Tab = createBottomTabNavigator();

const Tabs = () => {
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
      }}
    >
      <Tab.Screen
        name="Dash"
        component={DashboardScreen}
        options={{
          headerStyle: {
            backgroundColor: "pink",
          },
          headerTitle: null,
          tabBarIcon: ({ focused }) => (
            <View style={styles.tabIconStyling}>
              <MaterialIcons
                name="account-circle"
                color={focused ? "#70798c" : "#f5f1ed"}
                size={35}
              />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Social"
        component={SocialScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={styles.tabIconStyling}>
              <MaterialIcons
                name="groups-3"
                color={focused ? "#70798c" : "#f5f1ed"}
                size={35}
              />
            </View>
          ),
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
                color={focused ? "#70798c" : "#f5f1ed"}
                size={55}
              />
            </View>
          ),
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
                color={focused ? "#70798c" : "#f5f1ed"}
                size={35}
              />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={styles.tabIconStyling}>
              <MaterialIcons
                name="list"
                color={focused ? "#70798c" : "#f5f1ed"}
                size={35}
              />
            </View>
          ),
        }}
      />
    </Tab.Navigator>
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
