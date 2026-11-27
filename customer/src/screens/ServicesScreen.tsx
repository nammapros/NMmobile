import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
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

export type GroupKey = "service" | "repair" | "install";

export interface ServiceGroup {
  key: GroupKey;
  label: string;
  services: Service[];
}

export function groupKeyOf(service: Service): GroupKey {
  const text = `${service.name} ${service.slug}`.toLowerCase();
  if (/(uninstall|install|mount|fitting|setup)/.test(text)) return "install";
  if (/(repair|gas|refill|inspection|check|diagnos|fix|leak)/.test(text)) return "repair";
  return "service";
}

export function groupServices(
  categorySlug: string | null | undefined,
  services: Service[]
): ServiceGroup[] {
  const slug = (categorySlug || "").toLowerCase();
  const isAc = ["ac", "air-conditioning"].includes(slug);
  const labels: Record<GroupKey, string> = {
    service: "Service",
    repair: isAc ? "Repair & gas refill" : "Repair & Fix",
    install: "Installation & uninstallation",
  };
  return (["service", "repair", "install"] as GroupKey[])
    .map((key) => ({
      key,
      label: labels[key],
      services: services.filter((s) => groupKeyOf(s) === key),
    }))
    .filter((g) => g.services.length > 0);
}

function matchesCategory(s: Service, targetSlug: string): boolean {
  const target = targetSlug.toLowerCase().trim();
  const cat = (s.category || "").toLowerCase().trim();
  const slug = (s.slug || "").toLowerCase().trim();
  if (target === "all") return true;

  if (target === "ac" || target === "air-conditioning") {
    return (
      cat === "ac" ||
      cat === "air-conditioning" ||
      slug === "ac" ||
      slug.startsWith("ac-") ||
      slug.includes("-ac-") ||
      slug.endsWith("-ac") ||
      slug.includes("foam-jet") ||
      slug.includes("general-ac")
    );
  }

  if (target === "appliances" || target === "appliance-services") {
    return [
      "washing-machine",
      "refrigerator",
      "tv",
      "geyser",
      "microwave-oven",
      "dishwasher",
      "chimney",
      "water-purifier",
    ].some((c) => cat === c || slug.startsWith(c));
  }

  if (target === "cleaning" || target === "deep-cleaning") {
    return [
      "full-house-cleaning",
      "kitchen-cleaning",
      "bathroom-cleaning",
      "cleaning",
    ].some((c) => cat === c || slug.startsWith(c));
  }

  return (
    cat === target ||
    cat.replace(/-/g, "") === target.replace(/-/g, "") ||
    slug === target ||
    slug.startsWith(`${target}-`) ||
    slug.includes(`-${target}-`) ||
    slug.endsWith(`-${target}`)
  );
}

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

  const scrollRef = useRef<any>(null);
  const groupPositions = useRef<Record<string, number>>({});
  const [activeGroupKey, setActiveGroupKey] = useState<string>("service");

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
      list = list.filter((s) => matchesCategory(s, selectedCategorySlug));
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

  // Grouped Services (Service, Repair & gas refill, Installation & uninstallation)
  const groups = useMemo(() => {
    return groupServices(selectedCategorySlug, filteredServices);
  }, [selectedCategorySlug, filteredServices]);

  // Reset scroll & positions on category switch
  useEffect(() => {
    groupPositions.current = {};
    if (groups.length > 0) {
      setActiveGroupKey(groups[0].key);
    }
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  }, [selectedCategorySlug]);

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

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const scrollY = e.nativeEvent.contentOffset.y;
    for (let i = groups.length - 1; i >= 0; i--) {
      const g = groups[i];
      const pos = groupPositions.current[g.key];
      if (pos != null && scrollY >= pos - 80) {
        if (activeGroupKey !== g.key) {
          setActiveGroupKey(g.key);
        }
        break;
      }
    }
  };

  const handleScrollToGroup = (key: GroupKey) => {
    setActiveGroupKey(key);
    const targetY = groupPositions.current[key];
    if (targetY != null && scrollRef.current) {
      scrollRef.current.scrollTo({
        y: Math.max(0, targetY - 54),
        animated: true,
      });
    }
  };

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
      ) : Boolean(debouncedQuery) ? (
        /* ========================================================
           MODE SEARCH RESULTS: Flat matching results with spacing
           ======================================================== */
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={styles.content}
          contentContainerStyle={styles.serviceListContent}
        >
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

          {filteredServices.length === 0 ? (
            <View style={styles.emptyBox}>
              <Ionicons name="search-outline" size={40} color={colors.subtle} />
              <Text style={styles.emptyTitle}>
                No services found for "{debouncedQuery}"
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
          ) : (
            <View style={{ paddingTop: spacing.sm }}>
              {filteredServices.map((s) => (
                <ServiceCard key={s.id} service={s} />
              ))}
            </View>
          )}
        </ScrollView>
      ) : !selectedCategorySlug ? (
        /* ========================================================
           MODE B: ALL CATEGORIES GRID
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
           MODE C: CATEGORY DETAIL WITH 3 STICKY TABS & SCROLL-TO
           ======================================================== */
        <ScrollView
          ref={scrollRef}
          stickyHeaderIndices={groups.length > 1 ? [1] : undefined}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
          style={styles.content}
          contentContainerStyle={styles.serviceListContent}
        >
          {/* Index 0: Hero Banner + Quick Category Switcher */}
          <View style={styles.categoryHeroWrapper}>
            {Boolean(currentCategory) && (
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

            {/* Quick Horizontal Main Categories Switcher */}
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
          </View>

          {/* Index 1: Sticky 3 Sub-category Group Tabs (Service / Repair / Installation) */}
          {groups.length > 1 ? (
            <View style={styles.stickyTabsBar}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.groupTabsScroll}
              >
                {groups.map((g) => {
                  const isActive = activeGroupKey === g.key;
                  return (
                    <Pressable
                      key={g.key}
                      onPress={() => handleScrollToGroup(g.key)}
                      style={[
                        styles.groupTabPill,
                        isActive && styles.groupTabPillActive,
                      ]}
                      accessibilityRole="button"
                      accessibilityLabel={`${g.label}, ${g.services.length} services`}
                    >
                      <Text
                        style={[
                          styles.groupTabText,
                          isActive && styles.groupTabTextActive,
                        ]}
                      >
                        {g.label}
                      </Text>
                      <View
                        style={[
                          styles.groupTabCount,
                          isActive && styles.groupTabCountActive,
                        ]}
                      >
                        <Text
                          style={[
                            styles.groupTabCountNum,
                            isActive && styles.groupTabCountNumActive,
                          ]}
                        >
                          {g.services.length}
                        </Text>
                      </View>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>
          ) : (
            <View style={styles.emptyPlaceholder} />
          )}

          {/* Index 2..N: Service Groups */}
          {groups.length === 0 ? (
            loadingCatalog ? (
              <ActivityIndicator
                size="large"
                color={colors.primary}
                style={{ marginVertical: 32 }}
              />
            ) : (
              <View style={styles.emptyBox}>
                <Ionicons name="search-outline" size={40} color={colors.subtle} />
                <Text style={styles.emptyTitle}>No services available</Text>
                <Text style={styles.emptySub}>
                  Check out other categories or contact our support team.
                </Text>
              </View>
            )
          ) : (
            groups.map((group) => (
              <View
                key={group.key}
                onLayout={(e) => {
                  groupPositions.current[group.key] = e.nativeEvent.layout.y;
                }}
                style={styles.groupSection}
              >
                {/* Group Section Header */}
                <View style={styles.groupHeaderRow}>
                  <Text style={styles.groupHeaderTitle}>{group.label}</Text>
                  <View style={styles.groupCountBadge}>
                    <Text style={styles.groupCountText}>
                      {group.services.length} {group.services.length === 1 ? "service" : "services"}
                    </Text>
                  </View>
                </View>

                {/* Services in this Group with generous spacing */}
                <View style={styles.servicesListWrap}>
                  {group.services.map((service) => (
                    <ServiceCard key={service.id} service={service} />
                  ))}
                </View>
              </View>
            ))
          )}
        </ScrollView>
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

  // Category Grid
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

  // Category Hero
  serviceListContent: {
    paddingBottom: 160,
  },
  categoryHeroWrapper: {
    backgroundColor: colors.canvas,
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
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
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

  // Sticky 3 Category Group Tabs
  stickyTabsBar: {
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: "#EAE3DC",
    paddingVertical: 10,
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 3,
  },
  groupTabsScroll: {
    paddingHorizontal: spacing.md,
    gap: 8,
  },
  groupTabPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: radii.pill,
    backgroundColor: "#F5F2EF",
    borderWidth: 1,
    borderColor: "#E5DDD5",
  },
  groupTabPillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  groupTabText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.ink,
  },
  groupTabTextActive: {
    color: colors.white,
    fontWeight: "800",
  },
  groupTabCount: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    backgroundColor: "#E7DFD7",
  },
  groupTabCountActive: {
    backgroundColor: "rgba(255, 255, 255, 0.25)",
  },
  groupTabCountNum: {
    fontSize: 11,
    fontWeight: "700",
    color: "#6A5D54",
  },
  groupTabCountNumActive: {
    color: colors.white,
  },
  emptyPlaceholder: {
    height: 0,
  },

  // Grouped Service Sections
  groupSection: {
    marginBottom: spacing.xl,
    paddingTop: spacing.md,
  },
  groupHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
    marginBottom: spacing.xs,
  },
  groupHeaderTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.ink,
    letterSpacing: -0.2,
  },
  groupCountBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: radii.pill,
    backgroundColor: "#F3EDE8",
  },
  groupCountText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#78716C",
  },
  servicesListWrap: {
    gap: 2,
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
