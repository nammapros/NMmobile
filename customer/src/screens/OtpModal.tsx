import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  authenticateWithFirebaseOtp,
  formatIndianPhoneNumber,
  isValidIndianPhoneNumber,
  sendFirebaseOtp,
  type SendOtpResult,
} from "../services/firebaseAuth";
import { useApp } from "../state/AppContext";
import { colors, radii, spacing } from "../theme";

export function OtpModal() {
  const { isAuthOpen, setIsAuthOpen, signIn } = useApp();

  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [sessionInfo, setSessionInfo] = useState("");
  const [isDevMode, setIsDevMode] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 30-second resend countdown timer
  const [timerSeconds, setTimerSeconds] = useState(30);
  const timerRef = useRef<any>(null);

  const otpInputRef = useRef<any>(null);

  useEffect(() => {
    if (!isAuthOpen) {
      // Reset state on close
      setStep("phone");
      setPhoneNumber("");
      setOtpCode("");
      setSessionInfo("");
      setErrorMessage(null);
      setLoading(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  }, [isAuthOpen]);

  useEffect(() => {
    if (step === "otp") {
      setTimerSeconds(30);
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setTimerSeconds((prev) => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      setTimeout(() => otpInputRef.current?.focus(), 300);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [step]);

  if (!isAuthOpen) return null;

  const handleSendCode = async () => {
    setErrorMessage(null);
    const cleanPhone = phoneNumber.replace(/\D/g, "");
    if (cleanPhone.length !== 10) {
      setErrorMessage("Please enter a valid 10-digit mobile number.");
      return;
    }

    setLoading(true);
    try {
      const res: SendOtpResult = await sendFirebaseOtp(cleanPhone);
      setSessionInfo(res.sessionInfo);
      setIsDevMode(res.isDev);
      setStep("otp");
      setOtpCode("");
    } catch (err: any) {
      setErrorMessage(err.message || "Could not send verification code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (codeToVerify?: string) => {
    const code = (codeToVerify || otpCode).replace(/\D/g, "").trim();
    if (code.length !== 6) {
      setErrorMessage("Please enter the complete 6-digit verification code.");
      return;
    }

    setErrorMessage(null);
    setLoading(true);

    try {
      const formatted = formatIndianPhoneNumber(phoneNumber);
      const { tokens, profile } = await authenticateWithFirebaseOtp(
        sessionInfo,
        code,
        formatted
      );
      await signIn(tokens, profile);
      setIsAuthOpen(false);
      Alert.alert(
        "Welcome to NammaPros! 🎉",
        `You are successfully signed in with ${formatted}. Your bookings and addresses will be synced.`
      );
    } catch (err: any) {
      setErrorMessage(err.message || "Invalid verification code. Please check and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (text: string) => {
    const cleaned = text.replace(/\D/g, "").slice(0, 6);
    setOtpCode(cleaned);
    setErrorMessage(null);
    if (cleaned.length === 6) {
      handleVerifyOtp(cleaned);
    }
  };

  const handleResendCode = () => {
    if (timerSeconds > 0) return;
    handleSendCode();
  };

  const formattedPhoneDisplay = formatIndianPhoneNumber(phoneNumber);

  return (
    <Modal
      visible={isAuthOpen}
      animationType="slide"
      transparent
      onRequestClose={() => setIsAuthOpen(false)}
    >
      <KeyboardAvoidingView
        style={styles.modalOverlay}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <Pressable style={styles.backdrop} onPress={() => setIsAuthOpen(false)} />

        <View style={styles.sheetContainer}>
          {/* Top Handle Bar */}
          <View style={styles.handleBar} />

          {/* Header Row */}
          <View style={styles.headerRow}>
            <Pressable
              onPress={() => (step === "otp" ? setStep("phone") : setIsAuthOpen(false))}
              style={styles.closeBtn}
              accessibilityRole="button"
              accessibilityLabel="Back"
            >
              <Ionicons name="arrow-back" size={20} color={colors.ink} />
            </Pressable>

            <View style={styles.brandCenterRow}>
              <Text style={styles.brandNameText}>namma pros</Text>
              <View style={styles.brandDotSmall} />
            </View>

            <View style={{ width: 32 }} />
          </View>

          {/* Error Banner */}
          {Boolean(errorMessage) && (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={16} color={colors.error} />
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          )}

          {step === "phone" ? (
            /* STEP 1: Phone Number Input */
            <View style={styles.contentBox}>
              <Text style={styles.sheetTitle}>Sign In / Sign Up</Text>
              <Text style={styles.sheetSubtitle}>
                Enter your mobile number to receive a 6-digit Firebase verification OTP code.
              </Text>

              <View style={styles.phoneInputContainer}>
                {/* Country Code Pill */}
                <View style={styles.countryCodePill}>
                  <Text style={styles.flagEmoji}>🇮🇳</Text>
                  <Text style={styles.countryCodeText}>+91</Text>
                </View>

                {/* Number Input */}
                <TextInput
                  placeholder="98765 43210"
                  placeholderTextColor={colors.subtle}
                  value={phoneNumber}
                  onChangeText={(t) => {
                    setPhoneNumber(t.replace(/\D/g, "").slice(0, 10));
                    setErrorMessage(null);
                  }}
                  keyboardType="phone-pad"
                  maxLength={10}
                  autoFocus
                  style={styles.phoneInput}
                />
              </View>

              <Pressable
                onPress={handleSendCode}
                disabled={loading || phoneNumber.replace(/\D/g, "").length !== 10}
                style={[
                  styles.primaryBtn,
                  (loading || phoneNumber.replace(/\D/g, "").length !== 10) &&
                    styles.primaryBtnDisabled,
                ]}
              >
                {loading ? (
                  <ActivityIndicator size="small" color={colors.white} />
                ) : (
                  <Text style={styles.primaryBtnText}>Send OTP</Text>
                )}
              </Pressable>

              <View style={styles.securityNote}>
                <Ionicons name="lock-closed-outline" size={13} color={colors.muted} />
                <Text style={styles.securityNoteText}>
                  Your number is secured with Firebase Auth. Upfront pricing, direct booking.
                </Text>
              </View>
            </View>
          ) : (
            /* STEP 2: 6-Digit OTP Verification */
            <View style={styles.contentBox}>
              <Text style={styles.sheetTitle}>Enter OTP</Text>
              <View style={styles.phoneVerifyRow}>
                <Text style={styles.codeSentText}>
                  We&apos;ve sent a 6-digit code to <Text style={styles.boldPhone}>{formattedPhoneDisplay}</Text>
                </Text>
                <Pressable onPress={() => setStep("phone")}>
                  <Text style={styles.editPhoneLink}>Edit</Text>
                </Pressable>
              </View>

              {/* Dev mode / Test number banner */}
              {Boolean(isDevMode) && (
                <View style={styles.devModeBanner}>
                  <Ionicons name="information-circle" size={16} color={colors.primary} />
                  <Text style={styles.devModeText}>
                    Test Mode: Firebase API key not set. Enter code{" "}
                    <Text style={{ fontWeight: "800" }}>123456</Text> to sign in.
                  </Text>
                </View>
              )}

              {/* 6 Digit Cells Display */}
              <Pressable
                onPress={() => otpInputRef.current?.focus()}
                style={styles.otpBoxesRow}
              >
                {[0, 1, 2, 3, 4, 5].map((index) => {
                  const digit = otpCode[index] || "";
                  const isCurrent = otpCode.length === index;
                  return (
                    <View
                      key={index}
                      style={[
                        styles.otpBoxCell,
                        Boolean(digit) && styles.otpBoxCellFilled,
                        isCurrent && styles.otpBoxCellFocused,
                      ]}
                    >
                      <Text style={styles.otpCellDigit}>{digit}</Text>
                    </View>
                  );
                })}
              </Pressable>

              {/* Invisible Actual Input for native keyboard & one-time-code auto fill */}
              <TextInput
                ref={otpInputRef}
                value={otpCode}
                onChangeText={handleOtpChange}
                keyboardType="number-pad"
                maxLength={6}
                textContentType="oneTimeCode"
                style={styles.hiddenInput}
              />

              <Pressable
                onPress={() => handleVerifyOtp()}
                disabled={loading || otpCode.length !== 6}
                style={[
                  styles.primaryBtn,
                  (loading || otpCode.length !== 6) && styles.primaryBtnDisabled,
                ]}
              >
                {loading ? (
                  <ActivityIndicator size="small" color={colors.white} />
                ) : (
                  <Text style={styles.primaryBtnText}>Verify</Text>
                )}
              </Pressable>

              {/* Resend Timer Row */}
              <View style={styles.resendRow}>
                {timerSeconds > 0 ? (
                  <Text style={styles.resendTimerText}>
                    Resend OTP ({timerSeconds}s)
                  </Text>
                ) : (
                  <Pressable onPress={handleResendCode} disabled={loading}>
                    <Text style={styles.resendActiveText}>Resend OTP</Text>
                  </Pressable>
                )}
              </View>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(28, 25, 23, 0.5)",
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
  },
  sheetContainer: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
    paddingBottom: Platform.OS === "ios" ? 40 : 25,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 20,
  },
  handleBar: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    alignSelf: "center",
    marginBottom: spacing.md,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },
  brandBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: colors.primarySoft,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radii.sm,
  },
  brandBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    color: colors.primary,
    letterSpacing: 0.5,
  },
  brandCenterRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 3,
  },
  brandNameText: {
    fontSize: 18,
    fontWeight: "900",
    color: colors.ink,
    letterSpacing: -0.4,
  },
  brandDotSmall: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.primary,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.canvasWarm,
    alignItems: "center",
    justifyContent: "center",
  },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.errorBg,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radii.md,
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
  },
  errorText: {
    flex: 1,
    fontSize: 12,
    color: colors.error,
    fontWeight: "600",
  },
  contentBox: {
    paddingVertical: spacing.xs,
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.ink,
    letterSpacing: -0.3,
  },
  sheetSubtitle: {
    fontSize: 13,
    color: colors.muted,
    lineHeight: 18,
    marginTop: 4,
    marginBottom: spacing.lg,
  },
  phoneInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radii.lg,
    backgroundColor: colors.canvasWarm,
    paddingHorizontal: spacing.sm,
    height: 52,
    marginBottom: spacing.lg,
  },
  countryCodePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingRight: spacing.sm,
    borderRightWidth: 1,
    borderRightColor: colors.border,
    marginRight: spacing.sm,
  },
  flagEmoji: {
    fontSize: 16,
  },
  countryCodeText: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.ink,
  },
  phoneInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    color: colors.ink,
    letterSpacing: 1,
  },
  primaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: 26,
    height: 52,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  primaryBtnDisabled: {
    backgroundColor: colors.border,
    shadowOpacity: 0,
    elevation: 0,
  },
  primaryBtnText: {
    fontSize: 15,
    fontWeight: "800",
    color: colors.white,
  },
  securityNote: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    marginTop: spacing.md,
  },
  securityNoteText: {
    fontSize: 11,
    color: colors.subtle,
    textAlign: "center",
  },
  phoneVerifyRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 2,
    marginBottom: spacing.md,
  },
  codeSentText: {
    fontSize: 13,
    color: colors.muted,
  },
  boldPhone: {
    fontWeight: "700",
    color: colors.ink,
  },
  editPhoneLink: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.primary,
    textDecorationLine: "underline",
  },
  devModeBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.primarySoft,
    padding: spacing.sm,
    borderRadius: radii.md,
    marginBottom: spacing.md,
  },
  devModeText: {
    flex: 1,
    fontSize: 12,
    color: colors.primaryDark,
    lineHeight: 16,
  },
  otpBoxesRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.xl,
    marginTop: spacing.xs,
  },
  otpBoxCell: {
    width: 46,
    height: 52,
    borderRadius: radii.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.canvasWarm,
    alignItems: "center",
    justifyContent: "center",
  },
  otpBoxCellFilled: {
    borderColor: colors.primary,
    backgroundColor: colors.surface,
  },
  otpBoxCellFocused: {
    borderColor: colors.primaryDark,
    backgroundColor: colors.surface,
  },
  otpCellDigit: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.ink,
  },
  hiddenInput: {
    position: "absolute",
    width: 1,
    height: 1,
    opacity: 0,
  },
  resendRow: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing.md,
  },
  resendTimerText: {
    fontSize: 12,
    color: colors.muted,
  },
  resendTimerHighlight: {
    fontWeight: "700",
    color: colors.ink,
  },
  resendActiveText: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.primary,
  },
});
