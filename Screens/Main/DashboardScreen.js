import React, { useEffect, useState } from "react";

import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  Button,
  Alert,
} from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import LatestSessionRecap from "../../components/statisticComponents/LatestSessionRecap";
import { supabase } from "../../lib/supabase";
import StreakTracker from "../../components/streakComponent";
import ActivityFeed from "../../components/socialComponents/activityFeed";
import { useNavigation } from "@react-navigation/native";

const DashboardScreen = ({ navigation }) => {
  const [heatmapData, setHeatmapData] = useState([]);
  const [userID, setUserID] = useState("");
  const [showXPAnimation, setShowXPAnimation] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) {
        console.error("No user data found");
      }
      console.log("1");

      setUserID(userData.user.id);
    })();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      {/*  <SafeAreaView style={styles.headerBar}>
        <Text style={styles.headerText}>Hello</Text>
      </SafeAreaView>
    */}
      <Text style={styles.titleText}>Welcome back</Text>
      <TouchableOpacity
        onPress={() => navigation.navigate("Settings")}
        style={{ position: "absolute", top: "5%", right: "5%" }}
      >
        <MaterialIcons
          name="settings"
          size={30}
          color="#f5f1ed"
          marginRight={10}
        />
      </TouchableOpacity>

      <View style={styles.topContainer}>
        <MaterialIcons name="home" size={36} color={"white"}></MaterialIcons>
        <Text style={styles.topText}>Weekly Activity</Text>
      </View>
      <StreakTracker userId={userID} />
      <View style={styles.recapContainer}>
        {/*  <LatestSessionRecap
          onPress={(session) =>
            navigation.navigate("SessionDetail", { sessionId: session.id })
          }
        /> */}
        <ActivityFeed userId={userID} navigation={navigation} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
    alignItems: "center",
  },
  headerBar: {
    width: "100%",
    height: 50,
    backgroundColor: "white",
    position: "absolute",
    top: 10,
  },
  headerText: {
    backgroundColor: "white",
  },
  titleText: {
    fontSize: 36,
    fontWeight: "bold",
    marginVertical: 10,
    color: "#f5f1ed",
    fontFamily: "Arial",
  },
  topContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#333",
    padding: 20,
    borderRadius: 10,
    width: "90%",
    gap: 20,
    borderColor: "#AF125A",
    borderWidth: 2,
    marginBottom: 10,
  },
  topText: {
    fontSize: 24,
    color: "#f5f1ed",
    fontFamily: "Arial",
  },
  recapContainer: {
    width: "100%",
    alignItems: "center",
    paddingTop: "10%",
    borderTopWidth: 1,
    borderTopColor: "white",
  },
});
export default DashboardScreen;
