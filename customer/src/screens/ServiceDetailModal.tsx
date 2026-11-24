import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { api } from "../api";
import { getServiceImage } from "../assets";
import { formatInr } from "../components/ServiceCard";
import { useApp } from "../state/AppContext";
import { colors, isAndroid, radii, spacing, statusBarHeight } from "../theme";
import type { Package, Service } from "../types";

function cleanHtmlText(html?: string): string[] {
  if (!html) return [];
  const cleaned = html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<\/li>/gi, "\n")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/<[^>]+>/g, "");

  return cleaned
    .split("\n\n")
    .map((p) => p.trim())
    .filter((p) => p.length > 0);
}

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
  const [expandedFaqIndex, setExpandedFaqIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!detailService?.slug) {
      setLiveService(null);
      setSelectedPkgIndex(0);
      setExpandedFaqIndex(null);
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
        // Retain initial service data
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
  const pricePaise = activePkg.price_paise ?? currentService.starting_price_paise ?? 19900;
  const mrpPaise =
    activePkg.mrp_paise ??
    currentService.starting_mrp_paise ??
    (pricePaise ? Math.round(pricePaise * 1.3) : undefined);
  const discountPercent =
    activePkg.discount_percent ??
    currentService.starting_discount_percent ??
    (mrpPaise && pricePaise && mrpPaise > pricePaise
      ? Math.round(((mrpPaise - pricePaise) / mrpPaise) * 100)
      : null);

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

  const normalizeList = (val?: string[] | string): string[] => {
    if (!val) return [];
    if (Array.isArray(val)) return val.filter(Boolean).map(String);
    if (typeof val === "string") {
      try {
        const parsed = JSON.parse(val);
        if (Array.isArray(parsed)) return parsed.filter(Boolean).map(String);
      } catch {
        // fallback
      }
      return val.split(/\r?\n/).map((s) => s.trim()).filter((s) => s.length > 0);
    }
    return [];
  };

  const rawPkgInc = normalizeList(activePkg.inclusions);
  const rawSvcInc = normalizeList(currentService.inclusions);
  const displayInclusions: string[] =
    rawPkgInc.length > 0
      ? rawPkgInc
      : rawSvcInc.length > 0
      ? rawSvcInc
      : [
          "Comprehensive inspection & diagnosis",
          "Applicable for all major brands",
          `Standard service charge: ${formatInr(pricePaise)}`,
          "Post-service quality check",
        ];

  const rawPkgExc = normalizeList(activePkg.exclusions);
  const rawSvcExc = normalizeList(currentService.exclusions);
  const displayExclusions: string[] =
    rawPkgExc.length > 0
      ? rawPkgExc
      : rawSvcExc.length > 0
      ? rawSvcExc
      : ["Spare parts and replacement materials charged extra at MRP"];

  // FAQs from live backend
  const faqs = currentService.faqs && currentService.faqs.length > 0 ? currentService.faqs : [];

  // Clean description paragraphs
  const descriptionParagraphs = cleanHtmlText(
    currentService.description || currentService.full_description || currentService.summary
  );

  return (
    <Modal
      visible={Boolean(detailService)}
      animationType="slide"
      transparent={false}
      statusBarTranslucent={true}
      onRequestClose={() => setDetailService(null)}
    >
      <SafeAreaView style={styles.safeArea} edges={["left", "right", "bottom"]}>
        <StatusBar barStyle="dark-content" />

        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
          {/* Top Hero Photo Container with floating Back Button safely inset */}
          <View style={styles.heroImageContainer}>
            <Image
              source={getServiceImage(currentService)}
              style={styles.heroImage}
              resizeMode="cover"
            />
            {/* Dark gradient vignette overlay at top for back button contrast */}
            <View style={styles.heroOverlay} />

            <Pressable
              onPress={() => setDetailService(null)}
              style={[
                styles.floatingBackBtn,
                { top: (isAndroid ? statusBarHeight : 16) + 8 },
              ]}
              accessibilityRole="button"
              accessibilityLabel="Back"
            >
              <Ionicons name="arrow-back" size={22} color={colors.ink} />
            </Pressable>

            {loadingLive && (
              <View style={styles.loadingBadge}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={styles.loadingText}>Updating live details…</Text>
              </View>
            )}
          </View>

          {/* Service Title & Pricing Section */}
          <View style={styles.contentBody}>
            {/* Category Name & Rating Pill */}
            <View style={styles.metaRow}>
              {Boolean(currentService.category_name || currentService.category) && (
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryBadgeText}>
                    {currentService.category_name || currentService.category}
                  </Text>
                </View>
              )}

              <View style={styles.ratingBadge}>
                <Ionicons name="star" size={13} color={colors.gold} />
                <Text style={styles.ratingText}>
                  {currentService.rating_avg ? currentService.rating_avg.toFixed(1) : "4.9"}
                </Text>
                <Text style={styles.reviewCount}>
                  ({currentService.review_count || 120}+ reviews)
                </Text>
              </View>
            </View>

            {/* Service Name */}
            <Text style={styles.serviceTitle}>{currentService.name}</Text>

            {/* Price Row with MRP strikethrough & discount */}
            <View style={styles.priceRow}>
              <Text style={styles.servicePrice}>{formatInr(pricePaise)}</Text>
              {Boolean(mrpPaise && mrpPaise > pricePaise) && (
                <Text style={styles.mrpPrice}>{formatInr(mrpPaise)}</Text>
              )}
              {Boolean(discountPercent && discountPercent > 0) && (
                <View style={styles.discountBadge}>
                  <Text style={styles.discountBadgeText}>{discountPercent}% OFF</Text>
                </View>
              )}
            </View>

            {/* Badges Row: Duration & Pricing Model */}
            <View style={styles.tagsRow}>
              {Boolean(activePkg.duration_minutes) && (
                <View style={styles.tagItem}>
                  <Ionicons name="time-outline" size={14} color={colors.primary} />
                  <Text style={styles.tagText}>{activePkg.duration_minutes} mins</Text>
                </View>
              )}
              {Boolean(activePkg.pricing_model) && (
                <View style={styles.tagItem}>
                  <Ionicons name="pricetag-outline" size={14} color={colors.inkSecondary} />
                  <Text style={styles.tagText}>
                    {activePkg.pricing_model === "INSPECTION_BASED"
                      ? "Inspection Based"
                      : "Standard Pricing"}
                  </Text>
                </View>
              )}
            </View>

            {/* Important Notes / Price Note Banner (if available in backend) */}
            {Boolean(currentService.important_notes || currentService.price_note) && (
              <View style={styles.noteCallout}>
                <Ionicons name="information-circle" size={18} color={colors.primary} />
                <Text style={styles.noteText}>
                  {currentService.important_notes || currentService.price_note}
                </Text>
              </View>
            )}

            {/* Multiple Packages Selector (if available) */}
            {Boolean(packages.length > 1) && (
              <View style={styles.packagesSection}>
                <Text style={styles.sectionHeaderTitle}>Select Package</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.pkgScroll}
                >
                  {packages.map((pkg, idx) => {
                    const isSelected = selectedPkgIndex === idx;
                    const pkgPaise = pkg.price_paise ?? currentService.starting_price_paise ?? 19900;
                    return (
                      <Pressable
                        key={pkg.id || idx}
                        onPress={() => setSelectedPkgIndex(idx)}
                        style={[styles.pkgCard, isSelected && styles.pkgCardActive]}
                      >
                        <Text style={[styles.pkgName, isSelected && styles.pkgNameActive]}>
                          {pkg.name}
                        </Text>
                        <Text style={[styles.pkgPrice, isSelected && styles.pkgPriceActive]}>
                          {formatInr(pkgPaise)}
                        </Text>
                        {Boolean(pkg.duration_minutes) && (
                          <Text style={styles.pkgDuration}>⏱ {pkg.duration_minutes} mins</Text>
                        )}
                      </Pressable>
                    );
                  })}
                </ScrollView>
              </View>
            )}

            {/* Inclusions Card (What is included) */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeaderRow}>
                <Ionicons name="checkmark-done-circle" size={20} color="#16A34A" />
                <Text style={styles.sectionCardTitle}>What is Included</Text>
              </View>
              <View style={styles.bulletsList}>
                {displayInclusions.map((item, idx) => (
                  <View key={idx} style={styles.bulletRow}>
                    <View style={styles.checkIconWrapper}>
                      <Ionicons name="checkmark" size={13} color="#16A34A" />
                    </View>
                    <Text style={styles.bulletText}>{item}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Exclusions Card (What is not included) */}
            {Boolean(displayExclusions.length > 0) && (
              <View style={styles.sectionCard}>
                <View style={styles.sectionHeaderRow}>
                  <Ionicons name="alert-circle-outline" size={20} color={colors.muted} />
                  <Text style={styles.sectionCardTitle}>What is Excluded</Text>
                </View>
                <View style={styles.bulletsList}>
                  {displayExclusions.map((item, idx) => (
                    <View key={idx} style={styles.bulletRow}>
                      <View style={styles.crossIconWrapper}>
                        <Ionicons name="close" size={13} color="#DC2626" />
                      </View>
                      <Text style={styles.bulletTextMuted}>{item}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Overview / Detailed Description */}
            {Boolean(descriptionParagraphs.length > 0) && (
              <View style={styles.sectionCard}>
                <Text style={styles.sectionCardTitle}>Service Overview &amp; Process</Text>
                <View style={styles.descriptionParagraphsWrap}>
                  {descriptionParagraphs.map((para, idx) => (
                    <Text key={idx} style={styles.descriptionText}>
                      {para}
                    </Text>
                  ))}
                </View>
              </View>
            )}

            {/* Live FAQs Accordion (if backend has FAQs) */}
            {Boolean(faqs.length > 0) && (
              <View style={styles.sectionCard}>
                <View style={styles.sectionHeaderRow}>
                  <Ionicons name="help-circle-outline" size={20} color={colors.primary} />
                  <Text style={styles.sectionCardTitle}>Frequently Asked Questions</Text>
                </View>
                <View style={styles.faqList}>
                  {faqs.map((faq, idx) => {
                    const isExpanded = expandedFaqIndex === idx;
                    return (
                      <View key={idx} style={styles.faqItem}>
                        <Pressable
                          onPress={() => setExpandedFaqIndex(isExpanded ? null : idx)}
                          style={styles.faqQuestionRow}
                        >
                          <Text style={styles.faqQuestionText}>{faq.question}</Text>
                          <Ionicons
                            name={isExpanded ? "chevron-up" : "chevron-down"}
                            size={18}
                            color={colors.muted}
                          />
                        </Pressable>
                        {isExpanded && (
                          <View style={styles.faqAnswerBox}>
                            <Text style={styles.faqAnswerText}>{faq.answer}</Text>
                          </View>
                        )}
                      </View>
                    );
                  })}
                </View>
              </View>
            )}

            {/* Trust & Guarantee Callout */}
            <View style={styles.guaranteeCallout}>
              <View style={styles.guaranteeIconCircle}>
                <Ionicons name="shield-checkmark" size={24} color={colors.primary} />
              </View>
              <View style={styles.guaranteeTextWrapper}>
                <Text style={styles.guaranteeHeading}>30-Day Rework Guarantee</Text>
                <Text style={styles.guaranteeSub}>
                  Complete peace of mind. Free revisit and rework if any issue persists within 30 days.
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
              <Text style={styles.addToCartText}>Add to Cart • {formatInr(pricePaise)}</Text>
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
    paddingBottom: 90,
  },
  heroImageContainer: {
    width: "100%",
    height: 280,
    backgroundColor: colors.canvasWarm,
    position: "relative",
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  heroOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 90,
    backgroundColor: "rgba(0,0,0,0.15)",
  },
  floatingBackBtn: {
    position: "absolute",
    left: spacing.lg,
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
    zIndex: 10,
  },
  loadingBadge: {
    position: "absolute",
    bottom: spacing.md,
    left: spacing.lg,
    backgroundColor: "rgba(255,255,255,0.92)",
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radii.pill,
  },
  loadingText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.primary,
  },
  contentBody: {
    padding: spacing.xl,
    gap: spacing.lg,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  categoryBadge: {
    backgroundColor: colors.primarySoft,
    paddingHorizontal: spacing.md,
    paddingVertical: 5,
    borderRadius: radii.pill,
  },
  categoryBadgeText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.ink,
  },
  reviewCount: {
    fontSize: 12,
    color: colors.muted,
  },
  serviceTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.ink,
    lineHeight: 28,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: spacing.md,
  },
  servicePrice: {
    fontSize: 26,
    fontWeight: "900",
    color: colors.primary,
  },
  mrpPrice: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.muted,
    textDecorationLine: "line-through",
  },
  discountBadge: {
    backgroundColor: "#DC2626",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radii.sm,
  },
  discountBadgeText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: "800",
  },
  tagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  tagItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.canvasWarm,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radii.pill,
  },
  tagText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.ink,
  },
  noteCallout: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    backgroundColor: colors.goldBg,
    borderColor: "#EAB308",
    borderWidth: 1,
    borderRadius: radii.lg,
    padding: spacing.md,
  },
  noteText: {
    flex: 1,
    fontSize: 12,
    color: colors.ink,
    lineHeight: 18,
    fontWeight: "500",
  },
  packagesSection: {
    gap: spacing.sm,
  },
  sectionHeaderTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.ink,
  },
  pkgScroll: {
    gap: spacing.md,
    paddingVertical: spacing.xs,
  },
  pkgCard: {
    minWidth: 140,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.borderLight,
    borderRadius: radii.lg,
    padding: spacing.md,
    gap: 4,
  },
  pkgCardActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  pkgName: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.ink,
  },
  pkgNameActive: {
    color: colors.primary,
  },
  pkgPrice: {
    fontSize: 16,
    fontWeight: "900",
    color: colors.ink,
  },
  pkgPriceActive: {
    color: colors.primary,
  },
  pkgDuration: {
    fontSize: 11,
    color: colors.muted,
  },
  sectionCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    gap: spacing.md,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  sectionCardTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.ink,
  },
  bulletsList: {
    gap: spacing.md,
  },
  bulletRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
  },
  checkIconWrapper: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#DCFCE7",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
  },
  crossIconWrapper: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#FEE2E2",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
  },
  bulletText: {
    fontSize: 13,
    color: colors.ink,
    lineHeight: 19,
    fontWeight: "500",
    flex: 1,
  },
  bulletTextMuted: {
    fontSize: 13,
    color: colors.muted,
    lineHeight: 19,
    flex: 1,
  },
  descriptionParagraphsWrap: {
    gap: spacing.sm,
  },
  descriptionText: {
    fontSize: 13,
    color: colors.inkSecondary,
    lineHeight: 20,
  },
  faqList: {
    gap: spacing.sm,
  },
  faqItem: {
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    paddingBottom: spacing.sm,
  },
  faqQuestionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.sm,
  },
  faqQuestionText: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.ink,
    flex: 1,
    paddingRight: spacing.sm,
  },
  faqAnswerBox: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.xs,
  },
  faqAnswerText: {
    fontSize: 12,
    color: colors.inkSecondary,
    lineHeight: 18,
  },
  guaranteeCallout: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.primarySoft,
    padding: spacing.lg,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: "#F4D2CE",
  },
  guaranteeIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  guaranteeTextWrapper: {
    flex: 1,
  },
  guaranteeHeading: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.primary,
  },
  guaranteeSub: {
    fontSize: 12,
    color: colors.inkSecondary,
    marginTop: 2,
    lineHeight: 16,
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
