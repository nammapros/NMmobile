import { Ionicons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { ServiceCard } from "../components/ServiceCard";
import { useApp } from "../state/AppContext";
import { colors, radii, spacing } from "../theme";
import type { Service } from "../types";

const CATEGORY_TABS = [
  { slug: "all", label: "All Services" },
  { slug: "ac", label: "AC Service" },
  { slug: "washing-machine", label: "Washing Machine" },
  { slug: "refrigerator", label: "Refrigerator" },
  { slug: "tv", label: "TV Repair" },
  { slug: "geyser", label: "Geyser" },
  { slug: "water-purifier", label: "Water Purifier" },
  { slug: "water-tank-cleaning", label: "Tank Cleaning" },
  { slug: "cleaning", label: "Deep Cleaning" },
  { slug: "mosquito-net", label: "Mosquito Net" },
  { slug: "sofa", label: "Sofa Care" },
  { slug: "cctv", label: "CCTV" },
];

export function ServicesScreen() {
  const {
    catalog,
    loadingCatalog,
    selectedCategorySlug,
    setSelectedCategorySlug,
    searchQuery,
    setSearchQuery,
  } = useApp();

  const services = catalog?.services ?? [];

  const filteredServices = useMemo(() => {
    let list = services.filter((s) => s.is_active !== false);

    // Filter by Category
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

    // Filter by Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (s) =>
          s.name?.toLowerCase().includes(q) ||
          s.summary?.toLowerCase().includes(q) ||
          s.description?.toLowerCase().includes(q) ||
          s.category_name?.toLowerCase().includes(q)
      );
    }

    return list;
  }, [services, selectedCategorySlug, searchQuery]);

  const activeSlug = selectedCategorySlug || "all";

  return (
    <View style={styles.container}>
      {/* 1. Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color={colors.muted} />
          <TextInput
            placeholder="Search AC, Washing Machine, Geyser, Cleaning…"
            placeholderTextColor={colors.subtle}
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchInput}
            clearButtonMode="while-editing"
          />
          {Boolean(searchQuery.length > 0) && (
            <Pressable onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={18} color={colors.muted} />
            </Pressable>
          )}
        </View>
      </View>

      {/* 2. Category Filter Pills */}
      <View style={styles.categoriesWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScroll}
        >
          {CATEGORY_TABS.map((tab) => {
            const isSelected = activeSlug === tab.slug;
            return (
              <Pressable
                key={tab.slug}
                onPress={() => setSelectedCategorySlug(tab.slug === "all" ? null : tab.slug)}
                style={[styles.catPill, isSelected && styles.catPillSelected]}
                accessibilityRole="button"
                accessibilityLabel={tab.label}
              >
                <Text
                  style={[styles.catPillText, isSelected && styles.catPillTextSelected]}
                >
                  {tab.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* 3. Results Header */}
      <View style={styles.resultsHeader}>
        <Text style={styles.resultsCount}>
          {filteredServices.length} {filteredServices.length === 1 ? "service" : "services"} available
        </Text>
        {Boolean(selectedCategorySlug || searchQuery) && (
          <Pressable
            onPress={() => {
              setSelectedCategorySlug(null);
              setSearchQuery("");
            }}
          >
            <Text style={styles.clearFilterText}>Reset Filter</Text>
          </Pressable>
        )}
      </View>

      {/* 4. Services List */}
      {Boolean(loadingCatalog && filteredServices.length === 0) ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Fetching available services…</Text>
        </View>
      ) : filteredServices.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="search-outline" size={48} color={colors.subtle} />
          <Text style={styles.emptyTitle}>No matching services found</Text>
          <Text style={styles.emptySub}>
            Try searching for something else or reset your filter.
          </Text>
          <Pressable
            onPress={() => {
              setSelectedCategorySlug(null);
              setSearchQuery("");
            }}
            style={styles.emptyResetBtn}
          >
            <Text style={styles.emptyResetBtnText}>Show All Services</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={filteredServices}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ServiceCard service={item} />}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
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
  searchContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    backgroundColor: colors.surface,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.canvasWarm,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    height: 44,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: colors.ink,
  },
  categoriesWrapper: {
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: spacing.sm,
  },
  categoryScroll: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  catPill: {
    paddingHorizontal: spacing.md,
    paddingVertical: 7,
    borderRadius: radii.pill,
    backgroundColor: colors.canvasWarm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  catPillSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  catPillText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.inkSecondary,
  },
  catPillTextSelected: {
    color: colors.white,
    fontWeight: "700",
  },
  resultsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  resultsCount: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.muted,
  },
  clearFilterText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.primary,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },
  loadingText: {
    fontSize: 13,
    color: colors.muted,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.xxl,
    gap: spacing.xs,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.ink,
    marginTop: spacing.sm,
  },
  emptySub: {
    fontSize: 12,
    color: colors.muted,
    textAlign: "center",
    marginBottom: spacing.md,
  },
  emptyResetBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: 10,
    borderRadius: radii.md,
  },
  emptyResetBtnText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: "700",
  },
});
