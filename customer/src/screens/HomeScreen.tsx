import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Alert,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { BrandAssets, CategoryCardAssets, HomeIconAssets, ServiceBannerAssets, SpotlightAssets } from "../assets";
import { useApp } from "../state/AppContext";
import { colors, radii, spacing } from "../theme";

// ============================================================================
// STATIC DATA: Module-level singletons for 0ms instant render & zero re-allocations
// ============================================================================
const HOME_CATEGORIES = [
  {
    key: "cleaning",
    title: "Cleaning &\nPest Control",
    timeBadge: "55 mins",
    icon: HomeIconAssets["deep-cleaning"],
    slug: "cleaning",
  },
  {
    key: "ac",
    title: "AC & Appliance\nRepair",
    timeBadge: "44 mins",
    icon: HomeIconAssets.ac,
    slug: "ac",
  },
  {
    key: "handyman",
    title: "Electrician,\nPlumber & Carpenter",
    timeBadge: "29 mins",
    icon: HomeIconAssets.handyman,
    slug: "electrician",
  },
  {
    key: "tank",
    title: "Water Tank\nCleaning",
    timeBadge: "30 mins",
    icon: HomeIconAssets["water-tank-cleaning"],
    slug: "water-tank-cleaning",
  },
  {
    key: "appliances",
    title: "Washing Machine\n& Refrigerator",
    timeBadge: "45 mins",
    icon: HomeIconAssets["appliance-services"],
    slug: "appliances",
  },
  {
    key: "sofa",
    title: "Sofa Repair\n& Cleaning",
    timeBadge: "50 mins",
    icon: HomeIconAssets["sofa-repair"],
    slug: "sofa",
  },
  {
    key: "mosquito",
    title: "Mosquito Net\nProtection",
    timeBadge: "60 mins",
    icon: HomeIconAssets["mosquito-net"],
    slug: "mosquito-net",
  },
  {
    key: "painting",
    title: "Home Painting\n& Upgrade",
    timeBadge: "24 hrs",
    icon: HomeIconAssets.carpenter,
    slug: "carpenter",
  },
];

const NEW_AND_NOTEWORTHY = [
  {
    id: "full-home",
    title: "Full Home / By Room Cleaning",
    timeBadge: "45 mins",
    image: CategoryCardAssets.cleaning,
    slug: "cleaning",
  },
  {
    id: "tank-sanitize",
    title: "Water Tank Deep Sanitize",
    timeBadge: "30 mins",
    image: ServiceBannerAssets["water-tank-cleaning"],
    slug: "water-tank-cleaning",
  },
  {
    id: "living-bed",
    title: "Living & Bedroom Cleaning",
    timeBadge: "50 mins",
    image: CategoryCardAssets.appliances,
    slug: "cleaning",
  },
  {
    id: "sofa-deep",
    title: "Sofa Deep Cleaning & Repair",
    timeBadge: "49 mins",
    image: ServiceBannerAssets.sofa,
    slug: "sofa",
  },
  {
    id: "stove-repair",
    title: "Stove Service & Repair",
    timeBadge: "44 mins",
    image: HomeIconAssets["kitchen-cleaning"],
    slug: "appliances",
  },
  {
    id: "wm-tuneup",
    title: "Washing Machine Repair",
    timeBadge: "45 mins",
    image: HomeIconAssets["washing-machine"],
    slug: "appliances",
  },
  {
    id: "fridge-refill",
    title: "Refrigerator Gas Refill",
    timeBadge: "40 mins",
    image: HomeIconAssets.refrigerator,
    slug: "appliances",
  },
  {
    id: "electrician-quick",
    title: "Electrician On-Demand",
    timeBadge: "29 mins",
    image: HomeIconAssets.electrician,
    slug: "electrician",
  },
];

