import * as React from "react";

import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from "react-native";

import MaterialIcons from "react-native-vector-icons/MaterialIcons";

import AboutScreen from "../SettingsScreens/AboutScreen";
import AccountSettings from "../SettingsScreens/AccountSettings";
import FAQ from "../SettingsScreens/FAQ";
import NotificationsSettings from "../SettingsScreens/NotificationsSettings";
import PrivacyPolicy from "../SettingsScreens/PrivacyPolicy";
import PrivacySettings from "../SettingsScreens/PrivacySettings";
import ProfileSettings from "../SettingsScreens/ProfileSettings";
import TncScreen from "../SettingsScreens/TnCScreen";
import UnitSettings from "../SettingsScreens/UnitsSettings";

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
            <TouchableOpacity style={styles.settingsButton}>
              <MaterialIcons name="person-outline" color={"#f5f1ed"} />
              <Text style={styles.settingsText}>Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity>
              <Text style={styles.settingsText}>Account</Text>
            </TouchableOpacity>
            <TouchableOpacity>
              <Text style={styles.settingsText}>Privacy</Text>
            </TouchableOpacity>
          </View>

          {/* Preferences settings */}
          <View style={styles.settingsSection}>
            <Text style={styles.settingsSubtext}>Preferences</Text>
            <TouchableOpacity>
              <Text>Unit</Text>
            </TouchableOpacity>
            <TouchableOpacity>
              <Text>Notifications</Text>
            </TouchableOpacity>
          </View>

          {/* General sectio */}
          <View style={styles.settingsSection}>
            <Text style={styles.settingsSubtext}>General</Text>
            <TouchableOpacity>
              <Text>FAQ</Text>
            </TouchableOpacity>
            <TouchableOpacity>
              <Text>About</Text>
            </TouchableOpacity>
            <TouchableOpacity>
              <Text>Privacy Policy</Text>
            </TouchableOpacity>
            <TouchableOpacity>
              <Text>Terms & Conditions</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#252323",
  },
  titleText: {
    color: "#f5f1ed",
    fontSize: 35,
    fontFamily: "Arial",
    fontWeight: "bold",
    alignSelf: "center",
  },
  settingsContainer: {},
  settingsSection: {
    marginVertical: 10,
  },
  settingsSubtext: {
    color: "#70798c",
    fontFamily: "Arial",
    fontSize: "20",
  },
  settingsButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  settingsText: {
    fontFamily: "Arial",
    color: "#f5f1ed",
  },
});

export default SettingsScreen;
