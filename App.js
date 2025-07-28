import { useState, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { supabase } from "./lib/supabase";
import { Session } from "@supabase/supabase-js";

import Auth from "./components/Auth";
import Account from "./components/Account";
import Tabs from "./Util/Tabs";

const Stack = createNativeStackNavigator();

export default function App() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {session && session.user ? (
          <>
            {/* Optional screen after login */}
            <Stack.Screen name="MainTabs" component={Tabs} />
            <Stack.Screen name="Account">
              {(props) => <Account {...props} session={session} />}
            </Stack.Screen>
          </>
        ) : (
          <Stack.Screen name="Auth" component={Auth} />
        )}
        <Stack.Screen name="Account2" component={Account} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
