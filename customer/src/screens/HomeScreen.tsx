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
import { BrandAssets, SpotlightAssets } from "../assets";
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
    setDetailService,
  } = useApp();

  const services = catalog?.services ?? [];
  const mostBooked = services
    .filter((s) => s.is_active !== false)
    .sort((a, b) => Number(Boolean(b.is_popular)) - Number(Boolean(a.is_popular)))
    .slice(0, 6);

  const reviews = catalog?.reviews ?? [];
  const trust = catalog?.trust_stats;

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
      {/* 1. Hero Split Section matching Live Netlify Site */}
      <View style={styles.heroSection}>
        <View style={styles.heroTextContainer}>
          <Text style={styles.heroHeading}>
            {"India's trusted\n"}
            <Text style={styles.heroHeadingHighlight}>home service</Text>
          </Text>
        </View>

        {/* 3-Column Category Grid */}
        <CategoryGrid />

        {/* Hero Verified Technicians Banner matching live site */}
        <View style={styles.heroTechniciansCard}>
          <Image
            source={BrandAssets.heroTechnicians}
            style={styles.heroTechniciansImg}
            resizeMode="contain"
          />

          {/* Corner Floating Trust Pill */}
          <View style={styles.trustFloatingPill}>
            <View style={styles.trustBadgeRow}>
              <Ionicons name="checkmark-circle" size={15} color={colors.success} />
              <Text style={styles.trustTitle}>Verified pros</Text>
            </View>
            <Text style={styles.trustSubtitle}>
              Direct slot booking • Upfront pricing
            </Text>

            <View style={styles.trustRatingPill}>
              <Text style={styles.trustRatingText}>
                {trust?.average_rating ? trust.average_rating.toFixed(1) : "4.8"}
              </Text>
              <Ionicons name="star" size={10} color={colors.gold} />
              <Text style={styles.trustReviewCount}>
                {trust?.review_count || "1,200"} reviews
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* 2. In the Spotlight (Banners Carousel matching live site) */}
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
              style={({ pressed }) => [
                styles.spotlightCard,
                pressed && styles.spotlightCardPressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel={spot.title}
            >
              <Image
                source={spot.image}
                style={styles.spotlightImage}
                resizeMode="cover"
              />
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* 3. Most Booked Services (Snap horizontal row matching live site) */}
      <View style={styles.section}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Most booked services</Text>
          <Pressable onPress={() => setActiveTab("services")}>
            <Text style={styles.seeAllText}>View All</Text>
          </Pressable>
        </View>

        {Boolean(loadingCatalog && mostBooked.length === 0) ? (
          <ActivityIndicator color={colors.primary} style={{ marginVertical: spacing.lg }} />
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.mostBookedScroll}
          >
            {mostBooked.map((service) => (
              <MostBookedCard
                key={service.id}
                service={service}
                onOpen={(s) => setDetailService(s)}
              />
            ))}
          </ScrollView>
        )}
      </View>

      {/* 4. Featured Dark Offer Card matching live site */}
      <View style={styles.darkOfferCard}>
        <View style={styles.darkOfferContent}>
          <Text style={styles.darkOfferBadge}>FEATURED SERVICE</Text>
          <Text style={styles.darkOfferTitle}>
            Summer Ready AC Service & Foam Jet Wash
          </Text>
          <Text style={styles.darkOfferSub}>
            Complete antibacterial cooling coil flush, gas check, and 30-day service warranty.
          </Text>

          <Pressable
            onPress={() => {
              setSelectedCategorySlug("ac");
              setActiveTab("services");
            }}
            style={styles.darkOfferBtn}
          >
            <Text style={styles.darkOfferBtnText}>Book now</Text>
            <Ionicons name="arrow-forward" size={14} color={colors.ink} />
          </Pressable>
        </View>
      </View>

      {/* 5. NammaPros Guarantee Card */}
      <View style={styles.guaranteeBox}>
        <Ionicons name="shield-checkmark" size={28} color={colors.primary} />
        <View style={{ flex: 1 }}>
          <Text style={styles.guaranteeTitle}>The NammaPros Pledge</Text>
          <Text style={styles.guaranteeSub}>
            Direct slot booking, upfront standardised pricing, police-verified technicians, and 30-day
            service warranty on every job.
          </Text>
        </View>
      </View>

      {/* 6. From Homes Near You (Customer Reviews) */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>From homes near you</Text>
        <Text style={styles.sectionSub}>Verified feedback from completed home visits</Text>

        <View style={styles.reviewGrid}>
          {[
            {
              id: "r1",
              name: "Priya S.",
              area: "Besant Nagar, Chennai",
              comment:
                "AC technician arrived right on time with all protective covers and high-pressure jet. Airflow and cooling are crystal clear now!",
              rating: 5,
            },
            {
              id: "r2",
              name: "Anand R.",
              area: "HSR Layout, Bengaluru",
              comment:
                "Washing machine spin issue solved in under 45 minutes. Upfront rate card shared before touching anything.",
              rating: 5,
            },
            {
              id: "r3",
              name: "Vignesh K.",
              area: "Anna Nagar, Chennai",
              comment:
                "Great experience with water tank cleaning. Full sludge removal and UV disinfectant rinse. Highly recommended!",
              rating: 5,
            },
          ].map((rev) => (
            <View key={rev.id} style={styles.reviewCard}>
              <View style={styles.reviewStarRow}>
                {Array.from({ length: rev.rating }).map((_, i) => (
                  <Ionicons key={i} name="star" size={12} color={colors.gold} />
                ))}
              </View>
              <Text style={styles.reviewQuote}>“{rev.comment}”</Text>
              <View style={styles.reviewAuthor}>
                <View style={styles.reviewAvatar}>
                  <Text style={styles.reviewAvatarText}>{rev.name[0]}</Text>
                </View>
                <View>
                  <Text style={styles.reviewName}>{rev.name}</Text>
                  <Text style={styles.reviewLocation}>{rev.area}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
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
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxxl,
    gap: spacing.lg,
  },
  heroSection: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: "#EAE3DC",
    padding: spacing.lg,
    overflow: "hidden",
  },
  heroTextContainer: {
    marginBottom: spacing.xs,
  },
  heroHeading: {
    fontSize: 26,
    fontWeight: "800",
    color: colors.ink,
    lineHeight: 32,
    letterSpacing: -0.5,
  },
  heroHeadingHighlight: {
    color: colors.primary,
  },
  heroTechniciansCard: {
    marginTop: spacing.md,
    backgroundColor: "#FBECEF",
    borderRadius: radii.lg,
    paddingTop: spacing.md,
    paddingHorizontal: spacing.sm,
    position: "relative",
    alignItems: "center",
    minHeight: 180,
    overflow: "hidden",
  },
  heroTechniciansImg: {
    width: "100%",
    height: 180,
  },
  trustFloatingPill: {
    position: "absolute",
    bottom: 10,
    left: 10,
    backgroundColor: "rgba(255, 255, 255, 0.96)",
    borderRadius: radii.md,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: "#EAE3DC",
    maxWidth: 220,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  trustBadgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  trustTitle: {
    fontSize: 11,
    fontWeight: "800",
    color: colors.ink,
  },
  trustSubtitle: {
    fontSize: 10,
    color: colors.muted,
    marginTop: 2,
    lineHeight: 13,
  },
  trustRatingPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.ink,
    alignSelf: "flex-start",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 3,
    marginTop: 4,
  },
  trustRatingText: {
    fontSize: 10,
    fontWeight: "800",
    color: colors.white,
  },
  trustReviewCount: {
    fontSize: 9,
    color: "#D6CEC6",
  },
  section: {
    gap: spacing.sm,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: "800",
    color: colors.ink,
    letterSpacing: -0.3,
  },
  sectionSub: {
    fontSize: 12,
    color: colors.muted,
    marginTop: -4,
    marginBottom: spacing.xs,
  },
  seeAllText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.primary,
  },
  spotlightScroll: {
    gap: spacing.md,
    paddingVertical: 4,
  },
  spotlightCard: {
    width: 280,
    aspectRatio: 788 / 442,
    borderRadius: radii.xl,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#EAE3DC",
    backgroundColor: colors.canvasWarm,
  },
  spotlightCardPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
  spotlightImage: {
    width: "100%",
    height: "100%",
  },
  mostBookedScroll: {
    gap: spacing.md,
    paddingVertical: 4,
  },
  darkOfferCard: {
    backgroundColor: "#27201C",
    borderRadius: radii.xl,
    overflow: "hidden",
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
  },
  darkOfferContent: {
    padding: spacing.xl,
    gap: spacing.xs,
  },
  darkOfferBadge: {
    fontSize: 11,
    fontWeight: "800",
    color: "#D8B46A",
    letterSpacing: 1.5,
  },
  darkOfferTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.white,
    lineHeight: 26,
    marginTop: 2,
  },
  darkOfferSub: {
    fontSize: 13,
    color: "#D6CEC6",
    lineHeight: 18,
    marginTop: 2,
  },
  darkOfferBtn: {
    backgroundColor: colors.white,
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 6,
    paddingHorizontal: spacing.xl,
    paddingVertical: 10,
    borderRadius: radii.md,
    marginTop: spacing.md,
  },
  darkOfferBtnText: {
    fontSize: 13,
    fontWeight: "800",
    color: colors.ink,
  },
  guaranteeBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primarySoft,
    padding: spacing.lg,
    borderRadius: radii.lg,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: "rgba(128, 0, 32, 0.12)",
  },
  guaranteeTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.primary,
  },
  guaranteeSub: {
    fontSize: 11,
    color: colors.inkSecondary,
    lineHeight: 16,
    marginTop: 2,
  },
  reviewGrid: {
    gap: spacing.md,
  },
  reviewCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: "#EAE3DC",
    gap: spacing.sm,
  },
  reviewStarRow: {
    flexDirection: "row",
    gap: 3,
  },
  reviewQuote: {
    fontSize: 13,
    color: colors.ink,
    lineHeight: 19,
    fontStyle: "italic",
  },
  reviewAuthor: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginTop: 4,
  },
  reviewAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  reviewAvatarText: {
    fontSize: 12,
    fontWeight: "800",
    color: colors.primary,
  },
  reviewName: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.ink,
  },
  reviewLocation: {
    fontSize: 10,
    color: colors.muted,
  },
});
