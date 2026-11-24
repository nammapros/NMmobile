import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { api, CLOUD_RUN_URL_1, CLOUD_RUN_URL_2 } from "../api";
import { useApp } from "../state/AppContext";
import { colors, radii, spacing } from "../theme";

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
  } = useApp();

  const [pingLatency, setPingLatency] = useState<number | null>(null);
  const [testingPing, setTestingPing] = useState(false);
  const [customUrlInput, setCustomUrlInput] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);

  // Notification Preferences
  const [whatsappOptIn, setWhatsappOptIn] = useState(true);
  const [smsOptIn, setSmsOptIn] = useState(true);

  // Quick Sign In modal state
  const [phoneInput, setPhoneInput] = useState("");
  const [showLoginBox, setShowLoginBox] = useState(false);

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
    setShowCustomInput(false);
  };

  const handleQuickLogin = async () => {
    const digits = phoneInput.replace(/\D/g, "");
    if (digits.length !== 10) {
      Alert.alert("Invalid Phone", "Please enter a valid 10-digit mobile number.");
      return;
    }
    const phone_e164 = `+91${digits}`;

    // Demo/Simulated tokens to allow smooth testing
    await signIn(
      { access: `cust_token_${Date.now()}`, refresh: `cust_refresh_${Date.now()}` },
      { id: Date.now(), phone_e164, name: "NammaPros Customer", role: "CUSTOMER" }
    );
    setShowLoginBox(false);
    Alert.alert("Signed In", `Welcome back! Signed in with ${phone_e164}`);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* 1. User Profile Header */}
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={28} color={colors.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.userName}>
            {user?.name || "Welcome, Guest"}
          </Text>
          <Text style={styles.userPhone}>
            {user?.phone_e164 || "Sign in for saved addresses & booking tracking"}
          </Text>
          {user ? (
            <View style={styles.verifiedTag}>
              <Ionicons name="checkmark-circle" size={12} color={colors.success} />
              <Text style={styles.verifiedTagText}>Verified Firebase Account</Text>
            </View>
          ) : (
            <Pressable
              onPress={() => setIsAuthOpen(true)}
              style={styles.loginBtn}
              accessibilityRole="button"
              accessibilityLabel="Sign in with Firebase OTP"
            >
              <Ionicons name="key-outline" size={13} color={colors.primary} />
              <Text style={styles.loginBtnText}>Sign In with Firebase OTP</Text>
            </Pressable>
          )}
        </View>
      </View>

      {/* 2. Live Cloud Run Backend Selector */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <Ionicons name="cloud-done" size={20} color={colors.primary} />
          <View style={{ flex: 1 }}>
            <Text style={styles.sectionTitle}>Live Cloud Run Backend</Text>
            <Text style={styles.sectionSub}>Manage active API endpoints and test latency</Text>
          </View>
        </View>

        {/* Current Active URL */}
        <View style={styles.activeUrlBox}>
          <View style={styles.urlHeaderRow}>
            <View style={styles.liveIndicator}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>CONNECTED</Text>
            </View>
            <Pressable
              onPress={() => handleTestPing()}
              disabled={testingPing}
              style={styles.pingBtn}
            >
              {testingPing ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <>
                  <Ionicons name="speedometer-outline" size={13} color={colors.primary} />
                  <Text style={styles.pingBtnText}>
                    {pingLatency !== null ? `${pingLatency}ms` : "Test Ping"}
                  </Text>
                </>
              )}
            </Pressable>
          </View>
          <Text style={styles.activeUrlText} numberOfLines={2}>
            {currentApiUrl}
          </Text>
        </View>

        {/* Cloud Run Preset Buttons */}
        <View style={styles.backendPresetContainer}>
          <Pressable
            onPress={() => handleSwitchBackend(CLOUD_RUN_URL_1)}
            style={[
              styles.presetBtn,
              currentApiUrl === CLOUD_RUN_URL_1 && styles.presetBtnActive,
            ]}
          >
            <Ionicons
              name={currentApiUrl === CLOUD_RUN_URL_1 ? "radio-button-on" : "radio-button-off"}
              size={16}
              color={currentApiUrl === CLOUD_RUN_URL_1 ? colors.primary : colors.muted}
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.presetTitle}>Cloud Run 1 (Primary)</Text>
              <Text style={styles.presetSub} numberOfLines={1}>
                nammapros-api-production-177323361322
              </Text>
            </View>
          </Pressable>

          <Pressable
            onPress={() => handleSwitchBackend(CLOUD_RUN_URL_2)}
            style={[
              styles.presetBtn,
              currentApiUrl === CLOUD_RUN_URL_2 && styles.presetBtnActive,
            ]}
          >
            <Ionicons
              name={currentApiUrl === CLOUD_RUN_URL_2 ? "radio-button-on" : "radio-button-off"}
              size={16}
              color={currentApiUrl === CLOUD_RUN_URL_2 ? colors.primary : colors.muted}
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.presetTitle}>Cloud Run 2 (Secondary)</Text>
              <Text style={styles.presetSub} numberOfLines={1}>
                nammapros-api-production-xlexcj72qa
              </Text>
            </View>
          </Pressable>
        </View>

        {/* Custom URL Toggle */}
        <Pressable
          onPress={() => setShowCustomInput(!showCustomInput)}
          style={styles.customToggleBtn}
        >
          <Text style={styles.customToggleText}>
            {showCustomInput ? "Hide Custom URL" : "+ Set Custom Backend URL"}
          </Text>
        </Pressable>

        {Boolean(showCustomInput) && (
          <View style={styles.customInputRow}>
            <TextInput
              placeholder="https://your-api.run.app"
              placeholderTextColor={colors.subtle}
              value={customUrlInput}
              onChangeText={setCustomUrlInput}
              autoCapitalize="none"
              style={styles.customInput}
            />
            <Pressable onPress={handleApplyCustomUrl} style={styles.customApplyBtn}>
              <Text style={styles.customApplyBtnText}>Apply</Text>
            </Pressable>
          </View>
        )}
      </View>

      {/* 3. Service Location Settings */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <Ionicons name="location-outline" size={20} color={colors.primary} />
          <View style={{ flex: 1 }}>
            <Text style={styles.sectionTitle}>Service City & Zone</Text>
            <Text style={styles.sectionSub}>Available services and slots adapt to your city</Text>
          </View>
          <Pressable onPress={() => setIsLocationModalOpen(true)}>
            <Text style={styles.changeLink}>Change</Text>
          </Pressable>
        </View>
        <View style={styles.cityInfoRow}>
          <Text style={styles.cityLabel}>{selectedCity}</Text>
          <Text style={styles.pinLabel}>Pincode: {selectedPincode}</Text>
        </View>
      </View>

      {/* 4. Notification Preferences */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <Ionicons name="notifications-outline" size={20} color={colors.primary} />
          <View style={{ flex: 1 }}>
            <Text style={styles.sectionTitle}>Notification Alerts</Text>
            <Text style={styles.sectionSub}>Booking status, technician arrival, and receipts</Text>
          </View>
        </View>
        <View style={styles.prefRow}>
          <View>
            <Text style={styles.prefTitle}>WhatsApp Updates</Text>
            <Text style={styles.prefSub}>Instant technician ETA & OTP notifications</Text>
          </View>
          <Switch
            value={whatsappOptIn}
            onValueChange={setWhatsappOptIn}
            trackColor={{ false: colors.border, true: colors.primary }}
          />
        </View>
        <View style={styles.prefRow}>
          <View>
            <Text style={styles.prefTitle}>SMS Alerts</Text>
            <Text style={styles.prefSub}>Booking confirmation and invoice links</Text>
          </View>
          <Switch
            value={smsOptIn}
            onValueChange={setSmsOptIn}
            trackColor={{ false: colors.border, true: colors.primary }}
          />
        </View>
      </View>

      {/* 5. Refer & Earn ₹200 Card */}
      <View style={styles.referralCard}>
        <View style={styles.referralIcon}>
          <Ionicons name="gift-outline" size={24} color={colors.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.referralTitle}>Refer Friends & Earn ₹200</Text>
          <Text style={styles.referralSub}>
            Share code “NAMP200” with friends. They get ₹100 off, you get ₹200 wallet credits!
          </Text>
        </View>
      </View>

      {/* 6. Help & Support */}
      <View style={styles.sectionCard}>
        <Pressable
          onPress={() => Linking.openURL("mailto:support@nammapros.com")}
          style={styles.linkRow}
        >
          <Ionicons name="mail-outline" size={18} color={colors.ink} />
          <Text style={styles.linkRowText}>Email Support (support@nammapros.com)</Text>
          <Ionicons name="chevron-forward" size={16} color={colors.muted} />
        </Pressable>
        <Pressable
          onPress={() => Linking.openURL("tel:+918001234567")}
          style={styles.linkRow}
        >
          <Ionicons name="call-outline" size={18} color={colors.ink} />
          <Text style={styles.linkRowText}>Helpline (1800-123-4567)</Text>
          <Ionicons name="chevron-forward" size={16} color={colors.muted} />
        </Pressable>
      </View>

      {/* 7. Sign Out */}
      {Boolean(user) && (
        <Pressable onPress={signOut} style={styles.signOutBtn}>
          <Ionicons name="log-out-outline" size={18} color={colors.error} />
          <Text style={styles.signOutBtnText}>Sign Out</Text>
        </Pressable>
      )}

      {/* App Version */}
      <Text style={styles.versionText}>NammaPros Customer App v1.0.0 (Expo React Native)</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.md,
    paddingBottom: spacing.xxxl,
  },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  userName: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.ink,
  },
  userPhone: {
    fontSize: 12,
    color: colors.muted,
    marginTop: 2,
  },
  verifiedTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 6,
  },
  verifiedTagText: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.success,
  },
  loginBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    alignSelf: "flex-start",
    backgroundColor: colors.primarySoft,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radii.sm,
    marginTop: 6,
  },
  loginBtnText: {
    fontSize: 11,
    fontWeight: "800",
    color: colors.primary,
  },
  loginFormBox: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.primary,
    gap: spacing.xs,
  },
  loginFormTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.ink,
  },
  loginFormSub: {
    fontSize: 11,
    color: colors.muted,
    marginBottom: spacing.xs,
  },
  phoneInputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.canvasWarm,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    height: 44,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  countryCode: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.ink,
  },
  phoneInput: {
    flex: 1,
    fontSize: 13,
    color: colors.ink,
  },
  submitLoginBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 10,
    borderRadius: radii.md,
    alignItems: "center",
    marginTop: spacing.xs,
  },
  submitLoginBtnText: {
    color: colors.white,
    fontWeight: "700",
    fontSize: 12,
  },
  sectionCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.ink,
  },
  sectionSub: {
    fontSize: 11,
    color: colors.muted,
    marginTop: 1,
  },
  changeLink: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.primary,
  },
  activeUrlBox: {
    backgroundColor: colors.canvasWarm,
    borderRadius: radii.md,
    padding: spacing.md,
    gap: 6,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  urlHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  liveIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.success,
  },
  liveText: {
    fontSize: 10,
    fontWeight: "800",
    color: colors.success,
    letterSpacing: 0.5,
  },
  pingBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radii.sm,
    gap: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pingBtnText: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.primary,
  },
  activeUrlText: {
    fontSize: 11,
    color: colors.inkSecondary,
    fontFamily: "monospace",
  },
  backendPresetContainer: {
    gap: spacing.xs,
  },
  presetBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.canvas,
    borderRadius: radii.md,
    padding: spacing.md,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  presetBtnActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  presetTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.ink,
  },
  presetSub: {
    fontSize: 10,
    color: colors.muted,
  },
  customToggleBtn: {
    alignSelf: "flex-start",
  },
  customToggleText: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.primary,
  },
  customInputRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  customInput: {
    flex: 1,
    height: 40,
    backgroundColor: colors.canvas,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    fontSize: 11,
    color: colors.ink,
  },
  customApplyBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    justifyContent: "center",
    borderRadius: radii.md,
  },
  customApplyBtnText: {
    color: colors.white,
    fontWeight: "700",
    fontSize: 12,
  },
  cityInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.canvasWarm,
    padding: spacing.md,
    borderRadius: radii.md,
  },
  cityLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.ink,
  },
  pinLabel: {
    fontSize: 12,
    color: colors.muted,
  },
  prefRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  prefTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.ink,
  },
  prefSub: {
    fontSize: 10,
    color: colors.muted,
  },
  referralCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.goldBg,
    borderRadius: radii.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: "rgba(200, 163, 91, 0.3)",
    gap: spacing.md,
  },
  referralIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  referralTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: colors.ink,
  },
  referralSub: {
    fontSize: 11,
    color: colors.muted,
    lineHeight: 16,
    marginTop: 2,
  },
  linkRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.xs,
    gap: spacing.sm,
  },
  linkRowText: {
    flex: 1,
    fontSize: 12,
    fontWeight: "600",
    color: colors.ink,
  },
  signOutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.errorBg,
    paddingVertical: 12,
    borderRadius: radii.md,
    gap: 6,
  },
  signOutBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.error,
  },
  versionText: {
    textAlign: "center",
    fontSize: 11,
    color: colors.subtle,
    marginTop: spacing.sm,
  },
});
