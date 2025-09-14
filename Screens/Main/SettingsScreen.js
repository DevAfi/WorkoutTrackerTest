import * as React from "react";

import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { supabase } from "../../lib/supabase";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

import Account from "../../components/Account";
import AboutScreen from "../SettingsScreens/AboutScreen";
import AccountSettings from "../SettingsScreens/AccountSettings";
import FAQ from "../SettingsScreens/FAQ";
import NotificationsSettings from "../SettingsScreens/NotificationsSettings";
import PrivacySettings from "../SettingsScreens/PrivacySettings";
import ProfileSettings from "../SettingsScreens/ProfileSettings";
import UnitSettings from "../SettingsScreens/UnitsSettings";

import OnboardingSettings from "../SettingsScreens/OnboardingSettings";
const SettingsScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <Text style={styles.titleText}>App Settings</Text>

        {/* Settings options container */}
        <View style={styles.settingsContainer}>
          {/* Personal settings */}
          <View style={styles.settingsSection}>
            <Text style={styles.settingsSubtext}>Personal</Text>
            <TouchableOpacity
              style={styles.settingsButton}
              onPress={() => navigation.navigate("ProfileSettings")}
            >
              <MaterialIcons name="person" color={"#f5f1ed"} size={35} />
              <Text style={styles.settingsText}>Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.settingsButton}
              onPress={() => navigation.navigate("OnboardingSettingsScreen")}
            >
              <MaterialIcons name="share" color={"#f5f1ed"} size={35} />
              <Text style={styles.settingsText}>Account</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.settingsButton}>
              <MaterialIcons name="lock" color={"#f5f1ed"} size={35} />
              <Text style={styles.settingsText}>Privacy</Text>
            </TouchableOpacity>
          </View>

          {/* Preferences settings */}
          <View style={styles.settingsSection}>
            <Text style={styles.settingsSubtext}>Preferences</Text>
            <TouchableOpacity style={styles.settingsButton}>
              <MaterialIcons name="change-circle" color={"#f5f1ed"} size={35} />
              <Text style={styles.settingsText}>Unit</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.settingsButton}>
              <MaterialIcons name="notifications" color={"#f5f1ed"} size={35} />
              <Text style={styles.settingsText}>Notifications</Text>
            </TouchableOpacity>
          </View>

          {/* General sectio */}
          <View style={styles.settingsSection}>
            <Text style={styles.settingsSubtext}>General</Text>
            <TouchableOpacity style={styles.settingsButton}>
              <MaterialIcons
                name="question-answer"
                color={"#f5f1ed"}
                size={35}
              />
              <Text style={styles.settingsText}>FAQ</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.settingsButton}>
              <MaterialIcons name="menu-book" color={"#f5f1ed"} size={35} />
              <Text style={styles.settingsText}>About</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.settingsButton}
              onPress={() => navigation.navigate("Privpolicy")}
            >
              <MaterialIcons name="privacy-tip" color={"#f5f1ed"} size={35} />
              <Text style={styles.settingsText}>Privacy Policy</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.settingsButton}
              onPress={() => navigation.navigate("terms")}
            >
              <MaterialIcons
                name="document-scanner"
                color={"#f5f1ed"}
                size={35}
              />
              <Text style={styles.settingsText}>Terms & Conditions</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={styles.signOutButton}
            onPress={() => supabase.auth.signOut()}
          >
            <Text style={styles.signOutText}>Sign out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },
  titleText: {
    color: "#f5f1ed",
    fontSize: 35,
    fontFamily: "Arial",
    fontWeight: "bold",
    alignSelf: "center",
    paddingBottom: 35,
  },
  settingsContainer: {},
  settingsSection: {
    borderColor: "white",
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderBottomWidth: 0.7,
    width: "100%",
  },
  settingsSubtext: {
    color: "#70798c",
    fontFamily: "Arial",
    fontSize: 20,
    marginVertical: 12,

    fontWeight: "bold",
  },
  settingsButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 30,
    paddingVertical: 5,
  },
  settingsText: {
    fontFamily: "Arial",
    fontWeight: "bold",
    color: "#f5f1ed",
    fontSize: 18,
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  signOutButton: {
    alignItems: "center",
  },
  signOutText: {
    color: "red",
    fontSize: 23,
    paddingVertical: 15,
    paddingHorizontal: 15,
    fontFamily: "Arial",
    textDecorationLine: "underline",
  },
});

export default SettingsScreen;
