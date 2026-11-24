import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BrandAssets, HomeIconAssets } from "../assets";
import { useApp } from "../state/AppContext";
import { colors, isAndroid, radii, spacing, statusBarHeight, typography } from "../theme";

export function IntroModal() {
  const { isIntroOpen, setIsIntroOpen, setIsAuthOpen, setActiveTab } = useApp();
  const [step, setStep] = useState<"splash" | "onboarding">("splash");

  if (!isIntroOpen) return null;

  const handleGetStarted = () => {
    setStep("onboarding");
  };

  const handleFinishOnboarding = () => {
    setIsIntroOpen(false);
    setStep("splash");
    setActiveTab("home");
  };

  return (
    <Modal
      visible={isIntroOpen}
      animationType="fade"
      transparent={false}
      statusBarTranslucent={true}
      onRequestClose={() => setIsIntroOpen(false)}
    >
      <SafeAreaView style={styles.safeArea}>
        {step === "splash" ? (
          /* ========================================================
             SCREEN 1: SPLASH / INTRO
             ======================================================== */
          <View style={styles.container}>
            {/* Top Brand Header */}
            <View style={styles.header}>
              <View style={styles.brandRow}>
                <Text style={styles.brandName}>namma pros</Text>
                <View style={styles.brandDot} />
              </View>
              <Text style={styles.brandTagline}>Your Home. Our Expertise.</Text>
            </View>

            {/* Central Technician Photo */}
            <View style={styles.splashImageContainer}>
              <Image
                source={BrandAssets.technicianCutout}
                style={styles.technicianImg}
                resizeMode="contain"
              />
            </View>

            {/* Bottom Actions & Temple Skyline */}
            <View style={styles.bottomSection}>
              <Pressable
                onPress={handleGetStarted}
                style={styles.pillButton}
                accessibilityRole="button"
                accessibilityLabel="Get Started"
              >
                <Text style={styles.pillButtonText}>Get Started</Text>
                <Ionicons name="arrow-forward" size={18} color={colors.white} />
              </Pressable>

              {/* Decorative City / Temple Silhouette Line */}
              <View style={styles.skylineDecoration}>
                <Ionicons name="business-outline" size={20} color={colors.primarySoft} />
                <View style={styles.skylineLine} />
                <Ionicons name="home-outline" size={18} color={colors.primarySoft} />
                <View style={styles.skylineLine} />
                <Ionicons name="shield-checkmark-outline" size={20} color={colors.primarySoft} />
              </View>
            </View>
          </View>
        ) : (
          /* ========================================================
             SCREEN 2: ONBOARDING
             ======================================================== */
          <View style={styles.container}>
            {/* Top Brand Header */}
            <View style={styles.header}>
              <View style={styles.brandRow}>
                <Text style={styles.brandName}>namma pros</Text>
                <View style={styles.brandDot} />
              </View>
            </View>

            {/* Center Illustrated House with 4 Service Badges */}
            <View style={styles.onboardingGraphicContainer}>
              <View style={styles.houseFrame}>
                {/* 4 Floating Service Badges around the house */}
                <View style={[styles.serviceOrb, styles.orbTopLeft]}>
                  <Ionicons name="water-outline" size={24} color={colors.primary} />
                </View>
                <View style={[styles.serviceOrb, styles.orbTopRight]}>
                  <Ionicons name="snow-outline" size={24} color={colors.primary} />
                </View>
                <View style={[styles.serviceOrb, styles.orbBottomLeft]}>
                  <Ionicons name="hammer-outline" size={24} color={colors.primary} />
                </View>
                <View style={[styles.serviceOrb, styles.orbBottomRight]}>
                  <Ionicons name="sparkles-outline" size={24} color={colors.primary} />
                </View>

                {/* Central House Outline */}
                <View style={styles.houseIconCircle}>
                  <Ionicons name="home-sharp" size={60} color={colors.primary} />
                </View>
              </View>
            </View>

            {/* Content & Copy */}
            <View style={styles.copyContainer}>
              <Text style={styles.headingTitle}>Home services{"\n"}made simple</Text>
              <Text style={styles.subTitle}>
                Book trusted professionals for cleaning, repair and maintenance at your home.
              </Text>

              {/* 3 Pagination Dots */}
              <View style={styles.dotsRow}>
                <View style={[styles.dot, styles.dotActive]} />
                <View style={styles.dot} />
                <View style={styles.dot} />
              </View>
            </View>

            {/* Next Button */}
            <View style={styles.bottomSection}>
              <Pressable
                onPress={handleFinishOnboarding}
                style={styles.pillButton}
                accessibilityRole="button"
                accessibilityLabel="Next"
              >
                <Text style={styles.pillButtonText}>Next</Text>
              </Pressable>
            </View>
          </View>
        )}
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.surface,
    paddingTop: isAndroid ? statusBarHeight : 0,
  },
  container: {
    flex: 1,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
    justifyContent: "space-between",
  },
  header: {
    alignItems: "center",
    marginTop: spacing.sm,
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 3,
  },
  brandName: {
    fontSize: 28,
    fontWeight: "900",
    color: colors.ink,
    letterSpacing: -0.5,
  },
  brandDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
  },
  brandTagline: {
    fontSize: 13,
    color: colors.muted,
    marginTop: 2,
    fontWeight: "500",
  },

  // Splash Image
  splashImageContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    maxHeight: 460,
    marginVertical: spacing.md,
  },
  technicianImg: {
    width: "100%",
    height: "100%",
  },

  // Onboarding Graphic
  onboardingGraphicContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  houseFrame: {
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  houseIconCircle: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  serviceOrb: {
    position: "absolute",
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  orbTopLeft: {
    top: 10,
    left: 10,
  },
  orbTopRight: {
    top: 10,
    right: 10,
  },
  orbBottomLeft: {
    bottom: 10,
    left: 10,
  },
  orbBottomRight: {
    bottom: 10,
    right: 10,
  },

  // Copy Container
  copyContainer: {
    alignItems: "center",
    marginVertical: spacing.lg,
  },
  headingTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: colors.ink,
    textAlign: "center",
    lineHeight: 32,
    marginBottom: spacing.sm,
  },
  subTitle: {
    fontSize: 14,
    color: colors.muted,
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.lg,
  },
  dotsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border,
  },
  dotActive: {
    backgroundColor: colors.primary,
    width: 22,
  },

  // Bottom Actions
  bottomSection: {
    width: "100%",
    alignItems: "center",
    gap: spacing.lg,
  },
  pillButton: {
    width: "100%",
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  pillButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "700",
  },
  skylineDecoration: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    opacity: 0.7,
  },
  skylineLine: {
    width: 36,
    height: 1,
    backgroundColor: colors.primarySoft,
  },
});
