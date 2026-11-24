import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Alert,
  Linking,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useApp } from "../state/AppContext";
import { colors, radii, spacing } from "../theme";

const FAQS = [
  {
    q: "How does the 30-Day Rework Guarantee work?",
    a: "If any issue resurfaces within 30 days of service completion, a verified pro will revisit and resolve it with zero service fee.",
  },
  {
    q: "What payment options are accepted?",
    a: "We support UPI (Google Pay, PhonePe, Paytm, BHIM), Net Banking, and Pay after service via UPI QR code.",
  },
  {
    q: "Are NammaPros technicians background verified?",
    a: "Yes, every professional undergoes Aadhaar/police background checks, skill assessments, and standard safety training.",
  },
  {
    q: "Can I reschedule or cancel my booking?",
    a: "Yes, you can reschedule or cancel anytime up to 2 hours before the scheduled slot with zero cancellation fees.",
  },
];

export function HelpSupportModal() {
  const { isHelpModalOpen, setIsHelpModalOpen } = useApp();
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  if (!isHelpModalOpen) return null;

  const handleCall = () => {
    Linking.openURL("tel:+918000000000").catch(() => {
      Alert.alert("Call Support", "Reach our Chennai support desk at +91 800 000 0000");
    });
  };

  const handleChat = () => {
    Alert.alert(
      "Live Support Chat",
      "Support agent connected: 'Hello! How can we assist you with your booking today?'"
    );
  };

  return (
    <Modal
      visible={isHelpModalOpen}
      animationType="slide"
      transparent={false}
      onRequestClose={() => setIsHelpModalOpen(false)}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* ========================================================
            SCREEN 22: HELP & SUPPORT
            ======================================================== */}
        <View style={styles.header}>
          <Pressable
            onPress={() => setIsHelpModalOpen(false)}
            style={styles.headerBtn}
          >
            <Ionicons name="arrow-back" size={24} color={colors.ink} />
          </Pressable>
          <Text style={styles.headerTitle}>Help &amp; Support</Text>
          <View style={{ width: 36 }} />
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
          {/* 3 Contact Support Action Cards matching Mockup */}
          <View style={styles.actionsList}>
            {/* Chat with Us */}
            <Pressable
              onPress={handleChat}
              style={styles.actionCard}
              accessibilityRole="button"
              accessibilityLabel="Chat with Us"
            >
              <View style={styles.iconCircle}>
                <Ionicons name="chatbubble-ellipses" size={20} color={colors.primary} />
              </View>
              <View style={styles.actionTextWrap}>
                <Text style={styles.actionTitle}>Chat with Us</Text>
                <Text style={styles.actionSub}>Get quick help on your booking</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.muted} />
            </Pressable>

            {/* Call Us */}
            <Pressable
              onPress={handleCall}
              style={styles.actionCard}
              accessibilityRole="button"
              accessibilityLabel="Call Us"
            >
              <View style={styles.iconCircle}>
                <Ionicons name="call" size={20} color={colors.primary} />
              </View>
              <View style={styles.actionTextWrap}>
                <Text style={styles.actionTitle}>Call Us</Text>
                <Text style={styles.actionSub}>Speak with our support team</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.muted} />
            </Pressable>

            {/* FAQs */}
            <View style={styles.actionCard}>
              <View style={styles.iconCircle}>
                <Ionicons name="help-circle" size={20} color={colors.primary} />
              </View>
              <View style={styles.actionTextWrap}>
                <Text style={styles.actionTitle}>FAQs</Text>
                <Text style={styles.actionSub}>Find answers to common questions</Text>
              </View>
            </View>
          </View>

          {/* FAQ Accordion */}
          <View style={styles.faqSection}>
            <Text style={styles.faqSectionTitle}>Frequently Asked Questions</Text>
            {FAQS.map((faq, idx) => {
              const isExpanded = expandedFaq === idx;
              return (
                <Pressable
                  key={idx}
                  onPress={() => setExpandedFaq(isExpanded ? null : idx)}
                  style={styles.faqCard}
                >
                  <View style={styles.faqHeader}>
                    <Text style={styles.faqQuestion}>{faq.q}</Text>
                    <Ionicons
                      name={isExpanded ? "chevron-up" : "chevron-down"}
                      size={16}
                      color={colors.primary}
                    />
                  </View>
                  {isExpanded && <Text style={styles.faqAnswer}>{faq.a}</Text>}
                </Pressable>
              );
            })}
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    height: 52,
  },
  headerBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.ink,
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: spacing.xl,
    gap: spacing.xl,
  },
  actionsList: {
    gap: spacing.md,
  },
  actionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    gap: spacing.md,
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  actionTextWrap: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.ink,
  },
  actionSub: {
    fontSize: 12,
    color: colors.muted,
    marginTop: 2,
  },
  faqSection: {
    gap: spacing.md,
  },
  faqSectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.ink,
  },
  faqCard: {
    backgroundColor: colors.canvasWarm,
    borderRadius: radii.md,
    padding: spacing.md,
    gap: spacing.xs,
  },
  faqHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  faqQuestion: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.ink,
    flex: 1,
    paddingRight: spacing.sm,
  },
  faqAnswer: {
    fontSize: 12,
    color: colors.inkSecondary,
    lineHeight: 18,
    marginTop: 4,
  },
});
