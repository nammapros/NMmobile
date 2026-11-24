import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { api } from "../api";
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
        // Fallback to detailService
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
      : detailService.packages && detailService.packages.length > 0
      ? detailService.packages
      : [
          {
            id: `pkg-${detailService.id}-std`,
            name: "Standard Service",
            pricing_model: "FIXED_PRICE",
            duration_minutes: 60,
            inclusions: [
              "Deep cleaning of internal filters and cooling coils",
              "Checking refrigerant pressure and gas leak inspection",
              "Drain pipe clearing and blower wheel flush",
              "Final performance testing and cooling verification",
            ],
            exclusions: [
              "Cost of spare parts if replacement is required",
              "Refrigerant top-up gas charges",
              "Outdoor unit dismounting or ladder work above 10ft",
            ],
            price_paise: detailService.starting_price_paise ?? 49900,
          },
          {
            id: `pkg-${detailService.id}-premium`,
            name: "Deep Foam Jet Wash",
            pricing_model: "FIXED_PRICE",
            duration_minutes: 90,
            inclusions: [
              "High-pressure specialized foam jet coil cleaning",
              "Anti-bacterial sanitized chemical coating",
              "Outdoor condenser power-wash",
              "Comprehensive 30-day post-service service warranty",
            ],
            exclusions: ["Replacement copper pipes", "Electrical board rewiring"],
            price_paise: (detailService.starting_price_paise ?? 49900) + 30000,
          },
        ];

  const activePkg = packages[selectedPkgIndex] || packages[0];

  const inCart = cartItems.find(
    (item) => item.service.id === detailService.id && item.pkg.id === activePkg.id
  );

  const pricePaise = activePkg.price_paise ?? currentService.starting_price_paise ?? detailService.starting_price_paise ?? 49900;

  const handleAddToCart = () => {
    addToCart(currentService, activePkg, 1);
  };

  return (
    <Modal
      visible={Boolean(detailService)}
      animationType="slide"
      transparent
      onRequestClose={() => setDetailService(null)}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={() => setDetailService(null)} />
        <View style={styles.sheet}>
          {/* Handle */}
          <View style={styles.handle} />

          {/* Header */}
          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <Text style={styles.categoryBadge}>
                {detailService.category_name || "NAMMAPROS SERVICE"}
              </Text>
              <Text style={styles.title}>{detailService.name}</Text>
            </View>
            <Pressable
              onPress={() => setDetailService(null)}
              style={styles.closeBtn}
              accessibilityRole="button"
              accessibilityLabel="Close"
            >
              <Ionicons name="close" size={22} color={colors.ink} />
            </Pressable>
          </View>

          {/* Scrollable Content */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Meta Row: Rating + Duration */}
            <View style={styles.metaRow}>
              <View style={styles.ratingBadge}>
                <Ionicons name="star" size={13} color={colors.gold} />
                <Text style={styles.ratingText}>
                  {detailService.rating_avg ? detailService.rating_avg.toFixed(1) : "4.8"}
                </Text>
                <Text style={styles.reviewCount}>
                  ({detailService.review_count || 120} reviews)
                </Text>
              </View>
              {Boolean(activePkg.duration_minutes) && (
                <View style={styles.durationBadge}>
                  <Ionicons name="time-outline" size={13} color={colors.primary} />
                  <Text style={styles.durationText}>{activePkg.duration_minutes} mins</Text>
                </View>
              )}
            </View>

            {/* Description */}
            <Text style={styles.description}>
              {detailService.description ||
                detailService.summary ||
                "Full professional home visit by verified, background-checked NammaPros technician."}
            </Text>

            {/* Package Selector */}
            <Text style={styles.sectionTitle}>Select Package Variant</Text>
            <View style={styles.packagesContainer}>
              {packages.map((pkg, idx) => {
                const isSelected = selectedPkgIndex === idx;
                return (
                  <Pressable
                    key={pkg.id}
                    onPress={() => setSelectedPkgIndex(idx)}
                    style={[
                      styles.packageCard,
                      isSelected && styles.packageCardSelected,
                    ]}
                  >
                    <View style={styles.pkgTopRow}>
                      <Text
                        style={[
                          styles.packageName,
                          isSelected && styles.packageNameSelected,
                        ]}
                      >
                        {pkg.name}
                      </Text>
                      <Text style={styles.pkgPrice}>
                        {formatInr(pkg.price_paise)}
                      </Text>
                    </View>
                    {Boolean(pkg.duration_minutes) && (
                      <Text style={styles.pkgDuration}>
                        {pkg.duration_minutes} mins duration
                      </Text>
                    )}
                  </Pressable>
                );
              })}
            </View>

            {/* Inclusions */}
            {Boolean(activePkg.inclusions && activePkg.inclusions.length > 0) && (
              <View style={styles.inclusionsSection}>
                <Text style={styles.sectionTitle}>What is Included</Text>
                <View style={styles.bulletList}>
                  {activePkg.inclusions.map((item, i) => (
                    <View key={i} style={styles.bulletRow}>
                      <Ionicons
                        name="checkmark-circle"
                        size={16}
                        color={colors.success}
                        style={{ marginTop: 2 }}
                      />
                      <Text style={styles.bulletText}>{item}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Exclusions */}
            {Boolean(activePkg.exclusions && activePkg.exclusions.length > 0) && (
              <View style={styles.inclusionsSection}>
                <Text style={styles.sectionTitle}>What is Excluded</Text>
                <View style={styles.bulletList}>
                  {activePkg.exclusions.map((item, i) => (
                    <View key={i} style={styles.bulletRow}>
                      <Ionicons
                        name="close-circle-outline"
                        size={16}
                        color={colors.error}
                        style={{ marginTop: 2 }}
                      />
                      <Text style={styles.bulletTextMuted}>{item}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* FAQs / Note */}
            <View style={styles.notesBox}>
              <Ionicons name="information-circle" size={18} color={colors.primary} />
              <Text style={styles.notesText}>
                No advance payment is compulsory. You may inspect the finished work and pay upon visit
                via Cash, UPI, or Card.
              </Text>
            </View>
          </ScrollView>

          {/* Sticky Bottom Bar */}
          <View style={styles.bottomBar}>
            <View>
              <Text style={styles.bottomPrice}>{formatInr(pricePaise)}</Text>
              <Text style={styles.bottomPriceSub}>Included taxes & visit</Text>
            </View>

            {inCart ? (
              <View style={styles.bottomStepper}>
                <Pressable
                  onPress={() => updateQuantity(detailService.id, activePkg.id, -1)}
                  style={styles.bottomStepBtn}
                >
                  <Ionicons name="remove" size={18} color={colors.white} />
                </Pressable>
                <Text style={styles.bottomStepCount}>{inCart.quantity}</Text>
                <Pressable
                  onPress={() => updateQuantity(detailService.id, activePkg.id, 1)}
                  style={styles.bottomStepBtn}
                >
                  <Ionicons name="add" size={18} color={colors.white} />
                </Pressable>
              </View>
            ) : (
              <Pressable onPress={handleAddToCart} style={styles.bookNowBtn}>
                <Ionicons name="cart-outline" size={16} color={colors.white} />
                <Text style={styles.bookNowBtnText}>Add to Cart</Text>
              </Pressable>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(28, 25, 23, 0.45)",
  },
  backdrop: {
    flex: 1,
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    maxHeight: "88%",
    minHeight: "55%",
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    alignSelf: "center",
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  categoryBadge: {
    fontSize: 10,
    fontWeight: "800",
    color: colors.primary,
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.ink,
    lineHeight: 24,
    marginTop: 2,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.canvasWarm,
    alignItems: "center",
    justifyContent: "center",
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.canvasWarm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radii.sm,
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.ink,
  },
  reviewCount: {
    fontSize: 11,
    color: colors.muted,
  },
  durationBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primarySoft,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radii.sm,
    gap: 4,
  },
  durationText: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.primary,
  },
  description: {
    fontSize: 13,
    color: colors.inkSecondary,
    lineHeight: 19,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.ink,
    marginBottom: spacing.xs,
  },
  packagesContainer: {
    gap: spacing.sm,
  },
  packageCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    padding: spacing.md,
    backgroundColor: colors.canvas,
  },
  packageCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  pkgTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  packageName: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.ink,
  },
  packageNameSelected: {
    color: colors.primary,
    fontWeight: "700",
  },
  pkgPrice: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.primary,
  },
  pkgDuration: {
    fontSize: 11,
    color: colors.muted,
    marginTop: 3,
  },
  inclusionsSection: {
    marginTop: spacing.xs,
  },
  bulletList: {
    gap: 6,
    marginTop: 4,
  },
  bulletRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  bulletText: {
    flex: 1,
    fontSize: 12,
    color: colors.ink,
    lineHeight: 18,
  },
  bulletTextMuted: {
    flex: 1,
    fontSize: 12,
    color: colors.muted,
    lineHeight: 18,
  },
  notesBox: {
    flexDirection: "row",
    backgroundColor: colors.canvasWarm,
    borderRadius: radii.md,
    padding: spacing.md,
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  notesText: {
    flex: 1,
    fontSize: 11,
    color: colors.muted,
    lineHeight: 16,
  },
  bottomBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  bottomPrice: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.primary,
  },
  bottomPriceSub: {
    fontSize: 10,
    color: colors.muted,
  },
  bookNowBtn: {
    backgroundColor: colors.primary,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: spacing.xl,
    paddingVertical: 12,
    borderRadius: radii.md,
  },
  bookNowBtnText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: "800",
  },
  bottomStepper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primary,
    borderRadius: radii.md,
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  bottomStepBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  bottomStepCount: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.white,
    paddingHorizontal: 8,
  },
});
