import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { BrandAssets, CategoryCardAssets, ServiceBannerAssets, SpotlightAssets } from "../assets";
import { CategoryGrid } from "../components/CategoryGrid";
import { formatInr, MostBookedCard } from "../components/ServiceCard";
import { useApp } from "../state/AppContext";
import { colors, radii, spacing } from "../theme";

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
    setActiveTrackingBooking,
  } = useApp();

  const services = catalog?.services ?? [];
  const trust = catalog?.trust_stats;

  const HOME_TRENDING = [
    { label: "🔥 Foam Jet AC", query: "foam jet" },
    { label: "💧 Tank Cleaning", query: "tank" },
    { label: "🧺 Washing Machine", query: "washing machine" },
    { label: "⚡ Electrician", query: "electrician" },
    { label: "🚿 Plumber", query: "plumber" },
    { label: "🛋️ Sofa Cleaning", query: "sofa" },
  ];

  const handleQuickSearch = (query: string) => {
    setSearchQuery(query);
    setActiveTab("services");
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={loadingCatalog}
          onRefresh={refreshCatalog}
          tintColor={colors.primary}
          colors={[colors.primary]}
        />
      }
      showsVerticalScrollIndicator={false}
    >
      {/* ========================================================
          SCREEN 6: HOME DASHBOARD
          ======================================================== */}

      {/* 0. Quick Search Trigger Bar with Trending Pills */}
      <View style={styles.searchSection}>
        <Pressable
          onPress={() => handleQuickSearch("")}
          style={styles.searchBarTrigger}
          accessibilityRole="button"
          accessibilityLabel="Search services"
        >
          <Ionicons name="search" size={18} color={colors.primary} />
          <Text style={styles.searchBarPlaceholder}>
            Search for AC, cleaning, plumbing, repairs…
          </Text>
        </Pressable>

        {/* Horizontal Trending Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.homeTrendingScroll}
        >
          {HOME_TRENDING.map((t, idx) => (
            <Pressable
              key={idx}
              onPress={() => handleQuickSearch(t.query)}
              style={styles.homeTrendingPill}
              accessibilityRole="button"
              accessibilityLabel={t.label}
            >
              <Text style={styles.homeTrendingText}>{t.label}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* Ongoing Booking Tracker Card (if active booking exists) */}
      {Boolean(activeTrackingBooking) && (
        <Pressable
          onPress={() => {
            setActiveTab("bookings");
          }}
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

      {/* 1. Hero Banner Card */}
      <View style={styles.heroBannerCard}>
        <View style={styles.heroBannerLeft}>
          <Text style={styles.heroBannerHeading}>
            Book trusted{"\n"}home services{"\n"}in {selectedCity}
          </Text>
          <Pressable
            onPress={() => setActiveTab("services")}
            style={styles.heroBookBtn}
            accessibilityRole="button"
            accessibilityLabel="Book Now"
          >
            <Text style={styles.heroBookBtnText}>Book Now</Text>
            <Ionicons name="arrow-forward" size={13} color={colors.white} />
          </Pressable>
        </View>

        <View style={styles.heroBannerRight}>
          <Image
            source={BrandAssets.technicianCutout}
            style={styles.heroTechnicianImg}
            resizeMode="contain"
            fadeDuration={0}
          />
        </View>
      </View>

      {/* 2. Three Trust Badges Row */}
      <View style={styles.trustBadgesRow}>
        <View style={styles.trustBadgeItem}>
          <View style={styles.trustBadgeIconCircle}>
            <Ionicons name="shield-checkmark" size={18} color={colors.primary} />
          </View>
          <Text style={styles.trustBadgeTitle}>Verified{"\n"}Professionals</Text>
        </View>

        <View style={styles.trustBadgeItem}>
          <View style={styles.trustBadgeIconCircle}>
            <Ionicons name="pricetag" size={18} color={colors.primary} />
          </View>
          <Text style={styles.trustBadgeTitle}>Upfront{"\n"}Pricing</Text>
        </View>

        <View style={styles.trustBadgeItem}>
          <View style={styles.trustBadgeIconCircle}>
            <Ionicons name="sync" size={18} color={colors.primary} />
          </View>
          <Text style={styles.trustBadgeTitle}>30-Day Rework{"\n"}Guarantee</Text>
        </View>
      </View>

      {/* 3. Explore All Categories Grid */}
      <View style={styles.section}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Explore Categories</Text>
        </View>
        <CategoryGrid />
      </View>

      {/* 5. In the Spotlight Banner Carousel */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>In the spotlight</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.spotlightScroll}
        >
          {SpotlightAssets.map((spot) => (
            <Pressable
              key={spot.key}
              onPress={() => {
                setSelectedCategorySlug(spot.categorySlug);
                setActiveTab("services");
              }}
              style={styles.spotlightCard}
              accessibilityRole="button"
              accessibilityLabel={spot.title}
            >
              <Image
                source={spot.image}
                style={styles.spotlightImage}
                resizeMode="cover"
                fadeDuration={0}
              />
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* 6. Why NammaPros Footer Card */}
      <View style={styles.whySection}>
        <View style={styles.whyHeader}>
          <Ionicons name="sparkles" size={18} color={colors.primary} />
          <Text style={styles.whyTitle}>The NammaPros Promise</Text>
        </View>
        <Text style={styles.whyBody}>
          Trained &amp; background-verified technicians with standard rate cards. Pay via UPI after service completion.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  content: {
    paddingBottom: 90,
  },

  // 0. Quick Search & Trending Pills
  searchSection: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    gap: spacing.sm,
  },
  searchBarTrigger: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: 11,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    gap: spacing.sm,
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  searchBarPlaceholder: {
    fontSize: 13,
    color: colors.muted,
    flex: 1,
  },
  homeTrendingScroll: {
    gap: spacing.xs,
    paddingVertical: 2,
  },
  homeTrendingPill: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderLight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radii.pill,
  },
  homeTrendingText: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.ink,
  },

  // Ongoing Booking Tracker Card
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

  // 1. Hero Banner Card matching Screen 6
  heroBannerCard: {
    backgroundColor: colors.surface,
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    borderRadius: radii.xl,
    paddingLeft: spacing.lg,
    paddingRight: spacing.xs,
    paddingVertical: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: colors.borderLight,
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    overflow: "hidden",
    height: 155,
  },
  heroBannerLeft: {
    flex: 1,
    justifyContent: "center",
  },
  heroBannerHeading: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.ink,
    lineHeight: 23,
    marginBottom: spacing.sm,
  },
  heroBookBtn: {
    alignSelf: "flex-start",
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  heroBookBtnText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: "700",
  },
  heroBannerRight: {
    width: 120,
    height: "100%",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  heroTechnicianImg: {
    width: 110,
    height: 145,
  },

  // 2. Three Trust Badges Row
  trustBadgesRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  trustBadgeItem: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 2,
  },
  trustBadgeIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  trustBadgeTitle: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.ink,
    textAlign: "center",
    lineHeight: 14,
  },

  // 3. Section Styles
  section: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.ink,
    letterSpacing: -0.3,
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.primary,
  },

  // Spotlight carousel
  spotlightScroll: {
    gap: spacing.md,
    paddingVertical: spacing.xs,
  },
  spotlightCard: {
    width: 250,
    height: 125,
    borderRadius: radii.lg,
    overflow: "hidden",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  spotlightImage: {
    width: "100%",
    height: "100%",
  },

  // Why section
  whySection: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.xl,
    padding: spacing.lg,
    backgroundColor: colors.primarySoft,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  whyHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginBottom: 6,
  },
  whyTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.primary,
  },
  whyBody: {
    fontSize: 12,
    color: colors.inkSecondary,
    lineHeight: 18,
  },
});
