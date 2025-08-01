import React, { useLayoutEffect } from "react";
import { useState } from "react";
import {
  View,
  SafeAreaView,
  Text,
  Input,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Button,
} from "react-native";
import Set from "./Set";

export default function Exercise() {
  const [sets, setSets] = useState([{ id: 1 }]);

  const addSet = () => {
    const newId = sets.length > 0 ? sets[sets.length - 1].id + 1 : 1;
    setSets([...sets, { id: newId }]);
  };
  const removeSet = (idToRemove) => {
    if (sets.length > 1) {
      setSets(sets.slice(0, -1));
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        {sets.map((set) => (
          <Set key={set.id} id={set.id} />
        ))}
      </ScrollView>
      <View style={styles.buttonContainer}>
        <Button
          title="Add Set"
          onPress={addSet}
          style={styles.addButtonStyle}
        />
        <Button
          title="Remove Set"
          onPress={removeSet}
          style={styles.removeButtonStyle}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    backgroundColor: "#3C3939",
    paddingHorizontal: 5,
    paddingVertical: 12,
    flexDirection: "collumn",
    gap: 5,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 12,
  },
  addButtonStyle: {
    borderRadius: 10,
    backgroundColor: "green",
  },
  removeButtonStyle: { borderRadius: 10, backgroundColor: "red" },
});