export function HomeScreen() {
  const {
    catalog,
    loadingCatalog,
    refreshCatalog,
    setActiveTab,
    setSelectedCategorySlug,
    selectedCity,
    setDetailService,
    setSearchQuery,
    activeTrackingBooking,
    setIsLocationModalOpen,
    setIsAuthOpen,
    user,
  } = useApp();

  const handleQuickSearch = (query: string) => {
    setSearchQuery(query);
    setActiveTab("services");
  };

  const handleSelectCategory = (catSlug: string) => {
    setSelectedCategorySlug(catSlug);
    setSearchQuery("");
    setActiveTab("services");
  };

  const handleWalletPress = () => {
    Alert.alert(
      "NammaPros Wallet",
      "Current Wallet Balance: ₹0\n\nEarn 10% cashback on your next home service booking!"
    );
  };

  const handleProfilePress = () => {
    if (user) {
      setActiveTab("account");
    } else {
      setIsAuthOpen(true);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={loadingCatalog}
          onRefresh={refreshCatalog}
          tintColor={colors.white}
          colors={[colors.primary]}
        />
      }
      showsVerticalScrollIndicator={false}
    >
      {/* ========================================================
          1. NAMMAPROS BURGUNDY HERO HEADER (MATCHING REFERENCE)
          ======================================================== */}
      <View style={styles.brandHeaderContainer}>
        {/* Top Line: "In 29 mins" / Location Dropdown + Wallet & Profile */}
        <View style={styles.headerTopRow}>
          <View style={styles.headerLocationWrap}>
            <Text style={styles.etaHeading}>In 29 mins</Text>
            <Pressable
              onPress={() => setIsLocationModalOpen(true)}
              style={styles.locationDropdownBtn}
              accessibilityRole="button"
              accessibilityLabel={`Current location: ${selectedCity}`}
            >
              <Text style={styles.locationDropdownText} numberOfLines={1}>
                Home - {selectedCity} • Anna Nagar
              </Text>
              <Ionicons name="chevron-down" size={14} color={colors.white} />
            </Pressable>
          </View>

          {/* Right Action Icons: Wallet & Profile */}
          <View style={styles.headerRightActions}>
            <Pressable
              onPress={handleWalletPress}
              style={styles.walletPill}
              accessibilityRole="button"
              accessibilityLabel="Wallet Balance"
            >
              <Ionicons name="wallet" size={16} color={colors.primary} />
              <Text style={styles.walletPillText}>₹0</Text>
            </Pressable>

            <Pressable
              onPress={handleProfilePress}
              style={styles.profileAvatarCircle}
              accessibilityRole="button"
              accessibilityLabel="User Profile"
            >
              <Ionicons name="person" size={18} color={colors.primary} />
            </Pressable>
          </View>
        </View>

        {/* Search Bar Input (White Pill matching Image 1) */}
        <Pressable
          onPress={() => handleQuickSearch("")}
          style={styles.searchBarPill}
          accessibilityRole="button"
          accessibilityLabel="Search for a service"
        >
          <Ionicons name="search" size={20} color="#78716C" />
          <Text style={styles.searchBarPillPlaceholder}>Search for a service</Text>
        </Pressable>

        {/* Promo Pack Banner matching Image 1 */}
        <Pressable
          onPress={() => handleSelectCategory("cleaning")}
          style={styles.promoPackBanner}
          accessibilityRole="button"
          accessibilityLabel="3-visit pack at just ₹215"
        >
          <View style={styles.promoPackLeft}>
            <Text style={styles.promoBrand}>Instahelp by NammaPros</Text>
            <Text style={styles.promoTitle}>3-visit pack at just ₹215</Text>
            <Text style={styles.promoSub}>₹33/visit</Text>
            <View style={styles.promoDiscountBadge}>
              <Text style={styles.promoDiscountText}>🏷 85% OFF</Text>
            </View>
          </View>

          <View style={styles.promoPackRight}>
            <Image
              source={BrandAssets.technicianCutout}
              style={styles.promoTechnicianImg}
              resizeMode="contain"
              fadeDuration={0}
            />
          </View>
        </Pressable>
      </View>

      {/* ========================================================
          ACTIVE BOOKING BANNER (If technician on the way)
          ======================================================== */}
      {Boolean(activeTrackingBooking) && (
        <Pressable
          onPress={() => setActiveTab("bookings")}
          style={styles.activeBookingCard}
          accessibilityRole="button"
          accessibilityLabel="Track live booking"
        >
          <View style={styles.activeBookingTop}>
            <View style={styles.activeBookingBadge}>
              <View style={styles.livePulseDot} />
              <Text style={styles.activeBookingBadgeText}>LIVE TRACKING</Text>
            </View>
            <Text style={styles.activeBookingEta}>Arriving in ~15 mins</Text>
          </View>
          <View style={styles.activeBookingMiddle}>
            <Text style={styles.activeBookingTitle}>
              {activeTrackingBooking?.service_name || activeTrackingBooking?.service}
            </Text>
            <Text style={styles.activeBookingSub}>
              {activeTrackingBooking?.technician?.display_name || "Ramesh K."} • On the way
            </Text>
          </View>
          <View style={styles.activeBookingFooter}>
            <Ionicons name="navigate-circle" size={16} color={colors.primary} />
            <Text style={styles.activeBookingActionText}>View Live Route &amp; Call</Text>
            <Ionicons name="chevron-forward" size={14} color={colors.primary} />
          </View>
        </Pressable>
      )}

      {/* ========================================================
          2. 4-COLUMN CATEGORY GRID (DIRECT ICONS WITHOUT ANY BOX)
          ======================================================== */}
      <View style={styles.categoryGridSection}>
        <View style={styles.categoryGrid4Col}>
          {HOME_CATEGORIES.map((cat) => (
            <Pressable
              key={cat.key}
              onPress={() => handleSelectCategory(cat.slug)}
              style={({ pressed }) => [
                styles.categoryCard4Col,
                pressed && styles.categoryCard4ColPressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel={cat.title.replace("\n", " ")}
            >
              <Image
                source={cat.icon}
                style={styles.categoryIconImg}
                resizeMode="contain"
                fadeDuration={0}
              />

              {Boolean(cat.timeBadge) && (
                <View style={styles.timeBadgePill}>
                  <Text style={styles.timeBadgeText}>{cat.timeBadge}</Text>
                </View>
              )}

              <Text style={styles.categoryCardLabel} numberOfLines={2}>
                {cat.title}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* ========================================================
          3. NATIVE SMART PRODUCTS SECTION (DIRECT ICONS WITHOUT BOX)
          ======================================================== */}
      <View style={styles.sectionWrap}>
        <Text style={styles.sectionHeading}>Native Smart Products</Text>
        <View style={styles.smartProductsRow}>
          <Pressable
            onPress={() => handleSelectCategory("appliances")}
            style={styles.smartProductCard}
            accessibilityRole="button"
            accessibilityLabel="Native Water Purifier"
          >
            <Image
              source={HomeIconAssets["water-purifier"]}
              style={styles.smartProductImg}
              resizeMode="contain"
              fadeDuration={0}
            />
            <Text style={styles.smartProductTitle}>Native Water Purifier</Text>
          </Pressable>

          <Pressable
            onPress={() => handleSelectCategory("electrician")}
            style={styles.smartProductCard}
            accessibilityRole="button"
            accessibilityLabel="Native Smart Locks"
          >
            <Image
              source={HomeIconAssets.cctv}
              style={styles.smartProductImg}
              resizeMode="contain"
              fadeDuration={0}
            />
            <Text style={styles.smartProductTitle}>Native Smart Locks &amp; CCTV</Text>
          </Pressable>
        </View>
      </View>

      {/* ========================================================
          4. IN THE SPOTLIGHT CAROUSEL (MATCHING IMAGE 2)
          ======================================================== */}
      <View style={styles.sectionWrap}>
        <Text style={styles.sectionHeading}>In the spotlight</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.spotlightScroll}
        >
          {SpotlightAssets.map((spot) => (
            <Pressable
              key={spot.key}
              onPress={() => handleSelectCategory(spot.categorySlug)}
              style={styles.spotlightBannerCard}
              accessibilityRole="button"
              accessibilityLabel={spot.title}
            >
              <Image
                source={spot.image}
                style={styles.spotlightBannerImg}
                resizeMode="cover"
                fadeDuration={0}
              />
              <View style={styles.spotlightOverlay}>
                <Text style={styles.spotlightTag}>{spot.subtitle}</Text>
                <Text style={styles.spotlightTitle}>{spot.title}</Text>
                <View style={styles.spotlightBookBtn}>
                  <Text style={styles.spotlightBookBtnText}>Book now</Text>
                </View>
              </View>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* ========================================================
          5. NEW AND NOTEWORTHY SECTION (MATCHING IMAGE 2)
          ======================================================== */}
      <View style={styles.sectionWrap}>
        <Text style={styles.sectionHeading}>New and noteworthy</Text>
        <View style={styles.newNoteworthyGrid}>
          {NEW_AND_NOTEWORTHY.map((item) => (
            <Pressable
              key={item.id}
              onPress={() => handleSelectCategory(item.slug)}
              style={({ pressed }) => [
                styles.noteworthyCard,
                pressed && styles.noteworthyCardPressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel={item.title}
            >
              <View style={styles.noteworthyImageWrap}>
                <Image
                  source={item.image}
                  style={styles.noteworthyImg}
                  resizeMode="cover"
                  fadeDuration={0}
                />
              </View>
              <Text style={styles.noteworthyTitle} numberOfLines={2}>
                {item.title}
              </Text>
              <View style={styles.noteworthyBadgeRow}>
                <Text style={styles.noteworthyBadgeText}>⚡ {item.timeBadge}</Text>
              </View>
            </Pressable>
          ))}
        </View>
      </View>

      {/* ========================================================
          6. TRUST BANNER: "You call. We fix it right." (MATCHING IMAGE 3)
          ======================================================== */}
      <View style={styles.trustBannerWrap}>
        <View style={styles.trustBannerCard}>
          <Text style={styles.trustBannerHead1}>You call.</Text>
          <Text style={styles.trustBannerHead2}>We fix it right.</Text>

          <View style={styles.trustTechnicianImgWrap}>
            <Image
              source={BrandAssets.heroTechnicians}
              style={styles.trustTechnicianImg}
              resizeMode="contain"
              fadeDuration={0}
            />
          </View>

          {/* 3 Frosted Glass Pills Row matching Image 3 */}
          <View style={styles.trustPillsContainer}>
            <View style={styles.trustGlassPill}>
              <Text style={styles.trustGlassPillText}>Trained on{"\n"}real repairs</Text>
            </View>
            <View style={styles.trustGlassPillDivider} />
            <View style={styles.trustGlassPill}>
              <Text style={styles.trustGlassPillText}>Service with{"\n"}warranty</Text>
            </View>
            <View style={styles.trustGlassPillDivider} />
            <View style={styles.trustGlassPill}>
              <Text style={styles.trustGlassPillText}>ID & police{"\n"}verified</Text>
            </View>
          </View>
        </View>
      </View>

      {/* ========================================================
          7. THE NAMMAPROS PROMISE FOOTER
          ======================================================== */}
      <View style={styles.promiseCard}>
        <View style={styles.promiseHeader}>
          <Ionicons name="shield-checkmark" size={18} color={colors.primary} />
          <Text style={styles.promiseTitle}>The NammaPros Promise</Text>
        </View>
        <Text style={styles.promiseBody}>
          Transparent upfront pricing, background-verified professionals, and our 30-Day Free Rework Guarantee.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9F6F3",
  },
  content: {
    paddingBottom: 90,
  },

  // 1. Burgundy Brand Header Container
  brandHeaderContainer: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingTop: 8,
    paddingBottom: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerLocationWrap: {
    flex: 1,
    marginRight: spacing.sm,
  },
  etaHeading: {
    fontSize: 22,
    fontWeight: "900",
    color: colors.white,
    letterSpacing: -0.5,
  },
  locationDropdownBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  locationDropdownText: {
    fontSize: 13,
    fontWeight: "600",
    color: "rgba(255, 255, 255, 0.9)",
    maxWidth: 220,
  },
  headerRightActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  walletPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.white,
    borderRadius: radii.pill,
    paddingHorizontal: 10,
    paddingVertical: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  walletPillText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#1C1917",
  },
  profileAvatarCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },

  // Search Bar Pill
  searchBarPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: radii.pill,
    height: 46,
    paddingHorizontal: spacing.md,
    gap: 10,
    marginTop: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  searchBarPillPlaceholder: {
    fontSize: 14,
    fontWeight: "500",
    color: "#78716C",
    flex: 1,
  },

  // Promo Pack Banner
  promoPackBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(255, 255, 255, 0.16)",
    borderRadius: radii.xl,
    padding: spacing.md,
    marginTop: 14,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.25)",
  },
  promoPackLeft: {
    flex: 1,
  },
  promoBrand: {
    fontSize: 11,
    fontWeight: "800",
    color: "rgba(255, 255, 255, 0.85)",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  promoTitle: {
    fontSize: 17,
    fontWeight: "900",
    color: colors.white,
    marginTop: 2,
    letterSpacing: -0.3,
  },
  promoSub: {
    fontSize: 13,
    fontWeight: "600",
    color: "rgba(255, 255, 255, 0.9)",
    marginTop: 1,
  },
  promoDiscountBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginTop: 6,
    alignSelf: "flex-start",
  },
  promoDiscountText: {
    fontSize: 11,
    fontWeight: "800",
    color: colors.white,
  },
  promoPackRight: {
    width: 85,
    height: 85,
    alignItems: "center",
    justifyContent: "center",
  },
  promoTechnicianImg: {
    width: 85,
    height: 85,
  },

  // Active Live Tracking Card
  activeBookingCard: {
    backgroundColor: "#FDF4F6",
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: radii.xl,
    borderWidth: 1.5,
    borderColor: colors.primarySoft,
    gap: 6,
  },
  activeBookingTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  activeBookingBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: colors.white,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radii.pill,
  },
  livePulseDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: "#16A34A",
  },
  activeBookingBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    color: colors.primary,
    letterSpacing: 0.5,
  },
  activeBookingEta: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.primary,
  },
  activeBookingMiddle: {
    marginTop: 2,
  },
  activeBookingTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.ink,
  },
  activeBookingSub: {
    fontSize: 12,
    color: colors.muted,
    marginTop: 1,
  },
  activeBookingFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: "rgba(128,0,32,0.1)",
  },
  activeBookingActionText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.primary,
    flex: 1,
  },

  // 2. 4-Column Category Grid matching Image 1
  categoryGridSection: {
    paddingHorizontal: spacing.md,
    marginTop: spacing.lg,
  },
  categoryGrid4Col: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 14,
  },
  categoryCard4Col: {
    width: "23.5%",
    backgroundColor: "transparent",
    paddingVertical: 4,
    paddingHorizontal: 2,
    alignItems: "center",
    borderWidth: 0,
  },
  categoryCard4ColPressed: {
    opacity: 0.65,
    transform: [{ scale: 0.95 }],
  },
  categoryIconImg: {
    width: 56,
    height: 56,
    aspectRatio: 1,
  },
  timeBadgePill: {
    backgroundColor: "#ECFDF5",
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 4,
    marginTop: 3,
  },
  timeBadgeText: {
    fontSize: 9.5,
    fontWeight: "800",
    color: "#059669",
  },
  categoryCardLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.ink,
    textAlign: "center",
    marginTop: 4,
    lineHeight: 14,
  },

  // Section Generic Wrap
  sectionWrap: {
    marginTop: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  sectionHeading: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.ink,
    letterSpacing: -0.3,
    marginBottom: spacing.md,
  },

  // 3. Native Smart Products Section matching Image 1
  smartProductsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  smartProductCard: {
    flex: 1,
    backgroundColor: "transparent",
    padding: spacing.sm,
    alignItems: "center",
    borderWidth: 0,
  },
  smartProductImg: {
    width: 60,
    height: 60,
    aspectRatio: 1,
    marginBottom: 6,
  },
  smartProductTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.ink,
    textAlign: "center",
    lineHeight: 16,
  },

  // 4. In the Spotlight Carousel matching Image 2
  spotlightScroll: {
    gap: spacing.md,
    paddingVertical: 2,
  },
  spotlightBannerCard: {
    width: 270,
    height: 145,
    borderRadius: radii.xl,
    overflow: "hidden",
    backgroundColor: colors.surface,
    position: "relative",
  },
  spotlightBannerImg: {
    width: "100%",
    height: "100%",
  },
  spotlightOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.38)",
    padding: spacing.md,
    justifyContent: "flex-end",
  },
  spotlightTag: {
    fontSize: 11,
    fontWeight: "700",
    color: "rgba(255, 255, 255, 0.9)",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  spotlightTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: colors.white,
    marginTop: 2,
    lineHeight: 20,
  },
  spotlightBookBtn: {
    backgroundColor: colors.ink,
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: radii.pill,
    marginTop: 8,
  },
  spotlightBookBtnText: {
    fontSize: 11,
    fontWeight: "800",
    color: colors.white,
  },

  // 5. New and Noteworthy Section matching Image 2
  newNoteworthyGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 14,
  },
  noteworthyCard: {
    width: "23.5%",
    backgroundColor: "transparent",
    padding: 2,
    alignItems: "center",
    borderWidth: 0,
  },
  noteworthyCardPressed: {
    opacity: 0.65,
    transform: [{ scale: 0.96 }],
  },
  noteworthyImageWrap: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: radii.md,
    overflow: "hidden",
    backgroundColor: colors.canvasWarm,
    marginBottom: 5,
  },
  noteworthyImg: {
    width: "100%",
    height: "100%",
  },
  noteworthyTitle: {
    fontSize: 10.5,
    fontWeight: "700",
    color: colors.ink,
    textAlign: "center",
    lineHeight: 14,
  },
  noteworthyBadgeRow: {
    marginTop: 3,
  },
  noteworthyBadgeText: {
    fontSize: 9.5,
    fontWeight: "800",
    color: "#059669",
  },

  // 6. Trust Banner "You call. We fix it right."
  trustBannerWrap: {
    marginHorizontal: spacing.md,
    marginTop: spacing.xl,
  },
  trustBannerCard: {
    backgroundColor: "#1C3B47",
    borderRadius: radii.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.md,
    alignItems: "center",
    overflow: "hidden",
  },
  trustBannerHead1: {
    fontSize: 26,
    fontWeight: "900",
    color: colors.white,
    textAlign: "center",
    lineHeight: 30,
  },
  trustBannerHead2: {
    fontSize: 26,
    fontWeight: "900",
    color: colors.white,
    textAlign: "center",
    lineHeight: 30,
    marginBottom: spacing.sm,
  },
  trustTechnicianImgWrap: {
    width: "100%",
    height: 190,
    alignItems: "center",
    justifyContent: "center",
  },
  trustTechnicianImg: {
    width: "92%",
    height: "100%",
  },
  trustPillsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.16)",
    borderRadius: radii.lg,
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.28)",
    marginTop: 8,
  },
  trustGlassPill: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  trustGlassPillDivider: {
    width: 1,
    height: 24,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
  trustGlassPillText: {
    fontSize: 10.5,
    fontWeight: "700",
    color: colors.white,
    textAlign: "center",
    lineHeight: 14,
  },

  // 7. Promise Footer
  promiseCard: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.xl,
    padding: spacing.lg,
    backgroundColor: colors.primarySoft,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  promiseHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginBottom: 4,
  },
  promiseTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.primary,
  },
  promiseBody: {
    fontSize: 12,
    color: colors.inkSecondary,
    lineHeight: 18,
  },
});
