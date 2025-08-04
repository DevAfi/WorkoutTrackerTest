import * as React from "react";

import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { supabase } from "../../lib/supabase";
import { useState } from "react";
import Exercise from "../../components/workoutComponents/Exercise";

const ProfileScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState("");
  const [goal, setgoal] = useState("");
  const [name, setName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  return (
    <SafeAreaView style={styles.container}>
      <Text>Profile</Text>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    backgroundColor: "#252323",
    alignItems: "center",
  },
  titleText: {
    fontSize: 24,
    fontWeight: "bold",
    marginVertical: 10,
    color: "#f5f1ed",
    fontFamily: "Arial",
  },

  calcButton: {
    backgroundColor: "#70798c",
    padding: "30",
    width: "80%",
    alignItems: "center",
    borderRadius: 10,
  },
  calcButtonText: {
    color: "#d0d8c3",
    fontSize: 18,
    fontWeight: "bold",
    fontFamily: "Arial",
  },
});

export default ProfileScreen;
