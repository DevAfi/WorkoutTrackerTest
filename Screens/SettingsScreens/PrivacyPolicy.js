import React from "react";
import { SafeAreaView, ScrollView, Text, StyleSheet } from "react-native";

const PrivacyPolicy = () => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.heading}>Privacy Policy</Text>

        <Text style={styles.paragraph}>
          This Privacy Policy explains how we collect, use, disclose, and
          safeguard your information when you use our gym tracking app ("App").
          Please read this policy carefully. If you do not agree with the terms
          of this policy, please do not use the App.
        </Text>

        <Text style={styles.sectionTitle}>1. Information We Collect</Text>
        <Text style={styles.paragraph}>
          We may collect the following categories of information:
        </Text>
        <Text style={styles.listItem}>
          • Personal identifiers (e.g., name, email address, username).
        </Text>
        <Text style={styles.listItem}>
          • Fitness data (e.g., workouts, goals, progress tracking).
        </Text>
        <Text style={styles.listItem}>
          • Device information (e.g., device type, operating system, app
          version).
        </Text>
        <Text style={styles.listItem}>
          • Usage information (e.g., how you interact with the App).
        </Text>
        <Text style={styles.listItem}>
          • Optional profile information (e.g., profile picture, bio).
        </Text>

        <Text style={styles.sectionTitle}>2. How We Use Your Information</Text>
        <Text style={styles.paragraph}>We use collected information to:</Text>
        <Text style={styles.listItem}>
          • Provide, operate, and maintain the App.
        </Text>
        <Text style={styles.listItem}>
          • Customize and improve your user experience.
        </Text>
        <Text style={styles.listItem}>
          • Track workout progress and fitness goals.
        </Text>
        <Text style={styles.listItem}>
          • Communicate with you regarding updates, new features, or support.
        </Text>
        <Text style={styles.listItem}>
          • Ensure security, prevent fraud, and comply with legal obligations.
        </Text>

        <Text style={styles.sectionTitle}>3. Sharing of Information</Text>
        <Text style={styles.paragraph}>
          We do not sell or rent your personal information. We may share
          information in the following cases:
        </Text>
        <Text style={styles.listItem}>
          • With service providers who help us operate the App (e.g., hosting,
          analytics).
        </Text>
        <Text style={styles.listItem}>
          • If required by law, legal process, or government request.
        </Text>
        <Text style={styles.listItem}>
          • In connection with a business transfer (e.g., merger, acquisition).
        </Text>

        <Text style={styles.sectionTitle}>4. Data Storage and Security</Text>
        <Text style={styles.paragraph}>
          Your data is stored securely using trusted third-party services. We
          implement reasonable technical and organizational measures to protect
          your information. However, no method of transmission or storage is
          completely secure, and we cannot guarantee absolute security.
        </Text>

        <Text style={styles.sectionTitle}>5. Data Retention</Text>
        <Text style={styles.paragraph}>
          We retain your personal information for as long as necessary to
          provide the App and for other legitimate purposes such as legal
          compliance, dispute resolution, and enforcement of agreements. You may
          request deletion of your data at any time.
        </Text>

        <Text style={styles.sectionTitle}>6. Your Privacy Rights</Text>
        <Text style={styles.paragraph}>
          Depending on your location, you may have the following rights:
        </Text>
        <Text style={styles.listItem}>
          • Access: Request a copy of the personal information we hold about
          you.
        </Text>
        <Text style={styles.listItem}>
          • Correction: Request correction of inaccurate or incomplete data.
        </Text>
        <Text style={styles.listItem}>
          • Deletion: Request that we delete your personal information.
        </Text>
        <Text style={styles.listItem}>
          • Restriction: Request that we restrict processing of your data.
        </Text>
        <Text style={styles.listItem}>
          • Portability: Request transfer of your data to another service
          provider.
        </Text>
        <Text style={styles.listItem}>
          • Withdrawal of Consent: Withdraw consent where processing is based on
          consent.
        </Text>

        <Text style={styles.sectionTitle}>7. Children’s Privacy</Text>
        <Text style={styles.paragraph}>
          Our App is not intended for individuals under the age of 13 (or the
          age of digital consent in your jurisdiction). We do not knowingly
          collect personal data from children. If we become aware that we have
          inadvertently collected data from a child, we will delete it promptly.
        </Text>

        <Text style={styles.sectionTitle}>8. Third-Party Services</Text>
        <Text style={styles.paragraph}>
          The App may contain links to third-party websites or services. We are
          not responsible for the privacy practices of those third parties and
          encourage you to review their privacy policies.
        </Text>

        <Text style={styles.sectionTitle}>9. International Data Transfers</Text>
        <Text style={styles.paragraph}>
          Your information may be transferred and maintained on servers located
          outside your country. By using the App, you consent to such transfers,
          provided that appropriate safeguards are in place.
        </Text>

        <Text style={styles.sectionTitle}>10. Updates to This Policy</Text>
        <Text style={styles.paragraph}>
          We may update this Privacy Policy from time to time. Changes will be
          effective when posted within the App. Your continued use of the App
          after updates means you accept the revised policy.
        </Text>

        {/*
        <Text style={styles.sectionTitle}>11. Contact Us</Text>
        <Text style={styles.paragraph}>
          If you have any questions or concerns about this Privacy Policy or
          your data, please contact us at:
        </Text>
                <Text style={styles.paragraph}>
          Email: _____@gmail.com{"\n"}
          Address: [Address]
        </Text>
        */}
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
    marginBottom: 10,
  },
  listItem: {
    fontSize: 14,
    lineHeight: 20,
    marginLeft: 10,
    marginBottom: 5,
  },
});

export default PrivacyPolicy;
