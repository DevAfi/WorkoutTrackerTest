import React, { useState } from "react";
import {
  Alert,
  StyleSheet,
  View,
  AppState,
  SafeAreaView,
  Text,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
  Animated,
  ActivityIndicator,
} from "react-native";
import { supabase } from "../lib/supabase";
import { Button, Input } from "@rneui/themed";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";

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
  const [isSignUp, setIsSignUp] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const fadeAnim = useState(new Animated.Value(0))[0];

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setEmailError("Email is required");
      return false;
    }
    if (!emailRegex.test(email)) {
      setEmailError("Please enter a valid email address");
      return false;
    }
    setEmailError("");
    return true;
  };

  const validatePassword = (password: string) => {
    if (!password) {
      setPasswordError("Password is required");
      return false;
    }
    if (isSignUp && password.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      return false;
    }
    setPasswordError("");
    return true;
  };

  const getPasswordStrength = (password: string) => {
    if (password.length < 6)
      return { strength: "Weak", color: "#FF6B6B", width: "33%" };
    if (password.length < 10)
      return { strength: "Medium", color: "#FFE66D", width: "66%" };
    return { strength: "Strong", color: "#4ECDC4", width: "100%" };
  };

  async function signInWithEmail() {
    if (!validateEmail(email) || !validatePassword(password)) return;

    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });
      if (error) {
        Alert.alert("Sign In Error", error.message);
      }
    } catch (error) {
      Alert.alert("Error", "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function signUpWithEmail() {
    if (!validateEmail(email) || !validatePassword(password)) return;

    setLoading(true);
    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.signUp({
        email: email.trim(),
        password: password,
      });

      if (error) {
        Alert.alert("Sign Up Error", error.message);
      } else if (!session) {
        Alert.alert(
          "Check Your Email",
          "We've sent you a verification link. Please check your inbox and verify your account."
        );
      }
    } catch (error) {
      Alert.alert("Error", "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const passwordStrength = getPasswordStrength(password);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <LinearGradient
        colors={["#1a1a1a", "#2d2d2d", "#1a1a1a"]}
        style={styles.gradient}
      >
        <TouchableWithoutFeedback>
          <SafeAreaView style={styles.safeArea}>
            <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
              <View style={styles.headerSection}>
                <View style={styles.logoContainer}>
                  <View style={styles.logo}>
                    <Text style={styles.logoText}>💪</Text>
                  </View>
                </View>
                <Text style={styles.headerText}>Build the best you</Text>
                <Text style={styles.subHeaderText}>
                  {isSignUp
                    ? "Create your account and start your fitness journey"
                    : "Welcome back! Ready to crush your goals?"}
                </Text>
              </View>

              <View style={styles.formSection}>
                <View style={styles.inputContainer}>
                  <Input
                    label="Email Address"
                    leftIcon={{
                      type: "font-awesome",
                      name: "envelope-o",
                      color: "#AF125A",
                      size: 20,
                    }}
                    onChangeText={(text) => {
                      setEmail(text);
                      if (emailError) validateEmail(text);
                    }}
                    onBlur={() => validateEmail(email)}
                    value={email}
                    placeholder="Enter your email"
                    autoCapitalize="none"
                    keyboardType="email-address"
                    autoComplete="email"
                    style={styles.inputText}
                    inputContainerStyle={[
                      styles.inputContainerStyle,
                      emailError ? styles.inputError : null,
                    ]}
                    labelStyle={styles.labelStyle}
                    placeholderTextColor="rgba(245, 241, 237, 0.5)"
                    errorMessage={emailError}
                    errorStyle={styles.errorText}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Input
                    label="Password"
                    leftIcon={{
                      type: "font-awesome",
                      name: "lock",
                      color: "#AF125A",
                      size: 20,
                    }}
                    rightIcon={{
                      type: "font-awesome",
                      name: showPassword ? "eye-slash" : "eye",
                      color: "rgba(245, 241, 237, 0.6)",
                      size: 18,
                      onPress: () => setShowPassword(!showPassword),
                    }}
                    onChangeText={(text) => {
                      setPassword(text);
                      if (passwordError) validatePassword(text);
                    }}
                    onBlur={() => validatePassword(password)}
                    value={password}
                    secureTextEntry={!showPassword}
                    placeholder="Enter your password"
                    autoCapitalize="none"
                    autoComplete="password"
                    style={styles.inputText}
                    inputContainerStyle={[
                      styles.inputContainerStyle,
                      passwordError ? styles.inputError : null,
                    ]}
                    labelStyle={styles.labelStyle}
                    placeholderTextColor="rgba(245, 241, 237, 0.5)"
                    errorMessage={passwordError}
                    errorStyle={styles.errorText}
                  />

                  {isSignUp && password.length > 0 && (
                    <View style={styles.passwordStrengthContainer}>
                      <View style={styles.passwordStrengthBar}>
                        <View
                          style={[
                            styles.passwordStrengthFill,
                            {
                              backgroundColor: passwordStrength.color,
                              width: passwordStrength.width,
                            },
                          ]}
                        />
                      </View>
                      <Text
                        style={[
                          styles.passwordStrengthText,
                          { color: passwordStrength.color },
                        ]}
                      >
                        {passwordStrength.strength}
                      </Text>
                    </View>
                  )}
                </View>

                <View style={styles.buttonSection}>
                  <Button
                    title={
                      loading ? (
                        <ActivityIndicator color="white" size="small" />
                      ) : isSignUp ? (
                        "Create Account"
                      ) : (
                        "Sign In"
                      )
                    }
                    disabled={loading}
                    onPress={isSignUp ? signUpWithEmail : signInWithEmail}
                    buttonStyle={styles.primaryButton}
                    titleStyle={styles.primaryButtonText}
                  />

                  <Button
                    title={
                      isSignUp
                        ? "Already have an account? Sign In"
                        : "New here? Create Account"
                    }
                    disabled={loading}
                    onPress={() => {
                      setIsSignUp(!isSignUp);
                      setEmailError("");
                      setPasswordError("");
                    }}
                    buttonStyle={styles.secondaryButton}
                    titleStyle={styles.secondaryButtonText}
                  />

                  {!isSignUp && (
                    <Button
                      title="Forgot Password?"
                      disabled={loading}
                      onPress={() => {
                        Alert.alert(
                          "Reset Password",
                          "Password reset functionality coming soon!"
                        );
                      }}
                      buttonStyle={styles.tertiaryButton}
                      titleStyle={styles.tertiaryButtonText}
                    />
                  )}
                </View>
              </View>

              <View style={styles.footer}>
                <Text style={styles.footerText}>
                  By continuing, you agree to our Terms of Service and Privacy
                  Policy
                </Text>
              </View>
            </Animated.View>
          </SafeAreaView>
        </TouchableWithoutFeedback>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  headerSection: {
    alignItems: "center",
    paddingTop: 40,
    paddingBottom: 40,
  },
  logoContainer: {
    marginBottom: 20,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(175, 18, 90, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#AF125A",
  },
  logoText: {
    fontSize: 40,
  },
  headerText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#f5f1ed",
    textAlign: "center",
    marginBottom: 8,
  },
  subHeaderText: {
    fontSize: 16,
    color: "rgba(245, 241, 237, 0.7)",
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  formSection: {
    flex: 1,
    justifyContent: "center",
  },
  inputContainer: {
    marginBottom: 10,
  },
  inputContainerStyle: {
    borderBottomWidth: 2,
    borderBottomColor: "rgba(175, 18, 90, 0.3)",
    paddingHorizontal: 0,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 5,
  },
  inputError: {
    borderBottomColor: "#FF6B6B",
  },
  labelStyle: {
    color: "#f5f1ed",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  inputText: {
    color: "#f5f1ed",
    fontSize: 16,
    paddingVertical: 8,
  },
  errorText: {
    color: "#FF6B6B",
    fontSize: 12,
    marginTop: 5,
  },
  passwordStrengthContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    paddingHorizontal: 5,
  },
  passwordStrengthBar: {
    flex: 1,
    height: 4,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 2,
    marginRight: 10,
    overflow: "hidden",
  },
  passwordStrengthFill: {
    height: "100%",
    borderRadius: 2,
  },
  passwordStrengthText: {
    fontSize: 12,
    fontWeight: "600",
  },
  buttonSection: {
    marginTop: 30,
    gap: 15,
  },
  primaryButton: {
    backgroundColor: "#AF125A",
    paddingVertical: 16,
    borderRadius: 12,
    elevation: 3,
    shadowColor: "#AF125A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  secondaryButton: {
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: "#AF125A",
    paddingVertical: 14,
    borderRadius: 12,
  },
  secondaryButtonText: {
    color: "#AF125A",
    fontSize: 16,
    fontWeight: "600",
  },
  tertiaryButton: {
    backgroundColor: "transparent",
    paddingVertical: 8,
  },
  tertiaryButtonText: {
    color: "rgba(245, 241, 237, 0.6)",
    fontSize: 14,
  },
  footer: {
    paddingVertical: 20,
    alignItems: "center",
  },
  footerText: {
    color: "rgba(245, 241, 237, 0.5)",
    fontSize: 12,
    textAlign: "center",
    lineHeight: 16,
  },
});
