import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { api, CLOUD_RUN_URL_1, CLOUD_RUN_URL_2 } from "../api";
import { SwipeBackContainer } from "../components/SwipeBackContainer";
import { useApp } from "../state/AppContext";
import { colors, isAndroid, radii, spacing, statusBarHeight } from "../theme";

export function AccountScreen() {
  const {
    user,
    signIn,
    signOut,
    currentApiUrl,
    changeApiUrl,
    selectedCity,
    selectedPincode,
    setIsLocationModalOpen,
    setIsAuthOpen,
    setIsIntroOpen,
    setIsHelpModalOpen,
    setActiveTab,
    savedAddresses,
  } = useApp();

  const [showAddressesModal, setShowAddressesModal] = useState(false);
  const [showPaymentMethodsModal, setShowPaymentMethodsModal] = useState(false);
  const [showBackendModal, setShowBackendModal] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [language, setLanguage] = useState<"en" | "ta">("en");

  // Developer ping state
  const [pingLatency, setPingLatency] = useState<number | null>(null);
  const [testingPing, setTestingPing] = useState(false);
  const [customUrlInput, setCustomUrlInput] = useState("");

  const handleTestPing = async (url?: string) => {
    setTestingPing(true);
    setPingLatency(null);
    try {
      const res = await api.ping(url || currentApiUrl);
      if (res.success) {
        setPingLatency(res.latencyMs);
      } else {
        Alert.alert("Ping Failed", "Backend responded with an error or timed out.");
      }
    } catch {
      Alert.alert("Network Error", "Could not reach backend URL.");
    } finally {
      setTestingPing(false);
    }
  };

  const handleSwitchBackend = async (url: string) => {
    try {
      await changeApiUrl(url);
      Alert.alert("Backend Switched", `Active API: ${url}`);
      handleTestPing(url);
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to switch backend URL.");
    }
  };

  const handleApplyCustomUrl = async () => {
    const trimmed = customUrlInput.trim().replace(/\/+$/, "");
    if (!trimmed.startsWith("http")) {
      Alert.alert("Invalid URL", "Please enter a valid HTTP/HTTPS URL.");
      return;
    }
    await handleSwitchBackend(trimmed);
  };

  const displayName = user?.name || "Deepan D.";
  const displayPhone = user?.phone_e164 || "+91 98765 43210";
  const initials = displayName
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <SwipeBackContainer onBack={() => setActiveTab("home")} style={styles.container}>
      {/* ========================================================
          SCREEN 21: PROFILE / MY ACCOUNT
          ======================================================== */}
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Account</Text>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        {/* Profile Card matching Mockup */}
        <View style={styles.profileCard}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarInitials}>{initials || "DD"}</Text>
          </View>
          <View style={styles.profileTextWrap}>
            <Text style={styles.profileName}>{displayName}</Text>
            <Text style={styles.profilePhone}>{displayPhone}</Text>
          </View>
          {!user ? (
            <Pressable
              onPress={() => setIsAuthOpen(true)}
              style={styles.signInBadgeBtn}
              accessibilityRole="button"
              accessibilityLabel="Sign In"
            >
              <Text style={styles.signInBadgeText}>Sign In</Text>
            </Pressable>
          ) : (
            <Pressable
              onPress={() => {
                Alert.alert("Sign Out", "Are you sure you want to sign out?", [
                  { text: "Cancel", style: "cancel" },
                  { text: "Sign Out", style: "destructive", onPress: signOut },
                ]);
              }}
              style={styles.signOutSmallBtn}
            >
              <Ionicons name="log-out-outline" size={18} color={colors.primary} />
            </Pressable>
          )}
        </View>

        {/* Language Selector (from ps-mobile) */}
        <View style={styles.languageCard}>
          <View>
            <Text style={styles.languageTitle}>Language</Text>
            <Text style={styles.languageHint}>English / தமிழ்</Text>
          </View>
          <View style={styles.languageButtons}>
            <Pressable
              onPress={() => setLanguage("en")}
              style={[styles.langBtn, language === "en" && styles.langBtnActive]}
              accessibilityRole="button"
              accessibilityLabel="English"
            >
              <Text style={[styles.langBtnText, language === "en" && styles.langBtnTextActive]}>
                EN
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setLanguage("ta")}
              style={[styles.langBtn, language === "ta" && styles.langBtnActive]}
              accessibilityRole="button"
              accessibilityLabel="Tamil"
            >
              <Text style={[styles.langBtnText, language === "ta" && styles.langBtnTextActive]}>
                தமிழ்
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Section 1: My Account */}
        <Text style={styles.groupSectionHeader}>MY ACCOUNT</Text>
        <View style={styles.menuContainer}>
          {/* 1. My Bookings */}
          <Pressable
            onPress={() => setActiveTab("bookings")}
            style={styles.menuItem}
            accessibilityRole="button"
            accessibilityLabel="My Bookings"
          >
            <View style={styles.menuItemLeft}>
              <View style={styles.menuIconCircle}>
                <Ionicons name="calendar-outline" size={18} color={colors.primary} />
              </View>
              <Text style={styles.menuItemText}>My Bookings</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.muted} />
          </Pressable>

          {/* 2. Saved Addresses */}
          <Pressable
            onPress={() => setShowAddressesModal(true)}
            style={styles.menuItem}
            accessibilityRole="button"
            accessibilityLabel="Saved Addresses"
          >
            <View style={styles.menuItemLeft}>
              <View style={styles.menuIconCircle}>
                <Ionicons name="location-outline" size={18} color={colors.primary} />
              </View>
              <Text style={styles.menuItemText}>Saved Addresses</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.muted} />
          </Pressable>

          {/* 3. Payment Methods */}
          <Pressable
            onPress={() => setShowPaymentMethodsModal(true)}
            style={styles.menuItem}
            accessibilityRole="button"
            accessibilityLabel="Payment Methods"
          >
            <View style={styles.menuItemLeft}>
              <View style={styles.menuIconCircle}>
                <Ionicons name="card-outline" size={18} color={colors.primary} />
              </View>
              <Text style={styles.menuItemText}>Payment Methods</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.muted} />
          </Pressable>
        </View>

        {/* Section 2: Support & Assistance */}
        <Text style={styles.groupSectionHeader}>SUPPORT &amp; ASSISTANCE</Text>
        <View style={styles.menuContainer}>
          {/* WhatsApp Support */}
          <Pressable
            onPress={() => Linking.openURL("https://wa.me/917676076361?text=Hi%20NammaPros%20Support")}
            style={styles.menuItem}
            accessibilityRole="button"
            accessibilityLabel="WhatsApp Support"
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuIconCircle, { backgroundColor: "#E6F7ED" }]}>
                <Ionicons name="logo-whatsapp" size={18} color="#1B7F43" />
              </View>
              <Text style={styles.menuItemText}>WhatsApp Support</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.muted} />
          </Pressable>

          {/* Call Support */}
          <Pressable
            onPress={() => Linking.openURL("tel:+917676076361")}
            style={styles.menuItem}
            accessibilityRole="button"
            accessibilityLabel="Call Support"
          >
            <View style={styles.menuItemLeft}>
              <View style={styles.menuIconCircle}>
                <Ionicons name="call-outline" size={18} color={colors.primary} />
              </View>
              <Text style={styles.menuItemText}>Call Support (+91 76760 76361)</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.muted} />
          </Pressable>

          {/* Help & FAQs */}
          <Pressable
            onPress={() => setIsHelpModalOpen(true)}
            style={styles.menuItem}
            accessibilityRole="button"
            accessibilityLabel="Frequently Asked Questions"
          >
            <View style={styles.menuItemLeft}>
              <View style={styles.menuIconCircle}>
                <Ionicons name="help-circle-outline" size={18} color={colors.primary} />
              </View>
              <Text style={styles.menuItemText}>Frequently Asked Questions</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.muted} />
          </Pressable>
        </View>

        {/* Section 3: Legal & Information */}
        <Text style={styles.groupSectionHeader}>LEGAL &amp; INFORMATION</Text>
        <View style={styles.menuContainer}>
          {/* About Namma Pros */}
          <Pressable
            onPress={() => setShowAboutModal(true)}
            style={styles.menuItem}
            accessibilityRole="button"
            accessibilityLabel="About Namma Pros"
          >
            <View style={styles.menuItemLeft}>
              <View style={styles.menuIconCircle}>
                <Ionicons name="information-circle-outline" size={18} color={colors.primary} />
              </View>
              <Text style={styles.menuItemText}>About Namma Pros</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.muted} />
          </Pressable>

          {/* Privacy Policy */}
          <Pressable
            onPress={() => Alert.alert("Privacy Policy", "NammaPros respects your privacy. We never sell your personal information or phone number to third parties. All booking information is encrypted.")}
            style={styles.menuItem}
            accessibilityRole="button"
            accessibilityLabel="Privacy Policy"
          >
            <View style={styles.menuItemLeft}>
              <View style={styles.menuIconCircle}>
                <Ionicons name="shield-checkmark-outline" size={18} color={colors.primary} />
              </View>
              <Text style={styles.menuItemText}>Privacy Policy</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.muted} />
          </Pressable>

          {/* Terms & Conditions */}
          <Pressable
            onPress={() => Alert.alert("Terms & Conditions", "All home services booked on NammaPros include verified technicians, upfront transparent pricing, and our 30-Day Free Rework Guarantee.")}
            style={styles.menuItem}
            accessibilityRole="button"
            accessibilityLabel="Terms and Conditions"
          >
            <View style={styles.menuItemLeft}>
              <View style={styles.menuIconCircle}>
                <Ionicons name="document-text-outline" size={18} color={colors.primary} />
              </View>
              <Text style={styles.menuItemText}>Terms and Conditions</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.muted} />
          </Pressable>

          {/* Cancellation & Refund */}
          <Pressable
            onPress={() => Alert.alert("Cancellation & Refund Policy", "Free cancellation up to 2 hours prior to scheduled visit. 100% instant refund on prepaid bookings upon cancellation.")}
            style={styles.menuItem}
            accessibilityRole="button"
            accessibilityLabel="Cancellation and Refund Policy"
          >
            <View style={styles.menuItemLeft}>
              <View style={styles.menuIconCircle}>
                <Ionicons name="receipt-outline" size={18} color={colors.primary} />
              </View>
              <Text style={styles.menuItemText}>Cancellation &amp; Refund Policy</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.muted} />
          </Pressable>

          {/* Backend & API Settings */}
          <Pressable
            onPress={() => setShowBackendModal(true)}
            style={styles.menuItem}
            accessibilityRole="button"
            accessibilityLabel="Backend & API Settings"
          >
            <View style={styles.menuItemLeft}>
              <View style={styles.menuIconCircle}>
                <Ionicons name="server-outline" size={18} color={colors.primary} />
              </View>
              <Text style={styles.menuItemText}>Backend &amp; API Settings</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.muted} />
          </Pressable>
        </View>

        {/* Secondary Sign Out Button matching ps-mobile */}
        {Boolean(user) && (
          <Pressable
            onPress={() => {
              Alert.alert("Sign Out", "Are you sure you want to sign out?", [
                { text: "Cancel", style: "cancel" },
                { text: "Sign Out", style: "destructive", onPress: signOut },
              ]);
            }}
            style={styles.signOutFullBtn}
            accessibilityRole="button"
            accessibilityLabel="Sign out"
          >
            <Text style={styles.signOutFullBtnText}>Sign out</Text>
          </Pressable>
        )}

        {/* Brand Version */}
        <View style={styles.versionFooter}>
          <Text style={styles.versionBrand}>namma pros.</Text>
          <Text style={styles.versionText}>Version 2.0 • Live Cloud Run Connected</Text>
        </View>
      </ScrollView>

      {/* ========================================================
          MODAL: SAVED ADDRESSES
          ======================================================== */}
      {showAddressesModal && (
        <Modal
          visible={showAddressesModal}
          animationType="slide"
          transparent={false}
          statusBarTranslucent={false}
          onRequestClose={() => setShowAddressesModal(false)}
        >
          <SafeAreaView style={styles.modalSafeArea} edges={["top", "bottom", "left", "right"]}>
            <SwipeBackContainer onBack={() => setShowAddressesModal(false)} style={{ flex: 1 }}>
              <View style={styles.modalHeader}>
                <Pressable
                  onPress={() => setShowAddressesModal(false)}
                  style={styles.modalBackBtn}
                  accessibilityRole="button"
                  accessibilityLabel="Back"
                >
                  <Ionicons name="arrow-back" size={24} color={colors.ink} />
                </Pressable>
                <Text style={styles.modalTitle}>Saved Addresses</Text>
                <View style={{ width: 36 }} />
              </View>
              <ScrollView style={styles.modalScroll} contentContainerStyle={styles.modalContent}>
                {savedAddresses.map((addr) => (
                  <View key={addr.id} style={styles.savedAddrCard}>
                    <View style={styles.savedAddrHeader}>
                      <Ionicons name="home" size={18} color={colors.primary} />
                      <Text style={styles.savedAddrLabel}>{addr.label || "Address"}</Text>
                    </View>
                    <Text style={styles.savedAddrLine}>{addr.line_1}</Text>
                  </View>
                ))}
              </ScrollView>
            </SwipeBackContainer>
          </SafeAreaView>
        </Modal>
      )}

      {/* ========================================================
          MODAL: PAYMENT METHODS
          ======================================================== */}
      {showPaymentMethodsModal && (
        <Modal
          visible={showPaymentMethodsModal}
          animationType="slide"
          transparent={false}
          statusBarTranslucent={false}
          onRequestClose={() => setShowPaymentMethodsModal(false)}
        >
          <SafeAreaView style={styles.modalSafeArea} edges={["top", "bottom", "left", "right"]}>
            <SwipeBackContainer onBack={() => setShowPaymentMethodsModal(false)} style={{ flex: 1 }}>
              <View style={styles.modalHeader}>
                <Pressable
                  onPress={() => setShowPaymentMethodsModal(false)}
                  style={styles.modalBackBtn}
                  accessibilityRole="button"
                  accessibilityLabel="Back"
                >
                  <Ionicons name="arrow-back" size={24} color={colors.ink} />
                </Pressable>
                <Text style={styles.modalTitle}>Payment Methods</Text>
                <View style={{ width: 36 }} />
              </View>
              <ScrollView style={styles.modalScroll} contentContainerStyle={styles.modalContent}>
                <View style={styles.paymentMethodCard}>
                  <Ionicons name="flash" size={22} color={colors.primary} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.paymentMethodTitle}>UPI (Instant Pay)</Text>
                    <Text style={styles.paymentMethodSub}>Google Pay, PhonePe, Paytm</Text>
                  </View>
                  <Ionicons name="checkmark-circle" size={20} color={colors.success} />
                </View>

                <View style={styles.paymentMethodCard}>
                  <Ionicons name="card" size={22} color={colors.primary} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.paymentMethodTitle}>Debit / Credit Card</Text>
                    <Text style={styles.paymentMethodSub}>Visa, MasterCard, RuPay</Text>
                  </View>
                </View>

                <View style={styles.paymentMethodCard}>
                  <Ionicons name="cash" size={22} color={colors.primary} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.paymentMethodTitle}>Pay After Service</Text>
                    <Text style={styles.paymentMethodSub}>Pay technician via UPI QR code</Text>
                  </View>
                </View>
              </ScrollView>
            </SwipeBackContainer>
          </SafeAreaView>
        </Modal>
      )}

      {/* ========================================================
          MODAL: BACKEND API SETTINGS
          ======================================================== */}
      {showBackendModal && (
        <Modal
          visible={showBackendModal}
          animationType="slide"
          transparent={false}
          statusBarTranslucent={false}
          onRequestClose={() => setShowBackendModal(false)}
        >
          <SafeAreaView style={styles.modalSafeArea} edges={["top", "bottom", "left", "right"]}>
            <SwipeBackContainer onBack={() => setShowBackendModal(false)} style={{ flex: 1 }}>
              <View style={styles.modalHeader}>
                <Pressable
                  onPress={() => setShowBackendModal(false)}
                  style={styles.modalBackBtn}
                  accessibilityRole="button"
                  accessibilityLabel="Back"
                >
                  <Ionicons name="arrow-back" size={24} color={colors.ink} />
                </Pressable>
                <Text style={styles.modalTitle}>Backend &amp; API Settings</Text>
                <View style={{ width: 36 }} />
              </View>
              <ScrollView style={styles.modalScroll} contentContainerStyle={styles.modalContent}>
                <View style={styles.backendCard}>
                  <Text style={styles.backendHeading}>Active Backend URL</Text>
                  <Text style={styles.backendUrlText}>{currentApiUrl}</Text>

                  <Pressable
                    onPress={() => handleTestPing()}
                    disabled={testingPing}
                    style={styles.pingBtn}
                  >
                    {testingPing ? (
                      <ActivityIndicator size="small" color={colors.white} />
                    ) : (
                      <Text style={styles.pingBtnText}>Test Backend Ping</Text>
                    )}
                  </Pressable>

                  {pingLatency !== null && (
                    <Text style={styles.pingResultText}>
                      Latency: {pingLatency} ms (Healthy)
                    </Text>
                  )}
                </View>

                <View style={styles.switchBox}>
                  <Text style={styles.switchBoxTitle}>Switch Deployed Endpoints</Text>
                  <Pressable
                    onPress={() => handleSwitchBackend(CLOUD_RUN_URL_1)}
                    style={styles.switchBtn}
                  >
                    <Text style={styles.switchBtnText}>Cloud Run Production (Active)</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => handleSwitchBackend(CLOUD_RUN_URL_2)}
                    style={styles.switchBtn}
                  >
                    <Text style={styles.switchBtnText}>Cloud Run Direct</Text>
                  </Pressable>
                </View>
              </ScrollView>
            </SwipeBackContainer>
          </SafeAreaView>
        </Modal>
      )}

      {/* ========================================================
          MODAL: ABOUT
          ======================================================== */}
      {showAboutModal && (
        <Modal
          visible={showAboutModal}
          animationType="slide"
          transparent={false}
          statusBarTranslucent={false}
          onRequestClose={() => setShowAboutModal(false)}
        >
          <SafeAreaView style={styles.modalSafeArea} edges={["top", "bottom", "left", "right"]}>
            <SwipeBackContainer onBack={() => setShowAboutModal(false)} style={{ flex: 1 }}>
              <View style={styles.modalHeader}>
                <Pressable
                  onPress={() => setShowAboutModal(false)}
                  style={styles.modalBackBtn}
                  accessibilityRole="button"
                  accessibilityLabel="Back"
                >
                  <Ionicons name="arrow-back" size={24} color={colors.ink} />
                </Pressable>
                <Text style={styles.modalTitle}>About Namma Pros</Text>
                <View style={{ width: 36 }} />
              </View>
              <ScrollView style={styles.modalScroll} contentContainerStyle={styles.modalContent}>
                <Text style={styles.aboutHeading}>namma pros.</Text>
                <Text style={styles.aboutTagline}>Your Home. Our Expertise.</Text>
                <Text style={styles.aboutParagraph}>
                  NammaPros is Chennai and Coimbatore&apos;s leading on-demand home services
                  platform. We deliver upfront transparent pricing, background-verified
                  professionals, direct slot booking, and an ironclad 30-Day Rework Guarantee.
                </Text>
              </ScrollView>
            </SwipeBackContainer>
          </SafeAreaView>
        </Modal>
      )}
    </SwipeBackContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: 12,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    height: 52,
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.ink,
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: spacing.xl,
    paddingBottom: 90,
    gap: spacing.lg,
  },

  // Profile Card matching Screen 21
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
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
  avatarCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitials: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.white,
  },
  profileTextWrap: {
    flex: 1,
  },
  profileName: {
    fontSize: 17,
    fontWeight: "800",
    color: colors.ink,
  },
  profilePhone: {
    fontSize: 13,
    color: colors.muted,
    marginTop: 2,
  },
  signInBadgeBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radii.pill,
  },
  signInBadgeText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: "700",
  },
  signOutSmallBtn: {
    padding: spacing.sm,
  },

  // Language Card from ps-mobile
  languageCard: {
    minHeight: 66,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: "#E8E1DB",
    borderRadius: radii.xl,
    backgroundColor: colors.surface,
  },
  languageTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.ink,
  },
  languageHint: {
    marginTop: 2,
    fontSize: 11,
    color: colors.muted,
  },
  languageButtons: {
    flexDirection: "row",
    gap: 6,
  },
  langBtn: {
    minHeight: 34,
    minWidth: 42,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 12,
    borderRadius: radii.sm,
    backgroundColor: "#F5F2EF",
    borderWidth: 1,
    borderColor: "#E5DDD5",
  },
  langBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  langBtnText: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.ink,
  },
  langBtnTextActive: {
    color: colors.white,
  },

  // Section Group Headers
  groupSectionHeader: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.8,
    color: colors.muted,
    marginBottom: -4,
    marginTop: 4,
    paddingHorizontal: 2,
  },

  // Menu List
  menuContainer: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: "#E8E1DB",
    overflow: "hidden",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  menuIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  menuItemText: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.ink,
  },

  // Secondary Sign Out Button from ps-mobile
  signOutFullBtn: {
    minHeight: 48,
    borderRadius: radii.lg,
    borderWidth: 1.5,
    borderColor: "#E5DDD5",
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing.xs,
  },
  signOutFullBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.primary,
  },

  versionFooter: {
    alignItems: "center",
    paddingVertical: spacing.lg,
    gap: 4,
  },
  versionBrand: {
    fontSize: 16,
    fontWeight: "900",
    color: colors.ink,
    letterSpacing: -0.3,
  },
  versionText: {
    fontSize: 11,
    color: colors.muted,
  },

  // Modals generic
  modalSafeArea: {
    flex: 1,
    backgroundColor: colors.surface,
    paddingTop: Platform.OS === "android" ? Math.max(StatusBar.currentHeight || 28, 28) : 0,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    height: 52,
  },
  modalBackBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.ink,
  },
  modalScroll: {
    flex: 1,
  },
  modalContent: {
    padding: spacing.xl,
    gap: spacing.md,
  },
  savedAddrCard: {
    backgroundColor: colors.canvasWarm,
    borderRadius: radii.lg,
    padding: spacing.lg,
    gap: spacing.xs,
  },
  savedAddrHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  savedAddrLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.ink,
  },
  savedAddrLine: {
    fontSize: 13,
    color: colors.muted,
    marginTop: 2,
    lineHeight: 18,
  },
  paymentMethodCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.canvasWarm,
    borderRadius: radii.lg,
    padding: spacing.lg,
    gap: spacing.md,
  },
  paymentMethodTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.ink,
  },
  paymentMethodSub: {
    fontSize: 12,
    color: colors.muted,
    marginTop: 2,
  },
  backendCard: {
    backgroundColor: colors.canvasWarm,
    borderRadius: radii.lg,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  backendHeading: {
    fontSize: 12,
    color: colors.muted,
    fontWeight: "600",
  },
  backendUrlText: {
    fontSize: 13,
    color: colors.ink,
    fontWeight: "700",
  },
  pingBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 10,
    borderRadius: radii.md,
    alignItems: "center",
    marginTop: spacing.xs,
  },
  pingBtnText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: "700",
  },
  pingResultText: {
    fontSize: 12,
    color: colors.success,
    fontWeight: "700",
    marginTop: 4,
  },
  switchBox: {
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  switchBoxTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.ink,
  },
  switchBtn: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: spacing.md,
    borderRadius: radii.md,
  },
  switchBtnText: {
    fontSize: 13,
    color: colors.ink,
    fontWeight: "600",
  },
  aboutHeading: {
    fontSize: 24,
    fontWeight: "900",
    color: colors.ink,
  },
  aboutTagline: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.primary,
    marginBottom: spacing.md,
  },
  aboutParagraph: {
    fontSize: 14,
    color: colors.inkSecondary,
    lineHeight: 22,
  },
});
