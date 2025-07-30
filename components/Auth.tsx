import React, { useState } from "react";
import {
  Alert,
  StyleSheet,
  View,
  AppState,
  SafeAreaView,
  Text,
  TouchableWithoutFeedback,
} from "react-native";
import { supabase } from "../lib/supabase";
import { Button, Input } from "@rneui/themed";
import { useNavigation } from "@react-navigation/native";

// Tells Supabase Auth to continuously refresh the session automatically if
// the app is in the foreground. When this is added, you will continue to receive
// `onAuthStateChange` events with the `TOKEN_REFRESHED` or `SIGNED_OUT` event
// if the user's session is terminated. This should only be registered once.
AppState.addEventListener("change", (state) => {
  if (state === "active") {
    supabase.auth.startAutoRefresh();
  } else {
    supabase.auth.stopAutoRefresh();
  }
});

export default function Auth() {
  const navigation = useNavigation<any>();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function signInWithEmail() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });
    if (error) Alert.alert(error.message);

    setLoading(false);
  }

  async function signUpWithEmail() {
    setLoading(true);
    console.log(email, password);
    const {
      data: { session },
      error,
    } = await supabase.auth.signUp({
      email: email,
      password: password,
    });

    if (error) Alert.alert(error.message);
    if (!session)
      Alert.alert("Please check your inbox for email verification!");
    setLoading(false);
  }

  return (
    <TouchableWithoutFeedback>
      <SafeAreaView style={styles.container}>
        <Text style={styles.headerText}>Build the best you</Text>
        <View style={[styles.verticallySpaced, styles.mt20]}>
          <Input
            label="Email"
            leftIcon={{ type: "font-awesome", name: "envelope" }}
            onChangeText={(text) => setEmail(text)}
            value={email}
            placeholder="email@address.com"
            autoCapitalize={"none"}
            style={styles.inputText}
          />
        </View>
        <View style={styles.verticallySpaced}>
          <Input
            label="Password"
            leftIcon={{ type: "font-awesome", name: "lock" }}
            onChangeText={(text) => setPassword(text)}
            value={password}
            secureTextEntry={true}
            placeholder="Password"
            autoCapitalize={"none"}
            style={styles.inputText}
          />
        </View>
        <View style={[styles.verticallySpaced, styles.mt20]}>
          <Button
            title="Sign in"
            disabled={loading}
            onPress={() => signInWithEmail()}
            buttonStyle={styles.button}
          />
        </View>
        <View style={styles.verticallySpaced}>
          <Button
            title="Sign up"
            disabled={loading}
            onPress={() => signUpWithEmail()}
            buttonStyle={styles.button}
          />
        </View>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#252323",
    flex: 1,
    gap: 20,
  },
  headerText: {
    fontSize: 36,
    fontFamily: "Arial",
    fontWeight: "bold",
    color: "#f5f1ed",
    textAlign: "center",
    paddingBottom: 50,
    paddingTop: 15,
  },
  verticallySpaced: {
    paddingTop: 4,
    paddingBottom: 4,
    alignSelf: "stretch",
  },
  mt20: {
    marginTop: 20,
  },
  inputText: {
    color: "white",
    paddingVertical: 10,
  },
  button: {
    marginTop: 20,
    backgroundColor: "#AF125A",
  },
});
