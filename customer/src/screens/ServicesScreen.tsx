import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { CategoryCardAssets, HomeIconAssets, ServiceBannerAssets } from "../assets";
import { formatInr, ServiceCard } from "../components/ServiceCard";
import { SwipeBackContainer } from "../components/SwipeBackContainer";
import { useApp } from "../state/AppContext";
import { colors, radii, spacing } from "../theme";
import type { Service } from "../types";

interface CategoryMeta {
  slug: string;
  label: string;
  icon: any;
  banner: any;
  subTitle: string;
}

const ALL_CATEGORIES: CategoryMeta[] = [
  {
    slug: "ac",
    label: "AC Service & Repair",
    icon: HomeIconAssets.ac,
    banner: ServiceBannerAssets.ac,
    subTitle: "Cooling, foam jet & repair",
  },
  {
    slug: "appliances",
    label: "Appliance Services",
    icon: HomeIconAssets["appliance-services"],
    banner: CategoryCardAssets.appliances,
    subTitle: "Washing machine, fridge, geyser",
  },
  {
    slug: "cleaning",
    label: "Deep Cleaning",
    icon: HomeIconAssets["deep-cleaning"],
    banner: CategoryCardAssets.cleaning,
    subTitle: "Bathroom, kitchen, full home",
  },
  {
    slug: "electrician",
    label: "Electrician",
    icon: HomeIconAssets.electrician,
    banner: CategoryCardAssets.electrician,
    subTitle: "Wiring, switches, fuse & fan",
  },
  {
    slug: "plumber",
    label: "Plumber",
    icon: HomeIconAssets.plumber,
    banner: CategoryCardAssets.plumber,
    subTitle: "Pipes, leakage, taps & drains",
  },
  {
    slug: "carpenter",
    label: "Carpenter",
    icon: HomeIconAssets.carpenter,
    banner: CategoryCardAssets.carpenter,
    subTitle: "Furniture, doors, locks & drilling",
  },
  {
    slug: "water-tank-cleaning",
    label: "Water Tank Cleaning",
    icon: HomeIconAssets["water-tank-cleaning"],
    banner: ServiceBannerAssets["water-tank-cleaning"],
    subTitle: "Sludge removal & UV sanitize",
  },
  {
    slug: "sofa",
    label: "Sofa Repair",
    icon: HomeIconAssets["sofa-repair"],
    banner: ServiceBannerAssets.sofa,
    subTitle: "Upholstery, cushion & polish",
  },
  {
    slug: "mosquito-net",
    label: "Mosquito Net",
    icon: HomeIconAssets["mosquito-net"],
    banner: ServiceBannerAssets["mosquito-net"],
    subTitle: "Windows, doors & balconies",
  },
];

const TRENDING_SEARCHES = [
  { label: "Foam Jet AC", query: "foam jet", icon: "snow-outline" },
  { label: "Water Tank Clean", query: "tank", icon: "water-outline" },
  { label: "Washing Machine", query: "washing machine", icon: "refresh-outline" },
  { label: "Switchboard & MCB", query: "electrician", icon: "flash-outline" },
  { label: "Tap & Pipe Leak", query: "plumber", icon: "construct-outline" },
  { label: "Sofa Deep Clean", query: "sofa", icon: "color-wand-outline" },
  { label: "Mosquito Net Fit", query: "mosquito", icon: "grid-outline" },
  { label: "Full House Clean", query: "cleaning", icon: "sparkles-outline" },
];

