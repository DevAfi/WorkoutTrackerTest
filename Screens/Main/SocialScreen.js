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
          renderItem={({ item }) => <Text>{item.id}</Text>}
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
    backgroundColor: "#333",
    borderRadius: 10,
  },
});

export default SocialScreen;
