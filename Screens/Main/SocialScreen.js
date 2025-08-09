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
import ViewAvatar from "../../components/viewAvatar";

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
            <TouchableOpacity
              style={styles.touchableItem}
              onPress={() =>
                navigation.navigate("viewProfile", {
                  username: item.username,
                  full_name: item.full_name,
                  goal: item.goal,
                  avatar_url: item.avatar_url,
                })
              }
            >
              <View style={styles.topSectionContainer}>
                <View style={styles.pfp}>
                  <ViewAvatar url={item.avatar_url} />
                </View>
                <View style={styles.topSectionText}>
                  <Text style={{ fontSize: 24, color: "white" }}>
                    @{item.username}
                  </Text>
                  <Text style={{ fontSize: 14, color: "grey" }}>
                    {item.full_name}
                  </Text>
                  <Text style={{ fontSize: 14, color: "grey" }}>
                    "{item.goal}"
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
    alignItems: "center",
    justifyContent: "space-around",
    paddingBottom: 100,
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
    padding: 10,
    borderColor: "#333",
    borderRadius: 10,
    borderWidth: 3,
  },
  touchableItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 5,
    width: "100%",
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

  topSectionContainer: {
    backgroundColor: "#1a1a1a",
    borderColor: "#333",
    borderWidth: 2,
    width: "100%",
    alignItems: "center",
    flexDirection: "row",
    paddingVertical: 10,
    paddingHorizontal: 5,
    borderRadius: 10,
    gap: 20,
  },
  pfp: {
    backgroundColor: "pink",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 100,
    width: 75,
    height: 75,
  },
  topSectionText: {
    gap: 1,
  },
});

export default SocialScreen;
