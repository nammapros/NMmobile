import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { HomeIconAssets } from "../assets";
import { SwipeBackContainer } from "./SwipeBackContainer";
import { useApp } from "../state/AppContext";
import { colors, radii, spacing } from "../theme";

interface CategorySubItem {
  slug: string;
  label: string;
  imageKey: string;
}

interface CategoryTileDef {
  key: string;
  label: string;
  imageKey: string;
  categorySlug?: string;
  subs?: CategorySubItem[];
}

const HOME_TILES: CategoryTileDef[] = [
  {
    key: "ac",
    label: "AC Service & Repair",
    imageKey: "ac",
    categorySlug: "ac",
  },
  {
    key: "appliances",
    label: "Appliance Services",
    imageKey: "appliance-services",
    subs: [
      { slug: "ac", label: "AC", imageKey: "ac" },
      { slug: "washing-machine", label: "Washing Machine", imageKey: "washing-machine" },
      { slug: "geyser", label: "Geyser", imageKey: "geyser" },
      { slug: "refrigerator", label: "Refrigerator", imageKey: "refrigerator" },
      { slug: "tv", label: "TV", imageKey: "tv" },
      { slug: "water-purifier", label: "Water Purifier", imageKey: "water-purifier" },
      { slug: "cctv", label: "CCTV", imageKey: "cctv" },
      { slug: "microwave-oven", label: "Microwave", imageKey: "microwave-oven" },
      { slug: "dishwasher", label: "Dishwasher", imageKey: "dishwasher" },
    ],
  },
  {
    key: "deep-cleaning",
    label: "Deep Cleaning",
    imageKey: "deep-cleaning",
    subs: [
      { slug: "cleaning", label: "Bathroom Cleaning", imageKey: "bathroom-cleaning" },
      { slug: "cleaning", label: "Kitchen Cleaning", imageKey: "kitchen-cleaning" },
      { slug: "cleaning", label: "Full House Cleaning", imageKey: "full-house-cleaning" },
    ],
  },
  {
    key: "electrician",
    label: "Electrician",
    imageKey: "electrician",
    categorySlug: "electrician",
  },
  {
    key: "plumber",
    label: "Plumber",
    imageKey: "plumber",
    categorySlug: "plumber",
  },
  {
    key: "carpenter",
    label: "Carpenter",
    imageKey: "carpenter",
    categorySlug: "carpenter",
  },
  {
    key: "water-tank",
    label: "Water Tank Cleaning",
    imageKey: "water-tank-cleaning",
    categorySlug: "water-tank-cleaning",
  },
  {
    key: "sofa",
    label: "Sofa Repair",
    imageKey: "sofa-repair",
    categorySlug: "sofa",
  },
  {
    key: "mosquito",
    label: "Mosquito Net",
    imageKey: "mosquito-net",
    categorySlug: "mosquito-net",
  },
];

