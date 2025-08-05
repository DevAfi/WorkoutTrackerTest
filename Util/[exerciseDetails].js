import React, { useLayoutEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  SafeAreaView,
} from "react-native";

const ViewExerciseDetails = ({ route, navigation }) => {
  const { exerciseId, name, category, equipment, instructions } = route.params;
  const [isExpanded, setIsExpanded] = useState(false);

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
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  scrollView: {
    paddingVertical: 15,
    paddingHorizontal: 5,
    backgroundColor: "red",
  },
  detailsContainer: {
    backgroundColor: "#1a1a1a",
    borderRadius: 10,
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
});

export default ViewExerciseDetails;
