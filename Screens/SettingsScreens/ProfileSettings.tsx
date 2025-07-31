import { useState, useEffect } from "react";
import {
  View,
  Alert,
  StyleSheet,
  SafeAreaView,
  Text,
  TouchableWithoutFeedback,
} from "react-native";
import { Input, Button } from "@rneui/themed";
import { supabase } from "../../lib/supabase";
import { useNavigation } from "@react-navigation/native";
import Avatar from "../../components/Avatar";

export default function ProfileSettings() {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState("");
  const [goal, setGoal] = useState("");
  const [fullName, setFullName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState(""); // optional
  const [email, setEmail] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    setLoading(true);
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      Alert.alert("Error", "Could not get user.");
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("username, goal, full_name, avatar_url")
      .eq("id", user.id)
      .single();

    if (error) {
      Alert.alert("Error loading profile", error.message);
    } else if (data) {
      setUsername(data.username || "");
      setGoal(data.goal || "");
      setFullName(data.full_name || "");
      setAvatarUrl(data.avatar_url || "");
      setEmail(user.email || "");
    }

    setLoading(false);
  }

  async function handleUpdateProfile() {
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const updates = {
      id: user.id,
      username,
      goal,
      full_name: fullName,
      avatar_url: avatarUrl,
      updated_at: new Date(),
    };

    const { error } = await supabase.from("profiles").upsert(updates);

    if (error) {
      Alert.alert("Error updating profile", error.message);
    } else {
      Alert.alert("Success", "Profile updated!");
    }
    navigation.goBack();
    setLoading(false);
  }

  return (
    <TouchableWithoutFeedback>
      <SafeAreaView style={styles.container}>
        <Text style={styles.headerText}>Profile Settings</Text>
        <View style={styles.inputContainer}>
          <Avatar
            size={125}
            url={avatarUrl}
            onUpload={(url: string) => {
              setAvatarUrl(url);
            }}
          />
          <Input
            label="Email"
            value={email}
            disabled
            style={styles.inputText}
          />
          <Input
            label="Full Name"
            value={fullName}
            onChangeText={setFullName}
            style={styles.inputText}
          />
          <Input
            label="Username"
            value={username}
            onChangeText={setUsername}
            style={styles.inputText}
          />
          <Input
            label="Goal"
            value={goal}
            onChangeText={setGoal}
            style={styles.inputText}
          />
        </View>
        <Button
          title={loading ? "Loading..." : "Update Profile"}
          onPress={handleUpdateProfile}
          disabled={loading}
          buttonStyle={styles.button}
        />
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
  },
  inputContainer: {
    paddingVertical: 20,
  },
  button: {
    marginTop: 20,
    backgroundColor: "#AF125A",
  },
  inputText: {
    color: "white",
    paddingVertical: 10,
  },
});