export function CategoryGrid() {
  const { setActiveTab, setSelectedCategorySlug } = useApp();
  const [activeSheetTile, setActiveSheetTile] = useState<CategoryTileDef | null>(null);

  const handleTilePress = (tile: CategoryTileDef) => {
    if (tile.subs && tile.subs.length > 0) {
      setActiveSheetTile(tile);
      return;
    }
    if (tile.categorySlug) {
      setSelectedCategorySlug(tile.categorySlug);
      setActiveTab("services");
    }
  };

  const handleSubSelect = (slug: string) => {
    setActiveSheetTile(null);
    setSelectedCategorySlug(slug);
    setActiveTab("services");
  };

  return (
    <View style={styles.container}>
      {/* 3-Column Grid matching live site */}
      <View style={styles.grid}>
        {HOME_TILES.map((tile) => {
          const iconSource = HomeIconAssets[tile.imageKey];
          return (
            <Pressable
              key={tile.key}
              onPress={() => handleTilePress(tile)}
              style={({ pressed }) => [styles.tile, pressed && styles.tilePressed]}
              accessibilityRole="button"
              accessibilityLabel={tile.label}
            >
              <View style={styles.tileImageBox}>
                {iconSource ? (
                  <Image
                    source={iconSource}
                    style={styles.tileImage}
                    resizeMode="contain"
                    fadeDuration={0}
                  />
                ) : (
                  <Ionicons name="sparkles" size={28} color={colors.primary} />
                )}
              </View>
              <Text style={styles.tileLabel} numberOfLines={2}>
                {tile.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Sub-Service Modal Sheet matching live site SubSheet */}
      <Modal
        visible={activeSheetTile !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setActiveSheetTile(null)}
      >
        <View style={styles.modalOverlay}>
          <Pressable
            style={styles.modalBackdrop}
            onPress={() => setActiveSheetTile(null)}
          />
          <SwipeBackContainer
            onBack={() => setActiveSheetTile(null)}
            style={styles.modalSheet}
          >
            <View style={styles.sheetHandle} />

            {/* Sheet Title */}
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>{activeSheetTile?.label}</Text>
              <Pressable
                onPress={() => setActiveSheetTile(null)}
                style={styles.closeBtn}
                accessibilityRole="button"
                accessibilityLabel="Close"
              >
                <Ionicons name="close" size={20} color={colors.ink} />
              </Pressable>
            </View>

            {/* Sub-grid of items */}
            <ScrollView
              contentContainerStyle={styles.subGridContent}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.subGrid}>
                {activeSheetTile?.subs?.map((sub) => {
                  const subIconSource = HomeIconAssets[sub.imageKey];
                  return (
                    <Pressable
                      key={sub.label}
                      onPress={() => handleSubSelect(sub.slug)}
                      style={({ pressed }) => [
                        styles.subTile,
                        pressed && styles.subTilePressed,
                      ]}
                      accessibilityRole="button"
                      accessibilityLabel={sub.label}
                    >
                      <View style={styles.subTileImageBox}>
                        {subIconSource ? (
                          <Image
                            source={subIconSource}
                            style={styles.subTileImage}
                            resizeMode="contain"
                            fadeDuration={0}
                          />
                        ) : (
                          <Ionicons name="sparkles" size={24} color={colors.primary} />
                        )}
                      </View>
                      <Text style={styles.subTileLabel} numberOfLines={2}>
                        {sub.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </ScrollView>
          </SwipeBackContainer>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.sm,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: spacing.lg,
    paddingVertical: spacing.xs,
  },
  tile: {
    width: "31.5%",
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "flex-start",
    paddingVertical: spacing.xs,
    paddingHorizontal: 2,
    borderWidth: 0,
  },
  tilePressed: {
    opacity: 0.65,
    transform: [{ scale: 0.95 }],
  },
  tileImageBox: {
    width: 64,
    height: 64,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  tileImage: {
    width: 60,
    height: 60,
  },
  tileLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.ink,
    textAlign: "center",
    lineHeight: 16,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(28, 25, 23, 0.48)",
  },
  modalBackdrop: {
    flex: 1,
  },
  modalSheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
    maxHeight: "78%",
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    alignSelf: "center",
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  sheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.sm,
    marginBottom: spacing.xs,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.ink,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#F3EFEC",
    alignItems: "center",
    justifyContent: "center",
  },
  subGridContent: {
    paddingVertical: spacing.sm,
  },
  subGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: spacing.md,
  },
  subTile: {
    width: "31.5%",
    alignItems: "center",
    justifyContent: "flex-start",
    paddingVertical: spacing.xs,
  },
  subTilePressed: {
    opacity: 0.65,
    transform: [{ scale: 0.95 }],
  },
  subTileImageBox: {
    width: 60,
    height: 60,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
    backgroundColor: "transparent",
  },
  subTileImage: {
    width: 56,
    height: 56,
  },
  subTileLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.ink,
    textAlign: "center",
    lineHeight: 16,
  },
});