export function ServicesScreen() {
  const {
    catalog,
    loadingCatalog,
    selectedCategorySlug,
    setSelectedCategorySlug,
    searchQuery,
    setSearchQuery,
    setActiveTab,
    setDetailService,
  } = useApp();

  const [isSearchActive, setIsSearchActive] = useState(false);
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(searchQuery);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(localSearch);
    }, 120);
    return () => clearTimeout(handler);
  }, [localSearch]);

  useEffect(() => {
    setLocalSearch(searchQuery);
    setDebouncedQuery(searchQuery);
  }, [searchQuery]);

  const services = catalog?.services ?? [];

  // Active Category Meta
  const currentCategory = ALL_CATEGORIES.find(
    (c) => c.slug === selectedCategorySlug
  );

  // Filtered Services for the selected category
  const filteredServices = useMemo(() => {
    let list = services.filter((s) => s.is_active !== false);

    if (selectedCategorySlug && selectedCategorySlug !== "all") {
      list = list.filter((s) => {
        const cat = s.category?.toLowerCase() || "";
        const target = selectedCategorySlug.toLowerCase();
        return (
          cat === target ||
          cat.includes(target) ||
          s.slug?.toLowerCase().includes(target)
        );
      });
    }

    const query = debouncedQuery.trim().toLowerCase();
    if (query) {
      list = list.filter(
        (s) =>
          s.name?.toLowerCase().includes(query) ||
          s.summary?.toLowerCase().includes(query) ||
          s.description?.toLowerCase().includes(query) ||
          s.category_name?.toLowerCase().includes(query)
      );
    }

    return list;
  }, [services, selectedCategorySlug, debouncedQuery]);

  const handleSelectCategory = (catSlug: string) => {
    setSelectedCategorySlug(catSlug);
    setSearchQuery("");
    setLocalSearch("");
  };

  const handleBack = () => {
    if (isSearchActive || localSearch.length > 0) {
      setIsSearchActive(false);
      setLocalSearch("");
      setSearchQuery("");
    } else if (selectedCategorySlug) {
      setSelectedCategorySlug(null);
    } else {
      setActiveTab("home");
    }
  };

  const renderServiceItem = useCallback(
    ({ item }: { item: Service }) => <ServiceCard service={item} />,
    []
  );

  return (
    <SwipeBackContainer onBack={handleBack} style={styles.container}>
      {/* ========================================================
          SCREEN HEADER
          ======================================================== */}
      <View style={styles.header}>
        <Pressable
          onPress={handleBack}
          style={styles.headerBtn}
          accessibilityRole="button"
          accessibilityLabel="Back"
        >
          <Ionicons name="arrow-back" size={22} color={colors.ink} />
        </Pressable>

        <Text style={styles.headerTitle}>
          {selectedCategorySlug && currentCategory
            ? currentCategory.label
            : "All Services"}
        </Text>

        <Pressable
          onPress={() => setIsSearchActive((prev) => !prev)}
          style={styles.headerBtn}
          accessibilityRole="button"
          accessibilityLabel="Search"
        >
          <Ionicons
            name={isSearchActive ? "close" : "search"}
            size={20}
            color={colors.ink}
          />
        </Pressable>
      </View>

      {/* Expandable Search Input */}
      {Boolean(isSearchActive || localSearch.length > 0) && (
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={17} color={colors.muted} />
            <TextInput
              placeholder="Search services (e.g. Foam jet, inspection)…"
              placeholderTextColor={colors.subtle}
              value={localSearch}
              onChangeText={setLocalSearch}
              style={styles.searchInput}
              autoFocus
            />
            {Boolean(localSearch.length > 0) && (
              <Pressable
                onPress={() => {
                  setLocalSearch("");
                  setSearchQuery("");
                }}
              >
                <Ionicons name="close-circle" size={17} color={colors.muted} />
              </Pressable>
            )}
          </View>
        </View>
      )}

      {/* ========================================================
          MODE A: TRENDING SEARCHES & SUGGESTIONS (when search bar is focused)
          ======================================================== */}
      {Boolean(isSearchActive && !debouncedQuery) ? (
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.suggestionsScrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Trending Searches Section */}
          <View style={styles.suggestionsSection}>
            <View style={styles.suggestionSectionHeader}>
              <Ionicons name="flame" size={18} color={colors.primary} />
              <Text style={styles.suggestionSectionTitle}>Trending Searches</Text>
            </View>
            <View style={styles.trendingChipsWrap}>
              {TRENDING_SEARCHES.map((item, idx) => (
                <Pressable
                  key={idx}
                  onPress={() => {
                    setLocalSearch(item.query);
                    setSearchQuery(item.query);
                  }}
                  style={styles.trendingChip}
                  accessibilityRole="button"
                  accessibilityLabel={item.label}
                >
                  <Ionicons name={item.icon as any} size={14} color={colors.primary} />
                  <Text style={styles.trendingChipText}>{item.label}</Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Quick Categories Section */}
          <View style={styles.suggestionsSection}>
            <Text style={styles.suggestionSectionTitle}>Browse Popular Categories</Text>
            <View style={styles.suggestedCategoriesGrid}>
              {ALL_CATEGORIES.slice(0, 6).map((cat) => (
                <Pressable
                  key={cat.slug}
                  onPress={() => {
                    handleSelectCategory(cat.slug);
                    setIsSearchActive(false);
                  }}
                  style={styles.suggestedCategoryItem}
                  accessibilityRole="button"
                  accessibilityLabel={cat.label}
                >
                  <Image
                    source={cat.icon}
                    style={styles.suggestedCategoryImg}
                    resizeMode="contain"
                    fadeDuration={0}
                  />
                  <Text style={styles.suggestedCategoryText}>{cat.label}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        </ScrollView>
      ) : !selectedCategorySlug && !debouncedQuery ? (
        /* ========================================================
           MODE B: ALL CATEGORIES GRID (Screen 7 in Mockup)
           ======================================================== */
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.categoryGridContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.sectionHeading}>Browse by Category</Text>
          <View style={styles.categoryGrid}>
            {ALL_CATEGORIES.map((cat) => (
              <Pressable
                key={cat.slug}
                onPress={() => handleSelectCategory(cat.slug)}
                style={({ pressed }) => [
                  styles.categoryIconTile,
                  pressed && styles.categoryIconTilePressed,
                ]}
                accessibilityRole="button"
                accessibilityLabel={cat.label}
              >
                <View style={styles.categoryIconBox}>
                  <Image
                    source={cat.icon}
                    style={styles.categoryIconImg}
                    resizeMode="contain"
                    fadeDuration={0}
                  />
                </View>
                <Text style={styles.categoryIconTitle} numberOfLines={2}>
                  {cat.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>
      ) : (
        /* ========================================================
           MODE C: SERVICE LISTING (Screen 8 in Mockup)
           ======================================================== */
        <FlatList
          data={filteredServices}
          keyExtractor={(item) => item.id}
          renderItem={renderServiceItem}
          initialNumToRender={6}
          maxToRenderPerBatch={6}
          windowSize={5}
          removeClippedSubviews={Platform.OS === "android"}
          showsVerticalScrollIndicator={false}
          style={styles.content}
          contentContainerStyle={styles.serviceListContent}
          ListHeaderComponent={
            <View>
              {/* Search Active Summary Bar */}
              {Boolean(debouncedQuery) && (
                <View style={styles.searchSummaryBar}>
                  <Text style={styles.searchSummaryText}>
                    Found {filteredServices.length} {filteredServices.length === 1 ? "service" : "services"} for "{debouncedQuery}"
                  </Text>
                  <Pressable
                    onPress={() => {
                      setLocalSearch("");
                      setSearchQuery("");
                      setIsSearchActive(false);
                    }}
                  >
                    <Text style={styles.searchClearBtnText}>Clear</Text>
                  </Pressable>
                </View>
              )}

              {/* Top Banner Image for Category (if not in search query mode) */}
              {Boolean(currentCategory && !debouncedQuery) && (
                <View style={styles.categoryHeroBanner}>
                  <Image
                    source={currentCategory?.banner}
                    style={styles.categoryHeroImg}
                    resizeMode="cover"
                    fadeDuration={0}
                  />
                  <View style={styles.bannerOverlay}>
                    <Text style={styles.bannerOverlayTitle}>
                      {currentCategory?.label}
                    </Text>
                    <Text style={styles.bannerOverlaySub}>
                      {currentCategory?.subTitle}
                    </Text>
                  </View>
                </View>
              )}

              {/* Quick Sub-category Pill Chips */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.chipsScroll}
              >
                <Pressable
                  onPress={() => {
                    setSelectedCategorySlug(null);
                    setSearchQuery("");
                    setLocalSearch("");
                  }}
                  style={[
                    styles.chipPill,
                    !selectedCategorySlug && styles.chipPillActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.chipPillText,
                      !selectedCategorySlug && styles.chipPillTextActive,
                    ]}
                  >
                    All Categories
                  </Text>
                </Pressable>
                {ALL_CATEGORIES.map((c) => {
                  const isSelected = selectedCategorySlug === c.slug;
                  return (
                    <Pressable
                      key={c.slug}
                      onPress={() => handleSelectCategory(c.slug)}
                      style={[styles.chipPill, isSelected && styles.chipPillActive]}
                    >
                      <Text
                        style={[
                          styles.chipPillText,
                          isSelected && styles.chipPillTextActive,
                        ]}
                      >
                        {c.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>

              <Text style={styles.servicesCount}>
                {filteredServices.length} services available
              </Text>
            </View>
          }
          ListEmptyComponent={
            loadingCatalog && filteredServices.length === 0 ? (
              <ActivityIndicator
                size="large"
                color={colors.primary}
                style={{ marginVertical: 32 }}
              />
            ) : (
              <View style={styles.emptyBox}>
                <Ionicons name="search-outline" size={40} color={colors.subtle} />
                <Text style={styles.emptyTitle}>
                  {debouncedQuery
                    ? `No services found for "${debouncedQuery}"`
                    : "No services found"}
                </Text>
                <Text style={styles.emptySub}>
                  Try checking the spelling or browse these popular suggestions:
                </Text>
                <View style={styles.emptySuggestionsWrap}>
                  {TRENDING_SEARCHES.slice(0, 4).map((s, idx) => (
                    <Pressable
                      key={idx}
                      onPress={() => {
                        setLocalSearch(s.query);
                        setSearchQuery(s.query);
                      }}
                      style={styles.emptySuggestionChip}
                    >
                      <Text style={styles.emptySuggestionText}>{s.label}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            )
          }
        />
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    height: 52,
  },
  headerBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.ink,
  },
  searchContainer: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.canvasWarm,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    height: 40,
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: colors.ink,
  },
  content: {
    flex: 1,
  },

  // Screen 7: All Categories 2-Column Grid
  categoryGridContent: {
    padding: spacing.lg,
    paddingBottom: 90,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.ink,
    marginBottom: spacing.md,
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: spacing.xl,
    paddingTop: spacing.xs,
  },
  categoryIconTile: {
    width: "31.5%",
    alignItems: "center",
    justifyContent: "flex-start",
    backgroundColor: "transparent",
    borderWidth: 0,
    paddingVertical: spacing.xs,
    paddingHorizontal: 2,
  },
  categoryIconTilePressed: {
    opacity: 0.65,
    transform: [{ scale: 0.95 }],
  },
  categoryIconBox: {
    width: 64,
    height: 64,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
    backgroundColor: "transparent",
  },
  categoryIconImg: {
    width: 60,
    height: 60,
  },
  categoryIconTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.ink,
    textAlign: "center",
    lineHeight: 16,
  },

  // Screen 8: Category Hero & Service Listing
  serviceListContent: {
    paddingBottom: 90,
  },
  categoryHeroBanner: {
    width: "100%",
    height: 140,
    position: "relative",
    backgroundColor: colors.primaryDark,
  },
  categoryHeroImg: {
    width: "100%",
    height: "100%",
    opacity: 0.85,
  },
  bannerOverlay: {
    position: "absolute",
    bottom: spacing.md,
    left: spacing.lg,
    right: spacing.lg,
  },
  bannerOverlayTitle: {
    color: colors.white,
    fontSize: 20,
    fontWeight: "800",
    textShadowColor: "rgba(0,0,0,0.6)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  bannerOverlaySub: {
    color: colors.primaryLight,
    fontSize: 12,
    fontWeight: "500",
    marginTop: 2,
  },
  chipsScroll: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  chipPill: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radii.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipPillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipPillText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.ink,
  },
  chipPillTextActive: {
    color: colors.white,
  },
  servicesSection: {
    paddingHorizontal: spacing.lg,
  },
  servicesCount: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.muted,
    marginBottom: spacing.md,
  },
  emptyBox: {
    alignItems: "center",
    paddingVertical: 40,
    gap: spacing.sm,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.ink,
  },
  emptySub: {
    fontSize: 13,
    color: colors.muted,
    textAlign: "center",
    maxWidth: 240,
  },

  // Search Suggestions & Trending Styles
  suggestionsScrollContent: {
    padding: spacing.lg,
    paddingBottom: 60,
    gap: spacing.xl,
  },
  suggestionsSection: {
    gap: spacing.md,
  },
  suggestionSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  suggestionSectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.ink,
  },
  trendingChipsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  trendingChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.borderLight,
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  trendingChipText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.ink,
  },
  suggestedCategoriesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
  },
  suggestedCategoryItem: {
    width: "30%",
    backgroundColor: "transparent",
    padding: spacing.xs,
    alignItems: "center",
    borderWidth: 0,
    gap: 4,
  },
  suggestedCategoryImg: {
    width: 48,
    height: 48,
  },
  suggestedCategoryText: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.ink,
    textAlign: "center",
  },
  searchSummaryBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: "#FDF7F8",
    borderBottomWidth: 1,
    borderBottomColor: "#F5E6EA",
  },
  searchSummaryText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.primary,
    flex: 1,
  },
  searchClearBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.muted,
  },
  emptySuggestionsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: spacing.sm,
    marginTop: spacing.md,
    paddingHorizontal: spacing.md,
  },
  emptySuggestionChip: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radii.pill,
  },
  emptySuggestionText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.primary,
  },
});
