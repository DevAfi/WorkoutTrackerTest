import React, { useLayoutEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  SafeAreaView,
  TouchableOpacity,
} from "react-native";

const ViewExerciseDetails = ({ route, navigation }) => {
  const { exerciseId, name, category, equipment, instructions } = route.params;
  const [isExpanded, setIsExpanded] = useState(false);
  const [historySelected, setHistorySelected] = useState(true);

  useLayoutEffect(() => {
    navigation.setOptions({ title: name });
  }, [navigation, name]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.detailsContainer}>
          <Text style={styles.title}>{name}</Text>
          <View style={styles.secondSection}>
            <View style={styles.detailItem}>
              <Text style={styles.label}>Muscle Group:</Text>
              <Text style={styles.value}>{category}</Text>
            </View>

            <View style={styles.detailItem}>
              <Text style={styles.label}>Equipment:</Text>
              <Text style={styles.value}>{equipment}</Text>
            </View>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.label}>Instructions:</Text>
            <Text
              style={styles.instructions}
              numberOfLines={isExpanded ? 0 : 3}
            >
              {instructions}
            </Text>
            <Text
              onPress={() => setIsExpanded(!isExpanded)}
              style={styles.seeMoreText}
            >
              {isExpanded ? "See less" : "See more"}
            </Text>
          </View>
        </View>
        <View style={styles.topButtonsContainer}>
          <TouchableOpacity
            style={styles.topButton}
            onPress={() => setHistorySelected(true)}
          >
            <Text style={styles.topButtonText}>History</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.topButton}
            onPress={() => setHistorySelected(false)}
          >
            <Text style={styles.topButtonText}>Stats</Text>
          </TouchableOpacity>
        </View>
        {/* BELOW HERE IM GONNA DISPLAY EITHER THE HISTORY OR THE STATS AS A SCROLLABLE PAGE */}

        {historySelected == true ? (
          <View>
            <Text>History</Text>
          </View>
        ) : (
          <View>
            <Text>Stats</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#252323",
  },
  scrollView: {
    backgroundColor: "#252323",
  },
  detailsContainer: {
    backgroundColor: "#1a1a1a",
    borderBottomRightRadius: 10,
    borderBottomLeftRadius: 10,
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#f5f1ed",
    marginBottom: 20,
    textAlign: "center",
    fontFamily: "arial",
  },
  secondSection: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    gap: 65,
  },
  detailItem: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#f5f1ed",
    marginBottom: 5,
    fontFamily: "arial",
  },
  value: {
    fontSize: 14,
    color: "#cccccc",
    fontFamily: "arial",
    textAlign: "center",
  },
  instructions: {
    fontSize: 14,
    color: "#cccccc",
    lineHeight: 22,
    fontFamily: "arial",
  },
  seeMoreText: {
    color: "#f5f1ed",
    fontWeight: "bold",
    textAlign: "right",
    marginTop: 5,
  },
  topButtonsContainer: {
    //backgroundColor: "red",
    flexDirection: "row",
    justifyContent: "space-evenly",
    gap: 10,
    paddingTop: 20,
  },
  topButton: {
    backgroundColor: "#0D0C0C",
    height: 50,
    width: 200,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 15,
  },
  topButtonText: {
    fontFamily: "Arial",
    fontWeight: "600",
    fontSize: 20,
    color: "#AF125A",
  },
});

export default ViewExerciseDetails;
