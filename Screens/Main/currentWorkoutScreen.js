import React, { useState, useEffect, useLayoutEffect } from "react";
import {
  View,
  Button,
  ScrollView,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Modal,
} from "react-native";
import {
  useNavigation,
  useIsFocused,
  useRoute,
} from "@react-navigation/native";
import Exercise from "../../components/workoutComponents/Exercise";
import EndWorkoutButton from "../../components/endWorkButton";
import AddNote from "../../components/workoutComponents/addNote";

const CurrentWorkoutScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const isFocused = useIsFocused();
  const [exercises, setExercises] = useState([]);
  const [totalWeight, setTotalWeight] = useState("0");
  const initialSessionId = route.params?.sessionId;
  const [sessionId, setSessionId] = useState(initialSessionId);

  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    console.log("Session ID:", sessionId);
  }, [sessionId]);
  useEffect(() => {
    if (route.params?.sessionId && route.params.sessionId !== sessionId) {
      setSessionId(route.params.sessionId);
    }
  }, [route.params?.sessionId]);

  useEffect(() => {
    if (route.params?.newExercises) {
      console.log("Received from ExerciseSelect:", route.params.newExercises);
      setExercises((prev) => [
        ...prev,
        ...route.params.newExercises.map((ex) => ({
          ...ex,
          sets: [{ id: 1 }],
        })),
      ]);

      navigation.setParams({ newExercises: null });
    }
  }, [route.params?.newExercises]);

  return (
    <SafeAreaView style={styles.container}>
      {/* Modal for notes */}

      <Text style={styles.titleText}>Log your workout</Text>
      <Text style={styles.weightText}>Total Weight: {totalWeight}</Text>

      <Modal
        animationType="slide"
        transparent={true} // <- important to not cover entire screen with white background
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.bottomHalfModal}>
            {sessionId && <AddNote sessionId={sessionId} />}
            <TouchableOpacity
              style={[styles.button, styles.buttonClose]}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.textStyle}>Hide Notes</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <ScrollView style={styles.exercisesContainer}>
        {exercises.map((exercise, index) => (
          <Exercise key={index} exercise={exercise} />
        ))}
      </ScrollView>
      <View style={styles.bottomButtonContainer}>
        <TouchableOpacity
          onPress={() => navigation.navigate("selectExercise", { sessionId })}
          style={styles.addButtonContainer}
        >
          <Text style={styles.addButton}>Add exercises</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.buttonOpen]}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.textStyle}>Show Notes</Text>
        </TouchableOpacity>

        {sessionId ? (
          <View>
            <EndWorkoutButton
              sessionId={sessionId}
              onEnded={() => {
                navigation.navigate("MainTabs");
              }}
            />
          </View>
        ) : (
          <View>
            <Text>Debug ending</Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#252323",
  },
  titleText: {
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    color: "#f5f1ed",
  },
  weightText: {
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
    paddingTop: 15,
    color: "#f5f1ed",
  },
  exercisesContainer: {
    marginTop: 15,
    paddingVertical: 10,
    //backgroundColor: "blue",
  },
  addButtonContainer: {},
  addButton: {
    fontSize: 20,
    color: "#f5f1ed",
    textAlign: "center",
    height: 50,
    top: "25%",
  },
  bottomButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },

  // Modal //
  modalBackground: {
    flex: 1,
    justifyContent: "flex-end", // push modal to bottom
    backgroundColor: "rgba(0,0,0,0.5)", // dimmed background
  },
  bottomHalfModal: {
    height: "50%",
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },

  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
  buttonOpen: {
    backgroundColor: "#0D0C0C",
  },
  buttonClose: {
    backgroundColor: "#2196F3",
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
  },
});
export default CurrentWorkoutScreen;
