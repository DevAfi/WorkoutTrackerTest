import * as React from "react";

import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import LatestSessionRecap from "../../components/statisticComponents/LatestSessionRecap";

const DashboardScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      {/*  <SafeAreaView style={styles.headerBar}>
        <Text style={styles.headerText}>Hello</Text>
      </SafeAreaView>
    */}
      <Text style={styles.titleText}>Welcome back</Text>

      <View style={styles.topContainer}>
        <MaterialIcons name="home" size={36} color={"white"}></MaterialIcons>
        <Text style={styles.topText}>Weekly Activity</Text>
      </View>
      <LatestSessionRecap
        onPress={(session) =>
          navigation.navigate("SessionDetail", { sessionId: session.id })
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#252323",
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
  },
  topText: {
    fontSize: 24,
    color: "#f5f1ed",
    fontFamily: "Arial",
  },
});
export default DashboardScreen;
