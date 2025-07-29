import * as React from "react";

import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { FlashList } from "@shopify/flash-list";
import { getAllUsers } from "../../components/Account";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { supabase } from "../../lib/supabase";

// function to get user data, then will be used to highlight your own account

const SocialScreen = ({ navigation }) => {
  const [users, setUsers] = React.useState([]);
  React.useEffect(() => {
    getAllUsers().then((data) => {
      setUsers(data);
    });
  }, []);
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.titleText}>Social</Text>

      <View style={styles.userList}>
        <FlashList
          data={users}
          renderItem={({ item }) => (
            <View style={styles.userItem}>
              <MaterialIcons
                name="account-circle"
                size={30}
                color={"#f5f1ed"}
              />
              <Text style={styles.userText}>{item.username}</Text>
            </View>
          )}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#252323",
    alignItems: "center",
    justifyContent: "space-around",
  },
  titleText: {
    fontSize: 24,
    fontWeight: "bold",
    marginVertical: 10,
    color: "#f5f1ed",
    fontFamily: "Arial",
  },
  userList: {
    flex: 1,
    width: "100%",
    padding: 20,
    borderColor: "#333",
    borderRadius: 10,
    borderWidth: 3,
  },
  userItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 10,
  },
  userText: {
    fontSize: 18,
    color: "#f5f1ed",
    fontFamily: "Arial",
    fontWeight: "bold",
    paddingVertical: 10,
  },
});

export default SocialScreen;
