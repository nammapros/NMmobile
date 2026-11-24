import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { api } from "../api";
import { getServiceImage } from "../assets";
import { formatInr } from "../components/ServiceCard";
import { useApp } from "../state/AppContext";
import { colors, radii, spacing } from "../theme";
import type { Package, Service } from "../types";

export function ServiceDetailModal() {
  const {
    detailService,
    setDetailService,
    cartItems,
    addToCart,
    updateQuantity,
    setIsCartOpen,
    selectedPincode,
  } = useApp();

  const [liveService, setLiveService] = useState<Service | null>(null);
  const [loadingLive, setLoadingLive] = useState(false);
  const [selectedPkgIndex, setSelectedPkgIndex] = useState(0);

  useEffect(() => {
    if (!detailService?.slug) {
      setLiveService(null);
      setSelectedPkgIndex(0);
      return;
    }
    let active = true;
    setLoadingLive(true);
    api
      .serviceDetail(detailService.slug, selectedPincode)
      .then((res) => {
        if (active && res) {
          setLiveService(res);
        }
      })
      .catch(() => {
        // Keep fallback
      })
      .finally(() => {
        if (active) setLoadingLive(false);
      });
    return () => {
      active = false;
    };
  }, [detailService?.slug, selectedPincode]);

  if (!detailService) return null;

  const currentService = liveService || detailService;

  const packages: Package[] =
    currentService.packages && currentService.packages.length > 0
      ? currentService.packages
      : [
          {
            id: `pkg-${detailService.id}-std`,
            name: "Standard Inspection & Service",
            pricing_model: "FIXED_PRICE",
            duration_minutes: 60,
            inclusions: [
              "Inspection & issue diagnosis",
              "Applicable for all major brands",
              `Service charge: ${formatInr(detailService.starting_price_paise ?? 19900)}`,
              "30-Day Rework Guarantee included",
            ],
            exclusions: ["Cost of spare parts if required"],
            price_paise: detailService.starting_price_paise ?? 19900,
          },
        ];

  const activePkg = packages[selectedPkgIndex] || packages[0];
  const pricePaise = activePkg.price_paise ?? detailService.starting_price_paise ?? 19900;

  const cartItem = cartItems.find(
    (item) => item.service.id === detailService.id && item.pkg.id === activePkg.id
  );
  const inCartCount = cartItem?.quantity ?? 0;

  const handleAddToCart = () => {
    addToCart(detailService, activePkg, 1);
  };

  const handleIncrease = () => {
    updateQuantity(detailService.id, activePkg.id, 1);
  };

  const handleDecrease = () => {
    updateQuantity(detailService.id, activePkg.id, -1);
  };

  // Bullet items to display matching Screen 9 & 10
  const displayBullets =
    activePkg.inclusions && activePkg.inclusions.length > 0
      ? activePkg.inclusions
      : [
          "Inspection & issue diagnosis",
          "Applicable for all major brands",
          `Service charge: ${formatInr(pricePaise)}`,
          "30-Day Rework Guarantee",
        ];

  return (
    <Modal
      visible={Boolean(detailService)}
      animationType="slide"
      transparent={false}
      onRequestClose={() => setDetailService(null)}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* ========================================================
            SCREEN 9 & 10: SERVICE DETAIL
            ======================================================== */}
        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
          {/* Top Hero Photo Container with floating Back Button */}
          <View style={styles.heroImageContainer}>
            <Image
              source={getServiceImage(detailService)}
              style={styles.heroImage}
              resizeMode="cover"
            />
            <Pressable
              onPress={() => setDetailService(null)}
              style={styles.floatingBackBtn}
              accessibilityRole="button"
              accessibilityLabel="Back"
            >
              <Ionicons name="arrow-back" size={22} color={colors.ink} />
            </Pressable>
          </View>

          {/* Service Title & Pricing */}
          <View style={styles.contentBody}>
            <Text style={styles.serviceTitle}>{detailService.name}</Text>
            <Text style={styles.servicePrice}>{formatInr(pricePaise)}</Text>

            {/* Multiple Package Tabs (if available) */}
            {Boolean(packages.length > 1) && (
              <View style={styles.pkgTabsRow}>
                {packages.map((pkg, idx) => {
                  const isSelected = selectedPkgIndex === idx;
                  return (
                    <Pressable
                      key={pkg.id}
                      onPress={() => setSelectedPkgIndex(idx)}
                      style={[styles.pkgTab, isSelected && styles.pkgTabActive]}
                    >
                      <Text
                        style={[
                          styles.pkgTabText,
                          isSelected && styles.pkgTabTextActive,
                        ]}
                      >
                        {pkg.name}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            )}

            {/* Checklist Bullets matching Screen 9 & 10 */}
            <View style={styles.checklistCard}>
              {displayBullets.map((bullet, idx) => (
                <View key={idx} style={styles.checkRow}>
                  <View style={styles.checkIconWrapper}>
                    <Ionicons name="checkmark-sharp" size={14} color={colors.primary} />
                  </View>
                  <Text style={styles.checkText}>{bullet}</Text>
                </View>
              ))}
            </View>

            {/* Description / Summary */}
            {Boolean(detailService.summary || detailService.description) && (
              <View style={styles.descriptionSection}>
                <Text style={styles.sectionTitle}>Overview</Text>
                <Text style={styles.descriptionText}>
                  {detailService.summary || detailService.description}
                </Text>
              </View>
            )}

            {/* Guarantee Callout */}
            <View style={styles.guaranteeCallout}>
              <Ionicons name="shield-checkmark" size={20} color={colors.primary} />
              <View style={styles.guaranteeTextWrapper}>
                <Text style={styles.guaranteeHeading}>30-Day Rework Guarantee</Text>
                <Text style={styles.guaranteeSub}>
                  Complete peace of mind. Free revisit if any issue persists.
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Bottom Fixed Action Bar */}
        <View style={styles.bottomBar}>
          {inCartCount === 0 ? (
            <Pressable
              onPress={handleAddToCart}
              style={styles.addToCartBtn}
              accessibilityRole="button"
              accessibilityLabel="Add to Cart"
            >
              <Text style={styles.addToCartText}>Add to Cart</Text>
            </Pressable>
          ) : (
            <View style={styles.stepperRow}>
              <Pressable onPress={handleDecrease} style={styles.stepBtn}>
                <Ionicons name="remove" size={18} color={colors.white} />
              </Pressable>
              <Text style={styles.stepCountText}>{inCartCount} in Cart</Text>
              <Pressable onPress={handleIncrease} style={styles.stepBtn}>
                <Ionicons name="add" size={18} color={colors.white} />
              </Pressable>
              <Pressable
                onPress={() => {
                  setDetailService(null);
                  setIsCartOpen(true);
                }}
                style={styles.viewCartPill}
              >
                <Text style={styles.viewCartPillText}>View Cart</Text>
              </Pressable>
            </View>
          )}
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 80,
  },
  heroImageContainer: {
    width: "100%",
    height: 260,
    backgroundColor: colors.canvasWarm,
    position: "relative",
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  floatingBackBtn: {
    position: "absolute",
    top: spacing.md,
    left: spacing.lg,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  contentBody: {
    padding: spacing.xl,
  },
  serviceTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.ink,
    lineHeight: 28,
  },
  servicePrice: {
    fontSize: 22,
    fontWeight: "900",
    color: colors.primary,
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  pkgTabsRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  pkgTab: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radii.pill,
    backgroundColor: colors.canvasWarm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pkgTabActive: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
  },
  pkgTabText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.ink,
  },
  pkgTabTextActive: {
    color: colors.primary,
    fontWeight: "700",
  },
  checklistCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  checkRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  checkIconWrapper: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  checkText: {
    fontSize: 14,
    color: colors.ink,
    fontWeight: "500",
    flex: 1,
  },
  descriptionSection: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.ink,
    marginBottom: 6,
  },
  descriptionText: {
    fontSize: 13,
    color: colors.muted,
    lineHeight: 20,
  },
  guaranteeCallout: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.primarySoft,
    padding: spacing.md,
    borderRadius: radii.lg,
  },
  guaranteeTextWrapper: {
    flex: 1,
  },
  guaranteeHeading: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.primary,
  },
  guaranteeSub: {
    fontSize: 11,
    color: colors.inkSecondary,
    marginTop: 2,
  },
  bottomBar: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    backgroundColor: colors.surface,
  },
  addToCartBtn: {
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  addToCartText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "700",
  },
  stepperRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.primary,
    borderRadius: 26,
    height: 52,
    paddingHorizontal: spacing.sm,
  },
  stepBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  stepCountText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: "700",
  },
  viewCartPill: {
    backgroundColor: colors.white,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: 16,
  },
  viewCartPillText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: "800",
  },
});
