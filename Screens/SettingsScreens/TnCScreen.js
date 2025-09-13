import React from "react";
import { SafeAreaView, ScrollView, Text, StyleSheet } from "react-native";

const TnCScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.heading}>Terms & Conditions</Text>

        <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
        <Text style={styles.paragraph}>
          By using this app, you agree to be bound by these Terms & Conditions.
          If you do not agree, please do not use the app.
        </Text>

        <Text style={styles.sectionTitle}>2. No Medical Advice</Text>
        <Text style={styles.paragraph}>
          The app is provided for informational and tracking purposes only. It
          does not provide medical advice, diagnosis, or treatment. Always
          consult a qualified healthcare professional before starting any
          exercise program.
        </Text>

        <Text style={styles.sectionTitle}>3. User Responsibilities</Text>
        <Text style={styles.paragraph}>
          You are responsible for your own health and safety when using this
          app. Do not attempt exercises that are unsafe for your level of
          fitness. You agree to use the app at your own risk.
        </Text>

        <Text style={styles.sectionTitle}>4. Limitation of Liability</Text>
        <Text style={styles.paragraph}>
          To the fullest extent permitted by law, we are not liable for any
          injury, loss, or damages arising from your use of this app, including
          but not limited to personal injury, health complications, or data
          loss.
        </Text>

        <Text style={styles.sectionTitle}>5. No Warranties</Text>
        <Text style={styles.paragraph}>
          The app is provided "as is" without warranties of any kind. We do not
          guarantee that the app will be error-free, secure, or available at all
          times.
        </Text>

        <Text style={styles.sectionTitle}>6. Modifications</Text>
        <Text style={styles.paragraph}>
          We reserve the right to update these Terms & Conditions at any time.
          Continued use of the app after changes are posted constitutes
          acceptance of the new terms.
        </Text>

        <Text style={styles.sectionTitle}>7. Governing Law</Text>
        <Text style={styles.paragraph}>
          These Terms & Conditions shall be governed by and construed under the
          laws of your country of residence, without regard to conflict of law
          principles.
        </Text>

        <Text style={styles.paragraph}>
          Last Updated: {new Date().toLocaleDateString()}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    padding: 20,
  },
  heading: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 15,
    marginBottom: 5,
  },
  paragraph: {
    fontSize: 14,
    lineHeight: 20,
  },
});

export default TnCScreen;
