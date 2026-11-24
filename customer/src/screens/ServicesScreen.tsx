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
import { CategoryCardAssets, ServiceBannerAssets } from "../assets";
import { formatInr, ServiceCard } from "../components/ServiceCard";
import { useApp } from "../state/AppContext";
import { colors, radii, spacing } from "../theme";
import type { Service } from "../types";

interface CategoryMeta {
  slug: string;
  label: string;
  image: any;
  subTitle: string;
}

const ALL_CATEGORIES: CategoryMeta[] = [
  {
    slug: "ac",
    label: "AC Service & Repair",
    image: ServiceBannerAssets.ac,
    subTitle: "Cooling, foam jet & repair",
  },
  {
    slug: "appliances",
    label: "Appliance Services",
    image: CategoryCardAssets.appliances,
    subTitle: "Washing machine, fridge, geyser",
  },
  {
    slug: "cleaning",
    label: "Deep Cleaning",
    image: CategoryCardAssets.cleaning,
    subTitle: "Bathroom, kitchen, full home",
  },
  {
    slug: "electrician",
    label: "Electrician",
    image: CategoryCardAssets.electrician,
    subTitle: "Wiring, switches, fuse & fan",
  },
  {
    slug: "plumber",
    label: "Plumber",
    image: CategoryCardAssets.plumber,
    subTitle: "Pipes, leakage, taps & drains",
  },
  {
    slug: "carpenter",
    label: "Carpenter",
    image: CategoryCardAssets.carpenter,
    subTitle: "Furniture, doors, locks & drilling",
  },
  {
    slug: "water-tank-cleaning",
    label: "Water Tank Cleaning",
    image: ServiceBannerAssets["water-tank-cleaning"],
    subTitle: "Sludge removal & UV sanitize",
  },
  {
    slug: "sofa",
    label: "Sofa Repair",
    image: ServiceBannerAssets.sofa,
    subTitle: "Upholstery, cushion & polish",
  },
  {
    slug: "mosquito-net",
    label: "Mosquito Net",
    image: ServiceBannerAssets["mosquito-net"],
    subTitle: "Windows, doors & balconies",
  },
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
    if (selectedCategorySlug) {
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
    <View style={styles.container}>
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
          MODE A: ALL CATEGORIES GRID (Screen 7 in Mockup)
          ======================================================== */}
      {!selectedCategorySlug && !debouncedQuery ? (
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
                style={styles.categoryCard}
                accessibilityRole="button"
                accessibilityLabel={cat.label}
              >
                <View style={styles.categoryCardImageWrapper}>
                  <Image
                    source={cat.image}
                    style={styles.categoryCardImg}
                    resizeMode="contain"
                  />
                </View>
                <Text style={styles.categoryCardTitle} numberOfLines={2}>
                  {cat.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>
      ) : (
        /* ========================================================
           MODE B: SERVICE LISTING (Screen 8 in Mockup)
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
              {/* Top Banner Image for Category */}
              {Boolean(currentCategory) && (
                <View style={styles.categoryHeroBanner}>
                  <Image
                    source={currentCategory?.image}
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
                  onPress={() => setSelectedCategorySlug(null)}
                  style={styles.chipPill}
                >
                  <Text style={styles.chipPillText}>All Categories</Text>
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
                <Ionicons name="construct-outline" size={40} color={colors.subtle} />
                <Text style={styles.emptyTitle}>No services found</Text>
                <Text style={styles.emptySub}>
                  Try selecting another category or clear your search query.
                </Text>
              </View>
            )
          }
        />
      )}
    </View>
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
    rowGap: spacing.md,
  },
  categoryCard: {
    width: "48%",
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: spacing.xs,
    alignItems: "center",
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  categoryCardImageWrapper: {
    width: "100%",
    height: 100,
    borderRadius: radii.md,
    overflow: "hidden",
    backgroundColor: colors.canvasWarm,
    marginBottom: 6,
  },
  categoryCardImg: {
    width: "100%",
    height: "100%",
  },
  categoryCardTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.ink,
    textAlign: "center",
    paddingBottom: 4,
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
});
